<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light">
      <div class="container">
        <router-link
          class="navbar-brand px-2"
          :to="'/store/' + $route.params.id + '/manage/'"
        >
          商家後台管理
        </router-link>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link
                class="nav-link"
                :to="'/store/' + $route.params.id + '/'"
              >
                預覽商店
                <span class="sr-only">(current)</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :to="'/store/' + $route.params.id + '/manage/order'"
                >訂單通知</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :to="'/user/' + $store.state.user.account + '/'"
              >
                <img
                  v-if="$store.state.user.avatar_url !== ''"
                  class="rounded-circle avatar-image-sm"
                  width="100%"
                  style="object-fit: cover;"
                  :src="$store.state.user.avatar_url"
                />
                個人資料
              </router-link>
            </li>
            <li class="nav-item">
              <b-link class="nav-link" @click="logout">登出</b-link>
            </li>
          </ul>
        </b-collapse>
      </div>
    </nav>
    <div class="container">
      <!--<keep-alive include="Home">-->
      <router-view />
      <!--</keep-alive>-->
    </div>
  </div>
</template>

<script>
export default {
  name: "ManageLayout",
  data() {
    return {
      user: null,
      product: []
    };
  },
  async created() {},
  methods: {
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => (this.isRouterAlive = true));
    },
    logout() {
      this.axios
        .post("/api/user/logout")
        .then(response => {
          this.$store.commit("set_alert", {
            show: 5,
            type: "success",
            text: response.data.msg
          });
          if (this.$route.path.indexOf("manage") > 0) {
            this.$router.push("/store/" + this.$route.params.id);
          }
          this.$store.dispatch("logout");
          //this.reload();
        })
        .catch(error => {
          console.log(error.response.data);
        });
    }
  }
};
</script>

<style scoped>
.navbar-brand {
  border-radius: 4px;
  background-color: #3f74b512;
}
</style>
