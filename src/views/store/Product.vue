<template>
  <div>
    <b-row>
      <b-col cols="12" md="4" class="mb-3">
        <b-button
          variant="success"
          size="sm"
          class="mobile-show"
          v-b-modal.modal-select-class
        >
          選擇分類
        </b-button>
        <span v-if="selected_class_str !== ''" class="ml-2 mobile-show">
          已選擇分類：
          {{ selected_class_str }}
        </span>
        <h4 class="mobile-hide">分類</h4>
      </b-col>
      <b-col cols="12" md="4" class="mb-3">
        <div class="input-group">
          <input type="text" class="form-control" v-model="search_str" />
          <div class="input-group-append">
            <button class="btn btn-primary" type="button" @click="search">
              搜尋
            </button>
          </div>
        </div>
      </b-col>
      <b-col cols="3" md="1" class="px-0">
        <b-button v-if="show_clear" @click="clear" variant="link" size="sm">
          清除查詢
        </b-button>
      </b-col>
      <b-col cols="9" md="3" class="mb-3 text-right">
        <span
          class="px-1 pt-1 pb-2 mx-2"
          @click="spec_price"
          v-if="$route.query.spec_price !== undefined"
          style="border-radius: 8px;background-color:Coral;border:1px solid Coral;cursor: pointer;"
        >
          促銷商品
        </span>
        <span
          class="px-1 pt-1 pb-2 mx-2"
          @click="spec_price"
          v-else
          style="border-radius: 8px;border:1px solid Coral;cursor: pointer;"
        >
          促銷商品
        </span>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="2" class="mobile-hide">
        <class-side-bar
          :all_class="all_class"
          :set_parent_id="set_parent_id"
          @select_class="select_class"
        ></class-side-bar>
      </b-col>
      <b-col md="10">
        <product-list :product="product"></product-list>
      </b-col>
    </b-row>
    <div class="text-center my-3">
      <button v-if="show_more" class="btn btn-link" @click="more">
        查看更多
      </button>
    </div>
    <select-class
      :all_class="all_class"
      @select_class="select_class"
    ></select-class>
  </div>
</template>

<script>
import SelectClass from "@/components/SelectClass.vue";
import ClassSideBar from "@/components/classSideBar.vue";
import ProductList from "@/components/ProductList.vue";

