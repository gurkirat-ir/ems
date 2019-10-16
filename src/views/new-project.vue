<template>
  <div>
    <v-layout row wrap mt-5>
      <v-flex md2></v-flex>
      <v-flex xs12 md8>
        <v-card class="elevation-10">
          <v-card-title primary-title>New Project</v-card-title>
          <v-card-text>
            <v-form v-model="form" ref="form">
              <v-layout row wrap>
                <v-flex xs12 md6 pa-2>
                  <v-text-field
                    color="secondary"
                    :rules="[v=>!!v||'Required']"
                    label="Title"
                    v-model="title"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md6 pa-2>
                  <v-dialog persistent v-model="model" max-width="500">
                    <template v-slot:activator="{on}">
                      <v-text-field
                        color="secondary"
                        :rules="[v=>!!v||'Required']"
                        v-model="date"
                        label="Deadline"
                        v-on="on"
                      ></v-text-field>
                    </template>

                    <v-date-picker
                      full-width
                      locale="in_HI"
                      color="black"
                      :rules="[v=>!!v||'Required']"
                      v-model="date"
                      :landscape="false"
                    >
                      <v-spacer></v-spacer>
                      <v-card-actions>
                        <v-btn text color="black" @click="model=false">OK</v-btn>
                      </v-card-actions>
                    </v-date-picker>
                  </v-dialog>
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex xs12 pa-2>
                  <v-textarea color="black" label="Description" v-model="desc"></v-textarea>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="black" class="white--text" @click="post_project">
              <v-icon left>add</v-icon>create
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
  </div>
</template>

<script>
import { checkLogin } from "../utils";
import { mapActions } from "vuex";
import Axios from "axios";
export default {
  data: () => ({
    snack: { show: false, text: "" },
    model: false,
    date: "",
    desc: "",
    title: "",
    form: false
  }),
  methods: {
    ...mapActions(["set_Login"]),
    async post_project() {
      this.$refs.form.validate();
      if (!this.form) return;
      let doc = {
        title: this.title,
        description: this.desc,
        deadline: new Date(this.date)
      };
      let r = await Axios.post("http://localhost:3000/api/project/new", doc, {
        withCredentials: true
      });
      this.snack.show = true;
      this.snack.text = r.data.message;
      if (r.data.success) {
        this.$router.push({ name: "view-project", params: { id: r.data.id } });
      }
    }
  },
  async created() {
    let d = new Date();
    this.date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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