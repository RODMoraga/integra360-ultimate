import { createRouter, createWebHistory } from "vue-router";
import { authService } from "../services/auth.service";
import HomeView from "../views/HomeView.vue";
import DashboardView from "../views/DashboardView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import UsersView from "../views/UsersView.vue";
import CompaniesView from "../views/CompaniesView.vue";
import RolesView from "../views/RolesView.vue";
import PermissionsView from "../views/PermissionsView.vue";
import RegionsView from "../views/RegionsView.vue";
import CitiesView from "../views/CitiesView.vue";
import CommunesView from "../views/CommunesView.vue";
import WarehousesView from "../views/WarehousesView.vue";
import CustomersView from "../views/CustomersView.vue";
import SuppliersView from "../views/SuppliersView.vue";
import CustomerContactsView from "../views/CustomerContactsView.vue";
import SupplierContactsView from "../views/SupplierContactsView.vue";
import UnitsOfMeasureView from "../views/UnitsOfMeasureView.vue";
import CategoriesView from "../views/CategoriesView.vue";
import SubcategoriesView from "../views/SubcategoriesView.vue";
import ModelsView from "../views/ModelsView.vue";
import BrandsView from "../views/BrandsView.vue";
import ProductsView from "../views/ProductsView.vue";
import ProductImagesView from "../views/ProductImagesView.vue";

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
    },
    {
      path: "/permisos",
      name: "permisos",
      component: PermissionsView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Permisos - Integra360"
      }
    },
    {
      path: "/regiones",
      name: "regiones",
      component: RegionsView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Regiones - Integra360"
      }
    },
    {
      path: "/ciudades",
      name: "ciudades",
      component: CitiesView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Ciudades - Integra360"
      }
    },
    {
      path: "/comunas",
      name: "comunas",
      component: CommunesView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Comunas - Integra360"
      }
    },
    {
      path: "/bodegas",
      name: "bodegas",
      component: WarehousesView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Bodegas - Integra360"
      }
    },
    {
      path: "/inventario/categorias",
      name: "inventario-categorias",
      component: CategoriesView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Categorías - Integra360"
      }
    },
    {
      path: "/inventario/subcategorias",
      name: "inventario-subcategorias",
      component: SubcategoriesView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Subcategorías - Integra360"
      }
    },
    {
      path: "/inventario/modelos",
      name: "inventario-modelos",
      component: ModelsView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Modelos - Integra360"
      }
    },
    {
      path: "/inventario/marcas",
      name: "inventario-marcas",
      component: BrandsView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Marcas - Integra360"
      }
    },
    {
      path: "/inventario/productos",
      name: "inventario-productos",
      component: ProductsView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Productos - Integra360"
      }
    },
    {
      path: "/inventario/imagenes-productos",
      name: "inventario-imagenes-productos",
      component: ProductImagesView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Imágenes Productos - Integra360"
      }
    },
    {
      path: "/clientes",
      name: "clientes",
      component: CustomersView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Clientes - Integra360"
      }
    },
    {
      path: "/proveedores",
      name: "proveedores",
      component: SuppliersView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Proveedores - Integra360"
      }
    },
    {
      path: "/clientes/contactos",
      name: "clientes-contactos",
      component: CustomerContactsView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Contactos de Clientes - Integra360"
      }
    },
    {
      path: "/proveedores/contactos",
      name: "proveedores-contactos",
      component: SupplierContactsView,
      meta: {
        requiresAuth: true,
        hideGlobalChrome: true,
        title: "Contactos de Proveedores - Integra360"
      }
    },
    {
      path: "/inventario/unidades-de-medida",
      name: "inventario-unidades-de-medida",
      component: UnitsOfMeasureView,
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