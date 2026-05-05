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
        <i class="fa-solid fa-circle-nodes text-ink-black-100 text-base"></i>
      </div>
      <span class="text-xl font-bold font-quicksand text-ink-black-100 tracking-wide">Integra<span class="text-brick-ember-300">360</span></span>
    </div>

    <!-- Navigation -->
    <nav class="app-scrollbar flex-1 overflow-y-auto py-4">

      <!-- ── PRINCIPAL ──────────────────────────────────────────── -->
      <div class="px-3 mb-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-ink-black-300 px-3 mb-2">Principal</p>

        <SidebarItem
          icon="fa-solid fa-gauge-high"
          label="Dashboard"
          to="/dashboard"
          :active="currentPath === '/dashboard'"
          @click="$emit('close')"
        />
      </div>

      <!-- ── GESTIÓN ─────────────────────────────────────────────── -->
      <div class="px-3 mb-2 mt-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-ink-black-300 px-3 mb-2">Gestión</p>

        <!-- Ventas -->
        <SidebarGroup icon="fa-solid fa-bag-shopping" label="Ventas" :open="openGroups.ventas" @toggle="toggleGroup('ventas')">
          <SidebarSubItem label="Nueva Venta" to="/ventas/nueva" @click="$emit('close')" />
          <SidebarSubItem label="Historial" to="/ventas/historial" @click="$emit('close')" />
          <SidebarSubItem label="Devoluciones" to="/ventas/devoluciones" @click="$emit('close')" />
        </SidebarGroup>

        <!-- Clientes -->
        <SidebarGroup icon="fa-solid fa-users" label="Clientes" :open="openGroups.clientes" @toggle="toggleGroup('clientes')">
          <SidebarSubItem label="Lista de Clientes" to="/clientes" @click="$emit('close')" />
          <SidebarSubItem label="Contactos" to="/clientes/contactos" @click="$emit('close')" />
        </SidebarGroup>

        <!-- Proveedores -->
        <SidebarGroup icon="fa-solid fa-truck-field" label="Proveedores" :open="openGroups.proveedores" @toggle="toggleGroup('proveedores')">
          <SidebarSubItem label="Lista de Proveedores" to="/proveedores" @click="$emit('close')" />
          <SidebarSubItem label="Contactos" to="/proveedores/contactos" @click="$emit('close')" />
        </SidebarGroup>

        <!-- Inventario -->
        <SidebarGroup icon="fa-solid fa-boxes-stacked" label="Inventario" :open="openGroups.inventario" @toggle="toggleGroup('inventario')">
          <SidebarSubItem label="Stock" to="/inventario/stock" @click="$emit('close')" />
          <SidebarSubItem label="Movimientos" to="/inventario/movimientos" @click="$emit('close')" />
          <SidebarSubItem label="Tipos de Movimiento" to="/inventario/tipos-movimiento" @click="$emit('close')" />
          <SidebarSubItem label="Productos" to="/inventario/productos" @click="$emit('close')" />
          <SidebarSubItem label="Variantes de Productos" to="/inventario/variantes-productos" @click="$emit('close')" />
          <SidebarSubItem label="Categorías" to="/inventario/categorias" @click="$emit('close')" />
          <SidebarSubItem label="Subcategorías" to="/inventario/subcategorias" @click="$emit('close')" />
          <SidebarSubItem label="Marcas" to="/inventario/marcas" @click="$emit('close')" />
          <SidebarSubItem label="Modelos" to="/inventario/modelos" @click="$emit('close')" />
          <SidebarSubItem label="Unidades de Medida" to="/inventario/unidades-de-medida" @click="$emit('close')" />
          <SidebarSubItem label="Conversiones de Unidades" to="/inventario/conversiones-unidades" @click="$emit('close')" />
          <SidebarSubItem label="Imágenes Productos" to="/inventario/imagenes-productos" @click="$emit('close')" />
          <SidebarSubItem label="Activos Digitales" to="/inventario/activos-digitales" @click="$emit('close')" />
        </SidebarGroup>
      </div>

      <!-- ── ANÁLISIS ────────────────────────────────────────────── -->
      <div class="px-3 mb-2 mt-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-ink-black-300 px-3 mb-2">Análisis</p>

        <!-- Reportes -->
        <SidebarGroup icon="fa-solid fa-chart-line" label="Reportes" :open="openGroups.reportes" @toggle="toggleGroup('reportes')">
          <SidebarSubItem label="Ventas Diarias" to="/reportes/ventas-diarias" @click="$emit('close')" />
        </SidebarGroup>

        <SidebarItem
          icon="fa-solid fa-calendar-days"
          label="Calendario"
          to="/calendario"
          :active="currentPath === '/calendario'"
          @click="$emit('close')"
        />
      </div>

      <!-- ── SISTEMA ──────────────────────────────────────────────── -->
      <div class="px-3 mb-2 mt-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-ink-black-300 px-3 mb-2">Sistema</p>

        <!-- Administración -->
        <SidebarGroup icon="fa-solid fa-shield-halved" label="Administración" :open="openGroups.administracion" @toggle="toggleGroup('administracion')">
          <SidebarSubItem label="Empresas" to="/empresas" @click="$emit('close')" />
          <SidebarSubItem label="Usuarios" to="/users" @click="$emit('close')" />
          <SidebarSubItem label="Roles" to="/roles" @click="$emit('close')" />
          <SidebarSubItem label="Permisos" to="/permisos" @click="$emit('close')" />
        </SidebarGroup>

        <!-- Documentos -->
        <SidebarGroup icon="fa-solid fa-file-invoice" label="Documentos" :open="openGroups.documentos" @toggle="toggleGroup('documentos')">
          <SidebarSubItem label="Documentos" to="/documentos" @click="$emit('close')" />
          <SidebarSubItem label="Tipos de Documento" to="/documentos/tipos" @click="$emit('close')" />
          <SidebarSubItem label="Secuencias" to="/documentos/secuencias" @click="$emit('close')" />
        </SidebarGroup>

        <!-- Infraestructura -->
        <SidebarGroup icon="fa-solid fa-server" label="Infraestructura" :open="openGroups.infraestructura" @toggle="toggleGroup('infraestructura')">
          <SidebarSubItem label="Bodegas" to="/bodegas" @click="$emit('close')" />
          <SidebarSubItem label="Terminales POS" to="/terminales-pos" @click="$emit('close')" />
        </SidebarGroup>

        <!-- Ubicaciones -->
        <SidebarGroup icon="fa-solid fa-map-location-dot" label="Ubicaciones" :open="openGroups.ubicaciones" @toggle="toggleGroup('ubicaciones')">
          <SidebarSubItem label="Regiones" to="/regiones" @click="$emit('close')" />
          <SidebarSubItem label="Ciudades" to="/ciudades" @click="$emit('close')" />
          <SidebarSubItem label="Comunas" to="/comunas" @click="$emit('close')" />
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
          <i class="fa-solid fa-user text-ink-black-100 text-sm"></i>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-ink-black-100 truncate">{{ userName }}</p>
          <p class="text-xs text-ink-black-300 truncate">{{ userRole }}</p>
        </div>
        <button
          @click="handleLogout"
          class="p-1.5 rounded-md text-ink-black-300 hover:text-ink-black-50 hover:bg-ink-black-800 transition-colors"
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
  clientes: false,
  proveedores: false,
  inventario: false,
  reportes: false,
  administracion: false,
  documentos: false,
  infraestructura: false,
  ubicaciones: false,
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
  sessionStore.clearSession();
  authService.logout();
  router.replace("/login");
}
</script>
