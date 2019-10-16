<template>
  <div>
    <v-card class="elevation-10">
      <v-card-title primary-title>
        All Employees List
        <v-spacer></v-spacer>
        <v-btn color="black" class="white--text" :to="{name:'new-user'}">
          <v-icon left>add</v-icon>add new
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-simple-table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, i) in users" :key="i">
              <td>{{user.name}}</td>
              <td>{{user.email}}</td>
              <td>{{user.role.toUpperCase()}}</td>
              <td class="text-center">
                <v-tooltip bottom>
                  <template v-slot:activator="{on}">
                    <v-btn v-on="on" text icon color="error" @click="delete_user(user._id)">
                      <v-icon>delete_forever</v-icon>
                    </v-btn>
                  </template>
                  <span>Delete User</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{on}">
                    <v-btn
                      v-on="on"
                      text
                      icon
                      color="primary"
                      :to="{name:'edit-user', params:{user:{name:user.name, email:user.email, role:user.role}, id:user._id}}"
                    >
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit User</span>
                </v-tooltip>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snack.show" color="black" right bottom :timeout="4000">
      {{snack.text}}
      <v-btn text icon @click.native="snack.show = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import Axios from "axios";
export default {
  data: () => ({
    snack: { show: false, text: "" },
    users: []
  }),
  methods: {
    async delete_user(id) {
      if (confirm("Are you sure?")) {
        let c = await Axios.delete("http://localhost:3000/api/user/one/" + id, {
          withCredentials: true
        });
        this.snack.show = true;
        this.snack.text = c.data.message;
        if (c.data.success) {
          this.fetch_user();
        }
      }
    },
    async fetch_user() {
      let c = await Axios.get("http://localhost:3000/api/user/all", {
        withCredentials: true
      });
      this.users = c.data.users;
    }
  },

  async created() {
    await this.fetch_user();
  }
};
</script>

<style>
</style>