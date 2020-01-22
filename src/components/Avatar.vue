<template>
  <div>
    <b-form-file
      v-if="mode !== 'preview'"
      class="col-md-6"
      accept="image/*"
      @change="preview"
      plain
    ></b-form-file>
    <b-row>
      <b-col cols="3" lg="2" class="mt-2">
        <img
          v-if="preview_img === undefined"
          class="rounded-circle avatar-image"
          width="100%"
          src="@/assets/no-image-sm.webp"
        />
        <img
          v-else-if="preview_img.url == ''"
          class="rounded-circle avatar-image"
          width="100%"
          src="@/assets/no-image-sm.webp"
        />
        <img
          v-else
          class="rounded-circle avatar-image"
          width="100%"
          style="object-fit: cover;"
          :src="preview_img.url"
        />
      </b-col>
      <b-col v-if="mode !== 'preview'" cols="5" lg="4" class="mt-4">
        <b-button
          variant="success"
          v-if="preview_img !== undefined && preview_img.url !== ''"
          @click="clear_avatar"
          >清除大頭貼</b-button
        >
      </b-col>
    </b-row>
  </div>
</template>

<script>
import EXIF from "exif-js";

export default {
  props: ["mode", "init_img"],
  data() {
    return {
      preview_img: {
        url: ""
      }
    };
  },
  created() {
    this.preview_img = this.init_img;
  },
  methods: {
    clear_avatar() {
      if (this.preview_img !== undefined) {
        this.preview_img = { url: "" };
        this.$emit("change-img", this.preview_img);
      }
    },
    async preview(e) {
      let res = await this.readFileAsync(e.target.files[0]);
      let img = await this.loadImgAsync(res);
      var self = this;
      EXIF.getData(img, async function() {
        var orientation = EXIF.getTag(this, "Orientation");
        var canvas = self.rotateImg(orientation, img);
        let img_buffer = canvas.toDataURL("image/jpeg", 1.0);
        let img_data = await self.dataURItoBlob(img_buffer);
        let obj = {
          file: img_data,
          url: img_buffer
        };
        self.preview_img = obj;
        self.$emit("change-img", self.preview_img);
      });
    },
    rotateImg(orientation, img) {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      if (orientation === undefined || orientation === 1) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        if (img.width > 2000 || img.height > 2000) {
          ctx.scale(0.5, 0.5);
        }
        return canvas;
      }

      var rotateAngle = 0;
      switch (orientation) {
        case 3:
          rotateAngle = 180;
          break;
        case 6:
          rotateAngle = 90;
          canvas.width = img.height;
          canvas.height = img.width;
          break;
        case 8:
          rotateAngle = -90;
          canvas.width = img.height;
          canvas.height = img.width;
          break;
      }
      var x = canvas.width / 2;
      var y = canvas.height / 2;

      ctx.translate(x, y);
      ctx.rotate((rotateAngle * Math.PI) / 180);
      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );
      //壓縮
      if (canvas.width > 2000 || canvas.height > 2000) {
        ctx.scale(0.5, 0.5);
      }
      return canvas;
    },
    readFileAsync(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    loadImgAsync(src) {
      return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    },
    dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(",")[0].indexOf("base64") >= 0)
        byteString = atob(dataURI.split(",")[1]);
      else byteString = unescape(dataURI.split(",")[1]);
      // separate out the mime component
      var mimeString = dataURI
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], { type: mimeString });
    }
  },
  watch: {
    init_img() {
      this.preview_img = this.init_img;
    }
  }
};
</script>
