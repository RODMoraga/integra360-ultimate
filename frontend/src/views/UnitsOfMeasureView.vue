<template>
  <div class="flex h-screen bg-slate-100 overflow-hidden font-quicksand">
    <!-- Sidebar -->
    <AppSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Navbar -->
      <DashNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />

      <!-- Content -->
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
                <router-link to="/inventario" class="text-decoration-none text-secondary">Inventario</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Unidades de Medida</li>
            </ol>
          </nav>

          <!-- Page header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-ruler-combined me-2 text-brick-ember"></i>Gestión de Unidades de Medida
              </h1>
              <p class="text-secondary small mb-0">Administra las unidades de medida utilizadas en los productos.</p>
            </div>
            <button
              class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3"
              @click="openCreateModal"
            >
              <i class="fa-solid fa-plus"></i>
              Nueva Unidad
            </button>
          </div>

          <!-- Table card -->
          <div class="bg-white rounded-4 shadow-sm p-4">
            <!-- Loader overlay -->
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando unidades de medida...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las unidades de medida. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 420px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, nombre, símbolo o tipo"
                    aria-label="Buscar unidades de medida"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <label for="uomPageSize" class="small text-secondary mb-0">Mostrar</label>
                  <select id="uomPageSize" v-model.number="pageSize" class="form-select form-select-sm" style="width: 88px;">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                  </select>
                  <span class="small text-secondary">registros</span>
                </div>
              </div>

              <div class="table-responsive">
                <table
                  id="uomTable"
                  class="table table-hover align-middle table-striped w-100"
                >
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Nombre <i :class="sortIcon('name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('symbol')">Símbolo <i :class="sortIcon('symbol')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('unit_type')">Tipo <i :class="sortIcon('unit_type')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_base_unit')">Unidad Base <i :class="sortIcon('is_base_unit')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="unit in paginatedUnits" :key="unit.id">
                      <td class="text-secondary small">{{ unit.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ unit.code }}</span></td>
                      <td class="fw-semibold">{{ unit.name }}</td>
                      <td><span class="badge bg-light text-dark border font-monospace">{{ unit.symbol }}</span></td>
                      <td>
                        <span class="badge rounded-pill bg-primary-subtle text-primary">{{ unit.unit_type }}</span>
                      </td>
                      <td>
                        <span
                          class="badge rounded-pill"
                          :class="unit.is_base_unit ? 'text-bg-success' : 'text-bg-light text-secondary border'"
                        >
                          <i class="fa-solid fa-circle me-1" style="font-size:.5rem;vertical-align:middle;"></i>
                          {{ unit.is_base_unit ? 'Sí' : 'No' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(unit.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="d-flex gap-1 justify-content-center">
                          <button
                            class="btn btn-sm btn-outline-info rounded-3 px-2"
                            @click="openViewModal(unit)"
                            title="Ver detalle"
                          >
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-warning rounded-3 px-2"
                            @click="openEditModal(unit)"
                            title="Editar unidad"
                          >
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger rounded-3 px-2"
                            @click="confirmDelete(unit)"
                            title="Eliminar unidad"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedUnits.length === 0">
                      <td colspan="8" class="text-center text-secondary py-4">No se encontraron unidades de medida para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredUnits.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación unidades">
                  <button type="button" class="btn btn-outline-secondary" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <button type="button" class="btn btn-outline-secondary" disabled>
                    Página {{ currentPage }} / {{ totalPages }}
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

  <!-- ══════════════════════ CREATE / EDIT MODAL ══════════════════════ -->
  <div
    class="modal fade"
    id="uomFormModal"
    tabindex="-1"
    aria-labelledby="uomFormModalLabel"
    aria-hidden="true"
    ref="formModalRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="uomFormModalLabel">
            <i class="fa-solid fa-ruler-combined me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 uom-form-modal-body">
          <!-- Nav Tabs -->
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 uom-form-tabs" id="uomFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-uom-general" data-bs-toggle="tab" data-bs-target="#panel-uom-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-uom-config" data-bs-toggle="tab" data-bs-target="#panel-uom-config" type="button" role="tab">
                <i class="fa-solid fa-sliders me-1"></i>Configuración
              </button>
            </li>
          </ul>

          <div class="tab-content uom-form-tab-content">
            <!-- ── General ── -->
            <div class="tab-pane fade show active" id="panel-uom-general" role="tabpanel">
              <div class="row g-3 uom-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Código <span class="text-danger">*</span></label>
                  <input
                    v-model="form.code"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="Ej: KG, MTR, LT"
                    :disabled="isEditMode"
                    maxlength="20"
                  />
                </div>
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Símbolo <span class="text-danger">*</span></label>
                  <input
                    v-model="form.symbol"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="Ej: kg, m, L"
                    maxlength="20"
                  />
                </div>
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre <span class="text-danger">*</span></label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="Ej: Kilogramo, Metro, Litro"
                    maxlength="80"
                  />
                </div>
                <div class="col-12">
                  <CustomSelect
                    id="uom-unit-type"
                    v-model="form.unit_type"
                    label="Tipo de Unidad *"
                    placeholder="Seleccionar tipo"
                    :options="unitTypeOptions"
                    :searchable="true"
                  />
                </div>
              </div>
            </div>

            <!-- ── Configuración ── -->
            <div class="tab-pane fade" id="panel-uom-config" role="tabpanel">
              <div class="row g-3 uom-form-grid">
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Unidad Base</label>
                  <div class="form-check form-switch">
                    <input
                      v-model="form.is_base_unit"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="switchIsBaseUnit"
                      style="width:2.5em;height:1.3em;"
                    />
                    <label class="form-check-label ms-2 fw-semibold" for="switchIsBaseUnit">
                      <span :class="form.is_base_unit ? 'text-success' : 'text-secondary'">
                        {{ form.is_base_unit ? 'Es unidad base del tipo' : 'No es unidad base' }}
                      </span>
                    </label>
                  </div>
                  <p class="text-secondary small mt-1">
                    Marcar como unidad base indica que es la referencia principal para conversiones dentro de su tipo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-light rounded-3" data-bs-dismiss="modal">Cancelar</button>
          <button
            type="button"
            class="btn btn-primary rounded-3 px-4"
            @click="submitForm"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="fa-solid fa-floppy-disk me-2"></i>
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════ VIEW MODAL ══════════════════════ -->
  <div
    class="modal fade"
    id="uomViewModal"
    tabindex="-1"
    aria-labelledby="uomViewModalLabel"
    aria-hidden="true"
    ref="viewModalRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedUnit">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="uomViewModalLabel">
            <i class="fa-solid fa-ruler-combined me-2 text-info"></i>Detalle de Unidad de Medida
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedUnit.symbol.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedUnit.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedUnit.code }} · {{ selectedUnit.unit_type }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedUnit.is_base_unit ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedUnit.is_base_unit ? 'Unidad Base' : 'No es base' }}
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedUnit.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-superscript" label="Símbolo" :value="selectedUnit.symbol" /></div>
            <div class="col-md-6"><DetailRow icon="fa-tag" label="Nombre" :value="selectedUnit.name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-layer-group" label="Tipo de Unidad" :value="selectedUnit.unit_type" /></div>
            <div class="col-md-6"><DetailRow icon="fa-star" label="Unidad Base" :value="selectedUnit.is_base_unit ? 'Sí' : 'No'" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedUnit.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-clock-rotate-left" label="Actualizado" :value="formatDate(selectedUnit.updated_at)" /></div>
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
import {
  useUnitsOfMeasure,
  useCreateUnitOfMeasure,
  useUpdateUnitOfMeasure,
  useDeleteUnitOfMeasure
} from "../composables/useUnitsOfMeasure";
import type { UnitOfMeasureItem } from "../services/unit-of-measure.service";
import type { SelectOption } from "../components/CustomSelect.vue";
import { formatDate } from "../utils/datetime";

