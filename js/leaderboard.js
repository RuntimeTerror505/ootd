const L_DATE = document.getElementById("date");
const L_LEADERBOARD_PARENT = document.getElementById("lb-container");
const L_LOOK_FILTER = document.getElementById("look-filter");
const L_LEADERBOARD = document.querySelector(".leaderboard");
const L_LOOK_LEADERBOARD = document.querySelector(".look-leaderboard");
const L_LOOK_NAME = document.getElementById("look-name");
const L_LOOK_CONTAINER = document.getElementById("look-container");
const L_BUTTONS = document.querySelector(".lb-buttons");
const L_DELETE = L_BUTTONS.children[1];
const L_DOWNLOAD = L_BUTTONS.children[0];
const L_REPORT = L_BUTTONS.children[2];
const L_LB = document.querySelector(".lb");
const L_FULL_SCREEN = document.getElementById("full-screen");
let currentLeaderboard = "all looks";
let leaderboardLookId = "";
let currentState;
L_DATE.innerText = getCurrentMonthAndDay();

var xDown = null;
var yDown = null;

getGlobalLeaderboard().then((leaderboard) => {
  renderLeaderboard(leaderboard);
});

L_LOOK_FILTER.addEventListener("click", changeLeaderboard);

L_DOWNLOAD.addEventListener("click", showDownloadOption);
L_DELETE.addEventListener("click", showDeleteOption);
L_REPORT.addEventListener("click", showReportOption);
L_LB.addEventListener("click", toggleButtons);

