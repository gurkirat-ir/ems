<template>
  <div>
    <v-card class="elevation-10">
      <v-card-title primary-title>List All Employee</v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items-per-page="5" :items="users"></v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import Axios from "axios";
export default {
  data: () => ({
    headers: [
      { name: "name", text: "Name", value: "name", sortable: false },
      { name: "email", text: "Email", value: "email", sortable: false },
      {
        name: "num_proj",
        text: "Projects Assigned",
        value: "num_proj",
        sortable: true
      }
    ],
    users: []
  }),
  async created() {
    let c = await Axios.get("http://localhost:3000/api/user/all-for-employee", {
      withCredentials: true
    });
    this.users = c.data.users;
  }
};
</script>

<style>
</style>