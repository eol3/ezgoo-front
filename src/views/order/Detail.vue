<template>
  <div>
    <div class="row" v-if="order !== null">
      <div class="col-12 col-md-8 offset-md-2">
        <router-link :to="'/store/' + order.store.account">
          <img class="rounded-circle" width="24" :src="order.store.avatar" />
          {{ order.store.name }} </router-link
        ><br />
        <div class="my-4">
          訂單編號：{{ order.id }}<br />
          訂單狀態：{{ $store.state.order_status.user[order.status] }}<br />
        </div>
        <div class="row my-2" v-for="(item, key) in order.items" :key="key">
          <div class="col-5 col-md-3 offset-md-1">
            <img
              width="100%"
              style="max-height: 200px;object-fit:cover;"
              :src="item.item_image"
            />
          </div>
          <div class="col-7 offset-md-1">
            {{ item.item_name }}<br />
            <div
              v-for="(spec_item, spec_key) in item.item_spec"
              :key="spec_key"
            >
              {{ spec_item.key }}: {{ spec_item.name }}
            </div>
            價格:{{ item.item_price }}<br />
            數量:{{ item.item_number }}<br />
          </div>
        </div>
        <div class="row my-3">
          <div class="col-5 col-md-3 offset-md-1 text-right">
            總計:
          </div>
          <div class="col-7 offset-md-1">${{ order.total }}</div>
        </div>
        <center>
          <button class="btn btn-secondary" @click="$router.go(-1)">
            返回
          </button>
        </center>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "orderDetail",
  data() {
    return {
      order: null
    };
  },
  created() {
    this.axios
      .get("/api/order/" + this.$route.params.order_id)
      .then(response => {
        console.log(response.data);
        for (let i in response.data.items) {
          if (response.data.items[i].item_spec !== "") {
            response.data.items[i].item_spec = JSON.parse(
              response.data.items[i].item_spec
            );
          }
        }
        this.order = response.data;
      });
  }
};
</script>
