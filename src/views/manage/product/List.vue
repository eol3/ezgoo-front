<template>
  <div>
    <h3>產品管理</h3>
    <b-row>
      <b-col cols="12" md="2" class="mb-3">
        <b-button class="ml-2" variant="primary" @click="add()">
          新增產品
        </b-button>
      </b-col>
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
            <button class="btn btn-primary" type="button" @click="search">
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
    <!--<div v-for="(item, key) in product" :key="key">-->
    <!--  <img :src="item.image_url" width="100" class="mx-2 my-2" />-->
    <!--  {{ item.name }}-->
    <!--</div>-->
    <b-table
      striped
      stacked="md"
      hover
      :items="product"
      :fields="fields"
      :busy="isBusy"
      show-empty
    >
      <template v-slot:cell(thumbnail)="data">
        <router-link
          :to="
            '/store/' +
              $route.params.id +
              '/manage/product/preview/' +
              data.item.id
          "
        >
          <img :src="data.value" width="100" class="mx-2 my-2" />
        </router-link>
      </template>
      <template v-slot:cell(name)="data">
        <router-link
          :to="
            '/store/' +
              $route.params.id +
              '/manage/product/preview/' +
              data.item.id
          "
        >
          {{ data.item.name }}
        </router-link>
      </template>
      <template v-slot:cell(action)="data">
        <button
          :disabled="data.index === 0"
          @click="changePriority(data.item, data.index, 'up')"
          class="btn btn-sm btn-outline-success my-1"
        >
          up
        </button>
        <button
          :disabled="data.index === product.length - 1"
          @click="changePriority(data.item, data.index, 'down')"
          class="btn btn-sm btn-outline-success my-1"
        >
          down
        </button>
        <button
          @click="edit(data.item.id)"
          class="btn btn-sm btn-outline-success my-1"
        >
          edit
        </button>
        <button
          @click="deleteProduct(data.item)"
          class="btn btn-sm btn-outline-danger my-1"
        >
          delete
        </button>
      </template>
      <template v-slot:cell(status)="data">
        <b-form-checkbox
          :disabled="disabled_switch"
          v-model="data.item.status"
          name="check-button"
          switch
          @change="changeStatus(data.item)"
        >
        </b-form-checkbox>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>
      <template v-slot:empty>
        <p class="mt-2 text-center">尚無商品</p>
      </template>
    </b-table>
    <b-pagination
      v-model="currentPage"
      :total-rows="totalRows"
      :per-page="perPage"
      @change="change_page"
      aria-controls="my-table"
    ></b-pagination>
    <select-class
      :all_class="all_class"
      @select_class="select_class"
    ></select-class>
  </div>
</template>

<script>
import SelectClass from "@/components/SelectClass.vue";

export default {
  name: "Product",
  components: {
    SelectClass
  },
  data() {
    return {
      fields: ["id", "thumbnail", "name", "status", "action"],
      product: [],
      all_class: [],
      selected_class_str: "",
      search_str: "",
      class_ids: "",
      currentPage: 1,
      totalRows: 0,
      perPage: 10,
      isBusy: false,
      disabled_switch: false
    };
  },
  created() {
    if (!this.$store.state.permissions.product.write) {
      this.fields = ["id", "thumbnail", "name", "status"];
      this.disabled_switch = true;
    }
    this.axios
      .get("/api/class/?store_account=" + this.$route.params.id)
      .then(response => {
        this.all_class = response.data;
        if (this.$route.query.class !== undefined) {
          let class_ids = this.$route.query.class.split("-");
          for (let i in this.all_class) {
            if (class_ids.indexOf(this.all_class[i].id.toString()) >= 0) {
              this.all_class[i].checked = true;
              this.selected_class_str += this.all_class[i].name + ",";
            }
          }
          this.selected_class_str = this.selected_class_str.substr(
            0,
            this.selected_class_str.length - 1
          );
        }
      });
    if (this.$route.query.class !== undefined) {
      this.class_ids = this.$route.query.class;
    }
    if (this.$route.query.q !== undefined) {
      this.search_str = this.$route.query.q;
    }
    if (this.$route.query.page !== undefined) {
      this.totalRows = parseInt(this.$route.query.page) * this.perPage;
      this.currentPage = parseInt(this.$route.query.page);
    }
    this.getList();
  },
  methods: {
    change_page(page) {
      this.currentPage = page;
      this.getList();
      this.$router.push({
        query: Object.assign({}, this.$route.query, { page: this.currentPage })
      });
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
      this.$router.push({
        query: Object.assign({}, this.$route.query, { class: this.class_ids })
      });
      this.getList();
    },
    search() {
      if (this.search_str === "") {
        let query = Object.assign({}, this.$route.query);
        delete query.q;
        this.$router.push({ query: query });
      } else {
        this.$router.push({
          query: Object.assign({}, this.$route.query, { q: this.search_str })
        });
      }
      this.getList();
    },
    clear() {
      this.selected_class_str = "";
      this.class_ids = "";
      this.search_str = "";
      this.$router.push({ query: {} });
      this.getList();
    },
    add() {
      this.$store.commit("set_prev_url", this.$route.fullPath);
      this.$router.push("product/new");
    },
    edit(id) {
      this.$store.commit("set_prev_url", this.$route.fullPath);
      this.$router.push("product/edit/" + id);
    },
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
          for (let i in response.data.data) {
            response.data.data[i].status =
              response.data.data[i].status === 1 ? true : false;
          }
          this.product = response.data.data;
          this.totalRows = response.data.total;
          this.$store.commit("set_prev_url", this.$route.fullPath);
          this.isBusy = false;
        });
    },
    changeStatus(item) {
      item.status = !item.status;
      this.axios
        .put(
          "/api/product/" +
            item.id +
            "/status?store_id=" +
            this.$store.state.store.id,
          {
            status: item.status
          }
        )
        .then(response => {});
    },
    deleteProduct(item) {
      if (!confirm("確認刪除?")) return;
      this.isBusy = true;
      this.axios
        .put(
          "/api/product/" +
            item.id +
            "/delete?store_id=" +
            this.$store.state.store.id
        )
        .then(response => {
          for (let i in this.product) {
            if (this.product[i].id === item.id) {
              this.product.splice(i, 1);
            }
          }
          this.isBusy = false;
        });
    },
    async changePriority(item, index, action) {
      let tmpObj = {};
      let targetKey = 0;
      if (action === "up") {
        targetKey = index - 1;
      } else {
        targetKey = index + 1;
      }
      let tmpPriority = this.product[targetKey].priority;
      this.product[targetKey].priority = this.product[index].priority;
      this.product[index].priority = tmpPriority;
      await this.axios.put(
        "/api/product/priority?store_id=" + this.$store.state.store.id,
        {
          productions: [
            {
              id: this.product[index].id,
              priority: this.product[index].priority
            },
            {
              id: this.product[targetKey].id,
              priority: this.product[targetKey].priority
            }
          ]
        }
      );
      tmpObj = this.product[targetKey];
      this.product[targetKey] = this.product[index];
      this.product.splice(index, 1, tmpObj);
    }
  },
  watch: {
    // currentPage(to, from) {
    //   if (this.backPage) {
    //     console.log("backPage");
    //     console.log(from);
    //     console.log(to);
    //   } else {
    //     this.$router.push({
    //       query: Object.assign({}, this.$route.query, { page: this.currentPage })
    //     });
    //     this.getList();
    //   }
    // }
  }
};
</script>
