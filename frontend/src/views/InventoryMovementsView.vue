<template>
  <div class="flex h-screen bg-slate-100 overflow-hidden font-quicksand">
    <AppSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 overflow-y-auto">
        <div class="p-5 lg:p-6 max-w-screen-2xl mx-auto w-full space-y-5">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item">
                <router-link to="/dashboard" class="text-decoration-none text-secondary">
                  <i class="fa-solid fa-gauge-high me-1"></i>Dashboard
                </router-link>
              </li>
              <li class="breadcrumb-item">
                <router-link to="/inventario/stock" class="text-decoration-none text-secondary">
                  <i class="fa-solid fa-boxes-stacked me-1"></i>Inventario
                </router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Movimientos</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-right-left me-2 text-brick-ember"></i>Movimientos de Inventario
              </h1>
              <p class="text-secondary small mb-0">Controla entradas, salidas y transferencias de stock con trazabilidad completa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Movimiento
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando movimientos...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los movimientos. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="row g-3 align-items-end mb-3">
                <div class="col-12 col-md-6 col-lg-3">
                  <CustomSelect
                    id="inventory-movements-filter-type"
                    v-model="filterDraft.movement_type_id"
                    label="Tipo"
                    placeholder="Todos"
                    :options="movementTypeFilterOptions"
                    :searchable="true"
                  />
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <CustomSelect
                    id="inventory-movements-filter-warehouse"
                    v-model="filterDraft.warehouse_id"
                    label="Bodega"
                    placeholder="Todas"
                    :options="warehouseFilterOptions"
                    :searchable="true"
                  />
                </div>
                <div class="col-12 col-md-6 col-lg-2">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Fecha Desde</label>
                  <input
                    v-model="filterDraft.date_from"
                    type="date"
                    class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                  />
                </div>
                <div class="col-12 col-md-6 col-lg-2">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Fecha Hasta</label>
                  <input
                    v-model="filterDraft.date_to"
                    type="date"
                    class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                  />
                </div>
                <div class="col-12 col-lg-2">
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-outline-primary w-100" @click="applyAdvancedFilters">
                      <i class="fa-solid fa-filter me-1"></i>Aplicar
                    </button>
                    <button type="button" class="btn btn-outline-secondary" @click="resetAdvancedFilters" title="Limpiar filtros">
                      <i class="fa-solid fa-rotate-left"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="activeFiltersCount > 0" class="alert alert-info py-2 rounded-3 mb-3 d-flex align-items-center gap-2" role="alert">
                <i class="fa-solid fa-sliders"></i>
                <span class="small">Filtros backend activos: {{ activeFiltersCount }}</span>
              </div>

              <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span class="badge bg-secondary-subtle text-secondary">Vista compartible</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="copyShareLink">
                  <i class="fa-solid fa-link me-1"></i>Compartir filtros
                </button>
                <span class="small text-secondary text-truncate flex-grow-1" :title="shareableUrl">{{ shareableUrl }}</span>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 420px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por tipo, producto, bodega, origen o motivo"
                    aria-label="Buscar movimientos"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <label for="inventoryMovementsPageSize" class="small text-secondary mb-0">Mostrar</label>
                  <select id="inventoryMovementsPageSize" v-model.number="pageSize" class="form-select form-select-sm" style="width: 88px;">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                  </select>
                  <span class="small text-secondary">registros</span>
                </div>
              </div>

              <div class="table-responsive">
                <table class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('movement_date')">Fecha <i :class="sortIcon('movement_date')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('movement_type_name')">Tipo <i :class="sortIcon('movement_type_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('warehouse_name')">Bodega <i :class="sortIcon('warehouse_name')"></i></button></th>
                      <th>Bodega Relacionada</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('product_name')">Producto / Variante <i :class="sortIcon('product_name')"></i></button></th>
                      <th class="text-end"><button type="button" class="table-sort-btn" @click="toggleSort('quantity')">Cantidad <i :class="sortIcon('quantity')"></i></button></th>
                      <th class="text-end"><button type="button" class="table-sort-btn" @click="toggleSort('unit_cost')">Costo Unit. <i :class="sortIcon('unit_cost')"></i></button></th>
                      <th>Origen</th>
                      <th>Motivo</th>
                      <th class="text-center">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in paginatedMovements" :key="item.id">
                      <td class="text-secondary small">{{ item.id }}</td>
                      <td class="small text-secondary">{{ formatDate(item.movement_date) }}</td>
                      <td>
                        <div class="d-flex flex-column gap-1">
                          <span class="badge rounded-pill" :class="directionBadgeClass(item.movement_direction)">
                            {{ directionLabel(item.movement_direction) }}
                          </span>
                          <small class="text-secondary">{{ item.movement_type_code ?? '—' }}</small>
                        </div>
                      </td>
                      <td class="small">
                        <span class="d-block">{{ item.warehouse_name ?? '—' }}</span>
                        <span class="text-secondary font-monospace">{{ item.warehouse_code ?? '' }}</span>
                      </td>
                      <td class="small">
                        <template v-if="item.related_warehouse_id">
                          <span class="d-block">{{ item.related_warehouse_name ?? '—' }}</span>
                          <span class="text-secondary font-monospace">{{ item.related_warehouse_code ?? '' }}</span>
                        </template>
                        <span v-else class="text-secondary">—</span>
                      </td>
                      <td class="small">
                        <span class="d-block fw-semibold">{{ item.product_name ?? '—' }}</span>
                        <span class="text-secondary">{{ item.variant_sku ?? item.variant_code ?? '—' }} · {{ item.variant_name ?? '—' }}</span>
                      </td>
                      <td class="text-end fw-semibold">{{ formatQty(item.quantity) }}</td>
                      <td class="text-end">{{ item.unit_cost != null ? formatCurrency(item.unit_cost) : '—' }}</td>
                      <td class="small">
                        <span v-if="item.source_document_type" class="badge bg-light text-dark border">
                          {{ item.source_document_type }} #{{ item.source_document_id ?? '—' }}
                        </span>
                        <span v-else class="text-secondary">Manual</span>
                      </td>
                      <td class="small text-truncate" style="max-width:180px;" :title="item.reason ?? ''">{{ item.reason ?? '—' }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button class="btn btn-sm btn-outline-info" @click="openViewModal(item)" title="Ver detalle" aria-label="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" @click="openEditModal(item)" title="Editar movimiento" aria-label="Editar movimiento">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(item)" title="Eliminar movimiento" aria-label="Eliminar movimiento">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedMovements.length === 0">
                      <td colspan="11" class="text-center text-secondary py-4">No se encontraron movimientos para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredMovements.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginacion movimientos">
                  <button type="button" class="btn btn-outline-secondary" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <button type="button" class="btn btn-outline-secondary" disabled>
                    Pagina {{ currentPage }} / {{ totalPages }}
                  </button>
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

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="inventoryMovementFormModal" tabindex="-1" aria-labelledby="inventoryMovementFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="inventoryMovementFormModalLabel">
            <i class="fa-solid fa-right-left me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Movimiento' : 'Nuevo Movimiento' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3">
          <div class="row g-3">
            <div class="col-md-6">
              <CustomSelect
                id="inventory-movement-type"
                v-model="form.movement_type_id"
                label="Tipo de Movimiento"
                placeholder="Seleccionar tipo"
                :options="movementTypeOptions"
                :searchable="true"
              />
            </div>
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Fecha del Movimiento <span class="text-danger">*</span></label>
              <input
                v-model="form.movement_date"
                type="datetime-local"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
              />
            </div>

            <div class="col-md-6">
              <CustomSelect
                id="inventory-movement-warehouse"
                v-model="form.warehouse_id"
                label="Bodega Origen"
                placeholder="Seleccionar bodega"
                :options="warehouseOptions"
                :searchable="true"
              />
            </div>
            <div class="col-md-6">
              <CustomSelect
                id="inventory-movement-related-warehouse"
                v-model="form.related_warehouse_id"
                label="Bodega Relacionada"
                :placeholder="isTransferType ? 'Seleccionar bodega destino' : 'No aplica para este tipo'"
                :options="relatedWarehouseOptions"
                :searchable="true"
                :disabled="!isTransferType"
              />
            </div>

            <div class="col-12">
              <CustomSelect
                id="inventory-movement-variant"
                v-model="form.product_variant_id"
                label="Variante de Producto"
                placeholder="Buscar por SKU o nombre"
                :options="variantOptions"
                :searchable="true"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Cantidad <span class="text-danger">*</span></label>
              <NumberStepper
                v-model="form.quantity"
                :min="0.0001"
                :step="0.0001"
                input-class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white number-stepper-input"
                placeholder="0.0000"
              />
            </div>
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Costo Unitario</label>
              <NumberStepper
                v-model="form.unit_cost"
                :min="0"
                :step="0.0001"
                input-class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white number-stepper-input"
                placeholder="Opcional"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Documento Origen (Tipo)</label>
              <input
                v-model="form.source_document_type"
                type="text"
                maxlength="40"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Ej: DOCUMENT, SALE, ADJUSTMENT"
              />
            </div>
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Documento Origen (ID)</label>
              <NumberStepper
                v-model="form.source_document_id"
                :min="1"
                :step="1"
                input-class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white number-stepper-input"
                placeholder="Opcional"
              />
            </div>

            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Motivo / Observacion</label>
              <textarea
                v-model="form.reason"
                rows="3"
                maxlength="255"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Describe el motivo del movimiento"
              ></textarea>
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

  <div class="modal fade" id="inventoryMovementViewModal" tabindex="-1" aria-labelledby="inventoryMovementViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedMovement">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="inventoryMovementViewModalLabel">
            <i class="fa-solid fa-right-left me-2 text-info"></i>Detalle de Movimiento
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div
              class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              :class="selectedMovement.is_transfer ? 'bg-primary' : (selectedMovement.movement_direction === 'OUT' ? 'bg-danger' : 'bg-success')"
              style="width:52px;height:52px;font-size:1.1rem;"
            >
              <i class="fa-solid" :class="selectedMovement.is_transfer ? 'fa-arrow-right-arrow-left' : (selectedMovement.movement_direction === 'OUT' ? 'fa-arrow-up' : 'fa-arrow-down')"></i>
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedMovement.movement_type_name ?? '—' }}</p>
              <p class="text-secondary small mb-0">{{ selectedMovement.movement_type_code ?? '—' }}</p>
              <span class="badge rounded-pill mt-1" :class="directionBadgeClass(selectedMovement.movement_direction)">
                {{ directionLabel(selectedMovement.movement_direction) }}
              </span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Fecha" :value="formatDate(selectedMovement.movement_date)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-weight-hanging" label="Cantidad" :value="formatQty(selectedMovement.quantity)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-warehouse" label="Bodega" :value="selectedMovement.warehouse_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-warehouse" label="Bodega Relacionada" :value="selectedMovement.related_warehouse_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-box" label="Producto" :value="selectedMovement.product_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-tag" label="Variante" :value="selectedMovement.variant_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="SKU Variante" :value="selectedMovement.variant_sku ?? selectedMovement.variant_code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-dollar-sign" label="Costo Unitario" :value="selectedMovement.unit_cost != null ? formatCurrency(selectedMovement.unit_cost) : null" /></div>
            <div class="col-md-6"><DetailRow icon="fa-file-lines" label="Documento Origen" :value="formatSourceDocument(selectedMovement)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar-plus" label="Registrado" :value="formatDate(selectedMovement.created_at)" /></div>
            <div class="col-12"><DetailRow icon="fa-comment-dots" label="Motivo" :value="selectedMovement.reason" /></div>
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
import { useRoute, useRouter } from "vue-router";

