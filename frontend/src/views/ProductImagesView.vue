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
                <router-link to="/inventario" class="text-decoration-none text-secondary">Inventario</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Imágenes Productos</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-images me-2 text-brick-ember"></i>Gestión de Imágenes de Productos
              </h1>
              <p class="text-secondary small mb-0">Administra imágenes 200x200 por producto y empresa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nueva Imagen
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div class="row g-3 mb-3">
              <div class="col-md-6 col-lg-4">
                <CustomSelect
                  id="product-images-filter"
                  v-model="selectedProductId"
                  label="Filtrar por producto"
                  placeholder="Seleccionar producto"
                  :options="productFilterOptions"
                  :searchable="true"
                />
              </div>
            </div>

            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando imágenes de productos...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las imágenes. Intenta nuevamente.
            </div>

            <div v-else class="product-images-table-wrapper" ref="tableWrapperRef">
              <DataTable
                :key="tableRenderKey"
                :data="tableRows"
                :columns="tableColumns"
                :options="tableOptions"
                id="productImagesTable"
                class="table table-hover align-middle table-striped w-100"
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vista</th>
                    <th>Producto</th>
                    <th>Propósito</th>
                    <th>Orden</th>
                    <th>Principal</th>
                    <th>Estado</th>
                    <th>Creado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
              </DataTable>
            </div>
          </div>
        </div>
      </main>

      <DashFooter />
    </div>
  </div>

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="productImageFormModal" tabindex="-1" aria-labelledby="productImageFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="productImageFormModalLabel">
            <i class="fa-solid fa-images me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Imagen de Producto' : 'Nueva Imagen de Producto' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body pt-3 product-image-form-modal-body">
          <div class="row g-3 product-image-form-grid">
            <div class="col-md-8">
              <CustomSelect
                id="form-product-id"
                v-model="form.product_id"
                label="Producto *"
                placeholder="Seleccionar producto"
                :options="formProductOptions"
                :searchable="true"
                :disabled="isEditMode"
              />
            </div>

            <div class="col-md-4">
              <CustomSelect
                id="form-purpose"
                v-model="form.purpose"
                label="Propósito *"
                placeholder="Seleccionar propósito"
                :options="purposeOptions"
                :searchable="false"
              />
            </div>

            <div class="col-md-4">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Orden</label>
              <NumberStepper
                v-model="form.sort_order"
                :min="1"
                input-class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white number-stepper-input"
                placeholder="Ej: 1"
              />
            </div>

            <div class="col-md-8">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Texto alternativo</label>
              <input
                v-model="form.alt_text"
                type="text"
                maxlength="255"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Descripción breve para accesibilidad"
              />
            </div>

            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Archivo de imagen {{ isEditMode ? '' : '*' }}</label>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/png,image/jpeg"
                class="form-control"
                @change="onFileSelected"
              />
              <small class="text-secondary">Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB. Se redimensiona a 200x200.</small>
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Principal</label>
              <div class="form-check form-switch">
                <input
                  v-model="form.is_primary"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchImagePrimary"
                  style="width:2.5em;height:1.3em;"
                />
                <label class="form-check-label ms-2 fw-semibold" for="switchImagePrimary">
                  <span :class="form.is_primary ? 'text-success' : 'text-secondary'">
                    {{ form.is_primary ? 'Sí, imagen principal' : 'No principal' }}
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
                  id="switchImageActive"
                  style="width:2.5em;height:1.3em;"
                />
                <label class="form-check-label ms-2 fw-semibold" for="switchImageActive">
                  <span :class="form.is_active ? 'text-success' : 'text-secondary'">
                    {{ form.is_active ? 'Activa' : 'Inactiva' }}
                  </span>
                </label>
              </div>
            </div>

            <div class="col-12" v-if="previewImageUrl">
              <p class="text-sm font-medium text-ink-black-700 mb-2">Vista previa</p>
              <div class="border rounded-3 p-3 d-inline-flex align-items-center justify-content-center bg-light" style="width:220px;height:220px;">
                <img :src="previewImageUrl" alt="Vista previa" class="img-fluid rounded-3" style="max-width:200px;max-height:200px;object-fit:cover;" />
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

  <div class="modal fade" id="productImageViewModal" tabindex="-1" aria-labelledby="productImageViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedItem">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="productImageViewModalLabel">
            <i class="fa-solid fa-images me-2 text-info"></i>Detalle de Imagen
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body pt-0">
          <div class="row g-3 align-items-center mb-4">
            <div class="col-md-4 text-center">
              <div class="border rounded-3 p-2 bg-light d-inline-flex align-items-center justify-content-center" style="width:220px;height:220px;">
                <img :src="resolveImageUrl(selectedItem.image_url)" alt="Detalle" class="img-fluid rounded-3" style="max-width:200px;max-height:200px;object-fit:cover;" />
              </div>
            </div>
            <div class="col-md-8">
              <p class="fw-bold mb-1">{{ selectedItem.product_name ?? 'Producto' }}</p>
              <p class="text-secondary small mb-2">SKU: {{ selectedItem.product_sku ?? '—' }}</p>
              <span class="badge rounded-pill me-1" :class="selectedItem.is_primary ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedItem.is_primary ? 'Principal' : 'Secundaria' }}
              </span>
              <span class="badge rounded-pill" :class="selectedItem.is_active ? 'text-bg-primary' : 'text-bg-light text-secondary border'">
                {{ selectedItem.is_active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-hashtag" label="ID" :value="selectedItem.id" /></div>
            <div class="col-md-6"><DetailRow icon="fa-layer-group" label="Propósito" :value="selectedItem.purpose" /></div>
            <div class="col-md-6"><DetailRow icon="fa-sort-numeric-down" label="Orden" :value="selectedItem.sort_order" /></div>
            <div class="col-md-6"><DetailRow icon="fa-align-left" label="Alt Text" :value="selectedItem.alt_text" /></div>
            <div class="col-md-6"><DetailRow icon="fa-file-image" label="Archivo" :value="selectedItem.original_filename" /></div>
            <div class="col-md-6"><DetailRow icon="fa-weight-hanging" label="Tamaño (bytes)" :value="selectedItem.size_bytes" /></div>
            <div class="col-md-6"><DetailRow icon="fa-expand" label="Dimensiones" :value="formatDimensions(selectedItem.width_px, selectedItem.height_px)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedItem.created_at)" /></div>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { Modal } from "bootstrap";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-bs5";
import type { Config } from "datatables.net";
import Swal from "sweetalert2";

import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import CustomSelect from "../components/CustomSelect.vue";
import NumberStepper from "../components/NumberStepper.vue";
import { useProducts } from "../composables/useProducts";
import {
  useProductImages,
  useCreateProductImage,
  useUpdateProductImage,
  useDeleteProductImage
} from "../composables/useProductImages";
import type { ProductImageItem, ProductImagePayload } from "../services/product-image.service";
import type { SelectOption } from "../components/CustomSelect.vue";
import { formatDate } from "../utils/datetime";

DataTable.use(DataTablesCore);

const apiRoot = (import.meta.env.VITE_API_URL ?? "http://localhost:3000/api").replace(/\/api\/?$/, "");

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
const selectedProductId = ref("all");
const queryFilters = computed(() => selectedProductId.value === "all" ? undefined : ({ product_id: selectedProductId.value }));

const { data: productsData } = useProducts();
const { data, isLoading, isError } = useProductImages(queryFilters);
const { mutateAsync: createProductImage } = useCreateProductImage();
const { mutateAsync: updateProductImage } = useUpdateProductImage();
const { mutateAsync: deleteProductImage } = useDeleteProductImage();

const items = computed(() => data.value ?? []);
const products = computed(() => productsData.value ?? []);

const productFilterOptions = computed<SelectOption[]>(() => ([
  { label: "Todos los productos", value: "all" },
  ...products.value.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id }))
]));

