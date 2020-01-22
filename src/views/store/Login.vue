<template>
  <div>
    <b-row class="justify-content-md-center mt-2">
      <b-col col md="6">
        <h3>登入</h3>
        <b-form-group label-cols="12" label="E-mail">
          <b-form-input
            type="email"
            name="email"
            v-model="email"
          ></b-form-input>
        </b-form-group>
        <b-form-group label-cols="12" label="密碼">
          <b-form-input
            type="password"
            name="password"
            v-model="password"
          ></b-form-input>
        </b-form-group>
        <div class="mr-auto ml-auto">
          <b-button class="mr-1" @click="cancel()">
            取消
          </b-button>
          <b-button class="ml-1" variant="primary" @click="login()">
            登入
          </b-button>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    login() {
      this.callBackModal = "modal-login";
      if (this.email === "" || this.password === "") {
        this.tip.msg = "必須輸入，不能空白";
        this.$bvModal.show("modal-tip");
        return;
      }
      this.axios
        .post("/api/user/login", {
          email: this.email,
          password: this.password
        })
        .then(response => {
          this.$store.dispatch("set_user", response.data.user);
          this.$store.commit("set_alert", {
            show: 3,
            type: "success",
            text: response.data.msg
          });
          this.$bvModal.hide("modal-login");
          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect).catch(err => {});
          } else {
            this.$router
              .push("/store/" + this.$route.params.id)
              .catch(err => {});
          }
          //this.reload();
        })
        .catch(error => {
          this.tip.msg = error.response.data.msg;
          this.$bvModal.show("modal-tip");
        });
    }
  }
};
</script>
