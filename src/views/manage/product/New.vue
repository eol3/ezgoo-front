<template>
  <div>
    <h3>產品管理 - 新增產品</h3>
    <b-form-group label="商品圖片:" label-cols-sm="2">
      <Uploader @change-img="get_img"></Uploader>
    </b-form-group>
    <b-form-group label="商品分類:" label-cols-sm="2">
      <div class="my-2">
        {{ selected_class_str }}
      </div>
      <b-button variant="success" v-b-modal.modal-select-class>
        選擇分類
      </b-button>
      <b-button
        v-if="selected_class_str != ''"
        class="ml-2"
        @click="clear_class"
      >
        清除分類
      </b-button>
    </b-form-group>
    <b-form-group label="商品規格:" label-cols-sm="2">
      <div class="my-2" v-for="(item, key) in product.spec" :key="key">
        {{ item.name }}:
        <span v-for="(sub_item, sub_key) in item.content" :key="sub_key">
          {{ sub_item.name }},
        </span>
      </div>
      <b-button variant="success" v-b-modal.modal-select-spec>
        選擇規格
      </b-button>
      <b-button v-if="selected_spec_str != ''" class="ml-2" @click="clear_spec">
        清除規格
      </b-button>
    </b-form-group>
    <b-form-group label="商品標題:" label-cols-sm="2">
      <b-form-input
        class="col-md-6"
        type="text"
        v-model="product.name"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="商品價格:" label-cols-sm="2">
      <b-form-input
        class="col-md-3 col-6"
        type="number"
        v-model="product.price"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="商品描述:" label-cols-sm="2">
      <b-form-textarea
        class="col-md-6"
        v-model="product.describe"
        placeholder="Enter something..."
        rows="3"
        max-rows="6"
      ></b-form-textarea>
    </b-form-group>
    <b-button
      class="ml-1"
      :disabled="new_button_loading"
      variant="outline-primary"
      @click="add()"
    >
      <b-spinner
        small
        v-show="new_button_loading"
        variant="primary"
        label="Spinning"
      ></b-spinner>
      確定新增
    </b-button>
    <b-button class="ml-1" @click="$router.push($store.state.prev_url)">
      取消
    </b-button>
    <br /><br />
    <select-class
      :all_class="all_class"
      @select_class="select_class"
    ></select-class>
    <spec @select_spec="select_spec"></spec>
  </div>
</template>

<script>
import Uploader from "@/components/Uploader.vue";
import SelectClass from "@/components/SelectClass.vue";
import Spec from "@/components/Specification.vue";

export default {
  name: "Product",
  components: {
    Uploader,
    SelectClass,
    Spec
  },
  data() {
    return {
      store: {},
      product: {},
      preview_imgs: [],
      new_button_loading: false,
      selected_class_str: "",
      selected_spec_str: "",
      all_class: []
    };
  },
  async created() {
    let response = await this.axios.get(
      "/api/class/manage/?store_id=" + this.$store.state.store.id
    );
    for (let i in response.data) {
      response.data[i].checked = false;
    }
    this.all_class = response.data;
  },
  methods: {
    select_class(items) {
      this.selected_class_str = "";
      for (let i in items) {
        this.selected_class_str += items[i].name.toString() + ",";
      }
      this.selected_class_str = this.selected_class_str.substr(
        0,
        this.selected_class_str.length - 1
      );
      this.product.classes = items;
      //this.pro.selected_class = items;
    },
    select_spec(obj) {
      this.product.spec = obj;
    },
    async add() {
      if (this.product.name === undefined || this.product.name === "") {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "必須輸入商品名稱"
        });
        return;
      }
      this.new_button_loading = true;
      let formdata = new FormData();
      for (let i in this.preview_imgs) {
        formdata.append("images", this.preview_imgs[i].file);
      }
      formdata.append("product", JSON.stringify(this.product));
      try {
        await this.axios({
          method: "post",
          url: "/api/product/?store_id=" + this.$store.state.store.id,
          data: formdata,
          config: { headers: { "Content-Type": "multipart/form-data" } }
        });
      } catch (error) {
        return;
      }
      this.$store.commit("set_alert", {
        type: "success",
        text: "新增成功"
      });
      this.$router.push("/store/" + this.$route.params.id + "/manage/product");
    },
    get_img(img) {
      this.preview_imgs = img;
    },
    clear_class() {
      this.selected_class_str = "";
      this.product.classes = [];
    },
    clear_spec() {
      this.$delete(this.product, "spec");
    }
  }
};
</script>
