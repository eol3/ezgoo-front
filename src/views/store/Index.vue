<template>
  <div>
    <!-- <div class="row" v-if="$store.state.store !== null">
      <div class="col-12 col-md-10 offset-md-1">
        <h4 class="mb-3">關於我們</h4>
        <div class="row">
          <div class="col-12" v-if="$store.state.store.about !== ''">
            <b-card>
              <b-card-text>
                {{ $store.state.store.about }}
              </b-card-text>
            </b-card>
          </div>
        </div>
        <div class="row">
          <div class="col-12 mt-3 text-center">
            <router-link :to="'/store/' + $route.params.id + '/about'">
              查看更多
            </router-link>
          </div>
        </div>
        <hr />
      </div>
    </div> -->

    <div class="row" v-if="post !== null && post.length !== 0">
      <div class="col-12 col-md-10 offset-md-1">
        <h4 class="mb-3">最新消息</h4>
        <post-list :post="post"></post-list>
        <div class="row">
          <div class="col-12 mt-3 text-center">
            <router-link :to="'/store/' + $route.params.id + '/post'">
              查看更多
            </router-link>
          </div>
        </div>
        <hr />
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-10 offset-md-1">
        <h4 class="mb-3">最新上架</h4>
        <product-list :product="product"></product-list>
        <div class="row">
          <div class="col-12 mt-3 text-center">
            <router-link to="" @click.native="go_product">
              查看更多
            </router-link>
          </div>
        </div>
        <hr />
      </div>
    </div>
    <br /><br />
  </div>
</template>

<script>
import ProductList from "@/components/ProductList.vue";
import PostList from "@/components/PostList.vue";

export default {
  components: {
    ProductList,
    PostList
  },
  data() {
    return {
      post: null,
      product: null
    };
  },
  // computed: {
  //   change_store() {
  //     return this.$store.state.change_store;
  //   }
  // },
  async created() {
    // await this.$store.dispatch("get_store", { store_account: this.$route.params.id });
    this.getList();
  },
  methods: {
    getList() {
      this.axios
        .get("/api/post", {
          params: {
            store_id: this.$store.state.store.id,
            limit: 8,
            page: 1
          }
        })
        .then(response => {
          this.post = response.data.data;
        });
      let obj = {
        store_id: this.$store.state.store.id,
        limit: 8,
        page: 1
      };
      if (this.$store.state.user !== null) {
        obj.user_id = this.$store.state.user.id;
      }
      this.axios
        .get("/api/product", {
          params: obj
        })
        .then(response => {
          this.product = response.data.data;
        });
    },
    go_product() {
      this.$router.push({
        name: "product",
        params: {
          id: this.$route.params.id,
          product: this.product
        }
      });
    }
  }
  // watch: {
  //   change_store: function(to, from) {
  //     console.log("aaa")
  //     this.getList();
  //     this.$store.state.change_store = false;
  //   }
  // }
};
</script>
