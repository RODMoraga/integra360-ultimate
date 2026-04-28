<template>
  <span :class="['inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold', style.cls]">
    <span :class="['w-1.5 h-1.5 rounded-full', style.dot]"></span>
    {{ value }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * Status label rendered as semantic badge.
 */
const props = defineProps<{ value: string }>();

/**
 * Mapping between status values and badge styles.
 */
const STYLES: Record<string, { cls: string; dot: string }> = {
  "Completado":  { cls: "bg-emerald-50 text-emerald-700",  dot: "bg-emerald-500" },
  "En tránsito": { cls: "bg-blue-50 text-blue-700",        dot: "bg-blue-500" },
  "Pendiente":   { cls: "bg-amber-50 text-amber-700",      dot: "bg-amber-500" },
  "Cancelado":   { cls: "bg-red-50 text-red-600",          dot: "bg-red-500" },
  "Activo":      { cls: "bg-emerald-50 text-emerald-700",  dot: "bg-emerald-500" },
  "Inactivo":    { cls: "bg-slate-100 text-slate-500",     dot: "bg-slate-400" },
  "Suspendido":  { cls: "bg-red-50 text-red-600",          dot: "bg-red-500" }
};

/**
 * Resolved style with fallback for unknown statuses.
 */
const style = computed(() => STYLES[props.value] ?? { cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" });
</script>
