<template>
  <div>
    <v-card class="elevation-10">
      <v-card-title primary-title>
        All Projects
        <v-spacer></v-spacer>
        <v-btn color="black" class="white--text" :to="{ name: 'new-project' }">
          <v-icon left>add</v-icon>new project
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="projects" :items-per-page="5">
          <template v-slot:item.deadline="{ value, item }">
            <v-chip
              class="white--text"
              :title="getDate(value)"
              color="red"
              v-show="getDeadlineDate(value)[1]"
              >ENDED {{ getDeadlineDate(value)[0] }}</v-chip
            >
            <v-chip
              class="white--text"
              color="yellow darken-2"
              :title="getDate(value)"
              v-show="!getDeadlineDate(value)[1]"
              >ENDS {{ getDeadlineDate(value)[0] }}</v-chip
            >
          </template>
          <template v-slot:item.status="{ value, item }">
            <v-chip outlined color="red" label v-show="value == 'PENDING'">
              {{ value }}
            </v-chip>
            <v-chip
              outlined
              color="green"
              label
              v-show="value == 'COMPLETED'"
              >{{ value }}</v-chip
            >
            <v-chip outlined color="blue" label v-show="value == 'ON HOLD'">
              {{ value }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item, value }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  text
                  icon
                  color="green"
                  :to="{ name: 'view-project', params: { id: item._id } }"
                >
                  <v-icon>remove_red_eye</v-icon>
                </v-btn>
              </template>
              <span>View</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  text
                  icon
                  color="blue"
                  :to="{
                    name: 'new-task',
                    params: { pid: item._id, name: item.name }
                  }"
                >
                  <v-icon>note_add</v-icon>
                </v-btn>
              </template>
              <span>Add New Task</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  text
                  icon
                  color="deep-purple"
                  :to="{ name: 'edit-project', params: { id: item._id } }"
                >
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>
              <span>Edit Project</span>
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
    headers: [
      { name: "title", text: "Title", sortable: false, value: "title" },
      {
        name: "deadline",
        text: "Deadline",
        align: "center",
        sortable: true,
        value: "deadline"
      },
      {
        name: "status",
        text: "Status",
        align: "center",
        value: "status"
      },
      { name: "num_tasks", text: "Tasks", sortable: true, value: "num_tasks" },
      { name: "actions", text: "Actions", sortable: false, value: "actions" }
    ],
    projects: []
  }),
  async created() {
    let c = await Axios.get("/api/project/all", {
      withCredentials: true
    });
    let projects = Array.from([...c.data.projects]);
    this.projects = projects;
  },
  methods: {
    getDeadlineDate(v) {
      let deadline = new Date(v);
      let now = new Date(Date.now());
      let diff = deadline.getTime() - now.getTime();
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
  }
};
</script>

<style>
.mytable .v-table tbody tr:not(:last-child) {
  border-bottom: none;
}
</style>
