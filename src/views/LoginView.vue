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
        <!-- Añade esta línea -->

        <!-- Mostrar selección de turno si no hay turno activo -->
        <div v-if="!turnoExistente">
          <select v-model="selectedTurno">
            <option value="">Selecciona un turno</option>
            <option value="1">Turno 1: 2pm a 10pm</option>
            <option value="2">Turno 2: 10pm a 6am</option>
            <option value="3">Turno 3: 6am a 2pm</option>
          </select>
          <button @click="submitTurno">Confirmar Turno</button>
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
  </div>
</template>

<script>
import axios from "../plugins/axios";

export default {
  data() {
    return {
      email: "",
      password: "",
      showTurnoModal: false,
      selectedTurno: "",
      turnoExistente: false,
      rolUsuario: "", // Añade esta línea
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
        this.showTurnoModal = true;
        this.rolUsuario = response.data.user.roll; // Almacena el rol
      } catch (error) {
        console.error("Error en el login:", error.response.data);
      }
    },

    async submitTurno() {
      const token = localStorage.getItem("token");

      try {
        if (this.rolUsuario === "recepcionista") {
          // Lógica para el recepcionista
          await axios.post(
            "/auth/turnos/store-turno", // Nueva API para recepcionistas
            { turno_id: this.selectedTurno },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Lógica para otros roles (por ejemplo, Administrador)
          await axios.post(
            "/auth/turnos/store-turno",
            { turno_id: this.selectedTurno },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        this.$router.push("/panel");
      } catch (error) {
        if (error.response && error.response.status === 409) {
          this.turnoExistente = true;
          this.mensajeTurnoActivo = error.response.data.message;
        } else {
          console.error("Error al guardar el turno:", error.response.data);
        }
      }
    },

    async retomarTurno() {
      const token = localStorage.getItem("token");

      if (this.rolUsuario === "recepcionista") {
        await axios.post(
          `/auth/turnos/retomar-turno`, // Nueva API para recepcionistas
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `/auth/turnos/retomar-turno`, // API para otros roles
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      this.$router.push("/panel");
    },

    async cerrarYCrearNuevoTurno() {
      const token = localStorage.getItem("token");

      if (this.rolUsuario === "recepcionista") {
        await axios.post(
          `/auth/turnos/cerrar-y-abrir-nuevo`, // Nueva API para recepcionistas
          { turno_id: this.selectedTurno },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `/auth/turnos/cerrar-y-abrir-nuevo`, // API para otros roles
          { turno_id: this.selectedTurno },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      this.$router.push("/panel");
    },
  },
};
</script>

<style scoped>
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
</style>
