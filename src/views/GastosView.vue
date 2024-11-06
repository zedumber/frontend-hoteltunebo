<template>
  <div class="egresos-container">
    <div class="panel-container">
      <MenuCompo :isActive="menuActive" />
      <div class="content">
        <button class="menu-toggle" @click="toggleMenu">&#9776;</button>
        <h1>Panel de Administración de Egresos</h1>

        <button @click="showModal = true">Crear/Actualizar Egreso</button>

        <!-- Filtro de Área -->
        <div class="filters">
          <label for="areaFilter">Filtrar por Área:</label>
          <select v-model="areaFilter" id="areaFilter">
            <option value="">Todas</option>
            <option value="bar">Bar</option>
            <option value="cocina">Cocina</option>
            <option value="habitacion">Habitación</option>
            <option value="otros">Otros</option>
          </select>
          <label for="fechaInicio">Fecha Inicio:</label>
          <input type="date" v-model="fechaInicio" id="fechaInicio" />

          <label for="fechaFin">Fecha Fin:</label>
          <input type="date" v-model="fechaFin" id="fechaFin" />
        </div>

        <h2>Lista de Egresos</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo de Egreso</th>
              <th>Cantidad</th>
              <th>Observación</th>
              <th>Area</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="egreso in filteredEgresos" :key="egreso.id">
              <td>{{ egreso.tipo_egreso }}</td>
              <td>{{ egreso.cantidad }}</td>
              <td>{{ egreso.observacion }}</td>
              <td>{{ egreso.area }}</td>
              <td>{{ egreso.fecha }}</td>
              <td>
                <button @click="editEgreso(egreso)">Editar</button>
                <button @click="confirmDeleteEgreso(egreso.id)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Formulario de Egreso -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h1>Formulario de Egreso</h1>
        <form @submit.prevent="saveEgreso">
          <div class="form-group">
            <label for="area">Área:</label>
            <select v-model="egreso.area" id="area" required>
              <option value="bar">Bar</option>
              <option value="cocina">Cocina</option>
              <option value="habitacion">Habitación</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div class="form-group">
            <label for="tipo_egreso">Tipo de Egreso:</label>
            <input
              type="text"
              v-model="egreso.tipo_egreso"
              id="tipo_egreso"
              required
            />
          </div>

          <div class="form-group">
            <label for="cantidad">Cantidad:</label>
            <input
              type="number"
              v-model="egreso.cantidad"
              id="cantidad"
              required
            />
          </div>

          <div class="form-group">
            <label for="metodo_pago">Método de Pago:</label>
            <select v-model="egreso.metodo_pago" id="metodo_pago" required>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <div class="form-group">
            <label for="observacion">Observación:</label>
            <input type="text" v-model="egreso.observacion" id="observacion" />
          </div>

          <div class="form-group">
            <label for="fecha">Fecha:</label>
            <input type="date" v-model="egreso.fecha" id="fecha" required />
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
        <p>¿Estás seguro de que deseas eliminar este egreso?</p>
        <button @click="deleteEgreso(confirmationId)">Confirmar</button>
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
      egresos: [],
      egreso: {
        area: "",
        tipo_egreso: "",
        cantidad: "",
        metodo_pago: "",
        observacion: "",
        fecha: "",
      },
      editing: false,
      showModal: false,
      showConfirmModal: false,
      confirmationId: null,
      showNotificationModal: false,
      message: "",
      messageType: "",
      selectedArea: "", // Nueva variable para el filtro de área
      areaFilter: "",
      fechaInicio: "",
      fechaFin: "",
    };
  },
  computed: {
    filteredEgresos() {
      return this.egresos.filter((egreso) => {
        const areaMatches =
          this.areaFilter === "" || egreso.area === this.areaFilter;
        const fechaInicioMatches =
          !this.fechaInicio ||
          new Date(egreso.fecha) >= new Date(this.fechaInicio);
        const fechaFinMatches =
          !this.fechaFin || new Date(egreso.fecha) <= new Date(this.fechaFin);

        return areaMatches && fechaInicioMatches && fechaFinMatches;
      });
    },
  },
  mounted() {
    this.fetchEgresos();
  },
  methods: {
    toggleMenu() {
      this.menuActive = !this.menuActive;
    },
    fetchEgresos() {
      axios
        .get("/auth/egresosgenerales")
        .then((response) => {
          this.egresos = response.data;
        })
        .catch(() => {
          this.showNotification("Error al cargar los egresos.", "error");
        });
    },
    saveEgreso() {
      const request = this.editing
        ? axios.put(`/auth/egresosgenerales/${this.egreso.id}`, this.egreso)
        : axios.post("/auth/egresosgenerales", this.egreso);

      request
        .then(() => {
          this.resetForm();
          this.fetchEgresos();
          this.showModal = false;
          this.showNotification("Egreso guardado exitosamente.", "success");
        })
        .catch(() => {
          this.showNotification("Error al guardar el egreso.", "error");
        });
    },
    editEgreso(egreso) {
      this.egreso = { ...egreso };
      this.editing = true;
      this.showModal = true;
    },
    confirmDeleteEgreso(id) {
      this.confirmationId = id;
      this.showConfirmModal = true;
    },
    deleteEgreso(id) {
      axios
        .delete(`/auth/egresosgenerales/${id}`)
        .then(() => {
          this.fetchEgresos();
          this.showNotification("Egreso eliminado exitosamente.", "success");
          this.showConfirmModal = false;
        })
        .catch(() => {
          this.showNotification("Error al eliminar el egreso.", "error");
          this.showConfirmModal = false;
        });
    },
    resetForm() {
      this.egreso = {
        area: "",
        tipo_egreso: "",
        cantidad: "",
        metodo_pago: "",
        observacion: "",
        fecha: "",
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
