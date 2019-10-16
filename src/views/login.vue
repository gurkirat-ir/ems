<template>
  <v-container grid-list-xs fluid>
    <v-layout row wrap>
      <v-flex md3></v-flex>
      <v-flex xs12 md6>
        <v-card class="elevation-10">
          <v-card-title primary-title>Enter Login Credentials</v-card-title>
          <v-card-text>
            <v-form v-model="form1" ref="form1">
              <v-text-field
                v-model="email"
                label="E-mail"
                :rules="[
                  v => !!v || 'Required',
                  v => /^[a-z].+@[a-z0-9]+\.[a-z]+$/i.test(v) || 'Invalid Email'
                ]"
                color="secondary"
              ></v-text-field>
            </v-form>
            <v-form v-model="form2" ref="form2">
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                :rules="[v => !!v || 'Required']"
                color="secondary"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              text
              small
              color="black"
              href="/#/reset-password"
              @click.prevent="reset_password"
              >reset password</v-btn
            >
            <v-spacer></v-spacer>
            <v-btn color="black" class="white--text" @click="login">
              <v-icon left>exit_to_app</v-icon>login
            </v-btn>
          </v-card-actions>
          <v-snackbar
            v-model="snack.show"
            color="black"
            right
            bottom
            :timeout="4000"
          >
            {{ snack.text }}
            <v-btn text icon @click.native="snack.show = false">
              <v-icon>close</v-icon>
            </v-btn>
          </v-snackbar>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { checkLogin } from "../utils";
import { mapGetters, mapActions } from "vuex";
import Axios from "axios";
import { createHash } from "crypto";
export default {
  data: () => ({
    snack: { show: false, text: "" },
    form1: false,
    form2: false,
    email: "",
    password: ""
  }),
  methods: {
    ...mapActions(["set_Login"]),
    ...mapGetters(["get_Login"]),
    async reset_password() {
      this.$refs.form1.validate();
      if (!this.form1) return;
      let r = await Axios.put("http://localhost:3000/api/user/reset-password", {
        email: this.email
      });
      this.snack.show = true;
      this.snack.text = r.data.message;
    },
    async login() {
      this.$refs.form1.validate();
      this.$refs.form2.validate();

      if (!this.form1 || !this.form2) return;

      let c = await Axios.post(
        "http://localhost:3000/api/user/login",
        {
          email: this.email,
          password: createHash("sha256")
            .update(this.password)
            .digest("base64")
        },
        { withCredentials: true }
      );

      if (!c.data.success) {
        this.snack.show = true;
        this.snack.text = c.data.message;
      } else {
        this.set_Login(true);
        this.$router.push({ name: "dashboard" });
      }
    }
  },
  async created() {
    let c = await checkLogin();
    this.set_Login(c);
    if (this.get_Login()) {
      this.$router.push({ name: "dashboard" });
    }
  }
};
</script>

<style></style>
