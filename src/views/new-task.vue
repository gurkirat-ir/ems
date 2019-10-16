<template>
  <v-container grid-list-xs>
    <v-layout row wrap>
      <v-flex md2></v-flex>
      <v-flex xs12 md8>
        <v-card class="elevation-10">
          <v-card-title primary-title>New Task</v-card-title>
          <v-card-text>
            <v-form v-model="form" ref="form">
              <v-layout row wrap>
                <v-flex xs12 md6 pa-2>
                  <v-text-field
                    color="black"
                    :rules="[v=>!!v||'Required']"
                    label="Title"
                    v-model="model.title"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md6 pa-2>
                  <v-combobox
                    color="black"
                    :items="fx.users"
                    v-model="user"
                    @change="model.empAssigned = fx.fx_users[user]"
                    item-color="secondary"
                    label="Assign Employee"
                  ></v-combobox>
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex xs12 md6 pa-2>
                  <v-dialog v-model="model1" persistent max-width="500">
                    <template v-slot:activator="{on}">
                      <v-text-field
                        color="secondary"
                        :rules="[v=>!!v||'Required']"
                        v-model="model.deadline"
                        label="Deadline"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker full-width color="black" v-model="model.deadline">
                      <v-spacer></v-spacer>
                      <v-card-actions>
                        <v-btn text color="black" @click="model1=false">OK</v-btn>
                      </v-card-actions>
                    </v-date-picker>
                  </v-dialog>
                </v-flex>
                <v-flex xs12 md6 pa-2>
                  <v-dialog v-model="model2" persistent max-width="500">
                    <template v-slot:activator="{on}">
                      <v-text-field
                        color="secondary"
                        :rules="[v=>!!v||'Required']"
                        v-model="model.timeTaken"
                        label="Minimum Time Taken"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker full-width color="black" v-model="model.timeTaken">
                      <v-spacer></v-spacer>
                      <v-card-actions>
                        <v-btn text color="black" @click="model2=false">OK</v-btn>
                      </v-card-actions>
                    </v-date-picker>
                  </v-dialog>
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex xs12 pa-2>
                  <v-textarea color="black" label="Description" v-model="model.description"></v-textarea>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="black" class="white--text ma-2" @click="post_task">
              <v-icon>add</v-icon>create and assign
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
import { mapActions, mapGetters } from "vuex";
import { checkLogin } from "../utils";
import Axios from "axios";
export default {
  data() {
    return {
      snack: { show: false, text: "" },
      id: this.$route.params.pid,
      form: false,
      user: "",
      model1: false,
      model2: false,
      model: {
        empAssigned: "",
        description: "",
        title: "",
        deadline: "",
        timeTaken: ""
      },
      fx: {
        users: [],
        fx_users: {}
      }
    };
  },
  methods: {
    ...mapActions(["set_Login"]),
    ...mapGetters(["get_Login"]),
    async fetch_users() {
      let c = await Axios.get("http://localhost:3000/api/user/for-task", {
        withCredentials: true
      });
      c.data.users.forEach(user => {
        this.fx.users.push(`${user.name} <${user.email}>`);
        this.fx.fx_users[`${user.name} <${user.email}>`] = user._id;
      });
      this.user = this.fx.users[0];
      this.model.empAssigned = this.fx.fx_users[this.user];
    },
    async post_task() {
      this.$refs.form.validate();
      if (!this.form) return;
      let data = { ...this.model };

      data.deadline = new Date(data.deadline);
      data.timeTaken = new Date(data.timeTaken);

      let r = await Axios.post(
        "http://localhost:3000/api/task/new/" + this.id,
        data,
        { withCredentials: true }
      );

      this.snack.show = true;
      this.snack.text = r.data.message;

      if (r.data.success) {
        this.$router.push({
          name: "view-task",
          params: { pid: r.data.project, tid: r.data.task }
        });
      }
    }
  },
  async created() {
    let c = await checkLogin();
    this.set_Login(c);
    if (!this.get_Login()) {
      this.$router.push({ name: "login" });
    }
    this.fetch_users();
  }
};
</script>

<style>
</style>