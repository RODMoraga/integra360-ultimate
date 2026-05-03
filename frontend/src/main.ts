import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import VueApexCharts from "vue3-apexcharts";
import { Tooltip } from "bootstrap";
import App from "./App.vue";
import { authService } from "./services/auth.service";
import { useSessionStore } from "./store/session.store";
import { router } from "./router";
import "./style.css";

/**
 * Restores persisted auth state before mounting Vue application.
 */
authService.initializeAuth();

const actionTooltipGroupSelector = '.btn-group[aria-label="Acciones de fila"]';
const actionTooltipButtonSelector = `${actionTooltipGroupSelector} > button[title], ${actionTooltipGroupSelector} > button[data-bs-original-title]`;

function hideTooltipForButton(button: HTMLElement) {
  Tooltip.getInstance(button)?.hide();
}

function hideVisibleActionTooltips() {
  document.querySelectorAll<HTMLElement>(`${actionTooltipGroupSelector} > button`).forEach((button) => {
    hideTooltipForButton(button);
  });

  document.querySelectorAll<HTMLElement>(".tooltip.app-action-tooltip.show").forEach((tooltipEl) => {
    tooltipEl.remove();
  });
}

/**
 * Enables delegated Bootstrap tooltips for action buttons used in table row groups.
 * Delegation ensures rows rendered dynamically (e.g. DataTables) also get tooltips.
 */
function initializeActionButtonTooltips() {
  const marker = "data-action-tooltips-initialized";

  if (document.body.getAttribute(marker) === "true") {
    return;
  }

  new Tooltip(document.body, {
    selector: actionTooltipButtonSelector,
    trigger: "hover focus",
    placement: "bottom",
    customClass: "app-action-tooltip",
    container: "body",
    boundary: document.body
  });

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLElement>(`${actionTooltipGroupSelector} > button`);
      if (!button) {
        return;
      }

      hideTooltipForButton(button);
      window.setTimeout(() => button.blur(), 0);
    },
    true
  );

  document.addEventListener(
    "focusout",
    (event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLElement>(`${actionTooltipGroupSelector} > button`);
      if (!button) {
        return;
      }

      hideTooltipForButton(button);
    },
    true
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        hideVisibleActionTooltips();
      }
    },
    true
  );

  document.addEventListener("hidden.bs.modal", () => {
    hideVisibleActionTooltips();
  });

  document.body.setAttribute(marker, "true");
}

/**
 * Main Vue application bootstrap sequence.
 */
const app = createApp(App);
const queryClient = new QueryClient();
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
app.component("ApexChart", VueApexCharts);

const currentUser = authService.getCurrentUser();
if (currentUser) {
  const sessionStore = useSessionStore(pinia);
  sessionStore.setSession(authService.getToken() ?? "", {
    id: currentUser.id,
    email: currentUser.email,
    role: currentUser.role ?? "Usuario"
  });
}

initializeActionButtonTooltips();
router.afterEach(() => {
  hideVisibleActionTooltips();
});

app.mount("#app");