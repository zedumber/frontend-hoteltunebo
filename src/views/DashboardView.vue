<template>
  <div>
    <div class="filter">
      <label>Filtrar por Fecha de Creación:</label>
      <input type="date" v-model="fechaInicio" @change="filtrarPorFecha" />
      <input type="date" v-model="fechaFin" @change="filtrarPorFecha" />
      <label>Filtrar por Fecha de Entrada:</label>
      <input
        type="date"
        v-model="fechaEntradaInicio"
        @change="filtrarPorFecha"
      />
      <input type="date" v-model="fechaEntradaFin" @change="filtrarPorFecha" />
    </div>
    <div class="general-total">
      <h3>Total General: {{ formatCurrency(totalGeneral) }}</h3>
    </div>

    <h2>Detalles de Reservas</h2>
    <table class="reservations-table">
      <thead>
        <tr>
          <th>Creado por</th>
          <th>Cliente</th>
          <th>Habitación</th>
          <th>Estado</th>
          <th>Check-In</th>
          <th>Check-Out</th>
          <th>Total Pago</th>
          <th>Pagado Realizado</th>
          <th>Tipo de pago</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reserva in reservasFiltradas" :key="reserva.id">
          <td>{{ getUserName(reserva.user_id) }}</td>
          <td>{{ reserva.cliente.nombre }}</td>
          <td>{{ reserva.habitacion.numero }}</td>
          <td>{{ reserva.estado }}</td>
          <td>{{ reserva.fecha_check_in }}</td>
          <td>{{ reserva.fecha_check_out }}</td>
          <td>{{ formatCurrency(reserva.total_pago) }}</td>
          <td>{{ reserva.pago_realizado ? "Pagado" : "No pagado" }}</td>
          <td>
            {{
              reserva.cobros_huesped && reserva.cobros_huesped.length > 0
                ? reserva.cobros_huesped[reserva.cobros_huesped.length - 1]
                    .tipo_pago
                : "N/A"
            }}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="6">Total Reservas</td>
          <td>{{ formatCurrency(totalReservas) }}</td>
        </tr>
      </tfoot>
    </table>

    <h2>Detalles de Bar-Restaurante</h2>
    <table class="reservations-table">
      <thead>
        <tr>
          <th>Creado por</th>
          <th>Estado</th>
          <th>Método de Pago</th>
          <th>Propina</th>
          <th>Total Pago</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pedido in pedidosFiltrados" :key="pedido.id">
          <td>{{ getUserName(pedido.user_id) }}</td>
          <td>{{ pedido.estado }}</td>
          <td>{{ pedido.metodo_pago }}</td>
          <td>{{ formatCurrency(pedido.propina) }}</td>
          <td>{{ formatCurrency(pedido.total_original) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">Total Bar-Restaurante</td>
          <td>{{ formatCurrency(totalPedidos) }}</td>
        </tr>
      </tfoot>
    </table>

    <h2>Detalles de Nevera</h2>
    <table class="reservations-table">
      <thead>
        <tr>
          <th>Creado por</th>
          <th>Estado</th>
          <th>Método de Pago</th>
          <th>Total Pago</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="nevera in neverasFiltradas" :key="nevera.id">
          <td>{{ getUserName(nevera.user_id) }}</td>
          <td>{{ nevera.pagado ? "Pagado" : "No pagado" }}</td>
          <td>{{ nevera.metodo_pago }}</td>
          <td>{{ formatCurrency(nevera.total_original) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">Total Nevera</td>
          <td>{{ formatCurrency(totalNeveras) }}</td>
        </tr>
      </tfoot>
    </table>

    <h2>Detalles de Egresos Generales</h2>
    <table class="reservations-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Turno</th>
          <th>Área</th>
          <th>Cantidad</th>
          <th>Tipo de Egreso</th>

          <th>Método de Pago</th>
          <th>Observación</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="egreso in egresos" :key="egreso.id">
          <td>{{ getUserName(egreso.user_id) }}</td>
          <td>{{ egreso.turno_id }}</td>
          <td>{{ egreso.area }}</td>
          <td>{{ formatCurrency(egreso.cantidad) }}</td>
          <td>{{ egreso.tipo_egreso }}</td>

          <td>{{ egreso.metodo_pago || "N/A" }}</td>
          <td>{{ egreso.observacion || "Sin observaciones" }}</td>
          <td>{{ egreso.fecha }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">Total Egreso</td>
          <td>{{ formatCurrency(totalEgresos) }}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import axios from "../plugins/axios";

export default {
  data() {
    return {
      egresos: [],
      reservas: [],
      pedidos: [],
      neveras: [],
      usuarios: [],
      fechaInicio: "",
      fechaFin: "",
      fechaEntradaInicio: "",
      fechaEntradaFin: "",
    };
  },
  computed: {
    reservasFiltradas() {
      return this.filtrarPorFecha(this.reservas);
    },
    pedidosFiltrados() {
      return this.filtrarPorFecha(this.pedidos);
    },
    neverasFiltradas() {
      return this.filtrarPorFecha(this.neveras);
    },
    totalReservas() {
      return this.reservasFiltradas.reduce(
        (total, reserva) => total + parseFloat(reserva.total_pago || 0),
        0
      );
    },
    totalPedidos() {
      return this.pedidosFiltrados.reduce(
        (total, pedido) => total + parseFloat(pedido.total_original || 0),
        0
      );
    },
    totalNeveras() {
      return this.neverasFiltradas.reduce(
        (total, nevera) => total + parseFloat(nevera.total_original || 0),
        0
      );
    },
    totalEgresos() {
      return this.egresos.reduce(
        (total, egreso) => total + parseFloat(egreso.cantidad || 0),
        0
      );
    },
    totalGeneral() {
      return this.totalReservas + this.totalPedidos + this.totalNeveras;
    },
  },
  mounted() {
    this.fetchReservas();
    this.fetchPedidos();
    this.fetchUsuarios();
    this.fetchNevera();
    this.fetchEgresos();
    this.fetchUsuarios();
  },
  methods: {
    async fetchEgresos() {
      try {
        const response = await axios.get("/auth/egresosgenerales");
        this.egresos = response.data;
      } catch (error) {
        console.error("Error al obtener los egresos generales:", error);
      }
    },
    async fetchNevera() {
      try {
        const response = await axios.get("/auth/historial-inventarios");
        this.neveras = response.data;
      } catch (error) {
        console.error("Error al obtener el consumo de nevera:", error);
      }
    },
    async fetchUsuarios() {
      try {
        const response = await axios.get("/auth/user");
        this.usuarios = response.data;
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    },
    async fetchReservas() {
      try {
        const response = await axios.get("/auth/reserva");
        this.reservas = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("Error al obtener las reservas:", error);
      }
    },
    async fetchPedidos() {
      try {
        const response = await axios.get("/auth/pedidos");
        this.pedidos = response.data;
      } catch (error) {
        console.error(
          "Error al obtener el consumo de bar y restaurante:",
          error
        );
      }
    },
    getUserName(userId) {
      const user = this.usuarios.find((usuario) => usuario.id === userId);
      return user ? user.name : "Desconocido";
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "COP",
      }).format(value);
    },
    filtrarPorFecha(datos) {
      if (!Array.isArray(datos)) return [];
      const fechaInicio = new Date(this.fechaInicio);
      const fechaFin = new Date(this.fechaFin);
      const fechaEntradaInicio = new Date(this.fechaEntradaInicio);
      const fechaEntradaFin = new Date(this.fechaEntradaFin);

      if (this.fechaFin) fechaFin.setDate(fechaFin.getDate() + 1);
      if (this.fechaEntradaFin)
        fechaEntradaFin.setDate(fechaEntradaFin.getDate() + 1);

      return datos.filter((item) => {
        const fechaCreacion = new Date(item.created_at);
        const fechaEntrada = new Date(item.fecha_check_in);

        return (
          (!this.fechaInicio || fechaCreacion >= fechaInicio) &&
          (!this.fechaFin || fechaCreacion < fechaFin) &&
          (!this.fechaEntradaInicio || fechaEntrada >= fechaEntradaInicio) &&
          (!this.fechaEntradaFin || fechaEntrada < fechaEntradaFin)
        );
      });
    },
  },
};
</script>

<style scoped>
.filter {
  margin-bottom: 1rem;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.reservations-table th,
.reservations-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.reservations-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.general-total {
  margin-top: 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: right;
}
</style>

<style scoped>
.container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter {
  display: flex;
  /* flex-wrap: wrap; */
  gap: 1rem;
  align-items: center;
}

.filter label {
  font-weight: bold;
  color: #333;
}

.filter input[type="date"] {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

h2 {
  font-size: 1.5rem;
  color: #333;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
}

.reservations-table th,
.reservations-table td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}

.reservations-table th {
  background-color: #f8f9fa;
  color: #333;
  font-weight: bold;
}

@media (max-width: 768px) {
  .filter,
  .reservations-table th,
  .reservations-table td {
    font-size: 0.875rem;
    padding: 0.5rem;
  }

  .container h2 {
    font-size: 1.25rem;
  }
}
</style>
