<template>
  <div>
    <div
      :class="{
            'img-photo': true,
            'img-photo-w160': isLandscape,
            'img-photo-h120': isPortrait,
          }"
    >
      <span v-if="value !== ''">
        <img id="image-upload-view" :key="value" :src="value" class="img-view" width="40" alt />
      </span>
      <span v-else>
        <img id="image-upload-view" src="./camera-icon-black.svg" width="40" alt />
      </span>
    </div>
    <div class="upload-btn-wrapper">
      <button
        type="button"
        class="btn"
        @click="onUploadPictureClick"
        :disabled="disableButton"
      >{{buttonName}}</button>
      <input
        :id="id"
        type="file"
        tabindex="1"
        :disabled="disableButton"
        @input="onimageUpload($event)"
        @change="onimageUpload($event)"
        @click="onUploadPictureClick"
      />
    </div>
    <p
      v-show="fileUploadErrorMessage || fileError || fileSizeErrorMessage"
      :class="{ 'error-msg': true }"
    >
      <span v-show="fileUploadErrorMessage">{{imageUploadErrorMessage}}</span>
      <span v-show="fileSizeErrorMessage">{{imageSizeErrorMessage}}</span>
      <span v-show="fileError">{{invalidImageErrorMessage}}</span>
    </p>
    <div>
      <b-modal v-model="isShowCropModal" id="image-crop" no-close-on-esc no-close-on-backdrop>
        <template v-slot:modal-header>
          <span aria-hidden="true" class="close pointer" @click="onCancelCrop">×</span>
        </template>
        <clipper-fixed
          ref="clipper"
          class="my-clipper"
          :src="value"
          :round="isRoundCrop"
          :area="40"
        />
        <template v-slot:modal-footer>
          <div class="popup-btn">
            <b-button @click="onCrop">Crop</b-button>
          </div>
          <div class="popup-btn">
            <b-button @click="onCancelCrop">Cancel</b-button>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import * as utils from "./utils.js";
import VuejsClipper from "vuejs-clipper";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import { BootstrapVue } from "bootstrap-vue";

Vue.use(BootstrapVue);

Vue.use(VuejsClipper, {
  components: {
    clipperBasic: true,
    clipperPreview: true,
    clipperFixed: true
  }
});

export default {
  data() {
    return {
      isShowCropModal: false,
      tempImageUrl: "",
      fileUploadErrorMessage: false,
      fileSizeErrorMessage: false,
      fileError: false
    };
  },
  components: {},
  props: {
    isCrop: {
      type: Boolean,
      default: true
    },
    acceptedFiles: {
      type: Array,
      default: function() {
        return ["image", "image/jpeg", "image/jpg", "image/png", "png"];
      }
    },
    value: {
      type: String,
      default: ""
    },
    id: {
      type: String,
      default: "image-upload"
    },
    disableButton: {
      type: Boolean,
      default: false
    },
    buttonName: {
      type: String,
      default: "Upload image"
    },
    imagesize: {
      type: Number,
      default: 5000000
    },
    isLandscape: {
      type: Boolean,
      default: false
    },
    isPortrait: {
      type: Boolean,
      default: false
    },
    imageUploadErrorMessage: {
      type: String,
      default: "Only jpg, jpeg and png are allowed."
    },
    imageSizeErrorMessage: {
      type: String,
      default: "Failed to upload an image. The image maximum size is 5MB."
    },
    invalidImageErrorMessage: {
      type: String,
      default: "The uploaded image is not valid."
    },
    isRoundCrop: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    /**
     * This method is used for on upload picture click event
     * @param {*} event
     */
    onUploadPictureClick(event) {
      event.target.value = "";
    },
    /**
     * This method is used for on crop event
     */
    onCrop() {
      const canvas = this.$refs.clipper.clip();
      this.value = canvas.toDataURL();
      this.isShowCropModal = false;
    },
    /**
     * This method is used for on cancel crop event
     */
    onCancelCrop() {
      this.value = this.tempImageUrl;
      this.isShowCropModal = false;
      this.tempImageUrl = "";
    },
    /**
     * This method is used for on image upload
     * @param {*} e
     */
    onimageUpload(e) {
      if (this.value !== "") {
        this.tempImageUrl = this.value;
      }
      let width;
      let height;
      const file = e.target.files[0];
      if (file !== undefined) {
        if (file.type !== undefined && this.acceptedFiles.includes(file.type)) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            const image = new Image();
            image.src = reader.result;
            image.onload = () => {
              width = image.width;
              height = image.height;
              const block = image.src.split(";");
              const contentType = block[0].split(":")[1];
              const realData = block[1].split(",")[1];
              const blob = utils.b64toBlob(realData, contentType);
              const imageUrl = window.URL.createObjectURL(blob);
              this.onValidImage(file, imageUrl, this.id, width, height, e);
            };
          };
        } else {
          this.onValidImage(file, undefined, this.id, undefined, undefined, e);
        }
      }
      e.target.value = "";
    },

    /**
     * This method is used for on valid image upload
     * @param {*} file
     * @param {*} url
     * @param {*} width
     * @param {*} height
     * @param {*} e
     */
    onValidImage(file, url, id, width, height, e) {
      if (id === this.id) {
        this.fileSizeErrorMessage = false;
        this.fileUploadErrorMessage = false;
        this.fileError = false;
        if (this.acceptedFiles.includes(file.type)) {
          if (this.imagesize > file.size) {
            if (this.isLandscape) {
              if (width > height) {
                this.value = url;
                if (this.isCrop) {
                  this.isShowCropModal = true;
                }
              } else {
                this.fileError = true;
              }
            } else if (this.isPortrait) {
              if (width < height) {
                this.value = url;
                if (this.isCrop) {
                  this.isShowCropModal = true;
                }
              } else {
                this.fileError = true;
              }
            } else {
              this.value = url;
              if (this.isCrop) {
                this.isShowCropModal = true;
              }
            }
          } else {
            this.fileSizeErrorMessage = true;
          }
        } else {
          this.fileUploadErrorMessage = true;
        }
      }
      e.target.value = "";
    }
  }
};
</script>

<style scoped>
@import "./style.css";
</style>
