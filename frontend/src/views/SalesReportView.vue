<template>
  <div class="flex h-screen bg-slate-100 overflow-hidden font-quicksand">
    <AppSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 overflow-y-auto">
        <div class="p-5 lg:p-6 max-w-screen-2xl mx-auto w-full space-y-5">

          <!-- Breadcrumb -->
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item">
                <router-link to="/dashboard" class="text-decoration-none text-secondary">
                  <i class="fa-solid fa-gauge-high me-1"></i>Dashboard
                </router-link>
              </li>
              <li class="breadcrumb-item">
                <router-link to="/reportes" class="text-decoration-none text-secondary">
                  <i class="fa-solid fa-chart-line me-1"></i>Reportes
                </router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Ventas Diarias</li>
            </ol>
          </nav>

          <!-- Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-chart-line me-2 text-brick-ember"></i>Informe de Ventas Diarias
              </h1>
              <p class="text-secondary small mb-0">Visualiza y analiza las ventas por producto, categoría, marca y modelo con gráficos interactivos.</p>
            </div>
          </div>

          <!-- ── FILTERS ── -->
          <div class="bg-white rounded-4 shadow-sm p-4">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i class="fa-solid fa-filter text-ink-black-700"></i>
              <span class="fw-semibold text-ink-black-800">Filtros Avanzados</span>
            </div>
            <div class="row g-3 align-items-end">
              <div class="col-12 col-md-6 col-lg-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Desde</label>
                <input
                  v-model="draftFilters.date_from"
                  type="date"
                  class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                />
              </div>
              <div class="col-12 col-md-6 col-lg-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Hasta</label>
                <input
                  v-model="draftFilters.date_to"
                  type="date"
                  class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                />
              </div>
              <div class="col-12 col-md-6 col-lg-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Categoría</label>
                <select
                  v-model="draftFilters.category_id"
                  class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                >
                  <option value="">Todas</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="col-12 col-md-6 col-lg-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Marca</label>
                <select
                  v-model="draftFilters.brand_id"
                  class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                >
                  <option value="">Todas</option>
                  <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
              </div>
              <div class="col-12 col-md-6 col-lg-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Modelo</label>
                <select
                  v-model="draftFilters.model_id"
                  class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                >
                  <option value="">Todos</option>
                  <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
              </div>
              <div class="col-12 col-md-6 col-lg-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Producto</label>
                <input
                  v-model="draftFilters.product_name"
                  type="text"
                  placeholder="Buscar producto..."
                  class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                />
              </div>
              <div class="col-12 d-flex gap-2 justify-content-end">
                <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="applyFilters">
                  <i class="fa-solid fa-magnifying-glass"></i>Aplicar
                </button>
                <button class="btn btn-light d-flex align-items-center gap-2 px-3 rounded-3" @click="clearFilters">
                  <i class="fa-solid fa-eraser"></i>Limpiar
                </button>
              </div>
            </div>
          </div>

          <!-- Loading / Error state -->
          <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
            <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-secondary small">Cargando informe de ventas...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
            <i class="fa-solid fa-triangle-exclamation me-2"></i>
            No fue posible cargar el informe. Intenta nuevamente.
          </div>

          <template v-else>
            <!-- ── KPI CARDS ── -->
            <div class="row g-4">
              <div class="col-6 col-lg-3">
                <div class="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column gap-1 border-start border-4 border-ink-black-600">
                  <span class="text-xs text-slate-500 fw-semibold uppercase tracking-wide">Monto Total</span>
                  <span class="h4 fw-bold text-ink-black-800 mb-0">{{ formatCLP(summary.total_amount) }}</span>
                  <span class="text-xs text-slate-400">Ventas netas confirmadas</span>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column gap-1 border-start border-4 border-brick-ember-500">
                  <span class="text-xs text-slate-500 fw-semibold uppercase tracking-wide">Unidades Vendidas</span>
                  <span class="h4 fw-bold text-ink-black-800 mb-0">{{ summary.total_quantity.toLocaleString("es-CL") }}</span>
                  <span class="text-xs text-slate-400">Total de ítems</span>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column gap-1 border-start border-4 border-emerald-500">
                  <span class="text-xs text-slate-500 fw-semibold uppercase tracking-wide">Documentos</span>
                  <span class="h4 fw-bold text-ink-black-800 mb-0">{{ summary.document_count.toLocaleString("es-CL") }}</span>
                  <span class="text-xs text-slate-400">Boletas / facturas</span>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column gap-1 border-start border-4 border-amber-500">
                  <span class="text-xs text-slate-500 fw-semibold uppercase tracking-wide">Productos</span>
                  <span class="h4 fw-bold text-ink-black-800 mb-0">{{ summary.product_count.toLocaleString("es-CL") }}</span>
                  <span class="text-xs text-slate-400">Productos únicos</span>
                </div>
              </div>
            </div>

            <!-- ── CHARTS ── -->
            <div class="row g-4">
              <!-- Sales by day -->
              <div class="col-12 col-lg-8">
                <div class="bg-white rounded-4 shadow-sm p-4 h-100">
                  <div class="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h3 class="fw-semibold text-slate-800 mb-0">Ventas por Día</h3>
                      <p class="text-xs text-slate-400 mt-1 mb-0">Monto neto diario en el período seleccionado</p>
                    </div>
                    <span class="badge rounded-pill bg-ink-black-100 text-ink-black-700 px-3 py-1 text-xs">{{ charts.salesByDay.length }} días</span>
                  </div>
                  <ApexChart
                    v-if="charts.salesByDay.length > 0"
                    type="area"
                    height="260"
                    :options="salesByDayOptions"
                    :series="salesByDaySeries"
                  />
                  <div v-else class="d-flex align-items-center justify-content-center" style="height:260px;">
                    <p class="text-secondary small">Sin datos para el período seleccionado.</p>
                  </div>
                </div>
              </div>

              <!-- Sales by category (donut) -->
              <div class="col-12 col-lg-4">
                <div class="bg-white rounded-4 shadow-sm p-4 h-100">
                  <div class="mb-3">
                    <h3 class="fw-semibold text-slate-800 mb-0">Ventas por Categoría</h3>
                    <p class="text-xs text-slate-400 mt-1 mb-0">Distribución por categoría de producto</p>
                  </div>
                  <ApexChart
                    v-if="charts.byCategories.length > 0"
                    type="donut"
                    height="260"
                    :options="categoryDonutOptions"
                    :series="categoryDonutSeries"
                  />
                  <div v-else class="d-flex align-items-center justify-content-center" style="height:260px;">
                    <p class="text-secondary small">Sin datos para el período seleccionado.</p>
                  </div>
                </div>
              </div>

              <!-- Top products -->
              <div class="col-12">
                <div class="bg-white rounded-4 shadow-sm p-4">
                  <div class="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h3 class="fw-semibold text-slate-800 mb-0">Top 10 Productos por Ingresos</h3>
                      <p class="text-xs text-slate-400 mt-1 mb-0">Productos con mayor monto de venta neta</p>
                    </div>
                  </div>
                  <ApexChart
                    v-if="charts.topProducts.length > 0"
                    type="bar"
                    height="280"
                    :options="topProductsOptions"
                    :series="topProductsSeries"
                  />
                  <div v-else class="d-flex align-items-center justify-content-center" style="height:280px;">
                    <p class="text-secondary small">Sin datos para el período seleccionado.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── DATA TABLE ── -->
            <div class="bg-white rounded-4 shadow-sm p-4">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h3 class="fw-semibold text-slate-800 mb-0">Detalle de Ventas</h3>
                  <p class="text-xs text-slate-400 mt-1 mb-0">Clic sobre producto, categoría, marca o modelo para ver el detalle completo</p>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span class="badge rounded-pill bg-slate-100 text-slate-600 px-3 py-1 text-xs">{{ rows.length }} registros</span>
                  <button class="btn btn-sm btn-success rounded-3 d-flex align-items-center gap-1" @click="exportCsv" title="Exportar como CSV/Excel">
                    <i class="fa-solid fa-file-excel"></i><span class="d-none d-sm-inline">Excel</span>
                  </button>
                  <button class="btn btn-sm btn-danger rounded-3 d-flex align-items-center gap-1" @click="exportPrint" title="Imprimir / Guardar como PDF">
                    <i class="fa-solid fa-file-pdf"></i><span class="d-none d-sm-inline">PDF</span>
                  </button>
                  <button class="btn btn-sm btn-secondary rounded-3 d-flex align-items-center gap-1" @click="exportCopy" title="Copiar al portapapeles">
                    <i class="fa-solid fa-copy"></i><span class="d-none d-sm-inline">Copiar</span>
                  </button>
                </div>
              </div>

              <div class="table-responsive">
                <table
                  ref="tableRef"
                  class="table table-hover align-middle w-100"
                  style="font-size:0.85rem;"
                >
                  <thead class="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Documento</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th class="text-end">Cantidad</th>
                      <th class="text-end">Precio Unit.</th>
                      <th class="text-end">Monto Neto</th>
                      <th>Cliente</th>
                      <th>Bodega</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in rows" :key="row.detail_id">
                      <td class="text-nowrap">{{ formatDate(row.document_date) }}</td>
                      <td class="text-nowrap">
                        <span class="badge bg-ink-black-100 text-ink-black-700 fw-normal">{{ row.document_number ?? '—' }}</span>
                      </td>
                      <td>
                        <button
                          class="btn btn-link p-0 text-start text-ink-black-800 text-decoration-none drill-link"
                          @click="openDetailModal(row)"
                        >
                          {{ row.product_name ?? row.product_variant_name ?? '—' }}
                        </button>
                      </td>
                      <td>
                        <button
                          v-if="row.category_name"
                          class="btn btn-link p-0 text-start text-ink-black-600 text-decoration-none drill-link"
                          @click="openDetailModal(row)"
                        >
                          <span class="badge rounded-pill bg-slate-100 text-slate-700 fw-normal px-2">{{ row.category_name }}</span>
                        </button>
                        <span v-else class="text-slate-400">—</span>
                      </td>
                      <td>
                        <button
                          v-if="row.brand_name"
                          class="btn btn-link p-0 text-start text-decoration-none drill-link"
                          @click="openDetailModal(row)"
                        >
                          <span class="badge rounded-pill bg-brick-ember-50 text-brick-ember-700 fw-normal px-2">{{ row.brand_name }}</span>
                        </button>
                        <span v-else class="text-slate-400">—</span>
                      </td>
                      <td>
                        <button
                          v-if="row.model_name"
                          class="btn btn-link p-0 text-start text-decoration-none drill-link"
                          @click="openDetailModal(row)"
                        >
                          <span class="badge rounded-pill bg-ink-black-50 text-ink-black-600 fw-normal px-2">{{ row.model_name }}</span>
                        </button>
                        <span v-else class="text-slate-400">—</span>
                      </td>
                      <td class="text-end fw-semibold">{{ row.quantity.toLocaleString("es-CL") }}</td>
                      <td class="text-end">{{ formatCLP(row.unit_price) }}</td>
                      <td class="text-end fw-bold text-ink-black-800">{{ formatCLP(row.line_total) }}</td>
                      <td class="text-truncate" style="max-width:160px;" :title="row.customer_name ?? ''">{{ row.customer_name ?? '—' }}</td>
                      <td>{{ row.warehouse_name ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>
      </main>

      <DashFooter />
    </div>
  </div>

  <!-- ── DRILL-DOWN MODAL ── -->
  <Teleport to="body">
    <div
      v-if="modalVisible"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      style="background:rgba(0,0,0,0.55);"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content rounded-4 border-0 shadow-lg font-quicksand">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <div class="d-flex align-items-start gap-3 w-100">
              <div class="flex-shrink-0 w-10 h-10 rounded-circle bg-ink-black-100 d-flex align-items-center justify-content-center" style="width:2.5rem;height:2.5rem;">
                <i class="fa-solid fa-receipt text-ink-black-700"></i>
              </div>
              <div class="flex-grow-1">
                <h5 class="modal-title fw-bold text-ink-black-900 mb-0">Detalle de Venta</h5>
                <p class="text-secondary small mb-0">{{ selectedRow?.document_number ?? '' }}</p>
              </div>
              <button type="button" class="btn-close" @click="closeModal" aria-label="Cerrar"></button>
            </div>
          </div>

          <div class="modal-body px-4 py-3" v-if="selectedRow">
            <!-- Document info -->
            <div class="bg-slate-50 rounded-3 p-3 mb-3">
              <div class="row g-2">
                <div class="col-6 col-md-4">
                  <span class="text-xs text-slate-500 d-block">Fecha</span>
                  <span class="fw-semibold text-sm">{{ formatDate(selectedRow.document_date) }}</span>
                </div>
                <div class="col-6 col-md-4">
                  <span class="text-xs text-slate-500 d-block">Documento</span>
                  <span class="fw-semibold text-sm">{{ selectedRow.document_number ?? '—' }}</span>
                </div>
                <div class="col-6 col-md-4">
                  <span class="text-xs text-slate-500 d-block">Tipo</span>
                  <span class="fw-semibold text-sm">{{ selectedRow.document_type_name ?? '—' }}</span>
                </div>
                <div class="col-6 col-md-4">
                  <span class="text-xs text-slate-500 d-block">Cliente</span>
                  <span class="fw-semibold text-sm">{{ selectedRow.customer_name ?? '—' }}</span>
                </div>
                <div class="col-6 col-md-4">
                  <span class="text-xs text-slate-500 d-block">Bodega</span>
                  <span class="fw-semibold text-sm">{{ selectedRow.warehouse_name ?? '—' }}</span>
                </div>
                <div class="col-6 col-md-4">
                  <span class="text-xs text-slate-500 d-block">Línea Nº</span>
                  <span class="fw-semibold text-sm">{{ selectedRow.line_number }}</span>
                </div>
              </div>
            </div>

            <!-- Product info -->
            <div class="bg-white rounded-3 border border-slate-200 p-3 mb-3">
              <p class="text-xs fw-semibold uppercase tracking-wide text-ink-black-500 mb-2">Información del Producto</p>
              <div class="row g-2">
                <div class="col-12 col-md-6">
                  <span class="text-xs text-slate-500 d-block">Producto</span>
                  <span class="fw-bold text-ink-black-800">{{ selectedRow.product_name ?? '—' }}</span>
                </div>
                <div class="col-12 col-md-6">
                  <span class="text-xs text-slate-500 d-block">Variante</span>
                  <span class="text-sm">{{ selectedRow.product_variant_name ?? '—' }}</span>
                </div>
                <div class="col-6 col-md-3">
                  <span class="text-xs text-slate-500 d-block">SKU Producto</span>
                  <span class="font-monospace text-sm">{{ selectedRow.product_sku ?? '—' }}</span>
                </div>
                <div class="col-6 col-md-3">
                  <span class="text-xs text-slate-500 d-block">SKU Variante</span>
                  <span class="font-monospace text-sm">{{ selectedRow.product_variant_sku ?? '—' }}</span>
                </div>
                <div class="col-6 col-md-3">
                  <span class="text-xs text-slate-500 d-block">Código Barras</span>
                  <span class="font-monospace text-sm">{{ selectedRow.product_variant_barcode ?? '—' }}</span>
                </div>
                <div class="col-6 col-md-3">
                  <span class="text-xs text-slate-500 d-block">Código Variante</span>
                  <span class="font-monospace text-sm">{{ selectedRow.product_variant_code ?? '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Taxonomy -->
            <div class="bg-white rounded-3 border border-slate-200 p-3 mb-3">
              <p class="text-xs fw-semibold uppercase tracking-wide text-ink-black-500 mb-2">Clasificación</p>
              <div class="d-flex flex-wrap gap-2">
                <div class="d-flex align-items-center gap-1">
                  <span class="text-xs text-slate-500">Categoría:</span>
                  <span class="badge rounded-pill bg-slate-100 text-slate-700 fw-normal px-2">{{ selectedRow.category_name ?? '—' }}</span>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <span class="text-xs text-slate-500">Marca:</span>
                  <span class="badge rounded-pill bg-brick-ember-50 text-brick-ember-700 fw-normal px-2">{{ selectedRow.brand_name ?? '—' }}</span>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <span class="text-xs text-slate-500">Modelo:</span>
                  <span class="badge rounded-pill bg-ink-black-50 text-ink-black-600 fw-normal px-2">{{ selectedRow.model_name ?? '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Financial -->
            <div class="bg-ink-black-950 text-white rounded-3 p-3">
              <p class="text-xs fw-semibold uppercase tracking-wide text-ink-black-300 mb-2">Información Financiera</p>
              <div class="row g-2">
                <div class="col-6 col-md-3">
                  <span class="text-xs text-ink-black-300 d-block">Cantidad</span>
                  <span class="fw-bold text-lg">{{ selectedRow.quantity.toLocaleString("es-CL") }}</span>
                </div>
                <div class="col-6 col-md-3">
                  <span class="text-xs text-ink-black-300 d-block">Precio Unit.</span>
                  <span class="fw-semibold">{{ formatCLP(selectedRow.unit_price) }}</span>
                </div>
                <div class="col-6 col-md-3">
                  <span class="text-xs text-ink-black-300 d-block">Descuento</span>
                  <span class="fw-semibold text-brick-ember-300">-{{ formatCLP(selectedRow.discount_amount) }}</span>
                </div>
                <div class="col-6 col-md-3">
                  <span class="text-xs text-ink-black-300 d-block">Impuesto</span>
                  <span class="fw-semibold">{{ formatCLP(selectedRow.tax_amount) }}</span>
                </div>
                <div class="col-12 mt-2 pt-2 border-top border-ink-black-700">
                  <span class="text-xs text-ink-black-300 d-block">Monto Neto Línea</span>
                  <span class="h5 fw-bold text-white mb-0">{{ formatCLP(selectedRow.line_total) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer border-0 px-4 pb-4 pt-2">
            <button type="button" class="btn btn-secondary rounded-3" @click="closeModal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import ApexChart from "vue3-apexcharts";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-bs5";
import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import { reportService, type SalesReportRow, type SalesReportSummary, type SalesReportCharts } from "../services/report.service";
import { categoryService, type CategoryItem } from "../services/category.service";
import { brandService, type BrandItem } from "../services/brand.service";
import { modelService, type ModelItem } from "../services/model.service";

DataTable.use(DataTablesCore);

// ── State ────────────────────────────────────────────────────────────────────
const sidebarOpen = ref(false);
const isLoading = ref(false);
const isError = ref(false);
const tableRef = ref<HTMLTableElement | null>(null);
let dtInstance: ReturnType<typeof DataTablesCore> | null = null;

const rows = ref<SalesReportRow[]>([]);
const summary = ref<SalesReportSummary>({ total_amount: 0, total_quantity: 0, document_count: 0, product_count: 0 });
const charts = ref<SalesReportCharts>({ salesByDay: [], topProducts: [], byCategories: [] });

const categories = ref<CategoryItem[]>([]);
const brands = ref<BrandItem[]>([]);
const models = ref<ModelItem[]>([]);

// Default: last 30 days
const today = new Date();
const minus30 = new Date(today);
minus30.setDate(today.getDate() - 30);
const toDateStr = (d: Date) => d.toISOString().substring(0, 10);

const draftFilters = ref({
  date_from: toDateStr(minus30),
  date_to: toDateStr(today),
  category_id: "",
  brand_id: "",
  model_id: "",
  product_name: ""
});

const appliedFilters = ref({ ...draftFilters.value });

// Drill-down modal
const modalVisible = ref(false);
const selectedRow = ref<SalesReportRow | null>(null);

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCLP(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Filters ───────────────────────────────────────────────────────────────────
function applyFilters() {
  appliedFilters.value = { ...draftFilters.value };
  void fetchReport();
}

function clearFilters() {
  draftFilters.value = { date_from: toDateStr(minus30), date_to: toDateStr(today), category_id: "", brand_id: "", model_id: "", product_name: "" };
  applyFilters();
}

// ── Data fetch ────────────────────────────────────────────────────────────────
async function fetchReport() {
  isLoading.value = true;
  isError.value = false;
  try {
    const filters = appliedFilters.value;
    const result = await reportService.getDailySales({
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      category_id: filters.category_id || undefined,
      brand_id: filters.brand_id || undefined,
      model_id: filters.model_id || undefined,
      product_name: filters.product_name || undefined
    });
    rows.value = result.rows;
    summary.value = result.summary;
    charts.value = result.charts;

    await nextTick();
    initDataTable();
  } catch {
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
}

async function fetchFilterLists() {
  const [cats, brs, mds] = await Promise.allSettled([
    categoryService.list(),
    brandService.list(),
    modelService.list()
  ]);
  if (cats.status === "fulfilled") categories.value = cats.value;
  if (brs.status === "fulfilled") brands.value = brs.value;
  if (mds.status === "fulfilled") models.value = mds.value;
}

// ── DataTables ────────────────────────────────────────────────────────────────
function initDataTable() {
  if (!tableRef.value) return;

  if (dtInstance) {
    dtInstance.destroy();
    dtInstance = null;
  }

  dtInstance = new DataTablesCore(tableRef.value, {
    language: {
      url: "//cdn.datatables.net/plug-ins/2.1.8/i18n/es-ES.json"
    },
    pageLength: 25,
    lengthMenu: [10, 25, 50, 100],
    order: [[0, "desc"]],
    columnDefs: [
      { targets: [6, 7, 8], className: "text-end" }
    ]
  });
}

// ── Native exports ────────────────────────────────────────────────────────────
const EXPORT_HEADERS = ["Fecha", "Documento", "Producto", "Categoría", "Marca", "Modelo", "Cantidad", "Precio Unit.", "Monto Neto", "Cliente", "Bodega"];

function rowToCells(row: SalesReportRow): string[] {
  return [
    formatDate(row.document_date),
    row.document_number ?? "",
    row.product_name ?? row.product_variant_name ?? "",
    row.category_name ?? "",
    row.brand_name ?? "",
    row.model_name ?? "",
    String(row.quantity),
    String(row.unit_price),
    String(row.line_total),
    row.customer_name ?? "",
    row.warehouse_name ?? ""
  ];
}

function exportCsv() {
  const lines = [EXPORT_HEADERS.join(";")];
  for (const row of rows.value) {
    lines.push(rowToCells(row).map((c) => `"${c.replace(/"/g, '""')}"`).join(";"));
  }
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "informe-ventas-diarias.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportCopy() {
  const lines = [EXPORT_HEADERS.join("\t")];
  for (const row of rows.value) {
    lines.push(rowToCells(row).join("\t"));
  }
  void navigator.clipboard.writeText(lines.join("\n"));
}

function exportPrint() {
  window.print();
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openDetailModal(row: SalesReportRow) {
  selectedRow.value = row;
  modalVisible.value = true;
  document.body.classList.add("overflow-hidden");
}

function closeModal() {
  modalVisible.value = false;
  selectedRow.value = null;
  document.body.classList.remove("overflow-hidden");
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === "Escape" && modalVisible.value) closeModal();
}

// ── Chart options ─────────────────────────────────────────────────────────────
const salesByDaySeries = computed(() => [{
  name: "Monto Neto",
  data: charts.value.salesByDay.map((d) => d.amount)
}]);

const salesByDayOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "Quicksand, sans-serif",
    animations: { enabled: true, easing: "easeinout", speed: 600 }
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth" as const, width: 2.5 },
  fill: {
    type: "gradient",
    gradient: { shadeIntensity: 1, opacityFrom: 0.32, opacityTo: 0.02, stops: [0, 90, 100] }
  },
  colors: ["#0e218b"],
  xaxis: {
    categories: charts.value.salesByDay.map((d) => d.date),
    labels: {
      style: { fontSize: "11px", colors: "#94a3b8" },
      formatter: (v: string) => {
        const d = new Date(v + "T00:00:00");
        return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (v: number) => "$" + (v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + "M" : (v / 1_000).toFixed(0) + "K"),
      style: { fontSize: "11px", colors: "#94a3b8" }
    }
  },
  grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
  tooltip: {
    y: { formatter: (v: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v) },
    theme: "light"
  }
}));

const categoryDonutSeries = computed(() =>
  charts.value.byCategories.map((c) => c.amount)
);

const categoryDonutOptions = computed(() => ({
  chart: {
    fontFamily: "Quicksand, sans-serif",
    animations: { enabled: true, easing: "easeinout", speed: 600 }
  },
  labels: charts.value.byCategories.map((c) => c.name),
  colors: ["#0e218b", "#ff0000", "#122bba", "#cc0000", "#1736e8", "#970207", "#455eed", "#fb040c", "#7487f1", "#fd686d"],
  dataLabels: { enabled: true, formatter: (_val: number, opts: { seriesIndex: number; w: { config: { labels: string[] } } }) => opts.w.config.labels[opts.seriesIndex] },
  legend: { position: "bottom" as const, fontSize: "11px" },
  plotOptions: {
    pie: {
      donut: {
        size: "60%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total",
            formatter: () => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(summary.value.total_amount)
          }
        }
      }
    }
  },
  tooltip: {
    y: { formatter: (v: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v) }
  }
}));

const topProductsSeries = computed(() => [{
  name: "Monto Neto",
  data: charts.value.topProducts.map((p) => p.amount)
}]);

const topProductsOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: "Quicksand, sans-serif",
    animations: { enabled: true, easing: "easeinout", speed: 600 }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: "62%",
      distributed: true,
      borderRadius: 4
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (v: number) => "$" + (v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + "M" : (v / 1_000).toFixed(0) + "K"),
    style: { fontSize: "11px" }
  },
  colors: ["#0e218b", "#122bba", "#1736e8", "#455eed", "#7487f1", "#ff0000", "#cc0000", "#970207", "#fb040c", "#fd686d"],
  xaxis: {
    categories: charts.value.topProducts.map((p) => p.name),
    labels: {
      formatter: (v: number) => "$" + (v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + "M" : (v / 1_000).toFixed(0) + "K"),
      style: { fontSize: "11px", colors: "#94a3b8" }
    }
  },
  yaxis: {
    labels: { style: { fontSize: "12px" } }
  },
  legend: { show: false },
  grid: { borderColor: "#f1f5f9" },
  tooltip: {
    y: {
      formatter: (_v: number, opts: { dataPointIndex: number }) => {
        const p = charts.value.topProducts[opts.dataPointIndex];
        const amt = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(p.amount);
        return `${amt} — ${p.qty.toLocaleString("es-CL")} uds.`;
      }
    }
  }
}));

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener("keydown", handleEscape);
  await fetchFilterLists();
  await fetchReport();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscape);
  if (dtInstance) {
    dtInstance.destroy();
    dtInstance = null;
  }
  document.body.classList.remove("overflow-hidden");
});
</script>

<style scoped>
.drill-link {
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
}
.drill-link:hover {
  text-decoration: underline !important;
  color: #cc0000 !important;
}

:deep(.dt-buttons) {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

:deep(.dataTables_filter input) {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.35rem 0.75rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

:deep(.dataTables_filter input:focus) {
  border-color: rgba(204, 0, 0, 0.5);
  box-shadow: 0 0 0 0.2rem rgba(204, 0, 0, 0.16);
}

:deep(.paginate_button.current),
:deep(.paginate_button.current:hover) {
  background: #0e218b !important;
  border-color: #0e218b !important;
  color: #fff !important;
  border-radius: 0.4rem;
}

:deep(.paginate_button:hover:not(.current):not(.disabled)) {
  background: rgba(14, 33, 139, 0.08) !important;
  border-color: rgba(14, 33, 139, 0.2) !important;
  color: #0e218b !important;
  border-radius: 0.4rem;
}

@media print {
  .bg-ink-black-950 .text-white { color: #0f172a !important; }
  :deep(.dataTables_filter),
  :deep(.dataTables_length),
  :deep(.dataTables_paginate),
  :deep(.dataTables_info) { display: none !important; }
}
</style>
