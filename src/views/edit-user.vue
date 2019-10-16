<template>
  <v-container grid-list-xs fluid>
    <v-layout row wrap>
      <v-flex md3></v-flex>
      <v-flex xs12 md6>
        <v-card class="elevation-10">
          <v-card-title primary-title>Edit User</v-card-title>
          <v-card-text>
            <v-form v-model="form" ref="form">
              <v-text-field
                color="black"
                :rules="[v=>!!v||'Required']"
                label="Name"
                v-model="model.name"
              ></v-text-field>
              <v-text-field
                color="black"
                :rules="[v=>!!v||'Required', v=>/^[a-z].+@[a-z0-9]+\.[a-z]+$/i.test(v)||'Invalid Email']"
                label="Email"
                v-model="model.email"
              ></v-text-field>
              <v-radio-group v-model="model.role" row>
                <strong>ROLE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong>
                <v-radio color="black" label="HR" value="hr"></v-radio>
                <v-radio color="black" label="Employee" value="employee"></v-radio>
                <v-radio color="black" label="Employer" value="employer"></v-radio>
              </v-radio-group>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="black" class="white--text" @click="save">
              <v-icon left>save</v-icon>save
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
import Axios from "axios";
export default {
  props: ["user"],
  data: () => ({
    model: {},
    id: "",
    form: false,
    snack: { show: false, text: "" }
  }),
  methods: {
    async save() {
      this.$refs.form.validate();
      if (!this.form) return;

      let c = await Axios.put(
        "http://localhost:3000/api/user/one/" + this.id,
        this.model,
        { withCredentials: true }
      );

      this.snack.show = true;
      this.snack.text = c.data.message;

      if (c.data.success) {
        this.$router.push({ name: "dashboard" });
      }
    }
  },
  created() {
    if (!this.user) {
      this.$router.go(-1);
    } else {
      this.model = this.user;
      this.id = this.$route.params.id;
    }
  }
};
</script>

<style>
</style>