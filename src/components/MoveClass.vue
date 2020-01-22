<template>
  <div>
    <b-modal
      @shown="show"
      id="modal-move-class"
      title="選擇商品分類"
      no-stacking
      :hide-footer="true"
    >
      <div class="mb-3">正在移動「{{ ori_class.name }}」...</div>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item" v-for="(item, key) in b_items" :key="key">
            <button class="btn btn-link" @click="change_class(item.id)">
              {{ item.text }}
            </button>
          </li>
        </ol>
      </nav>
      <div v-show="class_id !== null">
        <b-button class="btn-sm mr-2" @click="back()">
          返回上一層
        </b-button>
      </div>
      <hr />
      <div
        class="row"
        style="cursor: pointer;"
        v-if="items.length > 0"
        @click="move(0)"
      >
        <div class="col-10 pl-4">
          <b>移動到這個位置</b>
        </div>
      </div>
      <div class="row" v-else>
        <div class="col-10 pl-4">
          <i>尚無分類</i>
        </div>
      </div>
      <hr />
      <div v-for="(item, key) in items" :key="key">
        <div
          class="row"
          style="cursor: pointer;"
          v-if="has_children(item.id)"
          @click="enter(item.id)"
        >
          <div class="col-10 pl-4">
            {{ item.name }}
          </div>
          <div class="col-2">
            <img width="12" src="@/assets/play.png" />
          </div>
        </div>
        <div class="row" style="cursor: pointer;" v-else @click="move(item.id)">
          <div class="col-10 pl-4">
            {{ item.name }}
          </div>
        </div>
        <hr />
        <!--<button-->
        <!--  @click="enter(item.id)"-->
        <!--  class="btn btn-sm btn-outline-primary my-1"-->
        <!---->
        <!--  enter-->
        <!--</button>-->
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "SelectClassModal",
  props: ["pc_ori_class", "set_parent", "all_class"],
  data() {
    return {
      items: [],
      b_items: [],
      class_id: null,
      ori_class: {}
    };
  },
  methods: {
    show() {
      if (this.pc_ori_class !== undefined) {
        this.ori_class = this.pc_ori_class;
      }
      if (typeof this.set_parent !== "undefined") {
        this.class_id = this.set_parent;
      }
      this.get_current_class();
    },
    enter(id) {
      if (this.ori_class.id == id) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "不能選擇同一個分類"
        });
        return;
      }
      this.class_id = id;
      this.get_current_class();
    },
    get_current_class() {
      this.items = [];
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
      if (class_id === null) {
        this.b_items.splice(0, 0, {
          text: "首頁",
          id: null
        });
        return false;
      }
      for (let i in this.all_class) {
        if (this.all_class[i].id === class_id) {
          this.b_items.splice(0, 0, {
            text: this.all_class[i].name,
            id: this.all_class[i].id
          });
          this.get_breadcrumb(this.all_class[i].parent_id);
        }
      }
    },
    change_class(id) {
      this.class_id = id;
      this.get_current_class();
    },
    back() {
      for (let i in this.all_class) {
        if (this.all_class[i].id === this.class_id) {
          this.class_id = this.all_class[i].parent_id;
          break;
        }
      }
      this.get_current_class();
    },
    async move(id) {
      if (this.ori_class.id === undefined && this.type === 1) {
        return;
      }
      if (id === 0) {
        id = this.class_id;
      }
      if (this.ori_class.parent_id == id) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "已在相同分類"
        });
        return;
      }
      if (this.ori_class.id == id) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "不能選擇同一個分類"
        });
        return;
      }
      await this.axios.put(
        "/api/class/" +
          this.ori_class.id +
          "?store_id=" +
          this.$store.state.store.id,
        { parent_id: id }
      );
      this.$bvModal.hide("modal-move-class");
      this.$store.commit("set_alert", {
        type: "success",
        text: "修改成功"
      });
      this.$emit("change_parent", id);
    },
    has_children(id) {
      for (let i in this.all_class) {
        if (this.all_class[i].parent_id === id) {
          return true;
        }
      }
      return false;
    },
    find_children(str) {
      let children = str.split("-");
      let result = "";
      for (let i in this.all_class) {
        if (children.indexOf(this.all_class[i].id)) {
          if (this.all_class[i].children !== null) {
            result = this.all_class[i].children;
          }
        }
      }
      return result;
    }
  }
};
</script>
