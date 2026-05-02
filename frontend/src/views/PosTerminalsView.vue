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
              <li class="breadcrumb-item active" aria-current="page">Terminales POS</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-cash-register me-2 text-brick-ember"></i>Gestión de Terminales POS
              </h1>
              <p class="text-secondary small mb-0">Administra las terminales POS de la empresa activa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nueva Terminal
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando terminales POS...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las terminales POS. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 460px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, nombre, dispositivo, serial o bodega"
                    aria-label="Buscar terminales POS"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="pos-terminals-page-size"
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
                <table id="posTerminalsTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Nombre <i :class="sortIcon('name')"></i></button></th>
                      <th>Bodega</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('device_name')">Dispositivo <i :class="sortIcon('device_name')"></i></button></th>
                      <th>Serial</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_active')">Estado <i :class="sortIcon('is_active')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('dependencies_count')">Dependencias <i :class="sortIcon('dependencies_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="terminal in paginatedPosTerminals" :key="terminal.id">
                      <td class="text-secondary small">{{ terminal.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ terminal.code }}</span></td>
                      <td class="fw-semibold">{{ terminal.name }}</td>
                      <td class="small">
                        <span class="d-block">{{ terminal.warehouse_name ?? '—' }}</span>
                        <span class="text-secondary">{{ terminal.warehouse_code ?? '—' }}</span>
                      </td>
                      <td class="small">{{ terminal.device_name ?? '—' }}</td>
                      <td class="small font-monospace">{{ terminal.serial_number ?? '—' }}</td>
                      <td>
                        <span class="badge rounded-pill" :class="terminal.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                          {{ terminal.is_active ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge rounded-pill" :class="terminal.dependencies_count > 0 ? 'text-bg-warning' : 'text-bg-light text-dark border'">
                          {{ terminal.dependencies_count }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(terminal.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button class="btn btn-sm btn-outline-info" @click="openViewModal(terminal)" title="Ver detalle" aria-label="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" @click="openEditModal(terminal)" title="Editar terminal POS" aria-label="Editar terminal POS">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="confirmDelete(terminal)"
                            :disabled="terminal.dependencies_count > 0"
                            :title="terminal.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar terminal POS'" :aria-label="terminal.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar terminal POS'"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedPosTerminals.length === 0">
                      <td colspan="10" class="text-center text-secondary py-4">No se encontraron terminales POS para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredPosTerminals.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación terminales POS">
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

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="posTerminalFormModal" tabindex="-1" aria-labelledby="posTerminalFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="posTerminalFormModalLabel">
            <i class="fa-solid fa-cash-register me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Terminal POS' : 'Nueva Terminal POS' }}
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
                placeholder="POS-001"
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
                placeholder="Caja Mostrador 1"
                maxlength="120"
              />
            </div>

            <div class="col-12">
              <CustomSelect
                id="pos-terminal-warehouse"
                v-model="form.warehouse_id"
                label="Bodega"
                placeholder="Seleccionar bodega"
                :options="warehouseOptions"
                :searchable="true"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre Dispositivo</label>
              <input
                v-model="form.device_name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="POS-DELL-01"
                maxlength="120"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Número de Serie</label>
              <input
                v-model="form.serial_number"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="SN-XXXX-YYYY"
                maxlength="120"
              />
            </div>

            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
              <div class="form-check form-switch">
                <input
                  v-model="form.is_active"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchPosTerminalActive"
                  style="width:2.5em;height:1.3em;"
                />
                <label class="form-check-label ms-2 fw-semibold" for="switchPosTerminalActive">
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

  <div class="modal fade" id="posTerminalViewModal" tabindex="-1" aria-labelledby="posTerminalViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow" v-if="selectedPosTerminal">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="posTerminalViewModalLabel">
            <i class="fa-solid fa-cash-register me-2 text-info"></i>Detalle Terminal POS
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedPosTerminal.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedPosTerminal.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedPosTerminal.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedPosTerminal.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedPosTerminal.is_active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedPosTerminal.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-warehouse" label="Bodega" :value="selectedPosTerminal.warehouse_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-desktop" label="Dispositivo" :value="selectedPosTerminal.device_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-fingerprint" label="Serial" :value="selectedPosTerminal.serial_number" /></div>
            <div class="col-md-6"><DetailRow icon="fa-cash-register" label="Cajas" :value="String(selectedPosTerminal.cash_registers_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-receipt" label="Ventas" :value="String(selectedPosTerminal.sales_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-link" label="Dependencias" :value="String(selectedPosTerminal.dependencies_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedPosTerminal.created_at)" /></div>
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
import { usePosTerminals, useCreatePosTerminal, useUpdatePosTerminal, useDeletePosTerminal } from "../composables/usePosTerminals";
import { useWarehouses } from "../composables/useWarehouses";
import type { PosTerminalItem } from "../services/pos-terminal.service";
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

const { data, isLoading, isError } = usePosTerminals();
const { data: warehousesData } = useWarehouses();
const { mutateAsync: createPosTerminal } = useCreatePosTerminal();
const { mutateAsync: updatePosTerminal } = useUpdatePosTerminal();
const { mutateAsync: deletePosTerminal } = useDeletePosTerminal();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const posTerminals = computed(() => data.value ?? []);
const selectedPosTerminal = ref<PosTerminalItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "name" | "device_name" | "is_active" | "dependencies_count" | "created_at">("name");
const sortDirection = ref<"asc" | "desc">("asc");

const emptyForm = () => ({
  warehouse_id: "",
  code: "",
  name: "",
  device_name: "",
  serial_number: "",
  is_active: true
});

const form = ref(emptyForm());

const pageSizeOptions: SelectOption[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 }
];

const warehouseOptions = computed<SelectOption[]>(() => {
  const rows = warehousesData.value ?? [];
  return rows
    .filter((warehouse) => warehouse.is_active)
    .map((warehouse) => ({
      value: warehouse.id,
      label: `${warehouse.code} - ${warehouse.name}`
    }));
});

const filteredPosTerminals = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return posTerminals.value;

  return posTerminals.value.filter((terminal) => {
    const searchable = [
      String(terminal.id),
      terminal.code,
      terminal.name,
      terminal.warehouse_code ?? "",
      terminal.warehouse_name ?? "",
      terminal.device_name ?? "",
      terminal.serial_number ?? "",
      terminal.is_active ? "activa" : "inactiva"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (terminal: PosTerminalItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(terminal.id);
    case "created_at":
      return terminal.created_at ? new Date(terminal.created_at).getTime() : 0;
    case "is_active":
      return terminal.is_active ? 1 : 0;
    case "dependencies_count":
      return terminal.dependencies_count;
    default:
      return (terminal[key] ?? "").toString().toLowerCase();
  }
};

const sortedPosTerminals = computed(() => {
  const list = [...filteredPosTerminals.value];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  list.sort((a, b) => {
    const left = getComparableValue(a, sortKey.value);
    const right = getComparableValue(b, sortKey.value);

    if (left === right) {
      return 0;
    }

    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * direction;
    }

    return String(left).localeCompare(String(right), "es") * direction;
  });

  return list;
});

const pageSizeNumber = computed(() => {
  const parsed = Number(pageSize.value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedPosTerminals.value.length / pageSizeNumber.value)));

const paginatedPosTerminals = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedPosTerminals.value.slice(start, start + pageSizeNumber.value);
});

