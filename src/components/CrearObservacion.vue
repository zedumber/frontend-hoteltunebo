<template>
  <div class="modal" v-if="showModal">
    <div class="modal-content">
      <h2>Crear Observación</h2>
      <form @submit.prevent="submitObservacion">
        <div>
          <label for="contenido">Contenido</label>
          <textarea v-model="form.contenido" id="contenido" required></textarea>
        </div>

        <div>
          <label for="tipo">Tipo</label>
          <select v-model="form.tipo" id="tipo" required>
            <option value="General">General</option>
            <option value="Incidencia">Incidencia</option>
            <option value="Sugerencia">Sugerencia</option>
          </select>
        </div>

        <div>
          <button type="submit">Crear Observación</button>
          <button type="button" @click="closeModal">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "../plugins/axios"; // Asegúrate de que la ruta sea correcta

export default {
  props: {
    showModal: Boolean,
    reservaId: {
      type: Number,
      required: true,
    },
    clienteId: {
      type: Number,
      required: true,
    },
    turnoId: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    mounted() {
      console.log("Props recibidos en CrearObservacion:");
      console.log("reservaId:", this.reservaId);
      console.log("clienteId:", this.clienteId);
      console.log("turnoId:", this.turnoId);
      console.log("userId:", this.userId);
    },
  },
  data() {
    return {
      form: {
        contenido: "",
        tipo: "General",
        reserva_id: null,
        cliente_id: null,
        turno_id: null,
        user_id: null,
      },
    };
  },
  watch: {
    reservaId(newVal) {
      this.form.reserva_id = newVal;
    },
    clienteId(newVal) {
      this.form.cliente_id = newVal;
    },
    turnoId(newVal) {
      this.form.turno_id = newVal;
    },
    userId(newVal) {
      this.form.user_id = newVal;
    },
  },
  methods: {
    async submitObservacion() {
      try {
        // Realizar una solicitud POST con los datos del form, que ya incluye los valores actualizados por los watchers
        await axios.post("/observaciones", this.form);

        // Emitir el evento observacionCreada cuando la solicitud se realiza con éxito
        this.$emit("observacionCreada");

        // Cerrar el modal
        this.closeModal();
      } catch (error) {
        console.error("Error al crear la observación:", error);
      }
    },
    closeModal() {
      this.$emit("closeModal"); // Emitir un evento para cerrar el modal
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  max-width: 100%;
}
</style>
