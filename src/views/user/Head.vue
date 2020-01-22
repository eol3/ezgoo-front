<template>
  <div>
    <br />
    <div class="row">
      <div class="col-3 col-md-2 col-lg-1 offset-md-1">
        <img
          v-if="$store.state.user === null"
          src="@/assets/no-image-sm.webp"
          class="rounded-circle avatar-image"
          width="100%"
        />
        <img
          v-else-if="$store.state.user.avatar_url !== ''"
          :src="$store.state.user.avatar_url"
          class="rounded-circle avatar-image"
          width="100%"
        />
        <img
          v-else
          src="@/assets/no-image-sm.webp"
          class="rounded-circle avatar-image"
          width="100%"
        />
      </div>
      <div class="col-6 col-md-6 col-lg-7 my-auto">
        <h3 v-if="$store.state.user !== null">
          {{ $store.state.user.nickname }}
        </h3>
      </div>
    </div>
    <br />
    <div class="row">
      <div class="col-12 col-md-10 offset-md-1">
        <ul class="nav">
          <li :class="['nav-item', { active: is_active('index') }]">
            <router-link class="nav-link" :to="index_url">個人資料</router-link>
          </li>
          <li :class="['nav-item', { active: is_active('order') }]">
            <router-link class="nav-link" :to="index_url + '/order'"
              >我的訂單</router-link
            >
          </li>
          <li :class="['nav-item', { active: is_active('follow') }]">
            <router-link class="nav-link" :to="index_url + '/store/follow'"
              >我追蹤的商店</router-link
            >
          </li>
          <li :class="['nav-item', { active: is_active('like') }]">
            <router-link class="nav-link" :to="index_url + '/like'"
              >我喜歡的</router-link
            >
          </li>
          <li :class="['nav-item', { active: is_active('bookmark') }]">
            <router-link class="nav-link" :to="index_url + '/bookmark'"
              >我的收藏</router-link
            >
          </li>
          <li :class="['nav-item', { active: is_active('history') }]">
            <router-link class="nav-link" :to="index_url + '/history'"
              >瀏覽紀錄</router-link
            >
          </li>
          <li :class="['nav-item', { active: is_active('manage') }]">
            <router-link class="nav-link" :to="index_url + '/store/manage'"
              >商店管理</router-link
            >
          </li>
          <li class="nav-item">
            <b-link class="nav-link" @click="logout">登出</b-link>
          </li>
        </ul>
      </div>
    </div>
    <br />
    <div class="row">
      <div class="col-12 col-md-10 offset-md-1">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "user",
  data() {
    return {
      index_url: "/user/" + this.$route.params.user_id
    };
  },
  created() {
    this.set_meta();
  },
  activated() {
    this.set_meta();
  },
  methods: {
    set_meta() {
      this.$store.commit("init_brand");
      this.$store.state.meta.title = "EzGoo 易購網網路購物平台";
      this.$store.state.meta.describe = "簡單容易使用的網路購物平台";
    },
    is_active: function(resource) {
      if (this.$route.fullPath.indexOf(resource) > 0) return true;
      else if (
        resource === "index" &&
        this.$route.fullPath === "/user/" + this.$route.params.user_id
      )
        return true;
      else return false;
    },
    logout() {
      this.axios
        .post("/api/user/logout")
        .then(response => {
          this.$store.dispatch("logout");
          this.$store.commit("set_alert", {
            type: "success",
            text: response.data.msg
          });
          if (
            this.$route.path.indexOf("manage") > 0 ||
            this.$route.path.indexOf("user") > 0
          ) {
            if (this.$route.params.id === undefined) {
              this.$router.push("/");
            } else {
              this.$router.push("/store/" + this.$route.params.id);
            }
          } else {
            //this.reload();
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  watch: {
    "$route.params.user_id"(to, from) {
      if (to !== undefined) {
        this.index_url = "/user/" + to;
      }
    }
  }
};
</script>
