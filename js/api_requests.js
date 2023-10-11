let headers;
let USER;
let userId;
let TOKEN;
const limit = 5;

const createUser = async () => {
  try {
    const response = await axios.post(`${BASE_URL_LINK}/user/create`);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

const getUser = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL_LINK}/user/${userId}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting user data:", error);
  }
};

const saveLook = async (userId, lookId) => {
  try {
    // prettier-ignore
    const response = await axios.post(`${BASE_URL_LINK}/user/saveLook`,{ userId, lookId },{headers});
    return response.data;
  } catch (error) {
    console.error("Error saving look:", error);
  }
};

const followLook = async (userId, lookId) => {
  try {
    const response = await axios.post(`${BASE_URL_LINK}/user/followLook`, { userId, lookId }, { headers });
    return response.data;
  } catch (error) {
    console.error("Error following look:", error);
  }
};

const uploadVideo = async (videoFile, look, user_id) => {
  const formData = new FormData();
  formData.append("video", videoFile, "recorded-video.mp4");
  formData.append("look", look);
  formData.append("user_id", user_id);
  try {
    const response = await axios.post(`${BASE_URL_LINK}/video/post`, formData, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "multipart/form-data", // Ensure Content-Type is set
      },
    });

    if (response.status === 201) {
      alert("Uploaded successfully");
      checkAndUpdateUser();
      return response.data;
    } else {
      console.error("Unexpected response status:", response.status);
      throw new Error("Unexpected response status");
    }
  } catch (error) {
    console.error("Error uploading video:", error);
    alert("Error uploading video. Please try again.");
    throw error;
  }
};

const uploadMultipleVideos = async (user_id, videoFile, numberOfVideosToUpload) => {
  try {
    const looks = ["Look1", "Look2", "Look3", "Look4", "Look5", "Look6", "Look7", "Look8", "Look9", "Look10"];

    for (let i = 0; i < numberOfVideosToUpload; i++) {
      const formData = new FormData();
      formData.append("video", videoFile, "recorded-video.mp4");
      formData.append("look", looks[Math.floor(Math.random() * looks.length)]);
      formData.append("user_id", user_id);

      const response = await axios.post(`${BASE_URL_LINK}/video/post`, formData, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(`Uploaded video ${i + 1} successfully`);
    }

    return { success: true, message: `Uploaded ${numberOfVideosToUpload} videos successfully` };
  } catch (error) {
    console.error("Error uploading videos:", error);
    throw error;
  }
};

const rateVideo = async (userId, videoId, rating) => {
  try {
    const response = await axios.post(`${BASE_URL_LINK}/user/rateVideo`, { userId, videoId, rating }, { headers });
    console.log(response.data);
    if (!response.data.success) {
      alert("Already rated");
    }
    return response.data;
  } catch (error) {
    console.error("Error rating video:", error);
  }
};

const watchVideo = async (userId, videoId) => {
  try {
    const response = await axios.post(`${BASE_URL_LINK}/user/watchVideo`, { userId, videoId }, { headers });
    return response.data;
  } catch (error) {
    console.error("Error watching video:", error);
  }
};

const getFeedVideos = async (userId, LIMIT = limit) => {
  let videos = await axios
    .get(`${BASE_URL_LINK}/video/feed/${userId}/${LIMIT}`)
    .then((response) => {
      const feedVideos = response.data;
      return feedVideos;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  return videos;
};

const getMyLooks = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL_LINK}/user/myLooks/${userId}`, {
      headers,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    console.error("Error getting myLooks:", error);
  }
};

const getGlobalLeaderboard = async () => {
  try {
    const response = await axios.get(`${BASE_URL_LINK}/leaderboard`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting global leaderboard:", error);
  }
};

const getNewLooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL_LINK}/leaderboard/newLooks`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting newLooks:", error);
  }
};

const getLeaderboardByLook = async (lookId) => {
  try {
    const response = await axios.get(`${BASE_URL_LINK}/leaderboard/${lookId}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting leaderboard by look:", error);
  }
};

const deleteLook = async (userId, videoId) => {
  try {
    console.log(userId, videoId);
    const response = await axios.delete(`${BASE_URL_LINK}/user/deleteLook`, {
      headers,
      data: {
        userId,
        videoId,
      },
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error deleting look:", error);
  }
};

const checkAndUpdateUser = async () => {
  const cookies = document.cookie;
  const cookieArray = cookies.split(";").map((cookie) => cookie.trim());
  const idC = cookieArray.find((cookie) => cookie.startsWith("id="));
  const tokenC = cookieArray.find((cookie) => cookie.startsWith("token="));
  if (idC && tokenC) {
    const id = idC.split("=")[1];
    const token = tokenC.split("=")[1];
    TOKEN = token;
    headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const data = await getUser(id);
      USER = data.user;
      document.cookie = `user=${data.user}`;
      userId = data.user._id;

      return data.user;
    } catch (error) {
      try {
        const data = await createUser();
        document.cookie = `id=${data.user._id}`;
        document.cookie = `token=${data.token}`;
        document.cookie = `user=${data.user}`;
        userId = data.user._id;
        USER = data.user;
        TOKEN = data.token;
        return data.user;
      } catch (error) {
        console.error("Error creating user:", error);
      }
    }
  } else {
    try {
      const data = await createUser();
      document.cookie = `id=${data.user._id}`;
      document.cookie = `token=${data.token}`;
      document.cookie = `user=${data.user}`;
      userId = data.user._id;
      USER = data.user;
      TOKEN = data.token;
      return data.user;
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }
};


