import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  actions: {
    set_Login({ commit, state }, payload) {
      commit("LOGIN", payload);
      return state.login;
    }
  },
  getters: {
    get_Login: ({ login }) => login
  },
  mutations: {
    LOGIN(state, payload) {
      state.login = payload;
    }
  },
  state: {
    login: false
  }
});
