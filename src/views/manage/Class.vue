<template>
  <div>
    <h4>產品分類管理</h4>
    <b-row>
      <b-col cols="12" md="8">
        <b-breadcrumb :items="b_items"></b-breadcrumb>
        <b-form inline class="mb-2">
          <b-button v-if="class_id !== null" class="mr-2" @click="back()">
            返回上一層
          </b-button>
          <template v-if="allow_write">
            <b-form-input
              id="inline-form-input-name"
              class="mb-2 mr-sm-2 mb-sm-0"
              placeholder="新分類"
              v-model="new_class_name"
            ></b-form-input>
            <b-button
              class="ml-1"
              variant="outline-primary"
              :disabled="new_button_loading"
              @click="add()"
            >
              <b-spinner
                small
                v-show="new_button_loading"
                variant="primary"
                label="Spinning"
              ></b-spinner>
              新增分類
            </b-button>
          </template>
        </b-form>
        <b-table striped hover md="6" :items="items" :fields="fields">
          <template v-slot:table-colgroup="scope">
            <col key="name" style="width: 35%" />
          </template>
          <template v-slot:cell(name)="data">
            <template v-if="data.item.editable">
              <b-form-input
                class="mb-2 mr-sm-2 mb-sm-0"
                v-model="data.item.name"
                @change="edit_name = !edit_name"
              ></b-form-input>
            </template>
            <template v-else>
              {{ data.item.name }}
            </template>
          </template>
          <template v-slot:cell(status)="data">
            <b-form-checkbox
              :disabled="!allow_write"
              v-model="data.item.status"
              name="check-button"
              switch
              @change="changeStatus(data.item)"
            >
            </b-form-checkbox>
          </template>
          <template v-slot:cell(action)="data">
            <router-link
              :to="
                '/store/' + $route.params.id + '/manage/class/' + data.item.id
              "
              class="btn btn-sm btn-outline-primary my-1 mr-2"
            >
              enter
            </router-link>
            <template v-if="allow_write">
              <button
                :disabled="data.index === 0"
                @click="changePriority(data.item, data.index, 'up')"
                class="btn btn-sm btn-outline-success my-1"
              >
                up
              </button>
              <button
                :disabled="data.index === items.length - 1"
                @click="changePriority(data.item, data.index, 'down')"
                class="btn btn-sm btn-outline-success my-1"
              >
                down
              </button>
              <template v-if="data.item.editable">
                <button
                  @click="save(data.item)"
                  class="btn btn-sm btn-success my-1"
                >
                  save
                </button>
              </template>
              <template v-else>
                <button
                  @click="edit(data.item)"
                  class="btn btn-sm btn-success my-1"
                >
                  edit
                </button>
              </template>
              <button
                v-b-modal.modal-move-class
                @click="ori_class = data.item"
                class="btn btn-sm btn-outline-primary my-1"
              >
                move
              </button>
              <button
                @click="deleteClass(data.item)"
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
        </b-table>
      </b-col>
    </b-row>
    <move-class
      :pc_ori_class="ori_class"
      :set_parent="class_id"
      :all_class="all_class"
      @change_parent="change_parent"
    ></move-class>
  </div>
</template>
<script>
import MoveClass from "@/components/MoveClass.vue";

