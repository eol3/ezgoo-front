<template>
  <div>
    <h4>訂單管理</h4>
    <b-row>
      <div class="col-3">
        <b-form-group label="開始日期:" label-cols="5">
          <datetime
            name="start_at"
            :auto="true"
            :format="'yyyy/MM/dd'"
            :value-zone="'Asia/Taipei'"
            :zone="'Asia/Taipei'"
            input-class="form-control"
            v-model="start_at"
          ></datetime>
        </b-form-group>
      </div>
      <div class="col-3">
        <b-form-group label="結束日期:" label-cols="5">
          <datetime
            name="end_at"
            :auto="true"
            :format="'yyyy/MM/dd'"
            :value-zone="'Asia/Taipei'"
            :zone="'Asia/Taipei'"
            input-class="form-control"
            v-model="end_at"
          ></datetime>
        </b-form-group>
      </div>
    </b-row>
    <b-row>
      <div class="col-3">
        <b-form-group label="訂單狀態:" label-cols="5">
          <select class="form-control" v-model="select_status_val">
            <option value="all">全部</option>
            <option
              v-for="(item, key) in $store.state.order_status.store"
              :key="key"
              :value="key"
              >{{ item }}</option
            >
          </select>
        </b-form-group>
      </div>
      <div class="col-4">
        <b-form-group label="使用者:" label-cols="3">
          <input
            type="text"
            class="form-control"
            v-model="search_user"
            placeholder="E-mail/手機號碼/帳號"
          />
        </b-form-group>
      </div>
      <div class="col-3">
        <button @click="search()" class="btn btn-primary">搜尋</button>
      </div>
    </b-row>
    <div class="custom-control custom-checkbox">
      <input
        type="checkbox"
        class="custom-control-input"
        id="customCheck1"
        v-model="break_by_product"
      />
      <label class="custom-control-label" for="customCheck1">撿貨模式</label>
    </div>
    <b-table
      striped
      stacked="md"
      hover
      :items="order"
      :fields="fields"
      :busy="isBusy"
      show-empty
    >
      <template v-slot:cell(item_image)="data">
        <img :src="data.value" width="100" class="mx-2 my-2" />
      </template>
      <template v-slot:cell(create_at)="data">
        {{ data.item.create_at | moment("YYYY/MM/DD HH:mm") }}
      </template>
      <template v-slot:cell(status)="data">
        {{ $store.state.order_status.store[data.item.status] }}
      </template>
      <template v-slot:cell(action)="data">
        <template v-if="allow_write">
          <button
            @click="edit(data.item.id)"
            class="btn btn-sm btn-outline-success my-1"
          >
            edit
          </button>
        </template>
        <template v-else>
          <button
            @click="preview(data.item.id)"
            class="btn btn-sm btn-outline-success my-1"
          >
            查看訂單
          </button>
        </template>
        <template v-if="$store.state.user.role === 'owner'">
          <button
            @click="deleteProduct(data.item)"
            class="btn btn-sm btn-outline-danger my-1"
          >
            delete
          </button>
        </template>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>
      <template v-slot:empty>
        <p class="mt-2 text-center">尚無訂單</p>
      </template>
    </b-table>
  </div>
</template>

<script>
import { Datetime } from "vue-datetime";
import moment from "moment";
import "vue-datetime/dist/vue-datetime.css";

export default {
  name: "OrderList",
  components: {
    Datetime
  },
  data() {
    return {
      fields: ["id", "status", "create_at"],
      order: [],
      currentPage: 1,
      totalRows: 0,
      perPage: 10,
      isBusy: false,
      break_by_product: false,
      allow_write: false,
      start_at: "",
      end_at: "",
      select_status_val: 1,
      search_user: ""
    };
  },
  created() {
    if (this.$store.state.permissions.order.write) {
      this.allow_write = true;
    }
    if (this.$route.query.start_at !== undefined) {
      this.start_at = moment(this.$route.query.start_at).format();
    } else {
      this.start_at = moment()
        .add(-7, "days")
        .format();
    }
    if (this.$route.query.end_at !== undefined) {
      this.end_at = moment(this.$route.query.end_at).format();
    } else {
      this.end_at = moment().format();
    }
    if (this.$route.query.status !== undefined) {
      this.select_status_val = this.$route.query.status;
    }
    if (this.$route.query.user !== undefined) {
      this.search_user = this.$route.query.user;
    }
    this.getList(1);
  },
  methods: {
    edit(id) {
      this.$router.push(
        "/store/" + this.$route.params.id + "/manage/order/edit/" + id
      );
    },
    search() {
      this.$router.push({
        query: {
          start_at: moment(this.start_at).format("YYYY-M-D"),
          end_at: moment(this.end_at).format("YYYY-M-D"),
          status: this.select_status_val,
          user: this.search_user
        }
      });
      this.getList(1);
    },
    getList(val) {
      let obj = {
        user: this.search_user,
        store_id: this.$store.state.store.id,
        start_at: moment(this.start_at).format("YYYY-M-D"),
        end_at: moment(this.end_at).format("YYYY-M-D"),
        status: this.select_status_val,
        limit: this.perPage,
        page: val
      };
      if (this.select_status_val === "all") {
        delete obj.status;
      }
      this.isBusy = true;
      this.axios
        .get("/api/order/manage", {
          params: obj
        })
        .then(response => {
          this.order = response.data.data;
          this.totalRows = response.data.total;
          this.fields = ["id", "status", "create_at", "action"];
          this.$store.commit("set_prev_url", this.$route.fullPath);
          this.isBusy = false;
        });
    },
    preview(id) {
      this.$router.push(
        "/store/" + this.$route.params.id + "/manage/order/preview/" + id
      );
    }
  },
  watch: {
    break_by_product() {
      if (this.break_by_product) {
        this.axios
          .get("/api/order/manage", {
            params: {
              break_by: 1,
              store_id: this.$store.state.store.id,
              start_at: moment(this.start_at).format("YYYY-M-D"),
              end_at: moment(this.end_at).format("YYYY-M-D"),
              limit: this.perPage,
              page: 1
            }
          })
          .then(response => {
            this.order = response.data;
            this.totalRows = this.order.length;
            this.fields = ["id", "item_name", "number"];
            this.isBusy = false;
          });
      } else {
        this.getList(1);
      }
    }
  }
};
</script>
