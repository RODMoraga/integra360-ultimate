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
              <li class="breadcrumb-item active" aria-current="page">Empresas</li>
            </ol>
          </nav>

          <!-- Page header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-building me-2 text-brick-ember"></i>Gestión de Empresas
              </h1>
              <p class="text-secondary small mb-0">Administra las empresas registradas en el sistema.</p>
            </div>
            <button
              class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3"
              @click="openCreateModal"
            >
              <i class="fa-solid fa-plus"></i>
              Nueva Empresa
            </button>
          </div>

          <!-- Table card -->
          <div class="bg-white rounded-4 shadow-sm p-4">
            <!-- Loader overlay -->
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando empresas...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las empresas. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 420px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, razón social, RUT, email o comuna"
                    aria-label="Buscar empresas"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <label for="companiesPageSize" class="small text-secondary mb-0">Mostrar</label>
                  <select id="companiesPageSize" v-model.number="pageSize" class="form-select form-select-sm" style="width: 88px;">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                  </select>
                  <span class="small text-secondary">registros</span>
                </div>
              </div>

              <div class="table-responsive">
                <table
                  id="companiesTable"
                  class="table table-hover align-middle table-striped w-100"
                >
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('legal_name')">Razón Social <i :class="sortIcon('legal_name')"></i></button></th>
                      <th>Nombre Comercial</th>
                      <th>RUT / Tax ID</th>
                      <th>Giro</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Dirección</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('commune_name')">Comuna <i :class="sortIcon('commune_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('timezone')">Zona Horaria <i :class="sortIcon('timezone')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('currency_code')">Moneda <i :class="sortIcon('currency_code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_active')">Estado <i :class="sortIcon('is_active')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="company in paginatedCompanies" :key="company.id">
                      <td class="text-secondary small">{{ company.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ company.code }}</span></td>
                      <td class="fw-semibold">{{ company.legal_name }}</td>
                      <td>{{ company.trade_name ?? '—' }}</td>
                      <td class="font-monospace small">{{ company.tax_id }}</td>
                      <td>{{ company.industry_type ?? '—' }}</td>
                      <td>
                        <a v-if="company.email" :href="`mailto:${company.email}`" class="text-decoration-none text-primary small">
                          {{ company.email }}
                        </a>
                        <span v-else class="text-secondary">—</span>
                      </td>
                      <td class="small">{{ company.phone ?? '—' }}</td>
                      <td class="small" style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" :title="company.address_line ?? ''">
                        {{ company.address_line ?? '—' }}
                      </td>
                      <td class="small">{{ company.commune_name ?? '—' }}</td>
                      <td class="small">{{ company.timezone }}</td>
                      <td><span class="badge bg-light text-dark border">{{ company.currency_code }}</span></td>
                      <td>
                        <span
                          class="badge rounded-pill"
                          :class="company.is_active ? 'text-bg-success' : 'text-bg-secondary'"
                        >
                          <i class="fa-solid fa-circle me-1" style="font-size:.5rem;vertical-align:middle;"></i>
                          {{ company.is_active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(company.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="d-flex gap-1 justify-content-center">
                          <button
                            class="btn btn-sm btn-outline-info rounded-3 px-2"
                            @click="openViewModal(company)"
                            title="Ver detalle"
                          >
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-warning rounded-3 px-2"
                            @click="openEditModal(company)"
                            title="Editar empresa"
                          >
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger rounded-3 px-2"
                            @click="confirmDelete(company)"
                            title="Eliminar empresa"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedCompanies.length === 0">
                      <td colspan="15" class="text-center text-secondary py-4">No se encontraron empresas para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredCompanies.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación empresas">
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
  <div
    class="modal fade"
    id="companyFormModal"
    tabindex="-1"
    aria-labelledby="companyFormModalLabel"
    aria-hidden="true"
    ref="formModalRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="companyFormModalLabel">
            <i class="fa-solid fa-building me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Empresa' : 'Nueva Empresa' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 company-form-modal-body">
          <!-- Nav Tabs -->
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 company-form-tabs" id="companyFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-general" data-bs-toggle="tab" data-bs-target="#panel-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-contacto" data-bs-toggle="tab" data-bs-target="#panel-contacto" type="button" role="tab">
                <i class="fa-solid fa-address-book me-1"></i>Contacto
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-config" data-bs-toggle="tab" data-bs-target="#panel-config" type="button" role="tab">
                <i class="fa-solid fa-sliders me-1"></i>Configuración
              </button>
            </li>
          </ul>

          <div class="tab-content company-form-tab-content">
            <!-- ── General ── -->
            <div class="tab-pane fade show active" id="panel-general" role="tabpanel">
              <div class="row g-3 company-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Código <span class="text-danger">*</span></label>
                  <input
                    v-model="form.code"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="EJ: EMP-001"
                    :disabled="isEditMode"
                    maxlength="40"
                  />
                </div>
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">RUT / Tax ID <span class="text-danger">*</span></label>
                  <input
                    v-model="form.tax_id"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="12.345.678-9"
                    :disabled="isEditMode"
                    maxlength="30"
                  />
                </div>
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Razón Social <span class="text-danger">*</span></label>
                  <input
                    v-model="form.legal_name"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="Nombre legal de la empresa"
                    maxlength="180"
                  />
                </div>
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre Comercial</label>
                  <input
                    v-model="form.trade_name"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="Nombre con el que opera comercialmente"
                    maxlength="180"
                  />
                </div>
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Giro / Industria</label>
                  <input
                    v-model="form.industry_type"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="Retail, Manufactura, Servicios..."
                    maxlength="60"
                  />
                </div>
              </div>
            </div>

            <!-- ── Contacto ── -->
            <div class="tab-pane fade" id="panel-contacto" role="tabpanel">
              <div class="row g-3 company-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="contacto@empresa.cl"
                    maxlength="160"
                  />
                </div>
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Teléfono</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="+56 9 1234 5678"
                    maxlength="40"
                  />
                </div>
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Dirección</label>
                  <input
                    v-model="form.address_line"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                    placeholder="Av. Ejemplo 123, Piso 4"
                    maxlength="220"
                  />
                </div>
              </div>
            </div>

            <!-- ── Configuración ── -->
            <div class="tab-pane fade" id="panel-config" role="tabpanel">
              <div class="row g-3 company-form-grid">
                <div class="col-md-6">
                  <CustomSelect
                    id="company-timezone"
                    v-model="form.timezone"
                    label="Zona Horaria"
                    placeholder="Seleccionar zona horaria"
                    :options="timezoneOptions"
                    :searchable="true"
                  />
                </div>
                <div class="col-md-6">
                  <CustomSelect
                    id="company-currency"
                    v-model="form.currency_code"
                    label="Moneda"
                    placeholder="Seleccionar moneda"
                    :options="currencyOptions"
                    :searchable="true"
                  />
                </div>
                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
                  <div class="form-check form-switch">
                    <input
                      v-model="form.is_active"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="switchIsActive"
                      style="width:2.5em;height:1.3em;"
                    />
                    <label class="form-check-label ms-2 fw-semibold" for="switchIsActive">
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
    id="companyViewModal"
    tabindex="-1"
    aria-labelledby="companyViewModalLabel"
    aria-hidden="true"
    ref="viewModalRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedCompany">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="companyViewModalLabel">
            <i class="fa-solid fa-building me-2 text-info"></i>Detalle de Empresa
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedCompany.legal_name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedCompany.legal_name }}</p>
              <p class="text-secondary small mb-0">{{ selectedCompany.trade_name ?? selectedCompany.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedCompany.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedCompany.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedCompany.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-id-card" label="RUT / Tax ID" :value="selectedCompany.tax_id" /></div>
            <div class="col-md-6"><DetailRow icon="fa-industry" label="Giro" :value="selectedCompany.industry_type" /></div>
            <div class="col-md-6"><DetailRow icon="fa-envelope" label="Email" :value="selectedCompany.email" /></div>
            <div class="col-md-6"><DetailRow icon="fa-phone" label="Teléfono" :value="selectedCompany.phone" /></div>
            <div class="col-md-6"><DetailRow icon="fa-location-dot" label="Dirección" :value="selectedCompany.address_line" /></div>
            <div class="col-md-6"><DetailRow icon="fa-map-pin" label="Comuna" :value="selectedCompany.commune_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-clock" label="Zona Horaria" :value="selectedCompany.timezone" /></div>
            <div class="col-md-6"><DetailRow icon="fa-coins" label="Moneda" :value="selectedCompany.currency_code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedCompany.created_at)" /></div>
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
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from "../composables/useCompanies";
import type { CompanyItem } from "../services/company.service";
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
const { data, isLoading, isError } = useCompanies();
const { mutateAsync: createCompany } = useCreateCompany();
const { mutateAsync: updateCompany } = useUpdateCompany();
const { mutateAsync: deleteCompany } = useDeleteCompany();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const companies = computed(() => data.value ?? []);
const selectedCompany = ref<CompanyItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "legal_name" | "commune_name" | "timezone" | "currency_code" | "is_active" | "created_at">("created_at");
const sortDirection = ref<"asc" | "desc">("desc");

const emptyForm = () => ({
  code: "",
  legal_name: "",
  trade_name: "",
  tax_id: "",
  industry_type: "",
  email: "",
  phone: "",
  address_line: "",
  timezone: "America/Santiago",
  currency_code: "CLP",
  is_active: true
});

const form = ref(emptyForm());

const timezoneOptions: SelectOption[] = [
  { label: "America/Santiago (Chile)", value: "America/Santiago" },
  { label: "America/New_York (EST)", value: "America/New_York" },
  { label: "America/Bogota (Colombia)", value: "America/Bogota" },
  { label: "America/Lima (Peru)", value: "America/Lima" },
  { label: "America/Buenos_Aires (Argentina)", value: "America/Buenos_Aires" },
  { label: "UTC", value: "UTC" }
];

const currencyOptions: SelectOption[] = [
  { label: "CLP - Peso Chileno", value: "CLP" },
  { label: "USD - Dolar Americano", value: "USD" },
  { label: "EUR - Euro", value: "EUR" },
  { label: "PEN - Sol Peruano", value: "PEN" },
  { label: "COP - Peso Colombiano", value: "COP" },
  { label: "ARS - Peso Argentino", value: "ARS" }
];

const filteredCompanies = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return companies.value;
  }

  return companies.value.filter((company) => {
    const searchable = [
      String(company.id),
      company.code,
      company.legal_name,
      company.trade_name ?? "",
      company.tax_id,
      company.industry_type ?? "",
      company.email ?? "",
      company.phone ?? "",
      company.address_line ?? "",
      company.commune_name ?? "",
      company.timezone,
      company.currency_code,
      company.is_active ? "activo" : "inactivo"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (company: CompanyItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(company.id);
    case "created_at":
      return company.created_at ? new Date(company.created_at).getTime() : 0;
    case "is_active":
      return company.is_active ? 1 : 0;
    default:
      return (company[key] ?? "").toString().toLowerCase();
  }
};

const sortedCompanies = computed(() => {
  const list = [...filteredCompanies.value];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  list.sort((a, b) => {
    const left = getComparableValue(a, sortKey.value);
    const right = getComparableValue(b, sortKey.value);

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

const totalPages = computed(() => Math.max(1, Math.ceil(sortedCompanies.value.length / pageSize.value)));

const paginatedCompanies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedCompanies.value.slice(start, start + pageSize.value);
});

const paginationStart = computed(() => {
  if (filteredCompanies.value.length === 0) {
    return 0;
  }
  return (currentPage.value - 1) * pageSize.value + 1;
});

const paginationEnd = computed(() => {
  if (filteredCompanies.value.length === 0) {
    return 0;
  }
  return Math.min(currentPage.value * pageSize.value, filteredCompanies.value.length);
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
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  currentPage.value = safePage;
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

/* ─── Helpers ─── */
/**
 * Formats ISO date strings using `es-CL` locale.
 */
/* ─── Modal actions ─── */
/**
 * Opens the create modal and resets form state.
 */
async function openCreateModal() {
  if (!isComponentActive) return;
  isEditMode.value = false;
  editingId.value = null;
  form.value = emptyForm();

  await nextTick();
  if (!isComponentActive) return;

  // Reset to first tab
  const firstTab = document.getElementById("tab-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

/**
 * Opens edit modal and hydrates form from selected company.
 */
async function openEditModal(company: CompanyItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = company.id;
  form.value = {
    code: company.code,
    legal_name: company.legal_name,
    trade_name: company.trade_name ?? "",
    tax_id: company.tax_id,
    industry_type: company.industry_type ?? "",
    email: company.email ?? "",
    phone: company.phone ?? "",
    address_line: company.address_line ?? "",
    timezone: company.timezone,
    currency_code: company.currency_code,
    is_active: company.is_active
  };

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

/**
 * Opens read-only detail modal.
 */
function openViewModal(company: CompanyItem) {
  if (!isComponentActive) return;
  selectedCompany.value = company;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

/**
 * Jumps from detail modal to edit modal preserving selected company.
 */
function openEditFromView() {
  if (!isComponentActive || !selectedCompany.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedCompany.value) return;
    void openEditModal(selectedCompany.value);
  }, 350);
}

/* ─── Submit ─── */
/**
 * Validates form input and dispatches create/update mutation.
 */
async function submitForm() {
  const f = form.value;
  if (!f.legal_name.trim()) return showValidationError("La razón social es obligatoria.");
  if (!isEditMode.value) {
    if (!f.code.trim()) return showValidationError("El código es obligatorio.");
    if (!f.tax_id.trim()) return showValidationError("El RUT / Tax ID es obligatorio.");
  }
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    return showValidationError("El formato de email no es válido.");
  }

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateCompany({
        id: editingId.value,
        payload: {
          legal_name: f.legal_name,
          trade_name: f.trade_name || undefined,
          industry_type: f.industry_type || undefined,
          email: f.email || undefined,
          phone: f.phone || undefined,
          address_line: f.address_line || undefined,
          timezone: f.timezone,
          currency_code: f.currency_code,
          is_active: f.is_active
        }
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Empresa actualizada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } else {
      await createCompany({
        code: f.code,
        legal_name: f.legal_name,
        tax_id: f.tax_id,
        trade_name: f.trade_name || undefined,
        industry_type: f.industry_type || undefined,
        email: f.email || undefined,
        phone: f.phone || undefined,
        address_line: f.address_line || undefined,
        timezone: f.timezone,
        currency_code: f.currency_code,
        is_active: f.is_active
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Empresa creada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    }
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ocurrió un error inesperado.";
    await Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonText: "Entendido", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
  } finally {
    isSaving.value = false;
  }
}

/**
 * Displays a standardized validation alert.
 */
function showValidationError(msg: string) {
  Swal.fire({ icon: "warning", title: "Validación", text: msg, confirmButtonText: "Entendido", customClass: { confirmButton: "btn btn-warning rounded-3 px-4" } });
}

/* ─── Delete ─── */
/**
 * Shows confirmation dialog and soft-deletes the selected company.
 */
async function confirmDelete(company: CompanyItem) {
  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar empresa?",
    html: `<p class="mb-0">Estás por eliminar <strong>${company.legal_name}</strong>.<br>Esta acción desactivará el registro.</p>`,
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
    await deleteCompany(company.id);
    await Swal.fire({ icon: "success", title: "Empresa eliminada", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
  } catch {
    await Swal.fire({ icon: "error", title: "Error", text: "No fue posible eliminar la empresa.", confirmButtonText: "Cerrar", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
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

/* Scrollable tab content */
#companyFormTabs .nav-link {
  font-size: .875rem;
  padding: .5rem .9rem;
}

.company-form-modal-body {
  overflow-x: hidden;
}

.company-form-tab-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.company-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.company-form-tabs .nav-link {
  white-space: normal;
  word-break: break-word;
}

.company-form-grid {
  min-width: 0;
}

.company-form-grid .col-md-6,
.company-form-grid .col-12 {
  min-width: 0;
}

.company-form-grid :deep(.relative),
.company-form-grid :deep(button),
.company-form-grid :deep(input),
.company-form-grid :deep(select) {
  max-width: 100%;
}
</style>
