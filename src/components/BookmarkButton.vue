<template>
  <img
    width="24"
    v-if="item.bookmark_id !== null && item.bookmark_id !== undefined"
    src="@/assets/bookmarked.png"
    @click="bookmark(item)"
    style="cursor: pointer;"
  />
  <img
    width="24"
    v-else
    src="@/assets/bookmark.png"
    @click="bookmark(item)"
    style="cursor: pointer;"
  />
</template>

<script>
export default {
  props: ["item"],
  methods: {
    bookmark(item) {
      if (!this.$store.state.user) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "請先登入"
        });
        return;
      }
      if (this.disable) return;
      this.disable = true;
      if (item.bookmark_id !== null && item.bookmark_id !== undefined) {
        this.axios
          .delete("/api/bookmark/" + item.bookmark_id)
          .then(response => {
            item.bookmark_id = null;
            this.disable = false;
          });
      } else {
        this.axios
          .post("/api/bookmark/?product_id=" + item.id)
          .then(response => {
            item.bookmark_id = response.data.id;
            this.disable = false;
          });
      }
    }
  }
};
</script>
