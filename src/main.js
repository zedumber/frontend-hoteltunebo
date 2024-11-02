import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

import "primevue/resources/themes/saga-blue/theme.css"; // Tema de PrimeVue
import "primevue/resources/primevue.min.css"; // CSS de componentes
import "primeicons/primeicons.css"; // Iconos de PrimeVue
import "primeflex/primeflex.css"; // Utilidades de diseño
import PrimeVue from "primevue/config";

const app = createApp(App);
app.use(router);
app.use(PrimeVue);
app.use(store);
app.mount("#app");
