<template>
  <img
    width="24"
    v-if="item.like_id !== null && item.like_id !== undefined"
    src="@/assets/liked.png"
    @click="like(item)"
    style="cursor: pointer;"
  />
  <img
    width="24"
    v-else
    src="@/assets/like.png"
    @click="like(item)"
    style="cursor: pointer;"
  />
</template>

<script>
export default {
  props: ["item"],
  methods: {
    like(item) {
      if (!this.$store.state.user) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "請先登入"
        });
        return;
      }
      if (this.disable) return;
      this.disable = true;
      if (item.like_id !== null && item.like_id !== undefined) {
        this.axios.delete("/api/like/" + item.like_id).then(response => {
          item.like_id = null;
          this.disable = false;
        });
      } else {
        this.axios.post("/api/like/?product_id=" + item.id).then(response => {
          item.like_id = response.data.id;
          this.disable = false;
        });
      }
    }
  }
};
</script>
