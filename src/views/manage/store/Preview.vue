<template>
  <div>
    <h3>商店資訊</h3>
    <b-form-group label="封面圖片:" label-cols-sm="2">
      <Uploader mode="preview" :init_imgs="init_imgs"></Uploader>
    </b-form-group>
    <b-form-group label="商店大頭貼:" label-cols-sm="2">
      <avatar
        :mode="'preview'"
        :init_img="init_avatar_img"
        @change-img="get_avatar_img"
      ></avatar>
    </b-form-group>
    <b-form-group label="商店名稱:" label-cols-sm="2">
      <div class="col-md-6">
        {{ store.name }}
      </div>
    </b-form-group>
    <b-form-group label="商店公告:" label-cols-sm="2">
      <div class="col-md-6">
        {{ store.announcement }}
      </div>
    </b-form-group>
    <b-form-group label="電話:" label-cols-sm="2">
      <div class="col-md-6">
        {{ store.tel }}
      </div>
    </b-form-group>
    <b-form-group label="地址:" label-cols-sm="2">
      <div class="col-md-6">
        {{ store.address }}
      </div>
    </b-form-group>
    <b-form-group label="關於:" label-cols-sm="2">
      <div class="col-md-6">
        {{ store.about }}
      </div>
    </b-form-group>
    <b-form-group label="Line:" label-cols-sm="2">
      <div class="col-md-6">
        {{ store.line_url }}
      </div>
    </b-form-group>
    <b-form-group label="Facebook:" label-cols-sm="2">
      <div class="col-md-6">
        {{ store.fb_url }}
      </div>
    </b-form-group>
    <b-form-group label="Instagram:" label-cols-sm="2">
      <div class="col-md-6">
        {{ store.ig_url }}
      </div>
    </b-form-group>
    <b-button
      class="ml-1"
      @click="$router.push('/store/' + $route.params.id + '/manage/')"
    >
      返回
    </b-button>
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
        store_id: this.$route.params.id,
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
