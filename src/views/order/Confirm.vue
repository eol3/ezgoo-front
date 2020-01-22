<template>
  <div class="row">
    <div class="col-12 col-md-8 offset-md-2">
      <h3 class="py-2">確認訂單</h3>
      <template v-if="product.length !== 0">
        <div class="row my-2" v-for="(item, key) in product" :key="key">
          <div class="col-5 col-md-3 offset-md-1">
            <img
              width="100%"
              style="max-height: 200px;object-fit:cover;"
              :src="item.thumbnail"
            />
          </div>
          <div class="col-7 offset-md-1">
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
            數量:{{ item.number }}<br />
            <br />
          </div>
        </div>
        <div class="row my-3">
          <div class="col-5 col-md-3 offset-md-1 text-right">
            總計:
          </div>
          <div class="col-7 offset-md-1">${{ total }}</div>
        </div>
        <hr />
        <h5>付款方式</h5>
        <div class="col-md-6">
          <select class="form-control" v-model="payment">
            <template v-for="(item, key) in $store.state.payment">
              <option
                :key="key"
                :value="key"
                v-if="item !== ''"
                :disabled="key !== 3"
              >
                {{ item }}
                <span v-if="key !== 3">
                  (未開放)
                </span>
              </option>
            </template>
          </select>
        </div>
        <hr />
        <h5>運送方式</h5>
        <div class="col-md-6">
          <select class="form-control" v-model="recieve">
            <template v-for="(item, key) in $store.state.recieve">
              <option
                :key="key"
                :value="key"
                v-if="item !== ''"
                :disabled="key !== 3"
              >
                {{ item }}
                <span v-if="key !== 3">
                  (未開放)
                </span>
              </option>
            </template>
          </select>
        </div>
        <hr />
        <template v-if="user !== null">
          <h5>訂購人資訊</h5>
          <div class="form-group row">
            <label class="col-12 col-md-2 col-form-label">姓名:</label>
            <div class="col-12 col-md-4">
              <input
                type="text"
                name="name"
                class="form-control"
                v-model="user.name"
                @change="change_user_info = true"
              />
            </div>
          </div>
          <div class="form-group row">
            <label class="col-12 col-md-2 col-form-label">手機:</label>
            <div class="col-12 col-md-4">
              <input
                type="text"
                name="phone"
                class="form-control"
                v-model="user.phone"
                @change="change_user_info = true"
              />
            </div>
          </div>
          <p>此資訊會自動同步到個人檔案中</p>
        </template>
      </template>
      <hr />
      <br />
      <center>
        <button class="btn btn-secondary mr-2" @click="$router.go(-1)">
          返回
        </button>
        <button
          class="btn btn-outline-primary"
          @click="confirm"
          :disabled="button_loading || product.length === 0"
        >
          <b-spinner
            small
            v-show="button_loading"
            variant="primary"
            label="Spinning"
          ></b-spinner>
          確認訂單
        </button>
      </center>
    </div>
  </div>
</template>

<script>
export default {
  name: "orderConfirm",
  data() {
    return {
      user: null,
      change_user_info: false,
      product: [],
      button_loading: false,
      payment: 3,
      recieve: 3,
      total: 0
    };
  },
  created() {
    this.init_product();
  },
  methods: {
    init_product() {
      if (this.$route.query.store_id === undefined) {
        this.$router.push("/cart");
      }
      if (this.$store.state.cart.length === 0) return;
      window.scrollTo(0, 0);
      let check = false;
      for (let i in this.$store.state.cart) {
        if (
          this.$store.state.cart[i].store_id ===
          parseInt(this.$route.query.store_id)
        ) {
          this.product = this.$store.state.cart[i].items;
          check = true;
        }
      }
      if (!check) {
        this.product = [];
        return;
      }
      let ids = "";
      this.total = 0;
      for (let i in this.product) {
        ids += this.product[i].id + "-";
        if (this.product[i].spec_price !== 0) {
          this.total += this.product[i].spec_price * this.product[i].number;
        } else {
          this.total += this.product[i].price * this.product[i].number;
        }
      }
      this.button_loading = true;
      ids = ids.substr(0, ids.length - 1);
      this.axios
        .get("/api/product", {
          params: {
            ids: ids,
            store_id: this.$route.query.store_id,
            limit: this.product.length
          }
        })
        .then(response => {
          this.check_product_info(response.data.data);
          this.button_loading = false;
        });
      this.axios
        .get("/api/user/" + this.$store.state.user.id)
        .then(response => {
          this.user = response.data;
          delete this.user.create_at;
          delete this.user.update_at;
          delete this.user.avatar;
        });
    },
    check_product_info(server_product) {
      let check = false;
      for (let i in this.product) {
        for (let j in server_product) {
          if (this.product[i].id === server_product[j].id) {
            if (
              this.product[i].price !== server_product[j].price ||
              this.product[i].spec_price !== server_product[j].spec_price ||
              this.product[i].name !== server_product[j].name
            ) {
              check = true;
              this.product[i].price = parseInt(server_product[j].price);
              this.product[i].spec_price = parseInt(
                server_product[j].spec_price
              );
              this.product[i].name = server_product[j].name;
              this.$store.dispatch("set_cart_product", {
                store_id: this.$route.query.store_id,
                item_key: i,
                product: this.product[i]
              });
            }
          }
        }
      }
      if (check) {
        this.total = 0;
        for (let i in this.product) {
          this.total += this.product[i].price * this.product[i].number;
        }
      }
    },
    confirm() {
      if (
        this.$store.state.user.account === "test_owner" ||
        this.$store.state.user.account === "test_editor" ||
        this.$store.state.user.account === "test_picker" ||
        this.$store.state.user.account === "test_guest"
      ) {
        if (this.$route.query.store_id !== 2) {
          this.$store.commit("set_alert", {
            type: "warning",
            text: "無法使用此特定帳號在此商店下單"
          });
          return;
        }
      }
      if (this.product.length === 0) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "尚無項目"
        });
        return;
      }
      let post_obj = {
        product: JSON.stringify(this.product),
        payment: this.payment,
        recieve: this.recieve
      };
      if (this.change_user_info) {
        post_obj.user = this.user;
      }
      this.button_loading = true;
      this.axios
        .post("/api/order?store_id=" + this.$route.query.store_id, post_obj)
        .then(response => {
          this.$store.commit("set_alert", {
            type: "success",
            text: "新增訂單成功"
          });
          this.$store.state.force_update = true;
          this.$store.dispatch("clear_cart");
          this.$router.push(
            "/user/" + this.$store.state.user.account + "/order"
          );
        });
    }
  },
  watch: {
    $route: function(to, from) {
      if (to.path === "/order/confirm") {
        this.init_product();
      }
    }
  }
};
</script>
