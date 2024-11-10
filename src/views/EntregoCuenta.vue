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

    <div class="filter">
      <label for="filtroTipoPago">Tipo de Pago:</label>
      <select
        id="filtroTipoPago"
        v-model="filtroTipoPago"
        @change="filtrarReservas"
      >
        <option value="">Todos</option>
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="transferencia">Transferencia</option>
      </select>

      <label for="filtroEstado">Estado:</label>
      <select
        id="filtroEstado"
        v-model="filtroEstado"
        @change="filtrarReservas"
      >
        <option value="">Todos</option>
        <option value="pendiente">Pendiente</option>
        <option value="pagado">Pagado</option>
        <!-- Agrega más opciones de estado según tu lógica de negocio -->
      </select>

      <!-- filtro para saber si ya entrego la cuenta al admin -->
      <label for="filtroEntregado">Entregado a Administración:</label>
      <select
        id="filtroEntregado"
        v-model="filtroEntregado"
        @change="filtrarReservas"
      >
        <option value="">Todos</option>
        <option value="1">Sí</option>
        <option value="0">No</option>
      </select>
    </div>

    <div class="general-total">
      <h3>Total General: {{ formatCurrency(totalGeneral) }}</h3>
    </div>

    <!-- Tabla de Reservas -->
    <h2>Detalles de Reservas</h2>
    <table class="reservations-table">
      <thead>
        <tr>
          <th>Seleccionar</th>
          <th>Creado por</th>
          <th>Cliente</th>
          <th>Habitación</th>
          <th>Fecha de Check-in</th>
          <th>Fecha de Check-out</th>
          <th>Estado</th>
          <th>Pago Realizo</th>
          <th>Total Pago</th>
          <th>Tipo de pago</th>
          <th>Entregado admin</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reserva in reservasFiltradas" :key="reserva.id">
          <td>
            <input
              type="checkbox"
              v-model="selectedReservas"
              :value="reserva.id"
            />
          </td>
          <td>{{ getUserName(reserva.user_id) }}</td>
          <td>{{ reserva.cliente.nombre }}</td>
          <td>{{ reserva.habitacion.numero }}</td>
          <td>{{ reserva.fecha_check_in }}</td>
          <td>{{ reserva.fecha_check_out }}</td>
          <td>{{ reserva.estado }}</td>
          <td>{{ reserva.pago_realizado ? "Si" : "No" }}</td>
          <td>{{ formatCurrency(reserva.total_pago) }}</td>
          <td>
            {{
              reserva.cobros_huesped && reserva.cobros_huesped.length > 0
                ? reserva.cobros_huesped[reserva.cobros_huesped.length - 1]
                    .tipo_pago
                : "N/A"
            }}
          </td>
          <td>{{ reserva.entregado_a_administracion ? "Sí" : "No" }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">Total Reservas</td>
          <td>{{ formatCurrency(totalReservas) }}</td>
        </tr>
      </tfoot>
    </table>

    <button @click="mostrarModalConfirmacionReservas" class="btn-entregado">
      Marcar Reservas como Entregadas
    </button>

    <!-- Modal de confirmación para Reservas -->
    <div v-if="mostrarModalReservas" class="modal">
      <div class="modal-content">
        <h3>Confirmación</h3>
        <p>
          ¿Estás seguro de que deseas marcar las reservas seleccionadas como
          entregadas?
        </p>
        <p>
          <strong>Total de reservas seleccionadas:</strong> ${{
            totalReservasSeleccionadas.toFixed(2)
          }}
        </p>
        <button @click="confirmarEntregaReservas" class="btn-confirm">
          Confirmar
        </button>
        <button @click="cerrarModalReservas" class="btn-cancel">
          Cancelar
        </button>
      </div>
    </div>

    <!-- Modal de notificación de reservas -->
    <div v-if="mostrarModalNotificacionReservas" class="modal">
      <div class="modal-content">
        <h3>Notificación</h3>
        <p>{{ mensajeNotificacionReservas }}</p>
        <button @click="cerrarModalNotificacionReservas" class="btn-close">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <h2>Detalles de Bar-Restaurante</h2>
  <table class="reservations-table">
    <thead>
      <tr>
        <th>Seleccionar</th>
        <th>Creado por</th>
        <th>Estado</th>
        <th>Método de Pago</th>

        <th>Total Pago</th>
        <th>Propina</th>
        <th>Entregado admin</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="pedido in pedidosFiltrados" :key="pedido.id">
        <td>
          <input type="checkbox" v-model="selectedPedidos" :value="pedido.id" />
        </td>
        <td>{{ getUserName(pedido.user_id) }}</td>
        <td>{{ pedido.estado }}</td>
        <td>{{ pedido.metodo_pago }}</td>

        <td>{{ formatCurrency(pedido.total_original) }}</td>
        <td>{{ formatCurrency(pedido.propina) }}</td>
        <td>{{ pedido.entregado_a_administracion ? "Sí" : "No" }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4">Total Bar-Restaurante</td>
        <td>{{ formatCurrency(totalPedidos) }}</td>
      </tr>
    </tfoot>
  </table>
  <button @click="mostrarModalConfirmacion" class="btn-entregado">
    Marcar como Entregados
  </button>

  <!-- Tabla de Nevera -->
  <h2>Detalles de Nevera</h2>
  <table class="reservations-table">
    <thead>
      <tr>
        <th>Seleccionar</th>
        <th>Creado por</th>
        <th>Estado</th>
        <th>Método de Pago</th>
        <th>Total Pago</th>
        <th>Entregado al admin</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="nevera in neverasFiltradas" :key="nevera.id">
        <td>
          <input type="checkbox" v-model="selectedNeveras" :value="nevera.id" />
        </td>
        <td>{{ getUserName(nevera.user_id) }}</td>
        <td>{{ nevera.pagado ? "Pagado" : "No pagado" }}</td>
        <td>{{ nevera.metodo_pago }}</td>
        <td>{{ formatCurrency(nevera.total_original) }}</td>
        <td>{{ nevera.entregado_a_administracion ? "Sí" : "No" }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">Total Nevera</td>
        <td>{{ formatCurrency(totalNeveras) }}</td>
      </tr>
    </tfoot>
  </table>

  <button @click="mostrarModalConfirmacionNevera" class="btn-entregado">
    Marcar Neveras como Entregadas
  </button>

  <!-- Modal de confirmación para Neveras -->
  <div v-if="mostrarModalNevera" class="modal">
    <div class="modal-content">
      <h3>Confirmación</h3>
      <p>
        ¿Estás seguro de que deseas marcar las neveras seleccionadas como
        entregadas?
      </p>
      <p>
        <strong>Total de neveras seleccionadas:</strong> ${{
          totalNeverasSeleccionadas.toFixed(2)
        }}
      </p>
      <button @click="confirmarEntregaNevera" class="btn-confirm">
        Confirmar
      </button>
      <button @click="cerrarModalNevera" class="btn-cancel">Cancelar</button>
    </div>
  </div>

  <!-- Modal de notificación de nevera -->
  <div v-if="mostrarModalNotificacionNevera" class="modal">
    <div class="modal-content">
      <h3>Notificación</h3>
      <p>{{ mensajeNotificacionNevera }}</p>
      <button @click="cerrarModalNotificacionNevera" class="btn-close">
        Cerrar
      </button>
    </div>
  </div>

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
  <!-- Modal de confirmación -->
  <div v-if="mostrarModal" class="modal">
    <div class="modal-content">
      <h3>Confirmación</h3>
      <p>
        ¿Estás seguro de que deseas marcar los pedidos seleccionados como
        entregados?
      </p>
      <p>
        <strong>Total de pedidos seleccionados:</strong> ${{
          totalPedidosSeleccionados.toFixed(2)
        }}
      </p>
      <button @click="confirmarEntrega" class="btn-confirm">Confirmar</button>
      <button @click="cerrarModal" class="btn-cancel">Cancelar</button>
    </div>
  </div>

  <!-- Modal de notificación -->
  <div v-if="mostrarModalNotificacion" class="modal">
    <div class="modal-content">
      <h3>Notificación</h3>
      <p>{{ mensajeNotificacion }}</p>
      <button @click="cerrarModalNotificacion" class="btn-close">Cerrar</button>
    </div>
  </div>
</template>

<script>
import axios from "../plugins/axios";

export default {
  data() {
    return {
      mostrarModalReservas: false,
      mostrarModalNotificacionReservas: false,
      mensajeNotificacionReservas: "",
      selectedReservas: [], // IDs seleccionados de la tabla de reservas
      totalReservasSeleccionadas: 0, // Total de las reservas seleccionadas
      mostrarModalNevera: false,
      mostrarModalNotificacionNevera: false,
      mensajeNotificacionNevera: "",
      selectedNeveras: [], // IDs seleccionados de la tabla de neveras
      totalNeverasSeleccionadas: 0, // Total de las neveras seleccionadas
      mostrarModal: false,
      mostrarModalNotificacion: false,
      mensajeNotificacion: "",
      egresos: [],
      reservas: [],
      pedidos: [],
      neveras: [],
      usuarios: [],
      fechaInicio: "",
      fechaFin: "",
      fechaEntradaInicio: "",
      fechaEntradaFin: "",
      filtroTipoPago: "", // Filtro para el tipo de pago
      filtroEstado: "", // Filtro para el estado
      selectedPedidos: [], // Nueva propiedad para almacenar los IDs seleccionados
      totalPedidosSeleccionados: 0, // Suma de los pedidos seleccionados
      filtroEntregado: "", // Filtro para saber si ya se entregó al admin
    };
  },
  computed: {
    // reservasFiltradas() {
    //   // Filtrar las reservas según el tipo de pago seleccionado
    //   return this.reservas.filter((reserva) => {
    //     return (
    //       this.filtroTipoPago === "" ||
    //       reserva.tipo_pago === this.filtroTipoPago
    //     );
    //   });
    // },
    // reservasAdminEntregadas() {
    //   return this.reservas.filter((reserva) => {
    //     return reserva.entregado_a_administracion === 1;
    //   });
    // },
    // pedidosAdminEntregados() {
    //   return this.pedidos.filter((pedido) => {
    //     return pedido.entregado_a_administracion === 1;
    //   });
    // },
    // neverasAdminEntregadas() {
    //   return this.neveras.filter((nevera) => {
    //     return nevera.entregado_a_administracion === 1;
    //   });
    // },
    reservasFiltradas() {
      // Filtrar primero por fecha
      return this.filtrarPorFecha(this.reservas).filter((reserva) => {
        // Obtener el tipo de pago desde el último cobro
        const tipoPago =
          reserva.cobros_huesped && reserva.cobros_huesped.length > 0
            ? reserva.cobros_huesped[reserva.cobros_huesped.length - 1]
                .tipo_pago
            : "N/A";

        const estadoPago =
          reserva.pago_realizado === 1 ? "pagado" : "pendiente";

        // Filtro por tipo de pago y estado
        const coincideTipoPago =
          this.filtroTipoPago === "" || tipoPago === this.filtroTipoPago;
        const coincideEstado =
          this.filtroEstado === "" || estadoPago === this.filtroEstado;

        // Filtro por entregado a administración
        const coincideEntregado =
          this.filtroEntregado === "" ||
          reserva.entregado_a_administracion === Number(this.filtroEntregado);

        return coincideTipoPago && coincideEstado && coincideEntregado;

        //     return coincideTipoPago && coincideEstado;
      });
    },
    pedidosFiltrados() {
      // Filtrar primero por fecha
      return this.filtrarPorFecha(this.pedidos).filter((pedido) => {
        const metodoPago = pedido.metodo_pago || "N/A";
        const estadoPago = pedido.estado; // Usamos el estado directamente

        // Filtro por tipo de pago (metodo_pago) y estado
        const coincideTipoPago =
          this.filtroTipoPago === "" || metodoPago === this.filtroTipoPago;
        const coincideEstado =
          this.filtroEstado === "" ||
          estadoPago === this.filtroEstado.toLowerCase();

        // Filtro por entregado a administración
        const coincideEntregado =
          this.filtroEntregado === "" ||
          pedido.entregado_a_administracion === Number(this.filtroEntregado);

        return coincideTipoPago && coincideEstado && coincideEntregado;

        //  return coincideTipoPago && coincideEstado;
      });
    },

    neverasFiltradas() {
      // Filtrar primero por fecha
      return this.filtrarPorFecha(this.neveras).filter((nevera) => {
        // Obtener el tipo de pago directamente desde el campo 'metodo_pago'
        const metodoPago = nevera.metodo_pago || "N/A";

        // Filtrar por el estado de pago
        const estadoPago = nevera.pagado === 1 ? "pagado" : "pendiente";

        // Filtro por tipo de pago (metodo_pago) y estado de pago (pagado)
        const coincideTipoPago =
          this.filtroTipoPago === "" || metodoPago === this.filtroTipoPago;
        const coincideEstadoPago =
          this.filtroEstado === "" || estadoPago === this.filtroEstado;

        // Filtro por entregado a administración
        const coincideEntregado =
          this.filtroEntregado === "" ||
          nevera.entregado_a_administracion === Number(this.filtroEntregado);

        return coincideTipoPago && coincideEstadoPago && coincideEntregado;

        //   return coincideTipoPago && coincideEstadoPago;
      });
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
  watch: {
    selectedReservas(newSelectedReservas) {
      // Recalcula el total de las reservas seleccionadas cuando cambia la selección
      this.calcularTotalReservasSeleccionadas(newSelectedReservas);
    },
    selectedNeveras(newSelectedNeveras) {
      // Recalcula el total de las neveras seleccionadas cuando cambia la selección
      this.calcularTotalNeverasSeleccionadas(newSelectedNeveras);
    },
    selectedPedidos(newSelectedPedidos) {
      // Cada vez que cambien los pedidos seleccionados, recalcula la suma
      this.calcularTotalPedidosSeleccionados(newSelectedPedidos);
    },
  },
  methods: {
    filtradoAdminEntregado() {
      this.reservasFiltradas = this.reservas.filter((reserva) => {
        return (
          this.filtroEntregado === "" ||
          reserva.entregado_a_administracion === Number(this.filtroEntregado)
        );
      });
    },
    filtrarPorTipoPago() {
      // Método para ejecutar la lógica de filtro (puede usarse para acciones adicionales si es necesario)
      this.reservasFiltradas = this.filtrarPorFecha(
        this.reservas.filter((reserva) => {
          return (
            this.filtroTipoPago === "" ||
            reserva.tipo_pago === this.filtroTipoPago
          );
        })
      );
    },
    mostrarModalConfirmacionReservas() {
      if (this.selectedReservas.length === 0) {
        this.mensajeNotificacionReservas =
          "Por favor, seleccione al menos una reserva.";
        this.mostrarModalNotificacionReservas = true;
      } else {
        this.mostrarModalReservas = true;
      }
    },
    calcularTotalReservasSeleccionadas(reservas) {
      this.totalReservasSeleccionadas = reservas.reduce((total, reservaId) => {
        const reserva = this.reservas.find((r) => r.id === reservaId);
        const totalReserva = parseFloat(reserva.total_pago || 0);
        return total + (isNaN(totalReserva) ? 0 : totalReserva);
      }, 0);
    },
    async confirmarEntregaReservas() {
      this.mostrarModalReservas = false;
      if (this.selectedReservas.length === 0) {
        alert("Por favor, seleccione al menos una reserva.");
        return;
      }
      try {
        const response = await axios.post("/auth/reservas/marcar-entregados", {
          reservas_ids: this.selectedReservas,
        });
        this.mensajeNotificacionReservas = response.data.message;
        this.mostrarModalNotificacionReservas = true;
        this.selectedReservas = [];
        this.fetchReservas();
      } catch (error) {
        this.mensajeNotificacionReservas =
          "Error al marcar las reservas como entregadas.";
        this.mostrarModalNotificacionReservas = true;
      }
    },
    cerrarModalReservas() {
      this.mostrarModalReservas = false;
    },
    cerrarModalNotificacionReservas() {
      this.mostrarModalNotificacionReservas = false;
    },

    mostrarModalConfirmacionNevera() {
      if (this.selectedNeveras.length === 0) {
        this.mensajeNotificacionNevera =
          "Por favor, seleccione al menos una nevera.";
        this.mostrarModalNotificacionNevera = true;
      } else {
        this.mostrarModalNevera = true;
      }
    },
    calcularTotalNeverasSeleccionadas(neveras) {
      this.totalNeverasSeleccionadas = neveras.reduce((total, neveraId) => {
        const nevera = this.neveras.find((n) => n.id === neveraId);
        const totalNevera = parseFloat(nevera.total_original || 0);
        return total + (isNaN(totalNevera) ? 0 : totalNevera);
      }, 0);
    },
    async confirmarEntregaNevera() {
      this.mostrarModalNevera = false;
      if (this.selectedNeveras.length === 0) {
        alert("Por favor, seleccione al menos una nevera.");
        return;
      }
      try {
        const response = await axios.post("/auth/histo", {
          historialInventario_ids: this.selectedNeveras,
        });
        this.mensajeNotificacionNevera = response.data.message;
        this.mostrarModalNotificacionNevera = true;
        this.selectedNeveras = [];
        this.fetchNevera();
      } catch (error) {
        this.mensajeNotificacionNevera =
          "Error al marcar las neveras como entregadas.";
        this.mostrarModalNotificacionNevera = true;
      }
    },
    cerrarModalNevera() {
      this.mostrarModalNevera = false;
    },
    cerrarModalNotificacionNevera() {
      this.mostrarModalNotificacionNevera = false;
    },

    mostrarModalConfirmacion() {
      if (this.selectedPedidos.length === 0) {
        this.mensajeNotificacion = "Por favor, seleccione al menos un pedido.";
        this.mostrarModalNotificacion = true;
      } else {
        this.mostrarModal = true;
      }
    },
    calcularTotalPedidosSeleccionados() {
      this.totalPedidosSeleccionados = this.selectedPedidos
        .map((id) => this.pedidosFiltrados.find((pedido) => pedido.id === id))
        .reduce((total, pedido) => {
          // Valida que `pedido` exista y tiene `total_original`
          const totalPedido = parseFloat(pedido ? pedido.total_original : 0);
          return total + (isNaN(totalPedido) ? 0 : totalPedido);
        }, 0);

      // Mostrar en consola para verificación
      console.log("Total calculado:", this.totalPedidosSeleccionados);
    },

    async confirmarEntrega() {
      this.mostrarModal = false;
      if (this.selectedPedidos.length === 0) {
        alert("Por favor, seleccione al menos un pedido.");
        return;
      }
      try {
        const response = await axios.post("/auth/pedidos/marcar-entregados", {
          pedido_ids: this.selectedPedidos,
        });
        this.mensajeNotificacion = response.data.message;
        this.mostrarModalNotificacion = true;
        this.selectedPedidos = [];
        this.fetchPedidos();
        this.selectedPedidos = []; // Reiniciar selección
      } catch (error) {
        this.mensajeNotificacion =
          "Error al marcar los pedidos como entregados.";
        this.mostrarModalNotificacion = true;
      }
    },

    cerrarModal() {
      this.mostrarModal = false;
    },
    cerrarModalNotificacion() {
      this.mostrarModalNotificacion = false;
    },

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
/* Estilos generales */
.select-input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 150px; /* Ancho deseado para escritorio */
}

/* Ajuste de ancho en pantallas más pequeñas */
@media (max-width: 768px) {
  .select-input {
    width: 100%; /* En móviles se ajusta al ancho completo del contenedor */
  }
}
/* Estilos generales */
.container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
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

/* Estilos para la tabla de reservas */
.reservations-table {
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  margin-top: 1rem;
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

.general-total {
  margin-top: 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: right;
}

/* Estilos del modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}

/* Estilos de botones */
.btn-confirm,
.btn-cancel,
.btn-close,
.btn-entregado {
  font-size: 14px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  transition: background-color 0.3s;
  color: white;
}

.btn-confirm {
  background-color: #007bff;
}

.btn-confirm:hover {
  background-color: #0056b3;
}

.btn-cancel {
  background-color: #dc3545;
}

.btn-cancel:hover {
  background-color: #c82333;
}

.btn-close {
  background-color: #6c757d;
}

.btn-close:hover {
  background-color: #5a6268;
}

.btn-entregado {
  background-color: #28a745;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 5px;
}

.btn-entregado:hover {
  background-color: #218838;
}

/* Estilos responsivos */
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
