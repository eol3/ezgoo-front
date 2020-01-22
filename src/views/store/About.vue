<template>
  <div v-if="$store.state.store !== null">
    <b-card>
      <b-card-text>
        <b-form-group label="關於我們:" label-cols-sm="2">
          {{ $store.state.store.about }}
        </b-form-group>
        <b-form-group label="公告:" label-cols-sm="2">
          {{ $store.state.store.announcement }}
        </b-form-group>
        <b-form-group label="地址:" label-cols-sm="2">
          {{ $store.state.store.address }}
        </b-form-group>
        <b-form-group label="電話:" label-cols-sm="2">
          {{ $store.state.store.tel }}
        </b-form-group>
        <b-form-group label="Facebook:" label-cols-sm="2">
          <a target="_blank" :href="$store.state.store.fb_url">
            {{ $store.state.store.fb_url }}
          </a>
        </b-form-group>
        <b-form-group label="Line:" label-cols-sm="2">
          <a target="_blank" :href="$store.state.store.line_url">
            {{ $store.state.store.line_url }}
          </a>
        </b-form-group>
      </b-card-text>
    </b-card>
    <br /><br />
  </div>
</template>

<script>
export default {
  name: "about",
  data() {
    return {
      store: {},
      product: []
    };
  }
};
</script>
