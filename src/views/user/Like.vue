<template>
  <div>
    <card-list :items="items"></card-list>
  </div>
</template>

<script>
import CardList from "@/components/CardList.vue";

export default {
  components: {
    CardList
  },
  data() {
    return {
      items: []
    };
  },
  created() {
    this.axios.get("/api/like").then(response => {
      this.items = response.data.data;
    });
  }
};
</script>
