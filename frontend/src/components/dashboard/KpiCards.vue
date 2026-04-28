<template>
  <section>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-lg font-bold text-slate-800">Resumen General</h2>
        <p class="text-sm text-slate-500">Indicadores del período actual</p>
      </div>
      <span class="text-xs font-medium px-3 py-1.5 rounded-full bg-ink-black-50 text-ink-black-600 border border-ink-black-100">
        <i class="fa-regular fa-calendar mr-1.5"></i>Abril 2026
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <KpiCard
        v-for="card in cards"
        :key="card.title"
        v-bind="card"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import KpiCard from "./KpiCard.vue";

/**
 * Static data source for dashboard KPI cards.
 */
const cards = [
  {
    title: "Ventas del Mes",
    value: "$1.234.567",
    change: "+12.5%",
    changePositive: true,
    icon: "fa-solid fa-dollar-sign",
    iconBg: "bg-emerald-500",
    subtitle: "vs. mes anterior"
  },
  {
    title: "Pedidos Activos",
    value: "248",
    change: "+8.3%",
    changePositive: true,
    icon: "fa-solid fa-bag-shopping",
    iconBg: "bg-ink-black-600",
    subtitle: "en procesamiento"
  },
  {
    title: "Usuarios Activos",
    value: "1.842",
    change: "+3.1%",
    changePositive: true,
    icon: "fa-solid fa-users",
    iconBg: "bg-night-bordeaux-600",
    subtitle: "últimos 30 días"
  },
  {
    title: "Ítems en Stock",
    value: "5.621",
    change: "-2.4%",
    changePositive: false,
    icon: "fa-solid fa-boxes-stacked",
    iconBg: "bg-amber-flame-500",
    subtitle: "disponibles"
  }
];
</script>
