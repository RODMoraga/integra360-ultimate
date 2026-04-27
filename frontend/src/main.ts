import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import VueApexCharts from "vue3-apexcharts";
import App from "./App.vue";
import { router } from "./router";
import "./style.css";

const app = createApp(App);
const queryClient = new QueryClient();

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
app.component("ApexChart", VueApexCharts);

app.mount("#app");