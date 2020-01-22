<template>
  <div v-if="user !== false">
    <b-card>
      <b-card-text>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">大頭貼:</label>
          <div class="col-12 col-md-8">
            <avatar
              :init_img="init_avatar_img"
              @change-img="get_avatar_img"
            ></avatar>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">帳號:</label>
          <div class="col-12 col-md-4 pt-2">
            <input
              type="text"
              name="account"
              class="form-control"
              v-model="user.account"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">修改密碼:</label>
          <div class="col-12 col-md-4 pt-2">
            <input
              type="password"
              name="modify-password"
              class="form-control"
              v-model="user.password"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">再次確認密碼:</label>
          <div class="col-12 col-md-4 pt-2">
            <input
              type="password"
              name="check-password"
              class="form-control"
              v-model="user.check_password"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">姓名:</label>
          <div class="col-12 col-md-4">
            <input
              type="text"
              name="name"
              class="form-control"
              v-model="user.name"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">暱稱:</label>
          <div class="col-12 col-md-4">
            <input
              type="text"
              name="nick-name"
              class="form-control"
              v-model="user.nickname"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">手機:</label>
          <div class="col-12 col-md-4">
            <input
              type="text"
              name="phone"
              class="form-control"
              v-model="user.phone"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">E-mail:</label>
          <div class="col-12 col-md-6">
            <input
              type="text"
              name="email"
              class="form-control"
              v-model="user.email"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">室內電話:</label>
          <div class="col-12 col-md-4">
            <input type="text" class="form-control" v-model="user.tel" />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-12 col-md-2 col-form-label">地址:</label>
          <div class="col-12 col-md-6">
            <input
              type="text"
              name="ship-address"
              class="form-control"
              v-model="user.address"
            />
          </div>
        </div>
      </b-card-text>
      <button
        class="btn btn-outline-primary"
        @click="save"
        :disabled="button_loading"
      >
        <b-spinner
          small
          v-show="button_loading"
          variant="primary"
          label="Spinning"
        ></b-spinner>
        儲存
      </button>
    </b-card>
    <br /><br />
  </div>
</template>

<script>
import Avatar from "@/components/Avatar.vue";

export default {
  components: {
    Avatar
  },
  data() {
    return {
      user: false,
      button_loading: false,
      init_avatar_img: {},
      preview_avatar_img: {}
    };
  },
  computed: {
    state_user() {
      return this.$store.state.user;
    }
  },
  created() {
    if (this.$store.state.user !== null && this.$store.state.user !== false) {
      this.getProfile();
    }
  },
  methods: {
    getProfile() {
      this.axios
        .get("/api/user/" + this.$store.state.user.id)
        .then(response => {
          this.user = response.data;
          this.init_avatar_img = this.user.avatar;
          this.preview_avatar_img = this.user.avatar;
          delete this.user.create_at;
          delete this.user.update_at;
          delete this.user.avatar;
        });
    },
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
        let response = await this.axios({
          method: "put",
          url: "/api/user/" + this.$store.state.user.id + "/avatar",
          data: avatar_formdata,
          config: { headers: { "Content-Type": "multipart/form-data" } }
        });
        this.button_loading = false;
        if (response.data) {
          this.$store.state.user.avatar_url = response.data.avatar_url;
        } else {
          this.$store.state.user.avatar_url = "";
        }
      }
      if (this.user.account.indexOf("/") >= 0) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "帳號不能使用/符號"
        });
        this.button_loading = false;
        return;
      }
      if (this.user.password !== undefined && this.user.password !== "") {
        if (this.user.password !== this.user.check_password) {
          this.$store.commit("set_alert", {
            type: "warning",
            text: "密碼確認錯誤"
          });
          this.button_loading = false;
          return;
        }
      }
      let response = {};
      try {
        response = await this.axios.put(
          "/api/user/" + this.$store.state.user.id,
          this.user
        );
      } catch {
        this.button_loading = false;
        return;
        // this.getProfile();
      }
      // console.log(response.data)
      this.user = response.data;
      delete this.user.create_at;
      delete this.user.update_at;
      delete this.user.avatar;
      this.$store.state.user.nickname = this.user.nickname;
      if (this.user.account === "") {
        this.$store.state.user.account = this.user.id;
      } else {
        this.$store.state.user.account = this.user.account;
      }
      this.$store.commit("set_alert", {
        type: "success",
        text: "儲存成功"
      });
      this.button_loading = false;
    },
    get_avatar_img(img) {
      this.preview_avatar_img = img;
      console.log(this.preview_avatar_img);
    }
  },
  watch: {
    state_user: function(to, from) {
      if (to) {
        this.getProfile();
        console.log("get profile");
      } else {
        console.log("nothing");
      }
    }
  }
};
</script>
