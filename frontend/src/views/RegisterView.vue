<template>
  <div class="min-h-screen bg-white flex items-stretch">
    <!-- Left Column: Branding & Visual -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ink-black-900 via-night-bordeaux-800 to-black-cherry-900 flex-col justify-center items-center p-12 relative overflow-hidden">
      <!-- Decorative gradient circles -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-brick-ember-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute bottom-20 right-10 w-72 h-72 bg-cayenne-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/3 w-72 h-72 bg-deep-saffron-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <!-- Content -->
      <div class="relative z-10 text-center">
        <!-- Logo/Brand -->
        <div class="mb-8">
          <h1 class="text-5xl font-bold text-white mb-2">Integra360</h1>
          <p class="text-lg text-white/80 font-light">Únete a nuestro ecosistema</p>
        </div>

        <!-- Benefits -->
        <div class="mt-12 space-y-6">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-brick-ember-500/20 border border-brick-ember-400/30">
                <svg class="h-6 w-6 text-brick-ember-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">Gratis & Fácil</h3>
              <p class="text-sm text-white/70 mt-1">Crea tu cuenta en menos de 2 minutos</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-cayenne-red-500/20 border border-cayenne-red-400/30">
                <svg class="h-6 w-6 text-cayenne-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">100% Seguro</h3>
              <p class="text-sm text-white/70 mt-1">Tus datos están protegidos con encriptación</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-deep-saffron-500/20 border border-deep-saffron-400/30">
                <svg class="h-6 w-6 text-deep-saffron-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5-4a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">Soporte 24/7</h3>
              <p class="text-sm text-white/70 mt-1">Nuestro equipo está aquí para ayudarte</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Register Form -->
    <div class="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-8 lg:px-12">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-ink-black-900 mb-2">Crear Cuenta</h2>
          <p class="text-ink-black-600">Completa el formulario para comenzar</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Full Name Field -->
          <div>
            <label for="fullName" class="block text-sm font-medium text-ink-black-900 mb-2">
              Nombre Completo
            </label>
            <div class="relative">
              <input
                id="fullName"
                v-model="formData.fullName"
                type="text"
                placeholder="Juan Pérez"
                required
                aria-label="Nombre Completo"
                :aria-invalid="fullNameError !== ''"
                :aria-describedby="fullNameError ? 'fullName-error' : undefined"
                class="w-full px-4 py-3 rounded-lg border-2 border-ink-black-200 bg-white text-ink-black-900 placeholder-ink-black-400 transition-all duration-300 focus:outline-none focus:border-brick-ember-500 focus:ring-4 focus:ring-brick-ember-200 hover:border-ink-black-300"
                @blur="validateFullName"
              />
            </div>
            <transition name="fade">
              <p v-if="fullNameError" :id="fullNameError ? 'fullName-error' : undefined" class="mt-2 text-sm text-night-bordeaux-600">{{ fullNameError }}</p>
            </transition>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-ink-black-900 mb-2">
              Correo Electrónico
            </label>
            <div class="relative">
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="tu@email.com"
                required
                aria-label="Correo Electrónico"
                :aria-invalid="emailError !== ''"
                :aria-describedby="emailError ? 'email-error' : undefined"
                class="w-full px-4 py-3 rounded-lg border-2 border-ink-black-200 bg-white text-ink-black-900 placeholder-ink-black-400 transition-all duration-300 focus:outline-none focus:border-brick-ember-500 focus:ring-4 focus:ring-brick-ember-200 hover:border-ink-black-300"
                @blur="validateEmail"
              />
            </div>
            <transition name="fade">
              <p v-if="emailError" :id="emailError ? 'email-error' : undefined" class="mt-2 text-sm text-night-bordeaux-600">{{ emailError }}</p>
            </transition>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-ink-black-900 mb-2">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                aria-label="Contraseña"
                :aria-invalid="passwordError !== ''"
                :aria-describedby="passwordError ? 'password-error' : undefined"
                class="w-full px-4 py-3 pr-12 rounded-lg border-2 border-ink-black-200 bg-white text-ink-black-900 placeholder-ink-black-400 transition-all duration-300 focus:outline-none focus:border-brick-ember-500 focus:ring-4 focus:ring-brick-ember-200 hover:border-ink-black-300"
                @blur="validatePassword"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-black-500 hover:text-ink-black-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brick-ember-500 rounded"
              >
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.394 11.965a6 6 0 00-8.759-8.759m8.759 8.759L21 3m-8.759 8.759l-8.759-8.759"></path>
                </svg>
              </button>
            </div>
            <transition name="fade">
              <p v-if="passwordError" :id="passwordError ? 'password-error' : undefined" class="mt-2 text-sm text-night-bordeaux-600">{{ passwordError }}</p>
            </transition>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-ink-black-900 mb-2">
              Confirmar Contraseña
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                aria-label="Confirmar Contraseña"
                :aria-invalid="confirmPasswordError !== ''"
                :aria-describedby="confirmPasswordError ? 'confirmPassword-error' : undefined"
                class="w-full px-4 py-3 pr-12 rounded-lg border-2 border-ink-black-200 bg-white text-ink-black-900 placeholder-ink-black-400 transition-all duration-300 focus:outline-none focus:border-brick-ember-500 focus:ring-4 focus:ring-brick-ember-200 hover:border-ink-black-300"
                @blur="validateConfirmPassword"
              />
              <button
                type="button"
                @click="toggleConfirmPasswordVisibility"
                :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-black-500 hover:text-ink-black-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brick-ember-500 rounded"
              >
                <svg v-if="!showConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.394 11.965a6 6 0 00-8.759-8.759m8.759 8.759L21 3m-8.759 8.759l-8.759-8.759"></path>
                </svg>
              </button>
            </div>
            <transition name="fade">
              <p v-if="confirmPasswordError" :id="confirmPasswordError ? 'confirmPassword-error' : undefined" class="mt-2 text-sm text-night-bordeaux-600">{{ confirmPasswordError }}</p>
            </transition>
          </div>

          <!-- Terms & Privacy -->
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              v-model="formData.acceptTerms"
              type="checkbox"
              class="w-4 h-4 mt-1 rounded border-ink-black-300 text-brick-ember-600 focus:ring-brick-ember-500 cursor-pointer"
              :aria-invalid="!formData.acceptTerms && attemptedSubmit"
            />
            <span class="text-sm text-ink-black-700">
              Acepto los
              <a href="#" class="text-brick-ember-600 hover:text-brick-ember-700 font-medium">Términos de Servicio</a>
              y la
              <a href="#" class="text-brick-ember-600 hover:text-brick-ember-700 font-medium">Política de Privacidad</a>
            </span>
          </label>

          <!-- Server Error -->
          <transition name="fade">
            <div v-if="serverError" class="p-4 rounded-lg bg-night-bordeaux-50 border border-night-bordeaux-200">
              <div class="flex gap-3">
                <svg class="h-5 w-5 text-night-bordeaux-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-night-bordeaux-900">Error en el registro</p>
                  <p class="text-sm text-night-bordeaux-700 mt-1">{{ serverError }}</p>
                </div>
              </div>
            </div>
          </transition>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="w-full py-3 px-4 mt-6 bg-gradient-to-r from-brick-ember-600 to-night-bordeaux-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:shadow-xl hover:enabled:from-brick-ember-700 hover:enabled:to-night-bordeaux-800 active:enabled:scale-95 focus:outline-none focus:ring-4 focus:ring-brick-ember-200 flex items-center justify-center gap-2"
            :aria-busy="isLoading"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? "Creando cuenta..." : "Crear Cuenta" }}</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-8 relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-ink-black-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-3 bg-white text-ink-black-600">¿Ya tienes cuenta?</span>
          </div>
        </div>

        <!-- Login Link -->
        <RouterLink
          to="/login"
          class="block w-full mt-8 py-3 px-4 text-center border-2 border-brick-ember-600 text-brick-ember-600 font-semibold rounded-lg transition-all duration-300 hover:bg-brick-ember-50 active:bg-brick-ember-100 focus:outline-none focus:ring-4 focus:ring-brick-ember-200"
        >
          Iniciar Sesión
        </RouterLink>

        <!-- Back to Home -->
        <RouterLink
          to="/"
          class="block w-full mt-4 py-2 px-4 text-center text-ink-black-600 hover:text-ink-black-900 font-medium transition-colors underline decoration-brick-ember-600"
        >
          Volver al Inicio
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/auth.service";
import { RouterLink } from "vue-router";

