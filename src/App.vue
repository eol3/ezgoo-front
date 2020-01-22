<template>
  <div id="app">
    <div v-if="loading">
      loading
    </div>
    <div v-else>
      <Modals />
      <router-view v-if="isRouterAlive" />
    </div>
  </div>
</template>

<script>
import Modals from "@/components/Modals.vue";

export default {
  components: {
    Modals
  },
  provide() {
    return {
      reload: this.reload
    };
  },
  data() {
    return {
      isRouterAlive: true,
      loading: true
    };
  },
  created() {
    this.$store.dispatch("get_cart");
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => (this.isRouterAlive = true));
    }
  }
};
</script>

<style lang="scss">
@import "assets/custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap/dist/css/bootstrap.css";
@import "~bootstrap-vue/dist/bootstrap-vue.css";
</style>
