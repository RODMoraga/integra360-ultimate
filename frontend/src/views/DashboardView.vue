<template>
  <div class="flex h-screen bg-slate-100 overflow-hidden font-quicksand">
    <!-- Sidebar -->
    <AppSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Navbar -->
      <DashNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />

      <!-- Scrollable content -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-5 lg:p-6 space-y-7 max-w-screen-2xl mx-auto w-full">
          <KpiCards />
          <ChartsSection />
          <TablesSection />
        </div>
      </main>

      <!-- Footer -->
      <DashFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import KpiCards from "../components/dashboard/KpiCards.vue";
import ChartsSection from "../components/dashboard/ChartsSection.vue";
import TablesSection from "../components/dashboard/TablesSection.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";

/**
 * Controls sidebar visibility for responsive dashboard layouts.
 */
const sidebarOpen = ref(false);
</script>
