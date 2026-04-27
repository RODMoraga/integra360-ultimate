<template>
  <div class="min-h-screen">
    <header class="bg-white/80 backdrop-blur sticky top-0 z-50 border-b border-slate-200">
      <div class="container py-3 d-flex justify-content-between align-items-center">
        <h1 class="m-0 fw-bold text-primary">Integra360</h1>
        <nav class="d-flex gap-2">
          <RouterLink class="btn btn-outline-primary" to="/">Dashboard</RouterLink>
          <RouterLink class="btn btn-outline-secondary" to="/users">Usuarios</RouterLink>
        </nav>
      </div>
    </header>

    <main class="container py-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>