import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import CustomSelect from "../components/CustomSelect.vue";
import NumberStepper from "../components/NumberStepper.vue";
import type { SelectOption } from "../components/CustomSelect.vue";
import { useInventoryMovements, useCreateInventoryMovement, useUpdateInventoryMovement, useDeleteInventoryMovement } from "../composables/useInventoryMovements";
import { useInventoryMovementTypes } from "../composables/useInventoryMovementTypes";
import { useWarehouses } from "../composables/useWarehouses";
import { useProductVariants } from "../composables/useProductVariants";
import type { InventoryMovementDirection, InventoryMovementItem } from "../services/inventoryMovement.service";
import { formatDate } from "../utils/datetime";
import {
  buildInventoryMovementsRouteQuery,
  normalizeInventoryMovementsQuery,
  type SortDirection,
  type SortKey
} from "./inventoryMovementsQueryState";

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

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);
const route = useRoute();
const router = useRouter();

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;
let isSyncingFromRoute = false;

const { data: movementTypesData } = useInventoryMovementTypes();
const { data: warehousesData } = useWarehouses();
const { data: variantsData } = useProductVariants();
const { mutateAsync: createInventoryMovement } = useCreateInventoryMovement();
const { mutateAsync: updateInventoryMovement } = useUpdateInventoryMovement();
const { mutateAsync: deleteInventoryMovement } = useDeleteInventoryMovement();

