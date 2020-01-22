<template>
  <div>
    <h4>產品分類管理</h4>
    <div class="row">
      <div class="col-12 col-md-8">
        <b-table striped hover md="6" :items="items" :fields="fields">
          <template v-slot:cell(content)="data">
            <span v-for="(item, key) in data.item.content" :key="key">
              {{ item }},
            </span>
          </template>
          <template v-slot:cell(action)="data">
            <button
              @click="edit(data.item)"
              class="btn btn-sm btn-success my-1"
            >
              edit
            </button>
            <button
              @click="deleteClass(data.item)"
              class="btn btn-sm btn-outline-danger my-1"
            >
              delete
            </button>
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fields: ["name", "content", "action"],
      items: []
    };
  },
  async created() {
    let response = await this.axios.get(
      "/api/spec/?store_id=" + this.$store.state.store.id
    );
    this.items = response.data.data;
    for (let i in this.items) {
      let arr = JSON.parse(this.items[i].content);
      this.items[i].content = arr;
    }
    console.log(this.items);
  }
};
</script>
