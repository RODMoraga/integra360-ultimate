<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 text-2xl font-bold font-quicksand text-ink-black-600 hover:text-ink-black-700 transition-colors">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
          Integra360
        </RouterLink>

        <!-- Menú Desktop -->
        <div class="hidden md:flex items-center gap-1">
          <NavLink to="/" label="Home" />
          <NavLink to="/contact" label="Contacto" />
        </div>

        <!-- Botones de Autenticación -->
        <div class="flex items-center gap-2">
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-lg hover:bg-slate-100 text-ink-black-600 transition-colors"
            :aria-label="isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
          >
            <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <RouterLink
            to="/register"
            class="hidden sm:inline-flex px-4 py-2 rounded-lg font-medium text-ink-black-600 border border-ink-black-300 hover:bg-ink-black-50 transition-all duration-200"
          >
            Registrarse
          </RouterLink>

          <RouterLink
            to="/login"
            class="hidden sm:inline-flex px-5 py-2 rounded-lg font-medium text-white bg-ink-black-600 hover:bg-ink-black-700 transition-all duration-200"
          >
            Iniciar Sesión
          </RouterLink>
        </div>
      </div>

      <!-- Menú Móvil -->
      <Transition name="slide">
        <div v-if="isMobileMenuOpen" class="md:hidden border-t border-slate-200 bg-white">
          <div class="px-4 py-3 space-y-2">
            <NavLink to="/" label="Home" mobile @click="closeMobileMenu" />
            <NavLink to="/contact" label="Contacto" mobile @click="closeMobileMenu" />

            <div class="pt-2 space-y-2 border-t border-slate-200">
              <RouterLink
                to="/register"
                class="block px-4 py-2 rounded-lg font-medium text-ink-black-600 border border-ink-black-300 hover:bg-ink-black-50 transition-all duration-200 text-center"
              >
                Registrarse
              </RouterLink>

              <RouterLink
                to="/login"
                class="block px-4 py-2 rounded-lg font-medium text-white bg-ink-black-600 hover:bg-ink-black-700 transition-all duration-200 text-center"
              >
                Iniciar Sesión
              </RouterLink>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import NavLink from "./NavLink.vue";

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  overflow: hidden;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 300px;
  overflow: hidden;
}
</style>
