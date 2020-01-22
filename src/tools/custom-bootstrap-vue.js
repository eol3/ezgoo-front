import {
  BRow,
  BCol,
  BBreadcrumb,
  BCarousel,
  BCarouselSlide,
  BCard,
  BCardText,
  BNavbar,
  BNavbarToggle,
  BCollapse,
  BLink,
  BAlert,
  BButton,
  BTable,
  BPagination,
  BForm,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormFile,
  BFormCheckbox,
  BSpinner,
  BImgLazy,
  VBModal,
  ModalPlugin,
  BModal
} from "bootstrap-vue";

var custom = function(Vue) {
  Vue.component("b-row", BRow);
  Vue.component("b-col", BCol);
  Vue.component("b-breadcrumb", BBreadcrumb);
  Vue.component("b-carousel", BCarousel);
  Vue.component("b-carousel-slide", BCarouselSlide);
  Vue.component("b-card", BCard);
  Vue.component("b-card-text", BCardText);
  Vue.component("b-navbar", BNavbar);
  Vue.component("b-navbar-toggle", BNavbarToggle);
  Vue.component("b-collapse", BCollapse);
  Vue.component("b-link", BLink);
  Vue.component("b-alert", BAlert);
  Vue.component("b-button", BButton);
  Vue.component("b-table", BTable);
  Vue.component("b-pagination", BPagination);
  Vue.component("b-form", BForm);
  Vue.component("b-form-group", BFormGroup);
  Vue.component("b-form-input", BFormInput);
  Vue.component("b-form-textarea", BFormTextarea);
  Vue.component("b-form-file", BFormFile);
  Vue.component("b-form-checkbox", BFormCheckbox);
  Vue.component("b-spinner", BSpinner);
  Vue.component("b-img-lazy", BImgLazy);

  Vue.component("b-modal", BModal);
  Vue.use(ModalPlugin);
  Vue.directive("b-modal", VBModal);
};

export default custom;