const formProductOptions = computed<SelectOption[]>(() => (
  products.value.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id }))
));

const purposeOptions: SelectOption[] = [
  { label: "PRIMARY", value: "PRIMARY" },
  { label: "GALLERY", value: "GALLERY" },
  { label: "THUMBNAIL", value: "THUMBNAIL" },
  { label: "DETAIL", value: "DETAIL" },
  { label: "PACKAGING", value: "PACKAGING" }
];

const tableWrapperRef = ref<HTMLElement | null>(null);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let dynamicPreviewObjectUrl: string | null = null;

const selectedItem = ref<ProductImageItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);

const emptyForm = () => ({
  product_id: "",
  purpose: "GALLERY" as ProductImageItem["purpose"],
  alt_text: "",
  sort_order: undefined as number | undefined,
  is_primary: false,
  is_active: true,
  image: null as File | null
});

const form = ref(emptyForm());
const previewImageUrl = ref<string | null>(null);

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

const resolveImageUrl = (url: string | null) => {
  if (!url) {
    return "https://placehold.co/200x200?text=Sin+Imagen";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${apiRoot}${url}`;
};

const formatDimensions = (width: number | null, height: number | null) => {
  if (!width || !height) return "—";
  return `${width}x${height}`;
};

const buildActionButtons = (item: ProductImageItem) => `
  <div class="d-flex gap-1 justify-content-center">
    <button type="button" class="btn btn-sm btn-outline-info rounded-3 px-2" data-action="view" data-id="${item.id}" title="Ver detalle">
      <i class="fa-solid fa-eye"></i>
    </button>
    <button type="button" class="btn btn-sm btn-outline-warning rounded-3 px-2" data-action="edit" data-id="${item.id}" title="Editar imagen">
      <i class="fa-solid fa-pen-to-square"></i>
    </button>
    <button type="button" class="btn btn-sm btn-outline-danger rounded-3 px-2" data-action="delete" data-id="${item.id}" title="Eliminar imagen">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>
`;

const tableRows = computed(() => items.value.map((item) => ({
  id: item.id,
  preview: `
    <div class="d-flex justify-content-center">
      <img src="${escapeHtml(resolveImageUrl(item.image_url))}" alt="${escapeHtml(item.alt_text ?? item.product_name ?? "Imagen")}" style="width:52px;height:52px;object-fit:cover;border-radius:0.5rem;" />
    </div>
  `,
  product: `<div><p class="fw-semibold mb-0">${escapeHtml(item.product_name ?? "—")}</p><p class="small text-secondary mb-0">${escapeHtml(item.product_sku ?? "—")}</p></div>`,
  purpose: `<span class="badge bg-primary-subtle text-primary">${escapeHtml(item.purpose)}</span>`,
  sort_order: item.sort_order,
  is_primary: item.is_primary
    ? '<span class="badge text-bg-success">Sí</span>'
    : '<span class="badge text-bg-secondary">No</span>',
  is_active: item.is_active
    ? '<span class="badge text-bg-primary">Activa</span>'
    : '<span class="badge text-bg-light text-secondary border">Inactiva</span>',
  created_at: formatDate(item.created_at),
  actions: buildActionButtons(item)
})));

const tableColumns = [
  { title: "ID", data: "id" },
  { title: "Vista", data: "preview", orderable: false },
  { title: "Producto", data: "product" },
  { title: "Propósito", data: "purpose" },
  { title: "Orden", data: "sort_order" },
  { title: "Principal", data: "is_primary" },
  { title: "Estado", data: "is_active" },
  { title: "Creado", data: "created_at" },
  { title: "Acción", data: "actions", orderable: false, searchable: false, className: "text-center" }
];

const tableOptions: Config = {
  language: {
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    zeroRecords: "No se encontraron imágenes",
    paginate: {
      first: "Primero",
      last: "Último",
      next: "Siguiente",
      previous: "Anterior"
    }
  },
  pageLength: 10,
  lengthMenu: [5, 10, 25, 50],
  order: [[7, "desc"]],
  autoWidth: false
};

const tableRenderKey = computed(() => items.value.map((item) => `${item.id}-${item.updated_at}`).join("|"));

const clearDynamicPreview = () => {
  if (dynamicPreviewObjectUrl) {
    URL.revokeObjectURL(dynamicPreviewObjectUrl);
    dynamicPreviewObjectUrl = null;
  }
};

const resetForm = () => {
  clearDynamicPreview();
  form.value = emptyForm();
  previewImageUrl.value = null;
  isEditMode.value = false;
  editingId.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const openCreateModal = async () => {
  if (!isComponentActive) return;
  resetForm();

  if (selectedProductId.value !== "all") {
    form.value.product_id = selectedProductId.value;
  }

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
};

const openEditModal = async (item: ProductImageItem) => {
  if (!isComponentActive) return;

  clearDynamicPreview();
  isEditMode.value = true;
  editingId.value = item.id;
  form.value = {
    product_id: item.product_id,
    purpose: item.purpose,
    alt_text: item.alt_text ?? "",
    sort_order: item.sort_order,
    is_primary: item.is_primary,
    is_active: item.is_active,
    image: null
  };
  previewImageUrl.value = resolveImageUrl(item.image_url);

  await nextTick();
  if (!isComponentActive) return;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  formModalInstance?.show();
};

const openViewModal = async (item: ProductImageItem) => {
  if (!isComponentActive) return;
  selectedItem.value = item;

  await nextTick();
  if (!isComponentActive) return;
  viewModalInstance?.show();
};

const openEditFromView = async () => {
  if (!isComponentActive || !selectedItem.value) return;
  viewModalInstance?.hide();
  await nextTick();
  if (!isComponentActive || !selectedItem.value) return;
  void openEditModal(selectedItem.value);
};

const validateImageFile = (file: File) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Formato inválido. Solo se permiten JPG y PNG");
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("La imagen supera el máximo de 5MB");
  }
};

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;

  if (!file) {
    form.value.image = null;
    return;
  }

  try {
    validateImageFile(file);
    form.value.image = file;

    clearDynamicPreview();
    dynamicPreviewObjectUrl = URL.createObjectURL(file);
    previewImageUrl.value = dynamicPreviewObjectUrl;
  } catch (error) {
    form.value.image = null;
    input.value = "";
    void Swal.fire({
      icon: "warning",
      title: "Archivo inválido",
      text: error instanceof Error ? error.message : "No fue posible procesar el archivo"
    });
  }
};

const submitForm = async () => {
  try {
    if (!form.value.product_id) {
      throw new Error("Debe seleccionar un producto");
    }

    if (!isEditMode.value && !form.value.image) {
      throw new Error("Debe adjuntar una imagen");
    }

    if (form.value.image) {
      validateImageFile(form.value.image);
    }

    isSaving.value = true;

    const payload: ProductImagePayload = {
      purpose: form.value.purpose,
      alt_text: form.value.alt_text.trim() || undefined,
      sort_order: form.value.sort_order,
      is_primary: form.value.is_primary,
      is_active: form.value.is_active,
      ...(form.value.image && { image: form.value.image })
    };

    if (isEditMode.value && editingId.value) {
      await updateProductImage({ id: editingId.value, payload });
      await Swal.fire({ icon: "success", title: "Imagen actualizada", timer: 1500, showConfirmButton: false });
    } else {
      await createProductImage({
        product_id: form.value.product_id,
        image: form.value.image as File,
        ...payload
      });
      await Swal.fire({ icon: "success", title: "Imagen creada", timer: 1500, showConfirmButton: false });
    }

    formModalInstance?.hide();
    resetForm();
  } catch (error) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      ?? (error instanceof Error ? error.message : "No fue posible guardar la imagen");

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (item: ProductImageItem) => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Eliminar imagen",
    text: `¿Deseas eliminar la imagen #${item.id} del producto ${item.product_name ?? "seleccionado"}?`,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    confirmButtonColor: "#b91c1c"
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await deleteProductImage(item.id);
    await Swal.fire({ icon: "success", title: "Imagen eliminada", timer: 1400, showConfirmButton: false });
  } catch (error) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      ?? "No fue posible eliminar la imagen";
    await Swal.fire({ icon: "error", title: "Error", text: message });
  }
};

const onTableClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const button = target.closest("button[data-action][data-id]") as HTMLButtonElement | null;
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!action || !id) return;

  const item = items.value.find((entry) => entry.id === id);
  if (!item) return;

  if (action === "view") {
    void openViewModal(item);
    return;
  }

  if (action === "edit") {
    void openEditModal(item);
    return;
  }

  if (action === "delete") {
    void confirmDelete(item);
  }
};

onMounted(() => {
  if (formModalRef.value) {
    formModalInstance = Modal.getOrCreateInstance(formModalRef.value);
  }

  if (viewModalRef.value) {
    viewModalInstance = Modal.getOrCreateInstance(viewModalRef.value);
  }

  tableWrapperRef.value?.addEventListener("click", onTableClick);
});

onBeforeUnmount(() => {
  isComponentActive = false;

  tableWrapperRef.value?.removeEventListener("click", onTableClick);
  clearDynamicPreview();

  formModalInstance?.hide();
  viewModalInstance?.hide();
  formModalInstance?.dispose();
  viewModalInstance?.dispose();
  formModalInstance = null;
  viewModalInstance = null;
});
</script>

<style scoped>
.text-brick-ember { color: #d44c2b; }

#productImagesTable td,
#productImagesTable th {
  vertical-align: middle;
}

.product-image-form-modal-body {
  max-height: 70vh;
  overflow-x: hidden;
}

.product-image-form-grid {
  margin-left: 0;
  margin-right: 0;
}

.product-images-table-wrapper :deep(.dataTables_filter input),
.product-images-table-wrapper :deep(.dataTables_length select) {
  border-radius: 0.5rem;
}

.product-images-table-wrapper :deep(table.dataTable tbody td) {
  vertical-align: middle;
}

@media (max-width: 767.98px) {
  .product-image-form-grid > [class*="col-"] {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
