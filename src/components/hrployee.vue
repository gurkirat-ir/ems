<template>
  <div>
    <v-card class="elevation-10">
      <v-card-title primary-title>
        All Employees List
        <v-spacer></v-spacer>
        <v-btn color="black" class="white--text" :to="{ name: 'new-user' }">
          <v-icon left>add</v-icon>add new
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items-per-page="5"
          :items="users"
          hide-default-footer
        >
          <template v-slot:item.action="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  text
                  icon
                  color="red"
                  v-on="on"
                  @click="delete_user(item._id)"
                >
                  <v-icon>delete_forever</v-icon>
                </v-btn>
              </template>
              <span>Delete User</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  text
                  v-on="on"
                  icon
                  color="green"
                  :to="{
                    name: 'edit-user',
                    params: { id: item._id, user: item }
                  }"
                >
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>
              <span>Edit User</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snack.show" color="black" right bottom :timeout="4000">
      {{ snack.text }}
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
    headers: [
      { name: "name", text: "Name", value: "name", sortable: false },
      { name: "email", text: "Email", value: "email", sortable: false },
      { name: "role", text: "Role", value: "role", sortable: false },
      { name: "action", text: "Action", value: "action", sorble: false }
    ],
    users: []
  }),
  methods: {
    async delete_user(id) {
      if (confirm("Are you sure?")) {
        let c = await Axios.delete("/api/user/one/" + id, {
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
      let c = await Axios.get("/api/user/all", {
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

<style></style>
