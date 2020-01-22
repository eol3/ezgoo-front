<template>
  <div>
    <b-table
      striped
      stacked="md"
      hover
      :items="items"
      :fields="fields"
      :busy="isBusy"
      show-empty
    >
      <template v-slot:cell(action)="data">
        <button
          @click="go(data.item.store_account)"
          class="btn btn-outline-primary btn-sm"
        >
          前往商店
        </button>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>
      <template v-slot:empty>
        <p class="mt-2 text-center">尚無商店</p>
      </template>
    </b-table>
    <b-pagination
      v-model="currentPage"
      :total-rows="totalRows"
      :per-page="perPage"
      aria-controls="my-table"
    ></b-pagination>
  </div>
</template>

<script>
export default {
  name: "orderList",
  data() {
    return {
      fields: ["id", "role", "store_name", "action"],
      items: [],
      currentPage: 1,
      totalRows: 0,
      perPage: 10,
      isBusy: false
    };
  },
  created() {
    this.getList(1);
  },
  methods: {
    detail(id) {
      this.$router.push(
        "/user/" + this.$store.state.user.account + "/order/" + id
      );
    },
    getList(val) {
      this.isBusy = true;
      let obj = {};
      if (this.$route.params.role === "follow") {
        this.fields = ["store_name", "action"];
        obj = {
          role: "follower"
        };
      } else if (this.$route.params.role === "manage") {
        this.fields = ["role", "store_name", "action"];
        obj = {
          group: "manage"
        };
      }
      this.axios.get("/api/user/store", { params: obj }).then(response => {
        this.items = response.data.data;
        this.totalRows = response.data.total;
        this.isBusy = false;
      });
    },
    go(store_account) {
      if (this.$route.params.role === "manage") {
        this.$router.push("/store/" + store_account + "/manage/");
      } else if (this.$route.params.role === "follow") {
        this.$router.push("/store/" + store_account);
      }
    }
  },
  watch: {
    currentPage(val) {
      this.getList(val);
    },
    "$route.params.role": function() {
      if (this.$route.params.role !== undefined) {
        this.getList();
      }
    }
  }
};
</script>
