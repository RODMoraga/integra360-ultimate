<template>
  <footer class="bg-ink-black-900 text-ink-black-100 mt-16 border-t border-ink-black-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Grid Principal -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Marca y Descripción -->
        <div class="col-span-1 md:col-span-1">
          <h3 class="text-xl font-bold font-quicksand text-ink-black-100 mb-4 flex items-center gap-2">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
            Integra360
          </h3>
          <p class="text-ink-black-200 text-sm leading-relaxed">
            Soluciones innovadoras para la gestión integral de tu negocio.
          </p>
        </div>

        <!-- Navegación -->
        <div>
          <h4 class="font-bold text-ink-black-100 mb-4 font-quicksand">Navegación</h4>
          <ul class="space-y-2">
            <li>
              <RouterLink to="/" class="text-ink-black-200 hover:text-ink-black-50 transition-colors">
                Inicio
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/contact" class="text-ink-black-200 hover:text-ink-black-50 transition-colors">
                Contacto
              </RouterLink>
            </li>
            <li>
              <a href="#" class="text-ink-black-200 hover:text-ink-black-50 transition-colors">
                Productos
              </a>
            </li>
            <li>
              <a href="#" class="text-ink-black-200 hover:text-ink-black-50 transition-colors">
                Servicios
              </a>
            </li>
          </ul>
        </div>

        <!-- Información -->
        <div>
          <h4 class="font-bold text-ink-black-100 mb-4 font-quicksand">Información</h4>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-ink-black-200 hover:text-ink-black-50 transition-colors">
                Términos de Servicio
              </a>
            </li>
            <li>
              <a href="#" class="text-ink-black-200 hover:text-ink-black-50 transition-colors">
                Política de Privacidad
              </a>
            </li>
            <li>
              <a href="#" class="text-ink-black-200 hover:text-ink-black-50 transition-colors">
                Cookies
              </a>
            </li>
            <li>
              <a href="#" class="text-ink-black-200 hover:text-ink-black-50 transition-colors">
                Preguntas Frecuentes
              </a>
            </li>
          </ul>
        </div>

        <!-- Contacto -->
        <div>
          <h4 class="font-bold text-ink-black-100 mb-4 font-quicksand">Contacto</h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-flame-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.03 15.38c-1.1-.5-2.08-.82-2.54-.82-.44 0-1.16.32-2.26.82-.96.44-2.04.72-3.23.72-1.19 0-2.27-.28-3.23-.72-1.1-.5-1.82-.82-2.26-.82-.46 0-1.44.32-2.54.82-1.18.54-1.97.92-2.42.92-.98 0-1.85-.64-2.38-1.55-.35-.6-.56-1.32-.56-2.08V8.93c0-1.89 1.54-3.43 3.43-3.43h15.14c1.89 0 3.43 1.54 3.43 3.43v3.74c0 .76-.21 1.48-.56 2.08-.53.91-1.4 1.55-2.38 1.55-.45 0-1.24-.38-2.42-.92z"/>
              </svg>
              <span class="text-ink-black-200">info@integra360.com</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-flame-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.92 7.02C17.45 6.18 16.51 5.55 15.46 5.55c-.91 0-1.79.37-2.43 1.02l-7.05 7.07c-.98.98-1.54 2.29-1.54 3.68 0 1.39.56 2.7 1.54 3.68.98.98 2.29 1.54 3.68 1.54s2.7-.56 3.68-1.54l7.05-7.07c.65-.64 1.02-1.52 1.02-2.43 0-.95-.38-1.84-1.07-2.48zM5.21 10.08C4.7 10.59 4.4 11.27 4.4 12c0 .73.3 1.41.81 1.92.51.51 1.19.81 1.92.81.73 0 1.41-.3 1.92-.81l7.05-7.07c.51-.51 1.19-.81 1.92-.81.73 0 1.41.3 1.92.81.51.51.81 1.19.81 1.92 0 .73-.3 1.41-.81 1.92l-4.66 4.66c-.98-.52-2.11-.81-3.27-.81-1.16 0-2.29.29-3.27.81l-4.66-4.66z"/>
              </svg>
              <span class="text-ink-black-200">+56 9 1234 5678</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-flame-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
              <span class="text-ink-black-200">Santiago, Chile</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Separador -->
      <div class="border-t border-ink-black-700 my-8"></div>

      <!-- Redes Sociales y Copyright -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <!-- Redes Sociales -->
        <div class="flex gap-4">
          <a href="#" class="text-ink-black-200 hover:text-amber-flame-400 transition-colors" aria-label="Facebook">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" class="text-ink-black-200 hover:text-amber-flame-400 transition-colors" aria-label="Twitter">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 002.856-3.915 10 10 0 01-2.836.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#" class="text-ink-black-200 hover:text-amber-flame-400 transition-colors" aria-label="LinkedIn">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
            </svg>
          </a>
        </div>

        <!-- Copyright -->
        <p class="text-ink-black-200 text-sm text-center md:text-right">
          © {{ currentYear }} Integra360. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

/**
 * Dynamic copyright year shown in footer.
 */
const currentYear = computed(() => new Date().getFullYear());
</script>
