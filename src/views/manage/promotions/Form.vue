<template>
  <div>
    <h3>優惠活動管理 - {{ mode === "new" ? "新增" : "編輯" }}優惠活動</h3>
    <br />
    <b-form-group label="優惠名稱:" label-cols="4" label-cols-md="2">
      <input
        type="text"
        class="form-control col-md-4 col-6"
        v-model="promotions.name"
      />
    </b-form-group>
    <b-form-group label="開始日期:" label-cols="4" label-cols-md="2">
      <datetime
        :auto="true"
        :format="'yyyy/MM/dd'"
        :value-zone="'Asia/Taipei'"
        :zone="'Asia/Taipei'"
        input-class="form-control col-md-4 col-6"
        v-model="promotions.start_at"
      ></datetime>
    </b-form-group>
    <b-form-group label="結束日期:" label-cols="4" label-cols-md="2">
      <datetime
        :auto="true"
        :format="'yyyy/MM/dd'"
        :value-zone="'Asia/Taipei'"
        :zone="'Asia/Taipei'"
        input-class="form-control col-md-4 col-6"
        v-model="promotions.expire_at"
      ></datetime>
    </b-form-group>
    <b-form-group label="優惠類型:" label-cols="4" label-cols-md="2">
      <select class="form-control col-md-3 col-6" v-model="promotions.type">
        <option value="1">一般促銷</option>
        <option value="2">組合優惠(未開放)</option>
        <option value="3">首次下單(未開放)</option>
      </select>
    </b-form-group>
    <b-form-group label="描述:" label-cols="4" label-cols-md="2">
      <textarea
        class="form-control col-md-4 col-8"
        v-model="promotions.describe"
      ></textarea>
    </b-form-group>
    <br />
    <h4>選擇商品</h4>
    <b-row class="my-3" v-if="product.length === 0">
      商店尚無商品，請至「<router-link
        :to="'/store/' + $route.params.id + '/manage/product'"
        >商品管理</router-link
      >」新增商品
    </b-row>
    <template v-else>
      <b-row>
        <b-col cols="12" md="4" class="mb-3">
          <b-button variant="success" size="sm" v-b-modal.modal-select-class>
            選擇分類
          </b-button>
          <span v-if="selected_class_str !== ''" class="mr-2">
            已選擇分類：
            {{ selected_class_str }}
          </span>
        </b-col>
        <b-col cols="12" md="4" class="mb-3">
          <div class="input-group">
            <input type="text" class="form-control" v-model="search_str" />
            <div class="input-group-append">
              <button class="btn btn-info" type="button" @click="search">
                搜尋
              </button>
            </div>
          </div>
        </b-col>
        <b-col cols="6" md="2">
          <b-button @click="clear" variant="link" size="sm">
            清除查詢
          </b-button>
        </b-col>
      </b-row>
      <b-row class="select-product-area horizontal-row">
        <b-col
          class="mb-2"
          cols="6"
          md="3"
          v-for="(item, key) in product"
          :key="key"
        >
          <div
            :class="['select-item', 'pointer', { 'selected-item': item.check }]"
            @click="select(item)"
          >
            <center><img width="80%" :src="item.thumbnail" /><br /></center>
            {{ item.name }}<br />
            <div class="text-right">價格:{{ item.price }}</div>
            <div
              :class="[
                { 'selected-area': item.check },
                'select-area',
                'text-center'
              ]"
            >
              <input type="checkbox" v-model="item.check" />
            </div>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          @change="change_page"
          aria-controls="my-table"
        ></b-pagination>
      </b-row>
    </template>
    <br />
    <h4>已選擇商品</h4>
    <b-row class="select-product-area horizontal-row">
      <template v-if="selected_product.length === 0">
        <b-col cols="6" md="3">
          <div class="m-4">
            尚未選擇商品
          </div>
        </b-col>
      </template>
      <template v-else>
        <b-col
          class="mb-2"
          cols="6"
          md="3"
          v-for="(item, key) in selected_product"
          :key="key"
        >
          <div class="select-item pointer">
            <center><img width="80%" :src="item.thumbnail" /><br /></center>
            {{ item.name }}<br />
            <div class="text-right">價格:{{ item.price }}</div>
            <div class="select-area text-center p-2">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">特價</span>
                </div>
                <input
                  type="number"
                  class="form-control"
                  v-model="item.spec_price"
                />
              </div>
              <button @click="del(key)" class="btn btn-sm btn-danger">
                刪除
              </button>
            </div>
          </div>
        </b-col>
      </template>
    </b-row>
    <br />
    <b-row class="m-4">
      <b-button
        class="ml-1"
        :disabled="isBusy"
        variant="outline-primary"
        @click="save()"
      >
        <b-spinner
          small
          v-show="isBusy"
          variant="primary"
          label="Spinning"
        ></b-spinner>
        {{ mode === "new" ? "確定新增" : "確定修改" }}
      </b-button>
      <b-button class="ml-1" @click="$router.go(-1)">
        取消
      </b-button>
    </b-row>
    <br /><br />
    <select-class
      :all_class="all_class"
      @select_class="select_class"
    ></select-class>
  </div>
