<template>
  <!-- Mobile overlay -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-20 bg-black/60 lg:hidden"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Sidebar panel -->
  <aside
    :class="[
      'fixed top-0 left-0 z-30 h-full w-64 flex flex-col bg-ink-black-950 border-r border-ink-black-800 transition-transform duration-300 ease-in-out',
      'lg:relative lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Brand logo -->
    <div class="flex items-center gap-3 px-5 py-5 border-b border-ink-black-800">
      <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brick-ember-600">
        <i class="fa-solid fa-circle-nodes text-white text-base"></i>
      </div>
      <span class="text-xl font-bold font-quicksand text-white tracking-wide">Integra<span class="text-brick-ember-400">360</span></span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 scrollbar-thin">
      <div class="px-3 mb-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-ink-black-400 px-3 mb-2">Principal</p>

        <!-- Dashboard -->
        <SidebarItem
          icon="fa-solid fa-gauge-high"
          label="Dashboard"
          to="/dashboard"
          :active="currentPath === '/dashboard'"
          @click="$emit('close')"
        />
      </div>

      <div class="px-3 mb-2 mt-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-ink-black-400 px-3 mb-2">Gestión</p>

        <!-- Ventas -->
        <SidebarGroup icon="fa-solid fa-bag-shopping" label="Ventas" :open="openGroups.ventas" @toggle="toggleGroup('ventas')">
          <SidebarSubItem label="Nueva Venta" to="/ventas/nueva" @click="$emit('close')" />
          <SidebarSubItem label="Historial" to="/ventas/historial" @click="$emit('close')" />
          <SidebarSubItem label="Devoluciones" to="/ventas/devoluciones" @click="$emit('close')" />
        </SidebarGroup>

        <!-- Inventario -->
        <SidebarGroup icon="fa-solid fa-boxes-stacked" label="Inventario" :open="openGroups.inventario" @toggle="toggleGroup('inventario')">
          <SidebarSubItem label="Productos" to="/inventario/productos" @click="$emit('close')" />
          <SidebarSubItem label="Categorías" to="/inventario/categorias" @click="$emit('close')" />
          <SidebarSubItem label="Subcategorías" to="/inventario/subcategorias" @click="$emit('close')" />
          <SidebarSubItem label="Marcas" to="/inventario/marcas" @click="$emit('close')" />
          <SidebarSubItem label="Modelos" to="/inventario/modelos" @click="$emit('close')" />
          <SidebarSubItem label="Unidades de Medida" to="/inventario/unidades-de-medida" @click="$emit('close')" />
          <SidebarSubItem label="Imágenes Productos" to="/inventario/imagenes-productos" @click="$emit('close')" />
          <SidebarSubItem label="Movimientos" to="/inventario/movimientos" @click="$emit('close')" />
        </SidebarGroup>

        <!-- Clientes -->
        <SidebarGroup icon="fa-solid fa-users" label="Clientes" :open="openGroups.clientes" @toggle="toggleGroup('clientes')">
          <SidebarSubItem label="Lista de Clientes" to="/clientes" @click="$emit('close')" />
          <SidebarSubItem label="Contactos" to="/clientes/contactos" @click="$emit('close')" />
          <SidebarSubItem label="Segmentos" to="/clientes/segmentos" @click="$emit('close')" />
        </SidebarGroup>
      </div>

      <div class="px-3 mb-2 mt-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-ink-black-400 px-3 mb-2">Análisis</p>

        <SidebarItem
          icon="fa-solid fa-chart-line"
          label="Reportes"
          to="/reportes"
          :active="currentPath === '/reportes'"
          @click="$emit('close')"
        />

        <SidebarItem
          icon="fa-solid fa-calendar-days"
          label="Calendario"
          to="/calendario"
          :active="currentPath === '/calendario'"
          @click="$emit('close')"
        />
      </div>

      <div class="px-3 mb-2 mt-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-ink-black-400 px-3 mb-2">Sistema</p>

        <SidebarItem
          icon="fa-solid fa-building"
          label="Empresas"
          to="/empresas"
          :active="currentPath === '/empresas'"
          @click="$emit('close')"
        />

        <SidebarItem
          icon="fa-solid fa-users-gear"
          label="Usuarios"
          to="/users"
          :active="currentPath === '/users'"
          @click="$emit('close')"
        />

        <SidebarItem
          icon="fa-solid fa-shield-halved"
          label="Roles"
          to="/roles"
          :active="currentPath === '/roles'"
          @click="$emit('close')"
        />

        <SidebarItem
          icon="fa-solid fa-key"
          label="Permisos"
          to="/permisos"
          :active="currentPath === '/permisos'"
          @click="$emit('close')"
        />

        <SidebarItem
          icon="fa-solid fa-map"
          label="Regiones"
          to="/regiones"
          :active="currentPath === '/regiones'"
          @click="$emit('close')"
        />

        <SidebarItem
          icon="fa-solid fa-city"
          label="Ciudades"
          to="/ciudades"
          :active="currentPath === '/ciudades'"
          @click="$emit('close')"
        />

        <SidebarItem
          icon="fa-solid fa-map-location-dot"
          label="Comunas"
          to="/comunas"
          :active="currentPath === '/comunas'"
          @click="$emit('close')"
        />

        <SidebarItem
          icon="fa-solid fa-warehouse"
          label="Bodegas"
          to="/bodegas"
          :active="currentPath === '/bodegas'"
          @click="$emit('close')"
        />

        <SidebarItem
          icon="fa-solid fa-user-group"
          label="Clientes"
          to="/clientes"
          :active="currentPath === '/clientes'"
          @click="$emit('close')"
        />

        <!-- Proveedores -->
        <SidebarGroup icon="fa-solid fa-truck-field" label="Proveedores" :open="openGroups.proveedores" @toggle="toggleGroup('proveedores')">
          <SidebarSubItem label="Lista de Proveedores" to="/proveedores" @click="$emit('close')" />
          <SidebarSubItem label="Contactos" to="/proveedores/contactos" @click="$emit('close')" />
        </SidebarGroup>

        <SidebarItem
          icon="fa-solid fa-gear"
          label="Configuración"
          to="/configuracion"
          :active="currentPath === '/configuracion'"
          @click="$emit('close')"
        />
      </div>
    </nav>

    <!-- User footer -->
    <div class="px-4 py-4 border-t border-ink-black-800 bg-ink-black-950">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-brick-ember-600 flex items-center justify-center flex-shrink-0">
          <i class="fa-solid fa-user text-white text-sm"></i>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-white truncate">{{ userName }}</p>
          <p class="text-xs text-ink-black-400 truncate">{{ userRole }}</p>
        </div>
        <button
          @click="handleLogout"
          class="p-1.5 rounded-md text-ink-black-400 hover:text-white hover:bg-ink-black-800 transition-colors"
          title="Cerrar sesión"
        >
          <i class="fa-solid fa-arrow-right-from-bracket text-sm"></i>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSessionStore } from "../../store/session.store";
import { authService } from "../../services/auth.service";
import SidebarItem from "./SidebarItem.vue";
import SidebarGroup from "./SidebarGroup.vue";
import SidebarSubItem from "./SidebarSubItem.vue";

/**
 * Sidebar visibility state controlled by parent layout.
 */
defineProps<{ isOpen: boolean }>();

/**
 * Emits close event for mobile overlay and navigation actions.
 */
defineEmits<{ close: [] }>();

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();

const currentPath = computed(() => route.path);
const userName = computed(() => sessionStore.user?.email?.split("@")[0] ?? "Usuario");
const userRole = computed(() => sessionStore.user?.role ?? "Administrador");

const openGroups = reactive({
  ventas: false,
  inventario: false,
  clientes: false,
  proveedores: false
});

/**
 * Toggles one sidebar collapsible group.
 */
function toggleGroup(group: keyof typeof openGroups) {
  openGroups[group] = !openGroups[group];
}

/**
 * Clears auth state and redirects to login page.
 */
function handleLogout() {
  authService.logout();
  router.push("/login");
}
</script>
