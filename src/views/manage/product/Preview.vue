<template>
  <div>
    <h3>產品管理 - 編輯產品</h3>
    <b-form-group label="商品圖片:" label-cols-sm="2">
      <Uploader mode="preview" :init_imgs="init_imgs"></Uploader>
    </b-form-group>
    <b-form-group label="商品分類:" label-cols-sm="2">
      <div class="my-2">
        {{ selected_class_str }}
      </div>
    </b-form-group>
    <b-form-group label="商品規格:" label-cols-sm="2">
      <div class="my-2" v-for="(item, key) in product.spec" :key="key">
        {{ item.name }}:
        <span v-for="(sub_item, sub_key) in item.content" :key="sub_key">
          {{ sub_item.name }},
        </span>
      </div>
    </b-form-group>
    <b-form-group label="商品標題:" label-cols-sm="2">
      <div class="my-2">{{ product.name }}</div>
    </b-form-group>
    <b-form-group label="商品價格:" label-cols-sm="2">
      <div class="my-2">{{ product.price }}</div>
    </b-form-group>
    <b-form-group label="商品描述:" label-cols-sm="2">
      <div class="my-2">{{ product.describe }}</div>
    </b-form-group>
    <b-button class="ml-1" @click="$router.push($store.state.prev_url)">
      返回
    </b-button>
  </div>
</template>

<script>
import Uploader from "@/components/Uploader.vue";

export default {
  name: "EditProduct",
  components: {
    Uploader
  },
  data() {
    return {
      store: {},
      product: {},
      init_imgs: [],
      preview_imgs: [],
      delete_imgs: [],
      new_button_loading: false,
      selected_class_str: "",
      selected_spec_str: "",
      all_class: []
    };
  },
  async created() {
    let response = await this.axios.get(
      "/api/class/?store_id=" + this.$store.state.store.id
    );
    this.all_class = response.data;
    response = await this.axios.get(
      "/api/product/" +
        this.$route.params.product_id +
        "/manage/?store_id=" +
        this.$store.state.store.id
    );
    this.product = response.data.product;
    for (let i in response.data.product_image) {
      this.init_imgs.push(response.data.product_image[i]);
      this.preview_imgs.push(response.data.product_image[i]);
    }
    this.select_class(this.product.classes);
    if (this.$store.state.prev_url === "") {
      this.$store.commit(
        "set_prev_url",
        "/store/" + this.$route.params.id + "/manage/product"
      );
    }
  },
  methods: {
    select_class(items) {
      this.product.classes = items;
      this.selected_class_str = "";
      for (let i in this.product.classes) {
        this.selected_class_str += this.product.classes[i].name + ",";
      }
      this.selected_class_str = this.selected_class_str.substr(
        0,
        this.selected_class_str.length - 1
      );
    },
    select_spec(obj) {
      this.product.spec = obj;
    }
  }
};
</script>