const emptyFilters = () => ({
  movement_type_id: "",
  warehouse_id: "",
  date_from: "",
  date_to: ""
});

const filterDraft = ref(emptyFilters());
const appliedFilters = ref(emptyFilters());

function toRouteFilterQuery(filters: ReturnType<typeof emptyFilters>) {
  return buildInventoryMovementsRouteQuery({
    filters,
    searchQuery: searchQuery.value,
    page: currentPage.value,
    pageSize: pageSize.value,
    sortKey: sortKey.value,
    sortDirection: sortDirection.value
  });
}

function syncFiltersFromRouteQuery() {
  isSyncingFromRoute = true;

  const nextState = normalizeInventoryMovementsQuery(route.query);
  filterDraft.value = { ...nextState.filters };
  appliedFilters.value = { ...nextState.filters };
  searchQuery.value = nextState.searchQuery;
  pageSize.value = nextState.pageSize;
  currentPage.value = nextState.page;
  sortKey.value = nextState.sortKey;
  sortDirection.value = nextState.sortDirection;

  isSyncingFromRoute = false;
}

function syncRouteQueryFromState() {
  if (isSyncingFromRoute) return;
  void router.replace({ query: toRouteFilterQuery(appliedFilters.value) });
}

const shareableUrl = computed(() => {
  const href = router.resolve({ path: route.path, query: toRouteFilterQuery(appliedFilters.value) }).href;
  if (typeof window === "undefined") return href;
  return `${window.location.origin}${href}`;
});

