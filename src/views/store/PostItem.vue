<template>
  <div v-if="post !== null">
    <div class="row" v-if="post_image.length > 0">
      <div
        class="col-12 col-md-8 offset-md-3"
        style="overflow-x: auto; white-space: nowrap;"
      >
        <div
          v-for="(item, key) in post_image"
          :key="key"
          style="margin: 8px;display: inline-block;float: none;"
        >
          <img style="max-width:260px;" :src="item.url" />
        </div>
      </div>
    </div>
    <br v-else />
    <div class="row">
      <div class="col-12 col-md-6 offset-md-3 my-2">
        <p class="pl-2">
          {{ post.content }}
        </p>
        <button class="btn btn-primary mx-1" @click="$router.go(-1)">
          <img
            width="24"
            src="@/assets/back.png"
            style="filter: invert(100%);"
          />
          返回
        </button>
      </div>
    </div>
    <br /><br />
  </div>
</template>

<script>
export default {
  name: "PostItem",
  data() {
    return {
      post: null,
      post_image: [],
      number: 1
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  created() {
    this.getPost();
  },
  methods: {
    getPost() {
      window.scrollTo(0, 0); //在iphone safari上，卷軸會提在下方，用這拉到上面
      if (this.$route.params.post_item !== undefined) {
        this.post = this.$route.params.post_item;
        if (this.post.image_url !== null) {
          this.post_image = [{ url: this.post.image_url }];
        } else {
          this.post_image = [];
        }
        this.set_meta();
      }
      this.axios
        .get("/api/post/" + this.$route.params.post_id)
        .then(async response => {
          this.post = response.data.post;
          this.post_image = response.data.post_image;
          if (this.$store.state.store === null) {
            await this.$store.dispatch("get_store_by_id", {
              store_id: this.post.store_id
            });
            this.set_meta();
          }
        });
    },
    set_meta() {
      this.$store.state.brand = {
        avatar: this.$store.state.store.avatar.url,
        name: this.$store.state.store.name,
        url: "/store/" + this.$store.state.store.account,
        show_prev: true
      };
      this.$store.state.meta.title =
        this.post.content + " - " + this.$store.state.store.name;
      this.$store.state.meta.describe = "";
    }
  },
  watch: {
    "$route.params.post_id": function() {
      if (this.$route.params.post_id !== undefined) {
        this.getPost();
      }
    }
  }
};
</script>