// Router
const router = useRouter();

// Form State
const formData = reactive({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false
});

// UI State
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const serverError = ref("");
const attemptedSubmit = ref(false);
const fullNameError = ref("");
const emailError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");

// Validations
const validateFullName = () => {
  if (!formData.fullName || formData.fullName.trim().length === 0) {
    fullNameError.value = "El nombre completo es requerido";
    return false;
  }
  if (formData.fullName.trim().length < 3) {
    fullNameError.value = "El nombre debe tener al menos 3 caracteres";
    return false;
  }
  fullNameError.value = "";
  return true;
};

const validateEmail = () => {
  if (!formData.email) {
    emailError.value = "El correo electrónico es requerido";
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    emailError.value = "Ingresa un correo electrónico válido";
    return false;
  }
  emailError.value = "";
  return true;
};

const validatePassword = () => {
  if (!formData.password) {
    passwordError.value = "La contraseña es requerida";
    return false;
  }
  if (formData.password.length < 6) {
    passwordError.value = "La contraseña debe tener al menos 6 caracteres";
    return false;
  }
  passwordError.value = "";
  return true;
};

const validateConfirmPassword = () => {
  if (!formData.confirmPassword) {
    confirmPasswordError.value = "Debes confirmar tu contraseña";
    return false;
  }
  if (formData.password !== formData.confirmPassword) {
    confirmPasswordError.value = "Las contraseñas no coinciden";
    return false;
  }
  confirmPasswordError.value = "";
  return true;
};

// Computed
const isFormValid = computed(() => {
  return (
    formData.fullName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.acceptTerms &&
    !fullNameError.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  );
});

// Methods
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const handleRegister = async () => {
  attemptedSubmit.value = true;

  // Validate all fields
  const fullNameValid = validateFullName();
  const emailValid = validateEmail();
  const passwordValid = validatePassword();
  const confirmPasswordValid = validateConfirmPassword();

  if (!fullNameValid || !emailValid || !passwordValid || !confirmPasswordValid || !formData.acceptTerms) {
    return;
  }

  isLoading.value = true;
  serverError.value = "";

  try {
    await authService.register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      companyId: 1
    });

    // Registration successful, redirect to login
    await router.push({
      name: "login",
      query: { email: formData.email }
    });
  } catch (error: any) {
    serverError.value = error.message || "Error al crear la cuenta. Intenta de nuevo.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Animations */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Accessibility - prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-blob {
    animation: none;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
