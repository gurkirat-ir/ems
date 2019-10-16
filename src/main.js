import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VueChatScroll from "vue-chat-scroll";

Vue.use(VueChatScroll);

Vue.config.productionTip = false;

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title;
  next();
});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
