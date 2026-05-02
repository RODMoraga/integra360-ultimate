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
              <li class="breadcrumb-item active" aria-current="page">Ciudades</li>
            </ol>
          </nav>

          <!-- Page header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-city me-2 text-brick-ember"></i>Gestión de Ciudades
              </h1>
              <p class="text-secondary small mb-0">Administra las ciudades asociadas a cada región del sistema.</p>
            </div>
            <button
              class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3"
              @click="openCreateModal"
            >
              <i class="fa-solid fa-plus"></i>
              Nueva Ciudad
            </button>
          </div>

          <!-- Table card -->
          <div class="bg-white rounded-4 shadow-sm p-4">
            <!-- Loader overlay -->
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando ciudades...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las ciudades. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 420px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, ciudad o región"
                    aria-label="Buscar ciudades"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="cities-page-size"
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
                  id="citiesTable"
                  class="table table-hover align-middle table-striped w-100"
                >
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('region_display')">Región <i :class="sortIcon('region_display')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Ciudad <i :class="sortIcon('name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('communes_count')">Comunas <i :class="sortIcon('communes_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="city in paginatedCities" :key="city.id">
                      <td class="text-secondary small">{{ city.id }}</td>
                      <td class="small">
                        <span class="badge bg-primary-subtle text-primary fw-semibold me-1">{{ city.region_country_code ?? '—' }}</span>
                        {{ city.region_name ?? '—' }}
                      </td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ city.code }}</span></td>
                      <td class="fw-semibold">{{ city.name }}</td>
                      <td>
                        <span
                          class="badge rounded-pill"
                          :class="city.communes_count > 0 ? 'text-bg-info' : 'text-bg-light text-dark border'"
                        >
                          <i class="fa-solid fa-map-location-dot me-1" style="font-size:.65rem;"></i>
                          {{ city.communes_count }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(city.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button
                            class="btn btn-sm btn-outline-info"
                            @click="openViewModal(city)"
                            title="Ver detalle" aria-label="Ver detalle"
                          >
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-warning"
                            @click="openEditModal(city)"
                            title="Editar ciudad" aria-label="Editar ciudad"
                          >
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="confirmDelete(city)"
                            :disabled="city.communes_count > 0"
                            :title="city.communes_count > 0 ? `No se puede eliminar: tiene ${city.communes_count} comuna(s) asociada(s)` : 'Eliminar ciudad'" :aria-label="city.communes_count > 0 ? `No se puede eliminar: tiene ${city.communes_count} comuna(s) asociada(s)` : 'Eliminar ciudad'"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedCities.length === 0">
                      <td colspan="7" class="text-center text-secondary py-4">
                        No se encontraron ciudades para el filtro actual.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredCities.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación ciudades">
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
    id="cityFormModal"
    tabindex="-1"
    aria-labelledby="cityFormModalLabel"
    aria-hidden="true"
    ref="formModalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="cityFormModalLabel">
            <i class="fa-solid fa-city me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Ciudad' : 'Nueva Ciudad' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3">
          <div class="row g-3">
            <div class="col-12">
              <CustomSelect
                id="city-region"
                v-model="form.region_id"
                label="Región"
                placeholder="Seleccionar región"
                :options="regionOptions"
                :searchable="true"
                :disabled="isEditMode"
              />
              <p class="text-secondary small mt-1 mb-0">
                <span class="text-danger">*</span> Campo obligatorio
              </p>
            </div>

            <div class="col-md-5">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">
                Código <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.code"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="SCL, VALP, IQQ..."
                :disabled="isEditMode"
                maxlength="20"
              />
              <p v-if="isEditMode" class="text-secondary small mt-1 mb-0">
                <i class="fa-solid fa-lock me-1"></i>La región y el código no pueden modificarse.
              </p>
            </div>

            <div class="col-md-7">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">
                Nombre <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Santiago"
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
    id="cityViewModal"
    tabindex="-1"
    aria-labelledby="cityViewModalLabel"
    aria-hidden="true"
    ref="viewModalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow" v-if="selectedCity">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="cityViewModalLabel">
            <i class="fa-solid fa-city me-2 text-info"></i>Detalle de Ciudad
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedCity.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedCity.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedCity.region_name ?? 'Sin región' }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedCity.communes_count > 0 ? 'text-bg-info' : 'text-bg-light text-dark border'">
                <i class="fa-solid fa-map-location-dot me-1"></i>{{ selectedCity.communes_count }} comuna(s)
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-earth-americas" label="País" :value="selectedCity.region_country_code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-map" label="Región" :value="selectedCity.region_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código Región" :value="selectedCity.region_code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-city" label="Código Ciudad" :value="selectedCity.code" /></div>
            <div class="col-12"><DetailRow icon="fa-location-dot" label="Nombre Ciudad" :value="selectedCity.name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-road" label="Comunas Asociadas" :value="String(selectedCity.communes_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedCity.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-clock-rotate-left" label="Actualizado" :value="formatDate(selectedCity.updated_at)" /></div>
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
import { useCities, useCreateCity, useUpdateCity, useDeleteCity } from "../composables/useCities";
import { useRegions } from "../composables/useRegions";
import type { CityItem } from "../services/city.service";
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
const { data, isLoading, isError } = useCities();
const { data: regionsData } = useRegions();
const { mutateAsync: createCity } = useCreateCity();
const { mutateAsync: updateCity } = useUpdateCity();
const { mutateAsync: deleteCity } = useDeleteCity();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const cities = computed(() => data.value ?? []);
const selectedCity = ref<CityItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "region_display" | "code" | "name" | "communes_count" | "created_at">("name");
const sortDirection = ref<"asc" | "desc">("asc");

const emptyForm = () => ({
  region_id: "",
  code: "",
  name: ""
});

const form = ref(emptyForm());

const pageSizeOptions: SelectOption[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 }
];

