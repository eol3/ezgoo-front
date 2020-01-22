import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import Cookies from "js-cookie";

Vue.use(Vuex);

async function get_api_store(context, store_account) {
  let response = await axios.get("/api/store/" + store_account);
  response.data.images.sort(function(a, b) {
    return a.priority - b.priority;
  });
  if (response.data.role !== undefined) {
    context.commit("set_role", response.data.role);
    delete response.data.role;
  }
  context.commit("set_store", response.data);
}

function check_spec(product, new_product) {
  if (new_product.spec === undefined) {
    return null;
  }
  if (new_product.spec.length === 0) {
    console.log("no spec");
    return null;
  }
  for (let i in product.spec) {
    for (let j in new_product.spec) {
      if (
        product.spec[i].key === new_product.spec[j].key &&
        product.spec[i].name === new_product.spec[j].name
      ) {
        return true;
      }
    }
  }
  return false;
}

function add_to_cart(context, payload, index) {
  let product_check = false;
  let spec_check = false;
  let commit_obj = {
    store_key: index,
    item_key: 0,
    option: 1,
    obj: payload
  };
  for (let i in context.state.cart[index].items) {
    if (context.state.cart[index].items[i].id == payload.id) {
      product_check = true;
      commit_obj.item_key = i;
      spec_check = check_spec(context.state.cart[index].items[i], payload);
      if (spec_check || spec_check === null) {
        commit_obj.item_key = i;
        break;
      }
    }
  }

  if (product_check) {
    if (spec_check || spec_check === null) {
      console.log("all same or no spec");
      payload.number =
        parseInt(payload.number) +
        parseInt(context.state.cart[index].items[commit_obj.item_key].number);
      context.commit("set_cart", commit_obj);
    } else if (!spec_check) {
      console.log("diff spec");
      commit_obj.item_key = parseInt(commit_obj.item_key) + 1;
      commit_obj.option = 0;
      context.commit("set_cart", commit_obj);
    }
  } else if (!product_check) {
    context.state.cart[index].items.push(payload);
  }
}

function check_store(context, user_cart_store) {
  for (let i in context.state.cart) {
    if (context.state.cart[i].store_id === user_cart_store.store_id) {
      return i;
    }
  }
  return false;
}

function merge_cart(context, user_cart) {
  for (let i in user_cart) {
    let check = check_store(context, user_cart[i]);
    if (check) {
      for (let j in user_cart[i].items) {
        add_to_cart(context, user_cart[i].items[j], check);
      }
    } else {
      context.state.cart.push(user_cart[i]);
    }
  }
  return;
}

