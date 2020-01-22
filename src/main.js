import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueMeta from "vue-meta";
import VueAxios from "vue-axios";
import axios from "./request";
// import "@/assets/custom.scss";
import customBootstrapVue from "./tools/custom-bootstrap-vue";
//import BootstrapVue from 'bootstrap-vue'
// import "bootstrap/dist/css/bootstrap.css";
// import "bootstrap-vue/dist/bootstrap-vue.css";

import "@/assets/custom.css";

Vue.config.productionTip = false;
customBootstrapVue(Vue);
Vue.use(VueMeta);
Vue.use(VueAxios, axios);
//Vue.use(BootstrapVue)
//await initStore(store);

//Vue.use(axios);

//set moment
var moment = require("moment");
Vue.filter("moment", function(date, format) {
  return moment(date).format(format);
});

new Vue({
  router,
  store,
  render: h => h(App),
  created() {}
}).$mount("#app");
