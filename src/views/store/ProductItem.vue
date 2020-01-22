<template>
  <div>
    <div class="mobile-hide">
      <br />
    </div>
    <div class="row">
      <div style="height: 240px;"></div>
      <div
        class="col-12 col-lg-6 offset-lg-1"
        style="overflow-x: auto; white-space: nowrap;"
      >
        <div
          v-for="(item, key) in product_image"
          :key="key"
          style="margin: 8px;display: inline-block;float: none;"
        >
          <img style="width:260px;" :src="item.url" />
        </div>
      </div>
      <div v-if="product !== null" class="col-12 col-lg-4 my-2">
        <h3>
          {{ product.name }}
        </h3>
        <div class="row">
          <div class="col text-right">
            <like-button :item="product"></like-button>
            <bookmark-button :item="product"></bookmark-button>
            <img
              @click="copyURLtoClipboard"
              width="24"
              src="@/assets/share.png"
            />
          </div>
        </div>
        <hr />
        <div class="row">
          <div class="col-3 col-lg-3">
            價格:
          </div>
          <div class="col-9 col-lg-9">
            <template v-if="product.spec_price === 0">
              ${{ product.price }}
            </template>
            <template v-else>
              <span style="text-decoration:line-through;">
                ${{ product.price }}
              </span>
              <span style="color:red"> ${{ product.spec_price }} </span>
            </template>
          </div>
        </div>
        <div class="row py-1">
          <div class="col-3 col-md-3">
            數量:
          </div>
          <div class="col-9 col-md-9">
            <img
              width="24"
              @click="add"
              class="pointer mr-2"
              src="@/assets/add.png"
            />
            {{ number }}
            <img
              width="24"
              @click="subtract"
              class="pointer ml-2"
              src="@/assets/minus.png"
            />
          </div>
        </div>
        <div class="row" v-for="(item, key) in product.spec" :key="key">
          <div class="col-3 col-md-3">
            {{ item.name }}
          </div>
          <div class="col-9 col-md-9">
            <div
              class="form-check form-check-inline"
              v-for="(sub_item, sub_key) in item.content"
              :key="sub_key"
            >
              <input
                class="form-check-input"
                :name="key"
                type="radio"
                :id="sub_item.name"
                :value="sub_item.name"
                v-model="item.select_name"
              />
              <label class="form-check-label" :for="sub_item.name">
                {{ sub_item.name }}
              </label>
            </div>
          </div>
        </div>
        <br />
        <div class="row">
          <div class="col">
            <button class="btn btn-secondary mx-1" @click="$router.go(-1)">
              <img
                width="24"
                src="@/assets/back.png"
                style="filter: invert(100%);"
              />
              返回
            </button>
            <button
              @click="add_cart"
              class="btn btn-info mx-1"
              style="width:50%;"
            >
              <img
                width="24"
                src="@/assets/shopping-cart.png"
                style="filter: invert(100%);"
              />
              加入購物車
            </button>
          </div>
        </div>
      </div>
    </div>
    <br /><br />
  </div>
</template>

<script>
import LikeButton from "@/components/LikeButton.vue";
import BookmarkButton from "@/components/BookmarkButton.vue";

export default {
  name: "ProductItem",
  components: {
    LikeButton,
    BookmarkButton
  },
  data() {
    return {
      product: null,
      product_image: [],
      number: 1
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  created() {
    this.getProduct();
  },
  methods: {
    getProduct() {
      window.scrollTo(0, 0); //在iphone safari上，卷軸會提在下方，用這拉到上面
      if (this.$route.params.product_item !== undefined) {
        this.product = this.$route.params.product_item;
        this.product_image = [{ url: this.product.thumbnail }];
        this.set_meta();
        //this.product_image.push({ url: this.product.thumbnail });
      }
      this.axios
        .get("/api/product/" + this.$route.params.product_id)
        .then(async response => {
          this.product = response.data.product;
          this.product_image = response.data.product_image;
          if (this.$store.state.store === null) {
            await this.$store.dispatch("get_store_by_id", {
              store_id: this.product.store_id
            });
          }
          this.set_meta();
        });
    },
    set_meta() {
      this.$store.state.brand = {
        avatar: this.$store.state.store.avatar.url,
        name: this.$store.state.store.name,
        url: "/store/" + this.$store.state.store.account,
        show_prev: true
      };
      this.$store.state.meta.title =
        this.product.name + " - " + this.$store.state.store.name;
      this.$store.state.meta.describe = this.product.describe;
    },
    init_spec_check() {
      for (let i in this.product.spec) {
        let obj = this.product.spec[i].content;
        for (let j in obj) {
          obj[j].check = false;
        }
      }
    },
    copyURLtoClipboard() {
      var dummy = document.createElement("input"),
        text = window.location.href;

      document.body.appendChild(dummy);
      dummy.value = text;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      this.$store.commit("set_alert", {
        type: "success",
        text: "網址已複製:" + window.location.href
      });
    },
    add() {
      this.number += 1;
    },
    subtract() {
      if (this.number <= 1) return;
      this.number -= 1;
    },
    add_cart() {
      let select_spec_obj = [];
      for (let i in this.product.spec) {
        if (this.product.spec[i].select_name === undefined) {
          this.$store.commit("set_alert", {
            type: "warning",
            text: this.product.spec[i].name + " 尚未選取"
          });
          return;
        } else {
          select_spec_obj.push({
            key: this.product.spec[i].name,
            name: this.product.spec[i].select_name
          });
        }
      }
      let obj = {
        id: this.product.id,
        store_id: this.product.store_id,
        name: this.product.name,
        spec: select_spec_obj,
        price: this.product.price,
        spec_price: this.product.spec_price,
        number: this.number,
        thumbnail: this.product.thumbnail
      };
      this.$store.dispatch("set_cart", obj);
    }
  },
  watch: {
    "$route.params.product_id": function() {
      if (this.$route.params.product_id !== undefined) {
        this.getProduct();
      }
    },
    user: function(to, from) {
      if (to) {
        if (this.$route.params.product_id === undefined) {
          //組件在背後快取時，在別的網址，會出現的狀況
          return;
        }
        this.getProduct();
      } else {
        delete this.product.like_id;
        delete this.product.bookmark_id;
        this.product = Object.assign({}, this.product);
      }
    }
  }
};
</script>