function toggleButtons() {
  if (L_BUTTONS.isVisible) {
    L_BUTTONS.style.display = "none";
    L_LEADERBOARD_PARENT.style.marginTop = "50px";
  } else {
    L_BUTTONS.style.display = "flex";
    L_LEADERBOARD_PARENT.style.marginTop = "100px";
  }
  L_BUTTONS.isVisible = !L_BUTTONS.isVisible;
}
function getCurrentMonthAndDay() {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const now = new Date();
  const currentMonth = months[now.getMonth()];
  const currentDay = now.getDate();

  return `${currentMonth} ${currentDay}`;
}
function changeLeaderboard() {
  currentState = "";
  L_DELETE.style.display = "none";
  L_BUTTONS.style.display = "none";
  L_LEADERBOARD_PARENT.style.marginTop = "60px";
  L_BUTTONS.isVisible = false;

  switch (currentLeaderboard) {
    case "all looks":
      L_LEADERBOARD_PARENT.innerHTML = "Loading...";
      currentLeaderboard = "new looks";
      L_LOOK_FILTER.textContent = "New Looks";
      getNewLooks().then((leaderboard) => {
        if (currentLeaderboard === "new looks") {
          renderLeaderboard(leaderboard);
        }
      });
      break;
    case "new looks":
      L_LEADERBOARD_PARENT.innerHTML = "Loading...";
      currentLeaderboard = "my looks";
      L_LOOK_FILTER.textContent = "my looks";
      L_DELETE.style.display = "block";
      getMyLooks(userId).then((leaderboard) => {
        if (currentLeaderboard === "my looks") {
          renderLeaderboard(leaderboard);
        }
      });
      break;
    case "my looks":
      L_LEADERBOARD_PARENT.innerHTML = "Loading...";
      currentLeaderboard = "all looks";
      L_LOOK_FILTER.textContent = "all looks";
      getGlobalLeaderboard().then((leaderboard) => {
        if (currentLeaderboard === "all looks") {
          renderLeaderboard(leaderboard);
        }
      });
      break;
    case "back":
      L_DATE.innerText = getCurrentMonthAndDay();
      L_LEADERBOARD_PARENT.innerHTML = "Loading...";
      currentLeaderboard = "all looks";
      L_LOOK_FILTER.textContent = "all looks";
      getGlobalLeaderboard().then((leaderboard) => {
        if (currentLeaderboard === "all looks") {
          renderLeaderboard(leaderboard);
        }
      });
      break;
    default:
      break;
  }
}
function renderLeaderboard(array) {
  L_LEADERBOARD_PARENT.innerHTML = "";

  array.forEach((item, index) => {
    const parent = document.createElement("div");
    parent.classList.add("lb-item");
    L_LEADERBOARD_PARENT.appendChild(parent);

    const video_wrapper = document.createElement("div");
    video_wrapper.classList.add("lb-video");
    parent.appendChild(video_wrapper);

    video_wrapper.innerHTML = ` <video id="${item.video._id}" playsinline loop autoplay muted>
        <source src="${STORAGE_LINK + item.video.cid}" type="video/mp4">
      </video>`;

    let action = document.createElement("a");
    action.classList.add("lb-action");
    action.videoURL = STORAGE_LINK + item.video.cid;
    action.look = item.look.name;
    action.lookId = item.look._id;
    action.videoId = item.video._id;

    let overlay = document.createElement("div");
    let lineOne = document.createElement("p");
    let lineTwo = document.createElement("p");
    overlay.classList.add("overlay");
    overlay.append(lineOne, lineTwo);
    parent.appendChild(overlay);
    overlay.classList.add("makeVisible2");

    switch (currentLeaderboard) {
      case "all looks":
        lineOne.innerText = `#${index + 1} ON OOTD`;
        lineTwo.innerText = `"${item.look.name}"`;
        break;
      case "new looks":
        lineOne.innerText = `"${item.look.name}"`;
        overlay.style.bottom = "8px";

        break;
      case "my looks":
        lineOne.innerText = `#${index + 1} ON OOTD`;
        lineTwo.innerText = `"${item.look.name}"`;
        break;
      default:
        break;
    }

    parent.appendChild(action);

    parent.addEventListener("click", (event) => {
      if (currentLeaderboard === "all looks") {
        openFullScreen();
      } else {
        if (!event.target.classList.contains("lb-action")) {
          L_LOOK_FILTER.textContent = "Back";
          currentLeaderboard = "back";
          L_DELETE.style.display = "none";
          getLeaderboardByLook(item.look._id).then((lb) => renderLookLeaderboard(lb));
          L_BUTTONS.style.display = "none";
          L_LEADERBOARD_PARENT.innerHTML = "Loading...";
          L_DATE.innerText = transformToAbbreviatedDate(L_DATE.innerText);
          L_BUTTONS.isVisible = false;
        }
      }
    });
  });
}
function renderLookLeaderboard(array) {
  L_LEADERBOARD_PARENT.innerHTML = "";
  leaderboardLookId = array[0].look._id;
  array.forEach((item, index) => {
    const parent = document.createElement("div");
    parent.classList.add("lb-item");
    L_LEADERBOARD_PARENT.appendChild(parent);

    const video_wrapper = document.createElement("div");
    video_wrapper.classList.add("lb-video");
    parent.appendChild(video_wrapper);

    let action = document.createElement("a");
    action.classList.add("lb-action");
    action.videoURL = STORAGE_LINK + item.video.cid;
    action.look = item.look.name;
    action.lookId = item.look._id;
    action.videoId = item.video._id;
    parent.appendChild(action);

    let overlay = document.createElement("div");
    let lineOne = document.createElement("p");
    let lineTwo = document.createElement("p");
    overlay.classList.add("overlay");
    overlay.append(lineOne, lineTwo);
    parent.appendChild(overlay);
    overlay.classList.add("makeVisible2");
    lineOne.innerText = `#${index + 1} in "${item.look.name}" ON OOTD`;
    const date = new Date(item.video.upload_date);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    // Add the ordinal suffix to the day
    function addOrdinalSuffix(day) {
      if (day >= 11 && day <= 13) {
        return day + "th";
      }
      switch (day % 10) {
        case 1:
          return day + "st";
        case 2:
          return day + "nd";
        case 3:
          return day + "rd";
        default:
          return day + "th";
      }
    }

    parent.addEventListener("click", openFullScreen);
    const formattedDate = `${month} ${addOrdinalSuffix(day)}, ${year}`;
    lineTwo.innerText = formattedDate;

    video_wrapper.innerHTML = ` <video id="${item.video._id}" playsinline loop autoplay muted>
      <source src="${STORAGE_LINK + item.video.cid}" type="video/mp4">
    </video>`;
  });
}
function showDownloadOption() {
  if (currentState !== "download") {
    document.querySelectorAll(".lb-action").forEach((icon) => {
      icon.style.display = "block";
      icon.innerText = "Download";
      icon.removeEventListener("click", deleteMyLook);
      icon.addEventListener("click", saveFile);
    });
    currentState = "download";
  } else {
    document.querySelectorAll(".lb-action").forEach((icon) => {
      icon.style.display = "none";
    });
    currentState = "";
  }
  toggleOverlay();
}
function showDeleteOption() {
  if (currentState !== "delete") {
    document.querySelectorAll(".lb-action").forEach((icon) => {
      icon.style.display = "block";
      icon.innerText = "delete";
      icon.removeEventListener("click", saveFile);
      icon.addEventListener("click", deleteMyLook);
    });
    currentState = "delete";
  } else {
    document.querySelectorAll(".lb-action").forEach((icon) => {
      icon.style.display = "none";
    });
    currentState = "";
  }
  toggleOverlay();
}
function showReportOption() {
  if (currentState !== "report") {
    document.querySelectorAll(".lb-action").forEach((icon) => {
      icon.style.display = "block";
      icon.innerText = "report";
    });
    currentState = "report";
  } else {
    document.querySelectorAll(".lb-action").forEach((icon) => {
      icon.style.display = "none";
    });
    currentState = "";
  }
  toggleOverlay();
}
function saveFile() {
  const url = event.target.videoURL;
  const filename = "ootd_" + event.target.look + ".mp4"; // Include the correct file extension
  var xhr = new XMLHttpRequest();
  xhr.responseType = "blob";
  xhr.onload = function () {
    var blob = new Blob([xhr.response], { type: "video/mp4" }); // Set the content type to video/mp4
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };
  xhr.open("GET", url);
  xhr.send();
}
function deleteMyLook() {
  const videoId = event.target.videoId;
  deleteLook(userId, videoId).then((remindedLooks) => {
    renderLeaderboard(remindedLooks);
  });
}
function transformToAbbreviatedDate(fullDate) {
  const parts = fullDate.split(" ");
  if (parts.length >= 2) {
    const abbreviatedMonth = parts[0].slice(0, 3);
    const day = parts[1];
    return `${abbreviatedMonth} ${day}`;
  }
  return fullDate; // Return the original value if it doesn't match the expected format
}