/* ─── Sub-component for detail rows ─── */
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

/* ─── Data ─── */
const { data, isLoading, isError } = useUnitsOfMeasure();
const { mutateAsync: createUnit } = useCreateUnitOfMeasure();
const { mutateAsync: updateUnit } = useUpdateUnitOfMeasure();
const { mutateAsync: deleteUnit } = useDeleteUnitOfMeasure();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const units = computed(() => data.value ?? []);
const selectedUnit = ref<UnitOfMeasureItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "name" | "symbol" | "unit_type" | "is_base_unit" | "created_at">("created_at");
const sortDirection = ref<"asc" | "desc">("desc");

const emptyForm = () => ({
  code: "",
  name: "",
  symbol: "",
  unit_type: "",
  is_base_unit: false
});

const form = ref(emptyForm());

const unitTypeOptions: SelectOption[] = [
  { label: "Unidad", value: "Unidad" },
  { label: "Peso", value: "Peso" },
  { label: "Volumen", value: "Volumen" },
  { label: "Longitud", value: "Longitud" },
  { label: "Área", value: "Área" },
  { label: "Tiempo", value: "Tiempo" },
  { label: "Temperatura", value: "Temperatura" },
  { label: "Otro", value: "Otro" }
];

const filteredUnits = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return units.value;

  return units.value.filter((unit) => {
    const searchable = [
      String(unit.id),
      unit.code,
      unit.name,
      unit.symbol,
      unit.unit_type,
      unit.is_base_unit ? "sí base" : "no"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (unit: UnitOfMeasureItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(unit.id);
    case "created_at":
      return unit.created_at ? new Date(unit.created_at).getTime() : 0;
    case "is_base_unit":
      return unit.is_base_unit ? 1 : 0;
    default:
      return (unit[key] ?? "").toString().toLowerCase();
  }
};

const sortedUnits = computed(() => {
  const list = [...filteredUnits.value];
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

const totalPages = computed(() => Math.max(1, Math.ceil(sortedUnits.value.length / pageSize.value)));

const paginatedUnits = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedUnits.value.slice(start, start + pageSize.value);
});

const paginationStart = computed(() => {
  if (filteredUnits.value.length === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const paginationEnd = computed(() => {
  if (filteredUnits.value.length === 0) return 0;
  return Math.min(currentPage.value * pageSize.value, filteredUnits.value.length);
});

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

watch([searchQuery, pageSize], () => {
  currentPage.value = 1;
});

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

/* ─── Modal actions ─── */
async function openCreateModal() {
  if (!isComponentActive) return;
  isEditMode.value = false;
  editingId.value = null;
  form.value = emptyForm();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-uom-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

async function openEditModal(unit: UnitOfMeasureItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = unit.id;
  form.value = {
    code: unit.code,
    name: unit.name,
    symbol: unit.symbol,
    unit_type: unit.unit_type,
    is_base_unit: unit.is_base_unit
  };

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-uom-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

function openViewModal(unit: UnitOfMeasureItem) {
  if (!isComponentActive) return;
  selectedUnit.value = unit;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedUnit.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedUnit.value) return;
    void openEditModal(selectedUnit.value);
  }, 350);
}

/* ─── Submit ─── */
async function submitForm() {
  const f = form.value;
  if (!f.name.trim()) return showValidationError("El nombre es obligatorio.");
  if (!f.symbol.trim()) return showValidationError("El símbolo es obligatorio.");
  if (!f.unit_type.trim()) return showValidationError("El tipo de unidad es obligatorio.");
  if (!isEditMode.value && !f.code.trim()) return showValidationError("El código es obligatorio.");

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateUnit({
        id: editingId.value,
        payload: {
          name: f.name,
          symbol: f.symbol,
          unit_type: f.unit_type,
          is_base_unit: f.is_base_unit
        }
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Unidad actualizada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } else {
      await createUnit({
        code: f.code,
        name: f.name,
        symbol: f.symbol,
        unit_type: f.unit_type,
        is_base_unit: f.is_base_unit
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Unidad creada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
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

/* ─── Delete ─── */
async function confirmDelete(unit: UnitOfMeasureItem) {
  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar unidad de medida?",
    html: `<p class="mb-0">Estás por eliminar <strong>${unit.name}</strong> (${unit.code}).<br>Esta acción desactivará el registro.</p>`,
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
    await deleteUnit(unit.id);
    await Swal.fire({ icon: "success", title: "Unidad eliminada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar la unidad de medida.";
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

.uom-form-modal-body {
  overflow-x: hidden;
}

.uom-form-tab-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.uom-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.uom-form-tabs .nav-link {
  font-size: .875rem;
  padding: .5rem .9rem;
  white-space: normal;
  word-break: break-word;
}

.uom-form-grid {
  min-width: 0;
}

.uom-form-grid .col-md-6,
.uom-form-grid .col-12 {
  min-width: 0;
}

.uom-form-grid :deep(.relative),
.uom-form-grid :deep(button),
.uom-form-grid :deep(input),
.uom-form-grid :deep(select) {
  max-width: 100%;
}
</style>
