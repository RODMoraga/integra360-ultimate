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
              <li class="breadcrumb-item active" aria-current="page">Inventario</li>
            </ol>
          </nav>

          <!-- Page header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-cubes me-2 text-brick-ember"></i>Gestión de Inventario
              </h1>
              <p class="text-secondary small mb-0">Administra el stock de productos por bodega.</p>
            </div>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-warning d-flex align-items-center gap-2 px-3 rounded-3"
                :class="{ active: filterLowStock }"
                @click="toggleLowStockFilter"
                :title="filterLowStock ? 'Mostrar todos' : 'Solo stock bajo'"
              >
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span class="d-none d-sm-inline">Stock Bajo</span>
                <span v-if="filterLowStock" class="badge bg-warning text-dark ms-1">ON</span>
              </button>
              <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
                <i class="fa-solid fa-plus"></i>
                Nuevo Registro
              </button>
            </div>
          </div>

          <!-- Table card -->
          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando inventario...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar el inventario. Intenta nuevamente.
            </div>

            <div v-else>
              <!-- Search and page size controls -->
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 480px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por SKU, producto, variante, bodega..."
                    aria-label="Buscar inventario"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="inventory-page-size"
                      v-model="pageSize"
                      placeholder="Cantidad"
                      :options="pageSizeOptions"
                      :searchable="false"
                    />
                  </div>
                  <span class="small text-secondary">registros</span>
                </div>
              </div>

              <!-- Filter badge -->
              <div v-if="filterLowStock" class="alert alert-warning d-flex align-items-center gap-2 py-2 rounded-3 mb-3" role="alert">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span class="small">Mostrando solo registros con <strong>stock bajo</strong> (en mano ≤ punto de reorden).</span>
                <button class="btn btn-sm btn-link p-0 ms-auto text-warning" @click="filterLowStock = false">Quitar filtro</button>
              </div>

              <!-- DataTable -->
              <div class="table-responsive">
                <table class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('variant_sku')">SKU <i :class="sortIcon('variant_sku')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('product_name')">Producto <i :class="sortIcon('product_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('variant_name')">Variante <i :class="sortIcon('variant_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('warehouse_name')">Bodega <i :class="sortIcon('warehouse_name')"></i></button></th>
                      <th class="text-end"><button type="button" class="table-sort-btn" @click="toggleSort('quantity_on_hand')">En Stock <i :class="sortIcon('quantity_on_hand')"></i></button></th>
                      <th class="text-end"><button type="button" class="table-sort-btn" @click="toggleSort('quantity_reserved')">Reservado <i :class="sortIcon('quantity_reserved')"></i></button></th>
                      <th class="text-end"><button type="button" class="table-sort-btn" @click="toggleSort('quantity_available')">Disponible <i :class="sortIcon('quantity_available')"></i></button></th>
                      <th class="text-end">Mínimo</th>
                      <th class="text-end">Máximo</th>
                      <th class="text-end">P. Reorden</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_low_stock')">Estado Stock <i :class="sortIcon('is_low_stock')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in paginatedInventory" :key="item.id">
                      <td class="text-secondary small">{{ item.id }}</td>
                      <td>
                        <span class="badge bg-secondary-subtle text-secondary fw-semibold font-monospace">
                          {{ item.variant_sku ?? item.variant_code ?? '—' }}
                        </span>
                      </td>
                      <td class="fw-semibold small">{{ item.product_name ?? '—' }}</td>
                      <td class="small text-secondary">{{ item.variant_name ?? '—' }}</td>
                      <td class="small">
                        <span class="d-block">{{ item.warehouse_name ?? '—' }}</span>
                        <span class="text-secondary font-monospace">{{ item.warehouse_code ?? '' }}</span>
                      </td>
                      <td class="text-end fw-semibold">{{ formatQty(item.quantity_on_hand) }}</td>
                      <td class="text-end text-secondary small">{{ formatQty(item.quantity_reserved) }}</td>
                      <td class="text-end">
                        <span :class="item.quantity_available < 0 ? 'text-danger fw-bold' : ''">
                          {{ formatQty(item.quantity_available) }}
                        </span>
                      </td>
                      <td class="text-end text-secondary small">{{ item.min_stock != null ? formatQty(item.min_stock) : '—' }}</td>
                      <td class="text-end text-secondary small">{{ item.max_stock != null ? formatQty(item.max_stock) : '—' }}</td>
                      <td class="text-end text-secondary small">{{ item.reorder_point != null ? formatQty(item.reorder_point) : '—' }}</td>
                      <td>
                        <span class="badge rounded-pill" :class="item.is_low_stock ? 'text-bg-danger' : 'text-bg-success'">
                          {{ item.is_low_stock ? 'Stock Bajo' : 'Normal' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(item.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="d-flex gap-1 justify-content-center">
                          <button class="btn btn-sm btn-outline-info rounded-3 px-2" @click="openViewModal(item)" title="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning rounded-3 px-2" @click="openEditModal(item)" title="Editar stock">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger rounded-3 px-2"
                            @click="confirmDelete(item)"
                            title="Eliminar registro"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedInventory.length === 0">
                      <td colspan="14" class="text-center text-secondary py-4">
                        No se encontraron registros de inventario para el filtro actual.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredInventory.length }} registros
                </p>
                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación inventario">
                  <button type="button" class="btn btn-outline-secondary" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <button type="button" class="btn btn-outline-secondary" disabled>Página {{ currentPage }} / {{ totalPages }}</button>
                  <button type="button" class="btn btn-outline-secondary" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DashFooter />
    </div>
  </div>

  <!-- Form Modal (Create / Edit) -->
  <div class="modal fade" id="inventoryFormModal" tabindex="-1" aria-labelledby="inventoryFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="inventoryFormModalLabel">
            <i class="fa-solid fa-cubes me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Stock' : 'Nuevo Registro de Inventario' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3">
          <div class="row g-3">
            <!-- Create-only fields -->
            <template v-if="!isEditMode">
              <div class="col-12">
                <CustomSelect
                  id="inventory-warehouse"
                  v-model="form.warehouse_id"
                  label="Bodega"
                  placeholder="Seleccionar bodega"
                  :options="warehouseOptions"
                  :searchable="true"
                />
              </div>
              <div class="col-12">
                <CustomSelect
                  id="inventory-variant"
                  v-model="form.product_variant_id"
                  label="Variante de Producto"
                  placeholder="Buscar variante (SKU, nombre)"
                  :options="variantOptions"
                  :searchable="true"
                />
              </div>
            </template>

            <!-- Edit-mode: show locked fields as info -->
            <template v-else>
              <div class="col-md-6">
                <label class="block text-sm font-medium text-ink-black-700 mb-1">Bodega</label>
                <div class="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-secondary small">
                  {{ form._warehouse_name || '—' }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="block text-sm font-medium text-ink-black-700 mb-1">Variante</label>
                <div class="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-secondary small">
                  {{ form._variant_label || '—' }}
                </div>
              </div>
            </template>

            <!-- Quantity fields -->
            <div class="col-md-4">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">En Stock <span class="text-danger">*</span></label>
              <input
                v-model.number="form.quantity_on_hand"
                type="number"
                min="0"
                step="0.0001"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="0.0000"
              />
            </div>

            <div class="col-md-4">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Reservado</label>
              <input
                v-model.number="form.quantity_reserved"
                type="number"
                min="0"
                step="0.0001"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="0.0000"
              />
            </div>

            <div class="col-md-4">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Mínimo en Stock</label>
              <input
                v-model.number="form.min_stock"
                type="number"
                min="0"
                step="0.0001"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="0.0000"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Stock Máximo</label>
              <input
                v-model="form.max_stock"
                type="number"
                min="0"
                step="0.0001"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Sin límite"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Punto de Reorden</label>
              <input
                v-model="form.reorder_point"
                type="number"
                min="0"
                step="0.0001"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Automático"
              />
              <p class="text-secondary" style="font-size:0.75rem;margin-top:4px;">Cuando el stock en mano alcance este valor se marcará como <strong>stock bajo</strong>.</p>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-light rounded-3" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary rounded-3 px-4" @click="submitForm" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="fa-solid fa-floppy-disk me-2"></i>
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- View Modal -->
  <div class="modal fade" id="inventoryViewModal" tabindex="-1" aria-labelledby="inventoryViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 shadow" v-if="selectedItem">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="inventoryViewModalLabel">
            <i class="fa-solid fa-cubes me-2 text-info"></i>Detalle de Inventario
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <!-- Header card -->
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div
              class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              :class="selectedItem.is_low_stock ? 'bg-danger' : 'bg-success'"
              style="width:52px;height:52px;font-size:1.2rem;flex-shrink:0;"
            >
              <i class="fa-solid fa-cubes"></i>
            </div>
            <div class="min-w-0">
              <p class="fw-bold mb-0 text-truncate">{{ selectedItem.product_name ?? '—' }}</p>
              <p class="text-secondary small mb-0">{{ selectedItem.variant_name ?? '—' }}</p>
              <div class="d-flex gap-2 mt-1 flex-wrap">
                <span class="badge bg-secondary-subtle text-secondary font-monospace">{{ selectedItem.variant_sku ?? selectedItem.variant_code ?? '—' }}</span>
                <span class="badge rounded-pill" :class="selectedItem.is_low_stock ? 'text-bg-danger' : 'text-bg-success'">
                  {{ selectedItem.is_low_stock ? 'Stock Bajo' : 'Normal' }}
                </span>
              </div>
            </div>
          </div>

          <div class="row g-3">
            <!-- Warehouse -->
            <div class="col-md-6"><DetailRow icon="fa-warehouse" label="Bodega" :value="selectedItem.warehouse_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Cód. Bodega" :value="selectedItem.warehouse_code" /></div>
            <!-- Product -->
            <div class="col-md-6"><DetailRow icon="fa-box" label="Producto" :value="selectedItem.product_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-tag" label="SKU Producto" :value="selectedItem.product_sku" /></div>
            <!-- Quantities -->
            <div class="col-md-4">
              <div class="text-center p-3 rounded-3 bg-primary bg-opacity-10">
                <p class="text-secondary small mb-1">En Stock</p>
                <p class="fw-bold fs-5 mb-0 text-primary">{{ formatQty(selectedItem.quantity_on_hand) }}</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="text-center p-3 rounded-3 bg-secondary bg-opacity-10">
                <p class="text-secondary small mb-1">Reservado</p>
                <p class="fw-bold fs-5 mb-0 text-secondary">{{ formatQty(selectedItem.quantity_reserved) }}</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="text-center p-3 rounded-3" :class="selectedItem.quantity_available < 0 ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10'">
                <p class="text-secondary small mb-1">Disponible</p>
                <p class="fw-bold fs-5 mb-0" :class="selectedItem.quantity_available < 0 ? 'text-danger' : 'text-success'">{{ formatQty(selectedItem.quantity_available) }}</p>
              </div>
            </div>
            <!-- Thresholds -->
            <div class="col-md-4"><DetailRow icon="fa-arrow-down" label="Stock Mínimo" :value="String(formatQty(selectedItem.min_stock))" /></div>
            <div class="col-md-4"><DetailRow icon="fa-arrow-up" label="Stock Máximo" :value="selectedItem.max_stock != null ? String(formatQty(selectedItem.max_stock)) : null" /></div>
            <div class="col-md-4"><DetailRow icon="fa-rotate-right" label="Punto de Reorden" :value="selectedItem.reorder_point != null ? String(formatQty(selectedItem.reorder_point)) : null" /></div>
            <!-- Dates -->
            <div class="col-md-6"><DetailRow icon="fa-calendar-plus" label="Creado" :value="formatDate(selectedItem.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar-check" label="Actualizado" :value="formatDate(selectedItem.updated_at)" /></div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-light rounded-3" data-bs-dismiss="modal">Cerrar</button>
          <button class="btn btn-warning rounded-3" @click="openEditFromView">
            <i class="fa-solid fa-pen-to-square me-2"></i>Editar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";

import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import CustomSelect from "../components/CustomSelect.vue";
import { useInventory, useCreateInventory, useUpdateInventory, useDeleteInventory } from "../composables/useInventory";
import { useWarehouses } from "../composables/useWarehouses";
import { useProductVariants } from "../composables/useProductVariants";
import type { InventoryItem } from "../services/inventory.service";
import type { SelectOption } from "../components/CustomSelect.vue";
import { formatDate } from "../utils/datetime";

const DetailRow = {
  props: { icon: String, label: String, value: { default: null } },
  template: `
    <div class="d-flex align-items-start gap-2">
      <i :class="['fa-solid', icon, 'text-primary mt-1']" style="width:16px;"></i>
      <div>
        <p class="text-secondary small mb-0">{{ label }}</p>
        <p class="fw-semibold mb-0">{{ value ?? '—' }}</p>
      </div>
    </div>
  `
};

// ── State ────────────────────────────────────────────────────────────────────
const sidebarOpen = ref(false);
const filterLowStock = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

// ── Queries / mutations ───────────────────────────────────────────────────────
const { data, isLoading, isError } = useInventory();
const { data: warehousesData } = useWarehouses();
const { data: variantsData } = useProductVariants();
const { mutateAsync: createInventory } = useCreateInventory();
const { mutateAsync: updateInventory } = useUpdateInventory();
const { mutateAsync: deleteInventory } = useDeleteInventory();

// ── Table state ───────────────────────────────────────────────────────────────
const inventory = computed(() => data.value ?? []);
const selectedItem = ref<InventoryItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);

type SortKey = "id" | "variant_sku" | "product_name" | "variant_name" | "warehouse_name" | "quantity_on_hand" | "quantity_reserved" | "quantity_available" | "is_low_stock" | "created_at";
const sortKey = ref<SortKey>("product_name");
const sortDirection = ref<"asc" | "desc">("asc");

// ── Form ──────────────────────────────────────────────────────────────────────
const emptyForm = () => ({
  warehouse_id: "",
  product_variant_id: "",
  quantity_on_hand: 0,
  quantity_reserved: 0,
  min_stock: 0,
  max_stock: "" as number | string,
  reorder_point: "" as number | string,
  _warehouse_name: "",
  _variant_label: ""
});

const form = ref(emptyForm());

// ── Select options ────────────────────────────────────────────────────────────
const pageSizeOptions: SelectOption[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 }
];

const warehouseOptions = computed<SelectOption[]>(() => {
  return (warehousesData.value ?? [])
    .filter((w) => w.is_active)
    .map((w) => ({ value: w.id, label: `${w.code} – ${w.name}` }));
});

const variantOptions = computed<SelectOption[]>(() => {
  return (variantsData.value ?? [])
    .filter((v) => v.is_active)
    .map((v) => ({
      value: v.id,
      label: `${v.sku ?? v.variant_code} – ${v.product_name ? v.product_name + " / " : ""}${v.name}`
    }));
});

// ── Filtering ─────────────────────────────────────────────────────────────────
const filteredInventory = computed(() => {
  let list = inventory.value;

  if (filterLowStock.value) {
    list = list.filter((i) => i.is_low_stock);
  }

  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return list;

  return list.filter((i) => {
    const searchable = [
      String(i.id),
      i.variant_sku ?? "",
      i.variant_code ?? "",
      i.variant_name ?? "",
      i.product_name ?? "",
      i.product_sku ?? "",
      i.warehouse_name ?? "",
      i.warehouse_code ?? "",
      i.is_low_stock ? "stock bajo" : "normal"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

// ── Sorting ───────────────────────────────────────────────────────────────────
const getComparableValue = (item: InventoryItem, key: SortKey): string | number => {
  switch (key) {
    case "id":
      return Number(item.id);
    case "created_at":
      return item.created_at ? new Date(item.created_at).getTime() : 0;
    case "is_low_stock":
      return item.is_low_stock ? 1 : 0;
    case "quantity_on_hand":
      return item.quantity_on_hand;
    case "quantity_reserved":
      return item.quantity_reserved;
    case "quantity_available":
      return item.quantity_available;
    default:
      return ((item as unknown as Record<string, unknown>)[key] ?? "").toString().toLowerCase();
  }
};

const sortedInventory = computed(() => {
  const list = [...filteredInventory.value];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  list.sort((a, b) => {
    const left = getComparableValue(a, sortKey.value);
    const right = getComparableValue(b, sortKey.value);
    if (left === right) return 0;
    if (typeof left === "number" && typeof right === "number") return (left - right) * direction;
    return String(left).localeCompare(String(right), "es") * direction;
  });

  return list;
});

// ── Pagination ────────────────────────────────────────────────────────────────
const pageSizeNumber = computed(() => {
  const parsed = Number(pageSize.value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedInventory.value.length / pageSizeNumber.value)));

const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedInventory.value.slice(start, start + pageSizeNumber.value);
});

const paginationStart = computed(() =>
  filteredInventory.value.length === 0 ? 0 : (currentPage.value - 1) * pageSizeNumber.value + 1
);
const paginationEnd = computed(() =>
  filteredInventory.value.length === 0 ? 0 : Math.min(currentPage.value * pageSizeNumber.value, filteredInventory.value.length)
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatQty(value: number | null | undefined): string {
  if (value == null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/\.?0+$/, "");
}

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = "asc";
  }
}

function sortIcon(key: SortKey) {
  if (sortKey.value !== key) return "fa-solid fa-sort text-secondary opacity-75 ms-1";
  return sortDirection.value === "asc" ? "fa-solid fa-sort-up ms-1" : "fa-solid fa-sort-down ms-1";
}

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
}

function toggleLowStockFilter() {
  filterLowStock.value = !filterLowStock.value;
  currentPage.value = 1;
}

function showValidationError(msg: string) {
  return Swal.fire({ icon: "warning", title: "Campo requerido", text: msg, confirmButtonColor: "#dc3545" });
}

watch([searchQuery, pageSize, filterLowStock], () => { currentPage.value = 1; });
watch(totalPages, (maxPages) => {
  if (currentPage.value > maxPages) currentPage.value = maxPages;
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  if (formModalRef.value) formModalInstance = new Modal(formModalRef.value);
  if (viewModalRef.value) viewModalInstance = new Modal(viewModalRef.value);
});

onBeforeUnmount(() => {
  isComponentActive = false;
  if (pendingEditTimeout) {
    clearTimeout(pendingEditTimeout);
    pendingEditTimeout = null;
  }
  formModalInstance?.hide();
  viewModalInstance?.hide();
  formModalInstance?.dispose();
  viewModalInstance?.dispose();
  formModalInstance = null;
  viewModalInstance = null;
});

// ── Modal actions ─────────────────────────────────────────────────────────────
async function openCreateModal() {
  if (!isComponentActive) return;
  isEditMode.value = false;
  editingId.value = null;
  form.value = emptyForm();
  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

async function openEditModal(item: InventoryItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = item.id;
  form.value = {
    warehouse_id: item.warehouse_id,
    product_variant_id: item.product_variant_id,
    quantity_on_hand: item.quantity_on_hand,
    quantity_reserved: item.quantity_reserved,
    min_stock: item.min_stock,
    max_stock: item.max_stock ?? "",
    reorder_point: item.reorder_point ?? "",
    _warehouse_name: item.warehouse_name ?? "",
    _variant_label: `${item.variant_sku ?? item.variant_code ?? ""} – ${item.variant_name ?? ""}`
  };
  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

function openViewModal(item: InventoryItem) {
  if (!isComponentActive) return;
  selectedItem.value = item;
  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedItem.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedItem.value) return;
    void openEditModal(selectedItem.value);
  }, 350);
}

// ── Form submit ───────────────────────────────────────────────────────────────
async function submitForm() {
  const f = form.value;

  if (!isEditMode.value) {
    if (!f.warehouse_id) return showValidationError("La bodega es obligatoria.");
    if (!f.product_variant_id) return showValidationError("La variante de producto es obligatoria.");
  }

  if (f.quantity_on_hand === null || f.quantity_on_hand === undefined || f.quantity_on_hand < 0) {
    return showValidationError("La cantidad en stock no puede ser negativa.");
  }

  isSaving.value = true;
  try {
    const maxStock = f.max_stock !== "" && f.max_stock !== null && f.max_stock !== undefined ? Number(f.max_stock) : null;
    const reorderPoint = f.reorder_point !== "" && f.reorder_point !== null && f.reorder_point !== undefined ? Number(f.reorder_point) : null;

    if (isEditMode.value && editingId.value) {
      await updateInventory({
        id: editingId.value,
        payload: {
          quantity_on_hand: Number(f.quantity_on_hand),
          quantity_reserved: Number(f.quantity_reserved),
          min_stock: Number(f.min_stock),
          max_stock: maxStock,
          reorder_point: reorderPoint
        }
      });

      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Inventario actualizado",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    } else {
      await createInventory({
        warehouse_id: Number(f.warehouse_id),
        product_variant_id: Number(f.product_variant_id),
        quantity_on_hand: Number(f.quantity_on_hand),
        quantity_reserved: Number(f.quantity_reserved),
        min_stock: Number(f.min_stock),
        max_stock: maxStock,
        reorder_point: reorderPoint
      });

      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Registro creado",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    }
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ocurrió un error al guardar.";
    await Swal.fire({ icon: "error", title: "Error", text: message });
  } finally {
    isSaving.value = false;
  }
}

async function confirmDelete(item: InventoryItem) {
  const result = await Swal.fire({
    title: "¿Eliminar registro?",
    html: `<p class="mb-0">Se eliminará el registro de inventario de <strong>${item.product_name ?? item.variant_name ?? "esta variante"}</strong> en <strong>${item.warehouse_name ?? "la bodega"}</strong>.</p><p class="text-danger small mt-2 mb-0">Esta acción es irreversible.</p>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    await deleteInventory(item.id);
    await Swal.fire({
      icon: "success",
      title: "Registro eliminado",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar el registro.";
    await Swal.fire({ icon: "error", title: "Error", text: message });
  }
}
</script>

<style scoped>
.table-sort-btn {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font-weight: inherit;
  font-size: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.table-sort-btn:hover {
  text-decoration: underline;
}

.text-brick-ember {
  color: #c0392b;
}
</style>
