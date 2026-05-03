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

      <!-- Session expiry indicator -->
      <Transition name="session-pill-fade">
        <button
          v-if="sessionTimeLabel !== null"
          type="button"
          class="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none transition-colors"
          :class="sessionPillClass"
          :title="sessionExpiresAtLabel ? 'Sesión expira: ' + sessionExpiresAtLabel : 'Tiempo de sesión'"
          aria-label="Estado de sesión"
          @click="showSessionExpiryInfo"
        >
          <i
            class="fa-regular fa-clock text-[11px]"
            :class="{ 'animate-pulse': sessionIsCritical }"
            aria-hidden="true"
          ></i>
          <span :class="{ 'animate-pulse': sessionIsCritical }">{{ sessionTimeLabel }}</span>
        </button>
      </Transition>

      <!-- Separator -->
      <div class="w-px h-6 bg-slate-200 mx-1"></div>

      <!-- User menu -->
      <div ref="userMenuRef" class="relative">
        <button
          type="button"
          class="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-ember-500 focus-visible:ring-offset-2"
          :aria-expanded="isUserMenuOpen"
          aria-haspopup="menu"
          aria-controls="user-menu-dropdown"
          aria-label="Abrir menú de usuario"
          @click="toggleUserMenu"
          @keydown="handleMenuTriggerKeydown"
        >
          <div class="w-8 h-8 rounded-full bg-ink-black-700 flex items-center justify-center">
            <i class="fa-solid fa-user text-white text-xs"></i>
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-xs font-semibold text-slate-800 leading-none">{{ displayName }}</p>
            <p class="text-[11px] text-slate-500 leading-none mt-0.5">{{ userRole }}</p>
          </div>
          <i
            class="fa-solid fa-chevron-down text-xs text-slate-400 transition-transform"
            :class="isUserMenuOpen ? 'rotate-180 text-slate-600' : ''"
            aria-hidden="true"
          ></i>
        </button>

        <Transition name="user-menu-fade">
          <div
            v-if="isUserMenuOpen"
            id="user-menu-dropdown"
            class="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5"
            role="menu"
            aria-label="Menú de usuario"
            @keydown.esc.prevent="closeUserMenu"
          >
            <div class="border-b border-slate-100 px-4 py-3">
              <p class="text-sm font-semibold text-slate-800 truncate">{{ displayName }}</p>
              <p class="text-xs text-slate-500 truncate mt-0.5">{{ userRole }}</p>
            </div>

            <RouterLink
              to="/perfil"
              class="user-menu-item"
              role="menuitem"
              @click="closeUserMenu"
            >
              <i class="fa-regular fa-user text-sm" aria-hidden="true"></i>
              <span>Perfil</span>
            </RouterLink>

            <RouterLink
              to="/configuracion"
              class="user-menu-item"
              role="menuitem"
              @click="closeUserMenu"
            >
              <i class="fa-solid fa-sliders text-sm" aria-hidden="true"></i>
              <span>Configuración</span>
            </RouterLink>

            <button
              type="button"
              class="user-menu-item w-full text-left text-night-bordeaux-800 hover:bg-night-bordeaux-50 focus-visible:bg-night-bordeaux-50"
              role="menuitem"
              @click="handleLogout"
            >
              <i class="fa-solid fa-arrow-right-from-bracket text-sm" aria-hidden="true"></i>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import { useSessionStore } from "../../store/session.store";
import { authService } from "../../services/auth.service";
import { useSessionExpiry } from "../../composables/useSessionExpiry";

/**
 * Emits sidebar toggle event for mobile layouts.
 */
defineEmits<{ toggleSidebar: [] }>();

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const userMenuRef = ref<HTMLElement | null>(null);
const isUserMenuOpen = ref(false);

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
  "/inventario/conversiones-unidades": "Conversiones de Unidades",
  "/inventario/imagenes-productos": "Imágenes Productos",
  "/inventario/activos-digitales": "Activos Digitales",
  "/inventario/movimientos": "Movimientos",
  "/clientes": "Clientes",
  "/clientes/contactos": "Contactos de Clientes",
  "/clientes/segmentos": "Segmentos",
  "/proveedores": "Proveedores",
  "/proveedores/contactos": "Contactos de Proveedores",
  "/reportes": "Reportes",
  "/perfil": "Perfil",
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

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value;
}

