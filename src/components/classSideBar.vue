<template>
  <div>
    <div class="row mb-1" style="cursor: pointer;">
      <div
        class="col-9 pl-2 offset-2 selected-around"
        @click="all"
        v-if="$route.query.class === undefined"
      >
        所有分類
      </div>
      <div class="col-9 pl-1 offset-2" @click="all" v-else>
        所有分類
      </div>
    </div>
    <div class="row mb-1">
      <b-button v-show="class_id !== null" class="btn-sm" @click="back()">
        返回上一層
      </b-button>
    </div>
    <template v-for="(item, key) in all_class">
      <div
        class="row mb-1"
        v-if="item.parent_id === class_id"
        :key="key"
        style="cursor: pointer;"
      >
        <div class="col-2" @click="change_class(item.id)">
          <img
            width="12"
            src="@/assets/play.png"
            v-show="item.children !== null"
          />
        </div>
        <div
          class="col-9 pl-2 selected-around"
          @click="select(item)"
          v-if="item.checked"
        >
          {{ item.name }}
        </div>
        <div class="col-9 pl-1" @click="select(item)" v-else>
          {{ item.name }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: ["all_class", "set_parent_id"],
  data() {
    return {
      items: [],
      class_id: null
    };
  },
  methods: {
    all() {
      for (let i in this.all_class) {
        this.all_class[i].checked = false;
      }
      this.all_class.splice(0, 0);
      this.items = [];
      this.$emit("select_class", this.items);
    },
    change_class(id) {
      this.class_id = id;
    },
    back() {
      for (let i in this.all_class) {
        if (this.all_class[i].id === this.class_id) {
          this.class_id = this.all_class[i].parent_id;
          break;
        }
      }
    },
    select(item) {
      item.checked = !item.checked;
      for (let i in this.all_class) {
        if (this.all_class[i].id !== item.id) {
          this.all_class[i].checked = false;
        }
      }
      this.items = [];
      this.items.push(item);
      this.all_class.splice(0, 0);
      this.$emit("select_class", this.items);
    }
  },
  watch: {
    set_parent_id() {
      this.change_class(this.set_parent_id);
    }
  }
};
</script>
