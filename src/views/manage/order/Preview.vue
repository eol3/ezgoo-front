<template>
  <div v-if="order.id !== undefined">
    <h3>訂單管理</h3>
    訂單編號：{{ order.id }}<br />
    訂單狀態：{{ $store.state.order_status.store[order.status] }}<br />
    收款方式：{{ $store.state.payment[order.payment] }}<br />
    取貨方式：{{ $store.state.recieve[order.recieve] }}<br />
    <div class="row my-2" v-for="(item, key) in order.items" :key="key">
      <div class="col-3">
        <img width="100%" :src="item.item_image" />
      </div>
      <div class="col-3">
        {{ item.item_name }}<br />
        訂單價格: {{ item.item_price }}
      </div>
    </div>
    總計: {{ order.total }}<br /><br />
    <button class="btn btn-secondary" @click="$router.go(-1)">
      返回
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      order: {},
      next_status: 2,
      next_str: ["", "", "確認接收", "確認寄出", "已送達/可取貨"]
    };
  },
  created() {
    this.axios
      .get(
        "/api/order/" +
          this.$route.params.order_id +
          "/manage?store_id=" +
          this.$store.state.store.id
      )
      .then(response => {
        this.order = response.data;
      });
  },
  methods: {}
};
</script>
