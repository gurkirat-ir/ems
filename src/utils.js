import axios from "axios";

export function checkLogin() {
  return new Promise(async (resolve, reject) => {
    try {
      let resp = await axios.get("/api/user/whoami", {
        withCredentials: true
      });

      if (resp.data.role) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
}

export function getRole() {
  return new Promise(async (res, rej) => {
    try {
      let resp = await axios.get("/api/user/whoami", {
        withCredentials: true
      });

      if (resp.data.role) {
        res(resp.data.role);
      } else {
        rej(null);
      }
    } catch (e) {
      rej(e);
    }
  });
}
