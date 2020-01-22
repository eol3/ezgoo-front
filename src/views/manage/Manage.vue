<template>
  <div>
    <h3>{{ $store.state.store.name }}</h3>
    角色: {{ role }} <br /><br />
    <template v-if="permissions.product.read">
      <router-link to="product">產品管理</router-link>
      <br /><br />
    </template>
    <template v-if="permissions.class.read">
      <router-link to="class">產品分類管理</router-link>
      <br /><br />
    </template>
    <template v-if="permissions.order.read">
      <router-link to="order">訂單管理</router-link>
      <br /><br />
    </template>
    <template v-if="permissions.promotions.read">
      <router-link to="promotions">優惠活動</router-link>
      <br /><br />
    </template>
    <template v-if="permissions.store.write">
      <router-link to="store">商店資訊</router-link>
      <br /><br />
    </template>
    <template v-else-if="permissions.store.read">
      <router-link to="store/preview">商店資訊</router-link>
      <br /><br />
    </template>
    <template v-if="permissions.post.read">
      <router-link to="post">貼文管理</router-link>
      <br /><br />
    </template>
    <template v-if="permissions.permissions.read">
      <router-link to="role">人員設定</router-link>
      <br /><br />
    </template>
  </div>
</template>

<script>
export default {
  name: "Manage",
  data() {
    return {
      role: "",
      permissions: []
    };
  },
  async created() {
    this.role = this.$store.state.user.role.manage;
    this.permissions = this.$store.state.permissions;
    //console.log(this.$store.getters.isAllow("permissions", "read"))
  }
};
</script>
