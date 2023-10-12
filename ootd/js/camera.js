const C_STREAMING = document.getElementById("streaming");
const C_SWAP_CAMERA = document.getElementById("cameraSwap");
const C_START_RECORDING = document.getElementById("startRecording");
const C_TOGGLE_MUTE = document.getElementById("mute");
const C_DELETE = document.getElementById("delete");
const C_SAVE = document.getElementById("save");
const C_POST = document.getElementById("post");
const C_NAME_YOUR_LOOK = document.getElementById("nameYourLook");
const C_SAVED_LOOKS = document.getElementById("savedLooks");
const C_SAVED_LOOKS_CONTAINER = document.getElementById("savedLooksContainer");
const C_VIDEO_DURATION = 1500;

let currentCameraDirection = "environment";
let chunks = [];
let recordedBlobMp4 = null;
let recordedVideoURLMp4 = null;
let muted = true;
let LOOK = "";
let looksVisible = false;
let cameraEnabled = false;

// event listeners
C_SWAP_CAMERA.addEventListener("click", swapCamera);
C_START_RECORDING.addEventListener("touchstart", startRecording);
C_DELETE.addEventListener("click", restart);
C_NAME_YOUR_LOOK.addEventListener("input", handleNameYourLook);
C_NAME_YOUR_LOOK.addEventListener("focus", removeQuotes);
C_NAME_YOUR_LOOK.addEventListener("blur", addQuotesIfNeeded);
C_SAVED_LOOKS.addEventListener("click", toggleLooks);
C_POST.addEventListener("click", postVideo);
C_TOGGLE_MUTE.addEventListener("click", toggleMute);

PAGES_SWIPER.on("reachBeginning", function () {
  if (!cameraEnabled) {
    enableCamera();
    cameraEnabled = true;
  }
  checkAndUpdateUser().then((user) => {
    const { savedLooks } = user;
    renderSavedLooks(savedLooks);
  });
});

function toggleMute() {
  muted = !muted;
  C_STREAMING.muted = muted;
  if (muted) {
    C_TOGGLE_MUTE.textContent = "no audio";
  } else {
    C_TOGGLE_MUTE.textContent = "audio";
  }
}

function stopRecording() {
  // start recording button
  C_START_RECORDING.style.display = "none";
  // show buttons
  recordedUI("block");
  // video recording
  if (mediaRecorder) {
    mediaRecorder.stopRecording(function () {
      const blob = mediaRecorder.getBlob();
      recordedBlobMp4 = blob;
      recordedVideoURLMp4 = URL.createObjectURL(blob);
      C_STREAMING.loop = true;
      C_STREAMING.srcObject = null;
      C_STREAMING.src = recordedVideoURLMp4;
    });
  }
}

function startRecording() {
  // start recording button
  C_START_RECORDING.removeEventListener("click", startRecording);
  C_START_RECORDING.classList.add("active");
  C_START_RECORDING.children[0].classList.add("active");
  // swap camera button
  C_SWAP_CAMERA.style.display = "none";
  // video recording
  const stream = C_STREAMING.srcObject;

  mediaRecorder = RecordRTC(stream, {
    type: "video",
    mimeType: "video/mp4",
    video: {
      width: 480,
      height: 800,
    },
    canvas: {
      width: 640,
      height: 480,
    },
  });

  mediaRecorder.startRecording();
  setTimeout(() => {
    stopRecording();
  }, C_VIDEO_DURATION);
}

function enableCamera() {
  C_SWAP_CAMERA.style.display = "none";
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: {
          exact: "environment",
        },
      },
      audio: true,
    })
    .then(function (stream) {
      C_STREAMING.muted = muted;
      C_STREAMING.srcObject = stream;
      C_SWAP_CAMERA.style.display = "block";
      swapCamera();
    })
    .catch(function (error) {
      console.error("Error accessing environment camera:", error);
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: true,
        })
        .then(function (stream) {
          C_STREAMING.muted = muted;
          C_STREAMING.srcObject = stream;
          C_SWAP_CAMERA.style.display = "block";
          swapCamera();
        })
        .catch(function (error) {
          console.error("Error accessing user camera:", error);
        });
    });
}

function swapCamera() {
  let changeTo = currentCameraDirection === "environment" ? "user" : "environment";
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: {
          exact: changeTo,
        },
      },
      audio: true,
    })
    .then(function (stream) {
      C_STREAMING.srcObject = stream;
      currentCameraDirection = changeTo;
      if (changeTo === "user") {
        C_STREAMING.classList.add("user");
      } else {
        C_STREAMING.classList.remove("user");
      }
    })
    .catch(function (error) {
      console.error("Error accessing environment camera:", error);
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: currentCameraDirection,
          },
          audio: true,
        })
        .then(function (stream) {
          C_STREAMING.srcObject = stream;
        })
        .catch(function (error) {
          console.error("Error accessing user camera:", error);
        });
    });
}

