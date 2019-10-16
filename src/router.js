import Vue from "vue";
import Router from "vue-router";

import LoginComponent from "./views/login.vue";
import DashboardComponent from "./views/dashbord.vue";
import NotFoundComponent from "./views/404.vue";
import NewUserComponent from "./views/new-user.vue";
import EditUserComponent from "./views/edit-user.vue";
import NewProjectComponent from "./views/new-project.vue";
import ViewProjectComponent from "./views/view-project.vue";
import EditProjectComponent from "./views/edit-project.vue";
import NewTaskComponent from "./views/new-task.vue";
import ViewTaskComponent from "./views/view-task.vue";
import EditTaskComponent from "./views/edit-task.vue";

Vue.use(Router);

export default new Router({
  mode: "hash",
  routes: [
    {
      path: "",
      redirect: { name: "login" }
    },
    {
      path: "/login",
      name: "login",
      component: LoginComponent,
      meta: { title: "Login" }
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardComponent,
      meta: { title: "Dashboard" }
    },
    {
      path: "/user/new",
      component: NewUserComponent,
      name: "new-user",
      meta: { title: "New User" }
    },
    {
      path: "/user/:id/edit",
      component: EditUserComponent,
      props: true,
      name: "edit-user",
      meta: { title: "Edit User" }
    },
    {
      path: "/project/new",
      component: NewProjectComponent,
      name: "new-project",
      meta: { title: "New Project" }
    },
    {
      path: "/project/:id/view",
      component: ViewProjectComponent,
      name: "view-project",
      meta: { title: "View Project" }
    },
    {
      path: "/project/:id/edit",
      component: EditProjectComponent,
      name: "edit-project",
      meta: { title: "Edit Project" }
    },
    {
      path: "/task/:pid/new",
      component: NewTaskComponent,
      name: "new-task",
      props: true,
      meta: { title: "New Task" }
    },
    {
      path: "/task/:pid/:tid/view",
      component: ViewTaskComponent,
      name: "view-task",
      props: true,
      meta: { title: "View Task" }
    },
    {
      path: "/task/:pid/:tid/edit",
      component: EditTaskComponent,
      name: "edit-task",
      props: true,
      meta: { title: "Edit Task" }
    },
    {
      path: "/not-found",
      name: "404",
      component: NotFoundComponent,
      meta: { title: "Not Found" }
    },
    {
      path: "*",
      redirect: { name: "404" }
    }
  ]
});
