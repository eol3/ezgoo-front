<template>
  <div>
    <Modal />
  </div>
</template>

<script>
import Modal from "@/components/Modal.vue";

export default {
  name: "Layout",
  components: {
    Modal
  },
  data() {
    return {
      user: null,
      product: []
    };
  },
  created() {}
};
</script>
