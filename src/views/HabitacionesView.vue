<template>
  <div class="habitaciones-container">
    <div class="panel-container">
      <MenuCompo :isActive="menuActive" />
      <div class="content">
        <button class="menu-toggle" @click="toggleMenu">&#9776;</button>
        <h1>Panel de Administración</h1>

        <button @click="showModal = true">Crear/Actualizar Habitación</button>

        <h2>Lista de Habitaciones</h2>
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Precio por noche</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="habitacion in habitaciones" :key="habitacion.id">
              <td>{{ habitacion.numero }}</td>
              <td>{{ habitacion.tipo }}</td>
              <td>{{ habitacion.estado }}</td>
              <td>{{ habitacion.precio_por_noche }}</td>
              <td>
                <button @click="editHabitacion(habitacion)">Editar</button>
                <button @click="confirmDeleteHabitacion(habitacion.id)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal del formulario -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <button class="close-modal" @click="showModal = false">&times;</button>
        <h3>{{ editing ? "Editar Habitación" : "Crear Habitación" }}</h3>

        <form @submit.prevent="saveHabitacion">
          <div class="form-group">
            <label for="numero">Número de habitación:</label>
            <input
              type="text"
              v-model="habitacion.numero"
              id="numero"
              required
            />
          </div>

          <div class="form-group">
            <label for="tipo">Tipo de habitación:</label>
            <input type="text" v-model="habitacion.tipo" id="tipo" required />
          </div>

          <div class="form-group">
            <label for="estado">Estado:</label>
            <select v-model="habitacion.estado" id="estado" required>
              <option value="Disponible">Disponible</option>
              <option value="Ocupada">Ocupada</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div class="form-group">
            <label for="precio_por_noche">Precio por noche:</label>
            <input
              type="number"
              v-model="habitacion.precio_por_noche"
              id="precio_por_noche"
              required
            />
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción:</label>
            <textarea
              v-model="habitacion.descripcion"
              id="descripcion"
            ></textarea>
          </div>

          <button type="submit">Guardar</button>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <h3>Confirmación</h3>
        <p>¿Estás seguro de que deseas eliminar esta habitación?</p>
        <button @click="deleteHabitacion(confirmationId)">Confirmar</button>
        <button @click="showConfirmModal = false">Cancelar</button>
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
        <button @click="showNotificationModal = false">Cerrar</button>
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
      habitaciones: [],
      habitacion: {
        numero: "",
        tipo: "",
        estado: "Disponible",
        precio_por_noche: "",
        descripcion: "",
      },
      editing: false,
      showModal: false,
      showConfirmModal: false,
      confirmationId: null, // Para almacenar el ID de la habitación a eliminar
      showNotificationModal: false,
      message: "",
      messageType: "",
    };
  },
  mounted() {
    this.fetchHabitaciones();
  },
  methods: {
    toggleMenu() {
      this.menuActive = !this.menuActive;
    },
    fetchHabitaciones() {
      axios
        .get("/auth/habitaciones")
        .then((response) => {
          this.habitaciones = response.data;
        })
        .catch(() => {
          this.showNotification("Error al cargar las habitaciones.", "error");
        });
    },
    saveHabitacion() {
      const request = this.editing
        ? axios.put(`/auth/habitaciones/${this.habitacion.id}`, this.habitacion)
        : axios.post("/auth/habitaciones", this.habitacion);

      request
        .then(() => {
          this.resetForm();
          this.fetchHabitaciones();
          this.showModal = false;
          this.showNotification("Habitación guardada exitosamente.", "success");
        })
        .catch(() => {
          this.showNotification("Error al guardar la habitación.", "error");
        });
    },
    editHabitacion(habitacion) {
      this.habitacion = { ...habitacion };
      this.editing = true;
      this.showModal = true;
    },
    confirmDeleteHabitacion(id) {
      this.confirmationId = id; // Guarda el ID de la habitación
      this.showConfirmModal = true; // Muestra el modal de confirmación
    },
    deleteHabitacion(id) {
      axios
        .delete(`/auth/habitaciones/${id}`)
        .then(() => {
          this.fetchHabitaciones();
          this.showNotification(
            "Habitación eliminada exitosamente.",
            "success"
          );
          this.showConfirmModal = false; // Cierra el modal de confirmación
        })
        .catch(() => {
          this.showNotification("Error al eliminar la habitación.", "error");
          this.showConfirmModal = false; // Cierra el modal de confirmación
        });
    },
    resetForm() {
      this.habitacion = {
        numero: "",
        tipo: "",
        estado: "Disponible",
        precio_por_noche: "",
        descripcion: "",
      };
      this.editing = false;
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
/* Estilos generales */
.habitaciones-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Asegúrate de que ocupe toda la altura de la ventana */
}

.panel-container {
  display: flex;
  flex: 1; /* Para que tome el resto del espacio disponible */
}

.content {
  margin-left: 250px; /* Espacio para el menú lateral en pantallas grandes */
  padding: 20px;
  flex: 1;
  background-color: #f5f5f5;
  height: 100%;
  overflow-y: auto; /* Para hacer scroll si el contenido es muy largo */
}

.menu-toggle {
  display: none; /* Escondido por defecto, aparecerá en pantallas pequeñas */
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}

/* Estilos del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

/* Media query para dispositivos pequeños */
@media (max-width: 768px) {
  .menu-toggle {
    display: block; /* Mostrar botón del menú en pantallas pequeñas */
  }

  .content {
    margin-left: 0; /* Quitar espacio del menú lateral en pantallas pequeñas */
  }

  .panel-container {
    flex-direction: column; /* Cambiar la disposición en pantallas pequeñas */
  }

  MenuCompo {
    width: 100%; /* Asegurar que el menú ocupe todo el ancho */
  }
}
</style>

<style scoped>
.panel-container {
  display: flex;
}

.content {
  margin-left: 180px; /* Espacio para el menú lateral en pantallas grandes */
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
