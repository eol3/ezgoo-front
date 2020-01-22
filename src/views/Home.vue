<template>
  <div class="home">
    <!-- <button class="btn btn-outline-primary">
      hello
    </button> -->
    <!-- <img alt="Vue logo" src="../assets/logo.png" /> -->
    <h1>EzGOO 易購網網路購物平台</h1>
    <!-- <h4>理念</h4>
    <ul>
      <li>o2o</li>
    </ul> -->
    <h4>特色</h4>
    <ul>
      <li>
        一個帳號在多個商店購買各種商品或服務，並能選擇追蹤或成為會員
      </li>
      <li>
        一個帳號可開設管理多個商店，在不同商店有不同身分(擁有者、編輯、理貨員)
      </li>
      <li>
        一個商店也能加入不同帳號成為不同身分(擁有者、編輯、理貨員)，進行協同作業
      </li>
    </ul>
    <h4>目前商家</h4>
    <ul>
      <li>
        <router-link class="nav-link" to="/store/easybuy">
          易購商福利量販店
        </router-link>
      </li>
      <li>
        <router-link class="nav-link" to="/store/example">
          愛之森生活用品館(範例商店)
        </router-link>
      </li>
      <li>
        <router-link class="nav-link" to="/store/system">
          EzGOO系統管理中心
        </router-link>
      </li>
    </ul>
    <!--<HelloWorld msg="Welcome to Your Vue.js App" />-->
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "Home",
  // components: {
  //   HelloWorld
  // }
  created() {
    this.set_meta();
  },
  activated() {
    this.set_meta();
  },
  methods: {
    set_meta() {
      this.$store.commit("init_brand");
      this.$store.state.meta.title = "EzGoo 易購網網路購物平台";
      this.$store.state.meta.describe = "簡單容易使用的網路購物平台";
    }
  }
};
</script>
