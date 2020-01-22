<template>
  <div>
    <h4>貼文管理</h4>
    <b-button class="ml-1" variant="primary" @click="add()">
      新增貼文
    </b-button>
    <b-table
      striped
      stacked="md"
      hover
      :items="post"
      :fields="fields"
      :busy="isBusy"
      show-empty
    >
      <template v-slot:cell(image_url)="data">
        <img :src="data.value" width="100" class="mx-2 my-2" />
      </template>
      <template v-slot:cell(status)="data">
        <b-form-checkbox
          v-model="data.item.status"
          name="check-button"
          switch
          @change="changeStatus(data.item)"
        >
        </b-form-checkbox>
      </template>
      <template v-slot:cell(top)="data">
        <b-form-checkbox
          v-model="data.item.top"
          name="check-button"
          switch
          @change="changeTop(data.item)"
        >
        </b-form-checkbox>
      </template>
      <template v-slot:cell(action)="data">
        <button
          @click="edit(data.item.id)"
          class="btn btn-sm btn-outline-success my-1"
        >
          edit
        </button>
        <button
          @click="deletePost(data.item)"
          class="btn btn-sm btn-outline-danger my-1"
        >
          delete
        </button>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>
      <template v-slot:empty>
        <p class="mt-2 text-center">尚無貼文</p>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "PostList",
  data() {
    return {
      fields: ["id", "image_url", "content", "top", "status", "action"],
      post: [],
      currentPage: 1,
      totalRows: 0,
      perPage: 10,
      isBusy: false
    };
  },
  created() {
    this.getList(1);
  },
  methods: {
    add() {
      this.$router.push("/store/" + this.$route.params.id + "/manage/post/new");
    },
    edit(id) {
      this.$router.push(
        "/store/" + this.$route.params.id + "/manage/post/edit/" + id
      );
    },
    getList(val) {
      this.isBusy = true;
      this.axios
        .get("/api/post/manage", {
          params: {
            store_id: this.$store.state.store.id,
            limit: this.perPage,
            page: val
          }
        })
        .then(response => {
          console.log(response.data);
          for (let i in response.data.data) {
            response.data.data[i].status =
              response.data.data[i].status === 1 ? true : false;
            response.data.data[i].top =
              response.data.data[i].top === 1 ? true : false;
          }
          this.post = response.data.data;
          this.totalRows = response.data.total;
          this.isBusy = false;
        });
    },
    changeStatus(item) {
      item.status = !item.status;
      this.axios
        .put(
          "/api/post/" +
            item.id +
            "/status?store_id=" +
            this.$store.state.store.id,
          {
            status: item.status
          }
        )
        .then(response => {});
    },
    changeTop(item) {
      item.top = !item.top;
      this.axios
        .put(
          "/api/post/" +
            item.id +
            "/top?store_id=" +
            this.$store.state.store.id,
          {
            top: item.top
          }
        )
        .then(response => {});
    },
    deletePost(item) {
      if (!confirm("確認刪除?")) return;
      console.log(item);
      this.isBusy = true;
      this.axios
        .put(
          "/api/post/" +
            item.id +
            "/delete?store_id=" +
            this.$store.state.store.id
        )
        .then(response => {
          for (let i in this.post) {
            if (this.post[i].id === item.id) {
              this.post.splice(i, 1);
            }
          }
          this.isBusy = false;
        });
    }
  }
};
</script>
