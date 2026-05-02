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
              <li class="breadcrumb-item active" aria-current="page">Regiones</li>
            </ol>
          </nav>

          <!-- Page header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-map me-2 text-brick-ember"></i>Gestión de Regiones
              </h1>
              <p class="text-secondary small mb-0">Administra las regiones geográficas registradas en el sistema.</p>
            </div>
            <button
              class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3"
              @click="openCreateModal"
            >
              <i class="fa-solid fa-plus"></i>
              Nueva Región
            </button>
          </div>

          <!-- Table card -->
          <div class="bg-white rounded-4 shadow-sm p-4">
            <!-- Loader overlay -->
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando regiones...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las regiones. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 420px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, nombre o país"
                    aria-label="Buscar regiones"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="regions-page-size"
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
                <table
                  id="regionsTable"
                  class="table table-hover align-middle table-striped w-100"
                >
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('country_code')">País <i :class="sortIcon('country_code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Nombre <i :class="sortIcon('name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('cities_count')">Ciudades <i :class="sortIcon('cities_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="region in paginatedRegions" :key="region.id">
                      <td class="text-secondary small">{{ region.id }}</td>
                      <td>
                        <span class="badge bg-primary-subtle text-primary fw-semibold">
                          {{ region.country_code }}
                        </span>
                      </td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ region.code }}</span></td>
                      <td class="fw-semibold">{{ region.name }}</td>
                      <td>
                        <span
                          class="badge rounded-pill"
                          :class="region.cities_count > 0 ? 'text-bg-info' : 'text-bg-light text-dark border'"
                        >
                          <i class="fa-solid fa-city me-1" style="font-size:.65rem;"></i>
                          {{ region.cities_count }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(region.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="d-flex gap-1 justify-content-center">
                          <button
                            class="btn btn-sm btn-outline-info rounded-3 px-2"
                            @click="openViewModal(region)"
                            title="Ver detalle"
                          >
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-warning rounded-3 px-2"
                            @click="openEditModal(region)"
                            title="Editar región"
                          >
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger rounded-3 px-2"
                            @click="confirmDelete(region)"
                            :disabled="region.cities_count > 0"
                            :title="region.cities_count > 0 ? `No se puede eliminar: tiene ${region.cities_count} ciudad(es) asociada(s)` : 'Eliminar región'"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedRegions.length === 0">
                      <td colspan="7" class="text-center text-secondary py-4">
                        No se encontraron regiones para el filtro actual.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredRegions.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación regiones">
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
  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']"
    id="regionFormModal"
    tabindex="-1"
    aria-labelledby="regionFormModalLabel"
    aria-hidden="true"
    ref="formModalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="regionFormModalLabel">
            <i class="fa-solid fa-map me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Región' : 'Nueva Región' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3">
          <div class="row g-3">
            <!-- País -->
            <div class="col-md-4">
              <CustomSelect
                id="region-country"
                v-model="form.country_code"
                label="País"
                placeholder="Seleccionar país"
                :options="countryOptions"
                :searchable="true"
                :disabled="isEditMode"
              />
              <p class="text-secondary small mt-1 mb-0">
                <span class="text-danger">*</span> Campo obligatorio
              </p>
            </div>

            <!-- Código -->
            <div class="col-md-8">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">
                Código <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.code"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="RM, I, II, V..."
                :disabled="isEditMode"
                maxlength="20"
              />
              <p v-if="isEditMode" class="text-secondary small mt-1 mb-0">
                <i class="fa-solid fa-lock me-1"></i>El código no puede modificarse.
              </p>
            </div>

            <!-- Nombre -->
            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">
                Nombre <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Región Metropolitana de Santiago"
                maxlength="120"
              />
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
    id="regionViewModal"
    tabindex="-1"
    aria-labelledby="regionViewModalLabel"
    aria-hidden="true"
    ref="viewModalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow" v-if="selectedRegion">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="regionViewModalLabel">
            <i class="fa-solid fa-map me-2 text-info"></i>Detalle de Región
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedRegion.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedRegion.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedRegion.country_code }} — {{ selectedRegion.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedRegion.cities_count > 0 ? 'text-bg-info' : 'text-bg-light text-dark border'">
                <i class="fa-solid fa-city me-1"></i>{{ selectedRegion.cities_count }} ciudad(es)
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-flag" label="País" :value="selectedRegion.country_code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedRegion.code" /></div>
            <div class="col-12"><DetailRow icon="fa-map" label="Nombre" :value="selectedRegion.name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-city" label="Ciudades Asociadas" :value="String(selectedRegion.cities_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedRegion.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-clock-rotate-left" label="Actualizado" :value="formatDate(selectedRegion.updated_at)" /></div>
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
import { useRegions, useCreateRegion, useUpdateRegion, useDeleteRegion } from "../composables/useRegions";
import type { RegionItem } from "../services/region.service";
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
const { data, isLoading, isError } = useRegions();
const { mutateAsync: createRegion } = useCreateRegion();
const { mutateAsync: updateRegion } = useUpdateRegion();
const { mutateAsync: deleteRegion } = useDeleteRegion();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const regions = computed(() => data.value ?? []);
const selectedRegion = ref<RegionItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "country_code" | "code" | "name" | "cities_count" | "created_at">("name");
const sortDirection = ref<"asc" | "desc">("asc");

const emptyForm = () => ({
  country_code: "CL",
  code: "",
  name: ""
});

const form = ref(emptyForm());

const countryOptions: SelectOption[] = [
  { label: "CL — Chile", value: "CL" },
  { label: "AR — Argentina", value: "AR" },
  { label: "PE — Perú", value: "PE" },
  { label: "CO — Colombia", value: "CO" },
  { label: "MX — México", value: "MX" },
  { label: "US — Estados Unidos", value: "US" },
  { label: "BR — Brasil", value: "BR" },
  { label: "UY — Uruguay", value: "UY" },
  { label: "PY — Paraguay", value: "PY" },
  { label: "BO — Bolivia", value: "BO" },
  { label: "EC — Ecuador", value: "EC" },
  { label: "VE — Venezuela", value: "VE" }
];

const pageSizeOptions: SelectOption[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 }
];

/* ─── Filtering ─── */
const filteredRegions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return regions.value;

  return regions.value.filter((r) => {
    const searchable = [
      String(r.id),
      r.country_code,
      r.code,
      r.name
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

/* ─── Sorting ─── */
const getComparableValue = (r: RegionItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(r.id);
    case "cities_count":
      return r.cities_count;
    case "created_at":
      return r.created_at ? new Date(r.created_at).getTime() : 0;
    default:
      return (r[key] ?? "").toString().toLowerCase();
  }
};

const sortedRegions = computed(() => {
  const list = [...filteredRegions.value];
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

/* ─── Pagination ─── */
const totalPages = computed(() => Math.max(1, Math.ceil(sortedRegions.value.length / pageSize.value)));

const paginatedRegions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedRegions.value.slice(start, start + pageSize.value);
});

const paginationStart = computed(() => {
  if (filteredRegions.value.length === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const paginationEnd = computed(() => {
  if (filteredRegions.value.length === 0) return 0;
  return Math.min(currentPage.value * pageSize.value, filteredRegions.value.length);
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

watch([searchQuery, pageSize], () => { currentPage.value = 1; });

watch(totalPages, (maxPages) => {
  if (currentPage.value > maxPages) currentPage.value = maxPages;
});

/* ─── Lifecycle ─── */
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
  formModalInstance?.show();
}

async function openEditModal(region: RegionItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = region.id;
  form.value = {
    country_code: region.country_code,
    code: region.code,
    name: region.name
  };

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

function openViewModal(region: RegionItem) {
  if (!isComponentActive) return;
  selectedRegion.value = region;
  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedRegion.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedRegion.value) return;
    void openEditModal(selectedRegion.value);
  }, 350);
}

/* ─── Submit ─── */
async function submitForm() {
  const f = form.value;
  if (!f.name.trim()) return showValidationError("El nombre de la región es obligatorio.");
  if (!isEditMode.value) {
    if (!f.country_code.trim()) return showValidationError("El código de país es obligatorio.");
    if (!f.code.trim()) return showValidationError("El código de región es obligatorio.");
  }

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateRegion({
        id: editingId.value,
        payload: { name: f.name }
      });
      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Región actualizada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    } else {
      await createRegion({
        country_code: f.country_code.toUpperCase(),
        code: f.code.trim().toUpperCase(),
        name: f.name.trim()
      });
      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Región creada",
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

/* ─── Delete ─── */
async function confirmDelete(region: RegionItem) {
  if (region.cities_count > 0) {
    await Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      html: `<p class="mb-0">La región <strong>${region.name}</strong> tiene <strong>${region.cities_count}</strong> ciudad(es) asociada(s).<br>Primero debes reasignar o eliminar esas ciudades.</p>`,
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar región?",
    html: `<p class="mb-0">Estás por eliminar <strong>${region.name}</strong> (${region.country_code} — ${region.code}).<br>Esta acción no se puede deshacer.</p>`,
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
    await deleteRegion(region.id);
    await Swal.fire({
      icon: "success",
      title: "Región eliminada",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "No fue posible eliminar la región.";
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
</style>
