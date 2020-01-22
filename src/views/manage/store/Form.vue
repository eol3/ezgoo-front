<template>
  <div>
    <h3>商店資訊</h3>
    <b-form-group label="封面圖片:" label-cols-sm="2">
      <Uploader
        :limit="5"
        :init_imgs="init_imgs"
        @change-img="get_img"
        @delete-img="delete_img"
      ></Uploader>
    </b-form-group>
    <b-form-group label="商店大頭貼:" label-cols-sm="2">
      <avatar :init_img="init_avatar_img" @change-img="get_avatar_img"></avatar>
    </b-form-group>
    <b-form-group label="商店名稱:" label-cols-sm="2">
      <b-form-input
        class="col-md-6"
        type="text"
        v-model="store.name"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="商店公告:" label-cols-sm="2">
      <b-form-textarea
        class="col-md-6"
        v-model="store.announcement"
        rows="3"
        max-rows="6"
      ></b-form-textarea>
    </b-form-group>
    <b-form-group label="電話:" label-cols-sm="2">
      <b-form-input
        class="col-md-6"
        type="text"
        v-model="store.tel"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="地址:" label-cols-sm="2">
      <b-form-input
        class="col-md-6"
        type="text"
        v-model="store.address"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="關於:" label-cols-sm="2">
      <b-form-textarea
        class="col-md-6"
        v-model="store.about"
        rows="3"
        max-rows="6"
      ></b-form-textarea>
    </b-form-group>
    <b-form-group label="Line:" label-cols-sm="2">
      <b-form-input
        class="col-md-6"
        type="text"
        v-model="store.line_url"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Facebook:" label-cols-sm="2">
      <b-form-input
        class="col-md-6"
        type="text"
        v-model="store.fb_url"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Instagram:" label-cols-sm="2">
      <b-form-input
        class="col-md-6"
        type="text"
        v-model="store.ig_url"
      ></b-form-input>
    </b-form-group>
    <button
      :disabled="button_loading"
      @click="save()"
      class="btn btn-outline-success my-1"
    >
      <b-spinner
        small
        v-show="button_loading"
        variant="success"
        label="Spinning"
      ></b-spinner>
      save
    </button>
    <b-button
      class="ml-1"
      @click="$router.push('/store/' + $route.params.id + '/manage/')"
    >
      返回
    </b-button>
    <br /><br />
  </div>
</template>

<script>
import Uploader from "@/components/Uploader.vue";
import Avatar from "@/components/Avatar.vue";

export default {
  name: "StoreInfo",
  components: {
    Uploader,
    Avatar
  },
  data() {
    return {
      store: {},
      button_loading: false,
      init_imgs: [],
      preview_imgs: [],
      delete_imgs: [],
      init_avatar_img: {},
      preview_avatar_img: {}
    };
  },
  async created() {
    let response = await this.axios.get(
      "/api/store/" + this.$store.state.store.account
    );
    this.store = response.data;
    this.init_imgs = this.store.images;
    this.preview_avatar_img = this.store.avatar;
    this.init_avatar_img = this.store.avatar;
  },
  methods: {
    async save() {
      this.button_loading = true;
      let avatar_formdata = new FormData();
      let set_avatar = false;
      if (this.preview_avatar_img !== undefined) {
        if (this.preview_avatar_img.file !== undefined) {
          avatar_formdata.append("avatar", this.preview_avatar_img.file);
          delete this.preview_avatar_img.url;
          set_avatar = true;
        } else if (this.preview_avatar_img.url === "") {
          set_avatar = true;
        }
      }
      if (set_avatar) {
        await this.axios({
          method: "put",
          url: "/api/store/" + this.$store.state.store.id + "/avatar",
          data: avatar_formdata,
          config: { headers: { "Content-Type": "multipart/form-data" } }
        });
      }
      let store = {
        name: this.store.name,
        announcement: this.store.announcement,
        tel: this.store.tel,
        address: this.store.address,
        about: this.store.about,
        line_url: this.store.line_url,
        fb_url: this.store.fb_url,
        ig_url: this.store.ig_url
      };
      let formdata = new FormData();
      for (let i in this.preview_imgs) {
        if (this.preview_imgs[i].file !== undefined) {
          formdata.append("images", this.preview_imgs[i].file);
          delete this.preview_imgs[i].url;
        }
      }
      formdata.append("store_delete_image", JSON.stringify(this.delete_imgs));
      formdata.append("store_image", JSON.stringify(this.preview_imgs));
      formdata.append("store", JSON.stringify(store));
      try {
        await this.axios({
          method: "put",
          url: "/api/store/" + this.$store.state.store.id,
          data: formdata,
          config: { headers: { "Content-Type": "multipart/form-data" } }
        });
      } catch (error) {
        return;
      }
      await this.$store.dispatch("get_store", {
        store_account: this.$route.params.id,
        force: true
      });
      this.button_loading = false;
      this.$store.commit("set_alert", {
        type: "success",
        text: "修改成功"
      });
      this.$router.push("/store/" + this.$route.params.id + "/manage/");
    },
    get_img(img) {
      this.preview_imgs = img;
    },
    delete_img(img) {
      this.delete_imgs.push(img);
    },
    get_avatar_img(img) {
      this.preview_avatar_img = img;
    }
  }
};
</script>
