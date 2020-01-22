<template>
  <div>
    <h4>優惠活動管理</h4>
    <template v-if="allow_write">
      <b-button class="ml-1" variant="primary" @click="add()">
        新增優惠
      </b-button>
      <p>
        所有設定將於隔日凌晨4點生效
      </p>
    </template>
    <b-table
      striped
      stacked="md"
      hover
      :items="promotions"
      :fields="fields"
      :busy="isBusy"
      show-empty
    >
      <template v-slot:cell(type)="data">
        {{ type[data.item.type] }}
      </template>
      <template v-slot:cell(name)="data">
        <router-link
          :to="
            '/store/' +
              $route.params.id +
              '/manage/promotions/preview/' +
              data.item.id
          "
        >
          {{ data.item.name }}
        </router-link>
      </template>
      <template v-slot:cell(status)="data">
        <b-form-checkbox
          :disabled="!allow_write"
          v-model="data.item.status"
          name="check-button"
          switch
          @change="changeStatus(data.item)"
        >
        </b-form-checkbox>
      </template>
      <template v-slot:cell(create_at)="data">
        {{ data.item.create_at | moment("YYYY/MM/DD") }}
      </template>
      <template v-slot:cell(action)="data">
        <button
          @click="edit(data.item.id)"
          class="btn btn-sm btn-outline-success my-1"
        >
          edit
        </button>
        <button
          @click="deleteProduct(data.item)"
          class="btn btn-sm btn-outline-danger my-1"
        >
          delete
        </button>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>
      <template v-slot:empty>
        <p class="mt-2 text-center">尚無優惠活動</p>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "PromotionsList",
  data() {
    return {
      type: ["", "一般優惠"],
      fields: ["id", "type", "name", "status", "create_at"],
      promotions: [],
      currentPage: 1,
      totalRows: 0,
      perPage: 10,
      isBusy: false,
      allow_write: false
    };
  },
  created() {
    if (this.$store.state.permissions.promotions.write) {
      this.fields = ["id", "type", "name", "status", "create_at", "action"];
      this.allow_write = true;
    }
    this.getList(1);
  },
  methods: {
    add() {
      this.$router.push(
        "/store/" + this.$route.params.id + "/manage/promotions/new"
      );
    },
    edit(id) {
      this.$router.push(
        "/store/" + this.$route.params.id + "/manage/promotions/edit/" + id
      );
    },
    getList(val) {
      this.isBusy = true;
      this.axios
        .get("/api/promotions/manage", {
          params: {
            store_id: this.$store.state.store.id,
            limit: this.perPage,
            page: val
          }
        })
        .then(response => {
          for (let i in response.data.data) {
            response.data.data[i].status =
              response.data.data[i].status === 1 ? true : false;
          }
          this.promotions = response.data.data;
          this.totalRows = response.data.total;
          this.isBusy = false;
        });
    },
    changeStatus(item) {
      item.status = !item.status;
      this.axios
        .put(
          "/api/promotions/" +
            item.id +
            "/status?store_id=" +
            this.$store.state.store.id,
          {
            status: item.status
          }
        )
        .then(response => {});
    }
  }
};
</script>
