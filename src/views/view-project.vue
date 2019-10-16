<template>
  <v-container grid-list-xs>
    <v-card class="elevation-10">
      <v-card-title primary-title>
        {{ project.title }}
        <v-spacer></v-spacer>
        <v-btn
          text
          icon
          color="primary"
          :to="{ name: 'edit-project', params: { id } }"
        >
          <v-icon>edit</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <br />
        <p>
          <strong>Description:&nbsp;&nbsp;</strong>
          <span style="font-family: monospace;">{{ project.description }}</span>
        </p>
        <p>
          <strong>Status:&nbsp;&nbsp;</strong>
          {{ project.status }}
        </p>
        <p>
          <strong>Start Date:&nbsp;</strong>
          {{ getDate(project.createdOn) }}
        </p>
        <p>
          <strong>End Date:&nbsp;</strong>
          {{ getDate(project.deadline) }}
        </p>
        <p v-show="project.tasks.length > 0">
          <strong>Tasks:&nbsp;</strong>
          <span>
            <ul>
              <li v-for="(task, i) in project.tasks" :key="i">
                "
                <b>{{ task.title }}</b
                >" was created on " <b>{{ getDate(task.createdOn) }}</b
                >" and due on " <b>{{ getDate(task.deadline) }}</b
                >". This task is " <b>{{ task.status }}</b
                >".
                <router-link
                  :to="{
                    name: 'view-task',
                    params: { pid: id, tid: task._id }
                  }"
                  >VIEW</router-link
                >
              </li>
            </ul>
          </span>
        </p>
        <p>
          <strong>All Employees Assigned to This Project&nbsp;</strong>
          <span>
            <ul>
              <li v-for="(emp, i) in project.empAssigned" :key="i">
                <a :href="`mailto:${emp.email}`">{{ emp.name }}</a>
              </li>
            </ul>
          </span>
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { checkLogin } from "../utils";
import Axios from "axios";
export default {
  data() {
    return {
      id: this.$route.params.id,
      project: {}
    };
  },
  methods: {
    ...mapActions(["set_Login"]),
    ...mapGetters(["get_Login"]),
    getDate(v) {
      let d1 = new Date(v);
      return `${d1.getFullYear()}/${d1.getMonth() + 1}/${d1.getDate()}`;
    },
    async fetch_project() {
      let c = await Axios.get(
        "http://localhost:3000/api/project/one/" + this.id,
        { withCredentials: true }
      );
      this.project = c.data.projects;
    }
  },
  async created() {
    let c = await checkLogin();
    this.set_Login(c);
    if (!this.get_Login()) {
      this.$router.push({ name: "dashboard" });
    }
    await this.fetch_project();
  }
};
</script>

<style></style>
