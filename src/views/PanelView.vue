<template>
  <div class="panel-container">
    <!-- Pasamos el estado 'menuActive' como prop al componente MenuCompo -->
    <MenuCompo :isActive="menuActive" />
    <div class="content">
      <!-- Botón para mostrar/ocultar el menú -->
      <button class="menu-toggle" @click="toggleMenu">&#9776;</button>
      <h1>Panel de Administración</h1>
      <!-- Aquí va el contenido del panel -->
    </div>
  </div>
</template>

<script>
import MenuCompo from "@/components/MenuCompo.vue";

export default {
  name: "AdminPanel",
  components: {
    MenuCompo,
  },
  data() {
    return {
      menuActive: false, // El menú está oculto por defecto en pantallas pequeñas
    };
  },
  methods: {
    toggleMenu() {
      this.menuActive = !this.menuActive; // Alternar la visibilidad del menú
    },
  },
};
</script>

<style scoped>
.panel-container {
  display: flex;
}

.content {
  margin-left: 250px; /* Espacio para el menú lateral en pantallas grandes */
  padding: 20px;
  flex: 1;
  background-color: #f5f5f5;
  height: 100vh;
  overflow-y: auto;
}

.menu-toggle {
  display: none;
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}

/* En pantallas pequeñas, el botón del menú es visible */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .content {
    margin-left: 0; /* Quitar el espacio del menú lateral en pantallas pequeñas */
  }
}
</style>
