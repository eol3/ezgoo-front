<template>
  <div>
    <h3>人員設定</h3>
    <br />
    <b-row>
      <b-col cols="12" md="4" class="mb-3">
        <b-form-input
          type="text"
          placeholder="帳號/手機號碼/E-mail"
          v-model="new_user"
        ></b-form-input>
      </b-col>
      <b-col cols="12" md="2" class="mb-3">
        <select class="form-control" v-model="role_val">
          <option value="0">{{ role[0] }}</option>
          <option value="1">{{ role[1] }}</option>
        </select>
      </b-col>
      <b-col cols="12" md="2" class="mb-3">
        <b-button class="ml-2" variant="primary" @click="add()">
          新增人員
        </b-button>
      </b-col>
    </b-row>
    <hr />
    <b-table
      striped
      hover
      md="6"
      :items="items"
      :fields="fields"
      :busy="isBusy"
    >
      <template v-slot:cell(action)="data">
        <button
          @click="del(data.item)"
          class="btn btn-sm btn-outline-danger my-1"
        >
          del
        </button>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      new_user: "",
      role_val: 0,
      role: ["editor", "picker"],
      fields: ["name", "account", "role", "action"],
      items: [],
      isBusy: true
    };
  },
  created() {
    this.axios
      .get("/api/store/" + this.$store.state.store.id + "/user?group=manage")
      .then(response => {
        this.items = response.data.data;
        console.log(this.items);
        this.isBusy = false;
      });
  },
  methods: {
    add() {
      this.isBusy = true;
      this.axios
        .put("/api/store/" + this.$store.state.store.id + "/user", {
          user: this.new_user,
          role: this.role[this.role_val]
        })
        .then(response => {
          this.items = response.data.data;
          this.isBusy = false;
          this.$store.commit("set_alert", {
            type: "success",
            text: "新增成功"
          });
        })
        .catch(error => {
          this.isBusy = false;
        });
    },
    del(item) {
      if (item.role === "owner") {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "無法刪除擁有者"
        });
        return;
      }
      this.isBusy = true;
      this.axios
        .delete("/api/store/" + this.$store.state.store.id + "/user", {
          data: {
            user_id: item.id
          }
        })
        .then(response => {
          this.items = response.data.data;
          this.isBusy = false;
          this.$store.commit("set_alert", {
            type: "success",
            text: "刪除成功"
          });
        });
    }
  }
};
</script>