const queryParams = computed(() => {
  const dateFromIso = appliedFilters.value.date_from
    ? `${appliedFilters.value.date_from}T00:00:00.000Z`
    : undefined;
  const dateToIso = appliedFilters.value.date_to
    ? `${appliedFilters.value.date_to}T23:59:59.999Z`
    : undefined;

  return {
    movement_type_id: appliedFilters.value.movement_type_id ? Number(appliedFilters.value.movement_type_id) : undefined,
    warehouse_id: appliedFilters.value.warehouse_id ? Number(appliedFilters.value.warehouse_id) : undefined,
    date_from: dateFromIso,
    date_to: dateToIso
  };
});

const { data, isLoading, isError } = useInventoryMovements(queryParams);

const movements = computed(() => data.value ?? []);
const selectedMovement = ref<InventoryMovementItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref(10);
const currentPage = ref(1);

const sortKey = ref<SortKey>("movement_date");
const sortDirection = ref<SortDirection>("desc");

const emptyForm = () => ({
  movement_type_id: "",
  warehouse_id: "",
  related_warehouse_id: "",
  product_variant_id: "",
  quantity: 1,
  unit_cost: "" as number | string,
  movement_date: toInputDateTime(new Date().toISOString()),
  reason: "",
  source_document_type: "",
  source_document_id: "" as number | string
});

