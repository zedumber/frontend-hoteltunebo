<template>
  <div :class="['sidebar', { active: isActive }]">
    <ul>
      <!-- <li><router-link to="/">Inicio</router-link></li> -->
      <!-- <li><router-link to="/reservas">Reservas</router-link></li> -->
      <li><router-link to="/habitaciones">Habitaciones</router-link></li>
      <li>
        <router-link to="/inventario-nevera">Inventario Nevera</router-link>
      </li>
      <li>
        <router-link to="/inventario-bar"
          >Inventario Bar-Restaurante</router-link
        >
      </li>
      <li><router-link to="/restaurante-bar">Restaurante</router-link></li>
      <li><router-link to="/dashboard">Dashboard</router-link></li>
      <li><router-link to="/gastos">Gastos</router-link></li>
      <li><router-link to="/eventos">Control de Eventos</router-link></li>
      <li><router-link to="/entregocuenta">Cuentas</router-link></li>
      <!-- <li><router-link to="/registrarClientes">Clientes</router-link></li> -->
      <li>
        <router-link to="/calendario">calendario</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "MenuCompo",
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
/* Estilos para el menú */
.sidebar {
  width: 140px;
  height: 100vh;
  background-color: #2c3e50;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  transform: translateX(0); /* Mostrar menú por defecto en pantallas grandes */
}

.sidebar.active {
  transform: translateX(
    0
  ); /* Asegurar que el menú esté visible cuando activo */
}

.sidebar.hidden {
  transform: translateX(
    -100%
  ); /* Ocultar menú cuando se aplique la clase hidden */
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
}

.sidebar li {
  margin: 15px 0;
}

.sidebar a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
  display: block;
  padding: 10px;
  border-radius: 5px;
  transition: background 0.3s;
  text-align: center;
}

.sidebar a:hover {
  background-color: #34495e;
}

/* Responsive: Oculta el sidebar en pantallas pequeñas por defecto */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    transform: translateX(
      -100%
    ); /* Ocultar el menú en pantallas pequeñas por defecto */
  }

  .sidebar.active {
    transform: translateX(
      0
    ); /* Mostrar menú cuando activo en pantallas pequeñas */
  }
}
</style>
