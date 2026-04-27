import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import DashboardView from "../views/DashboardView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import UsersView from "../views/UsersView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: {
        title: "Iniciar Sesión - Integra360",
        hideGlobalChrome: true
      }
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
      meta: {
        title: "Crear Cuenta - Integra360",
        hideGlobalChrome: true
      }
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView
    },
    {
      path: "/users",
      name: "users",
      component: UsersView
    }
  ]
});