export default {
  components: {
    MoveClass
  },
  data() {
    return {
      fields: ["name", "status", "action"],
      items: [],
      all_class: [],
      isBusy: true,
      b_items: [],
      class_id: null,
      new_class_name: "",
      new_button_loading: false,
      edit_name: false,
      ori_class: {},
      allow_write: false
    };
  },
  async created() {
    if (this.$store.state.permissions.class.write) {
      this.allow_write = true;
    }
    this.isBusy = true;
    let response = await this.axios.get(
      "/api/class/manage/?store_id=" + this.$store.state.store.id
    );
    for (let i in response.data) {
      response.data[i].status = response.data[i].status === 1 ? true : false;
    }
    this.all_class = response.data;
    this.get_current_class();
    this.isBusy = false;
  },
  methods: {
    get_current_class() {
      this.items = [];
      if (typeof this.$route.params.class_id !== "undefined") {
        this.class_id = parseInt(this.$route.params.class_id);
      } else {
        this.class_id = null;
      }
      for (let i in this.all_class) {
        if (this.all_class[i].parent_id === this.class_id) {
          this.items.push(this.all_class[i]);
        }
      }
      this.items.sort(function(a, b) {
        return a.priority - b.priority;
      });
      this.b_items = [];
      this.get_breadcrumb(this.class_id);
    },
    get_breadcrumb(class_id) {
      let base_url = "/store/" + this.$route.params.id + "/manage/class";
      if (class_id === null) {
        this.b_items.splice(0, 0, {
          text: "首頁",
          to: base_url
        });
        return false;
      }
      for (let i in this.all_class) {
        if (this.all_class[i].id === class_id) {
          this.b_items.splice(0, 0, {
            text: this.all_class[i].name,
            to: base_url + "/" + this.all_class[i].id
          });
          this.get_breadcrumb(this.all_class[i].parent_id);
        }
      }
    },
    async add() {
      if (this.new_class_name === "") {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "分類名稱不能空白"
        });
        return;
      }
      this.new_button_loading = true;
      let response = await this.axios.post(
        "/api/class/?store_id=" + this.$store.state.store.id,
        {
          name: this.new_class_name,
          parent_id: this.class_id
        }
      );
      this.new_class_name = "";
      this.new_button_loading = false;
      this.all_class.push(response.data.data);
      this.get_current_class();
      this.$store.commit("set_alert", {
        type: "success",
        text: "新增成功"
      });
    },
    edit(item) {
      for (let i in this.all_class) {
        this.$set(this.all_class[i], "editable", false);
      }
      this.$set(item, "editable", true);
    },
    async save(item) {
      this.$set(item, "editable", false);
      if (!this.edit_name) return;
      this.edit_name = false;
      await this.axios.put(
        "/api/class/" + item.id + "?store_id=" + this.$store.state.store.id,
        {
          name: item.name
        }
      );
      this.$store.commit("set_alert", {
        type: "success",
        text: "修改成功"
      });
    },
    changeStatus(item) {
      item.status = !item.status;
      this.axios
        .put(
          "/api/class/" +
            item.id +
            "/status?store_id=" +
            this.$store.state.store.id,
          {
            status: item.status
          }
        )
        .then(response => {});
    },
    async changePriority(item, index, action) {
      let tmpObj = {};
      let targetKey = 0;
      if (action === "up") {
        targetKey = index - 1;
      } else {
        targetKey = index + 1;
      }
      let tmpPriority = this.items[targetKey].priority;
      this.items[targetKey].priority = this.items[index].priority;
      this.items[index].priority = tmpPriority;
      await this.axios.put(
        "/api/class/priority?store_id=" + this.$store.state.store.id,
        {
          classes: [
            {
              id: this.items[index].id,
              priority: this.items[index].priority
            },
            {
              id: this.items[targetKey].id,
              priority: this.items[targetKey].priority
            }
          ]
        }
      );
      tmpObj = this.items[targetKey];
      this.items[targetKey] = this.items[index];
      this.items.splice(index, 1, tmpObj);
    },
    deleteClass(item) {
      if (!confirm("確認刪除?")) return;
      this.axios
        .put(
          "/api/class/" +
            item.id +
            "/delete?store_id=" +
            this.$store.state.store.id
        )
        .then(response => {
          for (let i in this.items) {
            if (this.items[i].id === item.id) {
              this.items.splice(i, 1);
            }
          }
          for (let i in this.all_class) {
            if (this.all_class[i].id === item.id) {
              this.all_class.splice(i, 1);
            }
          }
        });
    },
    back() {
      for (let i in this.all_class) {
        if (this.all_class[i].id === this.class_id) {
          this.class_id = this.all_class[i].parent_id;
          let str = "";
          if (this.class_id !== null) {
            str = this.class_id;
          }
          this.$router.push(
            "/store/" + this.$route.params.id + "/manage/class/" + str
          );
          return;
        }
      }
    },
    async change_parent(id) {
      this.ori_class.parent_id = id;
      let str = "";
      if (id !== null) {
        str = id;
      }
      this.$router
        .push("/store/" + this.$route.params.id + "/manage/class/" + str)
        .catch(err => {
          console.log("all good");
        });
      // let ori_children = this.find_children(ori_parent_id);
      // let to_children = this.find_children(obj.parent_id);
      // this.change_children(ori_parent_id, ori_children);
      // this.change_children(obj.parent_id, to_children);
      // await this.axios.put(
      //   "/api/class/?store_id=" + this.$store.state.store.id,
      //   {
      //     id: obj.id,
      //     parent_id: obj.parent_id,
      //     ori_parent_id: ori_parent_id,
      //     ori_children: ori_children,
      //     to_children: to_children
      //   }
      // );
      // this.$bvModal.hide("modal-select-class");
      // this.$store.commit("set_alert", {
      //   type: "success",
      //   text: "修改成功"
      // });
    },
    find_children(id) {
      if (id === null) return null;
      let find_arr = [];
      for (let i in this.all_class) {
        if (this.all_class[i].parent_id === id) {
          find_arr.push(this.all_class[i].id);
          if (this.all_class[i].children !== null) {
            let child_arr = this.all_class[i].children.split("-").map(Number);
            for (let j in child_arr) {
              console.log(child_arr[j]);
              if (find_arr.indexOf(child_arr[j]) === -1) {
                console.log(find_arr);
                find_arr.push(child_arr[j]);
              }
            }
          }
        }
      }
      if (find_arr.length > 0) {
        return find_arr.join("-");
      } else {
        return null;
      }
    },
    change_children(id, str) {
      for (let i in this.all_class) {
        if (this.all_class[i].id === id) {
          this.all_class[i].children = str;
          return;
        }
      }
    }
  },
  watch: {
    "$route.params.class_id"() {
      this.get_current_class();
    }
  }
};
</script>
<style>
.breadcrumb {
  background-color: #f5f5f5;
}
</style>
