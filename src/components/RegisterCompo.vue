<template>
  <div class="auth-container">
    <h2>Registro de Usuario</h2>
    <!-- Notificaciones -->
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    <form @submit.prevent="registerUser">
      <!-- Formulario igual que antes -->
      <div class="form-group">
        <label for="nombre">Nombre Completo:</label>
        <input type="text" v-model="nombre" id="nombre" required />
      </div>
      <div class="form-group">
        <label for="email">Correo Electrónico:</label>
        <input type="email" v-model="email" id="email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" v-model="password" id="password" required />
      </div>
      <div class="form-group">
        <label for="password_confirmation">Confirmar Contraseña:</label>
        <input
          type="password"
          v-model="password_confirmation"
          id="password_confirmation"
          required
        />
      </div>
      <div class="form-group">
        <label for="rol">Roll:</label>
        <select v-model="roll" id="rol" required>
          <option value="admin">Administrador</option>
          <option value="recepcionista">recepcionista</option>
          <option value="chef">chef</option>
          <option value="limpieza">limpieza</option>
          <option value="gerente">gerente</option>
        </select>
      </div>
      <div class="form-group">
        <label for="telefono">Telefono:</label>
        <input type="text" v-model="telefono" id="telefono" required />
      </div>
      <div class="form-group">
        <label for="documento_identidad">documentos de identidad:</label>
        <input
          type="text"
          v-model="documento_identidad"
          id="documento_identidad"
          required
        />
      </div>
      <button type="submit" class="btn-auth">Registrarse</button>
    </form>
    <p>
      ¿Ya tienes una cuenta?
      <router-link to="/login">Iniciar sesión</router-link>
    </p>
  </div>
</template>

<script>
import axios from "../plugins/axios";

export default {
  data() {
    return {
      nombre: "",
      email: "",
      password: "",
      password_confirmation: "",
      ReadableByteStreamController: "",
      telefono: "",
      documento_identidad: "",
      roll: "",
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async registerUser() {
      this.successMessage = "";
      this.errorMessage = "";
      try {
        const response = await axios.post("auth/register", {
          name: this.nombre,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
          roll: this.roll,
          telefono: this.telefono,
          documento_identidad: this.documento_identidad,
        });
        this.successMessage = "Usuario registrado exitosamente.";
        console.log("Usuario registrado:", response.data);
      } catch (error) {
        // Validar si error.response existe
        if (error.response) {
          // Si el backend envía errores de validación
          const errors = error.response.data;
          if (typeof errors === "string") {
            this.errorMessage = errors;
          } else if (typeof errors === "object") {
            this.errorMessage = Object.values(errors).join(", ");
          }
        } else if (error.request) {
          // Si el error ocurre por problemas de red
          this.errorMessage =
            "No se pudo conectar al servidor. Verifica tu conexión.";
        } else {
          // Si el error ocurre por algo inesperado
          this.errorMessage = "Ocurrió un error inesperado.";
        }
        console.error("Error en el registro:", error.message);
      }
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
</style>
