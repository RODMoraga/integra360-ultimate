import { createRouter, createWebHistory } from "vue-router";
import { authService } from "../services/auth.service";

// Reuse importers so they can be both routed and prefetched.
const loadDashboardView = () => import("../views/DashboardView.vue");
const loadProductsView = () => import("../views/ProductsView.vue");

let criticalRoutesPrefetched = false;

type IdleCapableWindow = Window & {
  requestIdleCallback?: (
    callback: (deadline: unknown) => void,
    options?: { timeout?: number }
  ) => number;
};

const runWhenBrowserIsIdle = (task: () => void) => {
  const idleWindow = window as IdleCapableWindow;

  if (typeof idleWindow.requestIdleCallback === "function") {
    idleWindow.requestIdleCallback(() => task(), { timeout: 1500 });
    return;
  }

  window.setTimeout(task, 800);
};

const scheduleCriticalPrefetch = () => {
  if (criticalRoutesPrefetched || !authService.isAuthenticated()) {
    return;
  }

  criticalRoutesPrefetched = true;

  // Defer prefetch to an idle period to avoid impacting initial render/navigation work.
  runWhenBrowserIsIdle(() => {
    void loadDashboardView();
    void loadProductsView();
  });
};

/**
 * Application router with public and protected routes.
 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue")
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: {
        title: "Iniciar Sesión - Integra360",
        hideGlobalChrome: true
      }
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: {
        title: "Crear Cuenta - Integra360",
        hideGlobalChrome: true
      }
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: loadDashboardView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true
      }
    },
    {
      path: "/users",
      name: "users",
      component: () => import("../views/UsersView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Usuarios - Integra360"
      }
    },
    {
      path: "/empresas",
      name: "empresas",
      component: () => import("../views/CompaniesView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Empresas - Integra360"
      }
    },
    {
      path: "/roles",
      name: "roles",
      component: () => import("../views/RolesView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Roles - Integra360"
      }
    },
    {
      path: "/permisos",
      name: "permisos",
      component: () => import("../views/PermissionsView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Permisos - Integra360"
      }
    },
    {
      path: "/regiones",
      name: "regiones",
      component: () => import("../views/RegionsView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Regiones - Integra360"
      }
    },
    {
      path: "/ciudades",
      name: "ciudades",
      component: () => import("../views/CitiesView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Ciudades - Integra360"
      }
    },
    {
      path: "/comunas",
      name: "comunas",
      component: () => import("../views/CommunesView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Comunas - Integra360"
      }
    },
    {
      path: "/bodegas",
      name: "bodegas",
      component: () => import("../views/WarehousesView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Bodegas - Integra360"
      }
    },
    {
      path: "/inventario/categorias",
      name: "inventario-categorias",
      component: () => import("../views/CategoriesView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Categorías - Integra360"
      }
    },
    {
      path: "/inventario/subcategorias",
      name: "inventario-subcategorias",
      component: () => import("../views/SubcategoriesView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Subcategorías - Integra360"
      }
    },
    {
      path: "/inventario/modelos",
      name: "inventario-modelos",
      component: () => import("../views/ModelsView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Modelos - Integra360"
      }
    },
    {
      path: "/inventario/marcas",
      name: "inventario-marcas",
      component: () => import("../views/BrandsView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Marcas - Integra360"
      }
    },
    {
      path: "/inventario/productos",
      name: "inventario-productos",
      component: loadProductsView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Productos - Integra360"
      }
    },
    {
      path: "/inventario/imagenes-productos",
      name: "inventario-imagenes-productos",
      component: () => import("../views/ProductImagesView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Imágenes Productos - Integra360"
      }
    },
    {
      path: "/inventario/variantes-productos",
      name: "inventario-variantes-productos",
      component: () => import("../views/ProductVariantsView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Variantes de Productos - Integra360"
      }
    },
    {
      path: "/clientes",
      name: "clientes",
      component: () => import("../views/CustomersView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Clientes - Integra360"
      }
    },
    {
      path: "/proveedores",
      name: "proveedores",
      component: () => import("../views/SuppliersView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Proveedores - Integra360"
      }
    },
    {
      path: "/clientes/contactos",
      name: "clientes-contactos",
      component: () => import("../views/CustomerContactsView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Contactos de Clientes - Integra360"
      }
    },
    {
      path: "/proveedores/contactos",
      name: "proveedores-contactos",
      component: () => import("../views/SupplierContactsView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Contactos de Proveedores - Integra360"
      }
    },
    {
      path: "/inventario/unidades-de-medida",
      name: "inventario-unidades-de-medida",
      component: () => import("../views/UnitsOfMeasureView.vue"),
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Unidades de Medida - Integra360"
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

/**
 * After each successful navigation, prefetch critical views for faster subsequent transitions.
 */
router.afterEach(() => {
  scheduleCriticalPrefetch();
});