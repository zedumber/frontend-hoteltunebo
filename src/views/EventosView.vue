<template>
  <div class="eventos-container">
    <div class="panel-container">
      <MenuCompo :isActive="menuActive" />
      <div class="content">
        <button class="menu-toggle" @click="toggleMenu">&#9776;</button>
        <h1>Panel de Administración de Eventos</h1>

        <button @click="showModal = true">Crear Evento</button>

        <!-- Filtro de Fecha
        <div class="filtro-fecha">
          <label for="fechaFiltro">Filtrar por Fecha de Evento:</label>
          <input
            type="date"
            v-model="fechaFiltro"
            id="fechaFiltro"
            @change="filtrarEventosPorFecha"
          />
        </div> -->

        <h2>Lista de Eventos</h2>
        <input
          type="date"
          v-model="fechaFiltro"
          @change="filtrarEventosPorFecha"
        />
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Fecha Apartado</th>
              <th>Fecha Evento</th>
              <th>Gasto</th>
              <th>Ingreso</th>
              <th>Ganancia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="evento in eventosFiltrados" :key="evento.id">
              <td>{{ evento.cliente_nombre }}</td>
              <td>{{ evento.fecha_apartado }}</td>
              <td>{{ evento.fecha_evento }}</td>
              <td>{{ evento.gasto_organizacion }}</td>
              <td>{{ evento.ingreso_evento }}</td>
              <td>{{ evento.ganancia }}</td>
              <td>
                <button @click="editEvento(evento)">Editar</button>
                <button @click="confirmDeleteEvento(evento.id)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Formulario de Evento -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h1>Formulario de Evento</h1>
        <form @submit.prevent="saveEvento">
          <div class="form-group">
            <label for="cliente_nombre">Cliente Nombre:</label>
            <input
              type="text"
              v-model="evento.cliente_nombre"
              id="cliente_nombre"
              required
            />
          </div>

          <div class="form-group">
            <label for="fecha_apartado">Fecha Apartado:</label>
            <input
              type="date"
              v-model="evento.fecha_apartado"
              id="fecha_apartado"
              required
            />
          </div>

          <div class="form-group">
            <label for="fecha_evento">Fecha Evento:</label>
            <input
              type="date"
              v-model="evento.fecha_evento"
              id="fecha_evento"
              required
            />
          </div>

          <div class="form-group">
            <label for="gasto_organizacion">Gasto Organización:</label>
            <input
              type="number"
              v-model="evento.gasto_organizacion"
              id="gasto_organizacion"
            />
          </div>

          <div class="form-group">
            <label for="ingreso_evento">Ingreso Evento:</label>
            <input
              type="number"
              v-model="evento.ingreso_evento"
              id="ingreso_evento"
            />
          </div>

          <div class="form-group">
            <label for="numero_asistentes">Número de Asistentes:</label>
            <input
              type="number"
              v-model="evento.numero_asistentes"
              id="numero_asistentes"
            />
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción:</label>
            <textarea v-model="evento.descripcion" id="descripcion"></textarea>
          </div>

          <button type="submit">Guardar</button>
          <button type="button" @click="showModal = false">Cancelar</button>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <h3>Confirmación</h3>
        <p>¿Estás seguro de que deseas eliminar este evento?</p>
        <button @click="deleteEvento(confirmationId)">Confirmar</button>
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
      eventos: [],
      fechaFiltro: "", // fecha seleccionada para el filtro
      evento: {
        cliente_nombre: "",
        fecha_apartado: "",
        fecha_evento: "",
        gasto_organizacion: "",
        ingreso_evento: "",
        numero_asistentes: "",
        descripcion: "",
      },
      editing: false,
      showModal: false,
      showConfirmModal: false,
      confirmationId: null,
      showNotificationModal: false,
      message: "",
      messageType: "",
    };
  },
  mounted() {
    this.fetchEventos();
  },
  computed: {
    eventosFiltrados() {
      if (this.fechaFiltro) {
        return this.eventos.filter(
          (evento) => evento.fecha_evento === this.fechaFiltro
        );
      }
      return this.eventos;
    },
  },
  methods: {
    filtrarEventosPorFecha() {
      this.fetchEventos(this.fechaFiltro); // Llama a fetchEventos con la fecha seleccionada
    },
    toggleMenu() {
      this.menuActive = !this.menuActive;
    },
    fetchEventos(fecha = "") {
      axios
        .get("/auth/eventos", {
          params: {
            fecha_evento: fecha,
          },
        })
        .then((response) => {
          this.eventos = response.data;
        })
        .catch(() => {
          this.showNotification("Error al cargar los eventos.", "error");
        });
    },
    saveEvento() {
      const request = this.editing
        ? axios.put(`/auth/eventos/${this.evento.id}`, this.evento)
        : axios.post("/auth/eventos", this.evento);

      request
        .then(() => {
          this.resetForm();
          this.fetchEventos();
          this.showModal = false;
          this.showNotification("Evento guardado exitosamente.", "success");
        })
        .catch(() => {
          this.showNotification("Error al guardar el evento.", "error");
        });
    },
    editEvento(evento) {
      this.evento = { ...evento };
      this.editing = true;
      this.showModal = true;
    },
    confirmDeleteEvento(id) {
      this.confirmationId = id;
      this.showConfirmModal = true;
    },
    deleteEvento(id) {
      axios
        .delete(`/auth/eventos/${id}`)
        .then(() => {
          this.fetchEventos();
          this.showNotification("Evento eliminado exitosamente.", "success");
          this.showConfirmModal = false;
        })
        .catch(() => {
          this.showNotification("Error al eliminar el evento.", "error");
          this.showConfirmModal = false;
        });
    },
    resetForm() {
      this.evento = {
        cliente_nombre: "",
        fecha_apartado: "",
        fecha_evento: "",
        gasto_organizacion: "",
        ingreso_evento: "",
        numero_asistentes: "",
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
.filtro-fecha {
  margin-bottom: 20px;
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
  max-width: 350px;
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
</style>
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
  margin-left: 180px; /* Espacio para el menú lateral en pantallas grandes */
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
  max-width: 350px;
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