export default new Vuex.Store({
  state: {
    brand: {
      avatar: "",
      name: "EzGoo",
      url: "/",
      show_prev: false
    },
    meta: {
      title: "EzGoo 易購網網路購物平台",
      describe: "簡單容易使用的網路購物平台"
    },
    user: null,
    store: null,
    permissions: false,
    prev_url: "",
    select_spec_product: {},
    cart: [],
    cart_badge: 0,
    order_status: {
      user: [
        "訂單取消",
        "訂單成立",
        "店家收到訂單",
        "店家已出貨",
        "可取貨",
        "退貨",
        "重新出貨",
        "未取貨"
      ],
      store: [
        "訂單取消",
        "訂單成立",
        "已接受訂單",
        "已出貨",
        "可取貨",
        "退貨",
        "重新出貨",
        "未取貨"
      ]
    },
    payment: ["", "信用卡", "ATM匯款", "到店付款"],
    payment_status: ["", "待付款", "已付款", "到店付款"],
    recieve: ["", "超商取貨", "郵寄", "到店取貨"],
    alert: {
      show: 0,
      type: "",
      text: "test"
    },
    change_store: false,
    force_update: false
  },
  getters: {
    isAllow: state => (resource, action) => {
      return state.permissions.find(
        permission => permission.resource === resource
      )[action];
    }
  },
  mutations: {
    init_brand(state) {
      state.brand = {
        avatar: "",
        name: "EzGoo",
        url: "/",
        show_prev: false
      };
    },
    set_user(state, value) {
      state.user = value;
      if (state.user.account === "") state.user.account = state.user.id;
    },
    set_user_avatar(state, value) {
      if (!value) delete state.user.avatar_url;
      else state.user.avatar_url = value.avatar_url;
    },
    set_store(state, value) {
      state.store = value;
    },
    set_permissions(state, value) {
      state.permissions = value;
    },
    set_role(state, value) {
      state.user.role = { general: "guest" };
      state.user.role = value;
    },
    set_prev_url(state, value) {
      state.prev_url = value;
    },
    set_select_spec_product(state, value) {
      state.select_spec_product = value;
    },
    set_cart(state, payload) {
      state.cart[payload.store_key].items.splice(
        payload.item_key,
        payload.option,
        payload.obj
      );
    },
    set_alert(state, val) {
      if (state.alert.show !== 0) {
        state.alert.show = 0;
      }
      if (val.show === undefined) {
        state.alert.show = 3;
      } else {
        state.alert.show = val.show;
      }
      state.alert.type = val.type;
      state.alert.text = val.text;
    }
  },
  actions: {
    async reset_cart(context, value) {
      merge_cart(context, value);
      await context.dispatch("sync_cart");
    },
    async set_cart(context, payload) {
      let index = false;
      for (let i in context.state.cart) {
        if (context.state.cart[i].store_id == context.state.store.id) {
          index = i;
        }
      }
      if (!index) {
        context.state.cart.push({
          store_id: context.state.store.id,
          store_account: context.state.store.account,
          store_name: context.state.store.name,
          store_avatar_url: context.state.store.avatar.url,
          items: [payload]
        });
        context.commit("set_alert", {
          type: "success",
          text: "成功加入購物車(" + payload.name + ")"
        });
      } else {
        add_to_cart(context, payload, index);
        context.commit("set_alert", {
          type: "success",
          text: "成功加入購物車(" + payload.name + ")"
        });
      }
      await context.dispatch("sync_cart");
    },
    async set_cart_product(context, payload) {
      let index = 0;
      for (let i in context.state.cart) {
        if (context.state.cart[i].store_id === payload.store_id) {
          index = i;
        }
      }
      context.commit("set_cart", {
        store_key: index,
        item_key: payload.item_key,
        option: 1,
        obj: payload.product
      });
      await context.dispatch("sync_cart");
    },
    get_cart(context) {
      let cart = Cookies.get("cart");
      if (cart !== undefined) {
        context.state.cart = JSON.parse(cart);
      }
      context.dispatch("compute_cart_badge");
    },
    async del_cart(context, payload) {
      context.state.cart[payload.store_key].items.splice(payload.item_key, 1);
      if (context.state.cart[payload.store_key].items.length === 0) {
        context.state.cart.splice(payload.store_key, 1);
      }
      Cookies.set("cart", context.state.cart, { expires: 7 });
      await context.dispatch("sync_cart");
    },
    async clear_cart(context) {
      context.state.cart = [];
      Cookies.remove("cart");
      await context.dispatch("sync_cart");
    },
    compute_cart_badge(context) {
      let badge = 0;
      for (let i in context.state.cart) {
        for (let j in context.state.cart[i].items) {
          badge += context.state.cart[i].items[j].number;
        }
      }
      context.state.cart_badge = badge;
    },
    async sync_cart(context) {
      context.dispatch("compute_cart_badge");
      if (context.state.user) {
        await axios.put("/api/user/" + context.state.user.id + "/cart", {
          cart: JSON.stringify(context.state.cart)
        });
      }
      Cookies.set("cart", context.state.cart, { expires: 7 });
    },
    async get_user(context) {
      if (context.state.user === null) {
        let response = await axios.get("/api/user/");
        context.commit("set_user", response.data);
      }
      // context.dispatch("set_role");
    },
    set_user(context, payload) {
      context.commit("set_user", payload);
    },
    async get_store(context, payload) {
      if (
        context.state.store !== null &&
        context.state.store.account !== payload.store_account
      ) {
        context.state.change_store = true;
      }
      if (
        context.state.store === null ||
        context.state.store.account !== payload.store_account ||
        payload.force !== undefined
      ) {
        context.state.store = null;
        await get_api_store(context, payload.store_account);
      }
    },
    async get_store_by_id(context, payload) {
      if (
        context.state.store !== null &&
        context.state.store.id !== payload.store_id
      ) {
        context.state.change_store = true;
      }
      if (
        context.state.store === null ||
        context.state.store.id !== payload.store_id
      ) {
        // api允許使用store_id or store_account
        await get_api_store(context, payload.store_id);
      }
    },
    async get_permissions(context) {
      if (!context.state.change_store && context.state.permissions) return;
      let response = await axios.get(
        "/api/permissions/?store_id=" + context.state.store.id + "&group=manage"
      );
      context.commit("set_permissions", response.data);
    },
    is_allow(context, payload) {
      if (context.state.permissions === false) return false;
      return context.state.permissions[payload[0]][payload[1]];
    },
    logout(context) {
      context.commit("set_user", false);
      context.commit("set_permissions", false);
      context.state.cart_badge = 0;
      context.state.cart = [];
      Cookies.remove("cart");
    }
  }
});
