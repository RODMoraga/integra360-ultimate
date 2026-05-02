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
              <li class="breadcrumb-item active" aria-current="page">Devoluciones</li>
            </ol>
          </nav>

          <div class="bg-white rounded-4 shadow-sm p-4 p-md-5 text-center">
            <div class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-amber-100 text-amber-700" style="width:72px;height:72px;">
              <i class="fa-solid fa-rotate-left fs-3"></i>
            </div>
            <h1 class="h4 fw-bold text-dark mb-2">Módulo de Devoluciones</h1>
            <p class="text-secondary mb-0">
              Esta sección queda preparada para la siguiente fase de implementación del flujo de postventa.
            </p>
          </div>
        </div>
      </main>

      <DashFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";

const sidebarOpen = ref(false);
</script>

