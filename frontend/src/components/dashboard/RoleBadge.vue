<template>
  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border', style]">
    {{ value }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * Role label displayed in table cells.
 */
const props = defineProps<{ value: string }>();

/**
 * Mapping between role names and visual badge styles.
 */
const STYLES: Record<string, string> = {
  "Super Admin": "bg-ink-black-50 text-ink-black-700 border-ink-black-200",
  "Supervisor":  "bg-night-bordeaux-50 text-night-bordeaux-700 border-night-bordeaux-200",
  "Vendedor":    "bg-blue-50 text-blue-700 border-blue-200",
  "Bodeguero":   "bg-amber-50 text-amber-700 border-amber-200",
  "Contador":    "bg-slate-100 text-slate-600 border-slate-200"
};

/**
 * Resolved badge style with safe fallback.
 */
const style = computed(() => STYLES[props.value] ?? "bg-slate-100 text-slate-600 border-slate-200");
</script>
