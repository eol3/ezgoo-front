<template>
  <div>
    <!--<nav class="navbar navbar-expand-lg navbar-fixed-top navbar-light">-->
    <b-navbar type="light" variant="light" fixed="top">
      <div class="container">
        <div class="navbar-brand">
          <span
            v-show="$store.state.brand.show_prev"
            class="pointer"
            @click="$router.go(-1)"
          >
            <img width="36" src="@/assets/prev.png" />
          </span>
          <router-link class="navbar-brand" :to="$store.state.brand.url">
            <img
              v-show="$store.state.brand.avatar !== ''"
              class="rounded-circle avatar-image-sm"
              width="100%"
              style="object-fit: cover;"
              :src="$store.state.brand.avatar"
            />
            <img
              v-if="$store.state.brand.name === 'EzGoo'"
              width="100"
              src="@/assets/logo.png"
            />
            <span class="mobile-hide" v-else>
              {{ $store.state.brand.name }}
            </span>
          </router-link>
        </div>
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/cart">
              <div class="badge-wrap">
                <img width="24" src="@/assets/shopping-cart.png" />
                <span
                  v-show="$store.state.cart_badge !== 0"
                  class="badge badge-pill badge-danger"
                >
                  {{ $store.state.cart_badge }}
                </span>
              </div>
            </router-link>
          </li>
          <template v-if="$store.state.user">
            <li class="nav-item">
              <router-link
                class="nav-link"
                :to="'/user/' + $store.state.user.account"
              >
                <img
                  v-if="$store.state.user.avatar_url !== ''"
                  class="rounded-circle avatar-image-sm"
                  width="100%"
                  style="object-fit: cover;"
                  :src="$store.state.user.avatar_url"
                />
                <img v-else width="24" src="@/assets/account.png" />
              </router-link>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <b-link class="nav-link" v-b-modal.modal-register>註冊</b-link>
            </li>
            <li class="nav-item">
              <b-link class="nav-link" v-b-modal.modal-login>登入</b-link>
            </li>
            <!-- <li class="nav-item">
              <b-link class="nav-link" v-b-modal.modal-login>
                <img width="24" src="@/assets/account.png">
              </b-link>
            </li> -->
          </template>
        </ul>
      </div>
    </b-navbar>
    <div class="container" style="margin-top:65px;">
      <keep-alive v-if="isRouterAlive">
        <router-view />
      </keep-alive>
      <hr />
      <div class="text-center my-4">
        <router-link to="/">EzGOO 易購網網路購物平台</router-link>
      </div>
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
      brand_avatar: "",
      brand_url: "/",
      brand_name: "EzGoo",
      show_prev: false,
      isRouterAlive: true,
      title: "EzGoo 易購網網路購物平台",
      describe: "簡單容易使用的網路購物平台"
    };
  },
  computed: {
    meta_content() {
      if (this.$store.state.meta.describe === "")
        return this.$store.state.meta.title;
      else
        return (
          this.$store.state.meta.describe + " | " + this.$store.state.meta.title
        );
    }
  },
  metaInfo() {
    return {
      title: this.$store.state.meta.title,
      meta: [
        {
          property: "describe",
          content: this.meta_content
        }
      ]
    };
  },
  // computed: {
  //   store() {
  //     return this.$store.state.store;
  //   }
  // },
  async created() {
    // this.axios.get("/api/user/").then(response => {
    //   this.$store.commit("set_user", response.data);
    // });
    if (this.$route.query.login) {
      this.$bvModal.show("modal-login");
    }
    //this.set_store();
  },
  methods: {
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => (this.isRouterAlive = true));
    },
    async set_store() {
      if (this.$route.params.id !== undefined) {
        this.isRouterAlive = false;
        await this.$store.dispatch("get_store", {
          store_account: this.$route.params.id
        });
        this.isRouterAlive = true;
      }
      if (this.$store.state.change_store) {
        this.reload();
        this.$store.state.change_store = false;
      }

      if (this.$route.params.id !== undefined) {
        this.brand_avatar = "";
        this.brand_name = "EzGoo";
        this.brand_url = "/";
        this.show_prev = false;
        this.title = this.$store.state.store.name + " - EzGoo";
        this.describe = this.$store.state.store.about;
        return;
      }

      if (
        this.$store.state.store !== null &&
        this.$store.state.store !== false &&
        (this.$route.name === "productItem" || this.$route.name === "postItem")
      ) {
        this.brand_avatar = this.$store.state.store.avatar.url;
        this.brand_name = this.$store.state.store.name;
        this.brand_url = "/store/" + this.$store.state.store.account;
        this.show_prev = true;
        this.title = this.$store.state.store.name + " - EzGoo";
        this.describe = this.$store.state.store.about;
        return;
      }

      this.brand_avatar = "";
      this.brand_name = "EzGoo";
      this.brand_url = "/";
      this.show_prev = false;
      this.title = "EzGoo 易購網網路購物平台";
      this.describe = "簡單容易使用的網路購物平台";
    },
    set_brand() {}
  },
  watch: {
    // store: function(to, from) {
    //   // 單一瀏覽產品頁的時候，商店資訊會在取得商品之後才取得
    //   // 因此在這檢查商品資訊，有改變時再設定一次
    //   this.set_store();
    // },
    // $route: function() {
    //   this.set_store();
    // },
    "$route.query.hash": function() {
      if (this.$route.query.login && !this.$store.state.user) {
        this.$bvModal.show("modal-login");
      }
    }
    // "$route.query.login": function() {
    //   console.log("test")
    //   if (this.$route.query.login) {
    //     this.$bvModal.show("modal-login");
    //   }
    // }
  }
};
</script>
