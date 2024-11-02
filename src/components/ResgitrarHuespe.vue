<template>
  <div class="register-container">
    <h2>Registro de Huésped</h2>
    <form @submit.prevent="registerGuest">
      <div class="form-group">
        <label for="nombre">Nombre del Huésped:</label>
        <input type="text" v-model="nombre" id="nombre" required />
      </div>

      <div class="form-group">
        <label for="documento">Documento de Identidad:</label>
        <input type="text" v-model="documento" id="documento" required />
      </div>

      <div class="form-group">
        <label for="habitacion">Habitación:</label>
        <select v-model="habitacion" id="habitacion" required>
          <option
            v-for="habitacion in habitaciones"
            :key="habitacion.id"
            :value="habitacion.numero"
          >
            {{ habitacion.numero }} - {{ habitacion.tipo }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="checkin">Fecha de Entrada:</label>
        <input type="date" v-model="checkin" id="checkin" required />
      </div>

      <div class="form-group">
        <label for="checkout">Fecha de Salida:</label>
        <input type="date" v-model="checkout" id="checkout" required />
      </div>

      <div class="form-group">
        <label for="metodoPago">Método de Pago:</label>
        <select v-model="metodoPago" id="metodoPago" required>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta de Crédito/Débito</option>
          <option value="transferencia">Transferencia Bancaria</option>
        </select>
      </div>

      <div class="form-group">
        <label for="total">Total a Pagar:</label>
        <input type="number" v-model="total" id="total" required />
      </div>

      <button type="submit" class="btn-register">Registrar Huésped</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nombre: "",
      documento: "",
      habitacion: "",
      checkin: "",
      checkout: "",
      metodoPago: "",
      total: "",
      habitaciones: [
        { id: 1, numero: 101, tipo: "Sencilla" },
        { id: 2, numero: 102, tipo: "Doble" },
        { id: 3, numero: 103, tipo: "Suite" },
        // Aquí podrías cargar la lista de habitaciones desde la base de datos
      ],
    };
  },
  methods: {
    registerGuest() {
      // Lógica para enviar los datos al servidor
      const newGuest = {
        nombre: this.nombre,
        documento: this.documento,
        habitacion: this.habitacion,
        checkin: this.checkin,
        checkout: this.checkout,
        metodoPago: this.metodoPago,
        total: this.total,
      };
      console.log("Nuevo Huésped:", newGuest);
      // Aquí puedes hacer una llamada al backend usando Axios o Fetch para registrar al huésped en el sistema.
    },
  },
};
</script>

<style scoped>
.register-container {
  max-width: 600px;
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

input,
select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
}

button.btn-register {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

button.btn-register:hover {
  background-color: #0056b3;
}
</style>
