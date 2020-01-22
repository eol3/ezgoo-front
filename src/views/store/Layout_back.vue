<template>
  <div>
    <!--<nav class="navbar navbar-expand-lg navbar-fixed-top navbar-light">-->
    <b-navbar toggleable="lg" type="light" variant="light" fixed="top">
      <div class="container">
        <router-link class="navbar-brand" :to="'/store/' + $route.params.id"
          >Navbar</router-link
        >
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <ul class="navbar-nav">
            <li class="nav-item active">
              <a class="nav-link" href="/"
                >首頁 <span class="sr-only">(current)</span></a
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/about">通知</router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :to="'/store/' + $route.params.id + '/cart'"
                >購物車</router-link
              >
            </li>
            <template v-if="$store.state.user">
              <p class="my-auto">Hi {{ $store.state.user.account }}</p>
              <li class="nav-item">
                <router-link
                  class="nav-link"
                  :to="'/store/' + $route.params.id + '/order'"
                  >我的訂單</router-link
                >
              </li>
              <li class="nav-item">
                <b-link class="nav-link" @click="logout">登出</b-link>
              </li>
            </template>
            <template v-else>
              <li class="nav-item">
                <b-link class="nav-link" v-b-modal.modal-register>註冊</b-link>
              </li>
              <li class="nav-item">
                <b-link class="nav-link" v-b-modal.modal-login>登入</b-link>
                <!--<router-link class="nav-link" :to="'/store/' + $route.params.id + '/login'">-->
                <!--  登入-->
                <!--</router-link>-->
              </li>
            </template>
          </ul>
        </b-collapse>
      </div>
    </b-navbar>
    <div class="container" style="margin-top:60px;">
      <!--<keep-alive include="Home">-->
      <router-view v-if="isRouterAlive" />
      <!--</keep-alive>-->
    </div>
  </div>
</template>

<script>
export default {
  name: "Layout",
  provide() {
    return {
      reload: this.reload
    };
  },
  data() {
    return {
      user: null,
      product: [],
      isRouterAlive: true
    };
  },
  created() {
    // this.axios.get("/api/user/").then(response => {
    //   this.$store.commit("set_user", response.data);
    // });
  },
  methods: {
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => (this.isRouterAlive = true));
    },
    logout() {
      this.axios
        .post("/api/user/logout")
        .then(response => {
          this.$store.dispatch("logout");
          this.$store.commit("set_alert", {
            show: 5,
            type: "success",
            text: response.data.msg
          });
          if (
            this.$route.path.indexOf("manage") > 0 ||
            this.$route.path.indexOf("order") > 0
          ) {
            this.$router.push("/store/" + this.$route.params.id);
          } else {
            //this.reload();
          }
        })
        .catch(error => {
          console.log(error.response.data);
        });
    }
  }
};
</script>
