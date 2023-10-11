const L_DATE = document.getElementById("date");
const L_LEADERBOARD_PARENT = document.getElementById("lb-container");
const L_LOOK_FILTER = document.getElementById("look-filter");
const L_LEADERBOARD = document.querySelector(".leaderboard");
const L_LOOK_LEADERBOARD = document.querySelector(".look-leaderboard");
const L_LOOK_NAME = document.getElementById("look-name");
const L_BACK = document.querySelector(".look-lb");
const L_LOOK_CONTAINER = document.getElementById("look-container");
const L_BUTTONS = document.querySelector(".lb-buttons");
const L_DELETE = L_BUTTONS.children[1];
const L_DOWNLOAD = L_BUTTONS.children[0];
const L_REPORT = L_BUTTONS.children[2];
const L_LB = document.querySelector(".lb");

let currentLeaderboard = "all looks";
let currentState;
L_DATE.innerText = getCurrentMonthAndDay();
getGlobalLeaderboard().then((leaderboard) => {
  renderLeaderboard(leaderboard);
});
L_LOOK_FILTER.addEventListener("click", changeLeaderboard);
L_BACK.addEventListener("click", () => {
  L_LEADERBOARD.style.left = "0";
  L_LOOK_LEADERBOARD.style.left = "100vw";
  currentState = "";
  document.querySelectorAll(".lb-action").forEach((icon) => {
    icon.style.display = "none";
  });
  if (currentLeaderboard === "my looks") {
    L_DELETE.style.display = "block";
  }
});
L_DOWNLOAD.addEventListener("click", showDownloadOption);
L_DELETE.addEventListener("click", showDeleteOption);
L_REPORT.addEventListener("click", showReportOption);
L_LB.addEventListener("click", toggleButtons);

function toggleButtons() {
  if (L_BUTTONS.isVisible) {
    L_BUTTONS.style.display = "none";
    L_LEADERBOARD_PARENT.style.marginTop = "0px";
  } else {
    L_BUTTONS.style.display = "flex";
    L_LEADERBOARD_PARENT.style.marginTop = "40px";
  }
  L_BUTTONS.isVisible = !L_BUTTONS.isVisible;
}
function getCurrentMonthAndDay() {
  const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const now = new Date();
  const currentMonth = months[now.getMonth()];
  const currentDay = now.getDate();

  return `${currentMonth} ${currentDay}`;
}
function changeLeaderboard() {
  currentState = "";
  L_DELETE.style.display = "none";
  L_BUTTONS.style.display = "none";
  L_LEADERBOARD_PARENT.style.marginTop = "0px";

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
    default:
      break;
  }
}
function renderLeaderboard(array) {
  L_LEADERBOARD_PARENT.innerHTML = "";

  array.forEach((item) => {
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

    parent.appendChild(action);

    parent.addEventListener("click", (event) => {
      if (!event.target.classList.contains("lb-action")) {
        L_LEADERBOARD.style.left = "-100vw";
        L_LOOK_LEADERBOARD.style.left = "0";
        L_DELETE.style.display = "none";
        L_LOOK_NAME.innerText = `"` + item.look.name + `"`;
        getLeaderboardByLook(item.look._id).then((lb) => renderLookLeaderboard(lb));
        L_BUTTONS.style.display = "none";
        L_LEADERBOARD_PARENT.style.marginTop = "0px";

        L_BUTTONS.isVisible = false;
      }
    });
  });
}
function renderLookLeaderboard(array) {
  L_LOOK_CONTAINER.innerHTML = "";

  array.forEach((item) => {
    const parent = document.createElement("div");
    parent.classList.add("lb-item");
    L_LOOK_CONTAINER.appendChild(parent);

    const video_wrapper = document.createElement("div");
    video_wrapper.classList.add("lb-video");
    parent.appendChild(video_wrapper);

    let action = document.createElement("a");
    action.classList.add("lb-action");
    action.videoURL = STORAGE_LINK + "ootd/videos/" + item.video.cid;
    action.look = item.look.name;
    action.lookId = item.look._id;
    action.videoId = item.video._id;
    parent.appendChild(action);

    video_wrapper.innerHTML = ` <video id="${item.video._id}" playsinline loop autoplay muted>
      <source src="${STORAGE_LINK + "ootd/videos/" + item.video.cid}" type="video/mp4">
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
}
function saveFile() {
  const url = event.target.videoURL;
  const filename = "ootd_" + event.target.look + "mp4";
  var xhr = new XMLHttpRequest();
  xhr.responseType = "blob";
  xhr.onload = function () {
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
    a.download = filename; // Set the file name.
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    delete a;
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
