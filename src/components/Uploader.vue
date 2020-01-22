<template>
  <div>
    <b-form-file
      v-if="mode === undefined"
      class="col-md-6"
      id="file-default"
      @change="preview"
      accept="image/*"
      plain
      multiple
    ></b-form-file>
    <br />
    <b-row v-if="preview_imgs.length != 0">
      <b-col :md="table_row">
        <b-table hover :items="preview_imgs" :fields="img_fields">
          <template v-slot:cell(picture)="data">
            <b-img-lazy rounded :src="data.item.url" width="100" />
          </template>
          <template v-slot:cell(option)="data">
            <b-button
              size="sm"
              variant="outline-primary"
              :disabled="data.index === 0"
              @click="changePriority(data.item, data.index, 'up')"
              >Up</b-button
            >
            <b-button
              size="sm"
              variant="outline-primary"
              :disabled="data.index === preview_imgs.length - 1"
              @click="changePriority(data.item, data.index, 'down')"
              >Down</b-button
            ><br />
            <b-button
              size="sm"
              variant="outline-danger"
              @click="delete_img(data.index)"
              >Delete</b-button
            >
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import EXIF from "exif-js";

export default {
  name: "Uploader",
  props: ["mode", "init_imgs", "limit"],
  data() {
    return {
      img_fields: [{ key: "picture" }, { key: "option" }],
      preview_imgs: [],
      table_row: 6
    };
  },
  created() {
    if (this.mode !== undefined && this.mode === "preview") {
      this.img_fields = [{ key: "picture" }];
      this.table_row = 4;
    }
  },
  methods: {
    changePriority(item, index, action) {
      let tmpObj = {};
      let targetKey = 0;
      if (action === "up") {
        targetKey = index - 1;
      } else {
        targetKey = index + 1;
      }
      let tmpPriority = this.preview_imgs[targetKey].priority;
      this.preview_imgs[targetKey].priority = this.preview_imgs[index].priority;
      this.preview_imgs[index].priority = tmpPriority;
      tmpObj = this.preview_imgs[targetKey];
      this.preview_imgs[targetKey] = this.preview_imgs[index];
      this.preview_imgs.splice(index, 1, tmpObj);
      this.$emit("change-img", this.preview_imgs);
    },
    async preview(e) {
      var len = this.preview_imgs.length;
      let total = len + e.target.files.length;
      console.log(total);
      if (this.limit !== undefined && total > this.limit) {
        this.$store.commit("set_alert", {
          type: "warning",
          text: "最多上傳(" + this.limit + ")張圖片"
        });
        return false;
      }
      for (var key in e.target.files) {
        if (e.target.files[key] == e.target.files.length) {
          return false;
        }
        let res = await this.readFileAsync(e.target.files[key]);
        let img = await this.loadImgAsync(res);
        var self = this;
        EXIF.getData(img, async function() {
          var orientation = EXIF.getTag(this, "Orientation");
          var canvas = self.rotateImg(orientation, img);
          let img_buffer = canvas.toDataURL("image/jpeg", 1.0);
          let img_data = await self.dataURItoBlob(img_buffer);
          // let img = await self.loadImgAsync(img_buffer);
          // let compress_img_buffer = self.compress(img);
          let obj = {
            file: img_data,
            url: img_buffer,
            priority: self.preview_imgs.length + 1
          };
          self.preview_imgs.splice(len, 0, obj);
          self.$emit("change-img", self.preview_imgs);
          len += 1;
        });
      }
    },
    delete_img(index) {
      if (this.preview_imgs[index].id === undefined) {
        this.shift_priority(index);
        this.preview_imgs.splice(index, 1);
        this.$emit("change-img", this.preview_imgs);
      } else {
        this.shift_priority(index);
        this.$emit("delete-img", this.preview_imgs[index]);
        this.preview_imgs.splice(index, 1);
        this.$emit("change-img", this.preview_imgs);
      }
    },
    shift_priority(index) {
      index += 1;
      if (this.preview_imgs.length === index) return;
      for (let i = index; i < this.preview_imgs.length; i++) {
        this.preview_imgs[i].priority -= 1;
      }
    },
    compress(img) {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      let width = 0,
        height = 0;
      if (img.width > 1200 || img.height > 1200) {
        width = img.width / 2;
        height = img.height / 2;
      } else {
        width = img.width;
        height = img.height;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL("image/jpeg", 0.8);
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
      // canvas.width = img.width;
      // canvas.height = img.height;
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
    init_imgs() {
      for (let i in this.init_imgs) {
        this.preview_imgs.push(this.init_imgs[i]);
      }
      this.preview_imgs.sort(function(a, b) {
        return a.priority - b.priority;
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.close-icon {
  position: absolute;
  right: 10px;
  top: 0px;
  width: 32px;
  height: 32px;
  opacity: 0.8;
  background-color: #ffffff;
}

.close-icon:before,
.close-icon:after {
  position: absolute;
  left: 15px;
  content: " ";
  height: 33px;
  width: 2px;
  background-color: #000;
}
.close-icon:before {
  transform: rotate(45deg);
}
.close-icon:after {
  transform: rotate(-45deg);
}
</style>
