<template>
  <header class="sticky top-0 z-10 flex items-center gap-4 bg-white border-b border-slate-200 shadow-sm h-16 px-4 lg:px-6">
    <!-- Hamburger (mobile/tablet) -->
    <button
      type="button"
      class="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      @click="$emit('toggleSidebar')"
      aria-label="Abrir menú"
    >
      <i class="fa-solid fa-bars text-lg"></i>
    </button>

    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1 text-sm min-w-0 flex-1" aria-label="Breadcrumb">
      <RouterLink to="/dashboard" class="flex items-center gap-1 text-slate-400 hover:text-ink-black-600 transition-colors">
        <i class="fa-solid fa-house text-xs"></i>
      </RouterLink>
      <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
        <i class="fa-solid fa-chevron-right text-[10px] text-slate-300 mx-1"></i>
        <span
          v-if="idx === breadcrumbs.length - 1"
          class="font-semibold text-ink-black-700 truncate"
        >{{ crumb.label }}</span>
        <RouterLink
          v-else
          :to="crumb.path"
          class="text-slate-400 hover:text-ink-black-600 transition-colors truncate"
        >{{ crumb.label }}</RouterLink>
      </template>
    </nav>

    <!-- Right actions -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- Notifications -->
      <button
        type="button"
        class="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <i class="fa-regular fa-bell text-lg"></i>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brick-ember-500 ring-2 ring-white"></span>
      </button>

      <!-- Messages -->
      <button
        type="button"
        class="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors hidden sm:flex"
      >
        <i class="fa-regular fa-envelope text-lg"></i>
      </button>

      <!-- Separator -->
      <div class="w-px h-6 bg-slate-200 mx-1"></div>

      <!-- User menu -->
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-ink-black-700 flex items-center justify-center">
          <i class="fa-solid fa-user text-white text-xs"></i>
        </div>
        <div class="hidden sm:block text-left">
          <p class="text-xs font-semibold text-slate-800 leading-none">{{ displayName }}</p>
          <p class="text-[11px] text-slate-400 leading-none mt-0.5">{{ userRole }}</p>
        </div>
        <button
          type="button"
          class="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-brick-ember-600 transition-colors"
          title="Cerrar sesión"
          @click="handleLogout"
        >
          <i class="fa-solid fa-right-from-bracket text-sm"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSessionStore } from "../../store/session.store";
import { authService } from "../../services/auth.service";

/**
 * Emits sidebar toggle event for mobile layouts.
 */
defineEmits<{ toggleSidebar: [] }>();

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();

const displayName = computed(() => sessionStore.user?.email?.split("@")[0] ?? "Usuario");
const userRole = computed(() => sessionStore.user?.role ?? "Administrador");

interface Crumb { label: string; path: string }

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Usuarios",
  "/roles": "Roles",
  "/documentos": "Documentos",
  "/documentos/tipos": "Tipos de Documentos",
  "/documentos/secuencias": "Secuencias de Documentos",
  "/ventas": "Ventas",
  "/ventas/nueva": "Nueva Venta",
  "/ventas/historial": "Historial",
  "/ventas/devoluciones": "Devoluciones",
  "/inventario": "Inventario",
  "/inventario/productos": "Productos",
  "/inventario/variantes-productos": "Variantes de Productos",
  "/inventario/categorias": "Categorías",
  "/inventario/subcategorias": "Subcategorías",
  "/inventario/marcas": "Marcas",
  "/inventario/modelos": "Modelos",
  "/inventario/unidades-de-medida": "Unidades de Medida",
  "/inventario/imagenes-productos": "Imágenes Productos",
  "/inventario/activos-digitales": "Activos Digitales",
  "/inventario/movimientos": "Movimientos",
  "/clientes": "Clientes",
  "/clientes/contactos": "Contactos de Clientes",
  "/clientes/segmentos": "Segmentos",
  "/proveedores": "Proveedores",
  "/proveedores/contactos": "Contactos de Proveedores",
  "/reportes": "Reportes",
  "/configuracion": "Configuración"
};

const breadcrumbs = computed<Crumb[]>(() => {
  const path = route.path;
  if (path === "/dashboard") return [{ label: "Dashboard", path: "/dashboard" }];

  const segments = path.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let accumulated = "";

  for (const seg of segments) {
    accumulated += `/${seg}`;
    const label = ROUTE_LABELS[accumulated] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, path: accumulated });
  }

  return crumbs;
});

/**
 * Logs out current user and redirects to login view.
 */
function handleLogout() {
  authService.logout();
  router.push("/login");
}
</script>
