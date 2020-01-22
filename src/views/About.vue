<template>
  <div class="about">
    <h1>This is an about page</h1>
    <ul>
      <li v-for="(item, key) in product" :key="key">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "About",
  data() {
    return {
      product: []
    };
  },
  created() {
    this.axios.get("/api/product").then(response => {
      this.product = response.data;
    });
    console.log(process.env);
  }
};
</script>