function restart() {
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: {
          exact: currentCameraDirection,
        },
      },
      audio: true,
    })
    .then(function (stream) {
      C_STREAMING.srcObject = stream;
      if (currentCameraDirection === "user") {
        C_STREAMING.classList.add("user");
      } else {
        C_STREAMING.classList.remove("user");
      }
    })
    .catch(function (error) {
      console.error("Error accessing environment camera:", error);
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: currentCameraDirection,
          },
          audio: true,
        })
        .then(function (stream) {
          C_STREAMING.srcObject = stream;
        })
        .catch(function (error) {
          console.error("Error accessing user camera:", error);
        });
    });

  // vairable reset
  muted = true;
  chunks = [];
  recordedBlobMp4 = null;
  recordedVideoURLMp4 = null;

  // ui reset
  // start recording button
  C_START_RECORDING.style.display = "block";
  C_START_RECORDING.addEventListener("click", startRecording);
  C_START_RECORDING.classList.remove("active");
  C_START_RECORDING.children[0].classList.remove("active");
  // swap camera button
  C_SWAP_CAMERA.style.display = "block";
  // buttons
  recordedUI("none");
  // video
  C_STREAMING.loop = false;
  C_STREAMING.muted = true;
  C_STREAMING.src = "";

  LOOK = "";
  C_NAME_YOUR_LOOK.value = "";
}

function handleNameYourLook(event) {
  let look = event.target.value;
  LOOK = look;
  if (LOOK.length > 0 && LOOK.length <= 30) {
    C_SAVE.style.opacity = "1";
    C_SAVE.addEventListener("click", saveVideo);
  } else {
    C_SAVE.style.opacity = "0.5";
    C_SAVE.removeEventListener("click", saveVideo);
  }
}

function recordedUI(display) {
  document.querySelectorAll(".textButton").forEach((button) => {
    button.style.display = display;
  });
  C_NAME_YOUR_LOOK.style.display = display;
}

function saveVideo() {
  downloadVideo();
}

function postVideo() {
  if (LOOK.length < 1 || LOOK.length > 30) {
    C_NAME_YOUR_LOOK.classList.add("animateNameYourLook");
    setTimeout(() => {
      C_NAME_YOUR_LOOK.classList.remove("animateNameYourLook");
    }, 600);
  } else {
    uploadVideo(recordedBlobMp4, LOOK, userId).then(() => {
      checkAndUpdateUser().then((user) => {
        const { savedLooks } = user;
        renderSavedLooks(savedLooks);
      });
    });
    restart();
  }
}

function addQuotesIfNeeded(event) {
  let inputString = event.target.value;
  if (inputString.length > 0) {
    if (!inputString.startsWith('"')) {
      inputString = '"' + inputString;
    }
    if (!inputString.endsWith('"')) {
      inputString = inputString + '"';
    }
    event.target.value = inputString;
  }
}
function removeQuotes(event) {
  let inputString = event.target.value;
  if (inputString.length > 0) {
    if (inputString.startsWith('"') && inputString.endsWith('"')) {
      inputString = inputString.slice(1, -1);
    }
    event.target.value = inputString;
  }
}

function toggleLooks() {
  if (!looksVisible) {
    recordedUI("none");
    C_SAVED_LOOKS_CONTAINER.style.display = "flex";
    looksVisible = true;
    window.addEventListener("click", clickOutsideLooks);
  } else {
    recordedUI("block");
    C_SAVED_LOOKS_CONTAINER.style.display = "none";
    looksVisible = false;
    window.removeEventListener("click", clickOutsideLooks);
  }
  C_SAVED_LOOKS.style.display = "block";
}

function clickOutsideLooks(event) {
  if (!isElementOrChildClicked(C_SAVED_LOOKS, event) && !isElementOrChildClicked(C_SAVED_LOOKS_CONTAINER, event)) {
    window.removeEventListener("click", clickOutsideLooks);
    C_SAVED_LOOKS_CONTAINER.style.display = "none";
    looksVisible = false;
    recordedUI("block");
  }
}

function isElementOrChildClicked(element, event) {
  if (!element || !event) {
    return false;
  }
  if (event.target === element) {
    return true;
  }
  return element.contains(event.target);
}

function createMyLook(look) {
  const p = document.createElement("p");
  p.textContent = look || "No Saved Looks";
  p.classList.add("look");
  C_SAVED_LOOKS_CONTAINER.appendChild(p);
  return p;
}

function activateMyLook(element) {
  element.addEventListener("click", () => {
    C_NAME_YOUR_LOOK.value = `"` + element.textContent + `"`;
    LOOK = element.textContent;
    window.removeEventListener("click", clickOutsideLooks);
    C_SAVED_LOOKS_CONTAINER.style.display = "none";
    looksVisible = false;
    recordedUI("block");
  });
}

const renderSavedLooks = (savedLooks) => {
  C_SAVED_LOOKS_CONTAINER.innerHTML = "";
  if (savedLooks.length > 0) {
    savedLooks.forEach((look) => {
      let lookElement = createMyLook(look.name);
      activateMyLook(lookElement);
    });
  } else {
    createMyLook("No saved looks");
  }
};

function downloadVideo() {
  const blob = new Blob([recordedBlobMp4], { type: "video/mp4" }); // Adjust the MIME type accordingly
  const blobURL = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = blobURL;
  a.download = LOOK + ".mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobURL);
}