const paginationStart = computed(() => filteredPosTerminals.value.length === 0 ? 0 : (currentPage.value - 1) * pageSizeNumber.value + 1);
const paginationEnd = computed(() => filteredPosTerminals.value.length === 0 ? 0 : Math.min(currentPage.value * pageSizeNumber.value, filteredPosTerminals.value.length));

const toggleSort = (key: typeof sortKey.value) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = "asc";
  }
};

const sortIcon = (key: typeof sortKey.value) => {
  if (sortKey.value !== key) {
    return "fa-solid fa-sort text-secondary opacity-75 ms-1";
  }

  return sortDirection.value === "asc"
    ? "fa-solid fa-sort-up ms-1"
    : "fa-solid fa-sort-down ms-1";
};

const goToPage = (page: number) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  currentPage.value = safePage;
};

watch([searchQuery, pageSize], () => { currentPage.value = 1; });
watch(totalPages, (maxPages) => {
  if (currentPage.value > maxPages) {
    currentPage.value = maxPages;
  }
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

async function openEditModal(terminal: PosTerminalItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = terminal.id;
  form.value = {
    warehouse_id: terminal.warehouse_id,
    code: terminal.code,
    name: terminal.name,
    device_name: terminal.device_name ?? "",
    serial_number: terminal.serial_number ?? "",
    is_active: terminal.is_active
  };

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

function openViewModal(terminal: PosTerminalItem) {
  if (!isComponentActive) return;
  selectedPosTerminal.value = terminal;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedPosTerminal.value) return;
  viewModalInstance?.hide();

  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedPosTerminal.value) return;
    void openEditModal(selectedPosTerminal.value);
  }, 350);
}

async function submitForm() {
  const f = form.value;

  if (!f.name.trim()) return showValidationError("El nombre es obligatorio.");
  if (!isEditMode.value && !f.code.trim()) return showValidationError("El código es obligatorio.");
  if (!f.warehouse_id) return showValidationError("La bodega es obligatoria.");

  isSaving.value = true;
  try {
    const warehouseId = Number(f.warehouse_id);

    if (isEditMode.value && editingId.value) {
      await updatePosTerminal({
        id: editingId.value,
        payload: {
          warehouse_id: warehouseId,
          name: f.name,
          device_name: f.device_name || undefined,
          serial_number: f.serial_number || undefined,
          is_active: f.is_active
        }
      });

      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Terminal POS actualizada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    } else {
      await createPosTerminal({
        warehouse_id: warehouseId,
        code: f.code,
        name: f.name,
        device_name: f.device_name || undefined,
        serial_number: f.serial_number || undefined,
        is_active: f.is_active
      });

      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Terminal POS creada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    }
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ocurrió un error inesperado.";
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

function showValidationError(message: string) {
  Swal.fire({
    icon: "warning",
    title: "Validación",
    text: message,
    confirmButtonText: "Entendido",
    customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
  });
}

async function confirmDelete(terminal: PosTerminalItem) {
  if (terminal.dependencies_count > 0) {
    await Swal.fire({
      icon: "info",
      title: "No se puede eliminar",
      text: "La terminal POS tiene dependencias asociadas.",
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-primary rounded-3 px-4" }
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar terminal POS?",
    html: `<p class="mb-0">Estás por eliminar <strong>${terminal.name}</strong>.<br>Esta acción desactivará el registro.</p>`,
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
    await deletePosTerminal(terminal.id);
    await Swal.fire({
      icon: "success",
      title: "Terminal POS eliminada",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  } catch {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No fue posible eliminar la terminal POS.",
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
</style>




