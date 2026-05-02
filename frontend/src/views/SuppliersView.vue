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
              <li class="breadcrumb-item active" aria-current="page">Proveedores</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-truck-field me-2 text-brick-ember"></i>Gestión de Proveedores
              </h1>
              <p class="text-secondary small mb-0">Administra los proveedores de la empresa activa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Proveedor
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando proveedores...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los proveedores. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 460px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, nombre, RUT, email o comuna"
                    aria-label="Buscar proveedores"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="suppliers-page-size"
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
                <table id="suppliersTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('legal_name')">Nombre/Razón Social <i :class="sortIcon('legal_name')"></i></button></th>
                      <th>RUT / Tax ID</th>
                      <th>Email</th>
                      <th>Comuna</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('payment_terms_days')">Plazo Pago <i :class="sortIcon('payment_terms_days')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_active')">Estado <i :class="sortIcon('is_active')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="supplier in paginatedSuppliers" :key="supplier.id">
                      <td class="text-secondary small">{{ supplier.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ supplier.code }}</span></td>
                      <td class="fw-semibold">{{ supplier.legal_name }}</td>
                      <td class="font-monospace small">{{ supplier.tax_id ?? '—' }}</td>
                      <td class="small">{{ supplier.email ?? '—' }}</td>
                      <td class="small">{{ supplier.commune_name ?? '—' }}</td>
                      <td class="small">{{ supplier.payment_terms_days }} días</td>
                      <td>
                        <span class="badge rounded-pill" :class="supplier.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                          {{ supplier.is_active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(supplier.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button class="btn btn-sm btn-outline-info" @click="openViewModal(supplier)" title="Ver detalle" aria-label="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" @click="openEditModal(supplier)" title="Editar proveedor" aria-label="Editar proveedor">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="confirmDelete(supplier)"
                            :disabled="supplier.dependencies_count > 0"
                            :title="supplier.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar proveedor'" :aria-label="supplier.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar proveedor'"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedSuppliers.length === 0">
                      <td colspan="10" class="text-center text-secondary py-4">No se encontraron proveedores para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredSuppliers.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación proveedores">
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

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="supplierFormModal" tabindex="-1" aria-labelledby="supplierFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="supplierFormModalLabel">
            <i class="fa-solid fa-user-group me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 supplier-form-modal-body">
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 supplier-form-tabs" id="supplierFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-supplier-general" data-bs-toggle="tab" data-bs-target="#panel-supplier-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-supplier-contacto" data-bs-toggle="tab" data-bs-target="#panel-supplier-contacto" type="button" role="tab">
                <i class="fa-solid fa-address-book me-1"></i>Contacto
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-supplier-comercial" data-bs-toggle="tab" data-bs-target="#panel-supplier-comercial" type="button" role="tab">
                <i class="fa-solid fa-hand-holding-dollar me-1"></i>Comercial
              </button>
            </li>
          </ul>

          <div class="tab-content supplier-form-tab-content">
            <div class="tab-pane fade show active" id="panel-supplier-general" role="tabpanel">
              <div class="row g-3 supplier-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-code">Código <span class="text-danger">*</span></label>
                  <input
                    id="supplier-code"
                    v-model="form.code"
                    type="text"
                    :class="inputClass(formErrors.code)"
                    placeholder="CLI-001"
                    :disabled="isEditMode"
                    maxlength="40"
                    :aria-invalid="Boolean(formErrors.code)"
                    aria-describedby="supplier-code-help supplier-code-error"
                    @blur="validateField('code')"
                  />
                  <p id="supplier-code-help" class="field-help">Identificador interno único del proveedor.</p>
                  <p v-if="formErrors.code" id="supplier-code-error" class="field-error">{{ formErrors.code }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-tax-id">RUT / Tax ID</label>
                  <input
                    id="supplier-tax-id"
                    v-model="form.tax_id"
                    type="text"
                    :class="inputClass(formErrors.tax_id)"
                    placeholder="12.345.678-9"
                    maxlength="30"
                    :aria-invalid="Boolean(formErrors.tax_id)"
                    aria-describedby="supplier-tax-id-help supplier-tax-id-error"
                    @blur="validateField('tax_id')"
                  />
                  <p id="supplier-tax-id-help" class="field-help">Opcional. Si existe, debe ser único por empresa.</p>
                  <p v-if="formErrors.tax_id" id="supplier-tax-id-error" class="field-error">{{ formErrors.tax_id }}</p>
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-legal-name">Nombre / Razón Social <span class="text-danger">*</span></label>
                  <input
                    id="supplier-legal-name"
                    v-model="form.legal_name"
                    type="text"
                    :class="inputClass(formErrors.legal_name)"
                    placeholder="Nombre del proveedor"
                    maxlength="180"
                    :aria-invalid="Boolean(formErrors.legal_name)"
                    aria-describedby="supplier-legal-name-help supplier-legal-name-error"
                    @blur="validateField('legal_name')"
                  />
                  <p id="supplier-legal-name-help" class="field-help">Nombre legal para facturación y documentos tributarios.</p>
                  <p v-if="formErrors.legal_name" id="supplier-legal-name-error" class="field-error">{{ formErrors.legal_name }}</p>
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-business-activity">Giro Comercial</label>
                  <input
                    id="supplier-business-activity"
                    v-model="form.business_activity"
                    type="text"
                    :class="inputClass(formErrors.business_activity)"
                    placeholder="Comercio, Servicios, Industria..."
                    maxlength="120"
                    :aria-invalid="Boolean(formErrors.business_activity)"
                    aria-describedby="supplier-business-activity-help supplier-business-activity-error"
                    @blur="validateField('business_activity')"
                  />
                  <p id="supplier-business-activity-help" class="field-help">Actividad económica principal del proveedor.</p>
                  <p v-if="formErrors.business_activity" id="supplier-business-activity-error" class="field-error">{{ formErrors.business_activity }}</p>
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
                  <div class="form-check form-switch">
                    <input
                      v-model="form.is_active"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="switchSupplierActive"
                      style="width:2.5em;height:1.3em;"
                    />
                    <label class="form-check-label ms-2 fw-semibold" for="switchSupplierActive">
                      <span :class="form.is_active ? 'text-success' : 'text-secondary'">
                        {{ form.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="panel-supplier-contacto" role="tabpanel">
              <div class="row g-3 supplier-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-email">Email</label>
                  <input
                    id="supplier-email"
                    v-model="form.email"
                    type="email"
                    :class="inputClass(formErrors.email)"
                    placeholder="proveedor@correo.com"
                    maxlength="160"
                    :aria-invalid="Boolean(formErrors.email)"
                    aria-describedby="supplier-email-help supplier-email-error"
                    @blur="validateField('email')"
                  />
                  <p id="supplier-email-help" class="field-help">Canal principal para envío de documentos y notificaciones.</p>
                  <p v-if="formErrors.email" id="supplier-email-error" class="field-error">{{ formErrors.email }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-phone">Teléfono</label>
                  <input
                    id="supplier-phone"
                    v-model="form.phone"
                    type="tel"
                    :class="inputClass(formErrors.phone)"
                    placeholder="+56 9 1234 5678"
                    maxlength="40"
                    :aria-invalid="Boolean(formErrors.phone)"
                    aria-describedby="supplier-phone-help supplier-phone-error"
                    @blur="validateField('phone')"
                  />
                  <p id="supplier-phone-help" class="field-help">Formato internacional recomendado para contacto rápido.</p>
                  <p v-if="formErrors.phone" id="supplier-phone-error" class="field-error">{{ formErrors.phone }}</p>
                </div>

                <div class="col-md-6">
                  <CustomSelect
                    id="supplier-commune"
                    v-model="form.commune_id"
                    label="Comuna"
                    placeholder="Seleccionar comuna"
                    :options="communeOptions"
                    :searchable="true"
                    :helper-text="selectedCommuneSummary"
                    :error="formErrors.commune_id"
                    @change="validateField('commune_id')"
                  />
                </div>

                <div class="col-md-3">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-city">Ciudad</label>
                  <input
                    id="supplier-city"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-700"
                    :value="selectedCommuneMeta.city"
                    readonly
                    aria-readonly="true"
                  />
                </div>

                <div class="col-md-3">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-region">Región</label>
                  <input
                    id="supplier-region"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-700"
                    :value="selectedCommuneMeta.region"
                    readonly
                    aria-readonly="true"
                  />
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-address">Dirección</label>
                  <input
                    id="supplier-address"
                    v-model="form.address_line"
                    type="text"
                    :class="inputClass(formErrors.address_line)"
                    placeholder="Dirección del proveedor"
                    maxlength="220"
                    :aria-invalid="Boolean(formErrors.address_line)"
                    aria-describedby="supplier-address-help supplier-address-error"
                    @blur="validateField('address_line')"
                  />
                  <p id="supplier-address-help" class="field-help">Incluye calle, número y referencia para despacho/facturación.</p>
                  <p v-if="formErrors.address_line" id="supplier-address-error" class="field-error">{{ formErrors.address_line }}</p>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="panel-supplier-comercial" role="tabpanel">
              <div class="row g-3 supplier-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="supplier-payment-terms">Plazo Pago (días)</label>
                  <NumberStepper
                    id="supplier-payment-terms"
                    v-model="form.payment_terms_days"
                    :min="0"
                    :max="365"
                    :input-class="`${inputClass(formErrors.payment_terms_days)} number-stepper-input`"
                    :aria-invalid="Boolean(formErrors.payment_terms_days)"
                    aria-describedby="supplier-payment-terms-help supplier-payment-terms-error"
                    @blur="validateField('payment_terms_days')"
                  />
                  <p id="supplier-payment-terms-help" class="field-help">Rango permitido: 0 a 365 días.</p>
                  <p v-if="formErrors.payment_terms_days" id="supplier-payment-terms-error" class="field-error">{{ formErrors.payment_terms_days }}</p>
                </div>

                <div class="col-md-6">
                  <p class="field-help mb-0 pt-2">Define condiciones comerciales del proveedor para compras y documentos.</p>
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

  <div class="modal fade" id="supplierViewModal" tabindex="-1" aria-labelledby="supplierViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow" v-if="selectedSupplier">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="supplierViewModalLabel">
            <i class="fa-solid fa-user-group me-2 text-info"></i>Detalle de Proveedor
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedSupplier.legal_name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedSupplier.legal_name }}</p>
              <p class="text-secondary small mb-0">{{ selectedSupplier.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedSupplier.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedSupplier.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedSupplier.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-id-card" label="RUT / Tax ID" :value="selectedSupplier.tax_id" /></div>
            <div class="col-md-6"><DetailRow icon="fa-briefcase" label="Giro" :value="selectedSupplier.business_activity" /></div>
            <div class="col-md-6"><DetailRow icon="fa-envelope" label="Email" :value="selectedSupplier.email" /></div>
            <div class="col-md-6"><DetailRow icon="fa-phone" label="Teléfono" :value="selectedSupplier.phone" /></div>
            <div class="col-md-6"><DetailRow icon="fa-location-dot" label="Dirección" :value="selectedSupplier.address_line" /></div>
            <div class="col-md-6"><DetailRow icon="fa-map-location-dot" label="Comuna" :value="selectedSupplier.commune_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar-day" label="Plazo Pago" :value="`${selectedSupplier.payment_terms_days} días`" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedSupplier.created_at)" /></div>
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
import NumberStepper from "../components/NumberStepper.vue";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "../composables/useSuppliers";
import { useCommunes } from "../composables/useCommunes";
import type { SupplierItem } from "../services/supplier.service";
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

const { data, isLoading, isError } = useSuppliers();
const { data: communesData } = useCommunes();
const { mutateAsync: createSupplier } = useCreateSupplier();
const { mutateAsync: updateSupplier } = useUpdateSupplier();
const { mutateAsync: deleteSupplier } = useDeleteSupplier();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const suppliers = computed(() => data.value ?? []);
const selectedSupplier = ref<SupplierItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "legal_name" | "payment_terms_days" | "is_active" | "created_at">("legal_name");
const sortDirection = ref<"asc" | "desc">("asc");

const emptyForm = () => ({
  code: "",
  tax_id: "",
  legal_name: "",
  business_activity: "",
  email: "",
  phone: "",
  address_line: "",
  commune_id: "",
  payment_terms_days: 0,
  is_active: true
});

type SupplierFormField = keyof ReturnType<typeof emptyForm>;

const emptyFormErrors = () => ({
  code: "",
  tax_id: "",
  legal_name: "",
  business_activity: "",
  email: "",
  phone: "",
  address_line: "",
  commune_id: "",
  payment_terms_days: "",
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

const communeOptions = computed<SelectOption[]>(() => {
  const rows = communesData.value ?? [];
  return rows.map((c) => ({
    value: c.id,
    label: `${c.region_country_code ?? ""} - ${c.region_name ?? ""} / ${c.city_name ?? ""} / ${c.name}`
  }));
});

const selectedCommune = computed(() => {
  if (!form.value.commune_id) return null;
  return communesData.value?.find((commune) => String(commune.id) === String(form.value.commune_id)) ?? null;
});

const selectedCommuneMeta = computed(() => ({
  city: selectedCommune.value?.city_name ?? "No seleccionada",
  region: selectedCommune.value?.region_name ?? "No seleccionada"
}));

const selectedCommuneSummary = computed(() => {
  if (!form.value.commune_id) {
    return "Selecciona la comuna para completar región y ciudad de referencia.";
  }

  const selected = selectedCommune.value;
  if (!selected) {
    return "Comuna seleccionada.";
  }

  const region = selected.region_name ?? "Sin región";
  const city = selected.city_name ?? "Sin ciudad";
  return `Región: ${region} · Ciudad: ${city}`;
});

const filteredSuppliers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return suppliers.value;

  return suppliers.value.filter((c) => {
    const searchable = [
      String(c.id),
      c.code,
      c.legal_name,
      c.tax_id ?? "",
      c.business_activity ?? "",
      c.email ?? "",
      c.phone ?? "",
      c.address_line ?? "",
      c.commune_name ?? "",
      c.city_name ?? "",
      c.region_name ?? "",
      c.is_active ? "activo" : "inactivo"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (c: SupplierItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(c.id);
    case "created_at":
      return c.created_at ? new Date(c.created_at).getTime() : 0;
    case "payment_terms_days":
      return c.payment_terms_days;
    case "is_active":
      return c.is_active ? 1 : 0;
    default:
      return (c[key] ?? "").toString().toLowerCase();
  }
};

const sortedSuppliers = computed(() => {
  const list = [...filteredSuppliers.value];
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
const totalPages = computed(() => Math.max(1, Math.ceil(sortedSuppliers.value.length / pageSizeNumber.value)));
const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedSuppliers.value.slice(start, start + pageSizeNumber.value);
});

const paginationStart = computed(() => filteredSuppliers.value.length === 0 ? 0 : (currentPage.value - 1) * pageSizeNumber.value + 1);
const paginationEnd = computed(() => filteredSuppliers.value.length === 0 ? 0 : Math.min(currentPage.value * pageSizeNumber.value, filteredSuppliers.value.length));

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

  const firstTab = document.getElementById("tab-supplier-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

async function openEditModal(supplier: SupplierItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = supplier.id;
  form.value = {
    code: supplier.code,
    tax_id: supplier.tax_id ?? "",
    legal_name: supplier.legal_name,
    business_activity: supplier.business_activity ?? "",
    email: supplier.email ?? "",
    phone: supplier.phone ?? "",
    address_line: supplier.address_line ?? "",
    commune_id: supplier.commune_id ?? "",
    payment_terms_days: supplier.payment_terms_days,
    is_active: supplier.is_active
  };
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-supplier-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

function openViewModal(supplier: SupplierItem) {
  if (!isComponentActive) return;
  selectedSupplier.value = supplier;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedSupplier.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedSupplier.value) return;
    void openEditModal(selectedSupplier.value);
  }, 350);
}

async function submitForm() {
  const hasErrors = validateForm();
  if (hasErrors) {
    return showValidationError("Revisa los campos resaltados para continuar.");
  }

  const f = form.value;
  const normalizedPaymentTerms = Number(f.payment_terms_days || 0);

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateSupplier({
        id: editingId.value,
        payload: {
          tax_id: f.tax_id || undefined,
          legal_name: f.legal_name,
          business_activity: f.business_activity || undefined,
          email: f.email || undefined,
          phone: f.phone || undefined,
          address_line: f.address_line || undefined,
          commune_id: f.commune_id ? Number(f.commune_id) : undefined,
          payment_terms_days: normalizedPaymentTerms,
          is_active: f.is_active
        }
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Proveedor actualizado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } else {
      await createSupplier({
        code: f.code,
        tax_id: f.tax_id || undefined,
        legal_name: f.legal_name,
        business_activity: f.business_activity || undefined,
        email: f.email || undefined,
        phone: f.phone || undefined,
        address_line: f.address_line || undefined,
        commune_id: f.commune_id ? Number(f.commune_id) : undefined,
        payment_terms_days: normalizedPaymentTerms,
        is_active: f.is_active
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Proveedor creado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
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
    error ? "border-danger supplier-form-input-error" : "border-slate-300"
  ];
}

function validateField(field: SupplierFormField): string {
  const f = form.value;
  let error = "";

  if (field === "code") {
    if (!isEditMode.value && !f.code.trim()) {
      error = "El código es obligatorio.";
    } else if (f.code.length > 40) {
      error = "El código no puede superar 40 caracteres.";
    }
  }

  if (field === "tax_id" && f.tax_id.length > 30) {
    error = "El RUT / Tax ID no puede superar 30 caracteres.";
  }

  if (field === "legal_name") {
    if (!f.legal_name.trim()) {
      error = "El nombre o razón social es obligatorio.";
    } else if (f.legal_name.length > 180) {
      error = "El nombre o razón social no puede superar 180 caracteres.";
    }
  }

  if (field === "business_activity" && f.business_activity.length > 120) {
    error = "El giro comercial no puede superar 120 caracteres.";
  }

  if (field === "email") {
    if (f.email.length > 160) {
      error = "El email no puede superar 160 caracteres.";
    } else if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      error = "El formato del email no es válido.";
    }
  }

  if (field === "phone" && f.phone.length > 40) {
    error = "El teléfono no puede superar 40 caracteres.";
  }

  if (field === "address_line" && f.address_line.length > 220) {
    error = "La dirección no puede superar 220 caracteres.";
  }

  if (field === "payment_terms_days") {
    const value = Number(f.payment_terms_days || 0);
    if (!Number.isFinite(value) || value < 0 || value > 365) {
      error = "El plazo de pago debe estar entre 0 y 365 días.";
    }
  }

  formErrors.value[field] = error;
  return error;
}

function validateForm() {
  const fields: SupplierFormField[] = [
    "code",
    "tax_id",
    "legal_name",
    "business_activity",
    "email",
    "phone",
    "address_line",
    "commune_id",
    "payment_terms_days"
  ];

  let hasErrors = false;
  fields.forEach((field) => {
    if (validateField(field)) {
      hasErrors = true;
    }
  });

  if (formErrors.value.code || formErrors.value.legal_name) {
    const generalTab = document.getElementById("tab-supplier-general");
    if (generalTab) (generalTab as HTMLElement).click();
  } else if (formErrors.value.email || formErrors.value.phone || formErrors.value.address_line || formErrors.value.commune_id) {
    const contactTab = document.getElementById("tab-supplier-contacto");
    if (contactTab) (contactTab as HTMLElement).click();
  } else if (formErrors.value.payment_terms_days) {
    const commercialTab = document.getElementById("tab-supplier-comercial");
    if (commercialTab) (commercialTab as HTMLElement).click();
  }

  return hasErrors;
}

async function confirmDelete(supplier: SupplierItem) {
  if (supplier.dependencies_count > 0) {
    await Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      text: "El proveedor tiene contactos o documentos asociados.",
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar proveedor?",
    html: `<p class="mb-0">Estás por eliminar <strong>${supplier.legal_name}</strong>.<br>Esta acción desactivará el registro.</p>`,
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
    await deleteSupplier(supplier.id);
    await Swal.fire({ icon: "success", title: "Proveedor eliminado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar el proveedor.";
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

#supplierFormTabs .nav-link {
  font-size: .875rem;
  padding: .5rem .9rem;
}

.supplier-form-modal-body {
  overflow-x: hidden;
}

.supplier-form-tab-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.supplier-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.supplier-form-tabs .nav-link {
  white-space: normal;
  word-break: break-word;
}

.supplier-form-grid {
  min-width: 0;
}

.supplier-form-grid .col-md-6,
.supplier-form-grid .col-12 {
  min-width: 0;
}

.supplier-form-grid :deep(.relative),
.supplier-form-grid :deep(button),
.supplier-form-grid :deep(input),
.supplier-form-grid :deep(select) {
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

.supplier-form-input-error {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 0.12rem rgba(220, 38, 38, 0.2);
}

@media (max-width: 575.98px) {
  .supplier-form-tab-content {
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
  }
}
</style>





