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
              <li class="breadcrumb-item active" aria-current="page">Tipos de Movimiento</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-arrow-right-arrow-left me-2 text-brick-ember"></i>Tipos de Movimiento de Inventario
              </h1>
              <p class="text-secondary small mb-0">Administra el catálogo de tipos de movimiento usado por inventario y automatizaciones.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Tipo
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando tipos de movimiento...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los tipos de movimiento. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 420px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, nombre o dirección"
                    aria-label="Buscar tipos de movimiento"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <label for="inventoryMovementTypesPageSize" class="small text-secondary mb-0">Mostrar</label>
                  <select id="inventoryMovementTypesPageSize" v-model.number="pageSize" class="form-select form-select-sm" style="width: 88px;">
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
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Nombre <i :class="sortIcon('name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('direction')">Dirección <i :class="sortIcon('direction')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('movements_count')">Movimientos <i :class="sortIcon('movements_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_system')">Origen <i :class="sortIcon('is_system')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="movementType in paginatedMovementTypes" :key="movementType.id">
                      <td class="text-secondary small">{{ movementType.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ movementType.code }}</span></td>
                      <td class="fw-semibold">{{ movementType.name }}</td>
                      <td>
                        <span class="badge rounded-pill" :class="directionBadgeClass(movementType.direction)">
                          {{ directionLabel(movementType.direction) }}
                        </span>
                      </td>
                      <td><span class="badge bg-light text-dark border">{{ movementType.movements_count }}</span></td>
                      <td>
                        <span class="badge rounded-pill" :class="movementType.is_system ? 'text-bg-dark' : 'text-bg-info'">
                          {{ movementType.is_system ? 'Sistema' : 'Usuario' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(movementType.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button class="btn btn-sm btn-outline-info" @click="openViewModal(movementType)" title="Ver detalle" aria-label="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" @click="openEditModal(movementType)" title="Editar tipo" aria-label="Editar tipo">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="confirmDelete(movementType)"
                            title="Eliminar tipo"
                            aria-label="Eliminar tipo"
                            :disabled="movementType.is_system || movementType.movements_count > 0"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedMovementTypes.length === 0">
                      <td colspan="8" class="text-center text-secondary py-4">No se encontraron tipos de movimiento para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredMovementTypes.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación tipos de movimiento">
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
    class="modal fade"
    id="inventoryMovementTypeFormModal"
    tabindex="-1"
    aria-labelledby="inventoryMovementTypeFormModalLabel"
    aria-hidden="true"
    ref="formModalRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="inventoryMovementTypeFormModalLabel">
            <i class="fa-solid fa-arrow-right-arrow-left me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Tipo de Movimiento' : 'Nuevo Tipo de Movimiento' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Código <span class="text-danger">*</span></label>
              <input
                v-model="form.code"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="EJ: STOCK_IN"
                maxlength="30"
                :disabled="isEditMode && isCurrentRecordProtected"
              />
            </div>
            <div class="col-md-6">
              <CustomSelect
                id="movement-type-direction"
                v-model="form.direction"
                label="Dirección"
                placeholder="Seleccionar dirección"
                :options="directionOptions"
                :searchable="false"
                :disabled="isEditMode && isCurrentRecordProtectedOrUsed"
              />
            </div>
            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre <span class="text-danger">*</span></label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Nombre descriptivo del tipo de movimiento"
                maxlength="120"
              />
            </div>
          </div>

          <div class="alert alert-secondary rounded-3 mt-4 mb-0 small" role="alert">
            <i class="fa-solid fa-circle-info me-2"></i>
            Los tipos marcados como sistema o con movimientos asociados restringen cambios estructurales para no romper la automatización de inventario.
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

  <div class="modal fade" id="inventoryMovementTypeViewModal" tabindex="-1" aria-labelledby="inventoryMovementTypeViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedMovementType">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="inventoryMovementTypeViewModalLabel">
            <i class="fa-solid fa-arrow-right-arrow-left me-2 text-info"></i>Detalle del Tipo de Movimiento
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.2rem;">
              {{ selectedMovementType.code.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedMovementType.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedMovementType.code }}</p>
              <div class="d-flex flex-wrap gap-2 mt-1">
                <span class="badge rounded-pill" :class="directionBadgeClass(selectedMovementType.direction)">
                  {{ directionLabel(selectedMovementType.direction) }}
                </span>
                <span class="badge rounded-pill" :class="selectedMovementType.is_system ? 'text-bg-dark' : 'text-bg-info'">
                  {{ selectedMovementType.is_system ? 'Sistema' : 'Usuario' }}
                </span>
              </div>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedMovementType.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-sign-in-alt" label="Dirección" :value="directionLabel(selectedMovementType.direction)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-boxes-stacked" label="Movimientos asociados" :value="String(selectedMovementType.movements_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-shield-halved" label="Origen" :value="selectedMovementType.is_system ? 'Sistema' : 'Usuario'" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedMovementType.created_at)" /></div>
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
import type { SelectOption } from "../components/CustomSelect.vue";
import {
  useCreateInventoryMovementType,
  useDeleteInventoryMovementType,
  useInventoryMovementTypes,
  useUpdateInventoryMovementType
} from "../composables/useInventoryMovementTypes";
import type {
  InventoryMovementDirection,
  InventoryMovementTypeItem
} from "../services/inventoryMovementType.service";
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

const { data, isLoading, isError } = useInventoryMovementTypes();
const { mutateAsync: createInventoryMovementType } = useCreateInventoryMovementType();
const { mutateAsync: updateInventoryMovementType } = useUpdateInventoryMovementType();
const { mutateAsync: deleteInventoryMovementType } = useDeleteInventoryMovementType();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const movementTypes = computed(() => data.value ?? []);
const selectedMovementType = ref<InventoryMovementTypeItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "name" | "direction" | "movements_count" | "is_system" | "created_at">("created_at");
const sortDirection = ref<"asc" | "desc">("desc");

const emptyForm = () => ({
  code: "",
  name: "",
  direction: "IN" as InventoryMovementDirection
});

const form = ref(emptyForm());

const directionOptions: SelectOption[] = [
  { label: "Entrada", value: "IN" },
  { label: "Salida", value: "OUT" },
  { label: "Transferencia", value: "TRANSFER" }
];

const isCurrentRecordProtected = computed(() => selectedMovementType.value?.is_system ?? false);
const isCurrentRecordProtectedOrUsed = computed(() => {
  const current = selectedMovementType.value;
  return Boolean(current?.is_system || (current?.movements_count ?? 0) > 0);
});

const filteredMovementTypes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return movementTypes.value;
  }

  return movementTypes.value.filter((movementType) => {
    const searchable = [
      String(movementType.id),
      movementType.code,
      movementType.name,
      movementType.direction,
      directionLabel(movementType.direction),
      movementType.is_system ? "sistema" : "usuario"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (
  movementType: InventoryMovementTypeItem,
  key: typeof sortKey.value
): string | number => {
  switch (key) {
    case "id":
      return Number(movementType.id);
    case "created_at":
      return movementType.created_at ? new Date(movementType.created_at).getTime() : 0;
    case "movements_count":
      return movementType.movements_count;
    case "is_system":
      return movementType.is_system ? 1 : 0;
    default:
      return (movementType[key] ?? "").toString().toLowerCase();
  }
};

const sortedMovementTypes = computed(() => {
  const list = [...filteredMovementTypes.value];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  list.sort((leftRow, rightRow) => {
    const left = getComparableValue(leftRow, sortKey.value);
    const right = getComparableValue(rightRow, sortKey.value);

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

const totalPages = computed(() => Math.max(1, Math.ceil(sortedMovementTypes.value.length / pageSize.value)));

const paginatedMovementTypes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedMovementTypes.value.slice(start, start + pageSize.value);
});

const paginationStart = computed(() => {
  if (filteredMovementTypes.value.length === 0) {
    return 0;
  }

  return (currentPage.value - 1) * pageSize.value + 1;
});

const paginationEnd = computed(() => {
  if (filteredMovementTypes.value.length === 0) {
    return 0;
  }

  return Math.min(currentPage.value * pageSize.value, filteredMovementTypes.value.length);
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
  if (sortKey.value !== key) {
    return "fa-solid fa-sort text-secondary opacity-75 ms-1";
  }

  return sortDirection.value === "asc"
    ? "fa-solid fa-sort-up ms-1"
    : "fa-solid fa-sort-down ms-1";
};

const goToPage = (page: number) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
};

watch([searchQuery, pageSize], () => {
  currentPage.value = 1;
});

watch(totalPages, (maxPages) => {
  if (currentPage.value > maxPages) {
    currentPage.value = maxPages;
  }
});

onMounted(() => {
  if (formModalRef.value) {
    formModalInstance = new Modal(formModalRef.value);
  }

  if (viewModalRef.value) {
    viewModalInstance = new Modal(viewModalRef.value);
  }
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

function directionLabel(direction: InventoryMovementDirection) {
  switch (direction) {
    case "IN":
      return "Entrada";
    case "OUT":
      return "Salida";
    case "TRANSFER":
      return "Transferencia";
    default:
      return direction;
  }
}

function directionBadgeClass(direction: InventoryMovementDirection) {
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

async function openCreateModal() {
  if (!isComponentActive) return;

  isEditMode.value = false;
  editingId.value = null;
  selectedMovementType.value = null;
  form.value = emptyForm();

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

async function openEditModal(movementType: InventoryMovementTypeItem) {
  if (!isComponentActive) return;

  isEditMode.value = true;
  editingId.value = movementType.id;
  selectedMovementType.value = movementType;
  form.value = {
    code: movementType.code,
    name: movementType.name,
    direction: movementType.direction
  };

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

function openViewModal(movementType: InventoryMovementTypeItem) {
  if (!isComponentActive) return;
  selectedMovementType.value = movementType;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedMovementType.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedMovementType.value) return;
    void openEditModal(selectedMovementType.value);
  }, 350);
}

async function submitForm() {
  const current = selectedMovementType.value;
  const code = form.value.code.trim().toUpperCase();
  const name = form.value.name.trim();

  if (!code) {
    return showValidationError("El código es obligatorio.");
  }

  if (!name) {
    return showValidationError("El nombre es obligatorio.");
  }

  isSaving.value = true;

  try {
    if (isEditMode.value && editingId.value) {
      const payload = {
        code,
        name,
        direction: form.value.direction
      };

      if (current?.is_system) {
        payload.code = current.code;
      }

      if (current && (current.is_system || current.movements_count > 0)) {
        payload.direction = current.direction;
      }

      await updateInventoryMovementType({
        id: editingId.value,
        payload
      });

      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Tipo actualizado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } else {
      await createInventoryMovementType({
        code,
        name,
        direction: form.value.direction
      });

      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Tipo creado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    }
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ocurrió un error inesperado.";
    await Swal.fire({ icon: "error", title: "Error", text: message, confirmButtonText: "Entendido", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
  } finally {
    isSaving.value = false;
  }
}

function showValidationError(message: string) {
  Swal.fire({ icon: "warning", title: "Validación", text: message, confirmButtonText: "Entendido", customClass: { confirmButton: "btn btn-warning rounded-3 px-4" } });
}

async function confirmDelete(movementType: InventoryMovementTypeItem) {
  if (movementType.is_system || movementType.movements_count > 0) {
    const reason = movementType.is_system
      ? "Es un tipo de sistema utilizado por automatizaciones."
      : "Tiene movimientos asociados y debe preservarse por integridad histórica.";

    await Swal.fire({ icon: "info", title: "Eliminación no disponible", text: reason, confirmButtonText: "Entendido", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar tipo de movimiento?",
    html: `<p class="mb-0">Estás por eliminar <strong>${movementType.name}</strong>.<br>Esta acción no se puede deshacer.</p>`,
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
    await deleteInventoryMovementType(movementType.id);
    await Swal.fire({ icon: "success", title: "Tipo eliminado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar el tipo de movimiento.";
    await Swal.fire({ icon: "error", title: "Error", text: message, confirmButtonText: "Cerrar", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
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