<template>
  <v-container grid-list-xs fluid>
    <v-layout row wrap>
      <v-flex md3></v-flex>
      <v-flex xs12 md6>
        <v-card class="elevation-10">
          <v-card-title primary-title>New User</v-card-title>
          <v-card-text>
            <v-form v-model="form" ref="form">
              <v-text-field color="black" :rules="[v=>!!v||'Required']" label="Name" v-model="name"></v-text-field>
              <v-text-field
                color="black"
                :rules="[v=>!!v||'Required', v=>/^[a-z].+@[a-z0-9]+\.[a-z]+$/i.test(v)||'Invalid Email']"
                label="Email"
                v-model="email"
              ></v-text-field>
              <v-text-field
                color="black"
                :rules="[v=>!!v||'Required']"
                label="Password"
                v-model="password"
              ></v-text-field>
              <v-radio-group v-model="role" row>
                <strong>ROLE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong>
                <v-radio color="black" label="HR" value="hr"></v-radio>
                <v-radio color="black" label="Employee" value="employee"></v-radio>
                <v-radio color="black" label="Employer" value="employer"></v-radio>
              </v-radio-group>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="black" class="white--text" @click="login">
              <v-icon left>person_add</v-icon>create
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
    <v-snackbar v-model="snack.show" color="black" right bottom :timeout="4000">
      {{snack.text}}
      <v-btn text icon @click.native="snack.show = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import { checkLogin } from "../utils";
import { mapActions } from "vuex";
import { createHash } from "crypto";
import Axios from "axios";
export default {
  data: () => ({
    role: "hr",
    name: "",
    password: "",
    email: "",
    form: false,
    snack: { show: false, text: "" }
  }),
  methods: {
    ...mapActions(["set_Login"]),
    async login() {
      this.$refs.form.validate();
      if (!this.form) return;

      let doc = {
        name: this.name,
        email: this.email,
        role: this.role,
        password: createHash("sha256")
          .update(this.password)
          .digest("base64")
      };

      let c = await Axios.post("http://localhost:3000/api/user/new", doc, {
        withCredentials: true
      });

      this.snack.show = true;
      this.snack.text = c.data.message;

      if (c.data.success) {
        this.$router.push({ name: "dashboard" });
      }
    }
  },
  async created() {
    let c = await checkLogin();
    this.set_Login(c);
    if (!c) {
      this.$router.push({ name: "login" });
    }
  }
};
</script>

<style>
</style>