<template>
  <div>
    <b-table
      striped
      stacked="md"
      hover
      :items="order"
      :fields="fields"
      :busy="isBusy"
      show-empty
    >
      <template v-slot:cell(item_image)="data">
        <img :src="data.value" width="100" class="mx-2 my-2" />
      </template>
      <template v-slot:cell(status)="data">
        {{ $store.state.order_status.user[data.item.status] }}
      </template>
      <template v-slot:cell(payment_status)="data">
        {{ $store.state.payment_status[data.item.payment_status] }}
      </template>
      <template v-slot:cell(action)="data">
        <button
          @click="detail(data.item.id)"
          class="btn btn-outline-primary btn-sm mr-1"
        >
          查看訂單
        </button>
        <button
          v-if="data.item.status === 1"
          @click="cancel(data.item.id)"
          class="btn btn-outline-danger btn-sm"
        >
          取消訂單
        </button>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>
      <template v-slot:empty>
        <p class="mt-2 text-center">尚無訂單</p>
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
      fields: ["id", "status", "payment_status", "create_at", "action"],
      order: [],
      currentPage: 1,
      totalRows: 0,
      perPage: 10,
      isBusy: false
    };
  },
  created() {
    this.getList(1);
  },
  computed: {
    force_update() {
      return this.$store.state.force_update;
    }
  },
  methods: {
    detail(id) {
      this.$router.push(
        "/user/" + this.$store.state.user.account + "/order/" + id
      );
    },
    cancel(id) {
      this.axios.put("/api/order/" + id + "/cancel").then(response => {
        this.getList(1);
        this.$store.commit("set_alert", {
          type: "success",
          text: "取消訂單成功"
        });
      });
    },
    getList(val) {
      this.isBusy = true;
      this.axios
        .get("/api/order", { params: { litmi: this.perPage, page: val } })
        .then(response => {
          this.order = response.data.data;
          this.totalRows = response.data.total;
          this.isBusy = false;
        });
    }
  },
  watch: {
    currentPage(val) {
      this.getList(val);
    },
    force_update(to, from) {
      if (to) {
        this.getList(1);
        this.$store.state.force_update = false;
      }
    }
  }
};
</script>
