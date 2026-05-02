<template>
  <section class="min-h-[calc(100vh-12rem)] py-14 px-4">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white border border-slate-200 rounded-4 shadow-sm p-4 p-md-5 text-center">
        <div class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-amber-100 text-amber-700" style="width:72px;height:72px;">
          <i :class="page.icon" class="fs-3"></i>
        </div>
        <h1 class="h4 fw-bold text-dark mb-2">{{ page.title }}</h1>
        <p class="text-secondary mb-4">{{ page.description }}</p>

        <RouterLink
          v-if="page.primaryTo"
          :to="page.primaryTo"
          class="btn btn-dark rounded-pill px-4"
        >
          {{ page.primaryCta }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const PAGE_CONTENT: Record<string, { title: string; description: string; icon: string; primaryCta?: string; primaryTo?: string }> = {
  "/contact": {
    title: "Contacto",
    description: "Pronto habilitaremos este canal para consultas, soporte y coordinación comercial.",
    icon: "fa-solid fa-envelope",
    primaryCta: "Volver al Inicio",
    primaryTo: "/"
  },
  "/forgot-password": {
    title: "Recuperación de Contraseña",
    description: "Este flujo será habilitado en una próxima iteración. Mientras tanto, contacta al administrador para restablecer tu acceso.",
    icon: "fa-solid fa-key",
    primaryCta: "Volver a Iniciar Sesión",
    primaryTo: "/login"
  }
};

const page = computed(() => {
  return (
    PAGE_CONTENT[route.path] ?? {
      title: "Página en Preparación",
      description: "Esta ruta existe y está lista para futuras funcionalidades.",
      icon: "fa-solid fa-circle-info",
      primaryCta: "Volver al Inicio",
      primaryTo: "/"
    }
  );
});
</script>

