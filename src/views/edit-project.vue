<template>
  <v-container grid-list-xs>
    <v-card class="elevation-10">
      <v-card-title primary-title>Edit Project</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="form">
          <v-layout row wrap>
            <v-flex xs12 md6 pa-2>
              <v-text-field
                color="black"
                label="Title"
                v-model="project.title"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 md6 pa-2>
              <v-text-field
                color="black"
                label="Deadline"
                v-model="project.deadline"
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12>
              <v-radio-group v-model="project.status" row>
                <strong>Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong>
                <v-radio color="red" label="Pending" value="PENDING"></v-radio>
                <v-radio
                  color="orange"
                  label="On Hold"
                  value="ON HOLD"
                ></v-radio>
                <v-radio
                  color="green"
                  label="Completed"
                  value="COMPLETED"
                ></v-radio>
              </v-radio-group>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12>
              <v-textarea
                color="black"
                v-model="project.description"
                label="Description"
              ></v-textarea>
            </v-flex>
          </v-layout>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="black" class="white--text" @click="put_project">
          <v-icon left>save</v-icon>save
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-snackbar v-model="snack.show" color="black" right bottom :timeout="4000">
      {{ snack.text }}
      <v-btn text icon @click.native="snack.show = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import { checkLogin } from "../utils";
import { mapActions, mapGetters } from "vuex";
import Axios from "axios";
export default {
  data() {
    return {
      snack: { show: false, text: "" },
      form: false,
      id: this.$route.params.id,
      project: { title: "", deadline: "", description: "", status: "" }
    };
  },
  methods: {
    ...mapActions(["set_Login"]),
    ...mapGetters(["get_Login"]),
    async fetch_project() {
      let c = await Axios.get(
        "http://localhost:3000/api/project/one/" + this.id,
        { withCredentials: true }
      );

      this.project.title = c.data.projects.title;
      this.project.deadline = this.getDate(c.data.projects.deadline);
      this.project.description = c.data.projects.description;
      this.project.status = c.data.projects.status;
    },
    async put_project() {
      let c = await Axios.put(
        "http://localhost:3000/api/project/one/" + this.id,
        this.project,
        { withCredentials: true }
      );
      this.snack.show = true;
      this.snack.text = c.data.message;
      if (c.data.success) {
        this.$router.push({ name: "view-project", params: { id: this.id } });
      }
    },
    getDate(v) {
      let d1 = new Date(v);
      return `${d1.getFullYear()}-${d1.getMonth() + 1}-${d1.getDate()}`;
    }
  },
  async created() {
    let c = await checkLogin();
    this.set_Login(c);
    this.fetch_project();
    if (!this.get_Login()) {
      this.$router.push({ name: "dashboard" });
    }
  }
};
</script>

<style></style>
