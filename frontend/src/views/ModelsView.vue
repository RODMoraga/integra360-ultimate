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
              <li class="breadcrumb-item active" aria-current="page">Modelos</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-cubes me-2 text-brick-ember"></i>Gestión de Modelos
              </h1>
              <p class="text-secondary small mb-0">Administra los modelos asociados a las marcas de la empresa activa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Modelo
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando modelos...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los modelos. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 460px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, nombre o marca"
                    aria-label="Buscar modelos"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="models-page-size"
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
                <table id="modelsTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Nombre <i :class="sortIcon('name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('brand_name')">Marca <i :class="sortIcon('brand_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('products_count')">Productos <i :class="sortIcon('products_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="model in paginatedModels" :key="model.id">
                      <td class="text-secondary small">{{ model.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ model.code }}</span></td>
                      <td class="fw-semibold">{{ model.name }}</td>
                      <td>
                        <div class="d-flex flex-column">
                          <span class="fw-semibold small">{{ model.brand_name ?? '—' }}</span>
                          <span v-if="model.brand_code" class="badge bg-secondary-subtle text-secondary fw-semibold mt-1" style="width:fit-content;">{{ model.brand_code }}</span>
                        </div>
                      </td>
                      <td class="small">{{ model.products_count }}</td>
                      <td class="small text-secondary">{{ formatDate(model.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button class="btn btn-sm btn-outline-info" @click="openViewModal(model)" title="Ver detalle" aria-label="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" @click="openEditModal(model)" title="Editar modelo" aria-label="Editar modelo">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="confirmDelete(model)"
                            :disabled="model.dependencies_count > 0"
                            :title="model.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar modelo'" :aria-label="model.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar modelo'"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedModels.length === 0">
                      <td colspan="7" class="text-center text-secondary py-4">No se encontraron modelos para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredModels.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación modelos">
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

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="modelFormModal" tabindex="-1" aria-labelledby="modelFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="modelFormModalLabel">
            <i class="fa-solid fa-cubes me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Modelo' : 'Nuevo Modelo' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 model-form-modal-body">
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 model-form-tabs" id="modelFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-model-general" data-bs-toggle="tab" data-bs-target="#panel-model-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-model-relaciones" data-bs-toggle="tab" data-bs-target="#panel-model-relaciones" type="button" role="tab">
                <i class="fa-solid fa-link me-1"></i>Relaciones
              </button>
            </li>
          </ul>

          <div class="tab-content model-form-tab-content">
            <div class="tab-pane fade show active" id="panel-model-general" role="tabpanel">
              <div class="row g-3 model-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="model-code">Código <span class="text-danger">*</span></label>
                  <input
                    id="model-code"
                    v-model="form.code"
                    type="text"
                    :class="inputClass(formErrors.code)"
                    placeholder="MOD-001"
                    :disabled="isEditMode"
                    maxlength="40"
                    :aria-invalid="Boolean(formErrors.code)"
                    aria-describedby="model-code-help model-code-error"
                    @blur="validateField('code')"
                  />
                  <p id="model-code-help" class="field-help">Identificador interno único del modelo.</p>
                  <p v-if="formErrors.code" id="model-code-error" class="field-error">{{ formErrors.code }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="model-name">Nombre <span class="text-danger">*</span></label>
                  <input
                    id="model-name"
                    v-model="form.name"
                    type="text"
                    :class="inputClass(formErrors.name)"
                    placeholder="Modelo comercial"
                    maxlength="120"
                    :aria-invalid="Boolean(formErrors.name)"
                    aria-describedby="model-name-help model-name-error"
                    @blur="validateField('name')"
                  />
                  <p id="model-name-help" class="field-help">Nombre visible del modelo en catálogo y fichas de producto.</p>
                  <p v-if="formErrors.name" id="model-name-error" class="field-error">{{ formErrors.name }}</p>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="panel-model-relaciones" role="tabpanel">
              <div class="row g-3 model-form-grid">
                <div class="col-12">
                  <CustomSelect
                    id="model-brand"
                    v-model="form.brand_id"
                    label="Marca"
                    placeholder="Seleccionar marca"
                    :options="brandOptions"
                    :searchable="true"
                    :error="formErrors.brand_id"
                    helper-text="Cada modelo debe estar asociado a una marca activa."
                    @change="validateField('brand_id')"
                  />
                </div>
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

  <div class="modal fade" id="modelViewModal" tabindex="-1" aria-labelledby="modelViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow" v-if="selectedModel">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="modelViewModalLabel">
            <i class="fa-solid fa-cubes me-2 text-info"></i>Detalle de Modelo
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedModel.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedModel.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedModel.code }}</p>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedModel.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-tag" label="Nombre" :value="selectedModel.name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-copyright" label="Marca" :value="selectedModel.brand_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-layer-group" label="Cód. Marca" :value="selectedModel.brand_code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-box" label="Productos" :value="selectedModel.products_count" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedModel.created_at)" /></div>
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
import { useCreateModel, useDeleteModel, useModelBrands, useModels, useUpdateModel } from "../composables/useModels";
import type { SelectOption } from "../components/CustomSelect.vue";
import type { ModelItem } from "../services/model.service";
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

const { data, isLoading, isError } = useModels();
const { data: brandsData } = useModelBrands();
const { mutateAsync: createModel } = useCreateModel();
const { mutateAsync: updateModel } = useUpdateModel();
const { mutateAsync: deleteModel } = useDeleteModel();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const models = computed(() => data.value ?? []);
const selectedModel = ref<ModelItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "name" | "brand_name" | "products_count" | "created_at">("name");
const sortDirection = ref<"asc" | "desc">("asc");

const emptyForm = () => ({
  brand_id: "" as string | number,
  code: "",
  name: ""
});

type ModelFormField = keyof ReturnType<typeof emptyForm>;

const emptyFormErrors = () => ({
  brand_id: "",
  code: "",
  name: ""
});

const form = ref(emptyForm());
const formErrors = ref(emptyFormErrors());

const pageSizeOptions: SelectOption[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 }
];

const brandOptions = computed<SelectOption[]>(() => {
  const rows = brandsData.value ?? [];
  return rows.map((brand) => ({
    value: Number(brand.id),
    label: `[${brand.code}] ${brand.name}`
  }));
});

const filteredModels = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return models.value;

  return models.value.filter((model) => {
    const searchable = [
      String(model.id),
      model.code,
      model.name,
      model.brand_name ?? "",
      model.brand_code ?? ""
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (model: ModelItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(model.id);
    case "created_at":
      return model.created_at ? new Date(model.created_at).getTime() : 0;
    case "products_count":
      return model.products_count;
    default:
      return (model[key] ?? "").toString().toLowerCase();
  }
};

const sortedModels = computed(() => {
  const list = [...filteredModels.value];
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
const totalPages = computed(() => Math.max(1, Math.ceil(sortedModels.value.length / pageSizeNumber.value)));
const paginatedModels = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedModels.value.slice(start, start + pageSizeNumber.value);
});

const paginationStart = computed(() => filteredModels.value.length === 0 ? 0 : (currentPage.value - 1) * pageSizeNumber.value + 1);
const paginationEnd = computed(() => filteredModels.value.length === 0 ? 0 : Math.min(currentPage.value * pageSizeNumber.value, filteredModels.value.length));

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
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-model-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

async function openEditModal(model: ModelItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = model.id;
  form.value = {
    brand_id: Number(model.brand_id),
    code: model.code,
    name: model.name
  };
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-model-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

function openViewModal(model: ModelItem) {
  if (!isComponentActive) return;
  selectedModel.value = model;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedModel.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedModel.value) return;
    void openEditModal(selectedModel.value);
  }, 350);
}

async function submitForm() {
  const hasErrors = validateForm();
  if (hasErrors) {
    return showValidationError("Revisa los campos resaltados para continuar.");
  }

  const f = form.value;

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateModel({
        id: editingId.value,
        payload: {
          brand_id: Number(f.brand_id),
          name: f.name
        }
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Modelo actualizado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } else {
      await createModel({
        brand_id: Number(f.brand_id),
        code: f.code,
        name: f.name
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Modelo creado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
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

function inputClass(error: string) {
  return [
    "w-full px-4 py-2.5 rounded-lg border focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white",
    error ? "border-danger model-form-input-error" : "border-slate-300"
  ];
}

function validateField(field: ModelFormField): string {
  const f = form.value;
  let error = "";

  if (field === "brand_id" && !f.brand_id) {
    error = "La marca es obligatoria.";
  }

  if (field === "code") {
    if (!isEditMode.value && !f.code.trim()) {
      error = "El código es obligatorio.";
    } else if (f.code.length > 40) {
      error = "El código no puede superar 40 caracteres.";
    }
  }

  if (field === "name") {
    if (!f.name.trim()) {
      error = "El nombre es obligatorio.";
    } else if (f.name.length > 120) {
      error = "El nombre no puede superar 120 caracteres.";
    }
  }

  formErrors.value[field] = error;
  return error;
}

function validateForm() {
  const fields: ModelFormField[] = ["brand_id", "code", "name"];

  let hasErrors = false;
  fields.forEach((field) => {
    if (validateField(field)) {
      hasErrors = true;
    }
  });

  if (formErrors.value.code || formErrors.value.name) {
    const generalTab = document.getElementById("tab-model-general");
    if (generalTab) (generalTab as HTMLElement).click();
  } else if (formErrors.value.brand_id) {
    const relationTab = document.getElementById("tab-model-relaciones");
    if (relationTab) (relationTab as HTMLElement).click();
  }

  return hasErrors;
}

async function confirmDelete(model: ModelItem) {
  if (model.dependencies_count > 0) {
    await Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      text: "El modelo tiene productos asociados.",
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar modelo?",
    html: `<p class="mb-0">Estás por eliminar <strong>${model.name}</strong>.<br>Esta acción desactivará el registro.</p>`,
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
    await deleteModel(model.id);
    await Swal.fire({ icon: "success", title: "Modelo eliminado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar el modelo.";
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

#modelFormTabs .nav-link {
  font-size: .875rem;
  padding: .5rem .9rem;
}

.model-form-modal-body {
  overflow-x: hidden;
}

.model-form-tab-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.model-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.model-form-tabs .nav-link {
  white-space: normal;
  word-break: break-word;
}

.model-form-grid {
  min-width: 0;
}

.model-form-grid .col-md-6,
.model-form-grid .col-12 {
  min-width: 0;
}

.model-form-grid :deep(.relative),
.model-form-grid :deep(button),
.model-form-grid :deep(input),
.model-form-grid :deep(select) {
  max-width: 100%;
}

.field-help {
  margin-top: 0.45rem;
  font-size: 0.75rem;
  color: #64748b;
}

.field-error {
  margin-top: 0.35rem;
  margin-bottom: 0;
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 600;
}

.model-form-input-error {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 0.12rem rgba(220, 38, 38, 0.2);
}
</style>



