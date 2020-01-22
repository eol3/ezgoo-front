<template>
  <div>
    <h3>貼文管理 - {{ title }}</h3>
    <b-form-group label="貼文圖片:" label-cols-sm="2">
      <Uploader
        :init_imgs="init_imgs"
        @change-img="get_img"
        @delete-img="delete_img"
      ></Uploader>
    </b-form-group>
    <b-form-group label="貼文內容:" label-cols-sm="2">
      <b-form-textarea
        class="col-md-6"
        v-model="post.content"
        placeholder="Enter something..."
        rows="3"
        max-rows="6"
      ></b-form-textarea>
    </b-form-group>
    <b-button
      class="ml-1"
      :disabled="button_loading"
      variant="outline-primary"
      @click="save()"
    >
      <b-spinner
        small
        v-show="button_loading"
        variant="primary"
        label="Spinning"
      ></b-spinner>
      確定{{ btn_text }}
    </b-button>
    <b-button
      class="ml-1"
      @click="$router.push('/store/' + $route.params.id + '/manage/post')"
    >
      取消
    </b-button>
    <br /><br />
  </div>
</template>

<script>
import Uploader from "@/components/Uploader.vue";

export default {
  components: {
    Uploader
  },
  data() {
    return {
      title: "",
      type: "",
      btn_text: "",
      button_loading: false,
      post: {},
      init_imgs: [],
      preview_imgs: [],
      delete_imgs: []
    };
  },
  async created() {
    if (this.$route.params.post_id !== undefined) {
      this.title = "編輯貼文";
      this.type = "edit";
      this.btn_text = "修改";
      let response = await this.axios.get(
        "/api/post/" +
          this.$route.params.post_id +
          "/manage/?store_id=" +
          this.$store.state.store.id
      );
      this.post = response.data.post;
      for (let i in response.data.post_image) {
        this.init_imgs.push(response.data.post_image[i]);
        this.preview_imgs.push(response.data.post_image[i]);
      }
    } else {
      this.title = "新增貼文";
      this.type = "add";
      this.btn_text = "新增";
    }
  },
  methods: {
    async save() {
      this.button_loading = true;
      let formdata = new FormData();
      for (let i in this.preview_imgs) {
        if (this.preview_imgs[i].file !== undefined) {
          formdata.append("images", this.preview_imgs[i].file);
          delete this.preview_imgs[i].url;
        }
      }
      if (this.type == "edit") {
        formdata.append("post_delete_image", JSON.stringify(this.delete_imgs));
        formdata.append("post_image", JSON.stringify(this.preview_imgs));
      }
      formdata.append("post", JSON.stringify(this.post));
      if (this.type == "add") {
        try {
          await this.axios({
            method: "post",
            url: "/api/post/?store_id=" + this.$store.state.store.id,
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
      } else {
        try {
          await this.axios({
            method: "put",
            url:
              "/api/post/" +
              this.$route.params.post_id +
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
      }
      this.$router.push("/store/" + this.$route.params.id + "/manage/post");
    },
    get_img(img) {
      this.preview_imgs = img;
      console.log(this.preview_imgs);
    },
    delete_img(img) {
      this.delete_imgs.push(img);
      console.log(this.delete_imgs);
    }
  }
};
</script>
