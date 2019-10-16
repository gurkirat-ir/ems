<template>
  <v-app>
    <v-app-bar app dark color="secondary">
      <v-toolbar-title class="headline text-uppercase">
        <span>EMS</span>
        <span class="font-weight-light">&nbsp;Solution</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn text :to="{ name: 'dashboard' }" v-show="get_Login()">
          <v-icon left>dashboard</v-icon>
          <span class="mr-2">dashboard</span>
        </v-btn>
        <v-btn
          text
          href="/#/logout"
          @click.prevent="logout"
          v-show="get_Login()"
        >
          <v-icon left>power_settings_new</v-icon>
          <span class="mr-2">Logout</span>
        </v-btn>
        <v-btn text :to="{ name: 'login' }" v-show="!get_Login()">
          <v-icon left>exit_to_app</v-icon>
          <span class="mr-2">Login</span>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Axios from "axios";
export default {
  name: "App",
  methods: {
    ...mapGetters(["get_Login"]),
    ...mapActions(["set_Login"]),
    async logout() {
      await Axios.delete("/api/user/login", {
        withCredentials: true
      });
      this.set_Login(false);
      this.$router.push({ name: "login" });
    }
  }
};
</script>