export default {
  name: "product",
  components: {
    SelectClass,
    ClassSideBar,
    ProductList
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
    // store() {
    //   return this.$store.state.store;
    // }
  },
  data() {
    return {
      product: [],
      selected_class_str: "",
      children_class_ids: "",
      search_str: "",
      all_class: [],
      page: 1,
      show_more: true,
      show_clear: false,
      set_parent_id: null
    };
  },
  async created() {
    // if (this.$store.state.store === null) {
    //   await this.$store.dispatch("get_store", { store_account: this.$route.params.id });
    // }
    this.init_product();
  },
  methods: {
    init_product() {
      this.axios
        .get("/api/class/?store_id=" + this.$store.state.store.id)
        .then(response => {
          this.all_class = response.data;
          if (this.$route.query.class !== undefined) {
            this.prepare_class();
            this.getList(false);
          }
        });
      if (this.$route.query.class === undefined) {
        this.getList(false);
      }
    },
    prepare_class() {
      this.selected_class_str = "";
      this.children_class_ids = "";
      let class_ids = this.$route.query.class.split("-");
      for (let i in this.all_class) {
        if (class_ids.indexOf(this.all_class[i].id.toString()) >= 0) {
          this.set_parent_id = this.all_class[i].parent_id;
          this.all_class[i].checked = true;
          this.selected_class_str += this.all_class[i].name + ",";
          if (this.all_class[i].children !== null) {
            this.children_class_ids += this.all_class[i].children + "-";
          }
        } else {
          this.all_class[i].checked = false;
        }
      }
      this.selected_class_str = this.selected_class_str.substr(
        0,
        this.selected_class_str.length - 1
      );
      this.children_class_ids = this.children_class_ids.substr(
        0,
        this.children_class_ids.length - 1
      );
    },
    spec_price() {
      this.set_parent_id = null;
      let query = Object.assign({}, this.$route.query);
      if (query.spec_price === undefined) {
        query.spec_price = 1;
      } else {
        delete query.spec_price;
      }
      this.$router.push({ query: query }).catch(err => {});
      return;
    },
    select_class(items) {
      this.selected_class_str = "";
      let class_ids = "";
      this.children_class_ids = "";
      if (items.length === 0) {
        this.set_parent_id = null;
        let query = Object.assign({}, this.$route.query);
        delete query.class;
        this.$router.push({ query: query }).catch(err => {});
        // this.page = 1;
        // this.show_more = true;
        // this.getList(false);
        return;
      }
      this.set_parent_id = items[0].parent_id;
      for (let i in items) {
        this.selected_class_str += items[i].name + ",";
        class_ids += items[i].id + "-";
        this.children_class_ids += items[i].children + "-";
      }
      this.selected_class_str = this.selected_class_str.substr(
        0,
        this.selected_class_str.length - 1
      );
      this.children_class_ids = this.children_class_ids.substr(
        0,
        this.children_class_ids.length - 1
      );
      class_ids = class_ids.substr(0, class_ids.length - 1);
      this.$router.push({
        query: Object.assign({}, this.$route.query, { class: class_ids })
      });
      //this.getList(false);
    },
    search() {
      if (this.search_str === "") {
        let query = Object.assign({}, this.$route.query);
        delete query.q;
        this.$router.push({ query: query });
      } else {
        this.$router.push({
          query: Object.assign({}, this.$route.query, { q: this.search_str })
        });
      }
      //this.getList(false);
    },
    more() {
      this.page += 1;
      this.getList(true);
    },
    getList(add_mode) {
      if (this.$route.params.product !== undefined) {
        this.product = Object.assign([], this.$route.params.product);
        add_mode = true;
        this.page = 2;
      }
      let obj = {
        limit: 8,
        page: this.page
      };
      obj.store_id = this.$store.state.store.id;
      if (this.$store.state.user !== null) {
        obj.user_id = this.$store.state.user.id;
      }
      if (this.$route.query.class !== undefined) {
        this.show_clear = true;
        obj.class = this.$route.query.class;
        if (this.children_class_ids !== "") {
          obj.class += "-" + this.children_class_ids;
        }
      } else {
        this.init_class();
      }
      if (this.$route.query.q !== undefined) {
        this.show_clear = true;
        this.search_str = this.$route.query.q;
        obj.q = this.$route.query.q;
      } else {
        this.search_str = "";
      }
      if (
        this.$route.query.class === undefined &&
        this.$route.query.q === undefined
      ) {
        this.show_clear = false;
      }
      if (this.$route.query.spec_price !== undefined) {
        obj.spec_price = 1;
      }
      this.axios
        .get("/api/product", {
          params: obj
        })
        .then(response => {
          // for (let i in response.data.data) {
          //   if (response.data.data[i].spec !== null) {
          //     response.data.data[i].spec = JSON.parse(
          //       response.data.data[i].spec
          //     );
          //   }
          // }
          if (add_mode) {
            this.product.push(...response.data.data);
          } else {
            this.product = response.data.data;
            //this.product = Object.assign({}, response.data.data);
          }
          if (this.product.length >= response.data.total) {
            this.show_more = false;
          }
        });
    },
    clear() {
      this.$router.push({ query: {} }).catch(err => {});
    },
    init_class() {
      this.selected_class_str = "";
      for (let i in this.all_class) {
        this.all_class[i].checked = false;
      }
      this.all_class.splice(0, 0);
      this.set_parent_id = null;
    }
  },
  watch: {
    $route: function(to, from) {
      // console.log(to.query.length)
      // if (!this.show_clear) return;
      if (from.name === "cart") return;
      if (from.name === "productItem") return;
      if (to.name !== "product") return;
      if (this.$route.query.class !== undefined) {
        this.prepare_class();
      }
      this.page = 1;
      this.show_more = true;
      this.getList(false);
    },
    user: function(to, from) {
      if (to) {
        this.getList(false);
      } else {
        for (let i in this.product) {
          delete this.product[i].like_id;
          delete this.product[i].bookmark_id;
          this.product[i] = Object.assign({}, this.product[i]);
        }
        this.product.splice(0, 0);
      }
    }
    // store: function(to, from) {
    //   if (to !== false) {
    //     this.init_product();
    //     this.getList(false);
    //   }
    // }
  }
};
</script>
