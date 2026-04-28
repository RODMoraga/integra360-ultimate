<template>
  <section>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-lg font-bold text-slate-800">Análisis de Rendimiento</h2>
        <p class="text-sm text-slate-500">Indicadores KPI del período</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Chart 1: Ventas Mensuales (line) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-slate-800">Ventas Mensuales</h3>
            <p class="text-xs text-slate-400 mt-0.5">Ingresos totales por mes — 2026</p>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-ink-black-600"></span>
            <span class="text-xs text-slate-500">Ingresos</span>
            <span class="w-2.5 h-2.5 rounded-full bg-brick-ember-500 ml-2"></span>
            <span class="text-xs text-slate-500">Meta</span>
          </div>
        </div>
        <ApexChart
          type="area"
          height="270"
          :options="salesChartOptions"
          :series="salesSeries"
        />
      </div>

      <!-- Chart 2: Pedidos por Categoría (bar) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-slate-800">Pedidos por Categoría</h3>
            <p class="text-xs text-slate-400 mt-0.5">Distribución del período actual</p>
          </div>
          <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Trimestral</span>
        </div>
        <ApexChart
          type="bar"
          height="270"
          :options="categoryChartOptions"
          :series="categorySeries"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Time-series data for monthly sales and monthly target.
 */
const salesSeries = [
  {
    name: "Ingresos",
    data: [820000, 1050000, 980000, 1230000, 1150000, 1420000, 1380000, 1600000, 1520000, 1780000, 1650000, 1900000]
  },
  {
    name: "Meta",
    data: [900000, 950000, 1000000, 1100000, 1200000, 1300000, 1400000, 1450000, 1500000, 1600000, 1700000, 1800000]
  }
];

const salesChartOptions = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "Quicksand, sans-serif"
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth" as const, width: [2.5, 1.5], dashArray: [0, 5] },
  fill: {
    type: ["gradient", "solid"],
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.02,
      stops: [0, 90, 100]
    },
    opacity: [1, 0]
  },
  colors: ["#0e218b", "#ff0000"],
  xaxis: {
    categories: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    labels: { style: { fontSize: "11px", colors: "#94a3b8" } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (v: number) => "$" + (v / 1000000).toFixed(1) + "M",
      style: { fontSize: "11px", colors: "#94a3b8" }
    }
  },
  grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
  tooltip: {
    y: { formatter: (v: number) => "$" + v.toLocaleString("es-CL") }
  },
  legend: { position: "top" as const, fontSize: "12px" }
};

const categorySeries = [
  {
    name: "Q1",
    data: [44, 55, 41, 67, 22]
  },
  {
    name: "Q2",
    data: [53, 32, 63, 48, 31]
  }
];

const categoryChartOptions = {
  chart: {
    toolbar: { show: false },
    fontFamily: "Quicksand, sans-serif"
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "55%",
      borderRadius: 5,
      borderRadiusApplication: "end" as const
    }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ["transparent"] },
  colors: ["#0e218b", "#e61961"],
  xaxis: {
    categories: ["Tecnología", "Ropa", "Alimentos", "Hogar", "Deportes"],
    labels: { style: { fontSize: "11px", colors: "#94a3b8" } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: { style: { fontSize: "11px", colors: "#94a3b8" } }
  },
  fill: { opacity: 1 },
  grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
  tooltip: {
    y: { formatter: (v: number) => v + " pedidos" }
  },
  legend: { position: "top" as const, fontSize: "12px" }
};
</script>