const form = ref(emptyForm());

const movementTypeOptions = computed<SelectOption[]>(() => {
  return (movementTypesData.value ?? []).map((row) => ({
    value: row.id,
    label: `${row.code} - ${row.name} (${directionLabel(row.direction)})`
  }));
});

const movementTypeFilterOptions = computed<SelectOption[]>(() => {
  return [{ value: "", label: "Todos" }, ...movementTypeOptions.value];
});

const warehouseOptions = computed<SelectOption[]>(() => {
  return (warehousesData.value ?? [])
    .filter((w) => w.is_active)
    .map((w) => ({ value: w.id, label: `${w.code} - ${w.name}` }));
});

const warehouseFilterOptions = computed<SelectOption[]>(() => {
  return [{ value: "", label: "Todas" }, ...warehouseOptions.value];
});

const relatedWarehouseOptions = computed<SelectOption[]>(() => {
  const selectedWarehouseId = String(form.value.warehouse_id || "");
  return warehouseOptions.value.filter((row) => String(row.value) !== selectedWarehouseId);
});

const variantOptions = computed<SelectOption[]>(() => {
  return (variantsData.value ?? [])
    .filter((v) => v.is_active)
    .map((v) => ({ value: v.id, label: `${v.sku ?? v.variant_code} - ${v.product_name ? `${v.product_name} / ` : ""}${v.name}` }));
});

const selectedMovementTypeDirection = computed<InventoryMovementDirection | null>(() => {
  if (!form.value.movement_type_id) return null;
  const selected = (movementTypesData.value ?? []).find((row) => row.id === String(form.value.movement_type_id));
  return selected?.direction ?? null;
});

const isTransferType = computed(() => selectedMovementTypeDirection.value === "TRANSFER");
const activeFiltersCount = computed(() => {
  return Number(Boolean(appliedFilters.value.movement_type_id))
    + Number(Boolean(appliedFilters.value.warehouse_id))
    + Number(Boolean(appliedFilters.value.date_from))
    + Number(Boolean(appliedFilters.value.date_to));
});

watch(isTransferType, (transfer) => {
  if (!transfer) {
    form.value.related_warehouse_id = "";
  }
});

const filteredMovements = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return movements.value;

  return movements.value.filter((item) => {
    const searchable = [
      String(item.id),
      item.movement_type_code ?? "",
      item.movement_type_name ?? "",
      directionLabel(item.movement_direction),
      item.warehouse_name ?? "",
      item.related_warehouse_name ?? "",
      item.product_name ?? "",
      item.variant_name ?? "",
      item.variant_sku ?? item.variant_code ?? "",
      item.source_document_type ?? "",
      item.reason ?? ""
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (item: InventoryMovementItem, key: SortKey): string | number => {
  switch (key) {
    case "id":
      return Number(item.id);
    case "movement_date":
      return item.movement_date ? new Date(item.movement_date).getTime() : 0;
    case "quantity":
      return item.quantity;
    case "unit_cost":
      return item.unit_cost ?? -1;
    default:
      return ((item as unknown as Record<string, unknown>)[key] ?? "").toString().toLowerCase();
  }
};

const sortedMovements = computed(() => {
  const list = [...filteredMovements.value];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  list.sort((leftRow, rightRow) => {
    const left = getComparableValue(leftRow, sortKey.value);
    const right = getComparableValue(rightRow, sortKey.value);

    if (left === right) return 0;
    if (typeof left === "number" && typeof right === "number") return (left - right) * direction;
    return String(left).localeCompare(String(right), "es") * direction;
  });

  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedMovements.value.length / pageSize.value)));

const paginatedMovements = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedMovements.value.slice(start, start + pageSize.value);
});

