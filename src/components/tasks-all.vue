<template>
  <div>
    <v-card class="elevation-10">
      <v-card-title primary-title>All Tasks from All Projects</v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="tasks">
          <template v-slot:item.createdOn="{value}">{{getDate(value)}}</template>
          <template v-slot:item.deadline="{value, item}">
            <v-chip
              class="white--text"
              :title="getDate(value)"
              color="red"
              v-show="getDeadlineDate(value)[1]"
            >ENDED {{getDeadlineDate(value)[0]}}</v-chip>
            <v-chip
              class="white--text"
              color="yellow darken-2"
              :title="getDate(value)"
              v-show="!getDeadlineDate(value)[1]"
            >ENDS {{getDeadlineDate(value)[0]}}</v-chip>
          </template>
          <template v-slot:item.status="{value, item}">
            <v-chip outlined color="red" label v-show="value=='PENDING'">{{value}}</v-chip>
            <v-chip outlined color="green" label v-show="value=='COMPLETED'">{{value}}</v-chip>
            <v-chip outlined color="blue" label v-show="value=='ON HOLD'">{{value}}</v-chip>
          </template>
          <template v-slot:item.actions="{item}">
            <v-tooltip bottom>
              <template v-slot:activator="{on}">
                <v-btn
                  v-on="on"
                  text
                  icon
                  color="green"
                  :to="{name:'view-task', params:{pid:item.project._id, tid:item._id}}"
                >
                  <v-icon>remove_red_eye</v-icon>
                </v-btn>
              </template>
              <span>View Task</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{on}">
                <v-btn
                  v-on="on"
                  text
                  icon
                  color="deep-purple"
                  :to="{name:'edit-task', params:{pid:item.project._id, tid:item._id}}"
                >
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>
              <span>Edit Task</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import Axios from "axios";
import moment from "moment";
export default {
  data: () => ({
    tasks: [],
    headers: [
      { name: "title", text: "Title", sortable: false, value: "title" },
      {
        name: "project",
        text: "Project",
        sortable: false,
        value: "project.title"
      },
      {
        name: "emp_name",
        text: "Assigned To",
        sortable: false,
        value: "empAssigned.name"
      },
      {
        name: "created",
        align: "center",
        text: "Created On",
        sortable: false,
        value: "createdOn"
      },
      {
        name: "deadline",
        text: "Deadline",
        align: "center",
        sortable: false,
        value: "deadline"
      },
      {
        name: "title",
        text: "Status",
        align: "center",
        sortable: false,
        value: "status"
      },
      {
        name: "actions",
        text: "Actions",
        align: "center",
        sortable: false,
        value: "actions"
      }
    ]
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
    let c = await Axios.get("http://localhost:3000/api/task/all", {
      withCredentials: true
    });
    this.tasks = c.data.tasks;
    console.log(c.data);
  }
};
</script>

<style>
</style>