function toggleOverlay() {
  if (currentState === "") {
    L_LEADERBOARD_PARENT.querySelectorAll(".overlay").forEach((t) => (t.style.display = "block"));
  } else {
    L_LEADERBOARD_PARENT.querySelectorAll(".overlay").forEach((t) => (t.style.display = "none"));
  }
}

function openFullScreen() {
  PAGES_SWIPER.disable();

  L_FULL_SCREEN.style.display = "flex";

  L_FULL_SCREEN.addEventListener("touchstart", handleTouchStart, false);
  L_FULL_SCREEN.addEventListener("touchmove", handleTouchMove, false);

  L_FULL_SCREEN.innerHTML = "Loading...";
  if (currentLeaderboard === "all looks") {
    getGlobalLeaderboard().then((data) => {
      renderForFullScreen(data);
    });
  } else {
    getLeaderboardByLook(leaderboardLookId).then((data) => {
      renderForFullScreen(data, true);
    });
  }
}

function exitFullScreen() {
  L_FULL_SCREEN.style.left = "100vw";
  setTimeout(() => {
    L_FULL_SCREEN.style.left = "0";
    L_FULL_SCREEN.style.display = "none";
  }, 500);
  L_FULL_SCREEN.removeEventListener("touchstart", handleTouchStart);
  L_FULL_SCREEN.removeEventListener("touchmove", handleTouchMove);
  xDown = null;
  yDown = null;
  PAGES_SWIPER.enable();
}
function handleTouchStart(evt) {
  const firstTouch = getTouches(evt)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    return;
  }

  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    /*most significant*/
    if (xDiff > 0) {
      /* right swipe */
    } else {
      exitFullScreen();
    }
  } else {
    if (yDiff > 0) {
      /* down swipe */
    } else {
      /* up swipe */
    }
  }
  /* reset values */
  xDown = null;
  yDown = null;
}
function getTouches(evt) {
  return (
    evt.touches || // browser API
    evt.originalEvent.touches
  ); // jQuery
}

function renderForFullScreen(array, forLook = false) {
  L_FULL_SCREEN.innerHTML = "";
  const backButton = document.createElement("p");
  backButton.classList.add("back-button");
  backButton.innerText = "Back";
  backButton.addEventListener("click", exitFullScreen);
  const wrapper = document.createElement("div");
  wrapper.classList.add("swiper-wrapper");
  wrapper.appendChild(backButton);

  L_FULL_SCREEN.appendChild(wrapper);
  array.forEach((elem, index) => {
    const { video, look, posts } = elem;
    const { cid } = video;
    const { name } = look;
    const VIDEO = document.createElement("div");
    VIDEO.classList.add("swiper-slide", "feed-video");
    wrapper.appendChild(VIDEO);

    const videoWrapper = document.createElement("div");
    videoWrapper.classList.add("feed-background");
    VIDEO.appendChild(videoWrapper);

    videoWrapper.innerHTML = ` <video id="${video._id}" preload="metadata" playsinline loop autoplay muted>
    <source src="${BASE_URL_LINK}/videos/${video.cid}" type="video/mp4">
  </video>`;

    const content = document.createElement("div");
    content.classList.add("feedContent");
    VIDEO.appendChild(content);

    const ranking = document.createElement("p");
    ranking.classList.add("rankingFull");
    ranking.textContent = `#${index + 1} ON OOTD`;
    if (forLook) {
      ranking.textContent = `#${index + 1} LOOK IN "${name}"`;
    }
    content.appendChild(ranking);

    if (!forLook) {
      const lookName = document.createElement("p");
      lookName.classList.add("lookNameFull");
      lookName.textContent = `"${name}"`;
      content.appendChild(lookName);
    }

    const share = document.createElement("button");
    share.classList.add("shareButtonFull");
    share.textContent = "Download";
    share.look = name;
    share.videoURL = `${BASE_URL_LINK}/videos/${video.cid}`;
    share.addEventListener("click", saveFile);
    content.appendChild(share);
  });
  var FULL_SWIPER = new Swiper("#full-screen", {
    direction: "vertical",
    resistanceRatio: 0,
  });
}
