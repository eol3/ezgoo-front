<template>
  <div>
    <b-modal
      @shown="show"
      id="modal-select-class"
      title="選擇商品分類"
      no-stacking
      hide-footer
    >
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item" v-for="(item, key) in b_items" :key="key">
            <button class="btn btn-link" @click="change_class(item.id)">
              {{ item.text }}
            </button>
          </li>
        </ol>
      </nav>
      <div class="row">
        <div class="col-4 col-md-3">
          <b-button v-show="class_id !== null" class="btn-sm" @click="back()">
            返回上一層
          </b-button>
        </div>
        <div class="col-5 col-md-4 mb-2">
          <b-form-checkbox class="my-auto" v-model="multi" switch>
            多選分類
          </b-form-checkbox>
        </div>
        <div class="col-3 col-md-2">
          <b-button
            v-if="multi"
            variant="primary"
            class="btn-sm"
            @click="select_multi()"
          >
            確定
          </b-button>
        </div>
      </div>
      <hr />
      <template v-for="(item, key) in all_class">
        <div v-if="item.parent_id === class_id" :key="key">
          <div class="row">
            <div
              style="cursor: pointer;"
              class="col-2 pl-4 text-center"
              @click="enter(item)"
            >
              <!--<template v-if="multi">-->
              <!--  <b-form-checkbox v-model="item.checked"></b-form-checkbox>-->
              <!--</template>-->
              <!--<template v-else>-->
              <!--  <input-->
              <!--    type="radio"-->
              <!--    v-if="item.id === selected_one_id"-->
              <!--    checked="checked"-->
              <!--  />-->
              <!--  <input type="radio" v-else @input="select_one(item)" />-->
              <!--</template>-->
              <img
                width="12"
                src="@/assets/play.png"
                v-if="has_children(item.id)"
              />
            </div>
            <div
              style="cursor: pointer;"
              :class="['col-9', 'pl-4', { 'selected-around': item.checked }]"
              @click="select(item, key)"
            >
              {{ item.name }}
            </div>
            <!--<div class="col-1" v-if="has_children(item.id)">-->
            <!--  <img width="12" src="@/assets/play.png" />-->
            <!--</div>-->
          </div>
          <hr />
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "SelectClassModal",
  props: ["all_class"],
  data() {
    return {
      items: [],
      b_items: [],
      class_id: null,
      ori_class: {},
      multi: false,
      selected_one_id: 0
    };
  },
  methods: {
    show() {
      this.set_one_id();
      this.b_items = [];
      this.get_breadcrumb(this.class_id);
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
          text: "所有分類",
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
      if (id === null) {
        this.$emit("select_class", []);
        this.$bvModal.hide("modal-select-class");
        return;
      }
    },
    back() {
      for (let i in this.all_class) {
        if (this.all_class[i].id === this.class_id) {
          this.class_id = this.all_class[i].parent_id;
          break;
        }
      }
    },
    select_one(item) {
      this.selected_one_id = item.id;
      item.checked = !item.checked;
      for (let i in this.all_class) {
        if (this.all_class[i].id !== item.id) {
          this.all_class[i].checked = false;
        }
      }
      let items = [];
      items.push(item);
      this.$emit("select_class", items);
      this.$bvModal.hide("modal-select-class");
    },
    enter(item) {
      this.class_id = item.id;
    },
    select(item, key) {
      // if (this.has_children(item.id)) {
      //   this.class_id = item.id;
      //   return;
      // }
      item.checked = !item.checked;
      if (this.multi) {
        this.all_class.splice(0, 0); //讓畫面更新
        return;
      }
      for (let i in this.all_class) {
        if (this.all_class[i].id !== item.id) {
          this.all_class[i].checked = false;
        }
      }
      let items = [];
      items.push(item);
      this.$emit("select_class", items);
      this.$bvModal.hide("modal-select-class");
    },
    select_multi() {
      let items = [];
      for (let i in this.all_class) {
        if (this.all_class[i].checked) {
          items.push(this.all_class[i]);
        }
      }
      this.$emit("select_class", items);
      this.$bvModal.hide("modal-select-class");
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
    },
    set_one_id() {
      let items = [];
      for (let i in this.all_class) {
        if (this.all_class[i].checked) {
          items.push(this.all_class[i]);
        }
      }
      if (items.length === 1) {
        this.selected_one_id = items[0].id;
      } else {
        this.selected_one_id = 0;
      }
    }
  },
  watch: {
    class_id() {
      this.b_items = [];
      this.get_breadcrumb(this.class_id);
    },
    multi() {
      if (!this.multi) {
        this.set_one_id();
      }
    }
  }
  // watch: {
  //   pc_selected_class() {
  //     for (let i in this.pc_selected_class) {
  //       for (let j in this.all_class) {
  //         if (this.pc_selected_class[i].id === this.all_class[j].id) {
  //           this.all_class[j].checked = true
  //           break;
  //         }
  //       }
  //     }
  //     console.log("test");
  //   }
  // }
};
</script>