const paginationStart = computed(() => (filteredMovements.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1));
const paginationEnd = computed(() => (filteredMovements.value.length === 0 ? 0 : Math.min(currentPage.value * pageSize.value, filteredMovements.value.length)));

function formatQty(value: number | null | undefined): string {
  if (value == null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/\.?0+$/, "");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  }).format(value);
}

function formatSourceDocument(item: InventoryMovementItem): string {
  if (!item.source_document_type) return "Manual";
  return `${item.source_document_type} #${item.source_document_id ?? "—"}`;
}

function toInputDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function directionLabel(direction: InventoryMovementDirection | null): string {
  switch (direction) {
    case "IN":
      return "Entrada";
    case "OUT":
      return "Salida";
    case "TRANSFER":
      return "Transferencia";
    default:
      return "Sin direccion";
  }
}

function directionBadgeClass(direction: InventoryMovementDirection | null): string {
  switch (direction) {
    case "IN":
      return "text-bg-success";
    case "OUT":
      return "text-bg-danger";
    case "TRANSFER":
      return "text-bg-primary";
    default:
      return "text-bg-secondary";
  }
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

function applyAdvancedFilters() {
  if (filterDraft.value.date_from && filterDraft.value.date_to && filterDraft.value.date_from > filterDraft.value.date_to) {
    void showValidationError("La fecha desde no puede ser mayor a la fecha hasta.");
    return;
  }

  appliedFilters.value = { ...filterDraft.value };
  currentPage.value = 1;
  syncRouteQueryFromState();
}

function resetAdvancedFilters() {
  filterDraft.value = emptyFilters();
  appliedFilters.value = emptyFilters();
  currentPage.value = 1;
  syncRouteQueryFromState();
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(shareableUrl.value);
    await Swal.fire({
      icon: "success",
      title: "Enlace copiado",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true
    });
  } catch {
    await Swal.fire({ icon: "error", title: "Error", text: "No fue posible copiar el enlace." });
  }
}

watch([searchQuery, pageSize], () => {
  if (isSyncingFromRoute) return;
  currentPage.value = 1;
  syncRouteQueryFromState();
});

watch(totalPages, (maxPages) => {
  if (currentPage.value > maxPages) {
    currentPage.value = maxPages;
  }
});

watch(currentPage, () => {
  if (isSyncingFromRoute) return;
  syncRouteQueryFromState();
});

watch([sortKey, sortDirection], () => {
  if (isSyncingFromRoute) return;
  syncRouteQueryFromState();
});

onMounted(() => {
  syncFiltersFromRouteQuery();

  if (formModalRef.value) formModalInstance = new Modal(formModalRef.value);
  if (viewModalRef.value) viewModalInstance = new Modal(viewModalRef.value);
});

watch(
  () => route.query,
  () => {
    syncFiltersFromRouteQuery();
  }
);

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

async function openCreateModal() {
  if (!isComponentActive) return;

  isEditMode.value = false;
  editingId.value = null;
  selectedMovement.value = null;
  form.value = emptyForm();

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

async function openEditModal(item: InventoryMovementItem) {
  if (!isComponentActive) return;

  isEditMode.value = true;
  editingId.value = item.id;
  selectedMovement.value = item;
  form.value = {
    movement_type_id: item.movement_type_id,
    warehouse_id: item.warehouse_id,
    related_warehouse_id: item.related_warehouse_id ?? "",
    product_variant_id: item.product_variant_id,
    quantity: item.quantity,
    unit_cost: item.unit_cost ?? "",
    movement_date: toInputDateTime(item.movement_date),
    reason: item.reason ?? "",
    source_document_type: item.source_document_type ?? "",
    source_document_id: item.source_document_id ? Number(item.source_document_id) : ""
  };

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

function openViewModal(item: InventoryMovementItem) {
  if (!isComponentActive) return;
  selectedMovement.value = item;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedMovement.value) return;
  viewModalInstance?.hide();

  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedMovement.value) return;
    void openEditModal(selectedMovement.value);
  }, 350);
}

