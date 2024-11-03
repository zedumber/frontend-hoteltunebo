<template>
  <div class="auth-container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="loginUser">
      <div class="form-group">
        <label for="email">Correo Electrónico:</label>
        <input type="email" v-model="email" id="email" required />
      </div>

      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" v-model="password" id="password" required />
      </div>

      <button type="submit" class="btn-auth">Iniciar Sesión</button>
    </form>

    <!-- Modal para seleccionar turno -->
    <div v-if="showTurnoModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Selecciona tu turno</h3>
        <p>Rol: {{ rolUsuario }}</p>

        <!-- Mostrar selección de turno si no hay turno activo -->
        <div v-if="!turnoExistente">
          <select v-model="selectedTurno">
            <option value="">Selecciona un turno</option>
            <option value="1">Turno 1: 2pm a 10pm</option>
            <option value="2">Turno 2: 10pm a 6am</option>
            <option value="3">Turno 3: 6am a 2pm</option>
          </select>
          <button @click="submitTurno">Confirmar Turno</button>
          <button @click="showTurnoModal = false" class="btn-cerrar">
            Cerrar
          </button>
        </div>

        <!-- Opciones para turno existente -->
        <div v-else>
          <p>{{ mensajeTurnoActivo }}</p>
          <button @click="retomarTurno">Retomar Turno</button>
          <button @click="cerrarYCrearNuevoTurno">
            Cerrar y Crear Nuevo Turno
          </button>
        </div>
      </div>
    </div>
    <!-- Modal de notificación -->
    <div v-if="showNotificationModal" class="modal-overlay">
      <div class="modal-content">
        <!-- <button class="close-modal" @click="showNotificationModal = false">
          &times;
        </button> -->
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

export default {
  data() {
    return {
      showNotificationModal: false,
      message: "",
      messageType: "success", // "success" o "error"
      email: "",
      password: "",
      showTurnoModal: false,
      selectedTurno: "",
      turnoExistente: false,
      rolUsuario: "",
      mensajeTurnoActivo: "",
    };
  },
  methods: {
    async loginUser() {
      try {
        const response = await axios.post("/login", {
          email: this.email,
          password: this.password,
        });
        localStorage.setItem("token", response.data.access_token);

        this.rolUsuario = response.data.user.roll;
        this.showTurnoModal = true;
      } catch (error) {
        this.showNotification("Error en el login", "error", error);
      }
    },

    async submitTurno() {
      const token = localStorage.getItem("token");

      try {
        await axios.post(
          "/auth/turnos/store-turno",
          { turno_id: this.selectedTurno },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.showNotification("Turno confirmado exitosamente", "success");
        this.confirmarTurnoYRedirigir();
      } catch (error) {
        if (error.response && error.response.status === 409) {
          this.turnoExistente = true;
          this.mensajeTurnoActivo = error.response.data.message;
        } else {
          this.showNotification("Error al guardar el turno", "error", error);
        }
      }
    },

    async confirmarTurnoYRedirigir() {
      this.showTurnoModal = false;

      // Redirigir según el rol del usuario
      if (this.rolUsuario === "recepcionista") {
        this.$router.push("/calendario");
      } else if (this.rolUsuario === "chef") {
        this.$router.push("/restaurante-bar");
      } else {
        this.$router.push("/panel");
      }
    },

    async retomarTurno() {
      const token = localStorage.getItem("token");

      try {
        await axios.post(
          `/auth/turnos/retomar-turno`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.showNotification("Turno retomado correctamente", "success");
        this.confirmarTurnoYRedirigir();
      } catch (error) {
        this.showNotification("Error al retomar el turno", "error", error);
      }
    },

    async cerrarYCrearNuevoTurno() {
      const token = localStorage.getItem("token");

      try {
        await axios.post(
          `/auth/turnos/cerrar-y-abrir-nuevo`,
          { turno_id: this.selectedTurno },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.showNotification("Nuevo turno creado correctamente", "success");
        this.confirmarTurnoYRedirigir();
      } catch (error) {
        this.showNotification(
          "Error al cerrar y crear un nuevo turno",
          "error",
          error
        );
      }
    },
    showNotification(message, type, error = null) {
      this.message = message;
      this.messageType = type;
      this.showNotificationModal = true;
      if (error)
        console.error(message, error.response ? error.response.data : error);
    },
  },
};
</script>
<style scoped>
.dialogg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  /* align-items: center; */
  z-index: 1000;
}

.dialog-contentt {
  display: block !important;
  position: absolute;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  top: 35%;
  /* left: 50%; */
  max-width: 400px;
  z-index: 1000;
  border: 2px solid black; /* Grosor de 2px, color negro */
  width: 80%;
  /* box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); */
  overflow: auto;
}
.dialog {
  display: block !important;
  position: fixed;
  width: 40%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgb(255, 255, 255);
  padding: 20px;
  z-index: 1000;
  border-radius: 10px;
  border: 2px solid black; /* Grosor de 2px, color negro */
  z-index: 1000;
}
/* Ajuste de ancho para pantallas pequeñas (cell) */
@media (max-width: 768px) {
  /* Puedes ajustar este valor según necesites */
  .dialog-contentt {
    width: 85%;
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Asegurarse de que el modal esté al frente */
}
.modal-content {
  max-height: 500px;
  overflow-y: auto; /* Añadir scroll si hay muchos pedidos */
}
.dialog-content {
  /* background-color: #ffffff; */
  /* padding: 2rem; */
  border-radius: 10px;
  max-width: 600px;
  /* width: 87%; */
  /* box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); */
}
.auth-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

h2 {
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
}

button.btn-auth {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

button.btn-auth:hover {
  background-color: #0056b3;
}

p {
  text-align: center;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 1;
  height: 1%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 300px;
  width: 100%;
}

select {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Asegura que el modal esté en el frente */
}

.modal-content {
  background-color: #ffffff;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  font-size: 24px;
  color: #333;
}

.modal-content p {
  color: #666;
  font-size: 16px;
  margin-bottom: 20px;
}

.modal-content select {
  width: 100%;
  padding: 10px;
  margin: 10px 0 20px 0;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}

.modal-content button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: #ffffff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-content button:hover {
  background-color: #0056b3;
}
</style>
