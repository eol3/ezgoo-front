<template>
  <div>
    <b-carousel
      v-if="
        $store.state.store === null || $store.state.store.images.length === 0
      "
      id="carousel-1"
      :interval="0"
      controls
      indicators
      background="#ababab"
      img-width="1024"
      img-height="480"
      style="text-shadow: 1px 1px 2px #333;"
    >
      <b-carousel-slide caption="Blank Image" img-blank img-alt="Blank image">
      </b-carousel-slide>
    </b-carousel>
    <b-carousel
      v-else
      id="carousel-1"
      :interval="0"
      :controls="$store.state.store.images.length > 1"
      :indicators="$store.state.store.images.length > 1"
      background="#ababab"
      img-width="1024"
      img-height="480"
      style="text-shadow: 1px 1px 2px #333;"
    >
      <b-carousel-slide
        v-for="(item, key) in $store.state.store.images"
        :key="key"
        caption=""
        text=""
        :img-src="item.url"
      ></b-carousel-slide>
    </b-carousel>
    <br />
    <div class="row">
      <div class="col-3 col-md-2 col-lg-1 offset-md-1">
        <img
          v-if="$store.state.store === null"
          src="@/assets/no-image-sm.webp"
          class="rounded-circle avatar-image"
          width="100%"
        />
        <img
          v-else-if="$store.state.store.avatar !== undefined"
          :src="$store.state.store.avatar.url"
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
        <h3 v-if="$store.state.store !== null">
          {{ $store.state.store.name }}
        </h3>
        <!-- <small>16874 人已追蹤</small> -->
      </div>
      <div class="col-3 col-md-2 my-auto pl-0">
        <div class="float-right">
          <template v-if="$store.state.user !== null">
            <template
              v-if="
                $store.state.user !== false &&
                  $store.state.user.role !== undefined &&
                  $store.state.user.role.manage !== undefined
              "
            >
              <router-link
                :to="'/store/' + $route.params.id + '/manage/'"
                class="btn btn-outline-primary"
                >管理商店</router-link
              >
            </template>
            <template>
              <button
                v-if="
                  $store.state.user !== false &&
                    $store.state.user.role !== undefined &&
                    $store.state.user.role.general !== undefined &&
                    $store.state.user.role.general === 'follower'
                "
                class="btn btn-success"
                @click="follow(0)"
              >
                已追蹤
              </button>
              <button v-else class="btn btn-outline-success" @click="follow(1)">
                追蹤
              </button>
            </template>
          </template>
        </div>
      </div>
    </div>
    <br />
    <div class="row">
      <div class="col-12 col-md-6 col-lg-6 offset-md-1">
        <ul class="nav">
          <li :class="['nav-item', { active: is_active('index') }]">
            <router-link class="nav-link" :to="'/store/' + $route.params.id"
              >首頁</router-link
            >
          </li>
          <li :class="['nav-item', { active: is_active('product') }]">
            <router-link
              class="nav-link"
              :to="'/store/' + $route.params.id + '/product'"
              >商品</router-link
            >
          </li>
          <li :class="['nav-item', { active: is_active('post') }]">
            <router-link
              class="nav-link"
              :to="'/store/' + $route.params.id + '/post'"
              >貼文</router-link
            >
          </li>
          <li :class="['nav-item', { active: is_active('about') }]">
            <router-link
              class="nav-link"
              :to="'/store/' + $route.params.id + '/about'"
              >關於</router-link
            >
          </li>
        </ul>
      </div>
    </div>
    <br />
    <keep-alive v-if="loading">
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
export default {
  data() {
    return {
      store_base_url: "/store/" + this.$route.params.id,
      store_img: [],
      product: [],
      loading: false
    };
  },
  async created() {
    await this.$store.dispatch("get_store", {
      store_account: this.$route.params.id
    });
    this.set_meta();
    this.loading = true;
  },
  activated() {
    if (this.$store.state.store !== null) {
      this.set_meta();
    }
  },
  methods: {
    set_meta() {
      // this.$store.commit("init_brand");
      this.$store.state.brand = {
        avatar: this.$store.state.store.avatar.url,
        name: this.$store.state.store.name,
        url: "/store/" + this.$store.state.store.account
      };
      this.$store.state.meta.title = this.$store.state.store.name + " - EzGoo";
      this.$store.state.meta.describe = this.$store.state.store.about;
    },
    is_active: function(resource) {
      if (this.$route.fullPath.indexOf(resource) > 0) return true;
      else if (
        resource === "index" &&
        this.$route.fullPath === "/store/" + this.$route.params.id
      )
        return true;
      else return false;
    },
    follow(follow) {
      if (!this.$store.state.user) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "請先登入"
        });
        return;
      }
      this.axios
        .put(
          "/api/user/role?store_account=" +
            this.$route.params.id +
            "&follow=" +
            follow
        )
        .then(response => {
          this.$store.commit("set_role", response.data);
          console.log(this.$store.state.user.role.general);
        });
    }
  },
  watch: {
    $route: async function(to, from) {
      if (from.name === "productItem" || from.name === "postItem") return;
      if (to.params.id !== undefined) {
        await this.$store.dispatch("get_store", {
          store_account: to.params.id
        });
        if (this.$store.state.change_store) {
          this.loading = false;
          this.set_meta();
          this.$nextTick(() => {
            this.loading = true;
            this.$store.state.change_store = false;
          });
        }
      }
    }
    // "$route.query.hash": function() {
    //   if (this.$route.query.login && !this.$store.state.user) {
    //     this.$bvModal.show("modal-login");
    //   }
    // }
  }
};
</script>

<style>
.carousel-inner > .carousel-item {
  height: 320px;
}
@media (max-width: 992px) {
  .carousel-inner > .carousel-item {
    height: 220px;
  }
}
@media (max-width: 768px) {
  .carousel-inner > .carousel-item {
    height: 160px;
  }
}
</style>
