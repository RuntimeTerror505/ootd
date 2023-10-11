const REVIEW_INPUT = document.getElementById("review");
const REVIEW_BTN_SHOWN = document.querySelectorAll(".reviewButtonShown");
const videoPlayer = document.getElementById("video-player");
const videoSource = document.getElementById("video-source");
const LOOK_NAME = document.getElementById("lookName");
const POST_NUMBER = document.getElementById("postNumber");
const REVIEW_CONTAINER = document.getElementById("reviewContainer");
const sections = document.querySelectorAll(".feed-element");
const F_FEED_CONTAINER = document.querySelector(".video-container");

let FEED_SWIPER;
const LIMIT = 10;
initSwiper();

function initSwiper() {
  FEED_SWIPER = new Swiper(".videos-swiper-container", {
    direction: "vertical",
    resistanceRatio: 0,
  });

  addLoadingVideos();

  checkAndUpdateUser().then((user) => {
    F_FEED_CONTAINER.children[0].remove();
    getFeedVideos(user._id, LIMIT).then((videos) => {
      if (videos.length === 0) {
        const div = document.createElement("div");
        div.classList.add("swiper-slide", "feed-video");
        const p = document.createElement("p");
        p.textContent = "Nothing new";
        div.appendChild(p);
        F_FEED_CONTAINER.appendChild(div);
      } else {
        addVideosToFeed(videos);

        // const firstVideoSlide = FEED_SWIPER.slides[0];
        // if (firstVideoSlide) {
        //   const firstVideoId = firstVideoSlide.querySelector("video").getAttribute("id");
        //   if (firstVideoId) {
        //     watchVideo(user._id, firstVideoId);
        //   }
        // }
      }
    });
  });

  FEED_SWIPER.on("slideChange", () => {
    if (Number(FEED_SWIPER.slides.length) - FEED_SWIPER.realIndex - 2 < 6) {
      getFeedVideos(userId, LIMIT).then((videos) => {
        if (videos.length > 0) {
          F_FEED_CONTAINER.children[F_FEED_CONTAINER.children.length - 1].remove();
          addVideosToFeed(videos);
        }
      });
    }
    FEED_SWIPER.slides[FEED_SWIPER.realIndex].querySelector(".feedContent").classList.add("makeVisible");
    // const activeSlide = FEED_SWIPER.slides[FEED_SWIPER.realIndex];
    // const activeVideo = activeSlide.querySelector("video");
    // if (activeVideo) {
    //   const videoId = activeSlide.querySelector("video").getAttribute("id");
    //   if (videoId) {
    //     watchVideo(userId, videoId);
    //   }
    // }
  });
}

function addVideosToFeed(array) {
  array.forEach((elem) => {
    const { video, look, posts } = elem;
    const { cid } = video;
    const { name } = look;
    const VIDEO = document.createElement("div");
    VIDEO.classList.add("swiper-slide", "feed-video");
    F_FEED_CONTAINER.appendChild(VIDEO);

    const videoWrapper = document.createElement("div");
    videoWrapper.classList.add("feed-background");
    VIDEO.appendChild(videoWrapper);

    videoWrapper.innerHTML = ` <video id="${video._id}" preload="metadata" playsinline loop autoplay muted>
    <source src="${BASE_URL_LINK}/videos/video-1696970442343-595107045.mp4" type="video/mp4">
  </video>`;

    const content = document.createElement("div");
    content.classList.add("feedContent");
    VIDEO.appendChild(content);

    const lookName = document.createElement("p");
    lookName.classList.add("lookName");
    lookName.textContent = `"` + name + `"`;
    content.appendChild(lookName);

    const postsEl = document.createElement("div");
    postsEl.classList.add("feedPosts");
    content.appendChild(postsEl);

    const postsP = document.createElement("p");
    postsP.classList.add("posts");
    postsEl.appendChild(postsP);

    const span = document.createElement("span");
    span.classList.add("postNumber");
    postsP.appendChild(span);
    span.innerText = posts;

    postsP.innerHTML += " Posts -";

    const follow = document.createElement("button");
    follow.classList.add("followButton");
    follow.textContent = "Follow Look";
    postsEl.appendChild(follow);

    follow.addEventListener("click", () => {
      followLook(userId, look._id).then(() => {
        alert("Look Followed");
      });
    });

    const share = document.createElement("button");
    share.classList.add("shareButton");
    share.textContent = "Download";
    content.appendChild(share);

    const rateContainer = document.createElement("div");
    rateContainer.classList.add("rateContainer");
    content.appendChild(rateContainer);

    const rateOne = document.createElement("div");
    rateOne.textContent = "1";
    rateOne.classList.add("rateButton");
    rateContainer.appendChild(rateOne);

    rateOne.addEventListener("click", () => {
      rateVideo(userId, video._id, 1).then(() => {
        FEED_SWIPER.slideNext();
      });
    });

    const rateRange = document.createElement("input");
    rateRange.type = "range";
    rateRange.classList.add("rate");
    rateRange.min = 1.1;
    rateRange.max = 9.9;
    rateRange.step = 0.1;
    rateContainer.appendChild(rateRange);

    rateRange.addEventListener("change", (event) => {
      rateVideo(userId, video._id, Number(event.target.value)).then(() => {
        FEED_SWIPER.slideNext();
      });
    });

    const rateTen = document.createElement("div");
    rateTen.textContent = "10";
    rateTen.classList.add("rateButton");
    rateContainer.appendChild(rateTen);

    rateTen.addEventListener("click", () => {
      rateVideo(userId, video._id, 10).then(() => {
        FEED_SWIPER.slideNext();
      });
    });
  });

  const div = document.createElement("div");
  div.classList.add("swiper-slide", "feed-video");
  const p = document.createElement("p");
  p.textContent = "No More Videos";
  div.appendChild(p);
  F_FEED_CONTAINER.appendChild(div);

  FEED_SWIPER.update();
}

function addLoadingVideos() {
  const div = document.createElement("div");
  div.classList.add("swiper-slide", "feed-video");
  const p = document.createElement("p");
  p.textContent = "Loading videos...";
  div.appendChild(p);
  F_FEED_CONTAINER.appendChild(div);
}
