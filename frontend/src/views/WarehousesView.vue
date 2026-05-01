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
              <li class="breadcrumb-item active" aria-current="page">Bodegas</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-warehouse me-2 text-brick-ember"></i>Gestión de Bodegas
              </h1>
              <p class="text-secondary small mb-0">Administra las bodegas de la empresa activa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nueva Bodega
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando bodegas...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las bodegas. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 460px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, nombre, comuna, ciudad o región"
                    aria-label="Buscar bodegas"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="warehouses-page-size"
                      v-model="pageSize"
                      placeholder="Cantidad"
                      :options="pageSizeOptions"
                      :searchable="false"
                    />
                  </div>
                  <span class="small text-secondary">registros</span>
                </div>
              </div>

              <div class="table-responsive">
                <table id="warehousesTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Nombre <i :class="sortIcon('name')"></i></button></th>
                      <th>Ubicación</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_main')">Principal <i :class="sortIcon('is_main')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_active')">Estado <i :class="sortIcon('is_active')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('dependencies_count')">Dependencias <i :class="sortIcon('dependencies_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="warehouse in paginatedWarehouses" :key="warehouse.id">
                      <td class="text-secondary small">{{ warehouse.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ warehouse.code }}</span></td>
                      <td class="fw-semibold">{{ warehouse.name }}</td>
                      <td class="small">
                        <span class="d-block">{{ warehouse.commune_name ?? '—' }}</span>
                        <span class="text-secondary">{{ warehouse.city_name ?? '—' }} / {{ warehouse.region_name ?? '—' }}</span>
                      </td>
                      <td>
                        <span class="badge rounded-pill" :class="warehouse.is_main ? 'text-bg-primary' : 'text-bg-light text-dark border'">
                          {{ warehouse.is_main ? 'Sí' : 'No' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge rounded-pill" :class="warehouse.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                          {{ warehouse.is_active ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge rounded-pill" :class="warehouse.dependencies_count > 0 ? 'text-bg-warning' : 'text-bg-light text-dark border'">
                          {{ warehouse.dependencies_count }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(warehouse.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="d-flex gap-1 justify-content-center">
                          <button class="btn btn-sm btn-outline-info rounded-3 px-2" @click="openViewModal(warehouse)" title="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning rounded-3 px-2" @click="openEditModal(warehouse)" title="Editar bodega">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger rounded-3 px-2"
                            @click="confirmDelete(warehouse)"
                            :disabled="warehouse.dependencies_count > 0"
                            :title="warehouse.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar bodega'"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedWarehouses.length === 0">
                      <td colspan="9" class="text-center text-secondary py-4">No se encontraron bodegas para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredWarehouses.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación bodegas">
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

  <div class="modal fade" id="warehouseFormModal" tabindex="-1" aria-labelledby="warehouseFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="warehouseFormModalLabel">
            <i class="fa-solid fa-warehouse me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Bodega' : 'Nueva Bodega' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3">
          <div class="row g-3">
            <div class="col-md-5">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Código <span class="text-danger">*</span></label>
              <input
                v-model="form.code"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="BOD-001"
                :disabled="isEditMode"
                maxlength="40"
              />
            </div>

            <div class="col-md-7">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre <span class="text-danger">*</span></label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Bodega Central"
                maxlength="140"
              />
            </div>

            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Dirección</label>
              <input
                v-model="form.address_line"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Av. Principal 123"
                maxlength="220"
              />
            </div>

            <div class="col-12">
              <CustomSelect
                id="warehouse-commune"
                v-model="form.commune_id"
                label="Comuna"
                placeholder="Seleccionar comuna"
                :options="communeOptions"
                :searchable="true"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Principal</label>
              <div class="form-check form-switch">
                <input
                  v-model="form.is_main"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchWarehouseMain"
                  style="width:2.5em;height:1.3em;"
                />
                <label class="form-check-label ms-2 fw-semibold" for="switchWarehouseMain">
                  <span :class="form.is_main ? 'text-primary' : 'text-secondary'">
                    {{ form.is_main ? 'Sí, principal' : 'No principal' }}
                  </span>
                </label>
              </div>
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
              <div class="form-check form-switch">
                <input
                  v-model="form.is_active"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchWarehouseActive"
                  style="width:2.5em;height:1.3em;"
                />
                <label class="form-check-label ms-2 fw-semibold" for="switchWarehouseActive">
                  <span :class="form.is_active ? 'text-success' : 'text-secondary'">
                    {{ form.is_active ? 'Activa' : 'Inactiva' }}
                  </span>
                </label>
              </div>
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

  <div class="modal fade" id="warehouseViewModal" tabindex="-1" aria-labelledby="warehouseViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow" v-if="selectedWarehouse">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="warehouseViewModalLabel">
            <i class="fa-solid fa-warehouse me-2 text-info"></i>Detalle de Bodega
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedWarehouse.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedWarehouse.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedWarehouse.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedWarehouse.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedWarehouse.is_active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedWarehouse.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-location-dot" label="Dirección" :value="selectedWarehouse.address_line" /></div>
            <div class="col-md-6"><DetailRow icon="fa-map-location-dot" label="Comuna" :value="selectedWarehouse.commune_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-city" label="Ciudad" :value="selectedWarehouse.city_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-map" label="Región" :value="selectedWarehouse.region_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-star" label="Principal" :value="selectedWarehouse.is_main ? 'Sí' : 'No'" /></div>
            <div class="col-md-6"><DetailRow icon="fa-link" label="Dependencias" :value="String(selectedWarehouse.dependencies_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedWarehouse.created_at)" /></div>
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
import { ref, computed, nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";

import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import CustomSelect from "../components/CustomSelect.vue";
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from "../composables/useWarehouses";
import { useCommunes } from "../composables/useCommunes";
import type { WarehouseItem } from "../services/warehouse.service";
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

const { data, isLoading, isError } = useWarehouses();
const { data: communesData } = useCommunes();
const { mutateAsync: createWarehouse } = useCreateWarehouse();
const { mutateAsync: updateWarehouse } = useUpdateWarehouse();
const { mutateAsync: deleteWarehouse } = useDeleteWarehouse();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const warehouses = computed(() => data.value ?? []);
const selectedWarehouse = ref<WarehouseItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "name" | "is_main" | "is_active" | "dependencies_count" | "created_at">("name");
const sortDirection = ref<"asc" | "desc">("asc");

const emptyForm = () => ({
  code: "",
  name: "",
  address_line: "",
  commune_id: "",
  is_main: false,
  is_active: true
});

const form = ref(emptyForm());

const pageSizeOptions: SelectOption[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 }
];

const communeOptions = computed<SelectOption[]>(() => {
  const rows = communesData.value ?? [];
  return rows.map((c) => ({
    value: c.id,
    label: `${c.region_country_code ?? ""} - ${c.region_name ?? ""} / ${c.city_name ?? ""} / ${c.name}`
  }));
});

const filteredWarehouses = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return warehouses.value;

  return warehouses.value.filter((w) => {
    const searchable = [
      String(w.id),
      w.code,
      w.name,
      w.commune_name ?? "",
      w.city_name ?? "",
      w.region_name ?? "",
      w.address_line ?? "",
      w.is_main ? "principal" : "secundaria",
      w.is_active ? "activa" : "inactiva"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (w: WarehouseItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(w.id);
    case "created_at":
      return w.created_at ? new Date(w.created_at).getTime() : 0;
    case "is_main":
      return w.is_main ? 1 : 0;
    case "is_active":
      return w.is_active ? 1 : 0;
    case "dependencies_count":
      return w.dependencies_count;
    default:
      return (w[key] ?? "").toString().toLowerCase();
  }
};

const sortedWarehouses = computed(() => {
  const list = [...filteredWarehouses.value];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  list.sort((a, b) => {
    const left = getComparableValue(a, sortKey.value);
    const right = getComparableValue(b, sortKey.value);

    if (left === right) return 0;

    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * direction;
    }

    return String(left).localeCompare(String(right), "es") * direction;
  });

  return list;
});

const pageSizeNumber = computed(() => Number(pageSize.value) || 10);
const totalPages = computed(() => Math.max(1, Math.ceil(sortedWarehouses.value.length / pageSizeNumber.value)));
const paginatedWarehouses = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedWarehouses.value.slice(start, start + pageSizeNumber.value);
});

const paginationStart = computed(() => filteredWarehouses.value.length === 0 ? 0 : (currentPage.value - 1) * pageSizeNumber.value + 1);
const paginationEnd = computed(() => filteredWarehouses.value.length === 0 ? 0 : Math.min(currentPage.value * pageSizeNumber.value, filteredWarehouses.value.length));

const toggleSort = (key: typeof sortKey.value) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = "asc";
  }
};

const sortIcon = (key: typeof sortKey.value) => {
  if (sortKey.value !== key) return "fa-solid fa-sort text-secondary opacity-75 ms-1";
  return sortDirection.value === "asc" ? "fa-solid fa-sort-up ms-1" : "fa-solid fa-sort-down ms-1";
};

const goToPage = (page: number) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
};

watch([searchQuery, pageSize], () => { currentPage.value = 1; });
watch(totalPages, (maxPages) => {
  if (currentPage.value > maxPages) currentPage.value = maxPages;
});

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

async function openCreateModal() {
  if (!isComponentActive) return;
  isEditMode.value = false;
  editingId.value = null;
  form.value = emptyForm();

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

async function openEditModal(warehouse: WarehouseItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = warehouse.id;
  form.value = {
    code: warehouse.code,
    name: warehouse.name,
    address_line: warehouse.address_line ?? "",
    commune_id: warehouse.commune_id ?? "",
    is_main: warehouse.is_main,
    is_active: warehouse.is_active
  };

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

function openViewModal(warehouse: WarehouseItem) {
  if (!isComponentActive) return;
  selectedWarehouse.value = warehouse;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedWarehouse.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedWarehouse.value) return;
    void openEditModal(selectedWarehouse.value);
  }, 350);
}

async function submitForm() {
  const f = form.value;
  if (!f.name.trim()) return showValidationError("El nombre de la bodega es obligatorio.");
  if (!isEditMode.value && !f.code.trim()) return showValidationError("El código es obligatorio.");

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateWarehouse({
        id: editingId.value,
        payload: {
          name: f.name,
          address_line: f.address_line || undefined,
          commune_id: f.commune_id ? Number(f.commune_id) : undefined,
          is_main: f.is_main,
          is_active: f.is_active
        }
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Bodega actualizada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } else {
      await createWarehouse({
        code: f.code,
        name: f.name,
        address_line: f.address_line || undefined,
        commune_id: f.commune_id ? Number(f.commune_id) : undefined,
        is_main: f.is_main,
        is_active: f.is_active
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Bodega creada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    }
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ocurrió un error inesperado.";
    await Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonText: "Entendido", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
  } finally {
    isSaving.value = false;
  }
}

function showValidationError(msg: string) {
  Swal.fire({ icon: "warning", title: "Validación", text: msg, confirmButtonText: "Entendido", customClass: { confirmButton: "btn btn-warning rounded-3 px-4" } });
}

async function confirmDelete(warehouse: WarehouseItem) {
  if (warehouse.dependencies_count > 0) {
    await Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      text: "La bodega tiene movimientos o documentos asociados.",
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar bodega?",
    html: `<p class="mb-0">Estás por eliminar <strong>${warehouse.name}</strong>.<br>Esta acción desactivará el registro.</p>`,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-trash me-2"></i>Sí, eliminar',
    cancelButtonText: "Cancelar",
    customClass: {
      confirmButton: "btn btn-danger rounded-3 px-4",
      cancelButton: "btn btn-light rounded-3 px-4 ms-2"
    },
    buttonsStyling: false
  });

  if (!result.isConfirmed) return;

  try {
    await deleteWarehouse(warehouse.id);
    await Swal.fire({ icon: "success", title: "Bodega eliminada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar la bodega.";
    await Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonText: "Cerrar", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
  }
}
</script>

<style scoped>
.text-brick-ember { color: #d44c2b; }

.table-sort-btn {
  border: 0;
  background: transparent;
  color: inherit;
  font-weight: 600;
  padding: 0;
}
</style>
