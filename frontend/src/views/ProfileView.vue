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
              <li class="breadcrumb-item active" aria-current="page">Perfil</li>
            </ol>
          </nav>

          <section class="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <header class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <h1 class="h4 fw-bold text-dark mb-1">Mi Perfil</h1>
                <p class="text-secondary mb-0">Gestiona tu información personal y credenciales de acceso.</p>
              </div>
              <div class="d-flex align-items-center gap-2 text-secondary small">
                <i class="fa-solid fa-shield-halved text-success"></i>
                <span>Sesión activa protegida</span>
              </div>
            </header>

            <div v-if="isLoading" class="py-5 text-center text-secondary">
              <div class="spinner-border text-secondary mb-3" role="status" aria-hidden="true"></div>
              <p class="mb-0">Cargando información del perfil...</p>
            </div>

            <div v-else-if="loadError" class="alert alert-danger rounded-4" role="alert">
              {{ loadError }}
            </div>

            <div v-else class="row g-4">
              <!-- ── Audit history ── -->
              <div v-if="auditEntries.length > 0 || isLoadingAudit" class="col-12">
                <article class="border rounded-4 p-4">
                  <h2 class="h6 fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                    <i class="fa-solid fa-clock-rotate-left text-secondary"></i>
                    Historial de cambios
                  </h2>

                  <div v-if="isLoadingAudit" class="py-3 text-center text-secondary">
                    <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                    <span class="small">Cargando historial...</span>
                  </div>

                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle mb-0 small">
                      <thead class="table-light">
                        <tr>
                          <th scope="col" class="text-nowrap">Fecha</th>
                          <th scope="col">Campos modificados</th>
                          <th scope="col">Valor anterior</th>
                          <th scope="col">Nuevo valor</th>
                          <th scope="col" class="text-nowrap">Dirección IP</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="entry in auditEntries" :key="entry.id">
                          <td class="text-nowrap text-secondary">{{ formatAuditDate(entry.changed_at) }}</td>
                          <td>
                            <span
                              v-for="field in entry.changed_fields"
                              :key="field"
                              class="badge bg-secondary-subtle text-secondary-emphasis me-1"
                            >{{ fieldLabel(field) }}</span>
                          </td>
                          <td class="text-secondary">
                            <div v-if="entry.old_data.full_name !== undefined" class="text-truncate" style="max-width:180px" :title="entry.old_data.full_name">{{ entry.old_data.full_name }}</div>
                            <div v-if="entry.old_data.email !== undefined" class="text-truncate" style="max-width:180px" :title="entry.old_data.email">{{ entry.old_data.email }}</div>
                          </td>
                          <td>
                            <div v-if="entry.new_data.full_name !== undefined" class="text-truncate fw-medium" style="max-width:180px" :title="entry.new_data.full_name">{{ entry.new_data.full_name }}</div>
                            <div v-if="entry.new_data.email !== undefined" class="text-truncate fw-medium" style="max-width:180px" :title="entry.new_data.email">{{ entry.new_data.email }}</div>
                          </td>
                          <td class="text-secondary text-nowrap">{{ entry.ip_address ?? '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>

              <div class="col-12 col-xl-7">
                <article class="border rounded-4 p-4 h-100">
                  <h2 class="h6 fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                    <i class="fa-regular fa-user text-brick-ember-600"></i>
                    Datos personales
                  </h2>

                  <form class="row g-3" @submit.prevent="handleSaveProfile">
                    <div class="col-12">
                      <label for="profile-full-name" class="form-label fw-semibold text-dark">Nombre completo</label>
                      <input
                        id="profile-full-name"
                        v-model="profileForm.full_name"
                        type="text"
                        class="form-control"
                        minlength="3"
                        maxlength="160"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div class="col-12">
                      <label for="profile-email" class="form-label fw-semibold text-dark">Correo electrónico</label>
                      <input
                        id="profile-email"
                        v-model="profileForm.email"
                        type="email"
                        class="form-control"
                        maxlength="160"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold text-dark">Rol</label>
                      <input :value="userRoleLabel" type="text" class="form-control" disabled />
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold text-dark">Estado</label>
                      <input :value="profileRecord?.is_active ? 'Activo' : 'Inactivo'" type="text" class="form-control" disabled />
                    </div>

                    <div class="col-12">
                      <button
                        type="submit"
                        class="btn btn-primary rounded-3 px-4"
                        :disabled="isSavingProfile"
                        :aria-busy="isSavingProfile"
                      >
                        <span v-if="isSavingProfile" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                        Guardar cambios
                      </button>
                    </div>
                  </form>
                </article>
              </div>

              <div class="col-12 col-xl-5">
                <article class="border rounded-4 p-4 h-100">
                  <h2 class="h6 fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                    <i class="fa-solid fa-key text-cayenne-red-600"></i>
                    Cambiar contraseña
                  </h2>

                  <form class="row g-3" @submit.prevent="handleChangePassword">
                    <div class="col-12">
                      <label for="profile-current-password" class="form-label fw-semibold text-dark">Contraseña actual</label>
                      <input
                        id="profile-current-password"
                        v-model="passwordForm.currentPassword"
                        type="password"
                        class="form-control"
                        minlength="8"
                        maxlength="64"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div class="col-12">
                      <label for="profile-new-password" class="form-label fw-semibold text-dark">Nueva contraseña</label>
                      <input
                        id="profile-new-password"
                        v-model="passwordForm.newPassword"
                        type="password"
                        class="form-control"
                        minlength="8"
                        maxlength="64"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div class="col-12">
                      <label for="profile-confirm-password" class="form-label fw-semibold text-dark">Confirmar nueva contraseña</label>
                      <input
                        id="profile-confirm-password"
                        v-model="passwordForm.confirmPassword"
                        type="password"
                        class="form-control"
                        minlength="8"
                        maxlength="64"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div class="col-12">
                      <p class="small text-secondary mb-2">
                        Por seguridad, al cambiar tu contraseña se cerrará la sesión actual.
                      </p>
                      <button
                        type="submit"
                        class="btn btn-outline-danger rounded-3 px-4"
                        :disabled="isChangingPassword"
                        :aria-busy="isChangingPassword"
                      >
                        <span v-if="isChangingPassword" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                        Actualizar contraseña
                      </button>
                    </div>
                  </form>
                </article>
              </div>
            </div>
          </section>
        </div>
      </main>

      <DashFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import { authService } from "../services/auth.service";
import { userService, type UserItem, type AuditEntry } from "../services/user.service";
import { useSessionStore } from "../store/session.store";

const router = useRouter();
const sessionStore = useSessionStore();
const sidebarOpen = ref(false);
const isLoading = ref(true);
const isSavingProfile = ref(false);
const isChangingPassword = ref(false);
const loadError = ref("");
const profileRecord = ref<UserItem | null>(null);
const auditEntries = ref<AuditEntry[]>([]);
const isLoadingAudit = ref(false);

const profileForm = reactive({
  full_name: "",
  email: ""
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const userRoleLabel = computed(() => profileRecord.value?.primary_role || sessionStore.user?.role || "Usuario");

async function loadProfile() {
  isLoading.value = true;
  loadError.value = "";

  try {
    const profile = await userService.getMe();
    profileRecord.value = profile;
    profileForm.full_name = profile.full_name;
    profileForm.email = profile.email;

    authService.setUser({
      id: Number(profile.id),
      email: profile.email,
      fullName: profile.full_name,
      role: profile.primary_role
    });

    sessionStore.setSession(authService.getToken() ?? "", {
      id: Number(profile.id),
      email: profile.email,
      role: profile.primary_role || "Usuario"
    });
  } catch (error: any) {
    loadError.value = error?.message || "No fue posible cargar el perfil.";
  } finally {
    isLoading.value = false;
  }
}

async function handleSaveProfile() {
  if (!profileRecord.value) {
    return;
  }

  isSavingProfile.value = true;

  try {
    const updated = await userService.updateMe({
      full_name: profileForm.full_name.trim(),
      email: profileForm.email.trim()
    });

    profileRecord.value = updated;

    authService.setUser({
      id: Number(updated.id),
      email: updated.email,
      fullName: updated.full_name,
      role: updated.primary_role
    });

    sessionStore.setSession(authService.getToken() ?? "", {
      id: Number(updated.id),
      email: updated.email,
      role: updated.primary_role || "Usuario"
    });

    await Swal.fire({
      icon: "success",
      title: "Perfil actualizado",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2300,
      timerProgressBar: true
    });
  } catch (error: any) {
    await Swal.fire({
      icon: "error",
      title: "No se pudo actualizar el perfil",
      text: error?.message || "Intenta nuevamente.",
      confirmButtonText: "Entendido"
    });
  } finally {
    isSavingProfile.value = false;
  }
}

async function handleChangePassword() {
  if (!profileRecord.value) {
    return;
  }

  const currentPassword = passwordForm.currentPassword.trim();
  const newPassword = passwordForm.newPassword.trim();
  const confirmPassword = passwordForm.confirmPassword.trim();

  if (newPassword.length < 8) {
    await Swal.fire({
      icon: "warning",
      title: "Validación",
      text: "La nueva contraseña debe tener al menos 8 caracteres.",
      confirmButtonText: "Entendido"
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    await Swal.fire({
      icon: "warning",
      title: "Validación",
      text: "La confirmación de contraseña no coincide.",
      confirmButtonText: "Entendido"
    });
    return;
  }

  if (currentPassword === newPassword) {
    await Swal.fire({
      icon: "warning",
      title: "Validación",
      text: "La nueva contraseña debe ser diferente a la actual.",
      confirmButtonText: "Entendido"
    });
    return;
  }

  isChangingPassword.value = true;

  try {
    await userService.updateMyPassword({
      current_password: currentPassword,
      new_password: newPassword
    });

    await Swal.fire({
      icon: "success",
      title: "Contraseña actualizada",
      text: "Por seguridad, debes iniciar sesión nuevamente.",
      confirmButtonText: "Aceptar"
    });

    sessionStore.clearSession();
    authService.logout();
    await router.replace("/login");
  } catch (error: any) {
    await Swal.fire({
      icon: "error",
      title: "No se pudo cambiar la contraseña",
      text: error?.message || "Verifica tu contraseña actual e inténtalo nuevamente.",
      confirmButtonText: "Entendido"
    });
  } finally {
    isChangingPassword.value = false;
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
  }
}

function formatAuditDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
}

function fieldLabel(field: string): string {
  const map: Record<string, string> = { full_name: "Nombre", email: "Correo" };
  return map[field] ?? field;
}

async function loadAudit() {
  isLoadingAudit.value = true;
  try {
    auditEntries.value = await userService.getMyAudit(50);
  } catch {
    // Non-critical: silently skip if audit endpoint fails
  } finally {
    isLoadingAudit.value = false;
  }
}

onMounted(() => {
  loadProfile();
  loadAudit();
});
</script>
