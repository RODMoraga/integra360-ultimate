<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-white">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-r from-ink-black-600 to-ink-black-800 text-white py-20">
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
          <circle cx="20" cy="20" r="15" />
          <circle cx="80" cy="30" r="20" />
          <circle cx="70" cy="75" r="18" />
          <circle cx="15" cy="85" r="12" />
        </svg>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold font-quicksand mb-6 leading-tight">
          Bienvenido a Integra360
        </h1>
        <p class="text-lg md:text-xl text-ink-black-100 mb-8 max-w-2xl mx-auto">
          Descubre nuestra amplia variedad de productos de tecnología con la mejor calidad y los mejores precios del mercado.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button class="px-8 py-3 rounded-lg font-semibold text-ink-black-600 bg-white hover:bg-slate-100 transition-all duration-200 flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Explorar Catálogo
          </button>
          <RouterLink
            to="/contact"
            class="px-8 py-3 rounded-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-ink-black-600 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contáctanos
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Filtros de Búsqueda -->
    <SearchFilters />

    <!-- Catálogo de Productos -->
    <ProductCatalog />

    <!-- Sección de Características -->
    <section class="py-16 bg-white border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold font-quicksand text-ink-black-900 text-center mb-12">
          ¿Por qué elegirnos?
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Característica 1 -->
          <div class="text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300">
            <div class="w-16 h-16 bg-ink-black-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-ink-black-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-ink-black-900 mb-2">Calidad Garantizada</h3>
            <p class="text-slate-600">Productos auténticos con garantía y certificación oficial</p>
          </div>

          <!-- Característica 2 -->
          <div class="text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300">
            <div class="w-16 h-16 bg-amber-flame-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-amber-flame-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-12C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-ink-black-900 mb-2">Mejores Precios</h3>
            <p class="text-slate-600">Precios competitivos y ofertas especiales todos los meses</p>
          </div>

          <!-- Característica 3 -->
          <div class="text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300">
            <div class="w-16 h-16 bg-cayenne-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-cayenne-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-ink-black-900 mb-2">Entrega Rápida</h3>
            <p class="text-slate-600">Envíos rápidos y seguros a toda la región metropolitana</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Final -->
    <section class="py-16 bg-gradient-to-r from-ink-black-50 to-amber-flame-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold font-quicksand text-ink-black-900 mb-4">
          ¿Listo para comprar?
        </h2>
        <p class="text-lg text-slate-600 mb-8">
          Crea tu cuenta hoy y obtén acceso a ofertas exclusivas y seguimiento de pedidos en tiempo real.
        </p>
        <RouterLink
          to="/register"
          class="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white bg-ink-black-600 hover:bg-ink-black-700 transition-all duration-200"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          Registrarse Ahora
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import SearchFilters from "../components/SearchFilters.vue";
import ProductCatalog from "../components/ProductCatalog.vue";

/**
 * Public landing page composed by hero, filters and catalog sections.
 */
</script>