function showValidationError(message: string) {
  return Swal.fire({ icon: "warning", title: "Validacion", text: message, confirmButtonColor: "#dc3545" });
}

async function submitForm() {
  const f = form.value;

  if (!f.movement_type_id) return showValidationError("El tipo de movimiento es obligatorio.");
  if (!f.warehouse_id) return showValidationError("La bodega es obligatoria.");
  if (!f.product_variant_id) return showValidationError("La variante de producto es obligatoria.");

  if (f.quantity === null || f.quantity === undefined || Number(f.quantity) <= 0) {
    return showValidationError("La cantidad debe ser mayor a 0.");
  }

  if (isTransferType.value && !f.related_warehouse_id) {
    return showValidationError("Debe seleccionar bodega relacionada para transferencias.");
  }

  const sourceType = f.source_document_type.trim() || null;
  const sourceId = f.source_document_id !== "" && f.source_document_id !== null && f.source_document_id !== undefined
    ? Number(f.source_document_id)
    : null;

  if (sourceType && !sourceId) {
    return showValidationError("Debe indicar documento origen ID cuando informa tipo.");
  }

  if (!sourceType && sourceId) {
    return showValidationError("Debe indicar documento origen tipo cuando informa ID.");
  }

  isSaving.value = true;

  try {
    const payload = {
      movement_type_id: Number(f.movement_type_id),
      warehouse_id: Number(f.warehouse_id),
      related_warehouse_id: isTransferType.value && f.related_warehouse_id ? Number(f.related_warehouse_id) : null,
      product_variant_id: Number(f.product_variant_id),
      quantity: Number(f.quantity),
      unit_cost: f.unit_cost !== "" && f.unit_cost !== null && f.unit_cost !== undefined ? Number(f.unit_cost) : null,
      movement_date: toIsoDateTime(f.movement_date),
      reason: f.reason.trim() || null,
      source_document_type: sourceType,
      source_document_id: sourceId
    };

    if (isEditMode.value && editingId.value) {
      await updateInventoryMovement({
        id: editingId.value,
        payload
      });

      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Movimiento actualizado",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    } else {
      await createInventoryMovement({
        movement_type_id: payload.movement_type_id,
        warehouse_id: payload.warehouse_id,
        related_warehouse_id: payload.related_warehouse_id,
        product_variant_id: payload.product_variant_id,
        quantity: payload.quantity,
        unit_cost: payload.unit_cost,
        movement_date: payload.movement_date,
        reason: payload.reason,
        source_document_type: payload.source_document_type,
        source_document_id: payload.source_document_id
      });

      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Movimiento creado",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    }
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ocurrio un error al guardar el movimiento.";
    await Swal.fire({ icon: "error", title: "Error", text: message });
  } finally {
    isSaving.value = false;
  }
}

async function confirmDelete(item: InventoryMovementItem) {
  const result = await Swal.fire({
    title: "¿Eliminar movimiento?",
    html: `<p class="mb-0">Se eliminara el movimiento <strong>#${item.id}</strong> de <strong>${item.product_name ?? item.variant_name ?? "producto"}</strong>.</p><p class="text-danger small mt-2 mb-0">Esta accion es irreversible.</p>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Si, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    await deleteInventoryMovement(item.id);
    await Swal.fire({
      icon: "success",
      title: "Movimiento eliminado",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar el movimiento.";
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
