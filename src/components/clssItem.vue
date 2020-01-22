<template>
  <div>
    <div v-for="(item, key) in all_class" :key="key">
      {{ item.name }}
    </div>
  </div>
</template>
<script>
export default {
  props: ["all_class"]
};
</script>
