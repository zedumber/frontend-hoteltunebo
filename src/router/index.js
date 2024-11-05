import { createRouter, createWebHistory } from "vue-router";
//import HomeView from "../views/HomeView.vue";
import RegisterCompo from "@/components/RegisterCompo.vue";
import ResgitrarHuespe from "@/components/ResgitrarHuespe.vue";
import LoginView from "@/views/LoginView.vue";
import PanelView from "@/views/PanelView.vue";
import HabitacionesView from "@/views/HabitacionesView.vue";
import ReservasView from "@/views/ReservasView.vue";
import RegistrarClientes from "@/views/RegistrarClientes.vue";
import CalendarioView from "@/views/CalendarioView.vue";
import InventarioNevera from "@/views/InventarioNevera.vue";
import InventarioBar from "@/views/InventarioBar.vue";
import RestauranteBar from "@/views/RestauranteBar.vue";
import DashboardView from "@/views/DashboardView.vue";

const routes = [
  // {
  //   path: "/",
  //   name: "home",
  //   component: HomeView,
  // },
  {
    path: "/",
    name: "login",
    component: LoginView,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: RegisterCompo,
  },
  {
    path: "/resgitrarHuespe",
    name: "resgitrarHuespe",
    component: ResgitrarHuespe,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/panel",
    name: "panel",
    component: PanelView,
  },
  {
    path: "/habitaciones",
    name: "habitaciones",
    component: HabitacionesView,
  },
  {
    path: "/reservas",
    name: "reservas",
    component: ReservasView,
  },
  {
    path: "/registrarClientes",
    name: "registrarClientes",
    component: RegistrarClientes,
  },
  {
    path: "/calendario",
    name: "calendaio",
    component: CalendarioView,
  },
  {
    path: "/inventario-nevera",
    name: "InventarioNevera",
    component: InventarioNevera,
  },
  {
    path: "/inventario-bar",
    name: "InventarioBar",
    component: InventarioBar,
  },
  {
    path: "/restaurante-bar",
    name: "RestauranteBar",
    component: RestauranteBar,
  },

  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