const regionOptions = computed<SelectOption[]>(() => {
  const rows = regionsData.value ?? [];
  return rows.map((r) => ({
    value: r.id,
    label: `${r.country_code} - ${r.name} (${r.code})`
  }));
});

/* ─── Filtering ─── */
const filteredCities = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return cities.value;

  return cities.value.filter((c) => {
    const searchable = [
      String(c.id),
      c.region_country_code ?? "",
      c.region_name ?? "",
      c.region_code ?? "",
      c.code,
      c.name,
      String(c.communes_count)
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

/* ─── Sorting ─── */
const getRegionDisplay = (c: CityItem) => `${c.region_country_code ?? ""} ${c.region_name ?? ""}`.trim();

const getComparableValue = (c: CityItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(c.id);
    case "communes_count":
      return c.communes_count;
    case "created_at":
      return c.created_at ? new Date(c.created_at).getTime() : 0;
    case "region_display":
      return getRegionDisplay(c).toLowerCase();
    default:
      return (c[key] ?? "").toString().toLowerCase();
  }
};

const sortedCities = computed(() => {
  const list = [...filteredCities.value];
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
const pageSizeNumber = computed(() => Number(pageSize.value) || 10);
const totalPages = computed(() => Math.max(1, Math.ceil(sortedCities.value.length / pageSizeNumber.value)));

const paginatedCities = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedCities.value.slice(start, start + pageSizeNumber.value);
});

const paginationStart = computed(() => {
  if (filteredCities.value.length === 0) return 0;
  return (currentPage.value - 1) * pageSizeNumber.value + 1;
});

const paginationEnd = computed(() => {
  if (filteredCities.value.length === 0) return 0;
  return Math.min(currentPage.value * pageSizeNumber.value, filteredCities.value.length);
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

async function openEditModal(city: CityItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = city.id;
  form.value = {
    region_id: city.region_id,
    code: city.code,
    name: city.name
  };

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
}

function openViewModal(city: CityItem) {
  if (!isComponentActive) return;
  selectedCity.value = city;
  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedCity.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedCity.value) return;
    void openEditModal(selectedCity.value);
  }, 350);
}

/* ─── Submit ─── */
async function submitForm() {
  const f = form.value;
  if (!f.region_id) return showValidationError("La región es obligatoria.");
  if (!f.name.trim()) return showValidationError("El nombre de la ciudad es obligatorio.");
  if (!isEditMode.value && !f.code.trim()) {
    return showValidationError("El código de ciudad es obligatorio.");
  }

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateCity({
        id: editingId.value,
        payload: { name: f.name.trim() }
      });
      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Ciudad actualizada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    } else {
      await createCity({
        region_id: Number(f.region_id),
        code: f.code.trim().toUpperCase(),
        name: f.name.trim()
      });
      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Ciudad creada",
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
async function confirmDelete(city: CityItem) {
  if (city.communes_count > 0) {
    await Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      html: `<p class="mb-0">La ciudad <strong>${city.name}</strong> tiene <strong>${city.communes_count}</strong> comuna(s) asociada(s).<br>Primero debes reasignar o eliminar esas comunas.</p>`,
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar ciudad?",
    html: `<p class="mb-0">Estás por eliminar <strong>${city.name}</strong> (${city.code}).<br>Esta acción no se puede deshacer.</p>`,
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
    await deleteCity(city.id);
    await Swal.fire({
      icon: "success",
      title: "Ciudad eliminada",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "No fue posible eliminar la ciudad.";
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




