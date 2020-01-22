<template>
  <div>
    <b-modal
      @shown="refresh_spec"
      id="modal-select-spec"
      title="規格管理"
      no-stacking
    >
      <div class="form-group row">
        <label for="staticEmail" class="col-4 col-md-3 pl-md-4 col-form-label"
          >新增規格</label
        >
        <div class="col-8">
          <div class="input-group mb-1">
            <input
              type="text"
              class="form-control"
              v-model="new_spec"
              placeholder="口味,尺寸,顏色"
            />
            <div class="input-group-append">
              <b-button
                class="ml-1"
                size="sm"
                :disabled="new_button_loading"
                variant="outline-primary"
                @click="add_spec()"
              >
                <b-spinner
                  small
                  v-show="new_button_loading"
                  variant="primary"
                  label="Spinning"
                ></b-spinner>
                確定新增
              </b-button>
            </div>
          </div>
        </div>
      </div>
      <div class="form-group row">
        <label for="staticEmail" class="col-4 col-md-3 pl-md-4 col-form-label"
          >選擇規格</label
        >
        <div class="col-8">
          <div class="input-group mb-1">
            <select
              class="form-control"
              v-model="select_spec_key"
              @change="refresh_spec"
            >
              <option v-for="(item, key) in spec" :key="key" :value="key">
                {{ item.name }}
              </option>
            </select>
            <div class="input-group-append">
              <b-button
                class="ml-1"
                size="sm"
                :disabled="new_button_loading"
                variant="outline-danger"
                @click="del_spec()"
              >
                <b-spinner
                  small
                  v-show="new_button_loading"
                  variant="danger"
                  label="Spinning"
                ></b-spinner>
                刪除此規格
              </b-button>
            </div>
          </div>
        </div>
      </div>
      <div class="row" v-if="spec.length !== 0 && refresh">
        <div class="col-10">
          <div class="input-group mb-1">
            <div class="input-group-prepend">
              <div class="input-group-text">
                <input
                  type="checkbox"
                  @click="select_spec"
                  :checked="spec[select_spec_key].check"
                />
              </div>
            </div>
            <input
              type="text"
              class="form-control"
              v-model="spec[select_spec_key].name"
              @change="change = true"
            />
          </div>
        </div>
      </div>
      <template v-if="spec.length !== 0 && refresh">
        <div
          class="row"
          v-for="(item, key) in spec[select_spec_key].content"
          :key="key"
        >
          <div class="col-10 offset-1">
            <div class="input-group mb-1">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <input type="checkbox" v-model="item.check" />
                </div>
              </div>
              <input
                type="text"
                class="form-control"
                v-model="item.name"
                @change="change = true"
              />
              <div class="input-group-prepend">
                <button
                  class="btn btn-outline-secondary"
                  :disabled="key === 0"
                  @click="up(key)"
                >
                  ↑
                </button>
              </div>
              <div class="input-group-prepend">
                <button
                  class="btn btn-outline-secondary"
                  :disabled="key === spec[select_spec_key].content.length - 1"
                  @click="down(key)"
                >
                  ↓
                </button>
              </div>
              <div class="input-group-prepend">
                <button class="btn btn-outline-danger" @click="del(key)">
                  -
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div class="row">
        <div class="col-12 text-center">
          <b-button size="sm" variant="outline-success" @click="add()">
            +
          </b-button>
        </div>
      </div>
      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <div class="mr-auto ml-auto">
          <b-button class="mr-1" @click="cancel()">
            取消
          </b-button>
          <b-button class="ml-1" variant="primary" @click="confirm()">
            確定
          </b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  props: ["init_spec"],
  data() {
    return {
      new_spec: "",
      spec: [],
      new_button_loading: false,
      select_spec_key: 0,
      change: false,
      refresh: true
    };
  },
  async created() {
    let response = await this.axios.get(
      "/api/spec/?store_id=" + this.$store.state.store.id
    );
    this.spec = response.data.data;
    for (let i in this.spec) {
      this.spec[i].check = false;
      if (this.spec[i].content === "") {
        this.spec[i].content = [];
        continue;
      }
      for (let j in this.spec[i].content) {
        this.spec[i].content[j].check = false;
      }
    }
    this.check_spec();
  },
  methods: {
    refresh_spec() {
      this.refresh = false;
      this.$nextTick(() => (this.refresh = true));
    },
    confirm() {
      let str = JSON.stringify(this.spec);
      let obj = [];
      obj = JSON.parse(str);
      let i = obj.length - 1;
      while (i >= 0) {
        if (!obj[i].check) {
          obj.splice(i, 1);
        } else {
          delete obj[i].check;
          let j = obj[i].content.length - 1;
          while (j >= 0) {
            if (!obj[i].content[j].check) {
              obj[i].content.splice(j, 1);
            } else {
              delete obj[i].content[j].check;
            }
            j -= 1;
          }
        }
        i -= 1;
      }
      this.$emit("select_spec", obj);
      if (!this.change) {
        this.$bvModal.hide("modal-select-spec");
        return;
      }
      str = JSON.stringify(this.spec);
      obj = JSON.parse(str);
      for (let i in obj) {
        delete obj[i].check;
        for (let j in obj[i].content) {
          delete obj[i].content[j].check;
        }
      }
      this.axios
        .put("/api/spec/?store_id=" + this.$store.state.store.id, {
          content: JSON.stringify(obj)
        })
        .then(response => {
          this.change = false;
          this.$bvModal.hide("modal-select-spec");
        });
    },
    select_spec() {
      let sk = this.select_spec_key;
      this.spec[sk].check = !this.spec[sk].check;
      for (let i in this.spec[sk].content) {
        this.spec[sk].content[i].check = this.spec[sk].check;
      }
      this.refresh_spec();
    },
    add_spec() {
      if (this.new_spec === "") {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "不能空白"
        });
        return;
      }
      this.change = true;
      let new_id = 1;
      if (this.spec.length !== 0) {
        new_id = this.spec[this.spec.length - 1].id + 1;
      }
      this.spec.push({
        id: new_id,
        name: this.new_spec,
        check: true,
        content: []
      });
      this.select_spec_key = this.spec.length - 1;
      this.add();
    },
    del_spec() {
      if (confirm("確認刪除此規格?")) {
        this.change = true;
        let sk = this.select_spec_key;
        this.spec.splice(sk, 1);
        this.select_spec_key = 0;
      }
    },
    add() {
      this.change = true;
      this.spec[this.select_spec_key].content.push({
        name: "",
        check: true
      });
    },
    up(key) {
      this.change = true;
      let content = this.spec[this.select_spec_key].content;
      let tmp = content[key - 1];
      content[key - 1] = content[key];
      content.splice(key, 1, tmp);
    },
    down(key) {
      this.change = true;
      let content = this.spec[this.select_spec_key].content;
      let tmp = content[key + 1];
      content[key + 1] = content[key];
      content.splice(key, 1, tmp);
    },
    del(key) {
      this.change = true;
      this.spec[this.select_spec_key].content.splice(key, 1);
    },
    check_spec() {
      if (
        this.init_spec === undefined ||
        this.init_spec.length === 0 ||
        this.spec.length === 0
      )
        return;
      for (let i in this.spec) {
        for (let j in this.init_spec) {
          if (this.spec[i].id === this.init_spec[j].id) {
            this.spec[i].check = true;
            this.select_spec_key = i;
            this.check_content(this.spec[i].content, this.init_spec[j].content);
          }
        }
      }
    },
    check_content(content, init_content) {
      for (let i in content) {
        for (let j in init_content) {
          if (content[i].name === init_content[j].name) {
            content[i].check = true;
          }
        }
      }
    }
  },
  watch: {
    init_spec: function() {
      this.check_spec();
    }
  }
};
</script>
