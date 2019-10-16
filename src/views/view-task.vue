<template>
  <v-container grid-list-xs>
    <v-card class="elevation-10" min-height="100%" height="100%">
      <v-card-title primary-title>
        {{ task.title }}
        <v-spacer></v-spacer>
        <v-radio-group @change="c_status" v-model="status" row>
          <strong>Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong>
          <v-radio color="red" label="Pending" value="PENDING"></v-radio>
          <v-radio color="blue" label="On Hold" value="ON HOLD"></v-radio>
          <v-radio color="green" label="Completed" value="COMPLETED"></v-radio>
        </v-radio-group>
      </v-card-title>
      <v-card-text>
        <v-layout row wrap>
          <br />
          <v-flex xs12 md5 pa-2>
            <center>
              <strong>Project Details</strong>
              <br />
              <br />
            </center>
            <p>
              <strong>Description:&nbsp;</strong>
              <span style="font-family: monospace">{{ task.description }}</span>
            </p>
            <p>
              <strong>Project:&nbsp;</strong>
              <span>
                <router-link
                  :to="{
                    name: 'view-project',
                    params: { id: task.project._id }
                  }"
                  >{{ task.project.title }}</router-link
                >
              </span>
            </p>
            <p>
              <strong>Assigned To:&nbsp;</strong>
              <span>
                <a :href="`mailto:${task.empAssigned.email}`">
                  {{ task.empAssigned.name }}
                </a>
              </span>
            </p>
            <p>
              <strong>Created On:&nbsp;</strong>
              {{ getDate(task.createdOn) }}
            </p>
            <p>
              <strong>Expected Time of Completion:&nbsp;</strong>
              {{ getDate(task.timeTaken) }}
            </p>
            <p v-show="!task.completedOn">
              <strong>Deadline:&nbsp;</strong>
              {{ getDate(task.deadline) }}
            </p>
            <p v-show="task.completedOn">
              <strong>Completed On:&nbsp;</strong>
              {{ getDate(task.completedOn) }}
            </p>
          </v-flex>
          <v-flex xs12 md7 pa-2>
            <center>
              <strong>Comments</strong>
              <br />
              <br />
            </center>
            <v-card flat>
              <v-card-text
                style="min-height: 300px;max-height: 300px; overflow-y:auto"
                v-chat-scroll
              >
                <p v-for="(c, i) in task.comments" :key="i">
                  <comment
                    :username="c.who.name"
                    :email="c.who.email"
                    :time="getDate(c.when)"
                    :content="c.what"
                  ></comment>
                </p>
              </v-card-text>
              <v-card-actions justify-center>
                <v-layout row wrap>
                  <v-text-field
                    outlined
                    label="Message"
                    v-model="msg"
                    color="black"
                    append-icon="send"
                    @click:append="send_msg"
                    @keypress.enter="send_msg"
                  ></v-text-field>
                </v-layout>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-card-text>
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
import { mapActions, mapGetters } from "vuex";
import { checkLogin } from "../utils";
import Axios from "axios";
import Comment from "../components/comment";

export default {
  components: {
    Comment
  },
  data() {
    return {
      msg: "",
      snack: { show: false, text: "" },
      status: "",
      tid: this.$route.params.tid,
      pid: this.$route.params.pid,
      task: { project: {}, empAssigned: {} },
      isEmployee: undefined
    };
  },
  methods: {
    async send_msg() {
      if (this.msg.length == 0) return;
      let c = await Axios.post(
        "/api/comment/new/" + this.tid,
        { content: this.msg },
        { withCredentials: true }
      );
      this.snack.show = true;
      this.snack.text = c.data.message;

      if (c.data.success) {
        this.fetch_comments();
        this.msg = "";
      }
    },
    async c_status(status) {
      let c = await Axios.put(
        "/api/task/one/" + this.pid + "/" + this.tid + "/status",
        { status },
        { withCredentials: true }
      );
      this.snack.show = true;
      this.snack.text = c.data.message;
      if (c.data.success) {
        this.fetch_task();
      }
    },
    async fetch_comments() {
      let c = await Axios.get("/api/comment/all/" + this.tid, {
        withCredentials: true
      });
      this.task.comments = c.data.comments;
    },
    ...mapActions(["set_Login"]),
    ...mapGetters(["get_Login"]),
    getDate(v) {
      let d1 = new Date(v);
      return `${d1.getFullYear()}/${d1.getMonth() + 1}/${d1.getDate()}`;
    },
    async fetch_task() {
      let c = await Axios.get("/api/task/one/" + this.pid + "/" + this.tid, {
        withCredentials: true
      });
      this.task = c.data.task;
      this.status = this.task.status;
    }
  },

  async created() {
    let c = await checkLogin();
    this.set_Login(c);
    this.fetch_task();
    if (!this.get_Login()) {
      this.$router.push({ name: "dashboard" });
    }
  }
};
</script>

<style scoped>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
#te {
  min-height: 100%;
  max-height: 100%;
  height: 100%;
}
</style>
