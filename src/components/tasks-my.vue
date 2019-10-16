<template>
  <v-container grid-list-xs>
    <v-card class="elevation-10">
      <v-card-title primary-title>Tasks</v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="tasks">
          <template v-slot:item.status="{value}">
            <v-chip label outlined color="red" v-show="value=='PENDING'">{{value}}</v-chip>
            <v-chip label outlined color="blue" v-show="value=='ON HOLD'">{{value}}</v-chip>
            <v-chip label outlined color="green" v-show="value=='COMPLETED'">{{value}}</v-chip>
          </template>
          <template v-slot:item.createdOn="{value}">{{getDate(value)}}</template>
          <template v-slot:item.deadline="{value}">
            <v-chip
              class="white--text"
              :title="getDate(value)"
              label
              color="red"
              v-show="getDeadlineDate(value)[1]"
            >ENDED {{getDeadlineDate(value)[0]}}</v-chip>
            <v-chip
              label
              class="white--text"
              color="yellow darken-2"
              :title="getDate(value)"
              v-show="!getDeadlineDate(value)[1]"
            >ENDS {{getDeadlineDate(value)[0]}}</v-chip>
          </template>
          <template v-slot:item.action="{item}">
            <v-tooltip bottom>
              <template v-slot:activator="{on}">
                <v-btn
                  text
                  icon
                  color="green"
                  v-on="on"
                  :to="{name:'view-task', params:{tid:item._id, pid:item.project._id}}"
                >
                  <v-icon>remove_red_eye</v-icon>
                </v-btn>
              </template>
              <span>View Task</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Axios from "axios";
import moment from "moment";
export default {
  data: () => ({
    headers: [
      { name: "title", text: "Title", value: "title", sortable: false },
      {
        name: "project",
        text: "Project Name",
        value: "project.title",
        sortable: false
      },
      {
        name: "createdOn",
        text: "Created On",
        align: "center",
        value: "createdOn",
        sortable: false
      },
      {
        name: "deadline",
        text: "Deadline",
        align: "center",
        value: "deadline",
        sortable: false
      },
      {
        name: "status",
        text: "Status",
        value: "status",
        sortable: false
      },
      {
        name: "action",
        text: "Action",
        value: "action",
        sortable: false
      }
    ],
    tasks: []
  }),
  methods: {
    getDeadlineDate(v) {
      let deadline = new Date(v);
      let now = new Date(Date.now());
      let diff = deadline.getTime() - now.getTime();
      let date = this.getDate(v);
      return [
        moment(deadline)
          .from(now)
          .toUpperCase(),
        diff <= 0
      ];
    },
    getDate(v) {
      let d1 = new Date(v);
      return `${d1.getFullYear()}/${d1.getMonth() + 1}/${d1.getDate()}`;
    }
  },
  async created() {
    let c = await Axios.get("http://localhost:3000/api/task/my", {
      withCredentials: true
    });
    this.tasks = c.data.tasks;
  }
};
</script>

<style>
</style>