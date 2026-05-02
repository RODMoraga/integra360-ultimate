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
              <li class="breadcrumb-item active" aria-current="page">Clientes</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-user-group me-2 text-brick-ember"></i>Gestión de Clientes
              </h1>
              <p class="text-secondary small mb-0">Administra los clientes de la empresa activa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Cliente
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando clientes...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los clientes. Intenta nuevamente.
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
                    aria-label="Buscar clientes"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="customers-page-size"
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
                <table id="customersTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('legal_name')">Nombre/Razón Social <i :class="sortIcon('legal_name')"></i></button></th>
                      <th>RUT / Tax ID</th>
                      <th>Email</th>
                      <th>Comuna</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('credit_limit')">Límite Crédito <i :class="sortIcon('credit_limit')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_active')">Estado <i :class="sortIcon('is_active')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="customer in paginatedCustomers" :key="customer.id">
                      <td class="text-secondary small">{{ customer.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ customer.code }}</span></td>
                      <td class="fw-semibold">{{ customer.legal_name }}</td>
                      <td class="font-monospace small">{{ customer.tax_id ?? '—' }}</td>
                      <td class="small">{{ customer.email ?? '—' }}</td>
                      <td class="small">{{ customer.commune_name ?? '—' }}</td>
                      <td class="small">{{ formatCurrency(customer.credit_limit) }}</td>
                      <td>
                        <span class="badge rounded-pill" :class="customer.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                          {{ customer.is_active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(customer.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="d-flex gap-1 justify-content-center">
                          <button class="btn btn-sm btn-outline-info rounded-3 px-2" @click="openViewModal(customer)" title="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning rounded-3 px-2" @click="openEditModal(customer)" title="Editar cliente">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger rounded-3 px-2"
                            @click="confirmDelete(customer)"
                            :disabled="customer.dependencies_count > 0"
                            :title="customer.dependencies_count > 0 ? 'No se puede eliminar: tiene dependencias' : 'Eliminar cliente'"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedCustomers.length === 0">
                      <td colspan="10" class="text-center text-secondary py-4">No se encontraron clientes para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredCustomers.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación clientes">
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

  <div class="modal fade" id="customerFormModal" tabindex="-1" aria-labelledby="customerFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="customerFormModalLabel">
            <i class="fa-solid fa-user-group me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Cliente' : 'Nuevo Cliente' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 customer-form-modal-body">
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 customer-form-tabs" id="customerFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-customer-general" data-bs-toggle="tab" data-bs-target="#panel-customer-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-customer-contacto" data-bs-toggle="tab" data-bs-target="#panel-customer-contacto" type="button" role="tab">
                <i class="fa-solid fa-address-book me-1"></i>Contacto
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-customer-comercial" data-bs-toggle="tab" data-bs-target="#panel-customer-comercial" type="button" role="tab">
                <i class="fa-solid fa-hand-holding-dollar me-1"></i>Comercial
              </button>
            </li>
          </ul>

          <div class="tab-content customer-form-tab-content">
            <div class="tab-pane fade show active" id="panel-customer-general" role="tabpanel">
              <div class="row g-3 customer-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-code">Código <span class="text-danger">*</span></label>
                  <input
                    id="customer-code"
                    v-model="form.code"
                    type="text"
                    :class="inputClass(formErrors.code)"
                    placeholder="CLI-001"
                    :disabled="isEditMode"
                    maxlength="40"
                    :aria-invalid="Boolean(formErrors.code)"
                    aria-describedby="customer-code-help customer-code-error"
                    @blur="validateField('code')"
                  />
                  <p id="customer-code-help" class="field-help">Identificador interno único del cliente.</p>
                  <p v-if="formErrors.code" id="customer-code-error" class="field-error">{{ formErrors.code }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-tax-id">RUT / Tax ID</label>
                  <input
                    id="customer-tax-id"
                    v-model="form.tax_id"
                    type="text"
                    :class="inputClass(formErrors.tax_id)"
                    placeholder="12.345.678-9"
                    maxlength="30"
                    :aria-invalid="Boolean(formErrors.tax_id)"
                    aria-describedby="customer-tax-id-help customer-tax-id-error"
                    @blur="validateField('tax_id')"
                  />
                  <p id="customer-tax-id-help" class="field-help">Opcional. Si existe, debe ser único por empresa.</p>
                  <p v-if="formErrors.tax_id" id="customer-tax-id-error" class="field-error">{{ formErrors.tax_id }}</p>
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-legal-name">Nombre / Razón Social <span class="text-danger">*</span></label>
                  <input
                    id="customer-legal-name"
                    v-model="form.legal_name"
                    type="text"
                    :class="inputClass(formErrors.legal_name)"
                    placeholder="Nombre del cliente"
                    maxlength="180"
                    :aria-invalid="Boolean(formErrors.legal_name)"
                    aria-describedby="customer-legal-name-help customer-legal-name-error"
                    @blur="validateField('legal_name')"
                  />
                  <p id="customer-legal-name-help" class="field-help">Nombre legal para facturación y documentos tributarios.</p>
                  <p v-if="formErrors.legal_name" id="customer-legal-name-error" class="field-error">{{ formErrors.legal_name }}</p>
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-business-activity">Giro Comercial</label>
                  <input
                    id="customer-business-activity"
                    v-model="form.business_activity"
                    type="text"
                    :class="inputClass(formErrors.business_activity)"
                    placeholder="Comercio, Servicios, Industria..."
                    maxlength="120"
                    :aria-invalid="Boolean(formErrors.business_activity)"
                    aria-describedby="customer-business-activity-help customer-business-activity-error"
                    @blur="validateField('business_activity')"
                  />
                  <p id="customer-business-activity-help" class="field-help">Actividad económica principal del cliente.</p>
                  <p v-if="formErrors.business_activity" id="customer-business-activity-error" class="field-error">{{ formErrors.business_activity }}</p>
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
                  <div class="form-check form-switch">
                    <input
                      v-model="form.is_active"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="switchCustomerActive"
                      style="width:2.5em;height:1.3em;"
                    />
                    <label class="form-check-label ms-2 fw-semibold" for="switchCustomerActive">
                      <span :class="form.is_active ? 'text-success' : 'text-secondary'">
                        {{ form.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="panel-customer-contacto" role="tabpanel">
              <div class="row g-3 customer-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-email">Email</label>
                  <input
                    id="customer-email"
                    v-model="form.email"
                    type="email"
                    :class="inputClass(formErrors.email)"
                    placeholder="cliente@correo.com"
                    maxlength="160"
                    :aria-invalid="Boolean(formErrors.email)"
                    aria-describedby="customer-email-help customer-email-error"
                    @blur="validateField('email')"
                  />
                  <p id="customer-email-help" class="field-help">Canal principal para envío de documentos y notificaciones.</p>
                  <p v-if="formErrors.email" id="customer-email-error" class="field-error">{{ formErrors.email }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-phone">Teléfono</label>
                  <input
                    id="customer-phone"
                    v-model="form.phone"
                    type="tel"
                    :class="inputClass(formErrors.phone)"
                    placeholder="+56 9 1234 5678"
                    maxlength="40"
                    :aria-invalid="Boolean(formErrors.phone)"
                    aria-describedby="customer-phone-help customer-phone-error"
                    @blur="validateField('phone')"
                  />
                  <p id="customer-phone-help" class="field-help">Formato internacional recomendado para contacto rápido.</p>
                  <p v-if="formErrors.phone" id="customer-phone-error" class="field-error">{{ formErrors.phone }}</p>
                </div>

                <div class="col-md-6">
                  <CustomSelect
                    id="customer-commune"
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
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-city">Ciudad</label>
                  <input
                    id="customer-city"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-700"
                    :value="selectedCommuneMeta.city"
                    readonly
                    aria-readonly="true"
                  />
                </div>

                <div class="col-md-3">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-region">Región</label>
                  <input
                    id="customer-region"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-700"
                    :value="selectedCommuneMeta.region"
                    readonly
                    aria-readonly="true"
                  />
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-address">Dirección</label>
                  <input
                    id="customer-address"
                    v-model="form.address_line"
                    type="text"
                    :class="inputClass(formErrors.address_line)"
                    placeholder="Dirección del cliente"
                    maxlength="220"
                    :aria-invalid="Boolean(formErrors.address_line)"
                    aria-describedby="customer-address-help customer-address-error"
                    @blur="validateField('address_line')"
                  />
                  <p id="customer-address-help" class="field-help">Incluye calle, número y referencia para despacho/facturación.</p>
                  <p v-if="formErrors.address_line" id="customer-address-error" class="field-error">{{ formErrors.address_line }}</p>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="panel-customer-comercial" role="tabpanel">
              <div class="row g-3 customer-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-payment-terms">Plazo Pago (días)</label>
                  <NumberStepper
                    id="customer-payment-terms"
                    v-model="form.payment_terms_days"
                    :min="0"
                    :max="365"
                    :input-class="`${inputClass(formErrors.payment_terms_days)} number-stepper-input`"
                    :aria-invalid="Boolean(formErrors.payment_terms_days)"
                    aria-describedby="customer-payment-terms-help customer-payment-terms-error"
                    @blur="validateField('payment_terms_days')"
                  />
                  <p id="customer-payment-terms-help" class="field-help">Rango permitido: 0 a 365 días.</p>
                  <p v-if="formErrors.payment_terms_days" id="customer-payment-terms-error" class="field-error">{{ formErrors.payment_terms_days }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="customer-credit-limit">Límite Crédito</label>
                  <NumberStepper
                    id="customer-credit-limit"
                    v-model="form.credit_limit"
                    :min="0"
                    :step="0.0001"
                    :input-class="`${inputClass(formErrors.credit_limit)} number-stepper-input`"
                    :aria-invalid="Boolean(formErrors.credit_limit)"
                    aria-describedby="customer-credit-limit-help customer-credit-limit-error"
                    @blur="validateField('credit_limit')"
                  />
                  <p id="customer-credit-limit-help" class="field-help">Monto máximo de crédito autorizado para este cliente.</p>
                  <p v-if="formErrors.credit_limit" id="customer-credit-limit-error" class="field-error">{{ formErrors.credit_limit }}</p>
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

  <div class="modal fade" id="customerViewModal" tabindex="-1" aria-labelledby="customerViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow" v-if="selectedCustomer">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="customerViewModalLabel">
            <i class="fa-solid fa-user-group me-2 text-info"></i>Detalle de Cliente
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedCustomer.legal_name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedCustomer.legal_name }}</p>
              <p class="text-secondary small mb-0">{{ selectedCustomer.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedCustomer.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedCustomer.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedCustomer.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-id-card" label="RUT / Tax ID" :value="selectedCustomer.tax_id" /></div>
            <div class="col-md-6"><DetailRow icon="fa-briefcase" label="Giro" :value="selectedCustomer.business_activity" /></div>
            <div class="col-md-6"><DetailRow icon="fa-envelope" label="Email" :value="selectedCustomer.email" /></div>
            <div class="col-md-6"><DetailRow icon="fa-phone" label="Teléfono" :value="selectedCustomer.phone" /></div>
            <div class="col-md-6"><DetailRow icon="fa-location-dot" label="Dirección" :value="selectedCustomer.address_line" /></div>
            <div class="col-md-6"><DetailRow icon="fa-map-location-dot" label="Comuna" :value="selectedCustomer.commune_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-coins" label="Límite Crédito" :value="formatCurrency(selectedCustomer.credit_limit)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedCustomer.created_at)" /></div>
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
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "../composables/useCustomers";
import { useCommunes } from "../composables/useCommunes";
import type { CustomerItem } from "../services/customer.service";
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

const { data, isLoading, isError } = useCustomers();
const { data: communesData } = useCommunes();
const { mutateAsync: createCustomer } = useCreateCustomer();
const { mutateAsync: updateCustomer } = useUpdateCustomer();
const { mutateAsync: deleteCustomer } = useDeleteCustomer();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const customers = computed(() => data.value ?? []);
const selectedCustomer = ref<CustomerItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "legal_name" | "credit_limit" | "is_active" | "created_at">("legal_name");
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
  credit_limit: 0,
  is_active: true
});

type CustomerFormField = keyof ReturnType<typeof emptyForm>;

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
  credit_limit: "",
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

const filteredCustomers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return customers.value;

  return customers.value.filter((c) => {
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

const getComparableValue = (c: CustomerItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(c.id);
    case "created_at":
      return c.created_at ? new Date(c.created_at).getTime() : 0;
    case "credit_limit":
      return c.credit_limit;
    case "is_active":
      return c.is_active ? 1 : 0;
    default:
      return (c[key] ?? "").toString().toLowerCase();
  }
};

const sortedCustomers = computed(() => {
  const list = [...filteredCustomers.value];
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
const totalPages = computed(() => Math.max(1, Math.ceil(sortedCustomers.value.length / pageSizeNumber.value)));
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedCustomers.value.slice(start, start + pageSizeNumber.value);
});

const paginationStart = computed(() => filteredCustomers.value.length === 0 ? 0 : (currentPage.value - 1) * pageSizeNumber.value + 1);
const paginationEnd = computed(() => filteredCustomers.value.length === 0 ? 0 : Math.min(currentPage.value * pageSizeNumber.value, filteredCustomers.value.length));

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

  const firstTab = document.getElementById("tab-customer-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

async function openEditModal(customer: CustomerItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = customer.id;
  form.value = {
    code: customer.code,
    tax_id: customer.tax_id ?? "",
    legal_name: customer.legal_name,
    business_activity: customer.business_activity ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    address_line: customer.address_line ?? "",
    commune_id: customer.commune_id ?? "",
    payment_terms_days: customer.payment_terms_days,
    credit_limit: customer.credit_limit,
    is_active: customer.is_active
  };
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-customer-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

function openViewModal(customer: CustomerItem) {
  if (!isComponentActive) return;
  selectedCustomer.value = customer;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedCustomer.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedCustomer.value) return;
    void openEditModal(selectedCustomer.value);
  }, 350);
}

async function submitForm() {
  const hasErrors = validateForm();
  if (hasErrors) {
    return showValidationError("Revisa los campos resaltados para continuar.");
  }

  const f = form.value;
  const normalizedPaymentTerms = Number(f.payment_terms_days || 0);
  const normalizedCreditLimit = Number(f.credit_limit || 0);

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateCustomer({
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
          credit_limit: normalizedCreditLimit,
          is_active: f.is_active
        }
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Cliente actualizado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } else {
      await createCustomer({
        code: f.code,
        tax_id: f.tax_id || undefined,
        legal_name: f.legal_name,
        business_activity: f.business_activity || undefined,
        email: f.email || undefined,
        phone: f.phone || undefined,
        address_line: f.address_line || undefined,
        commune_id: f.commune_id ? Number(f.commune_id) : undefined,
        payment_terms_days: normalizedPaymentTerms,
        credit_limit: normalizedCreditLimit,
        is_active: f.is_active
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Cliente creado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
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
    error ? "border-danger customer-form-input-error" : "border-slate-300"
  ];
}

function validateField(field: CustomerFormField): string {
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

  if (field === "credit_limit") {
    const value = Number(f.credit_limit || 0);
    if (!Number.isFinite(value) || value < 0) {
      error = "El límite de crédito no puede ser negativo.";
    }
  }

  formErrors.value[field] = error;
  return error;
}

function validateForm() {
  const fields: CustomerFormField[] = [
    "code",
    "tax_id",
    "legal_name",
    "business_activity",
    "email",
    "phone",
    "address_line",
    "commune_id",
    "payment_terms_days",
    "credit_limit"
  ];

  let hasErrors = false;
  fields.forEach((field) => {
    if (validateField(field)) {
      hasErrors = true;
    }
  });

  if (formErrors.value.code || formErrors.value.legal_name) {
    const generalTab = document.getElementById("tab-customer-general");
    if (generalTab) (generalTab as HTMLElement).click();
  } else if (formErrors.value.email || formErrors.value.phone || formErrors.value.address_line || formErrors.value.commune_id) {
    const contactTab = document.getElementById("tab-customer-contacto");
    if (contactTab) (contactTab as HTMLElement).click();
  } else if (formErrors.value.payment_terms_days || formErrors.value.credit_limit) {
    const commercialTab = document.getElementById("tab-customer-comercial");
    if (commercialTab) (commercialTab as HTMLElement).click();
  }

  return hasErrors;
}

async function confirmDelete(customer: CustomerItem) {
  if (customer.dependencies_count > 0) {
    await Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      text: "El cliente tiene contactos, documentos o ventas asociadas.",
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar cliente?",
    html: `<p class="mb-0">Estás por eliminar <strong>${customer.legal_name}</strong>.<br>Esta acción desactivará el registro.</p>`,
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
    await deleteCustomer(customer.id);
    await Swal.fire({ icon: "success", title: "Cliente eliminado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar el cliente.";
    await Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonText: "Cerrar", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value ?? 0);
};
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

#customerFormTabs .nav-link {
  font-size: .875rem;
  padding: .5rem .9rem;
}

.customer-form-modal-body {
  overflow-x: hidden;
}

.customer-form-tab-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.customer-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.customer-form-tabs .nav-link {
  white-space: normal;
  word-break: break-word;
}

.customer-form-grid {
  min-width: 0;
}

.customer-form-grid .col-md-6,
.customer-form-grid .col-12 {
  min-width: 0;
}

.customer-form-grid :deep(.relative),
.customer-form-grid :deep(button),
.customer-form-grid :deep(input),
.customer-form-grid :deep(select) {
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

.customer-form-input-error {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 0.12rem rgba(220, 38, 38, 0.2);
}

@media (max-width: 575.98px) {
  .customer-form-tab-content {
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
  }
}
</style>
