<template>
  <div>
    <b-row v-if="items !== null && items.length !== 0">
      <template v-for="(item, key) in items">
        <b-col cols="6" md="4" lg="3" :key="key">
          <div class="card mb-3" v-if="item.status === 1">
            <router-link
              :to="{
                name: 'productItem',
                params: {
                  id: item.store_account,
                  product_id: item.product_id,
                  product_item: item
                }
              }"
            >
              <img :src="item.thumbnail" class="card-img-top" />
            </router-link>
            <div class="card-body">
              <router-link
                :to="{
                  name: 'productItem',
                  params: {
                    id: item.store_account,
                    product_id: item.product_id,
                    product_item: item
                  }
                }"
              >
                <p>
                  {{ item.name + item.product_id }}
                </p>
              </router-link>
              <p class="text-right">
                <b>${{ item.price }}</b>
              </p>
            </div>
          </div>
          <div class="card mb-3" v-else>
            <div class="card-body text-center">
              商品已下架
            </div>
          </div>
        </b-col>
      </template>
    </b-row>
    <div class="text-center" v-else-if="items.length === 0">
      尚無項目
      <br /><br />
    </div>
    <b-row v-else>
      <b-col cols="12" md="4" lg="3">
        <div class="card">
          <img src="@/assets/no-image-sm.webp" class="card-img-top" />
          <div class="card-body">
            ...
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  props: ["mode", "items"]
};
</script>
