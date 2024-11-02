<template>
  <div class="reservas-container">
    <div class="panel-container">
      <MenuCompo :isActive="menuActive" />
      <div class="content">
        <button class="menu-toggle" @click="toggleMenu">&#9776;</button>
        <h1>Reservas</h1>

        <h2>Habitaciones Disponibles</h2>
        <div class="habitaciones-list">
          <div
            v-for="habitacion in habitaciones"
            :key="habitacion.id"
            class="habitacion-card"
          >
            <h3 class="habitacion-numero">
              Habitación {{ habitacion.numero }}
            </h3>
            <p class="habitacion-tipo">{{ habitacion.tipo }}</p>
            <p class="habitacion-precio">
              $ {{ habitacion.precio_por_noche }} / noche
            </p>
            <p class="habitacion-estado">
              Estado: <strong>{{ habitacion.estado }}</strong>
            </p>
            <p class="habitacion-saldo" v-if="habitacion.saldo_pendiente > 0">
              Saldo Pendiente: ${{ habitacion.saldo_pendiente }}
            </p>
            <p
              class="habitacion-fecha-checkout"
              v-if="habitacion.fecha_check_out"
            >
              Fecha de Salida: {{ habitacion.fecha_check_out }}
            </p>

            <button @click="openReservaModal(habitacion)" class="btn-reservar">
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para reserva -->
    <div v-if="showReservaModal" class="modal-overlay">
      <div class="modal">
        <button class="close-modal" @click="showReservaModal = false">
          &times;
        </button>
        <h3>Reserva Habitación {{ habitacionSeleccionada.numero }}</h3>

        <!-- Formulario de Reserva -->
        <form @submit.prevent="realizarReserva">
          <div class="form-group">
            <label for="cliente">Cliente:</label>
            <select v-model="reserva.cliente_id" required>
              <option
                v-for="cliente in clientes"
                :value="cliente.id"
                :key="cliente.id"
              >
                {{ cliente.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="numeroPersonas">Número de Personas:</label>
            <input type="number" v-model="reserva.numero_personas" required />
          </div>

          <div class="form-group">
            <label for="totalPago">Total a Pagar:</label>
            <input type="number" v-model="reserva.total_pago" required />
          </div>

          <div class="form-group">
            <label for="fechaInicio">Fecha de Inicio:</label>
            <input type="date" v-model="reserva.fecha_check_in" required />
          </div>

          <div class="form-group">
            <label for="fecha_check_out">Fecha de Fin:</label>
            <input type="date" v-model="reserva.fecha_check_out" required />
          </div>
          <div class="form-group">
            <label for="estado">Estado de la reserva:</label>
            <select v-model="reserva.estado" required>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Disponible">Disponible</option>
              <option value="reservada">Reservada</option>
              <option value="En curos">En curso</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          <button type="submit" class="btn-confirmar">Confirmar Reserva</button>
        </form>
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
      habitaciones: [],
      habitacionSeleccionada: null,
      showReservaModal: false,
      reserva: {
        fecha_check_in: "",
        fecha_check_out: "",
        cliente_id: null,
        numero_personas: null, // Nuevo campo
        total_pago: null, // Nuevo campo
        estado: "",
      },
      showNotificationModal: false,
      message: "",
      messageType: "",

      clientes: [], // Lista de clientes
    };
  },
  //computed: {
  // habitacionesDisponibles() {
  //   return this.habitaciones.filter(
  //     (habitacion) => habitacion.estado === "Disponible"
  //   );
  // },
  //  },
  mounted() {
    this.fetchHabitaciones();
    this.fetchClientes();
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

    openReservaModal(habitacion) {
      this.habitacionSeleccionada = habitacion;
      this.showReservaModal = true;
    },
    realizarReserva() {
      // Obtener el token desde localStorage
      const token = localStorage.getItem("token");
      const reservaData = {
        habitacion_id: this.habitacionSeleccionada.id,
        fecha_check_in: this.reserva.fecha_check_in,
        fecha_check_out: this.reserva.fecha_check_out,
        cliente_id: this.reserva.cliente_id,
        numero_personas: this.reserva.numero_personas, // Enviando nuevo campo
        total_pago: this.reserva.total_pago, // Enviando nuevo campo
        estado: this.reserva.estado,
      };

      axios
        .post("/auth/reserva", reservaData, {
          headers: {
            Authorization: `Bearer ${token}`, // Aquí incluyes el token JWT
          },
        })
        .then(() => {
          this.showNotification("Reserva realizada exitosamente.", "success");
          this.showReservaModal = false;
          this.reserva = {
            fecha_check_in: "",
            fecha_check_out: "",
            cliente_id: null,
            numero_personas: null,
            total_pago: null,
            estado: "",
          };
          this.fetchHabitaciones(); // Actualizar lista de habitaciones
        })
        .catch(() => {
          this.showNotification("Error al realizar la reserva.", "error");
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
/* Estilos modernos y minimalistas */
.habitaciones-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.habitacion-card {
  background-color: #f4f4f6;
  border-radius: 12px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 250px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.habitacion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
}

.habitacion-numero {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.habitacion-tipo,
.habitacion-precio {
  font-size: 1rem;
  color: #666;
  margin-bottom: 10px;
}

.btn-reservar {
  background-color: #5cb85c;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-reservar:hover {
  background-color: #4cae4c;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 35px;
  border-radius: 8px;
  width: 300px;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.btn-confirmar {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-confirmar:hover {
  background-color: #0056b3;
}

.btn-cerrar {
  background-color: #f44336;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
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
<!-- estilo para el formulario de reserva -->
<style scoped>
.form-group {
  margin-bottom: 20px; /* Espacio entre grupos de formulario */
}

.form-group label {
  display: block; /* Asegura que las etiquetas ocupen toda la línea */
  font-weight: bold; /* Resalta las etiquetas */
  margin-bottom: 5px; /* Espacio entre la etiqueta y el campo */
  color: #333; /* Color de la etiqueta */
}

.form-group select,
.form-group input[type="number"],
.form-group input[type="date"] {
  width: 100%; /* Asegura que el campo ocupe todo el ancho disponible */
  padding: 10px; /* Espacio interno del campo */
  border: 1px solid #ccc; /* Borde gris claro */
  border-radius: 5px; /* Bordes redondeados */
  font-size: 1rem; /* Tamaño de fuente consistente */
  transition: border-color 0.3s; /* Transición suave al enfocar */
}

.form-group select:focus,
.form-group input[type="number"]:focus,
.form-group input[type="date"]:focus {
  border-color: #007bff; /* Color de borde al enfocar */
  outline: none; /* Eliminar el contorno predeterminado del navegador */
}

.form-group input[type="number"],
.form-group input[type="date"] {
  -moz-appearance: textfield; /* Quitar estilo por defecto de los números en Firefox */
}

.form-group input[type="number"]::-webkit-outer-spin-button,
.form-group input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none; /* Quitar los botones de incremento/decremento */
  margin: 0; /* Quitar margen */
}

/* Mensajes de error */
.error-message {
  color: red; /* Color rojo para mensajes de error */
  font-size: 0.9rem; /* Tamaño de fuente más pequeño */
  margin-top: 5px; /* Espacio superior */
}
</style>
