<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow duration-200 group">
    <div class="flex items-start justify-between">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-slate-500 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-slate-800 font-quicksand truncate">{{ value }}</p>
        <div class="flex items-center gap-1.5 mt-2">
          <span
            :class="[
              'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
              changePositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            ]"
          >
            <i :class="changePositive ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
            {{ change }}
          </span>
          <span class="text-xs text-slate-400">{{ subtitle }}</span>
        </div>
      </div>

      <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 shadow-sm group-hover:scale-110 transition-transform duration-200', iconBg]">
        <i :class="[icon, 'text-white text-lg']"></i>
      </div>
    </div>

    <!-- Mini sparkline bar -->
    <div class="mt-4 flex gap-0.5 items-end h-8">
      <div
        v-for="(h, i) in sparkline"
        :key="i"
        :class="['flex-1 rounded-sm transition-all duration-300', changePositive ? 'bg-emerald-100 hover:bg-emerald-300' : 'bg-red-100 hover:bg-red-300']"
        :style="{ height: h + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * KPI card rendering contract.
 */
const props = defineProps<{
  title: string;
  value: string;
  change: string;
  changePositive: boolean;
  icon: string;
  iconBg: string;
  subtitle: string;
}>();

/**
 * Builds a deterministic pseudo-random sparkline based on the card title.
 * This keeps visuals stable across renders without storing static arrays.
 */
const sparkline = (() => {
  const seed = props.title.length;
  return Array.from({ length: 12 }, (_, i) => {
    const base = 30 + (seed * (i + 1) * 7) % 55;
    return Math.min(100, Math.max(15, base));
  });
})();
</script>
