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
              <li class="breadcrumb-item active" aria-current="page">Categorías</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-tags me-2 text-brick-ember"></i>Gestión de Categorías
              </h1>
              <p class="text-secondary small mb-0">Administra las categorías disponibles para la empresa activa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nueva Categoría
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando categorías...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las categorías. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 460px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, nombre o descripción"
                    aria-label="Buscar categorías"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="categories-page-size"
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
                <table id="categoriesTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Nombre <i :class="sortIcon('name')"></i></button></th>
                      <th>Descripción</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('subcategories_count')">Subcategorías <i :class="sortIcon('subcategories_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('products_count')">Productos <i :class="sortIcon('products_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_active')">Estado <i :class="sortIcon('is_active')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="category in paginatedCategories" :key="category.id">
                      <td class="text-secondary small">{{ category.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ category.code }}</span></td>
                      <td class="fw-semibold">{{ category.name }}</td>
                      <td class="small">{{ category.description ?? '—' }}</td>
                      <td class="small">{{ category.subcategories_count }}</td>
                      <td class="small">{{ category.products_count }}</td>
                      <td>
                        <span class="badge rounded-pill" :class="category.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                          {{ category.is_active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(category.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button class="btn btn-sm btn-outline-info" @click="openViewModal(category)" title="Ver detalle" aria-label="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" @click="openEditModal(category)" title="Editar categoría" aria-label="Editar categoría">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="confirmDelete(category)"
                            :disabled="category.dependencies_count > 0"
                            :title="category.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar categoría'" :aria-label="category.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar categoría'"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedCategories.length === 0">
                      <td colspan="9" class="text-center text-secondary py-4">No se encontraron categorías para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredCategories.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación categorías">
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

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="categoryFormModal" tabindex="-1" aria-labelledby="categoryFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="categoryFormModalLabel">
            <i class="fa-solid fa-tags me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Categoría' : 'Nueva Categoría' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 category-form-modal-body">
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 category-form-tabs" id="categoryFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-category-general" data-bs-toggle="tab" data-bs-target="#panel-category-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-category-config" data-bs-toggle="tab" data-bs-target="#panel-category-config" type="button" role="tab">
                <i class="fa-solid fa-sliders me-1"></i>Configuración
              </button>
            </li>
          </ul>

          <div class="tab-content category-form-tab-content">
            <div class="tab-pane fade show active" id="panel-category-general" role="tabpanel">
              <div class="row g-3 category-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="category-code">Código <span class="text-danger">*</span></label>
                  <input
                    id="category-code"
                    v-model="form.code"
                    type="text"
                    :class="inputClass(formErrors.code)"
                    placeholder="CAT-001"
                    :disabled="isEditMode"
                    maxlength="40"
                    :aria-invalid="Boolean(formErrors.code)"
                    aria-describedby="category-code-help category-code-error"
                    @blur="validateField('code')"
                  />
                  <p id="category-code-help" class="field-help">Identificador interno único de la categoría.</p>
                  <p v-if="formErrors.code" id="category-code-error" class="field-error">{{ formErrors.code }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="category-name">Nombre <span class="text-danger">*</span></label>
                  <input
                    id="category-name"
                    v-model="form.name"
                    type="text"
                    :class="inputClass(formErrors.name)"
                    placeholder="Electrónica, Abarrotes, Ferretería..."
                    maxlength="120"
                    :aria-invalid="Boolean(formErrors.name)"
                    aria-describedby="category-name-help category-name-error"
                    @blur="validateField('name')"
                  />
                  <p id="category-name-help" class="field-help">Nombre visible de la categoría dentro del catálogo.</p>
                  <p v-if="formErrors.name" id="category-name-error" class="field-error">{{ formErrors.name }}</p>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="panel-category-config" role="tabpanel">
              <div class="row g-3 category-form-grid">
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="category-description">Descripción</label>
                  <textarea
                    id="category-description"
                    v-model="form.description"
                    :class="inputClass(formErrors.description)"
                    placeholder="Descripción breve del propósito de la categoría"
                    rows="4"
                    maxlength="255"
                    :aria-invalid="Boolean(formErrors.description)"
                    aria-describedby="category-description-help category-description-error"
                    @blur="validateField('description')"
                  />
                  <p id="category-description-help" class="field-help">Resumen opcional para clasificar productos y apoyar la navegación.</p>
                  <p v-if="formErrors.description" id="category-description-error" class="field-error">{{ formErrors.description }}</p>
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
                  <div class="form-check form-switch">
                    <input
                      v-model="form.is_active"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="switchCategoryActive"
                      style="width:2.5em;height:1.3em;"
                    />
                    <label class="form-check-label ms-2 fw-semibold" for="switchCategoryActive">
                      <span :class="form.is_active ? 'text-success' : 'text-secondary'">
                        {{ form.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </label>
                  </div>
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

  <div class="modal fade" id="categoryViewModal" tabindex="-1" aria-labelledby="categoryViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow" v-if="selectedCategory">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="categoryViewModalLabel">
            <i class="fa-solid fa-tags me-2 text-info"></i>Detalle de Categoría
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedCategory.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedCategory.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedCategory.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedCategory.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedCategory.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedCategory.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-tag" label="Nombre" :value="selectedCategory.name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-diagram-project" label="Subcategorías" :value="selectedCategory.subcategories_count" /></div>
            <div class="col-md-6"><DetailRow icon="fa-box" label="Productos" :value="selectedCategory.products_count" /></div>
            <div class="col-12"><DetailRow icon="fa-align-left" label="Descripción" :value="selectedCategory.description" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedCategory.created_at)" /></div>
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
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "../composables/useCategories";
import type { SelectOption } from "../components/CustomSelect.vue";
import type { CategoryItem } from "../services/category.service";
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

const { data, isLoading, isError } = useCategories();
const { mutateAsync: createCategory } = useCreateCategory();
const { mutateAsync: updateCategory } = useUpdateCategory();
const { mutateAsync: deleteCategory } = useDeleteCategory();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const categories = computed(() => data.value ?? []);
const selectedCategory = ref<CategoryItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "name" | "subcategories_count" | "products_count" | "is_active" | "created_at">("name");
const sortDirection = ref<"asc" | "desc">("asc");

const emptyForm = () => ({
  code: "",
  name: "",
  description: "",
  is_active: true
});

type CategoryFormField = keyof ReturnType<typeof emptyForm>;

const emptyFormErrors = () => ({
  code: "",
  name: "",
  description: "",
  is_active: ""
});

const form = ref(emptyForm());
const formErrors = ref(emptyFormErrors());

const pageSizeOptions: SelectOption[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 }
];

const filteredCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return categories.value;

  return categories.value.filter((c) => {
    const searchable = [
      String(c.id),
      c.code,
      c.name,
      c.description ?? "",
      c.is_active ? "activo" : "inactivo"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (c: CategoryItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(c.id);
    case "created_at":
      return c.created_at ? new Date(c.created_at).getTime() : 0;
    case "subcategories_count":
      return c.subcategories_count;
    case "products_count":
      return c.products_count;
    case "is_active":
      return c.is_active ? 1 : 0;
    default:
      return (c[key] ?? "").toString().toLowerCase();
  }
};

const sortedCategories = computed(() => {
  const list = [...filteredCategories.value];
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
const totalPages = computed(() => Math.max(1, Math.ceil(sortedCategories.value.length / pageSizeNumber.value)));
const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedCategories.value.slice(start, start + pageSizeNumber.value);
});

const paginationStart = computed(() => filteredCategories.value.length === 0 ? 0 : (currentPage.value - 1) * pageSizeNumber.value + 1);
const paginationEnd = computed(() => filteredCategories.value.length === 0 ? 0 : Math.min(currentPage.value * pageSizeNumber.value, filteredCategories.value.length));

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

  const firstTab = document.getElementById("tab-category-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

async function openEditModal(category: CategoryItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = category.id;
  form.value = {
    code: category.code,
    name: category.name,
    description: category.description ?? "",
    is_active: category.is_active
  };
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-category-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

function openViewModal(category: CategoryItem) {
  if (!isComponentActive) return;
  selectedCategory.value = category;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedCategory.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedCategory.value) return;
    void openEditModal(selectedCategory.value);
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
      await updateCategory({
        id: editingId.value,
        payload: {
          name: f.name,
          description: f.description || undefined,
          is_active: f.is_active
        }
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Categoría actualizada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } else {
      await createCategory({
        code: f.code,
        name: f.name,
        description: f.description || undefined,
        is_active: f.is_active
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Categoría creada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
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
    error ? "border-danger category-form-input-error" : "border-slate-300"
  ];
}

function validateField(field: CategoryFormField): string {
  const f = form.value;
  let error = "";

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

  if (field === "description" && f.description.length > 255) {
    error = "La descripción no puede superar 255 caracteres.";
  }

  formErrors.value[field] = error;
  return error;
}

function validateForm() {
  const fields: CategoryFormField[] = ["code", "name", "description"];

  let hasErrors = false;
  fields.forEach((field) => {
    if (validateField(field)) {
      hasErrors = true;
    }
  });

  if (formErrors.value.code || formErrors.value.name) {
    const generalTab = document.getElementById("tab-category-general");
    if (generalTab) (generalTab as HTMLElement).click();
  } else if (formErrors.value.description) {
    const configTab = document.getElementById("tab-category-config");
    if (configTab) (configTab as HTMLElement).click();
  }

  return hasErrors;
}

async function confirmDelete(category: CategoryItem) {
  if (category.dependencies_count > 0) {
    await Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      text: "La categoría tiene subcategorías o productos asociados.",
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar categoría?",
    html: `<p class="mb-0">Estás por eliminar <strong>${category.name}</strong>.<br>Esta acción desactivará el registro.</p>`,
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
    await deleteCategory(category.id);
    await Swal.fire({ icon: "success", title: "Categoría eliminada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar la categoría.";
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

#categoryFormTabs .nav-link {
  font-size: .875rem;
  padding: .5rem .9rem;
}

.category-form-modal-body {
  overflow-x: hidden;
}

.category-form-tab-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.category-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.category-form-tabs .nav-link {
  white-space: normal;
  word-break: break-word;
}

.category-form-grid {
  min-width: 0;
}

.category-form-grid .col-md-6,
.category-form-grid .col-12 {
  min-width: 0;
}

.category-form-grid :deep(.relative),
.category-form-grid :deep(button),
.category-form-grid :deep(input),
.category-form-grid :deep(select),
.category-form-grid :deep(textarea) {
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

.category-form-input-error {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 0.12rem rgba(220, 38, 38, 0.2);
}
</style>



