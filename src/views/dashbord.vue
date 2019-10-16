<template>
  <v-container grid-list-xs fluid>
    <v-layout row wrap v-show="role == 'hr'">
      <v-flex xs12>
        <hr-employee></hr-employee>
      </v-flex>
    </v-layout>

    <v-layout row wrap v-show="role == 'employer'" mb-4>
      <v-flex xs6 pa-2>
        <empr-employee></empr-employee>
      </v-flex>
      <v-flex xs6 pa-2>
        <all-projects></all-projects>
      </v-flex>
    </v-layout>

    <v-layout row wrap v-show="role == 'employer'">
      <v-flex xs12 pa-2>
        <all-tasks></all-tasks>
      </v-flex>
    </v-layout>

    <v-layout row wrap v-show="role == 'employee'">
      <v-flex xs12>
        <my-tasks></my-tasks>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { checkLogin, getRole } from "../utils";
import { mapActions } from "vuex";
import HREmployee from "../components/hrployee";
import EMEmployee from "../components/employees";
import AllProjects from "../components/projects-all";
import AllTasks from "../components/tasks-all";
import MyTasks from "../components/tasks-my";
export default {
  data: () => ({
    role: ""
  }),
  components: {
    "hr-employee": HREmployee,
    "empr-employee": EMEmployee,
    "all-projects": AllProjects,
    "all-tasks": AllTasks,
    "my-tasks": MyTasks
  },
  methods: {
    ...mapActions(["set_Login"])
  },
  async created() {
    let c = await checkLogin();
    this.set_Login(c);
    if (!c) {
      this.$router.push({ name: "login" });
    }
    this.role = await getRole();
  }
};
</script>

<style></style>
