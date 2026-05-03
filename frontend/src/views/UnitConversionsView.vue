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
                <router-link to="/inventario/stock" class="text-decoration-none text-secondary">Inventario</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Conversiones de Unidades</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-arrows-left-right me-2 text-brick-ember"></i>Gestión de Conversiones de Unidades
              </h1>
              <p class="text-secondary small mb-0">Administra factores de conversión entre unidades de medida por tipo.</p>
            </div>
            <button
              class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3"
              @click="openCreateModal"
            >
              <i class="fa-solid fa-plus"></i>
              Nueva Conversión
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando conversiones...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las conversiones de unidades. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 420px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por unidad origen/destino, tipo o factor"
                    aria-label="Buscar conversiones"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <label for="unitConvPageSize" class="small text-secondary mb-0">Mostrar</label>
                  <select id="unitConvPageSize" v-model.number="pageSize" class="form-select form-select-sm" style="width: 88px;">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                  </select>
                  <span class="small text-secondary">registros</span>
                </div>
              </div>

              <div class="table-responsive">
                <table id="unitConversionsTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('from_label')">Unidad Origen <i :class="sortIcon('from_label')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('to_label')">Unidad Destino <i :class="sortIcon('to_label')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('unit_type')">Tipo <i :class="sortIcon('unit_type')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('factor')">Factor <i :class="sortIcon('factor')"></i></button></th>
                      <th>Equivalencia</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="conversion in paginatedConversions" :key="conversion.id">
                      <td class="text-secondary small">{{ conversion.id }}</td>
                      <td class="fw-semibold">{{ getUnitLabel(conversion.from_unit) }}</td>
                      <td class="fw-semibold">{{ getUnitLabel(conversion.to_unit) }}</td>
                      <td>
                        <span class="badge rounded-pill bg-primary-subtle text-primary">{{ conversion.from_unit?.unit_type ?? '—' }}</span>
                      </td>
                      <td><span class="badge bg-light text-dark border font-monospace">{{ conversion.factor }}</span></td>
                      <td class="small">
                        <span v-if="conversion.from_unit && conversion.to_unit" class="text-secondary">
                          1 {{ conversion.from_unit.symbol }} = {{ conversion.factor }} {{ conversion.to_unit.symbol }}
                        </span>
                        <span v-else>—</span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(conversion.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button
                            class="btn btn-sm btn-outline-info"
                            @click="openViewModal(conversion)"
                            title="Ver detalle" aria-label="Ver detalle"
                          >
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-warning"
                            @click="openEditModal(conversion)"
                            title="Editar conversión" aria-label="Editar conversión"
                          >
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="confirmDelete(conversion)"
                            title="Eliminar conversión" aria-label="Eliminar conversión"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedConversions.length === 0">
                      <td colspan="8" class="text-center text-secondary py-4">No se encontraron conversiones para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredConversions.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación conversiones">
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

  <div
    :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']"
    id="unitConversionFormModal"
    tabindex="-1"
    aria-labelledby="unitConversionFormModalLabel"
    aria-hidden="true"
    ref="formModalRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="unitConversionFormModalLabel">
            <i class="fa-solid fa-arrows-left-right me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Conversión de Unidad' : 'Nueva Conversión de Unidad' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 unit-conversion-form-modal-body">
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 unit-conversion-form-tabs" id="unitConversionFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-unit-conversion-general" data-bs-toggle="tab" data-bs-target="#panel-unit-conversion-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-unit-conversion-preview" data-bs-toggle="tab" data-bs-target="#panel-unit-conversion-preview" type="button" role="tab">
                <i class="fa-solid fa-flask me-1"></i>Vista Previa
              </button>
            </li>
          </ul>

          <div class="tab-content unit-conversion-form-tab-content">
            <div class="tab-pane fade show active" id="panel-unit-conversion-general" role="tabpanel">
              <div class="row g-3 unit-conversion-form-grid">
                <div class="col-md-6">
                  <CustomSelect
                    id="from-unit-id"
                    v-model="form.from_unit_id"
                    label="Unidad Origen *"
                    placeholder="Seleccionar unidad origen"
                    :options="unitOptions"
                    :searchable="true"
                  />
                </div>
                <div class="col-md-6">
                  <CustomSelect
                    id="to-unit-id"
                    v-model="form.to_unit_id"
                    label="Unidad Destino *"
                    placeholder="Seleccionar unidad destino"
                    :options="unitOptions"
                    :searchable="true"
                  />
                </div>
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Factor de Conversión <span class="text-danger">*</span></label>
                  <input
                    v-model.number="form.factor"
                    type="number"
                    min="0.00000001"
                    step="0.00000001"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="Ej: 1000 (para kg -> g)"
                  />
                  <p class="text-secondary small mt-1 mb-0">El factor representa cuántas unidades destino equivalen a 1 unidad origen.</p>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="panel-unit-conversion-preview" role="tabpanel">
              <div class="rounded-3 border bg-light p-3">
                <p class="text-secondary small mb-2">Resultado de conversión</p>
                <p class="fw-bold mb-0 fs-6">
                  {{ previewText }}
                </p>
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

  <div
    class="modal fade"
    id="unitConversionViewModal"
    tabindex="-1"
    aria-labelledby="unitConversionViewModalLabel"
    aria-hidden="true"
    ref="viewModalRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedConversion">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="unitConversionViewModalLabel">
            <i class="fa-solid fa-arrows-left-right me-2 text-info"></i>Detalle de Conversión
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              <i class="fa-solid fa-exchange"></i>
            </div>
            <div>
              <p class="fw-bold mb-0">{{ getUnitLabel(selectedConversion.from_unit) }} -> {{ getUnitLabel(selectedConversion.to_unit) }}</p>
              <p class="text-secondary small mb-0">Tipo: {{ selectedConversion.from_unit?.unit_type ?? 'N/A' }}</p>
              <span class="badge rounded-pill mt-1 text-bg-primary">Factor {{ selectedConversion.factor }}</span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-arrow-right-arrow-left" label="Origen" :value="getUnitLabel(selectedConversion.from_unit)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-arrow-right-arrow-left" label="Destino" :value="getUnitLabel(selectedConversion.to_unit)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calculator" label="Factor" :value="selectedConversion.factor" /></div>
            <div class="col-md-6"><DetailRow icon="fa-layer-group" label="Tipo" :value="selectedConversion.from_unit?.unit_type ?? '—'" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedConversion.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-clock-rotate-left" label="Actualizado" :value="formatDate(selectedConversion.updated_at)" /></div>
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
import {
  useUnitConversions,
  useCreateUnitConversion,
  useUpdateUnitConversion,
  useDeleteUnitConversion
} from "../composables/useUnitConversions";
import { useUnitsOfMeasure } from "../composables/useUnitsOfMeasure";
import type { UnitConversionItem, ConversionUnitRef } from "../services/unit-conversion.service";
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

const { data, isLoading, isError } = useUnitConversions();
const { data: unitsData } = useUnitsOfMeasure();
const { mutateAsync: createConversion } = useCreateUnitConversion();
const { mutateAsync: updateConversion } = useUpdateUnitConversion();
const { mutateAsync: deleteConversion } = useDeleteUnitConversion();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const conversions = computed(() => data.value ?? []);
const units = computed(() => unitsData.value ?? []);

const selectedConversion = ref<UnitConversionItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "from_label" | "to_label" | "unit_type" | "factor" | "created_at">("created_at");
const sortDirection = ref<"asc" | "desc">("desc");

const emptyForm = () => ({
  from_unit_id: "",
  to_unit_id: "",
  factor: 1
});

const form = ref(emptyForm());

const unitOptions = computed<SelectOption[]>(() => {
  return units.value.map((unit) => ({
    value: unit.id,
    label: `${unit.name} (${unit.symbol}) - ${unit.unit_type}`
  }));
});

const selectedFromUnit = computed(() => units.value.find((unit) => unit.id === form.value.from_unit_id) ?? null);
const selectedToUnit = computed(() => units.value.find((unit) => unit.id === form.value.to_unit_id) ?? null);

const previewText = computed(() => {
  if (!selectedFromUnit.value || !selectedToUnit.value || !form.value.factor) {
    return "Completa los campos para visualizar la equivalencia.";
  }

  return `1 ${selectedFromUnit.value.symbol} = ${form.value.factor} ${selectedToUnit.value.symbol}`;
});

const filteredConversions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return conversions.value;

  return conversions.value.filter((conversion) => {
    const searchable = [
      conversion.id,
      conversion.factor,
      conversion.from_unit?.code ?? "",
      conversion.from_unit?.name ?? "",
      conversion.from_unit?.symbol ?? "",
      conversion.to_unit?.code ?? "",
      conversion.to_unit?.name ?? "",
      conversion.to_unit?.symbol ?? "",
      conversion.from_unit?.unit_type ?? ""
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (conversion: UnitConversionItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(conversion.id);
    case "from_label":
      return getUnitLabel(conversion.from_unit).toLowerCase();
    case "to_label":
      return getUnitLabel(conversion.to_unit).toLowerCase();
    case "unit_type":
      return (conversion.from_unit?.unit_type ?? "").toLowerCase();
    case "factor":
      return Number(conversion.factor);
    case "created_at":
      return conversion.created_at ? new Date(conversion.created_at).getTime() : 0;
    default:
      return "";
  }
};

const sortedConversions = computed(() => {
  const list = [...filteredConversions.value];
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

const totalPages = computed(() => Math.max(1, Math.ceil(sortedConversions.value.length / pageSize.value)));

const paginatedConversions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedConversions.value.slice(start, start + pageSize.value);
});

const paginationStart = computed(() => {
  if (filteredConversions.value.length === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const paginationEnd = computed(() => {
  if (filteredConversions.value.length === 0) return 0;
  return Math.min(currentPage.value * pageSize.value, filteredConversions.value.length);
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

function getUnitLabel(unit: ConversionUnitRef | null): string {
  if (!unit) return "—";
  return `${unit.name} (${unit.symbol})`;
}

async function openCreateModal() {
  if (!isComponentActive) return;
  isEditMode.value = false;
  editingId.value = null;
  form.value = emptyForm();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-unit-conversion-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

async function openEditModal(conversion: UnitConversionItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = conversion.id;
  form.value = {
    from_unit_id: conversion.from_unit_id,
    to_unit_id: conversion.to_unit_id,
    factor: Number(conversion.factor)
  };

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-unit-conversion-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

function openViewModal(conversion: UnitConversionItem) {
  if (!isComponentActive) return;
  selectedConversion.value = conversion;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedConversion.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedConversion.value) return;
    void openEditModal(selectedConversion.value);
  }, 350);
}

async function submitForm() {
  const fromUnitId = Number(form.value.from_unit_id);
  const toUnitId = Number(form.value.to_unit_id);
  const factor = Number(form.value.factor);

  if (!Number.isInteger(fromUnitId) || fromUnitId <= 0) {
    return showValidationError("La unidad origen es obligatoria.");
  }

  if (!Number.isInteger(toUnitId) || toUnitId <= 0) {
    return showValidationError("La unidad destino es obligatoria.");
  }

  if (fromUnitId === toUnitId) {
    return showValidationError("La unidad origen y destino deben ser distintas.");
  }

  if (!Number.isFinite(factor) || factor <= 0) {
    return showValidationError("El factor debe ser mayor que cero.");
  }

  const from = units.value.find((unit) => Number(unit.id) === fromUnitId);
  const to = units.value.find((unit) => Number(unit.id) === toUnitId);
  if (from && to && from.unit_type !== to.unit_type) {
    return showValidationError("Solo se permiten conversiones entre unidades del mismo tipo.");
  }

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateConversion({
        id: editingId.value,
        payload: {
          from_unit_id: fromUnitId,
          to_unit_id: toUnitId,
          factor
        }
      });
      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Conversión actualizada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    } else {
      await createConversion({
        from_unit_id: fromUnitId,
        to_unit_id: toUnitId,
        factor
      });
      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Conversión creada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    }
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Ocurrió un error inesperado.";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-primary rounded-3 px-4" }
    });
  } finally {
    isSaving.value = false;
  }
}

function showValidationError(msg: string) {
  Swal.fire({
    icon: "warning",
    title: "Validación",
    text: msg,
    confirmButtonText: "Entendido",
    customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
  });
}

async function confirmDelete(conversion: UnitConversionItem) {
  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar conversión?",
    html: `<p class="mb-0">Estás por eliminar la conversión <strong>${getUnitLabel(conversion.from_unit)}</strong> -> <strong>${getUnitLabel(conversion.to_unit)}</strong>.</p>`,
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
    await deleteConversion(conversion.id);
    await Swal.fire({
      icon: "success",
      title: "Conversión eliminada",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "No fue posible eliminar la conversión.";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      confirmButtonText: "Cerrar",
      customClass: { confirmButton: "btn btn-primary rounded-3 px-4" }
    });
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

.unit-conversion-form-modal-body {
  overflow-x: hidden;
}

.unit-conversion-form-tab-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.unit-conversion-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.unit-conversion-form-tabs .nav-link {
  font-size: .875rem;
  padding: .5rem .9rem;
  white-space: normal;
  word-break: break-word;
}

.unit-conversion-form-grid {
  min-width: 0;
}

.unit-conversion-form-grid .col-md-6,
.unit-conversion-form-grid .col-12 {
  min-width: 0;
}

.unit-conversion-form-grid :deep(.relative),
.unit-conversion-form-grid :deep(button),
.unit-conversion-form-grid :deep(input),
.unit-conversion-form-grid :deep(select) {
  max-width: 100%;
}
</style>
