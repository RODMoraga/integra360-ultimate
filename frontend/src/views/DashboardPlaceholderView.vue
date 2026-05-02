<template>
  <div class="flex h-screen bg-slate-100 overflow-hidden font-quicksand">
    <AppSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 overflow-y-auto">
        <div class="p-5 lg:p-6 max-w-screen-2xl mx-auto w-full space-y-5">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item">
                <router-link to="/dashboard" class="text-decoration-none text-secondary">
                  <i class="fa-solid fa-gauge-high me-1"></i>Dashboard
                </router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">{{ section.label }}</li>
            </ol>
          </nav>

          <div class="bg-white rounded-4 shadow-sm p-4 p-md-5 text-center">
            <div class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-amber-100 text-amber-700" style="width:72px;height:72px;">
              <i :class="section.icon" class="fs-3"></i>
            </div>
            <h1 class="h4 fw-bold text-dark mb-2">{{ section.title }}</h1>
            <p class="text-secondary mb-0">
              {{ section.description }}
            </p>
          </div>
        </div>
      </main>

      <DashFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";

const route = useRoute();
const sidebarOpen = ref(false);

const PLACEHOLDER_SECTIONS: Record<string, { label: string; title: string; description: string; icon: string }> = {
  "/reportes": {
    label: "Reportes",
    title: "Módulo de Reportes",
    description: "Esta sección queda habilitada para la siguiente fase de analitica y reportería ejecutiva.",
    icon: "fa-solid fa-chart-line"
  },
  "/calendario": {
    label: "Calendario",
    title: "Módulo de Calendario",
    description: "Esta sección queda preparada para la planificación de eventos y actividades operativas.",
    icon: "fa-solid fa-calendar-days"
  },
  "/configuracion": {
    label: "Configuración",
    title: "Centro de Configuración",
    description: "Esta sección centraliza parámetros globales y opciones avanzadas del sistema.",
    icon: "fa-solid fa-gear"
  }
};

const section = computed(() => {
  return (
    PLACEHOLDER_SECTIONS[route.path] ?? {
      label: "Módulo",
      title: "Módulo en Preparación",
      description: "Esta funcionalidad se encuentra disponible como punto de navegación y será extendida en próximas iteraciones.",
      icon: "fa-solid fa-cubes"
    }
  );
});
</script>
