<template>
  <div class="flex flex-col min-h-screen">
    <Navbar v-if="showGlobalChrome" />

    <main class="flex-1">
      <slot />
    </main>

    <Footer v-if="showGlobalChrome" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const route = useRoute();

/**
 * Controls global chrome visibility for routes that require full-screen layouts
 * (for example login/register/dashboard).
 */
const showGlobalChrome = computed(() => {
  return route.meta.hideGlobalChrome !== true;
});
</script>