<template>
  <v-container grid-list-xs>
    <v-card class="elevation-10">
      <v-card-title primary-title>Edit Task</v-card-title>
      <v-card-text>
        <v-form v-model="form" ref="form">
          <v-layout row wrap>
            <v-flex xs12 md6 pa-2>
              <v-text-field
                color="black"
                :rules="[v => !!v || 'Required']"
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
                <template v-slot:activator="{ on }">
                  <v-text-field
                    color="secondary"
                    :rules="[v => !!v || 'Required']"
                    v-model="model.deadline"
                    label="Deadline"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  full-width
                  color="black"
                  v-model="model.deadline"
                >
                  <v-spacer></v-spacer>
                  <v-card-actions>
                    <v-btn text color="black" @click="model1 = false">OK</v-btn>
                  </v-card-actions>
                </v-date-picker>
              </v-dialog>
            </v-flex>
            <v-flex xs12 md6 pa-2>
              <v-dialog v-model="model2" persistent max-width="500">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    color="secondary"
                    :rules="[v => !!v || 'Required']"
                    v-model="model.timeTaken"
                    label="Minimum Time Taken"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  full-width
                  color="black"
                  v-model="model.timeTaken"
                >
                  <v-spacer></v-spacer>
                  <v-card-actions>
                    <v-btn text color="black" @click="model2 = false">OK</v-btn>
                  </v-card-actions>
                </v-date-picker>
              </v-dialog>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12 pa-2>
              <v-textarea
                color="black"
                label="Description"
                v-model="model.description"
              ></v-textarea>
            </v-flex>
          </v-layout>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="black" class="white--text" @click="save">
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
      user: "",
      tid: this.$route.params.tid,
      pid: this.$route.params.pid,
      task: {},
      form: false,
      fx: {
        users: [],
        fx_users: {}
      },
      model1: false,
      model2: false,
      model: {
        empAssigned: "",
        description: "",
        title: "",
        deadline: "",
        timeTaken: ""
      }
    };
  },
  methods: {
    async save() {
      this.$refs.form.validate();
      if (!this.form) return;
      let data = { ...this.model };
      data.deadline = new Date(data.deadline);
      data.timeTaken = new Date(data.timeTaken);
      let c = await Axios.put(
        "/api/task/one/" + this.pid + "/" + this.tid,
        data,
        { withCredentials: true }
      );
      this.snack.show = true;
      this.snack.text = c.data.message;
      if (c.data.success) {
        this.$router.push({
          name: "view-task",
          params: { pid: this.pid, tid: this.tid }
        });
      }
    },
    getDate(v) {
      let d1 = new Date(v);
      return `${d1.getFullYear()}-${d1.getMonth() + 1}-${d1.getDate()}`;
    },
    ...mapActions(["set_Login"]),
    ...mapGetters(["get_Login"]),
    async fetch_users() {
      let c = await Axios.get("/api/user/for-task", {
        withCredentials: true
      });
      c.data.users.forEach(user => {
        this.fx.users.push(`${user.name} <${user.email}>`);
        this.fx.fx_users[`${user.name} <${user.email}>`] = user._id;
      });
    },
    async fetch_task() {
      let c = await Axios.get("/api/task/one/" + this.pid + "/" + this.tid, {
        withCredentials: true
      });
      this.model.title = c.data.task.title;
      this.model.description = c.data.task.description;
      this.model.deadline = this.getDate(c.data.task.deadline);
      this.model.timeTaken = this.getDate(c.data.task.timeTaken);
      this.model.empAssigned = c.data.task.empAssigned._id;
      this.user =
        c.data.task.empAssigned.name +
        " <" +
        c.data.task.empAssigned.email +
        ">";
    }
  },
  async created() {
    let c = await checkLogin();
    this.set_Login(c);
    if (!this.get_Login()) {
      this.$router.push({ name: "login" });
    }
    this.fetch_users();
    this.fetch_task();
  }
};
</script>

<style></style>