</template>

<script>
import SelectClass from "@/components/SelectClass.vue";
import { Datetime } from "vue-datetime";
import moment from "moment";
import "vue-datetime/dist/vue-datetime.css";

export default {
  components: {
    SelectClass,
    Datetime
  },
  data() {
    return {
      mode: "new",
      promotions: {
        name: "",
        type: 1,
        describe: "",
        start_at: "",
        expire_at: ""
      },
      product: [],
      selected_product: [],
      all_class: [],
      class_ids: "",
      selected_class_str: "",
      search_str: "",
      currentPage: 1,
      totalRows: 0,
      perPage: 10,
      isBusy: false
    };
  },
  created() {
    if (this.$route.params.prom_id !== undefined) {
      this.mode = "edit";
      this.axios
        .get(
          "/api/promotions/" +
            this.$route.params.prom_id +
            "/manage/?store_id=" +
            this.$store.state.store.id
        )
        .then(response => {
          this.promotions = response.data;
          this.promotions.start_at = moment(this.promotions.start_at).format();
          this.promotions.expire_at = moment(
            this.promotions.expire_at
          ).format();
          this.selected_product = JSON.parse(response.data.content);
        });
    }
    this.axios
      .get("/api/class/?store_account=" + this.$route.params.id)
      .then(response => {
        this.all_class = response.data;
      });
    this.getList();
  },
  methods: {
    getList() {
      this.isBusy = true;
      let obj = {
        store_id: this.$store.state.store.id,
        limit: this.perPage,
        page: this.currentPage
      };
      if (this.class_ids !== "") {
        obj.class = this.class_ids;
      }
      if (this.search_str !== "") {
        obj.q = this.search_str;
      }
      this.axios
        .get("/api/product/manage", {
          params: obj
        })
        .then(response => {
          this.product = response.data.data;
          this.init_check();
          this.totalRows = response.data.total;
          this.isBusy = false;
        });
    },
    init_check() {
      for (let i in this.product) {
        this.product[i].check = false;
      }
      if (this.selected_product.length !== 0) {
        for (let i in this.product) {
          for (let j in this.selected_product) {
            if (this.product[i].id === this.selected_product[j].id) {
              this.product[i].check = true;
              break;
            }
          }
        }
      }
    },
    select_class(items) {
      this.selected_class_str = "";
      this.class_ids = "";
      for (let i in items) {
        this.selected_class_str += items[i].name + ",";
        this.class_ids += items[i].id + "-";
      }
      this.selected_class_str = this.selected_class_str.substr(
        0,
        this.selected_class_str.length - 1
      );
      this.class_ids = this.class_ids.substr(0, this.class_ids.length - 1);
      this.getList();
    },
    change_page(page) {
      this.currentPage = page;
      this.getList();
    },
    search() {
      this.getList();
    },
    clear() {
      this.selected_class_str = "";
      this.class_ids = "";
      this.search_str = "";
      this.getList();
    },
    select(item) {
      item.check = !item.check;
      if (item.check) {
        let check = false;
        for (let i in this.selected_product) {
          if (this.selected_product[i].id === item.id) {
            check = true;
            this.selected_product.splice(i, 1, item);
          }
        }
        if (!check) this.selected_product.unshift(item);
      } else {
        for (let i in this.selected_product) {
          if (this.selected_product[i].id === item.id) {
            this.selected_product.splice(i, 1);
          }
        }
      }
    },
    save() {
      let obj = [];
      for (let i in this.selected_product) {
        obj.push({
          id: this.selected_product[i].id,
          name: this.selected_product[i].name,
          thumbnail: this.selected_product[i].thumbnail,
          price: this.selected_product[i].price,
          spec_price: this.selected_product[i].spec_price
        });
      }
      this.promotions.content = JSON.stringify(obj);
      if (this.mode === "new") {
        this.axios
          .post(
            "/api/promotions/?store_id=" + this.$store.state.store.id,
            this.promotions
          )
          .then(response => {
            this.$store.commit("set_alert", {
              type: "success",
              text: "新增成功"
            });
            this.$router.push(
              "/store/" + this.$route.params.id + "/manage/promotions/"
            );
          });
      } else {
        this.axios
          .put(
            "/api/promotions/" +
              this.$route.params.prom_id +
              "/?store_id=" +
              this.$store.state.store.id,
            this.promotions
          )
          .then(response => {
            this.$store.commit("set_alert", {
              type: "success",
              text: "修改成功"
            });
            this.$router.push(
              "/store/" + this.$route.params.id + "/manage/promotions/"
            );
          });
      }
    },
    del(index) {
      this.selected_product.splice(index, 1);
    }
  }
};
</script>

<style>
.select-product-area {
  background-color: #fff;
}
.select-item {
  border: 2px solid #f5f5f5;
  border-radius: 5px;
}
.select-area {
  background-color: #f5f5f5;
}
.selected-item {
  border-color: #28a745;
}
.selected-area {
  background-color: #28a745;
}
</style>