function closeUserMenu() {
  isUserMenuOpen.value = false;
}

function handleMenuTriggerKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleUserMenu();
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node | null;
  if (!target || !userMenuRef.value) {
    return;
  }

  if (!userMenuRef.value.contains(target)) {
    closeUserMenu();
  }
}

function handleGlobalEscape(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeUserMenu();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleGlobalEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleGlobalEscape);
});

/**
 * Logs out current user and redirects to login view.
 */
function handleLogout() {
  sessionStore.clearSession();
  authService.logout();
  closeUserMenu();
  router.replace("/login");
}

// ── Session expiry ───────────────────────────────────────────────────────────

async function onSessionExpired() {
  sessionStore.clearSession();
  authService.logout();
  closeUserMenu();
  await Swal.fire({
    icon: "warning",
    title: "Sesión expirada",
    text: "Tu sesión ha caducado. Inicia sesión nuevamente para continuar.",
    confirmButtonText: "Iniciar sesión",
    allowOutsideClick: false,
    allowEscapeKey: false
  });
  router.replace("/login");
}

function onSessionWarnSoon() {
  const label = sessionExpiresAtLabel.value;
  Swal.fire({
    icon: "warning",
    title: "Sesión por expirar",
    html: `Tu sesión expirará en menos de <strong>5 minutos</strong>${label ? ` (${label})` : ""}.<br>Guarda tu trabajo o recarga la página para renovarla.`,
    toast: false,
    showConfirmButton: true,
    confirmButtonText: "Entendido",
    showCancelButton: false,
    timer: 15000,
    timerProgressBar: true
  });
}

function onSessionWarnCritical() {
  Swal.fire({
    icon: "error",
    title: "¡Sesión expira en 1 minuto!",
    text: "Tu sesión cerrará automáticamente. Guarda tu trabajo ahora.",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 12000,
    timerProgressBar: true
  });
}

async function showSessionExpiryInfo() {
  const label = sessionExpiresAtLabel.value;
  const left = sessionSecondsLeft.value;
  if (left === null) return;

  const mins = Math.floor(left / 60);
  const secs = left % 60;
  const timeStr = left >= 3600
    ? `${Math.floor(left / 3600)}h ${Math.floor((left % 3600) / 60)}m`
    : left >= 60
      ? `${mins}m ${secs}s`
      : `${secs}s`;

  await Swal.fire({
    icon: "info",
    title: "Estado de la sesión",
    html: [
      `<p class="mb-2">Tu sesión está activa.</p>`,
      `<p class="mb-1"><strong>Tiempo restante:</strong> ${timeStr}</p>`,
      label ? `<p class="mb-0"><strong>Expira:</strong> ${label}</p>` : ""
    ].join(""),
    confirmButtonText: "Cerrar"
  });
}

const {
  secondsLeft: sessionSecondsLeft,
  expiresAtLabel: sessionExpiresAtLabel,
  timeLabel: sessionTimeLabel,
  isExpiringSoon: sessionIsExpiringSoon,
  isCritical: sessionIsCritical
} = useSessionExpiry(onSessionWarnSoon, onSessionWarnCritical, onSessionExpired);

const sessionPillClass = computed(() => {
  if (sessionIsCritical.value) {
    return "bg-red-100 text-red-700 ring-1 ring-red-300 hover:bg-red-200";
  }
  if (sessionIsExpiringSoon.value) {
    return "bg-amber-100 text-amber-700 ring-1 ring-amber-300 hover:bg-amber-200";
  }
  return "bg-slate-100 text-slate-500 hover:bg-slate-200";
});
</script>

<style scoped>
.user-menu-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.65rem 1rem;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 160ms ease, color 160ms ease;
}

.user-menu-item:hover,
.user-menu-item:focus-visible {
  background: #f8fafc;
  color: #0f172a;
  outline: none;
}

.session-pill-fade-enter-active,
.session-pill-fade-leave-active {
  transition: opacity 300ms ease, transform 300ms ease;
}

.session-pill-fade-enter-from,
.session-pill-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.user-menu-fade-enter-active,
.user-menu-fade-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.user-menu-fade-enter-from,
.user-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .user-menu-fade-enter-active,
  .user-menu-fade-leave-active {
    transition: none;
  }
}
</style>
