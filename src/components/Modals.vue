<template>
  <div>
    <b-modal id="modal-login" title="登入" centered no-stacking>
      <b-form-group label-cols="4" label-cols-lg="2" label="帳號">
        <b-form-input
          type="text"
          v-model="account"
          placeholder="E-mail/手機號碼/帳號"
        ></b-form-input>
      </b-form-group>
      <b-form-group label-cols="4" label-cols-lg="2" label="密碼">
        <b-form-input
          type="password"
          name="password"
          v-model="password"
        ></b-form-input>
      </b-form-group>
      <p class="text-center">
        沒有帳號？<b-link v-b-modal.modal-register>點此註冊</b-link>
      </p>
      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <div class="mr-auto ml-auto">
          <b-button class="mr-1" @click="cancel()">
            取消
          </b-button>
          <b-button class="ml-1" variant="primary" @click="login()">
            登入
          </b-button>
        </div>
      </template>
    </b-modal>
    <b-modal id="modal-register" title="註冊" centered no-stacking>
      <!-- <b-form-group label-cols="4" label-cols-lg="2" label="帳號">
        <b-form-input
          type="text"
          name="account"
          v-model="account"
        ></b-form-input>
      </b-form-group> -->
      <b-form-group label-cols="4" label-cols-lg="2" label="手機號碼">
        <b-form-input type="text" name="phone" v-model="phone"></b-form-input>
      </b-form-group>
      <b-form-group label-cols="4" label-cols-lg="2" label="E-mail">
        <b-form-input type="email" name="email" v-model="email"></b-form-input>
      </b-form-group>
      <b-form-group label-cols="4" label-cols-lg="2" label="密碼">
        <b-form-input
          type="password"
          name="password"
          v-model="password"
        ></b-form-input>
      </b-form-group>
      <b-form-group label-cols="4" label-cols-lg="2" label="確認密碼">
        <b-form-input
          type="password"
          name="check-password"
          v-model="check_password"
        ></b-form-input>
      </b-form-group>
      <p class="text-center">
        已有帳號？<b-link v-b-modal.modal-login>點此登入</b-link>
      </p>
      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <div class="mr-auto ml-auto">
          <b-button class="mr-1" @click="cancel()">
            取消
          </b-button>
          <b-button class="ml-1" variant="primary" @click="register()">
            註冊
          </b-button>
        </div>
      </template>
    </b-modal>
    <b-modal
      id="modal-tip"
      size="sm"
      :title="tip.title"
      ok-only
      @ok="click_ok"
      centered
      no-stacking
    >
      <p class="my-1">{{ tip.msg }}</p>
    </b-modal>
    <b-alert
      class="alert-fixed text-center"
      :show="$store.state.alert.show"
      dismissible
      fade
      :variant="$store.state.alert.type"
      @dismiss-count-down="countDownChanged"
      @dismissed="clearAlert"
    >
      {{ $store.state.alert.text }}
    </b-alert>
    <b-modal id="modal-select-spec-to-cart" title="" no-stacking>
      <div class="row">
        <div class="col-5">
          <img width="100%" :src="$store.state.select_spec_product.thumbnail" />
        </div>
        <div class="col-7">
          {{ $store.state.select_spec_product.name }}<br />
          價格:{{ $store.state.select_spec_product.price }}
        </div>
      </div>
      <div
        class="row"
        v-for="(item, key) in $store.state.select_spec_product.spec"
        :key="key"
      >
        <div class="col-3 col-md-2 text-center">
          {{ item.name }}
        </div>
        <div class="col-9 col-md-10">
          <div
            class="form-check form-check-inline"
            v-for="(sub_item, sub_key) in item.content"
            :key="sub_key"
          >
            <input
              class="form-check-input"
              :name="key"
              type="radio"
              :id="sub_item.name"
              :value="sub_item.name"
              v-model="item.select_name"
            />
            <label class="form-check-label" :for="sub_item.name">
              {{ sub_item.name }}
            </label>
          </div>
        </div>
      </div>
      <template slot="modal-footer">
        <div class="mr-auto ml-auto">
          <b-button class="ml-1" variant="primary" @click="add_cart()">
            加入購物車
          </b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: {
    msg: String
  },
  inject: ["reload"],
  data() {
    return {
      account: "",
      phone: "",
      email: "",
      password: "",
      check_password: "",
      tip: {
        title: "提示",
        msg: "",
        refresh: false
      },
      dismissCountDown: 0,
      callBackModal: false
    };
  },
  methods: {
    login() {
      this.callBackModal = "modal-login";
      if (this.account === "" || this.password === "") {
        this.tip.msg = "必須輸入，不能空白";
        this.$bvModal.show("modal-tip");
        return;
      }
      let url = "/api/user/login";
      if (this.$route.params.id !== undefined) {
        url += "/?store_account=" + this.$route.params.id;
      } else if (this.$store.state.store !== null) {
        url += "/?store_account=" + this.$store.state.store.account;
      }
      this.axios
        .post(url, {
          account: this.account,
          password: this.password
        })
        .then(async response => {
          await this.$store.dispatch("set_user", response.data.user);
          this.$store.dispatch("reset_cart", JSON.parse(response.data.cart));
          this.$store.commit("set_alert", {
            show: 3,
            type: "success",
            text: response.data.msg
          });
          this.$bvModal.hide("modal-login");
          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect).catch(err => {});
          }
          //this.reload();
        })
        .catch(error => {
          console.log(error);
          this.tip.msg = error.response.data.msg;
          this.$bvModal.show("modal-tip");
        });
    },
    register() {
      this.callBackModal = "modal-register";
      if (this.phone.indexOf("/") >= 0 || this.email.indexOf("/") >= 0) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "不能使用/符號"
        });
        return;
      }
      if (
        this.email !== "" &&
        (this.email.indexOf("@") < 0 || this.email.indexOf(".") < 0)
      ) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "信箱格式錯誤"
        });
        return;
      }
      if (this.phone === "" && this.email === "") {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "帳號、手機號碼、E-mail必須輸入一項"
        });
        return;
      }
      if (this.password === "" || this.check_password === "") {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "密碼不能空白"
        });
        return;
      }
      if (this.password !== this.check_password) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "密碼確認失敗"
        });
        return;
      }
      if (this.password.length < 6) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "密碼必須超過6碼"
        });
        return;
      }
      this.axios
        .post("/api/user/register", {
          account: this.account,
          phone: this.phone,
          email: this.email,
          password: this.password,
          cart: JSON.stringify(this.$store.state.cart)
        })
        .then(response => {
          this.$store.dispatch("set_user", response.data.user);
          console.log(this.$store.state.user);
          this.$store.commit("set_alert", {
            show: 3,
            type: "success",
            text: response.data.msg
          });
          this.$bvModal.hide("modal-register");
          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect);
          }
          //this.reload();
        })
        .catch(error => {
          this.tip.msg = error.response.data.msg;
          this.$bvModal.show("modal-tip");
        });
    },
    click_ok() {
      if (this.callBackModal) {
        this.$bvModal.show(this.callBackModal);
      }
    },
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    clearAlert() {
      this.dismissCountDown = 0;
      this.$store.commit("set_alert", {
        show: 0,
        type: "",
        text: ""
      });
    },
    add_cart() {
      let select_spec_obj = [];
      let product = this.$store.state.select_spec_product;
      for (let i in product.spec) {
        if (product.spec[i].select_name === undefined) {
          this.$store.commit("set_alert", {
            type: "warning",
            text: product.spec[i].name + " 尚未選取"
          });
          return;
        } else {
          select_spec_obj.push({
            key: product.spec[i].name,
            name: product.spec[i].select_name
          });
        }
      }
      let obj = {
        id: product.id,
        name: product.name,
        spec: select_spec_obj,
        price: product.price,
        spec_price: product.spec_price,
        number: 1,
        thumbnail: product.thumbnail
      };
      this.$store.dispatch("set_cart", obj);
      this.$bvModal.hide("modal-select-spec-to-cart");
    }
  }
};
</script>
