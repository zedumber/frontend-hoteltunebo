<template>
  <div class="clientes-container">
    <div class="panel-container">
      <MenuCompo :isActive="menuActive" />
      <div class="content">
        <button class="menu-toggle" @click="toggleMenu">&#9776;</button>
        <h1>Clientes</h1>

        <!-- Formulario para agregar nuevo cliente -->
        <div class="add-cliente-form">
          <h2>Agregar Cliente</h2>
          <form @submit.prevent="agregarCliente">
            <div class="form-group">
              <label for="nombre">Nombre:</label>
              <input type="text" v-model="nuevoCliente.nombre" required />
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" v-model="nuevoCliente.email" required />
            </div>
            <div class="form-group">
              <label for="telefono">Teléfono:</label>
              <input type="text" v-model="nuevoCliente.telefono" required />
            </div>
            <div class="form-group">
              <label for="documento_identidad">documento de identidad:</label>
              <input
                type="text"
                v-model="nuevoCliente.documento_identidad"
                required
              />
            </div>
            <button type="submit" class="btn-confirmar">Agregar Cliente</button>
          </form>
        </div>

        <!-- Lista de clientes -->
        <div class="clientes-list">
          <h2>Clientes Registrados</h2>
          <ul>
            <li v-for="cliente in clientes" :key="cliente.id">
              <strong>{{ cliente.nombre }}</strong> - {{ cliente.email }} -
              {{ cliente.telefono }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Modal de notificación -->
    <div v-if="showNotificationModal" class="modal-overlay">
      <div class="modal">
        <button class="close-modal" @click="showNotificationModal = false">
          &times;
        </button>
        <h3>{{ messageType === "success" ? "Éxito" : "Error" }}</h3>
        <p>{{ message }}</p>
        <button @click="showNotificationModal = false" class="btn-cerrar">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "../plugins/axios";
import MenuCompo from "@/components/MenuCompo.vue";

export default {
  components: {
    MenuCompo,
  },
  data() {
    return {
      menuActive: false,
      clientes: [],
      nuevoCliente: {
        nombre: "",
        email: "",
        telefono: "",
        documento_identidad: "",
      },
      showNotificationModal: false,
      message: "",
      messageType: "",
    };
  },
  mounted() {
    this.fetchClientes();
  },
  methods: {
    toggleMenu() {
      this.menuActive = !this.menuActive;
    },
    fetchClientes() {
      axios
        .get("/auth/clientes")
        .then((response) => {
          this.clientes = response.data;
        })
        .catch(() => {
          this.showNotification("Error al cargar los clientes.", "error");
        });
    },
    agregarCliente() {
      axios
        .post("/auth/clientes", this.nuevoCliente)
        .then(() => {
          this.showNotification("Cliente agregado exitosamente.", "success");
          this.fetchClientes(); // Actualizar lista de clientes
          this.nuevoCliente = {
            nombre: "",
            email: "",
            telefono: "",
            documento_identidad: "",
          }; // Limpiar formulario
        })
        .catch(() => {
          this.showNotification("Error al agregar el cliente.", "error");
        });
    },
    showNotification(message, type) {
      this.message = message;
      this.messageType = type;
      this.showNotificationModal = true;
    },
  },
};
</script>

<style scoped>
.clientes-container {
  padding: 20px;
}

.add-cliente-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 10px;
}

.btn-confirmar {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

.clientes-list {
  margin-top: 20px;
}
</style>
