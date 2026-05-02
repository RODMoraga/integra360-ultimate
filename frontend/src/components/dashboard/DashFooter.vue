<template>
  <footer class="bg-ink-black-950 border-t border-ink-black-800 text-ink-black-100 px-5 py-4">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
      <!-- Brand + version -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-md bg-brick-ember-600 flex items-center justify-center">
            <i class="fa-solid fa-circle-nodes text-ink-black-100 text-xs"></i>
          </div>
          <span class="text-sm font-bold font-quicksand">Integra<span class="text-brick-ember-300">360</span></span>
        </div>
        <span class="text-ink-black-400">|</span>
        <span class="text-xs px-2 py-0.5 rounded-full bg-ink-black-800 text-ink-black-200 font-mono">v1.0.0</span>
        <span class="text-xs text-ink-black-300 hidden md:block">Build 2026.04.27</span>
      </div>

      <!-- Center links -->
      <div class="flex items-center gap-4 text-xs text-ink-black-200">
        <a href="#" class="hover:text-ink-black-50 transition-colors">Términos</a>
        <span class="text-ink-black-500">·</span>
        <a href="#" class="hover:text-ink-black-50 transition-colors">Privacidad</a>
        <span class="text-ink-black-500">·</span>
        <a href="#" class="hover:text-ink-black-50 transition-colors">Soporte</a>
      </div>

      <!-- Copyright -->
      <p class="text-xs text-ink-black-300">
        © {{ year }} Integra360 SpA. Todos los derechos reservados.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * Current year used by footer copyright line.
 */
const year = new Date().getFullYear();
</script>
