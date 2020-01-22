<template>
  <div v-if="order.id !== undefined">
    <h3>訂單管理</h3>
    訂單編號：{{ order.id }}<br />
    訂單狀態：{{ $store.state.order_status.store[order.status] }}<br />
    收款方式：{{ $store.state.payment[order.payment] }}<br />
    取貨方式：{{ $store.state.recieve[order.recieve] }}
    <hr />
    <h5>訂購人資訊:</h5>
    姓名: {{ order.user.name }}<br />
    電話: {{ order.user.phone }}
    <hr />
    <div class="row my-2" v-for="(item, key) in order.items" :key="key">
      <div class="col-3">
        <img width="100%" :src="item.item_image" />
      </div>
      <div class="col-3">
        {{ item.item_name }}<br />
        訂單價格: {{ item.item_price }} <br />
        訂單數量:{{ item.item_number }}
      </div>
    </div>
    總計: {{ order.total }}<br /><br />
    <select class="form-control" v-model="next_status" style="width:140px;">
      <option value="1">{{ next_str[1] }}</option>
      <option value="2">{{ next_str[2] }}</option>
      <option value="3">{{ next_str[3] }}</option>
      <option value="4">{{ next_str[4] }}</option>
      <option value="7">{{ next_str[7] }}</option>
      <option value="0">{{ next_str[0] }}</option>
    </select>
    <br />
    <button class="btn btn-outline-success mr-2" @click="next">
      確認
    </button>
    <button class="btn btn-secondary" @click="$router.go(-1)">
      返回
    </button>
    <br /><br />
  </div>
</template>

<script>
export default {
  data() {
    return {
      order: {},
      next_status: 2,
      next_str: [
        "取消訂單",
        "訂單成立",
        "確認接收",
        "確認寄出",
        "已送達/可取貨",
        "",
        "",
        "未取貨"
      ]
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
        this.next_status = this.order.status;
      });
  },
  methods: {
    next() {
      this.axios
        .put(
          "/api/order/" +
            this.$route.params.order_id +
            "/status?store_id=" +
            this.$store.state.store.id,
          {
            status: this.next_status
          }
        )
        .then(response => {
          this.$store.commit("set_alert", {
            type: "success",
            text: "更新成功"
          });
          // this.$router.go(-1);
          this.$router.push(this.$store.state.prev_url);
        });
    }
  }
};
</script>
