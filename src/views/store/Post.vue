<template>
  <div>
    <div class="row" v-if="post !== null && post.length !== 0">
      <div v-for="(item, key) in post" :key="key" class="col-12 col-md-3">
        <div
          class="card mb-3"
          v-if="item.image_url !== null"
          @click="go_post(item)"
        >
          <img
            :src="item.image_url"
            class="card-img-top"
            style="max-height: 200px;object-fit: cover;"
          />
          <div class="card-body">
            <div class="row" style="max-height:100px;overflow:hidden;">
              <div class="col-sm-12 my-auto">
                {{ item.content }}
              </div>
            </div>
          </div>
        </div>
        <div class="card mb-3" v-else @click="go_post(item)">
          <div class="card-body">
            <div class="row" style="height:200px;overflow:hidden;">
              <div class="col my-auto">
                {{ item.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="post.length === 0" class="m-2 text-center">
      尚無貼文
      <br /><br /><br />
    </div>
    <div v-else>
      <div class="card" style="width: 13rem;">
        <img src="@/assets/no-image-sm.webp" class="card-img-top" />
        <div class="card-body">
          ...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      post: null
    };
  },
  created() {
    this.axios
      .get("/api/post", {
        params: {
          store_account: this.$route.params.id,
          limit: 8,
          page: 1
        }
      })
      .then(response => {
        this.post = response.data.data;
      });
  },
  methods: {
    go_post(item) {
      this.$router.push({
        name: "postItem",
        params: {
          post_id: item.id,
          post_item: item
        }
      });
    }
  }
};
</script>

<style scoped>
.card:hover {
  cursor: pointer;
}
</style>
