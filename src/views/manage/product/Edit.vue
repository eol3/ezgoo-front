<template>
  <div>
    <h3>產品管理 - 編輯產品</h3>
    <b-form-group label="商品圖片:" label-cols-sm="2">
      <Uploader
        :init_imgs="init_imgs"
        @change-img="get_img"
        @delete-img="delete_img"
      ></Uploader>
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
        設定規格
      </b-button>
      <b-button
        v-if="product.spec !== undefined && product.spec.length !== 0"
        class="ml-2"
        @click="clear_spec"
      >
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
      @click="save()"
    >
      <b-spinner
        small
        v-show="new_button_loading"
        variant="primary"
        label="Spinning"
      ></b-spinner>
      確定修改
    </b-button>
    <b-button class="ml-1" @click="$router.push($store.state.prev_url)">
      取消
    </b-button>
    <br /><br />
    <select-class
      :all_class="all_class"
      @select_class="select_class"
    ></select-class>
    <spec @select_spec="select_spec" :init_spec="product.spec"></spec>
  </div>
</template>

<script>
import Uploader from "@/components/Uploader.vue";
import SelectClass from "@/components/SelectClass.vue";
import Spec from "@/components/Specification.vue";

export default {
  name: "EditProduct",
  components: {
    Uploader,
    SelectClass,
    Spec
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
    for (let i in this.all_class) {
      this.all_class[i].checked = false;
      for (let j in this.product.classes) {
        if (this.all_class[i].id === this.product.classes[j].id) {
          this.all_class[i].checked = true;
          break;
        }
      }
    }
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
      if (obj.length === 0) this.$delete(this.product, "spec");
      else {
        this.$set(this.product, "spec", obj);
      }
    },
    async save() {
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
        if (this.preview_imgs[i].file !== undefined) {
          formdata.append("images", this.preview_imgs[i].file);
          delete this.preview_imgs[i].url;
        }
      }
      formdata.append("product_delete_image", JSON.stringify(this.delete_imgs));
      formdata.append("product_image", JSON.stringify(this.preview_imgs));
      formdata.append("product", JSON.stringify(this.product));
      try {
        await this.axios({
          method: "put",
          url:
            "/api/product/" +
            this.$route.params.product_id +
            "?store_id=" +
            this.$store.state.store.id,
          data: formdata,
          config: { headers: { "Content-Type": "multipart/form-data" } }
        });
      } catch (error) {
        return;
      }
      this.$store.commit("set_alert", {
        type: "success",
        text: "修改成功"
      });
      this.$router.push(this.$store.state.prev_url);
    },
    get_img(img) {
      this.preview_imgs = img;
      console.log(this.preview_imgs);
    },
    delete_img(img) {
      this.delete_imgs.push(img);
      console.log(this.delete_imgs);
    },
    clear_class() {
      this.selected_class_str = "";
      this.product.classes = [];
      for (let i in this.all_class) {
        this.all_class[i].checked = false;
      }
    },
    clear_spec() {
      this.$delete(this.product, "spec");
    }
  }
  // beforeRouteLeave (to, from, next) {
  //   if (to.query.login) {
  //     next({ path: "/store/" + this.$route.params.id + "/manage/product"})
  //   } else {
  //     next()
  //   }
  // }
};
</script>
