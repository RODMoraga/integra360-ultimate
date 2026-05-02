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
              <li class="breadcrumb-item active" aria-current="page">Variantes de Producto</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-box-open me-2 text-brick-ember"></i>Gestión de Variantes de Producto
              </h1>
              <p class="text-secondary small mb-0">Administra variantes comerciales por producto dentro de la empresa activa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nueva Variante
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando variantes...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las variantes. Intenta nuevamente.
            </div>

            <div v-else class="variants-table-wrapper" ref="tableWrapperRef">
              <DataTable
                :key="tableRenderKey"
                :data="tableRows"
                :columns="tableColumns"
                :options="tableOptions"
                id="productVariantsTable"
                class="table table-hover align-middle table-striped w-100"
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código Variante</th>
                    <th>Nombre</th>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Código Barras</th>
                    <th>Costo</th>
                    <th>Venta</th>
                    <th>Estado</th>
                    <th>Dependencias</th>
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

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="productVariantFormModal" tabindex="-1" aria-labelledby="productVariantFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="productVariantFormModalLabel">
            <i class="fa-solid fa-box-open me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Variante de Producto' : 'Nueva Variante de Producto' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body pt-3 variant-form-modal-body">
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 variant-form-tabs" id="variantFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-variant-general" data-bs-toggle="tab" data-bs-target="#panel-variant-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-variant-comercial" data-bs-toggle="tab" data-bs-target="#panel-variant-comercial" type="button" role="tab">
                <i class="fa-solid fa-tag me-1"></i>Comercial
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-variant-config" data-bs-toggle="tab" data-bs-target="#panel-variant-config" type="button" role="tab">
                <i class="fa-solid fa-sliders me-1"></i>Configuración
              </button>
            </li>
          </ul>

          <div class="tab-content variant-form-tab-content">
            <div class="tab-pane fade show active" id="panel-variant-general" role="tabpanel">
              <div class="row g-3 variant-form-grid">
                <div class="col-12">
                  <CustomSelect
                    id="variant-product"
                    v-model="form.product_id"
                    label="Producto"
                    placeholder="Seleccionar producto"
                    :options="productOptions"
                    :searchable="true"
                    :error="formErrors.product_id"
                    helper-text="Cada variante pertenece a un producto base."
                    :disabled="isEditMode"
                    @change="validateField('product_id')"
                  />
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="variant-code">Código Variante <span class="text-danger">*</span></label>
                  <input
                    id="variant-code"
                    v-model="form.variant_code"
                    type="text"
                    :class="inputClass(formErrors.variant_code)"
                    placeholder="VAR-001"
                    :disabled="isEditMode"
                    maxlength="60"
                    :aria-invalid="Boolean(formErrors.variant_code)"
                    @blur="validateField('variant_code')"
                  />
                  <p class="field-help">Identificador único de la variante dentro de la empresa.</p>
                  <p v-if="formErrors.variant_code" class="field-error">{{ formErrors.variant_code }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="variant-name">Nombre <span class="text-danger">*</span></label>
                  <input
                    id="variant-name"
                    v-model="form.name"
                    type="text"
                    :class="inputClass(formErrors.name)"
                    placeholder="Variante comercial"
                    maxlength="180"
                    :aria-invalid="Boolean(formErrors.name)"
                    @blur="validateField('name')"
                  />
                  <p class="field-help">Nombre visible en operaciones y documentos.</p>
                  <p v-if="formErrors.name" class="field-error">{{ formErrors.name }}</p>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="panel-variant-comercial" role="tabpanel">
              <div class="row g-3 variant-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="variant-sku">SKU</label>
                  <input
                    id="variant-sku"
                    v-model="form.sku"
                    type="text"
                    :class="inputClass(formErrors.sku)"
                    placeholder="SKU variante"
                    maxlength="60"
                    :aria-invalid="Boolean(formErrors.sku)"
                    @blur="validateField('sku')"
                  />
                  <p class="field-help">Opcional. Debe ser único por empresa si se informa.</p>
                  <p v-if="formErrors.sku" class="field-error">{{ formErrors.sku }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="variant-barcode">Código de Barras</label>
                  <input
                    id="variant-barcode"
                    v-model="form.barcode"
                    type="text"
                    :class="inputClass(formErrors.barcode)"
                    placeholder="7800000000000"
                    maxlength="80"
                    :aria-invalid="Boolean(formErrors.barcode)"
                    @blur="validateField('barcode')"
                  />
                  <p class="field-help">Opcional. EAN/UPC u otro identificador.</p>
                  <p v-if="formErrors.barcode" class="field-error">{{ formErrors.barcode }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="variant-cost">Precio Costo</label>
                  <NumberStepper
                    id="variant-cost"
                    v-model="form.cost_price"
                    :step="0.0001"
                    :min="0"
                    :input-class="`${inputClass(formErrors.cost_price)} number-stepper-input`"
                    placeholder="0.0000"
                    :aria-invalid="Boolean(formErrors.cost_price)"
                    @blur="validateField('cost_price')"
                  />
                  <p v-if="formErrors.cost_price" class="field-error">{{ formErrors.cost_price }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="variant-sale">Precio Venta</label>
                  <NumberStepper
                    id="variant-sale"
                    v-model="form.sale_price"
                    :step="0.0001"
                    :min="0"
                    :input-class="`${inputClass(formErrors.sale_price)} number-stepper-input`"
                    placeholder="0.0000"
                    :aria-invalid="Boolean(formErrors.sale_price)"
                    @blur="validateField('sale_price')"
                  />
                  <p v-if="formErrors.sale_price" class="field-error">{{ formErrors.sale_price }}</p>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="panel-variant-config" role="tabpanel">
              <div class="row g-3 variant-form-grid">
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="variant-attributes">Atributos (JSON)</label>
                  <textarea
                    id="variant-attributes"
                    v-model="form.attributes_json"
                    :class="inputClass(formErrors.attributes_json)"
                    rows="5"
                    style="resize: vertical;"
                    placeholder='{"color":"negro","talla":"L"}'
                    :aria-invalid="Boolean(formErrors.attributes_json)"
                    @blur="validateField('attributes_json')"
                  ></textarea>
                  <p class="field-help">Estructura JSON opcional para atributos dinámicos de la variante.</p>
                  <p v-if="formErrors.attributes_json" class="field-error">{{ formErrors.attributes_json }}</p>
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
                  <div class="form-check form-switch">
                    <input
                      v-model="form.is_active"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="switchVariantActive"
                      style="width:2.5em;height:1.3em;"
                    />
                    <label class="form-check-label ms-2 fw-semibold" for="switchVariantActive">
                      <span :class="form.is_active ? 'text-success' : 'text-secondary'">
                        {{ form.is_active ? 'Activa' : 'Inactiva' }}
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

  <div class="modal fade" id="productVariantViewModal" tabindex="-1" aria-labelledby="productVariantViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedVariant">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="productVariantViewModalLabel">
            <i class="fa-solid fa-box-open me-2 text-info"></i>Detalle de Variante
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.1rem;">
              <i class="fa-solid fa-box-open"></i>
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedVariant.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedVariant.variant_code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedVariant.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedVariant.is_active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código Variante" :value="selectedVariant.variant_code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-tag" label="Nombre" :value="selectedVariant.name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-box" label="Producto" :value="selectedVariant.product_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-layer-group" label="SKU Producto" :value="selectedVariant.product_sku" /></div>
            <div class="col-md-6"><DetailRow icon="fa-hashtag" label="SKU Variante" :value="selectedVariant.sku" /></div>
            <div class="col-md-6"><DetailRow icon="fa-upc" label="Código de Barras" :value="selectedVariant.barcode" /></div>
            <div class="col-md-6"><DetailRow icon="fa-dollar-sign" label="Precio Costo" :value="formatPrice(selectedVariant.cost_price)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-money-bill-wave" label="Precio Venta" :value="formatPrice(selectedVariant.sale_price)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-diagram-project" label="Dependencias" :value="String(selectedVariant.dependencies_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedVariant.created_at)" /></div>
            <div class="col-12">
              <p class="text-secondary small mb-1">Atributos JSON</p>
              <pre class="bg-light border rounded-3 p-3 small mb-0 variant-json-preview">{{ formatAttributesForPreview(selectedVariant.attributes_json) }}</pre>
            </div>
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
import {
  useCreateProductVariant,
  useDeleteProductVariant,
  useProductVariantProducts,
  useProductVariants,
  useUpdateProductVariant
} from "../composables/useProductVariants";
import type { ProductVariantItem } from "../services/product-variant.service";
import type { SelectOption } from "../components/CustomSelect.vue";
import { formatDate } from "../utils/datetime";

DataTable.use(DataTablesCore);

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

const { data, isLoading, isError } = useProductVariants();
const { data: productsData } = useProductVariantProducts();
const { mutateAsync: createProductVariant } = useCreateProductVariant();
const { mutateAsync: updateProductVariant } = useUpdateProductVariant();
const { mutateAsync: deleteProductVariant } = useDeleteProductVariant();

const variants = computed(() => data.value ?? []);
const products = computed(() => productsData.value ?? []);

const sidebarOpen = ref(false);
const tableWrapperRef = ref<HTMLElement | null>(null);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;

const selectedVariant = ref<ProductVariantItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);

const emptyForm = () => ({
  product_id: "" as string | number,
  variant_code: "",
  name: "",
  sku: "",
  barcode: "",
  attributes_json: "",
  cost_price: 0,
  sale_price: 0,
  is_active: true
});

type VariantFormField = keyof ReturnType<typeof emptyForm>;

const emptyFormErrors = () => ({
  product_id: "",
  variant_code: "",
  name: "",
  sku: "",
  barcode: "",
  attributes_json: "",
  cost_price: "",
  sale_price: "",
  is_active: ""
});

const form = ref(emptyForm());
const formErrors = ref(emptyFormErrors());

const productOptions = computed<SelectOption[]>(() => {
  return products.value.map((product) => ({
    value: Number(product.id),
    label: `${product.name} (${product.sku})`
  }));
});

const tableRenderKey = computed(() => variants.value.map((item) => `${item.id}-${item.updated_at}`).join("|"));

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

const formatPrice = (value: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 2
  }).format(Number(value));
};

const formatAttributesForPreview = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const buildActionButtons = (variant: ProductVariantItem) => {
  const disabledDelete = variant.dependencies_count > 0;
  const deleteTitle = disabledDelete ? "No se puede eliminar: tiene dependencias" : "Eliminar variante";

  return `
    <div class="d-flex gap-1 justify-content-center">
      <button type="button" class="btn btn-sm btn-outline-info rounded-3 px-2" data-action="view" data-id="${variant.id}" title="Ver detalle">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button type="button" class="btn btn-sm btn-outline-warning rounded-3 px-2" data-action="edit" data-id="${variant.id}" title="Editar variante">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button type="button" class="btn btn-sm btn-outline-danger rounded-3 px-2" data-action="delete" data-id="${variant.id}" title="${deleteTitle}" ${disabledDelete ? "disabled" : ""}>
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;
};

const tableRows = computed(() => variants.value.map((variant) => ({
  id: variant.id,
  variant_code: `<span class="badge bg-secondary-subtle text-secondary fw-semibold">${escapeHtml(variant.variant_code)}</span>`,
  name: `<span class="fw-semibold">${escapeHtml(variant.name)}</span>`,
  product_name: `<div><p class="fw-semibold mb-0">${escapeHtml(variant.product_name ?? "—")}</p><p class="small text-secondary mb-0">${escapeHtml(variant.product_sku ?? "—")}</p></div>`,
  sku: variant.sku ? escapeHtml(variant.sku) : "—",
  barcode: variant.barcode ? escapeHtml(variant.barcode) : "—",
  cost_price: formatPrice(variant.cost_price),
  sale_price: formatPrice(variant.sale_price),
  is_active: variant.is_active
    ? '<span class="badge bg-success-subtle text-success">Activa</span>'
    : '<span class="badge bg-secondary-subtle text-secondary">Inactiva</span>',
  dependencies_count: `<span class="badge bg-light text-dark border">${variant.dependencies_count}</span>`,
  created_at: formatDate(variant.created_at),
  actions: buildActionButtons(variant)
})));

const tableColumns = [
  { title: "ID", data: "id" },
  { title: "Código Variante", data: "variant_code" },
  { title: "Nombre", data: "name" },
  { title: "Producto", data: "product_name" },
  { title: "SKU", data: "sku" },
  { title: "Código Barras", data: "barcode" },
  { title: "Costo", data: "cost_price" },
  { title: "Venta", data: "sale_price" },
  { title: "Estado", data: "is_active" },
  { title: "Dependencias", data: "dependencies_count" },
  { title: "Creado", data: "created_at" },
  { title: "Acción", data: "actions", orderable: false, searchable: false, className: "text-center" }
];

const tableOptions: Config = {
  language: {
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    zeroRecords: "No se encontraron variantes",
    paginate: {
      first: "Primero",
      last: "Último",
      next: "Siguiente",
      previous: "Anterior"
    }
  },
  pageLength: 10,
  lengthMenu: [5, 10, 25, 50],
  order: [[10, "desc"]],
  autoWidth: false
};

const resetForm = () => {
  form.value = emptyForm();
  formErrors.value = emptyFormErrors();
  isEditMode.value = false;
  editingId.value = null;
};

const parseAttributesField = () => {
  const raw = form.value.attributes_json.trim();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Atributos JSON no válido");
  }
};

function inputClass(error: string) {
  return [
    "w-full px-4 py-2.5 rounded-lg border focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white",
    error ? "border-danger variant-form-input-error" : "border-slate-300"
  ];
}

function validateField(field: VariantFormField): string {
  const f = form.value;
  let error = "";

  if (field === "product_id" && !f.product_id) {
    error = "El producto es obligatorio.";
  }

  if (field === "variant_code") {
    if (!isEditMode.value && !f.variant_code.trim()) {
      error = "El código de variante es obligatorio.";
    } else if (f.variant_code.length > 60) {
      error = "El código no puede superar 60 caracteres.";
    }
  }

  if (field === "name") {
    if (!f.name.trim()) {
      error = "El nombre es obligatorio.";
    } else if (f.name.length > 180) {
      error = "El nombre no puede superar 180 caracteres.";
    }
  }

  if (field === "sku" && f.sku.length > 60) {
    error = "El SKU no puede superar 60 caracteres.";
  }

  if (field === "barcode" && f.barcode.length > 80) {
    error = "El código de barras no puede superar 80 caracteres.";
  }

  if (field === "cost_price" && (f.cost_price < 0 || Number.isNaN(Number(f.cost_price)))) {
    error = "El precio costo debe ser mayor o igual a 0.";
  }

  if (field === "sale_price" && (f.sale_price < 0 || Number.isNaN(Number(f.sale_price)))) {
    error = "El precio venta debe ser mayor o igual a 0.";
  }

  if (field === "attributes_json" && f.attributes_json.trim()) {
    try {
      JSON.parse(f.attributes_json);
    } catch {
      error = "Debe ser un JSON válido.";
    }
  }

  formErrors.value[field] = error;
  return error;
}

function validateForm() {
  const fields: VariantFormField[] = [
    "product_id",
    "variant_code",
    "name",
    "sku",
    "barcode",
    "attributes_json",
    "cost_price",
    "sale_price"
  ];

  let hasErrors = false;
  fields.forEach((field) => {
    if (validateField(field)) {
      hasErrors = true;
    }
  });

  if (formErrors.value.product_id || formErrors.value.variant_code || formErrors.value.name) {
    const generalTab = document.getElementById("tab-variant-general");
    if (generalTab) {
      (generalTab as HTMLElement).click();
    }
  } else if (formErrors.value.sku || formErrors.value.barcode || formErrors.value.cost_price || formErrors.value.sale_price) {
    const commercialTab = document.getElementById("tab-variant-comercial");
    if (commercialTab) {
      (commercialTab as HTMLElement).click();
    }
  } else if (formErrors.value.attributes_json) {
    const configTab = document.getElementById("tab-variant-config");
    if (configTab) {
      (configTab as HTMLElement).click();
    }
  }

  return hasErrors;
}

async function openCreateModal() {
  if (!isComponentActive) {
    return;
  }

  resetForm();

  await nextTick();
  if (!isComponentActive) {
    return;
  }

  const firstTab = document.getElementById("tab-variant-general");
  if (firstTab) {
    (firstTab as HTMLElement).click();
  }
  formModalInstance?.show();
}

async function openEditModal(variant: ProductVariantItem) {
  if (!isComponentActive) {
    return;
  }

  isEditMode.value = true;
  editingId.value = variant.id;
  form.value = {
    product_id: Number(variant.product_id),
    variant_code: variant.variant_code,
    name: variant.name,
    sku: variant.sku ?? "",
    barcode: variant.barcode ?? "",
    attributes_json: variant.attributes_json ? JSON.stringify(variant.attributes_json, null, 2) : "",
    cost_price: variant.cost_price,
    sale_price: variant.sale_price,
    is_active: variant.is_active
  };
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) {
    return;
  }

  const firstTab = document.getElementById("tab-variant-general");
  if (firstTab) {
    (firstTab as HTMLElement).click();
  }
  formModalInstance?.show();
}

async function openViewModal(variant: ProductVariantItem) {
  if (!isComponentActive) {
    return;
  }

  selectedVariant.value = variant;

  await nextTick();
  if (!isComponentActive) {
    return;
  }

  viewModalInstance?.show();
}

async function openEditFromView() {
  if (!isComponentActive || !selectedVariant.value) {
    return;
  }

  viewModalInstance?.hide();
  await nextTick();
  if (!isComponentActive || !selectedVariant.value) {
    return;
  }

  void openEditModal(selectedVariant.value);
}

async function submitForm() {
  const hasErrors = validateForm();
  if (hasErrors) {
    await Swal.fire({
      icon: "warning",
      title: "Validación",
      text: "Revisa los campos resaltados para continuar.",
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
    });
    return;
  }

  isSaving.value = true;
  try {
    const attributes = parseAttributesField();

    if (isEditMode.value && editingId.value) {
      await updateProductVariant({
        id: editingId.value,
        payload: {
          name: form.value.name.trim(),
          sku: form.value.sku.trim() || null,
          barcode: form.value.barcode.trim() || null,
          attributes_json: attributes,
          cost_price: Number(form.value.cost_price),
          sale_price: Number(form.value.sale_price),
          is_active: form.value.is_active
        }
      });

      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Variante actualizada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    } else {
      await createProductVariant({
        product_id: Number(form.value.product_id),
        variant_code: form.value.variant_code.trim(),
        name: form.value.name.trim(),
        sku: form.value.sku.trim() || null,
        barcode: form.value.barcode.trim() || null,
        attributes_json: attributes,
        cost_price: Number(form.value.cost_price),
        sale_price: Number(form.value.sale_price),
        is_active: form.value.is_active
      });

      formModalInstance?.hide();
      await Swal.fire({
        icon: "success",
        title: "Variante creada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error
      ? err.message
      : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ocurrió un error inesperado.";

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-primary rounded-3 px-4" }
    });
  } finally {
    isSaving.value = false;
  }
}

async function confirmDelete(variant: ProductVariantItem) {
  if (variant.dependencies_count > 0) {
    await Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      text: "La variante tiene dependencias asociadas.",
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar variante?",
    html: `<p class="mb-0">Estás por eliminar <strong>${escapeHtml(variant.name)}</strong>.<br>Esta acción desactivará el registro.</p>`,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-trash me-2"></i>Sí, eliminar',
    cancelButtonText: "Cancelar",
    customClass: {
      confirmButton: "btn btn-danger rounded-3 px-4",
      cancelButton: "btn btn-light rounded-3 px-4 ms-2"
    },
    buttonsStyling: false
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await deleteProductVariant(variant.id);
    await Swal.fire({
      icon: "success",
      title: "Variante eliminada",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      ?? "No fue posible eliminar la variante.";

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      confirmButtonText: "Cerrar",
      customClass: { confirmButton: "btn btn-primary rounded-3 px-4" }
    });
  }
}

const onTableClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const button = target.closest("button[data-action][data-id]") as HTMLButtonElement | null;
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!action || !id) {
    return;
  }

  const variant = variants.value.find((item) => item.id === id);
  if (!variant) {
    return;
  }

  if (action === "view") {
    void openViewModal(variant);
    return;
  }

  if (action === "edit") {
    void openEditModal(variant);
    return;
  }

  if (action === "delete") {
    void confirmDelete(variant);
  }
};

onMounted(() => {
  if (formModalRef.value) {
    formModalInstance = new Modal(formModalRef.value);
  }
  if (viewModalRef.value) {
    viewModalInstance = new Modal(viewModalRef.value);
  }
  tableWrapperRef.value?.addEventListener("click", onTableClick);
});

onBeforeUnmount(() => {
  isComponentActive = false;
  tableWrapperRef.value?.removeEventListener("click", onTableClick);

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

#variantFormTabs .nav-link {
  font-size: 0.875rem;
  padding: 0.5rem 0.9rem;
}

.variant-form-modal-body {
  overflow-x: hidden;
}

.variant-form-tab-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.variant-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.variant-form-tabs .nav-link {
  white-space: normal;
  word-break: break-word;
}

.variant-form-grid {
  min-width: 0;
}

.variant-form-grid .col-md-6,
.variant-form-grid .col-12 {
  min-width: 0;
}

.variant-form-grid :deep(.relative),
.variant-form-grid :deep(button),
.variant-form-grid :deep(input),
.variant-form-grid :deep(select),
.variant-form-grid :deep(textarea) {
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

.variant-form-input-error {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 0.12rem rgba(220, 38, 38, 0.2);
}

.variant-json-preview {
  max-height: 240px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
