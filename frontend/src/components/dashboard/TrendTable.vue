<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <h3 class="font-semibold text-slate-800 flex items-center gap-2">
        <i class="fa-solid fa-arrow-trend-up text-ink-black-600 text-sm"></i>
        Tendencias de Productos
      </h3>
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400 hidden sm:block">Top 10 productos por rendimiento</span>
        <button class="text-xs font-medium px-3 py-1.5 rounded-lg bg-ink-black-600 text-white hover:bg-ink-black-700 transition-colors">
          <i class="fa-solid fa-download mr-1"></i>Exportar
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ventas</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tendencia</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Variación</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Popularidad</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr
            v-for="(item, idx) in products"
            :key="item.name"
            class="hover:bg-slate-50/70 transition-colors"
          >
            <td class="px-4 py-3">
              <span class="text-xs font-bold text-slate-400">{{ String(idx + 1).padStart(2, "0") }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs', item.iconBg]">
                  <i :class="item.icon"></i>
                </div>
                <div>
                  <p class="font-semibold text-slate-800 text-sm">{{ item.name }}</p>
                  <p class="text-xs text-slate-400">SKU: {{ item.sku }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span class="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ item.category }}</span>
            </td>
            <td class="px-4 py-3 text-right font-medium text-slate-700">{{ item.sales.toLocaleString("es-CL") }}</td>
            <td class="px-4 py-3 text-right font-semibold text-slate-800">${{ item.revenue.toLocaleString("es-CL") }}</td>
            <td class="px-4 py-3">
              <!-- mini sparkline -->
              <div class="flex gap-px items-end h-7 justify-center w-20 mx-auto">
                <div
                  v-for="(h, si) in item.sparkline"
                  :key="si"
                  :class="['w-2 rounded-sm', item.change >= 0 ? 'bg-emerald-400' : 'bg-red-400']"
                  :style="{ height: h + '%' }"
                ></div>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <span
                :class="[
                  'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full',
                  item.change >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
                ]"
              >
                <i :class="item.change >= 0 ? 'fa-solid fa-arrow-up text-[10px]' : 'fa-solid fa-arrow-down text-[10px]'"></i>
                {{ Math.abs(item.change) }}%
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 justify-center">
                <div class="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[60px]">
                  <div
                    :class="['h-1.5 rounded-full transition-all duration-500', popularityColor(item.popularity)]"
                    :style="{ width: item.popularity + '%' }"
                  ></div>
                </div>
                <span class="text-xs font-medium text-slate-500 w-8 text-right">{{ item.popularity }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Resolves progress bar color based on popularity percentage.
 */
function popularityColor(v: number): string {
  if (v >= 80) return "bg-emerald-500";
  if (v >= 55) return "bg-ink-black-500";
  if (v >= 35) return "bg-amber-flame-500";
  return "bg-brick-ember-500";
}

/**
 * Mock ranking dataset used by product trends table.
 */
const products = [
  { name: "Laptop Pro X1",     sku: "LPX-001", category: "Tecnología", sales: 342,  revenue: 444_537_580, change: 18.4, popularity: 94, icon: "fa-solid fa-laptop",       iconBg: "bg-ink-black-700",      sparkline: [40, 55, 45, 68, 72, 85, 90] },
  { name: "Monitor 4K Ultra",  sku: "MU4K-02", category: "Tecnología", sales: 287,  revenue: 140_617_130, change: 12.1, popularity: 88, icon: "fa-solid fa-desktop",      iconBg: "bg-ink-black-600",      sparkline: [50, 60, 55, 70, 65, 78, 82] },
  { name: "Auriculares BT Pro",sku: "ABTP-03", category: "Audio",      sales: 521,  revenue: 67_691_990,  change: 22.7, popularity: 82, icon: "fa-solid fa-headphones",   iconBg: "bg-night-bordeaux-600", sparkline: [35, 50, 60, 72, 78, 85, 92] },
  { name: "Teclado Mec. RGB",  sku: "TMR-004", category: "Accesorios", sales: 418,  revenue: 37_609_820,  change: 8.3,  popularity: 76, icon: "fa-solid fa-keyboard",     iconBg: "bg-blue-600",           sparkline: [45, 55, 48, 60, 63, 70, 74] },
  { name: "SSD 2TB NVMe",      sku: "SSD-005", category: "Almacen.",   sales: 195,  revenue: 48_752_050,  change: 5.9,  popularity: 70, icon: "fa-solid fa-hard-drive",   iconBg: "bg-slate-600",          sparkline: [40, 45, 50, 55, 58, 62, 68] },
  { name: "Webcam 4K Pro",     sku: "WC4K-06", category: "Video",      sales: 163,  revenue: 21_163_370,  change: -3.2, popularity: 58, icon: "fa-solid fa-video",        iconBg: "bg-emerald-600",        sparkline: [65, 60, 55, 58, 52, 50, 48] },
  { name: "Hub USB-C 10in1",   sku: "HUB-007", category: "Accesorios", sales: 309,  revenue: 15_821_310,  change: 15.6, popularity: 72, icon: "fa-solid fa-plug",         iconBg: "bg-cayenne-red-600",    sparkline: [30, 42, 55, 62, 68, 75, 80] },
  { name: "Tablet 12\" Pro",   sku: "T12-008", category: "Móvil",      sales: 88,   revenue: 52_799_120,  change: -7.4, popularity: 45, icon: "fa-solid fa-tablet",       iconBg: "bg-amber-flame-600",    sparkline: [70, 65, 60, 55, 52, 45, 42] },
  { name: "Mouse Vertical Erg",sku: "MVE-009", category: "Accesorios", sales: 276,  revenue: 12_687_240,  change: 9.8,  popularity: 65, icon: "fa-solid fa-computer-mouse", iconBg: "bg-teal-600",         sparkline: [38, 48, 52, 58, 62, 66, 70] },
  { name: "Impresora Laser XL",sku: "ILX-010", category: "Impresión",  sales: 47,   revenue: 47_140_450,  change: -11.2, popularity: 32, icon: "fa-solid fa-print",       iconBg: "bg-rose-700",           sparkline: [80, 72, 65, 60, 55, 50, 42] }
];
</script>
