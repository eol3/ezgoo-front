<template>
  <div>
    <h3>優惠活動管理 - 查看優惠活動</h3>
    <br />
    <b-form-group label="優惠名稱:" label-cols="4" label-cols-md="2">
      <div class="col-md-4 col-8 my-2">
        {{ promotions.name }}
      </div>
    </b-form-group>
    <b-form-group label="開始日期:" label-cols="4" label-cols-md="2">
      <div class="col-md-4 col-8 my-2">
        {{ promotions.start_at | moment("YYYY/MM/DD") }}
      </div>
    </b-form-group>
    <b-form-group label="結束日期:" label-cols="4" label-cols-md="2">
      <div class="col-md-4 col-8 my-2">
        {{ promotions.expire_at | moment("YYYY/MM/DD") }}
      </div>
    </b-form-group>
    <b-form-group label="優惠類型:" label-cols="4" label-cols-md="2">
      {{ type[promotions.type] }}
    </b-form-group>
    <b-form-group label="描述:" label-cols="4" label-cols-md="2">
      <div class="col-md-4 col-8 my-2">
        {{ promotions.describe }}
      </div>
    </b-form-group>
    <br />
    <h4>已選擇商品</h4>
    <b-row class="select-product-area horizontal-row">
      <template v-if="selected_product.length === 0">
        <b-col cols="6" md="3">
          <div class="m-4">
            尚未選擇商品
          </div>
        </b-col>
      </template>
      <template v-else>
        <b-col
          class="mb-2"
          cols="6"
          md="3"
          v-for="(item, key) in selected_product"
          :key="key"
        >
          <div class="select-item">
            <center><img width="80%" :src="item.thumbnail" /><br /></center>
            {{ item.name }}<br />
            <div class="text-right">價格:{{ item.price }}</div>
            <div class="select-area text-center p-2">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">特價</span>
                </div>
                <input
                  disabled
                  type="number"
                  class="form-control"
                  v-model="item.spec_price"
                />
              </div>
            </div>
          </div>
        </b-col>
      </template>
    </b-row>
    <br />
    <b-row class="m-4">
      <b-button class="ml-1" @click="$router.go(-1)">
        取消
      </b-button>
    </b-row>
    <br /><br />
  </div>
</template>

<script>
import moment from "moment";
import "vue-datetime/dist/vue-datetime.css";

export default {
  data() {
    return {
      type: ["", "一般促銷"],
      promotions: {
        name: "",
        type: 1,
        describe: "",
        start_at: "",
        expire_at: ""
      },
      product: [],
      selected_product: [],
      isBusy: false
    };
  },
  created() {
    this.axios
      .get(
        "/api/promotions/" +
          this.$route.params.prom_id +
          "/manage/?store_id=" +
          this.$store.state.store.id
      )
      .then(response => {
        this.promotions = response.data;
        this.promotions.start_at = moment(this.promotions.start_at).format();
        this.promotions.expire_at = moment(this.promotions.expire_at).format();
        this.selected_product = JSON.parse(response.data.content);
      });
  },
  methods: {}
};
</script>

<style>
.select-product-area {
  background-color: #fff;
}
.select-item {
  border: 2px solid #f5f5f5;
  border-radius: 5px;
}
.select-area {
  background-color: #f5f5f5;
}
.selected-item {
  border-color: #28a745;
}
.selected-area {
  background-color: #28a745;
}
</style>
