import { createRouter, createWebHistory } from "vue-router";
import { authService } from "../services/auth.service";
import HomeView from "../views/HomeView.vue";
import DashboardView from "../views/DashboardView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import UsersView from "../views/UsersView.vue";
import CompaniesView from "../views/CompaniesView.vue";
import RolesView from "../views/RolesView.vue";

/**
 * Application router with public and protected routes.
 */
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
      component: DashboardView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true
      }
    },
    {
      path: "/users",
      name: "users",
      component: UsersView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Usuarios - Integra360"
      }
    },
    {
      path: "/empresas",
      name: "empresas",
      component: CompaniesView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Empresas - Integra360"
      }
    },
    {
      path: "/roles",
      name: "roles",
      component: RolesView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Roles - Integra360"
      }
    }
  ]
});

/**
 * Global navigation guard.
 * Redirects unauthenticated users from protected routes to login,
 * and avoids showing login/register when a session is active.
 */
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    return {
      name: "login",
      query: { redirect: to.fullPath }
    };
  }

  if ((to.name === "login" || to.name === "register") && authService.isAuthenticated()) {
    return { name: "dashboard" };
  }

  return true;
});