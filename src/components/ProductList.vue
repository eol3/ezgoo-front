<template>
  <div>
    <b-row v-if="product !== null">
      <b-col
        cols="6"
        md="4"
        lg="3"
        v-for="(item, key) in product"
        :key="key"
        style="padding-right: 6px; padding-left: 6px;"
      >
        <div class="card mb-3">
          <img
            @click="go_product(item)"
            :src="item.thumbnail"
            class="card-img-top"
          />
          <div class="card-body">
            <div class="mb-1" @click="go_product(item)">
              {{ item.name }}
            </div>
            <div class="mb-1 text-right">
              <template v-if="item.spec_price === 0">
                <b>${{ item.price }}</b>
              </template>
              <template v-else>
                <span style="text-decoration:line-through;">
                  <b>${{ item.price }}</b>
                </span>
                <span style="color:red">
                  <b>${{ item.spec_price }}</b>
                </span>
              </template>
            </div>
            <div
              v-if="!short_mode"
              class="row p-1"
              style="border-radius: 8px;background-color:#F7F7F7;"
            >
              <div
                class="col-4 text-center"
                style="border-right:3px solid #fff;"
              >
                <like-button :item="item"></like-button>
              </div>
              <!-- <div class="col-4 text-center">
                <bookmark-button :item="item"></bookmark-button>
              </div> -->
              <div class="col-8 text-center pointer" @click="add_cart(item)">
                <img
                  width="24"
                  src="@/assets/shopping-cart.png"
                  style="cursor: pointer;"
                />
              </div>
            </div>
          </div>
        </div>
      </b-col>
    </b-row>
    <b-row v-else>
      <b-col cols="12" md="4" lg="3">
        <div class="card">
          <img src="@/assets/no-image-sm.webp" class="card-img-top" />
          <div class="card-body">
            ...
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import LikeButton from "@/components/LikeButton.vue";
// import BookmarkButton from "@/components/BookmarkButton.vue";

export default {
  props: ["short_mode", "product"],
  components: {
    LikeButton
  },
  data() {
    return {
      disable: false
    };
  },
  created() {},
  methods: {
    add_cart(item) {
      if (item.spec !== null) {
        if (typeof item.spec === "string") {
          item.spec = JSON.parse(item.spec);
        }
        this.$store.commit("set_select_spec_product", item);
        this.$bvModal.show("modal-select-spec-to-cart");
        return;
      }
      let obj = {
        id: item.id,
        name: item.name,
        price: item.price,
        spec_price: item.spec_price,
        number: 1,
        thumbnail: item.thumbnail
      };
      this.$store.dispatch("set_cart", obj);
    },
    go_product(item) {
      this.$router.push({
        name: "productItem",
        params: {
          product_id: item.id,
          product_item: item
        }
      });
    }
  }
};
</script>

<style scoped>
.card:hover {
  cursor: pointer;
}
</style>
