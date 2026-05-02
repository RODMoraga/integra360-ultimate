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
              <li class="breadcrumb-item active" aria-current="page">Ventas</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-file-invoice me-2 text-brick-ember"></i>Módulo de Ventas
              </h1>
              <p class="text-secondary small mb-0">Administra ventas y su detalle con filtros avanzados y edición dinámica.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Documento
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div class="row g-3 align-items-end">
              <div class="col-md-4">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Cliente/Proveedor</label>
                <input
                  v-model="draftFilters.partner_name"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                  placeholder="Nombre cliente o proveedor"
                />
              </div>

              <div class="col-md-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
                <select
                  v-model="draftFilters.status"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                >
                  <option value="">Todos</option>
                  <option value="DRAFT">Borrador</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="CANCELLED">Anulado</option>
                </select>
              </div>

              <div class="col-md-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Desde</label>
                <input
                  v-model="draftFilters.date_from"
                  type="date"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                />
              </div>

              <div class="col-md-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Hasta</label>
                <input
                  v-model="draftFilters.date_to"
                  type="date"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                />
              </div>

              <div class="col-md-2 d-flex gap-2">
                <button class="btn btn-primary w-100" @click="applyFilters">
                  <i class="fa-solid fa-filter me-1"></i>Filtrar
                </button>
                <button class="btn btn-light" title="Limpiar filtros" @click="clearFilters">
                  <i class="fa-solid fa-eraser"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando ventas...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las ventas. Intenta nuevamente.
            </div>

            <div v-else class="documents-table-wrapper" ref="tableWrapperRef">
              <DataTable
                :key="tableRenderKey"
                :data="tableRows"
                :columns="tableColumns"
                :options="tableOptions"
                id="salesTable"
                class="table table-hover align-middle table-striped w-100"
              >
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Cliente/Proveedor</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Items</th>
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

  <div class="modal fade" id="documentFormModal" tabindex="-1" aria-labelledby="documentFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="documentFormModalLabel">
            <i class="fa-solid fa-file-invoice me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Documento' : 'Nuevo Documento' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body pt-3">
          <div class="bg-slate-50 rounded-3 p-3 mb-4">
            <h6 class="fw-bold mb-3 text-dark"><i class="fa-solid fa-file-lines me-2"></i>Encabezado</h6>
            <div class="row g-3">
              <div class="col-md-4">
                <CustomSelect
                  id="document-type"
                  v-model="form.document_type_id"
                  label="Tipo Documento"
                  placeholder="Seleccionar tipo"
                  :options="documentTypeOptions"
                  :searchable="true"
                  :disabled="isEditMode"
                />
              </div>

              <div class="col-md-3">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Fecha</label>
                <input
                  v-model="form.document_date"
                  type="date"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                />
              </div>

              <div class="col-md-2">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
                <select
                  v-model="form.status"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="CANCELLED">Anulado</option>
                </select>
              </div>

              <div class="col-md-3">
                <CustomSelect
                  id="document-warehouse"
                  v-model="form.warehouse_id"
                  label="Bodega"
                  placeholder="Seleccionar bodega"
                  :options="warehouseOptions"
                  :searchable="true"
                />
              </div>

              <div class="col-md-6" v-if="shouldShowCustomerSelect">
                <CustomSelect
                  id="document-customer"
                  v-model="form.customer_id"
                  label="Cliente"
                  placeholder="Seleccionar cliente"
                  :options="customerOptions"
                  :searchable="true"
                />
              </div>

              <div class="col-md-6" v-if="shouldShowSupplierSelect">
                <CustomSelect
                  id="document-supplier"
                  v-model="form.supplier_id"
                  label="Proveedor"
                  placeholder="Seleccionar proveedor"
                  :options="supplierOptions"
                  :searchable="true"
                />
              </div>

              <div class="col-12">
                <label class="block text-sm font-medium text-ink-black-700 mb-2">Notas</label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  maxlength="255"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                  placeholder="Observaciones del documento"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="bg-slate-50 rounded-3 p-3">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-list-ul me-2"></i>Detalle de Documento</h6>
              <button class="btn btn-outline-primary btn-sm" @click="addDetailLine">
                <i class="fa-solid fa-plus me-1"></i>Agregar línea
              </button>
            </div>

            <div class="table-responsive">
              <table class="table align-middle table-sm mb-0">
                <thead>
                  <tr>
                    <th style="min-width: 280px;">Producto (Nombre / SKU / Código Barras)</th>
                    <th style="min-width: 200px;">Bodega</th>
                    <th style="width: 110px;">Cantidad</th>
                    <th style="width: 130px;">Precio Unit.</th>
                    <th style="width: 120px;">Descuento</th>
                    <th style="width: 120px;">Impuesto</th>
                    <th style="width: 130px;">Total Línea</th>
                    <th style="width: 70px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in form.details" :key="line.uid">
                    <td>
                      <CustomSelect
                        :id="`detail-variant-${line.uid}`"
                        v-model="line.product_variant_id"
                        placeholder="Buscar por nombre / SKU / código barras"
                        :options="variantOptions"
                        :searchable="true"
                        @change="onVariantChange(line)"
                      />
                    </td>
                    <td>
                      <CustomSelect
                        :id="`detail-warehouse-${line.uid}`"
                        v-model="line.warehouse_id"
                        placeholder="Bodega línea"
                        :options="warehouseOptions"
                        :searchable="true"
                      />
                    </td>
                    <td>
                      <input
                        v-model.number="line.quantity"
                        type="number"
                        min="0.0001"
                        step="0.0001"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        v-model.number="line.unit_price"
                        type="number"
                        min="0"
                        step="0.0001"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        v-model.number="line.discount_amount"
                        type="number"
                        min="0"
                        step="0.0001"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        v-model.number="line.tax_amount"
                        type="number"
                        min="0"
                        step="0.0001"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td class="fw-semibold">{{ formatMoney(lineTotal(line)) }}</td>
                    <td>
                      <button class="btn btn-outline-danger btn-sm" @click="removeDetailLine(line.uid)" :disabled="form.details.length === 1">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="row g-3 mt-1 justify-content-end">
              <div class="col-md-4">
                <div class="bg-white rounded-3 border p-3">
                  <p class="d-flex justify-content-between mb-1"><span>Subtotal</span><strong>{{ formatMoney(subtotal) }}</strong></p>
                  <p class="d-flex justify-content-between mb-1"><span>Descuento</span><strong>{{ formatMoney(discountTotal) }}</strong></p>
                  <p class="d-flex justify-content-between mb-1"><span>Impuesto</span><strong>{{ formatMoney(taxTotal) }}</strong></p>
                  <hr class="my-2" />
                  <p class="d-flex justify-content-between mb-0 fs-6"><span>Total</span><strong class="text-primary">{{ formatMoney(grandTotal) }}</strong></p>
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

  <div class="modal fade" id="documentViewModal" tabindex="-1" aria-labelledby="documentViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedSale">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="documentViewModalLabel">
            <i class="fa-solid fa-file-invoice me-2 text-info"></i>
            Detalle de Documento {{ selectedSale.document_number_label }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body pt-0">
          <div class="row g-3 mb-3">
            <div class="col-md-4"><DetailRow icon="fa-file-lines" label="Tipo" :value="selectedSale.document_type_name" /></div>
            <div class="col-md-4"><DetailRow icon="fa-calendar" label="Fecha" :value="formatDate(selectedSale.document_date)" /></div>
            <div class="col-md-4"><DetailRow icon="fa-circle-check" label="Estado" :value="statusLabel(selectedSale.status)" /></div>
            <div class="col-md-4"><DetailRow icon="fa-user-group" label="Cliente" :value="selectedSale.customer_name" /></div>
            <div class="col-md-4"><DetailRow icon="fa-truck-field" label="Proveedor" :value="selectedSale.supplier_name" /></div>
            <div class="col-md-4"><DetailRow icon="fa-warehouse" label="Bodega" :value="selectedSale.warehouse_name" /></div>
          </div>

          <div class="table-responsive border rounded-3">
            <table class="table table-sm table-striped mb-0 align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Desc.</th>
                  <th>Imp.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in selectedSale.details ?? []" :key="line.id">
                  <td>{{ line.line_number }}</td>
                  <td>{{ line.product_variant_name ?? line.product_name ?? '—' }}</td>
                  <td>{{ line.product_variant_sku ?? line.product_sku ?? '—' }}</td>
                  <td>{{ line.quantity }}</td>
                  <td>{{ formatMoney(line.unit_price) }}</td>
                  <td>{{ formatMoney(line.discount_amount) }}</td>
                  <td>{{ formatMoney(line.tax_amount) }}</td>
                  <td class="fw-semibold">{{ formatMoney(line.line_total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer border-0 d-flex justify-content-between w-100">
          <div class="text-start">
            <p class="mb-1">Subtotal: <strong>{{ formatMoney(selectedSale.subtotal) }}</strong></p>
            <p class="mb-1">Descuento: <strong>{{ formatMoney(selectedSale.discount_total) }}</strong></p>
            <p class="mb-0">Impuesto: <strong>{{ formatMoney(selectedSale.tax_total) }}</strong></p>
          </div>
          <div class="text-end">
            <p class="mb-0 fs-5">Total: <strong class="text-primary">{{ formatMoney(selectedSale.total) }}</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Modal } from "bootstrap";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-bs5";
import type { Config } from "datatables.net";
import Swal from "sweetalert2";

import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import CustomSelect from "../components/CustomSelect.vue";
import type { SelectOption } from "../components/CustomSelect.vue";
import { useCustomers } from "../composables/useCustomers";
import { useDocumentTypes } from "../composables/useDocumentTypes";
import { useSuppliers } from "../composables/useSuppliers";
import { useWarehouses } from "../composables/useWarehouses";
import { useProductVariants } from "../composables/useProductVariants";
import {
  useCreateSale,
  useDeleteSale,
  useSales,
  useUpdateSale
} from "../composables/useSales";
import {
  saleService,
  type SaleItem,
  type SaleListFilters,
  type SaleStatus
} from "../services/sale.service";
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

const route = useRoute();
const router = useRouter();

const sidebarOpen = ref(false);
const tableWrapperRef = ref<HTMLElement | null>(null);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;

const draftFilters = reactive<SaleListFilters>({
  partner_name: "",
  status: "",
  date_from: "",
  date_to: ""
});

const appliedFilters = reactive<SaleListFilters>({
  partner_name: "",
  status: "",
  date_from: "",
  date_to: ""
});

const { data, isLoading, isError } = useSales(appliedFilters);
const { data: customersData } = useCustomers();
const { data: suppliersData } = useSuppliers();
const { data: warehousesData } = useWarehouses();
const { data: documentTypesData } = useDocumentTypes();
const { data: variantsData } = useProductVariants();
const { mutateAsync: createSale } = useCreateSale();
const { mutateAsync: updateSale } = useUpdateSale();
const { mutateAsync: deleteSale } = useDeleteSale();

const sales = computed(() => data.value ?? []);

const customerOptions = computed<SelectOption[]>(() =>
  (customersData.value ?? [])
    .filter((row) => row.is_active)
    .map((row) => ({
      value: row.id,
      label: `${row.code} - ${row.legal_name}`
    }))
);

const supplierOptions = computed<SelectOption[]>(() =>
  (suppliersData.value ?? [])
    .filter((row) => row.is_active)
    .map((row) => ({
      value: row.id,
      label: `${row.code} - ${row.legal_name}`
    }))
);

const warehouseOptions = computed<SelectOption[]>(() =>
  (warehousesData.value ?? [])
    .filter((row) => row.is_active)
    .map((row) => ({
      value: row.id,
      label: `${row.code} - ${row.name}`
    }))
);

const documentTypeOptions = computed<SelectOption[]>(() =>
  (documentTypesData.value ?? []).map((row) => ({
    value: row.id,
    label: `${row.code} - ${row.name}`
  }))
);

const variantOptions = computed<SelectOption[]>(() =>
  (variantsData.value ?? [])
    .filter((row) => row.is_active)
    .map((row) => ({
      value: row.id,
      label: `${row.name} | SKU: ${row.sku ?? 'N/A'} | Barras: ${row.barcode ?? 'N/A'} | Código: ${row.variant_code}`
    }))
);

const selectedSale = ref<SaleItem | null>(null);
const isEditMode = ref(false);
const editingId = ref<string | null>(null);
const isSaving = ref(false);

interface DetailLineForm {
  uid: number;
  product_variant_id: string;
  warehouse_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
}

const emptyLine = (): DetailLineForm => ({
  uid: Date.now() + Math.floor(Math.random() * 1000),
  product_variant_id: "",
  warehouse_id: "",
  quantity: 1,
  unit_price: 0,
  discount_amount: 0,
  tax_amount: 0
});

const emptyForm = () => ({
  document_type_id: "",
  document_date: new Date().toISOString().slice(0, 10),
  warehouse_id: "",
  customer_id: "",
  supplier_id: "",
  status: "DRAFT" as SaleStatus,
  notes: "",
  details: [emptyLine()]
});

const form = reactive(emptyForm());

const selectedSaleType = computed(() =>
  (documentTypesData.value ?? []).find((row) => row.id === String(form.document_type_id))
);

const shouldShowCustomerSelect = computed(() => {
  const scope = selectedSaleType.value?.counterpart_scope;
  return scope === "CUSTOMER" || scope === "NONE" || !scope;
});

const shouldShowSupplierSelect = computed(() => {
  const scope = selectedSaleType.value?.counterpart_scope;
  return scope === "SUPPLIER" || scope === "NONE" || !scope;
});

watch(
  () => selectedSaleType.value?.counterpart_scope,
  (scope) => {
    if (scope === "CUSTOMER") {
      form.supplier_id = "";
    }
    if (scope === "SUPPLIER") {
      form.customer_id = "";
    }
  }
);

watch(
  () => route.path,
  (path) => {
    if (path === "/ventas/nueva") {
      openCreateModal();
      return;
    }

    if (path === "/ventas/historial") {
      formModalInstance?.hide();
    }
  }
);

const subtotal = computed(() => form.details.reduce((acc, line) => acc + (safe(line.quantity) * safe(line.unit_price)), 0));
const discountTotal = computed(() => form.details.reduce((acc, line) => acc + safe(line.discount_amount), 0));
const taxTotal = computed(() => form.details.reduce((acc, line) => acc + safe(line.tax_amount), 0));
const grandTotal = computed(() => subtotal.value - discountTotal.value + taxTotal.value);

function safe(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function lineTotal(line: DetailLineForm) {
  const total = safe(line.quantity) * safe(line.unit_price) - safe(line.discount_amount) + safe(line.tax_amount);
  return total >= 0 ? total : 0;
}

function addDetailLine() {
  const row = emptyLine();
  if (form.warehouse_id) {
    row.warehouse_id = form.warehouse_id;
  }
  form.details.push(row);
}

function removeDetailLine(uid: number) {
  if (form.details.length === 1) return;
  const index = form.details.findIndex((row) => row.uid === uid);
  if (index >= 0) {
    form.details.splice(index, 1);
  }
}

function onVariantChange(line: DetailLineForm) {
  const variant = (variantsData.value ?? []).find((row) => row.id === String(line.product_variant_id));
  if (variant && safe(line.unit_price) === 0) {
    line.unit_price = Number(variant.sale_price ?? 0);
  }
}

function resetForm() {
  Object.assign(form, emptyForm());
}

function applyFilters() {
  Object.assign(appliedFilters, {
    partner_name: draftFilters.partner_name?.trim() ?? "",
    status: draftFilters.status ?? "",
    date_from: draftFilters.date_from ?? "",
    date_to: draftFilters.date_to ?? ""
  });
}

function clearFilters() {
  Object.assign(draftFilters, {
    partner_name: "",
    status: "",
    date_from: "",
    date_to: ""
  });
  applyFilters();
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = null;
  resetForm();
  formModalInstance?.show();

  if (route.path !== "/ventas/nueva") {
    void router.replace("/ventas/nueva");
  }
}

async function openEditModal(id: string) {
  const full = await saleService.getById(id);
  isEditMode.value = true;
  editingId.value = id;

  Object.assign(form, {
    document_type_id: full.document_type_id,
    document_date: full.document_date.slice(0, 10),
    warehouse_id: full.warehouse_id ?? "",
    customer_id: full.customer_id ?? "",
    supplier_id: full.supplier_id ?? "",
    status: full.status,
    notes: full.notes ?? "",
    details: (full.details ?? []).map((line) => ({
      uid: Number(line.id),
      product_variant_id: line.product_variant_id,
      warehouse_id: line.warehouse_id ?? "",
      quantity: Number(line.quantity),
      unit_price: Number(line.unit_price),
      discount_amount: Number(line.discount_amount),
      tax_amount: Number(line.tax_amount)
    }))
  });

  if (form.details.length === 0) {
    form.details = [emptyLine()];
  }

  formModalInstance?.show();
}

async function openViewModal(id: string) {
  selectedSale.value = await saleService.getById(id);
  viewModalInstance?.show();
}

function parsePositiveInt(value: string) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    return undefined;
  }
  return num;
}

function validateForm() {
  if (!parsePositiveInt(String(form.document_type_id))) {
    throw new Error("Debe seleccionar un tipo de documento");
  }

  if (!form.document_date) {
    throw new Error("Debe seleccionar una fecha de documento");
  }

  const scope = selectedSaleType.value?.counterpart_scope;
  if (scope === "CUSTOMER" && !parsePositiveInt(String(form.customer_id))) {
    throw new Error("Este tipo de documento requiere cliente");
  }

  if (scope === "SUPPLIER" && !parsePositiveInt(String(form.supplier_id))) {
    throw new Error("Este tipo de documento requiere proveedor");
  }

  if (form.details.length === 0) {
    throw new Error("Debe agregar al menos una línea de detalle");
  }

  form.details.forEach((line, idx) => {
    if (!parsePositiveInt(String(line.product_variant_id))) {
      throw new Error(`Seleccione un producto en la línea ${idx + 1}`);
    }
    if (safe(line.quantity) <= 0) {
      throw new Error(`La cantidad de la línea ${idx + 1} debe ser mayor que 0`);
    }
    if (safe(line.unit_price) < 0 || safe(line.discount_amount) < 0 || safe(line.tax_amount) < 0) {
      throw new Error(`No se permiten valores negativos en la línea ${idx + 1}`);
    }
  });
}

async function submitForm() {
  try {
    validateForm();
    isSaving.value = true;

    const payload = {
      document_type_id: parsePositiveInt(String(form.document_type_id)),
      document_date: form.document_date,
      warehouse_id: parsePositiveInt(String(form.warehouse_id)),
      customer_id: parsePositiveInt(String(form.customer_id)),
      supplier_id: parsePositiveInt(String(form.supplier_id)),
      status: form.status,
      notes: form.notes?.trim() || undefined,
      details: form.details.map((line) => ({
        product_variant_id: parsePositiveInt(String(line.product_variant_id)) as number,
        warehouse_id: parsePositiveInt(String(line.warehouse_id)),
        quantity: safe(line.quantity),
        unit_price: safe(line.unit_price),
        discount_amount: safe(line.discount_amount),
        tax_amount: safe(line.tax_amount)
      }))
    };

    if (isEditMode.value && editingId.value) {
      await updateSale({ id: editingId.value, payload });
      await Swal.fire({ icon: "success", title: "Venta actualizada", timer: 1500, showConfirmButton: false });
    } else {
      await createSale(payload as { document_type_id: number; details: NonNullable<typeof payload.details> });
      await Swal.fire({ icon: "success", title: "Venta creada", timer: 1500, showConfirmButton: false });
    }

    formModalInstance?.hide();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible guardar la venta";
    await Swal.fire({ icon: "error", title: "Error", text: message });
  } finally {
    isSaving.value = false;
  }
}

async function removeSale(id: string) {
  const result = await Swal.fire({
    icon: "warning",
    title: "Eliminar venta",
    text: "La venta se eliminará lógicamente y ya no aparecerá en listados.",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    await deleteSale(id);
    await Swal.fire({ icon: "success", title: "Venta eliminada", timer: 1500, showConfirmButton: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible eliminar";
    await Swal.fire({ icon: "error", title: "Error", text: message });
  }
}

function statusLabel(status: SaleStatus) {
  if (status === "CONFIRMED") return "Confirmado";
  if (status === "CANCELLED") return "Anulado";
  return "Borrador";
}

function statusBadge(status: SaleStatus) {
  if (status === "CONFIRMED") return '<span class="badge text-bg-success">Confirmado</span>';
  if (status === "CANCELLED") return '<span class="badge text-bg-danger">Anulado</span>';
  return '<span class="badge text-bg-secondary">Borrador</span>';
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 2
  }).format(Number(value || 0));
}

const tableRows = computed(() => sales.value.map((row) => ({
  id: row.id,
  document_number_label: row.document_number_label,
  document_type_name: row.document_type_name,
  document_date: formatDate(row.document_date),
  partner_name: row.partner_name ?? "—",
  status: row.status,
  total: formatMoney(row.total),
  details_count: row.details_count
})));

const tableColumns = [
  { data: "document_number_label" },
  { data: "document_type_name", defaultContent: "—" },
  { data: "document_date" },
  { data: "partner_name" },
  { data: "status", render: (value: SaleStatus) => statusBadge(value) },
  { data: "total" },
  { data: "details_count" },
  {
    data: null,
    orderable: false,
    searchable: false,
    render: (_: unknown, __: unknown, row: { id: string }) => `
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-info" data-action="view" data-id="${row.id}"><i class="fa-solid fa-eye"></i></button>
        <button class="btn btn-sm btn-outline-warning" data-action="edit" data-id="${row.id}"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${row.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `
  }
];

const tableOptions: Config = {
  autoWidth: false,
  pageLength: 10,
  lengthMenu: [10, 25, 50, 100],
  language: {
    decimal: ",",
    thousands: ".",
    emptyTable: "No hay ventas",
    info: "Mostrando _START_ a _END_ de _TOTAL_ ventas",
    infoEmpty: "Mostrando 0 a 0 de 0 ventas",
    infoFiltered: "(filtrado de _MAX_ ventas)",
    lengthMenu: "Mostrar _MENU_ ventas",
    loadingRecords: "Cargando...",
    processing: "Procesando...",
    search: "Buscar:",
    zeroRecords: "No se encontraron ventas",
    paginate: {
      first: "Primero",
      last: "Último",
      next: "Siguiente",
      previous: "Anterior"
    }
  }
};

const tableRenderKey = computed(() => `${sales.value.length}-${appliedFilters.partner_name ?? ''}-${appliedFilters.status ?? ''}-${appliedFilters.date_from ?? ''}-${appliedFilters.date_to ?? ''}`);

const handleTableClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>("button[data-action][data-id]");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!action || !id) return;

  if (action === "view") {
    void openViewModal(id);
    return;
  }

  if (action === "edit") {
    void openEditModal(id);
    return;
  }

  if (action === "delete") {
    void removeSale(id);
  }
};

onMounted(() => {
  if (formModalRef.value) {
    formModalInstance = new Modal(formModalRef.value, {
      backdrop: "static",
      keyboard: false
    });

    formModalRef.value.addEventListener("hidden.bs.modal", () => {
      if (!isComponentActive) return;
      resetForm();
      isEditMode.value = false;
      editingId.value = null;

      if (route.path === "/ventas/nueva") {
        void router.replace("/ventas/historial");
      }
    });
  }

  if (viewModalRef.value) {
    viewModalInstance = new Modal(viewModalRef.value);
  }

  nextTick(() => {
    tableWrapperRef.value?.addEventListener("click", handleTableClick);

    if (route.path === "/ventas/nueva") {
      openCreateModal();
    }
  });
});

onBeforeUnmount(() => {
  isComponentActive = false;
  tableWrapperRef.value?.removeEventListener("click", handleTableClick);

  if (formModalInstance) {
    formModalInstance.hide();
    formModalInstance.dispose();
    formModalInstance = null;
  }

  if (viewModalInstance) {
    viewModalInstance.hide();
    viewModalInstance.dispose();
    viewModalInstance = null;
  }
});
</script>

<style scoped>
.documents-table-wrapper :deep(table.dataTable tbody td) {
  vertical-align: middle;
}
</style>

