<template>
  <div>
    <div v-if="post !== null">
      <div v-if="post.length !== 0" class="row pl-1">
        <template v-for="(item, key) in post">
          <div
            class="card mb-3 mr-3"
            v-if="item.image_url !== null"
            :key="key"
            @click="go_post(item)"
          >
            <img
              :src="item.image_url"
              class="card-img-top"
              style="max-height: 140px;object-fit: cover;"
            />
            <div class="card-body">
              {{ item.content }}
            </div>
          </div>
          <div class="card mb-3 mr-3" v-else :key="key" @click="go_post(item)">
            <div class="card-body">
              <div class="row" style="height:200px;overflow:hidden;">
                <div class="col my-auto">
                  {{ item.content }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div v-else-if="post === null">
      <div class="card" style="width: 13rem;">
        <img src="@/assets/no-image-sm.webp" class="card-img-top" />
        <div class="card-body">
          ...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["mode", "post"],
  methods: {
    go_post(item) {
      this.$router.push({
        name: "postItem",
        params: {
          post_id: item.id,
          post_item: item
        }
      });
    }
  }
};
</script>

<style scoped>
.row {
  align-items: stretch;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}
.card {
  max-height: 240px;
  flex-basis: 25%;
  flex-grow: 0;
  flex-shrink: 0;
}

.card:hover {
  cursor: pointer;
}

/* .card a {
  color: black;
  text-decoration-line: none;
} */

.card-body {
  font-size: 90%;
  overflow: hidden;
}
@media (max-width: 768px) {
  .card {
    flex-basis: 40%;
  }
}
</style>
