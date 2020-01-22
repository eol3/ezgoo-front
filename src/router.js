import Vue from "vue";
import Router from "vue-router";
import store from "./store";
import Home from "./views/Home.vue";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/404",
      component: () => import("./views/error/NotFound.vue")
    },
    {
      path: "/500",
      component: () => import("./views/error/ServerError.vue")
    },
    { path: "*", redirect: "/404" },
    {
      path: "/",
      component: () => import("./views/Layout.vue"),
      children: [
        {
          path: "",
          name: "home",
          component: Home
        },
        {
          path: "/user/:user_id",
          component: () => import("./views/user/Head.vue"),
          meta: { requiresUserAuth: true },
          children: [
            {
              path: "",
              name: "user",
              component: () => import("./views/user/Profile.vue")
            },
            {
              path: "store/:role",
              component: () => import("./views/user/Store.vue")
            },
            {
              path: "order",
              name: "orderList",
              component: () => import("./views/order/List.vue")
            },
            {
              path: "order/:order_id",
              component: () => import("./views/order/Detail.vue")
            },
            {
              path: "like",
              component: () => import("./views/user/Like.vue")
            },
            {
              path: "bookmark",
              component: () => import("./views/user/Bookmark.vue")
            },
            {
              path: "history",
              component: () => import("./views/user/History.vue")
            }
          ]
        },
        {
          path: "/cart",
          name: "cart",
          component: () => import("./views/Cart.vue")
        },
        {
          path: "order/confirm",
          component: () => import("./views/order/Confirm.vue")
        },
        {
          path: "store/:id",
          component: () => import("./views/store/Head.vue"),
          children: [
            {
              path: "",
              name: "index",
              component: () => import("./views/store/Index.vue")
            },
            {
              path: "product",
              name: "product",
              component: () => import("./views/store/Product.vue")
            },
            {
              path: "post",
              name: "post",
              component: () => import("./views/store/Post.vue")
            },
            {
              path: "about",
              name: "about",
              component: () => import("./views/store/About.vue")
            }
          ]
        },
        {
          path: "product/:product_id",
          name: "productItem",
          component: () => import("./views/store/ProductItem.vue")
        },
        {
          path: "post/:post_id",
          name: "postItem",
          component: () => import("./views/store/PostItem.vue")
        }
      ]
    },
    {
      path: "/about/secret",
      name: "secret",
      component: () => import("./views/Secret.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/redirect",
      name: "redirect",
      redirect: to => {
        console.log(to.query.to);
        return { path: to.query.to, query: null };
      }
    },
    {
      path: "/store/:id/manage",
      component: () => import("./views/manage/Layout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "/",
          name: "manage",
          component: () => import("./views/manage/Manage.vue")
        },
        {
          path: "product",
          component: () => import("./views/manage/product/List.vue")
        },
        {
          path: "product/new",
          component: () => import("./views/manage/product/New.vue")
        },
        {
          path: "product/edit/:product_id",
          component: () => import("./views/manage/product/Edit.vue")
        },
        {
          path: "product/preview/:product_id",
          component: () => import("./views/manage/product/Preview.vue")
        },
        {
          path: "class",
          name: "class",
          component: () => import("./views/manage/Class.vue")
        },
        {
          path: "class/:class_id",
          component: () => import("./views/manage/Class.vue")
        },
        {
          path: "store",
          component: () => import("./views/manage/store/Form.vue")
        },
        {
          path: "store/preview",
          component: () => import("./views/manage/store/Preview.vue")
        },
        {
          path: "order",
          component: () => import("./views/manage/order/List.vue")
        },
        {
          path: "order/edit/:order_id",
          component: () => import("./views/manage/order/Form.vue")
        },
        {
          path: "order/preview/:order_id",
          component: () => import("./views/manage/order/Preview.vue")
        },
        {
          path: "promotions",
          component: () => import("./views/manage/promotions/List.vue")
        },
        {
          path: "promotions/new",
          component: () => import("./views/manage/promotions/Form.vue")
        },
        {
          path: "promotions/edit/:prom_id",
          component: () => import("./views/manage/promotions/Form.vue")
        },
        {
          path: "promotions/preview/:prom_id",
          component: () => import("./views/manage/promotions/Preview.vue")
        },
        {
          path: "post",
          component: () => import("./views/manage/post/List.vue")
        },
        {
          path: "post/new",
          component: () => import("./views/manage/post/Form.vue")
        },
        {
          path: "post/edit/:post_id",
          component: () => import("./views/manage/post/Form.vue")
        },
        {
          path: "role",
          component: () => import("./views/manage/Role.vue")
        }
      ]
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  await store.dispatch("get_user");
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.state.user === false) {
      store.commit("set_alert", {
        show: 3,
        type: "warning",
        text: "請先登入"
      });
      next({
        path: "/store/" + to.params.id + "/",
        query: {
          hash: Math.floor(Math.random() * Math.floor(100)),
          login: true,
          redirect: to.fullPath
        }
      });
    }
    await store.dispatch("get_store", { store_account: to.params.id });
    if (store.state.user.role.manage === undefined) {
      store.commit("set_alert", {
        show: 3,
        type: "warning",
        text: "無法使用此頁面"
      });
      next({
        path: "/store/" + to.params.id + "/",
        query: {
          hash: Math.floor(Math.random() * Math.floor(100))
        }
      });
    }
    await store.dispatch("get_permissions");
    next();
  } else if (to.matched.some(record => record.meta.requiresUserAuth)) {
    await store.dispatch("get_user");
    if (store.state.user === null || store.state.user === false) {
      store.commit("set_alert", {
        type: "warning",
        text: "請先登入"
      });
      let path = "/";
      if (to.params.id !== undefined) path = "/store/" + to.params.id + "/";
      next({
        path: path,
        query: {
          login: true,
          redirect: to.fullPath
        }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
