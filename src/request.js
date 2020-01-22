import router from "./router";
import store from "./store";
import axios from "axios";

// axios.create({
//   timeout: 10000, // request timeout
//   headers: { 'Content-type': 'application/json' }
// })
// declare a request interceptor
axios.interceptors.request.use(
  config => {
    // perform a task before the request is sent
    // console.log("Request was sent");
    return config;
  },
  error => {
    // handle the error
    return Promise.reject(error);
  }
);

// declare a response interceptor
axios.interceptors.response.use(
  response => {
    // do something with the response data
    // console.log("Response was received");

    return response;
  },
  error => {
    if (process.env.NODE_ENV === "development") {
      console.log(error.response);
    }
    let msg = "";
    if (typeof error.response.data.msg !== "undefined") {
      msg = error.response.data.msg;
    } else {
      msg = error.response.statusText;
    }
    store.commit("set_alert", {
      show: 3,
      type: "warning",
      text: msg
    });
    if (error.response.data.redirect) {
      router.push("/");
    }
    if (error.response.status === 403) {
      if (error.response.data.msg === "必須登入") {
        store.dispatch("logout");
      }
      if (store.state.store.account === undefined) {
        router.push("/");
      } else {
        router.push("/store/" + store.state.store.account);
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
