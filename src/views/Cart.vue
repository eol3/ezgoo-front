<template>
  <div>
    <div class="row">
      <div class="col-12 col-md-8 offset-md-2">
        <div class="p-3 text-center" v-if="$store.state.cart.length === 0">
          <h3>目前購物車是空的</h3>
        </div>
        <h3 v-else>購物車</h3>
        <div v-for="(store, i) in $store.state.cart" :key="i">
          <div class="row">
            <div class="col-12">
              <router-link :to="'/store/' + store.store_account">
                <img
                  class="rounded-circle"
                  width="24"
                  :src="store.store_avatar_url"
                />
                {{ store.store_name }}
              </router-link>
            </div>
          </div>
          <div class="row my-2" v-for="(item, j) in store.items" :key="j">
            <div class="col-6 col-md-3 offset-md-1">
              <router-link
                :to="{
                  name: 'productItem',
                  params: {
                    id: store.store_account,
                    product_id: item.id,
                    product_item: item
                  }
                }"
              >
                <img
                  width="100%"
                  style="max-height: 200px;object-fit:cover;"
                  :src="item.thumbnail"
                />
              </router-link>
            </div>
            <div class="col-6 offset-md-1">
              <h4>{{ item.name }}</h4>
              <div v-for="(spec_item, spec_key) in item.spec" :key="spec_key">
                {{ spec_item.key }}: {{ spec_item.name }}
              </div>
              價格:
              <template
                v-if="item.spec_price === 0 || item.spec_price === undefined"
              >
                ${{ item.price }}
              </template>
              <template v-else>
                <span style="text-decoration:line-through;">
                  ${{ item.price }}
                </span>
                <span style="color:red"> ${{ item.spec_price }} </span>
              </template>
              <br />
              <div class="py-1">
                數量:
                <img
                  width="24"
                  @click="add(item)"
                  class="pointer mr-2"
                  src="@/assets/add.png"
                />
                {{ item.number }}
                <img
                  width="24"
                  @click="subtract(item)"
                  class="pointer ml-2"
                  src="@/assets/minus.png"
                />
                <br />
              </div>
              <button
                @click="
                  $store.dispatch('del_cart', { store_key: i, item_key: j })
                "
                class="btn btn-sm btn-danger"
              >
                移除
              </button>
            </div>
          </div>
          <hr />
          <div class="row">
            <div class="col-12 col-lg-8 offset-lg-2">
              <button class="btn btn-secondary mx-1" @click="$router.go(-1)">
                <img
                  width="24"
                  src="@/assets/back.png"
                  style="filter: invert(100%);"
                />
                返回
              </button>
              <button
                class="btn btn-info"
                @click="go_check_out(store.store_id)"
                style="width:60%"
              >
                結帳
              </button>
            </div>
          </div>
          <br />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "cart",
  data() {
    return {
      store: {},
      product: []
    };
  },
  created() {
    this.set_meta();
  },
  activated() {
    this.set_meta();
  },
  methods: {
    set_meta() {
      this.$store.commit("init_brand");
      this.$store.state.meta.title = "EzGoo 易購網網路購物平台";
      this.$store.state.meta.describe = "簡單容易使用的網路購物平台";
    },
    add(item) {
      item.number += 1;
      this.$store.dispatch("sync_cart");
    },
    subtract(item) {
      if (item.number <= 1) return;
      item.number -= 1;
      this.$store.dispatch("sync_cart");
    },
    go_check_out(store_id) {
      if (this.$store.state.cart.length === 0) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "尚無商品"
        });
      } else if (this.$store.state.user === false) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "請先登入"
        });
      } else {
        this.$router.push("/order/confirm?store_id=" + store_id);
      }
    }
  }
};
</script>
