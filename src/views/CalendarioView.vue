<template>
  <div>
    <!-- Header con la leyenda de los colores -->
    <div style="display: flex; gap: 15px; padding: 10px; flex-wrap: wrap">
      <div
        v-for="estado in estadosReferencia"
        :key="estado.nombre"
        style="display: flex; align-items: center"
      >
        <span
          :style="{
            backgroundColor: estado.color,
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            display: 'inline-block',
            marginRight: '5px',
          }"
        ></span>
        <span>{{ estado.nombre }}</span>
      </div>
      <!-- <div class="detail-row" v-if="balanceTotal !== null"> -->
      <!-- <p><strong>Total en Caja:</strong> ${{ balanceTotal.toFixed(2) }}</p> -->

      <!-- <h4>Desglose por Tipo de Pago:</h4> -->
      <ul class="detail-row">
        <li>
          <strong @click="abrirModalBalance">Efectivo:</strong>
          {{
            (balanceDetalles.efectivo || 0).toLocaleString("es-CO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }}
          <strong @click="abrirModalBalance">Tarjeta:</strong>
          {{
            (balanceDetalles.tarjeta || 0).toLocaleString("es-CO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }}
          <strong>Transferencia:</strong>
          {{
            (balanceDetalles.transferencia || 0).toLocaleString("es-CO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }}
          <strong>Huespedes:</strong> {{ totalPersonas }}
        </li>
      </ul>

      <!-- </div> -->

      <!-- boton para arqueo de caja -->
      <button class="btn btn-secondary" @click="realizarArqueoCaja">
        <i class="fas fa-cash-register"></i> Arqueo de Caja
      </button>

      <!-- Botón para mostrar la lista de clientes -->
      <button class="btn btn-secondary" @click="abrirModaldeClientes">
        <i class="fas fa-users"></i> Ver Clientes
      </button>

      <!-- Botón para abrir el modal de egresos -->
      <button class="btn btn-info" @click="mostrarEgresos">
        <i class="fas fa-eye"></i> Ver Egresos
      </button>
      <!-- para cerrar turno -->
      <button @click="abrirModalConfirmacion" class="btn btn-danger">
        Cerrar Turno
      </button>

      <!-- boton para abrir el modal de cambiar estado de servicio de la habitacion -->
      <button class="btn btn-primary" @click="showEstadoModal = true">
        <i class="fas fa-bed"></i>Servicio de Habitacion
      </button>
    </div>
  </div>
  <div style="display: flex">
    <!-- Calendario con las habitaciones como filas -->
    <div style="flex-grow: 1; height: 90vh">
      <!-- Cambiar tamaño del calendario -->

      <FullCalendar
        :options="calendarOptions"
        @eventClick="handleEventClick"
        @resourceLabelDidMount="handleResourceClick"
      />
    </div>
    <!-- Modal para cambiar el estado de servicio de la habitación -->
    <div v-if="showEstadoModal" class="dialog">
      <div class="modal-content">
        <span class="close-modal" @click="showEstadoModal = false"
          >&times;</span
        >
        <h3>
          Cambiar Estado de Servicio para Habitación
          {{ habitacionSeleccionada.numero }}
        </h3>
        <div class="form-group">
          <!-- Selección de habitación -->
          <div class="form-group">
            <label for="habitacionSeleccionada">Seleccionar Habitación:</label>
            <select
              v-model="habitacionSeleccionada.id"
              @change="obtenerDetallesHabitacion"
            >
              <option
                v-for="habitacion in habitaciones"
                :key="habitacion.id"
                :value="habitacion.id"
              >
                {{ `Hab. ${habitacion.numero}` }}
                <!-- Mostrar número de la habitación -->
              </option>
            </select>
          </div>

          <label for="estadoServicio">Estado de Servicio:</label>
          <select
            v-model="habitacionSeleccionada.estado_servicio"
            @change="cambiarEstadoServicio(habitacionSeleccionada.id)"
          >
            <option value="Disponible">Disponible</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Limpieza">Limpieza</option>
          </select>
        </div>
        <button @click="actualizarEstadoServicio" class="btn btn-primary">
          Actualizar Estado
        </button>
      </div>
    </div>
  </div>

  <!-- Botón flotante para abrir el modal de pedidos pendientes -->
  <div class="pedidos-flotante" @click="abrirPedidosPendientesModal">
    <span>{{ pedidosPendientesCount }}</span>
    <img
      src="https://img.icons8.com/ios-glyphs/30/ffffff/list.png"
      alt="Pedidos Pendientes"
    />
  </div>

  <!-- Modal para mostrar todos los balances por área -->
  <div v-if="mostrarModalBalance" class="dialog">
    <div class="modal-content">
      <span @click="cerrarModalBalance" class="close">&times;</span>
      <h3>Desglose Completo de Balances</h3>

      <!-- Tabla para mostrar todos los detalles de balances_por_area -->
      <table>
        <thead>
          <tr>
            <th>Tipo de Pago</th>
            <th>Área</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          <!-- Iterar sobre cada tipo de pago (efectivo, tarjeta, transferencia) -->
          <template
            v-for="(areas, tipoPago) in balances_por_area"
            :key="tipoPago"
          >
            <tr v-for="(monto, area) in areas" :key="area">
              <td class="balance-tipo">{{ tipoPago }}</td>
              <td class="balance-area">{{ area }}</td>
              <td class="balance-monto">{{ monto }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal de Egresos -->
  <div v-if="mostrarModalEgresos" class="dialog">
    <button
      class="btn btn-primary"
      @click="mostrarModalEgreso = true"
      style="margin-left: 10px"
    >
      <i class="fas fa-plus-circle"></i> Agregar Egreso
    </button>
    <div class="modal-content">
      <!-- <span class="close-button" @click="mostrarModalEgresos = false"
        >&times;</span -->

      <h3>Lista de Egresos</h3>
      <table class="table">
        <thead>
          <tr>
            <!-- <th>ID</th> -->
            <th>Área</th>
            <th>Tipo de Egreso</th>
            <th>Cantidad</th>
            <th>Observación</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="egreso in egresos" :key="egreso.id">
            <!-- <td>{{ egreso.id }}</td> -->
            <td>{{ egreso.area }}</td>
            <td>{{ egreso.tipo_egreso }}</td>
            <td>{{ egreso.cantidad }}</td>
            <td>{{ egreso.observacion }}</td>
            <td>{{ egreso.fecha }}</td>
          </tr>
        </tbody>
      </table>
      <button
        type="button"
        @click="mostrarModalEgresos = false"
        class="btn btn-secondary"
      >
        Cancelar
      </button>
    </div>
  </div>

  <!-- Modal para agregar Egreso -->
  <div v-if="mostrarModalEgreso" class="dialog">
    <div class="modal-content">
      <h3>Registrar Egreso</h3>

      <form @submit.prevent="guardarEgreso">
        <div class="form-group">
          <label for="area">Área</label>
          <select v-model="nuevoEgreso.area" required>
            <option value="habitacion">Recepción</option>
            <option value="nevera">Nevera</option>
            <option value="bar">Restaurante-Bar</option>
            <!-- <option value="EntregoAdmin">Entrego a Administración</option> -->
          </select>
        </div>
        <!-- <div class="form-group">
          <label for="tipo_egreso">Tipo de Egreso</label>
          <input type="text" v-model="nuevoEgreso.tipo_egreso" required />
        </div> -->
        <div class="form-group">
          <label for="cantidad">Cantidad</label>
          <input
            type="number"
            v-model="nuevoEgreso.cantidad"
            step="0.01"
            required
          />
        </div>
        <div class="form-group">
          <label for="tipo_egreso">Tipo de Pago</label>
          <select v-model="nuevoEgreso.tipo_egreso" required>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <div class="form-group">
          <label for="destino">Destino</label>
          <select v-model="nuevoEgreso.destino" required>
            <option value="entrego_cuenta">Entredo de cuenta</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="compras">Compras</option>
            <option value="otros">Otros</option>
            <!-- <option value="EntregoAdmin">Entrego a Administración</option> -->
          </select>
        </div>
        <div class="form-group">
          <label for="observacion">Observación</label>
          <textarea v-model="nuevoEgreso.observacion"></textarea>
        </div>
        <div class="form-group">
          <label for="fecha">Fecha</label>
          <input type="date" v-model="nuevoEgreso.fecha" required />
        </div>
        <div class="modal-footer">
          <button
            type="button"
            @click="mostrarModalEgreso = false"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">Guardar Egreso</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal de Confirmación -->
  <div v-if="showConfirmationModal" class="dialog">
    <div class="modal-content">
      <h2>Confirmación</h2>
      <p>¿Está seguro de que desea cerrar la caja?</p>
      <button @click="cerrarTurno" class="btn btn-primary">Sí, cerrar</button>
      <button @click="showConfirmationModal = false" class="btn btn-secondary">
        Cancelar
      </button>
    </div>
  </div>

  <!-- Modal para agregar cliente -->
  <div v-if="mostrarModalCliente" class="dialog">
    <div class="modal-content">
      <span class="close-button" @click="mostrarModalCliente = false"
        >&times;</span
      >
      <h3>{{ nuevoCliente.id ? "Editar Cliente" : "Agregar Cliente" }}</h3>
      <form @submit.prevent="agregarCliente">
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input type="text" v-model="nuevoCliente.nombre" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" v-model="nuevoCliente.email" required />
        </div>
        <div class="form-group">
          <label for="telefono">Teléfono:</label>
          <input type="text" v-model="nuevoCliente.telefono" required />
        </div>
        <div class="form-group">
          <label for="documento_identidad">Documento de Identidad:</label>
          <input
            type="text"
            v-model="nuevoCliente.documento_identidad"
            required
          />
        </div>
        <div class="modal-footer">
          <button
            type="button"
            @click="mostrarModalCliente = false"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ nuevoCliente.id ? "Actualizar Cliente" : "Agregar Cliente" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal para mostrar clientes -->
  <div v-if="mostrarModalClientes" class="dialog">
    <div class="modal-content">
      <!-- botón para agregar cliente -->
      <button class="btn btn-primary" @click="abrirModalAgregarCliente">
        <i class="fas fa-user-plus"></i> Agregar Cliente
      </button>

      <h3>Lista de Clientes</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Documento de Identidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientes" :key="cliente.id">
            <td>{{ cliente.nombre }}</td>
            <td>{{ cliente.email }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.documento_identidad }}</td>
            <td>
              <button @click="editarCliente(cliente)" class="btn btn-warning">
                Editar
              </button>
              <button
                @click="eliminarCliente(cliente.id)"
                class="btn btn-danger"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="modal-footer"></div>
    </div>
    <button @click="mostrarModalClientes = false" class="btn btn-secondary">
      Cerrar
    </button>
  </div>

  <!-- Modal para Mostrar Resultados del Arqueo -->
  <!-- Modal para Mostrar Resultados del Arqueo -->
  <div v-if="mostrarModalArqueo" class="dialogg">
    <span class="close-button" @click="cerrarModalArqueo = false">&times;</span>
    <!-- Botón para descargar PDF -->

    <div class="dialog-contentt">
      <button class="btn btn-primary" @click="descargarPDF">
        Descargar PDF
      </button>
      <h3 class="modal-title">Arqueo de Caja - Turno Activo</h3>
      <div class="details-section">
        <p class="modal-date">
          <strong>Fecha y Hora:</strong> {{ turnoActivo.fechaInicio }} -
          {{ turnoActivo.fechaFin }}
        </p>

        <div class="reservation-form">
          <!-- <h4>Ingresos por Tipo de Pago</h4> -->
          <p class="total-amount">
            <strong>Total Turno:</strong> {{ totalArqueo }} $
          </p>
          <p class="total-amount">
            <strong>Total Efectivo:</strong> ${{
              (balanceDetalles.efectivo || 0).toFixed(2)
            }}
          </p>
          <!-- <p class="total-amount">
            <strong>Total Caja</strong> {{ totalCaja }} $
          </p> -->

          <div class="expenses-category">
            <p><strong>Total de Egresos:</strong> {{ totalEgresos }} $</p>
          </div>

          <!-- Ingresos Restaurante -->
          <div class="income-category">
            <p><strong>Ingresos Restaurante:</strong></p>
            <ul>
              <li v-for="(monto, index) in ingresosRestaurante" :key="index">
                <span class="detail-row"
                  >{{ monto.tipo_pago }}:
                  {{ monto.total }}
                  $</span
                >
              </li>
            </ul>
          </div>

          <!-- Ingresos Nevera -->
          <div class="income-category">
            <p><strong>Ingresos Nevera:</strong></p>
            <ul>
              <li v-for="(monto, index) in ingresosNevera" :key="index">
                <span class="detail-row"
                  >{{ monto.tipo_pago }}: {{ monto.total }} $</span
                >
              </li>
            </ul>
          </div>

          <!-- Ingresos Habitaciones -->
          <div class="income-category">
            <p><strong>Ingresos Habitaciones:</strong></p>
            <ul>
              <li v-for="(monto, index) in ingresosHabitaciones" :key="index">
                <span class="detail-row"
                  >{{ monto.tipo_pago }}: {{ monto.total }} $</span
                >
              </li>
            </ul>
          </div>

          <!-- Sección de Stock -->
          <h4>Stock Actual</h4>
          <div class="stock-category">
            <!-- Stock de productos del Bar -->
            <!-- <p><strong>Stock de Productos del Bar:</strong></p>
            <ul>
              <li v-for="(producto, index) in stock.bar" :key="index">
                <span class="detail-row"
                  >{{ producto.nombre }}: {{ producto.stock }} unidades</span
                >
              </li>
            </ul> -->

            <!-- Stock de productos de la Nevera -->
            <p><strong>Stock de Productos de la Nevera:</strong></p>
            <ul>
              <li v-for="(producto, index) in stock.nevera" :key="index">
                <span class="detail-row"
                  >{{ producto.nombre }}: {{ producto.cantidad }} unidades</span
                >
              </li>
            </ul>
          </div>

          <!-- Detalles de las Reservas -->
          <h4>Reservas</h4>
          <div
            v-for="(reserva, index) in reservas"
            :key="index"
            class="reservation-details"
          >
            <div @click="toggleReserva(index)" class="accordion-header">
              <p><strong>Reserva ID:</strong> {{ reserva.id }}</p>
              <p>
                <strong>Habitación ID:</strong> {{ reserva.habitacion.numero }}
              </p>
              <!-- <p><strong>Cliente:</strong> {{ reserva.cliente.nombre }}</p> -->
              <p><strong>Estado:</strong> {{ reserva.estado }}</p>
              <p><strong>Total Pago:</strong> {{ reserva.total_pago }} $</p>
              <p>
                <strong>Saldo Pendiente:</strong>
                {{ reserva.saldo_pendiente }} $
              </p>
            </div>

            <div v-if="reserva.showDetails" class="accordion-content">
              <p class="detail-row">
                <strong>Check-In:</strong> {{ reserva.fecha_check_in }}
              </p>
              <p class="detail-row">
                <strong>Check-Out:</strong> {{ reserva.fecha_check_out }}
              </p>

              <!-- Cobros del Huésped -->
              <h5>Cobros del Huésped</h5>
              <ul>
                <li
                  v-for="(cobro, cIndex) in reserva.cobros_huesped"
                  :key="cIndex"
                >
                  <span class="detail-row"
                    >{{ cobro.tipo_pago }}: {{ cobro.monto }} $ -
                    {{ cobro.fecha_pago }}</span
                  >
                </li>
              </ul>

              <!-- Historial de Inventarios -->
              <h5>Historial de Inventarios</h5>
              <ul>
                <li
                  v-for="(historial, hIndex) in reserva.historial_inventarios"
                  :key="hIndex"
                  class="historial-item"
                >
                  <p class="detail-row">
                    <strong>Producto ID:</strong> {{ historial.producto_id }}
                  </p>
                  <p class="detail-row">
                    <strong>Pagado</strong> {{ historial.pagado }}
                  </p>
                  <p class="detail-row">
                    <strong>Cantidad:</strong> {{ historial.cantidad }}
                  </p>
                  <p class="detail-row">
                    <strong>Total:</strong> {{ historial.total }} $
                  </p>
                  <p class="detail-row">
                    <strong>Método de Pago:</strong> {{ historial.metodo_pago }}
                  </p>
                  <p class="detail-row">
                    <strong>Fecha de Registro:</strong>
                    {{ historial.created_at }}
                  </p>

                  <!-- Cobros Asociados para Inventarios -->
                  <h6>Cobros Asociados</h6>
                  <ul v-if="historial.cobros_nevera.length > 0">
                    <li
                      v-for="(cobro, cIndex) in historial.cobros_nevera"
                      :key="cIndex"
                      class="detail-row"
                    >
                      <span>
                        {{ cobro.tipo_pago }}: {{ cobro.monto }} $ -
                        {{ cobro.fecha_cobro }}
                      </span>
                    </li>
                  </ul>
                  <p v-else>Sin cobros registrados</p>
                </li>
              </ul>
              <!-- cobros pedidos bar -->
              <h5>Cobros Pedidos Bar</h5>

              <ul>
                <li v-for="(pedido, pIndex) in reserva.pedidos" :key="pIndex">
                  <h6>Pedido ID: {{ pedido.id }}</h6>
                  <p class="detail-row">
                    <strong>Estado:</strong> {{ pedido.estado }}
                  </p>
                  <p class="detail-row">
                    <strong>Método de Pago:</strong> {{ pedido.metodo_pago }}
                  </p>
                  <p class="detail-row">
                    <strong>Total:</strong> {{ pedido.total }} $
                  </p>
                  <p class="detail-row">
                    <strong>Propina:</strong> {{ pedido.propina }} $
                  </p>
                  <p class="detail-row">
                    <strong>Cliente:</strong>
                    {{ pedido.nombre_cliente || "Sin nombre" }}
                  </p>
                  <p class="detail-row">
                    <strong>Observaciones:</strong>
                    {{ pedido.observaciones || "Ninguna" }}
                  </p>

                  <h6>Cobros Asociados</h6>
                  <ul v-if="pedido.cobros_pedido.length > 0">
                    <li
                      v-for="(cobro, cIndex) in pedido.cobros_pedido"
                      :key="cIndex"
                      class="detail-row"
                    >
                      <span>
                        {{ cobro.tipo_pago }}: {{ cobro.monto }} $ -
                        {{ cobro.fecha_cobro }}
                      </span>
                    </li>
                  </ul>
                  <p v-else>Sin cobros registrados</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" @click="cerrarModalArqueo">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal para ver detalles de la reserva -->
  <!-- Modal para ver detalles de la reserva -->
  <div v-if="showDetallesReservaModal" class="dialogg">
    <div class="dialog-contentt">
      <button class="close-modal" @click="showDetallesReservaModal = false">
        &times;
      </button>
      <h2>Detalles de la Reserva</h2>

      <div class="details-section">
        <!-- <div class="detail-row">
          <strong>Reserva ID:</strong> {{ reservas?.id }}
        </div> -->
        <div class="detail-row">
          <strong>Cliente:</strong> {{ reservas?.cliente?.nombre }}
        </div>
        <div class="detail-row">
          <strong>Fecha de Check-in:</strong> {{ reservas?.fecha_check_in }}
        </div>
        <div class="detail-row">
          <strong>Fecha de Check-out:</strong> {{ reservas?.fecha_check_out }}
        </div>
        <div class="detail-row">
          <strong>Estado:</strong> {{ reservas?.estado }}
        </div>
        <div class="detail-row">
          <strong>Saldo Pendiente:</strong> {{ totalConsolidado }} $
        </div>
      </div>
      <!-- Botón para completar la reserva -->
      <button
        class="btn btn-primary"
        @click="completarReserva(reservas.id)"
        :disabled="totalConsolidado > 0"
      >
        Completar Reserva
      </button>

      <!-- consumo del bar -->

      <!-- Sección de Consumos en el Bar -->
      <h4>Consumos en el Bar</h4>
      <div class="details-section">
        <ul v-if="pedidosbar.length > 0">
          <li v-for="pedido in pedidosbar" :key="pedido.id" class="pedido-item">
            <div class="pedido-header">
              <!-- <strong>Pedido ID:</strong> {{ pedido.id }}- -->
              <strong>Saldo:</strong>{{ pedido.total }} <strong>Propina</strong
              >{{ pedido.propina }}
            </div>
            <div class="pedido-details">
              <table class="consumos-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Total ($)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in pedido.detalles" :key="detalle.id">
                    <td>{{ detalle.producto.nombre }}</td>
                    <td>{{ detalle.cantidad }}</td>
                    <td>{{ detalle.subtotal }}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="text-align: right">
                      <strong>Total:</strong>
                    </td>
                    <td>
                      <strong>
                        {{
                          pedido.detalles
                            .reduce(
                              (acc, detalle) =>
                                acc + parseFloat(detalle.subtotal),
                              0
                            )
                            .toFixed(2)
                        }}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </li>
        </ul>
        <!-- Total General de todos los consumos -->
        <div
          v-if="pedidosbar.length > 0"
          style="text-align: right; margin-top: 10px"
        >
          <strong>Total General:</strong>
          {{
            pedidosbar
              .reduce((acc, pedido) => acc + parseFloat(pedido.total), 0)
              .toFixed(2)
          }}
        </div>
        <p v-else>No hay consumos registrados en el bar.</p>

        <h5>Pago Bar</h5>
        <div class="payment-section">
          <input
            type="number"
            v-model="payment.bar.amount"
            placeholder="Monto a pagar"
          />
          <select v-model="payment.bar.type">
            <option value="" disabled>Selecciona el tipo de pago</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
          <input
            type="text"
            v-model="payment.bar.comment"
            placeholder="Comentario"
          />
        </div>
      </div>

      <!-- Sección de Consumos en la Nevera -->
      <h4>Consumos en la Nevera</h4>
      <div class="details-section">
        <ul v-if="neverap.length > 0">
          <li
            v-for="consumop in neverap"
            :key="consumop.id"
            class="pedido-item"
          >
            <div class="pedido-header">
              <strong>Producto ID:</strong> {{ consumop.producto_id }} -
              <strong>Total:</strong> {{ consumop.total }} $
            </div>
            <strong>Saldo:</strong>{{ consumop.total }}
            <div class="pedido-details">
              <table class="consumos-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Total ($)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {{
                        consumop.producto?.nombre ||
                        "Producto " + consumop.producto_id
                      }}
                    </td>
                    <td>{{ consumop.cantidad }}</td>
                    <td>{{ consumop.total }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </li>
        </ul>
        <!-- Total General de todos los consumos en la nevera -->
        <div
          v-if="neverap.length > 0"
          style="text-align: right; margin-top: 10px"
        >
          <strong>Total General:</strong>
          {{
            neverap
              .reduce((acc, consumop) => acc + parseFloat(consumop.total), 0)
              .toFixed(2)
          }}
        </div>
        <p v-else>No hay consumos registrados en la nevera.</p>

        <!-- Sección de Pago para Nevera -->
        <h5>Pago Nevera</h5>
        <div class="payment-section">
          <input
            type="number"
            v-model="payment.nevera.amount"
            placeholder="Monto a pagar"
          />
          <select v-model="payment.nevera.type">
            <option value="" disabled>Selecciona el tipo de pago</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
          <input
            type="text"
            v-model="payment.nevera.comment"
            placeholder="Comentario"
          />
        </div>
      </div>

      <!-- Sección de Deudas por la estadía en la habitación -->
      <h3>Deudas de la Habitación</h3>
      <div class="detail-row">
        <strong>Total de Pago:</strong> {{ reservas?.total_pago }} $
      </div>
      <div class="detail-row">
        <strong>Saldo Pendiente:</strong> {{ reservas?.saldo_pendiente }} $
      </div>

      <h5>Pago Habitación</h5>
      <div class="payment-section">
        <input
          type="number"
          v-model="payment.habitacion.amount"
          placeholder="Monto a pagar"
        />
        <select v-model="payment.habitacion.type">
          <option value="" disabled>Selecciona el tipo de pago</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
        <input
          type="text"
          v-model="payment.habitacion.comment"
          placeholder="Comentario"
        />
      </div>

      <!-- Botón para cerrar el modal -->
      <button class="btn btn-secondary" @click="closeModalDetallesR">
        Cerrar
      </button>
      <button @click="procesarPago" class="btn btn-primary">
        Realizar Pago
      </button>
    </div>
  </div>

  <!-- Modal de pedidos pendientes -->
  <div v-if="showPedidosPendientesModal" class="modal-overlay">
    <div class="modall">
      <button class="close-modal" @click="showPedidosPendientesModal = false">
        &times;
      </button>
      <h2>Pedidos Pendientes</h2>
      <div class="modal-content">
        <div v-if="pedidosPendientes.length > 0">
          <div
            v-for="pedido in pedidosPendientes"
            :key="pedido.id"
            class="pedido-item"
          >
            <h3>Pedido ID: {{ pedido.id }}</h3>
            <p>Habitacion: {{ pedido.numero_habitacion }}</p>
            <p>Cliente: {{ pedido.nombre_cliente || "Sin nombre" }}</p>
            <p>Pendiente: {{ pedido.total }} $</p>
            <p>Total:{{ pedido.total_original }}</p>
            <p>Propina: {{ pedido.propina }} $</p>
            <p>Estado: {{ pedido.estado }}</p>
            <h4>Detalles:</h4>
            <ul>
              <li v-for="detalle in pedido.detalles" :key="detalle.id">
                {{ detalle.producto?.nombre || "Producto no disponible" }} -
                {{ detalle.cantidad }} x {{ detalle.precio_unitario }} =
                {{ detalle.subtotal }} $
              </li>
            </ul>

            <div class="reservation-form">
              <!-- Campos para el cobro -->
              <label for="monto">Monto:</label>
              <input v-model="nuevoConsumo.total" type="number" min="0" />

              <label for="metodo_pago">Método de Pago:</label>
              <select v-model="nuevoConsumo.metodo_pago">
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>

              <label for="comentario">Comentario:</label>
              <input
                v-model="nuevoConsumo.comentario"
                type="text"
                placeholder="Opcional"
              />

              <!-- Botón para cobrar el pedido -->
              <button class="btn btn-primary" @click="cobrarPedido(pedido.id)">
                Cobrar
              </button>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No hay pedidos pendientes.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Botón para abrir el menú de opciones -->

  <div v-if="menuVisible" class="dialog">
    <v-dialog v-model="menuVisible" max-width="400" persistent>
      <v-card class="dialog-content" elevation="10">
        <v-card-title class="text-h5 dialog-title">
          <h3>Opciones de la Reserva</h3>
        </v-card-title>
        <v-card-text>
          <v-row justify="center">
            <v-col>
              <v-list dense class="list">
                <v-list-item @click="modificarReserva" class="menu-item">
                  Modificar Reserva
                </v-list-item>
                <v-list-item
                  @click="abrirModalConsumo(reserva)"
                  class="menu-item"
                >
                  Añadir Consumo
                </v-list-item>

                <v-list-item @click="openModal(reserva)" class="menu-item">
                  Añadir Observación
                </v-list-item>
                <v-list-item @click="verDetalles" class="menu-item">
                  Ver Detalles
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="form-actions">
          <v-btn
            color="primary"
            @click="menuVisible = false"
            class="btn btn-primary"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <!-- Componente de diálogo para modificar la reserva -->
  <div v-if="showDialog" class="dialog">
    <div class="dialog-content">
      <h3>Actualizar reserva</h3>
      <div class="reservation-form">
        <div class="form-group">
          <label for="estado">Estado:</label>
          <select v-model="selectedStatus">
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Reservada">Reservada</option>
            <option value="En Curso">Ocupada</option>
            <!-- <option value="Completada">Completada</option>-->
          </select>
        </div>

        <div class="form-group">
          <label for="checkInDate">Fecha de check-in:</label>
          <input type="date" v-model="checkInDate" />
        </div>

        <div class="form-group">
          <label for="checkOutDate">Fecha de check-out:</label>
          <input type="date" v-model="checkOutDate" />
        </div>

        <div class="form-group">
          <label for="numeroPersonas">Número de personas:</label>
          <input type="number" v-model="numeroPersonas" min="1" />
        </div>

        <div class="form-group">
          <label for="totalPago">Total de pago:</label>
          <input type="number" v-model="totalPago" step="0.01" min="0" />
        </div>

        <div class="form-group">
          <label for="habitacion">Habitación:</label>
          <select v-model="selectedHabitacion">
            <option
              v-for="habitacion in habitaciones"
              :key="habitacion.id"
              :value="habitacion.id"
            >
              {{ habitacion.numero }}
              <!-- Muestra el nombre de la habitación -->
            </option>
          </select>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button class="btn btn-primary" @click="updateReservaEstado">
            Actualizar
          </button>
          <button class="btn btn-secondary" @click="showDialog = false">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal para reserva -->
  <div v-if="showReservaModal" class="dialog">
    <div class="modal">
      <button class="close-modal" @click="showReservaModal = false">
        &times;
      </button>
      <h3>Reserva Habitación {{ habitacionSeleccionada.numero }}</h3>

      <!-- Formulario de Reserva -->
      <form @submit.prevent="realizarReserva">
        <!-- Resto del formulario de reserva -->
        <div class="form-group">
          <label for="cliente">Cliente:</label>
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Buscar cliente..."
            class="form-control"
          />
          <select
            class="form-control"
            v-model="crearreserva.cliente_id"
            required
          >
            <option
              v-for="cliente in filteredClientes"
              :value="cliente.id"
              :key="cliente.id"
            >
              {{ cliente.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="numeroPersonas">Número de Personas:</label>
          <input
            type="number"
            v-model="crearreserva.numero_personas"
            required
            min="1"
          />
        </div>

        <div class="form-group">
          <label for="totalPago">Total a Pagar:</label>
          <input
            type="number"
            v-model="crearreserva.total_pago"
            required
            min="0"
          />
        </div>

        <div class="form-group">
          <label for="fechaInicio">Fecha de Inicio:</label>
          <input type="date" v-model="crearreserva.fecha_check_in" required />
        </div>

        <div class="form-group">
          <label for="fecha_check_out">Fecha de Fin:</label>
          <input type="date" v-model="crearreserva.fecha_check_out" required />
        </div>

        <div class="form-group">
          <label for="estado">Estado de la Reserva:</label>
          <select v-model="crearreserva.estado" required>
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Reservada">Reservada</option>
            <option value="En Curso">Ocupada</option>
          </select>
        </div>

        <div class="form-group">
          <label for="origen_reserva">Origen de Reserva:</label>
          <select v-model="crearreserva.origen_reserva" required>
            <option value="booking">Booking</option>
            <option value="Presencial">Presencial</option>
            <option value="Teléfono">Teléfono</option>
            <option value="whastapp">Whastapp</option>
            <option value="instagran">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary">Confirmar Reserva</button>
      </form>
    </div>
  </div>

  <!-- Modal para añadir consumo -->
  <div v-if="modalConsumoVisible" class="dialog">
    <div class="modal">
      <h3>Añadir Consumo a la Habitación</h3>

      <!-- Formulario de Consumo -->
      <form @submit.prevent="guardarConsumo">
        <!-- Añade el prevent para evitar el recargado de la página -->
        <div class="form-group">
          <label for="producto">Producto:</label>
          <select
            v-model="nuevoConsumo.producto_id"
            @change="actualizarPrecio"
            required
          >
            <option
              v-for="producto in productos"
              :value="producto.id"
              :key="producto.id"
            >
              {{ producto.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="cantidad">Cantidad:</label>
          <input
            type="number"
            v-model="nuevoConsumo.cantidad"
            @input="calcularTotal"
            required
            min="1"
          />
        </div>

        <div class="form-group">
          <label for="precio">Precio:</label>
          <input
            type="number"
            v-model="nuevoConsumo.precio"
            required
            min="0"
            readonly
          />
        </div>

        <div class="form-group">
          <label for="pagado">Pagado:</label>
          <input type="checkbox" v-model="nuevoConsumo.pagado" />
        </div>

        <div class="form-group">
          <label for="metododepago">Método de Pago:</label>
          <select v-model="nuevoConsumo.metodo_pago" required>
            <option value="no_pagado">No pagado</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        <div class="form-group">
          <label for="total">Total:</label>
          <input
            type="number"
            v-model="nuevoConsumo.total"
            required
            min="0"
            readonly
          />
        </div>

        <!-- Botones de acciones -->
        <button type="submit" class="btn btn-primary">Guardar</button>
        <button type="button" class="btn btn-secundario" @click="cerrarModal">
          Cancelar
        </button>
      </form>
    </div>
  </div>

  <!-- Modal de notificación -->
  <div v-if="showNotificationModal" class="dialog">
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
  <!-- modal para agregar observación -->
  <div class="dialog" v-if="showModal">
    <div class="dialog-content">
      <h2>Crear Observación</h2>
      <form @submit.prevent="submitObservacion">
        <div>
          <label for="contenido">Contenido</label>
          <textarea
            v-model="form.contenido"
            id="contenido"
            required
            style="width: 80%; height: 100px"
          ></textarea>
        </div>

        <div>
          <label for="tipo">Tipo</label>
          <select v-model="form.tipo" id="tipo" required>
            <option value="General">General</option>
            <option value="Incidencia">Incidencia</option>
            <option value="Sugerencia">Sugerencia</option>
          </select>
        </div>
        <v-card-actions class="form-actions">
          <div>
            <button type="submit" class="btn btn-primary">
              Crear Observación
            </button>
            <button type="button" class="btn btn-primary" @click="closeModal">
              Cancelar
            </button>
          </div>
        </v-card-actions>
      </form>
    </div>
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue3";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline"; // Importa el plugin de línea de tiempo
import interactionPlugin from "@fullcalendar/interaction"; // Para interacción con eventos
import axios from "../plugins/axios"; // Asegúrate de que la ruta sea correcta

export default {
  components: { FullCalendar },
  data() {
    return {
      mostrarModalBalance: true,
      balances_por_area: {},
      totalPersonas: 0, // Variable para almacenar el total de personas
      searchTerm: "", // Para almacenar el término de búsqueda
      mostrarModalClientes: false,
      // clientes: [], // Aquí se almacenarán los clientes
      mostrarModalCliente: false,
      nuevoCliente: {
        nombre: "",
        email: "",
        telefono: "",
        documento_identidad: "",
      },
      showConfirmationModal: false,
      showEstadoModal: false,
      balanceTotal: 0, // Variable para almacenar el balance total
      balanceDetalles: [],
      mostrarModalEgresos: false,
      egresos: [], // Lista de egresos

      mostrarModalEgreso: false,
      nuevoEgreso: {
        area: "",
        tipo_egreso: "",
        cantidad: "",
        observacion: "",
        destino: "",
        fecha: "",
      },
      closeModalDetallesR() {
        this.showDetallesReservaModal = false;
        this.resetForm(); // Llama al método para limpiar el formulario
      },

      resetForm() {
        this.payment = {
          bar: {
            amount: "",
            type: "",
            comment: "",
          },
          nevera: {
            amount: "",
            type: "",
            comment: "",
          },
          habitacion: {
            amount: "",
            type: "",
            comment: "",
          },
        };
        this.reservas = {}; // O cualquier otro valor inicial que necesites
        this.pedidosbar = []; // Reiniciar la lista de pedidos del bar
        this.neverap = []; // Reiniciar la lista de consumos en la nevera
        this.totalConsolidado = 0; // Reiniciar el total consolidado
      },
      //datos para arqueo de caja
      mostrarModalArqueo: false,
      turnoActivo: {
        fechaInicio: null,
        fechaFin: null,
      },
      ingresosRestaurante: 0,
      ingresosNevera: 0,
      ingresosHabitaciones: 0,
      // reservas: [],
      // totalArqueo: 0,
      //-------------------------------

      neverap: [], //para el consumo de la nevera
      saldo_pendiente: 0,
      //-- para gauradar la repuesta de la api de resta-bar
      pedidosbar: [],
      //------para el modal de detalles de la reserva
      showDetallesReservaModal: false,
      reservas: {
        cliente: null,
        consumosBar: [],
        consumosNevera: [],
        total_pago: 0,
        saldo_pendiente: 0,
      },
      //  totalConsolidado: 0, // Este debería ser calculado previamente para completar la reserva
      payment: {
        bar: {
          amount: null,
          type: "",
          comment: "",
        },
        nevera: {
          amount: null,
          type: "",
          comment: "",
        },
        habitacion: {
          amount: null,
          type: "",
          comment: "",
        },
      },
      consumosBar: [],
      //-----------------------------------------
      consumosNevera: [],
      showPedidosPendientesModal: false, // Controla la visibilidad del modal de pedidos pendientes
      pedidosPendientes: [], // Lista de pedidos pendientes
      selectedPedidoId: null, // Para manejar el pedido seleccionado
      pedidosPendientesCount: 0, // Contador de pedidos pendientes
      productos: [], // To store products from the backend
      nuevoConsumo: {
        producto: "",
        cantidad: "",
        precio: "",
        total_original: "",
        total: "",
        pagado: false,
        metodo_pago: false,
      },
      // Referencia de los estados de las reservas
      estadosReferencia: [
        { nombre: "Pendiente", color: "blue" }, // azul
        { nombre: "Confirmada", color: "#28A745" }, // Verde
        { nombre: "Ocupada", color: "red" }, // rojo

        { nombre: "Reservada", color: "#ffc107" }, // Púrpura
        // Excluir "Cancelada" y "Completada" como solicitaste
      ],
      // Datos iniciales para el formulario de observación
      form: {
        contenido: "",
        tipo: "General",
        reserva_id: "",
        cliente_id: "",
        turno_id: "",
        user_id: "", // ID del usuario actual
      },
      habitaciones: [], // Lista de habitaciones
      showModal: false, // Controla la visibilidad del modal de observación
      item: null, // El objeto de reserva seleccionado
      turnoActivoId: "", // Ejemplo, obtén esto dinámicamente
      usuario: "", // Ejemplo, ID del usuario autenticado
      calendarOptions: {
        plugins: [resourceTimelinePlugin, interactionPlugin],
        // eventClick: this.handleEventClick, // Asegúrate de que esta función esté registrada
        initialView: "resourceTimelineMonth",
        locale: "es",
        resources: [], // Inicializa vacío
        events: [],
        // resourceLabelDidMount: this.handleResourceClick, // Maneja el clic en la habitación
        // Efecto hover para filas de recursos
        resourceLabelDidMount: (info) => {
          // Cambia el color al pasar el mouse
          info.el.addEventListener("mouseenter", () => {
            info.el.style.backgroundColor = "#e0e0e0"; // Color al hacer hover
          });
          info.el.addEventListener("mouseleave", () => {
            info.el.style.backgroundColor = ""; // Vuelve al color original
          });

          // Mantiene la funcionalidad de clic en la habitación
          this.handleResourceClick(info);
        },
        // Efecto hover para eventos

        // Efecto hover para eventos
        eventDidMount: (info) => {
          // Estilo de hover
          const hoverColor = "#d3d3d3";
          info.el.style.transition = "background-color 0.3s ease";

          // Almacena el contenido del tooltip
          // const tooltipText = info.event.extendedProps.creadoPor || "";
          // const tooltipText2 = info.event.extendedProps.pagoRealizado || "";

          // Almacena el contenido del tooltip
          const tooltipText = info.event.extendedProps.creadoPor || "";
          const tooltipPago = info.event.extendedProps.pagoRealizado || "";
          const tooltipOrigen = info.event.extendedProps.origenReserva
            ? `Origen: ${info.event.extendedProps.origenReserva}`
            : "Origen no especificado";

          // Crea el tooltip al pasar el mouse
          info.el.addEventListener("mouseenter", () => {
            info.el.style.backgroundColor = hoverColor;

            // Crea el elemento del tooltip
            const tooltip = document.createElement("div");
            tooltip.className = "tooltip";
            tooltip.style.position = "absolute";
            tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            tooltip.style.color = "white";
            tooltip.style.padding = "10px";
            tooltip.style.borderRadius = "12px";
            tooltip.style.fontSize = "16px";
            tooltip.style.zIndex = "1000";
            //tooltip.textContent = tooltipText;
            // Añade el contenido del tooltip (incluyendo origen)
            tooltip.innerHTML = `
      <strong>${tooltipText}</strong><br>
      ${tooltipPago}<br>
      ${tooltipOrigen}
    `;

            // Agrega el tooltip al DOM
            document.body.appendChild(tooltip);

            // Posiciona el tooltip
            info.el.addEventListener("mousemove", (e) => {
              tooltip.style.left = `${e.pageX + 10}px`;
              tooltip.style.top = `${e.pageY + 10}px`;
            });

            // Elimina el tooltip al salir del mouse
            info.el.addEventListener("mouseleave", () => {
              tooltip.remove();
              info.el.style.backgroundColor = "";
            });
          });

          // Manejador de clic para el evento
          info.el.addEventListener("click", () => {
            this.handleEventClick(info);
          });
        },

        allDaySlot: true,
        slotDuration: { days: 1 },
        //estilos del calendario
        height: "115%", // Automático para adaptarse al contenido
        resourceAreaWidth: "20%", // Cambia el ancho de la columna de habitaciones
        contentHeight: "flex", // Ajusta la altura de acuerdo con el contenido
        slotLabelFormat: {
          weekday: "short",
          day: "numeric",
          month: "short",
        },
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "resourceTimelineWeek,resourceTimelineMonth",
        },
        // Configuración para forzar el orden en base a `title`
        resourceOrder: "title",
      },

      modalConsumoVisible: false, // Controla la visibilidad del modal de consumo
      showReservaModal: false, // Controla si el modal de reserva está visible
      showNotificationModal: false,
      menuVisible: false,
      showDialog: false,
      selectedStatus: "",
      currentReservaId: null,
      checkInDate: "",
      checkOutDate: "",
      numeroPersonas: "",
      // origen_reserva: "",
      totalPago: "",
      messageType: "",
      message: "",
      reserva: null,
      habitacionSeleccionada: {}, // Almacena la información de la habitación seleccionada
      clientes: [], // Lista de clientes para seleccionar en el formulario
      crearreserva: {
        cliente_id: null,
        numero_personas: "",
        total_pago: 0,
        fecha_check_in: "",
        fecha_check_out: "",
        estado: "",
        origen_reserva: "",
      },
    };
  },
  mounted() {
    console.log("Montando componente");
    this.fetchHabitaciones(); // Llama a la función para obtener habitaciones
    this.fetchReservas(); // Llama a la función para obtener reservas
    this.fetchClientes(); //llama a los clientes
    this.fetchProductos(); // Fetch products when component mounts
    this.obtenerPedidosPendientes(); // Llama a la función para obtener pedidos pendientes
    this.fetchEgresos();
    this.obtenerBalanceTotal();
    this.obtenerHuespedesEnCurso();
  },

  computed: {
    filteredClientes() {
      return this.clientes
        .filter((cliente) => cliente && cliente.nombre) // Filtra clientes que no sean undefined y tengan nombre
        .filter((cliente) =>
          cliente.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    },

    // Método para obtener el total de egresos de una categoría y tipo de pago específico
    totalEgresos() {
      // Suma el valor de 'cantidad' de cada egreso
      return this.egresos
        .reduce((acc, egreso) => acc + parseFloat(egreso.cantidad || 0), 0)
        .toFixed(2);
    },
    // Método para obtener el total de totalArqueo - totalEgresos
    totalCaja() {
      return (this.totalArqueo - this.totalEgresos).toFixed(2);
    },
    totalArqueo() {
      // Sumar los totales de cada ingreso agrupado
      const totalRestaurante = this.ingresosRestaurante.reduce(
        (acc, ingreso) => acc + parseFloat(ingreso.total || 0),
        0
      );
      const totalNevera = this.ingresosNevera.reduce(
        (acc, ingreso) => acc + parseFloat(ingreso.total || 0),
        0
      );
      const totalHabitaciones = this.ingresosHabitaciones.reduce(
        (acc, ingreso) => acc + parseFloat(ingreso.total || 0),
        0
      );

      // Redondear a 2 decimales y retornar
      return (totalRestaurante + totalNevera + totalHabitaciones).toFixed(2);
    },

    totalConsolidado() {
      const totalBar = this.pedidosbar.reduce(
        (acc, pedido) => acc + parseFloat(pedido.total),
        0
      );
      const totalNevera = this.neverap.reduce(
        (acc, consumop) => acc + parseFloat(consumop.total),
        0
      );
      const totalHabitacion = parseFloat(this.reservas.saldo_pendiente || 0);
      return (totalBar + totalNevera + totalHabitacion).toFixed(2);
    },
    saldoPendienteConsolidado() {
      const saldoPendienteBar = this.pedidosbar.reduce(
        (acc, pedido) =>
          acc + parseFloat(pedido.saldo_pendiente || pedido.saldo || 0),
        0
      );

      const saldoPendienteNevera = this.neverap.reduce(
        (acc, consumop) =>
          acc + parseFloat(consumop.saldo_pendiente || consumop.saldo || 0),
        0
      );

      const saldoPendienteHabitacion = parseFloat(
        this.reservas?.saldo_pendiente || 0
      );

      return (
        saldoPendienteBar +
        saldoPendienteNevera +
        saldoPendienteHabitacion
      ).toFixed(2);
    },
  },
  methods: {
    async obtenerHuespedesEnCurso() {
      try {
        // Realizamos una petición al backend para obtener el total de personas en reservas "En Curso"
        const response = await axios.get("/auth/res/huespedess");
        this.totalPersonas = response.data.total_personas; // Asignamos el total al data
      } catch (error) {
        console.error(
          "Error al obtener el número de huéspedes en curso:",
          error
        );
      }
    },
    async obtenerDetallesHabitacion() {
      const seleccionada = this.habitaciones.find(
        (habitacion) => habitacion.id === this.habitacionSeleccionada.id
      );

      if (seleccionada) {
        this.habitacionSeleccionada = { ...seleccionada };
      }
    },
    async cambiarEstadoServicio() {
      try {
        // Enviar los datos al backend (API)
        const response = await axios.put(
          `/auth/habitaciones/${this.habitacionSeleccionada.id}`,
          {
            estado_servicio: this.habitacionSeleccionada.estado_servicio,
          }
        );

        // Si la actualización es exitosa
        console.log("Estado de servicio actualizado:", response.data);

        // Cierra el modal después de la actualización
        this.showEstadoModal = false;

        // Si es necesario, puedes actualizar las habitaciones en el frontend
        // para reflejar el nuevo estado
        this.fetchHabitaciones(); // Recarga las habitaciones desde el backend
      } catch (error) {
        console.error("Error al actualizar el estado de servicio:", error);
      }
    },
    abrirModaldeClientes() {
      this.mostrarModalClientes = true; // Muestra el modal de clientes
      this.fetchClientes(); // Llama a la función para obtener clientes
    },
    abrirModalAgregarCliente() {
      this.nuevoCliente = {}; // Reinicia el objeto para agregar un nuevo cliente
      this.mostrarModalCliente = true; // Muestra el modal de agregar cliente
      this.mostrarModalClientes = false; // Cierra el modal de observación si está abierto
    },
    editarCliente(cliente) {
      // Establece los datos del cliente seleccionado en la propiedad que se usará en el modal de edición
      this.nuevoCliente = { ...cliente }; // Copia los datos del cliente a nuevoCliente
      this.mostrarModalCliente = true; // Muestra el modal para agregar cliente (que usaremos también para editar)
      this.mostrarModalClientes = false;
    },
    async eliminarCliente(clienteId) {
      const confirmacion = confirm(
        "¿Estás seguro de que deseas eliminar este cliente?"
      );
      if (confirmacion) {
        try {
          await axios.delete(`/auth/clientes/${clienteId}`);
          this.clientes = this.clientes.filter(
            (cliente) => cliente.id !== clienteId
          );
          this.messageType = "success";
          this.message = "Cliente eliminado exitosamente.";
          this.showNotificationModal = true;
        } catch (error) {
          console.error("Error al eliminar el cliente:", error);
          this.messageType = "error";
          this.message = "Hubo un problema al eliminar el cliente.";
          this.showNotificationModal = true;
        }
      }
    },
    async agregarCliente() {
      try {
        // Guarda el cliente creado o actualizado en la variable `response`
        const response = this.nuevoCliente.id
          ? await axios.put(
              `/auth/clientes/${this.nuevoCliente.id}`,
              this.nuevoCliente
            ) // Si hay un id, se actualiza
          : await axios.post("/auth/clientes", this.nuevoCliente); // Si no, se agrega un nuevo cliente

        this.messageType = "success";
        this.message =
          response.data.message || "Cliente agregado exitosamente.";
        this.showNotificationModal = true;
        this.mostrarModalCliente = false; // Cierra el modal

        // Guarda el cliente antes de limpiar `nuevoCliente`
        const clienteGuardado = response.data.cliente;

        // Limpia el formulario después de guardar
        this.nuevoCliente = {};

        // Si agregamos un nuevo cliente, lo podemos agregar a la lista de clientes
        if (!this.nuevoCliente.id) {
          this.clientes.push(clienteGuardado); // Agrega el cliente guardado a la lista de clientes
        }
      } catch (error) {
        this.messageType = "error";
        this.message =
          error.response?.data?.message ||
          "Hubo un problema al agregar el cliente.";
        this.showNotificationModal = true;
      }
    },

    abrirModalConfirmacion() {
      this.showConfirmationModal = true; // Muestra el modal de confirmación
    },
    //para cerrar turno
    async cerrarTurno() {
      try {
        // Llamar a la API para cerrar el turno
        const cerrarTurnoResponse = await axios.post("/auth/cerrar-turno");

        // Llamar a la API para cerrar la sesión
        const logoutResponse = await axios.post("/auth/logout");

        // Puedes usar logoutResponse aquí si es necesario
        console.log(logoutResponse.data); // Por ejemplo, para verificar el resultado del logout

        // Mensaje de éxito
        this.messageType = "success";
        this.message =
          cerrarTurnoResponse.data.message ||
          "Turno cerrado exitosamente. Sesión cerrada.";
        this.showNotificationModal = true; // Mostrar el modal de notificación
        //dirigir a la pagina de login
        this.$router.push("/login");
      } catch (error) {
        console.error("Error:", error);
        // Mensaje de error
        this.messageType = "error";
        this.message =
          error.response?.data?.message ||
          "Hubo un problema al cerrar el turno o la sesión.";
        this.showNotificationModal = true; // Mostrar el modal de notificación
      } finally {
        this.showConfirmationModal = false; // Cierra el modal de confirmación
      }
    },

    async obtenerBalanceTotal() {
      try {
        const response = await axios.get("/auth/balance-total");
        this.balanceTotal = response.data.balance_total;
        this.balanceDetalles = response.data.detalles.balance_por_tipo;
        this.balances_por_area = response.data.detalles.balances_por_area;
        this.mostrarModalBalance = false; // Abre el modal después de obtener los datos
        this.fetchEgresos();
      } catch (error) {
        console.error("Error al obtener el balance total:", error);
      }
    },
    cerrarModalBalance() {
      this.mostrarModalBalance = false;
    },
    abrirModalBalance() {
      this.mostrarModalBalance = true;
    },

    // Método para obtener el total de egresos de una categoría y tipo de pago específico
    obtenerEgreso(area, tipoEgreso) {
      return this.egresos
        .filter(
          (egreso) => egreso.area === area && egreso.tipo_egreso === tipoEgreso
        )
        .reduce((total, egreso) => total + parseFloat(egreso.cantidad), 0);
    },
    //funcion para abrir el modal de egreso
    mostrarEgresos() {
      this.mostrarModalEgresos = true;
      this.fetchEgresos(); //llama a los egresos
      //limpiar el formulario de egreso al abrir el modal
      this.nuevoEgreso = {
        area: "",
        tipo_egreso: "",
        cantidad: "",
        observacion: "",
        destino: "",
        fecha: "",
      };
    },

    //funcion para obtener los egresos
    async fetchEgresos() {
      try {
        const response = await axios.get("/auth/egresos");
        this.egresos = response.data;
      } catch (error) {
        console.error("Error al obtener los egresos:", error);
      }
    },
    async guardarEgreso() {
      try {
        const response = await axios.post("/auth/egresos", this.nuevoEgreso);
        // Mensaje de éxito
        this.messageType = "success";
        this.message =
          response.data.message || "Egreso registrado exitosamente";
        this.showNotificationModal = true;

        this.mostrarModalEgreso = false; // Cerrar el modal de egreso
        this.nuevoEgreso = {}; // Limpiar el formulario después de guardar
        this.obtenerBalanceTotal(); // Actualizar el balance total
        // this.realizarArqueoCaja(); // Actualizar el arqueo de caja
      } catch (error) {
        console.error("Error al registrar el egreso:", error);
        // Mensaje de error
        this.messageType = "error";
        this.message =
          error.response?.data?.message ||
          "Hubo un problema al registrar el egreso.";
        this.showNotificationModal = true;
      }
    },

    //funcion para descargar elpdf
    async descargarPDF() {
      try {
        const response = await axios.get("/auth/arqueo-turno-activo", {
          params: { response_type: "pdf" },
          responseType: "blob", // Esto es importante para manejar el archivo PDF
        });

        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "arqueo_turnobar.pdf"); // nombre del archivo que se descargará
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Remover el enlace del DOM
      } catch (error) {
        console.error("Error al descargar el PDF:", error);
      }
    },

    //funcion para abrir arqueo de caaj estilo acordion
    toggleReserva(index) {
      this.reservas[index].showDetails = !this.reservas[index].showDetails;
    },
    async realizarArqueoCaja() {
      try {
        // Hacer solicitud al backend para obtener los ingresos del turno activo
        const response = await axios.get("/auth/arqueo-turno-activo");
        const data = response.data;

        // Actualizar datos en el frontend
        this.turnoActivo.fechaInicio = data.turno.fecha_inicio;
        this.turnoActivo.fechaFin = data.turno.fecha_fin;
        this.ingresosRestaurante = data.ingresos.restaurante;
        this.ingresosNevera = data.ingresos.nevera;
        this.ingresosHabitaciones = data.ingresos.habitacion;
        this.reservas = data.reservas; // Añadir las reservas al frontend
        this.stock = data.stock;

        // Mostrar modal de arqueo
        this.mostrarModalArqueo = true;
      } catch (error) {
        console.error("Error al realizar el arqueo de caja:", error);
        console.error("Ocurrió un error al intentar realizar el arqueo.");
      }
    },
    cerrarModalArqueo() {
      this.mostrarModalArqueo = false;
    },
    // para completar la reserva
    async completarReserva(reservaId) {
      try {
        const response = await axios.post(
          `/auth/reservas/${reservaId}/completar`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.getToken()}`, // Función para obtener el token
            },
          }
        );
        // Manejar la respuesta exitosa con el modal de notificación
        this.messageType = "success";
        this.message = response.data.message;
        this.showNotificationModal = true;
        this.showDetallesReservaModal = false;
        // actualizar los eventos
        this.fetchReservas();
        this.obtenerHuespedesEnCurso();

        // Aquí puedes actualizar el estado local o redirigir a otra página
      } catch (error) {
        // Manejar el error
        if (error.response) {
          alert(error.response.data.error);
        } else {
          //mensaje de errro por el modal de notifiacion
          this.messageType = "error";
          this.message = "Ocurrió un error al completar la reserva.";
          this.showNotificationModal = true;
        }
      }
    },
    getToken() {
      // Implementa la lógica para obtener el token de autenticación
      return localStorage.getItem("token"); // Ejemplo, según tu implementación
    },
    //funcion para reinicar el formualaio de pago multiples
    reiniciarFormulario() {
      this.payment = {
        bar: {
          amount: 0,
          type: "",
          comment: "",
        },
        nevera: {
          amount: 0,
          type: "",
          comment: "",
        },
        habitacion: {
          amount: 0,
          type: "",
          comment: "",
        },
      };
      // this.pedidosbar = []; // Restablecer lista de pedidos del bar
      // this.neverap = []; // Restablecer lista de consumos de la nevera
      // this.reservas = {
      //   cliente: null,
      //   consumosBar: [],
      //   consumosNevera: [],
      //   total_pago: 0,
      //   saldo_pendiente: 0,
      // };
    },
    // funcion para cada area y realizar el pago de cada una
    async procesarPago() {
      try {
        // Verificar montos y preparar solicitudes de pago
        const solicitudesPago = [];

        // Pago Bar
        if (this.payment.bar.amount) {
          solicitudesPago.push(this.realizarPagoBar());
        }

        // Pago Nevera
        if (this.payment.nevera.amount) {
          solicitudesPago.push(this.realizarPagoNevera());
        }

        // Pago Habitación
        if (this.payment.habitacion.amount) {
          solicitudesPago.push(this.realizarPagoHabitacion());
        }

        // Ejecutar todas las solicitudes de pago en paralelo
        const resultados = await Promise.all(solicitudesPago);
        console.log("Pagos realizados:", resultados);

        // Restar los montos pagados del saldo pendiente
        this.reservas.saldo_pendiente -=
          parseFloat(this.payment.bar.amount || 0) +
          parseFloat(this.payment.nevera.amount || 0) +
          parseFloat(this.payment.habitacion.amount || 0);

        // Actualizar `totalConsolidado` para reflejar el saldo restante
        await this.fetchReservas(this.reservas.id); // Actualizar datos de la reserva

        // Mensaje de confirmación de pago exitoso por el modal de notificación
        this.messageType = "success";
        this.message = "Pagos realizados exitosamente.";
        this.showNotificationModal = true;
        // this.mostrarEgresos(); // Actualizar los egresos
        this.obtenerBalanceTotal(); // Actualizar el balance total

        // Reiniciar el formulario
        this.reiniciarFormulario();
        //recargar los eventos de nuevo
        this.fetchReservas();
      } catch (error) {
        // Manejar el error por el modal
        this.messageType = "error";
        this.message = "Ocurrió un error al realizar los pagos.";
        this.showNotificationModal = true;
        console.error("Error al realizar los pagos:", error);
      }
    },

    // Funciones para cada API
    async realizarPagoBar() {
      return await axios.post("/auth/pedidos/cobrar-multiples", {
        pedido_ids: this.pedidosbar.map((pedido) => pedido.id),
        monto: this.payment.bar.amount,
        tipo_pago: this.payment.bar.type,
        comentario: this.payment.bar.comment,
      });
    },

    async realizarPagoNevera() {
      return await axios.post("/auth/cobrar-nevera/multiples", {
        nevera_ids: this.neverap.map((consumo) => consumo.id),
        monto: this.payment.nevera.amount,
        tipo_pago: this.payment.nevera.type,
        comentario: this.payment.nevera.comment,
      });
    },

    async realizarPagoHabitacion() {
      return await axios.post(
        `/auth/reservaciones/${this.currentReservaId}/cobrar-estadia`,
        {
          monto: this.payment.habitacion.amount,
          tipo_pago: this.payment.habitacion.type,
          observacion: this.payment.habitacion.comment,
        }
      );
    },
    //funcion para obeter los productos pendiente
    async obtenerNeveraPorReserva() {
      try {
        const response = await axios.get(
          `/auth/nevera/${this.currentReservaId}/no-pagados`
        );
        this.neverap = response.data.consumos;
      } catch (error) {
        console.error("Error al obtener el consumo de nevera:", error);
      }
    },
    //funcion para obtener los pedidos por reserva
    async obtenerPedidosPorReserva() {
      try {
        const response = await axios.get(
          `/auth/pedidos/reserva/${this.currentReservaId}`
        );
        this.pedidosbar = response.data; // Almacena los pedidos en el estado
        // Si necesitas ajustar cómo se manejan los consumos, hazlo aquí
        this.pedidosbar.consumosBar = this.pedidosbar.flatMap(
          (pedido) => pedido.detalles
        );
      } catch (error) {
        console.error("Error al obtener los pedidos:", error);
      }
    },

    //funcion para realizar pago en detalles de la reserva
    registrarPago() {
      // Validar el monto a pagar
      if (
        this.montoPago <= 0 ||
        this.montoPago > this.reservas.saldo_pendiente
      ) {
        alert(
          "El monto debe ser mayor que 0 y no debe superar el saldo pendiente."
        );
        return;
      }

      // Crear el objeto de pago
      const pago = {
        reserva_id: this.reservas.id,
        monto: this.montoPago,
        metodo_pago: this.metodoPago,
      };

      // Realizar la solicitud al backend para registrar el pago
      this.$http
        .post("/api/pagos", pago)
        .then(() => {
          // Actualizar el saldo pendiente
          this.reservas.saldo_pendiente -= this.montoPago;

          // Mostrar mensaje de éxito
          alert("Pago registrado exitosamente.");
          this.obtenerBalanceTotal();

          // Reiniciar los valores de montoPago y metodoPago
          this.montoPago = 0;
          this.metodoPago = "efectivo"; // O el valor por defecto que prefieras
          this.obtenerBalanceTotal();
        })
        .catch((error) => {
          console.error("Error al registrar el pago:", error);
          alert("Hubo un error al registrar el pago. Inténtalo de nuevo.");
        });
    },
    //funcion para detalles de reseva
    obtenerDetallesReserva(reservaId) {
      // Aquí harías la petición al backend para obtener los detalles de la reserva, consumos del bar, nevera y deudas
      axios
        .get(`/auth/reservas/${reservaId}/detalles`)
        .then((response) => {
          this.reserva = response.data.reserva;
          this.consumosBar = response.data.consumosBar;
          this.consumosNevera = response.data.consumosNevera;
        })
        .catch((error) => {
          console.error("Error al obtener los detalles de la reserva:", error);
        });
    },

    //funcion para ver detalles de la reserva
    verDetalles(reservaId) {
      // Abrir el modal
      this.showDetallesReservaModal = true;
      this.menuVisible = false; // Cerrar el menú de opciones
      // Hacer la consulta al backend para obtener los detalles de la reserva y los consumos
      this.obtenerDetallesReserva(reservaId);
    },
    //cobrar  pedido
    async cobrarPedido(pedidoId) {
      try {
        const response = await axios.post(`/auth/cobrar/${pedidoId}`, {
          monto: this.nuevoConsumo.total, // Aquí puedes ajustar los valores según el formulario de pago
          tipo_pago: this.nuevoConsumo.metodo_pago, // efectivo, tarjeta, etc.
          comentario: this.nuevoConsumo.comentario || "", // Campo opcional
        });
        console.log("Cobro registrado:", response.data);
        // Aquí puedes cerrar el modal o hacer cualquier otra cosa necesaria después del cobro
        this.showPedidosPendientesModal = false; // Cierra el modal después del cobro
        // limpia el formulario
        this.nuevoConsumo = {};
        this.obtenerPedidosPendientes(); // Actualiza la lista de pedidos pendientes

        // Mostrar mensaje de éxito
        this.message = "Pedido cobrado exitosamente.";
        this.messageType = "success"; // Establece el tipo de mensaje
        this.showNotificationModal = true; // Abre el modal de notificación
        this.obtenerBalanceTotal(); // Actualiza el balance total
        this.fetchEgresos(); // Actualiza los egresos
      } catch (error) {
        (this.message = "Error al cobrar el pedido:"),
          error.response ? error.response.data : error.message;
        this.messageType = "false"; // Establece el tipo de mensaje
        this.showNotificationModal = true; // Abre el modal de notificación
      }
    },
    // Función para abrir el modal de agregar detalles
    abrirModalAgregarDetalles(pedidoId) {
      this.selectedPedidoId = pedidoId; // Guardar el ID del pedido
      // Aquí podrías abrir un nuevo modal si tienes más lógica para agregar detalles
    },
    // Función para obtener los pedidos pendientes
    abrirPedidosPendientesModal() {
      this.showPedidosPendientesModal = true; // Mostrar el modal
      // this.obtenerPedidosPendientes(); // Cargar los pedidos pendientes
    },
    cerrarPedidosPendientesModal() {
      this.showPedidosPendientesModal = false; // Cerrar el modal
    },
    // Función para obtener los pedidos pendientes
    async obtenerPedidosPendientes() {
      try {
        const response = await axios.get("/auth/pendientes"); // Asegúrate de que esta URL sea correcta
        this.pedidosPendientes = response.data.pedidos; // Ajusta según la estructura de la respuesta
        this.pedidosPendientesCount = response.data.count; // Ajusta según la estructura de la respuesta
      } catch (error) {
        console.error("Error al obtener los pedidos pendientes:", error);
      }
    },
    //funcion para traer los productos de la nevera
    async fetchProductos() {
      try {
        const response = await axios.get("/auth/inventario-nevera"); // Adjust API path if needed
        this.productos = response.data; // Store the fetched products
      } catch (error) {
        console.error("Error fetching productos:", error);
      }
    },
    cerrarModal() {
      this.modalConsumoVisible = false;
      this.nuevoConsumo = {}; // Limpiar el formulario
    },
    async guardarConsumo() {
      try {
        // Aquí envías los datos del consumo al backend
        await axios.post("/auth/historial-inventarios", {
          reserva_id: this.reservaId, // Asegúrate de tener este dato disponible
          user_id: this.userId, // También asegúrate de tener el ID del usuario
          turno_id: this.turnoId, // ID del turno
          producto_id: this.nuevoConsumo.producto_id,
          cantidad: this.nuevoConsumo.cantidad,
          total: this.nuevoConsumo.total,
          tipo: "salida", // Asumiendo que siempre es salida
          descripcion: this.nuevoConsumo.descripcion,
          pagado: this.nuevoConsumo.pagado,
          metodo_pago: this.nuevoConsumo.metodo_pago,
        });

        // Mostrar mensaje de éxito
        this.message = "Consumo guardado correctamente.";
        this.messageType = "success"; // Establece el tipo de mensaje
        this.showNotificationModal = true; // Abre el modal de notificación
        // this.fetchReservas(); // Actualiza la lista de reservas
        this.obtenerBalanceTotal(); // Actualiza el balance total

        // Cerrar el modal
        this.modalConsumoVisible = false;
        this.cerrarModal(); // Asegúrate de que esta función limpie los datos
      } catch (error) {
        // Manejo de errores
        console.error(
          "Error al guardar el consumo:",
          error.response ? error.response.data : error.message
        );
        // Aquí puedes mostrar un mensaje de error al usuario si es necesario
        // Mostrar mensaje de error
        // Mostrar mensaje de error
        this.message =
          error.response?.data?.message || "Error al guardar el consumo.";
        this.messageType = "error"; // Establece el tipo de mensaje
        this.showNotificationModal = true; // Abre el modal de notificación
      }
    },
    abrirModalConsumo(reserva) {
      console.log("Reserva seleccionada para consumo:", reserva); // Muestra los detalles de la reserva

      // Montar los datos necesarios en el formulario
      this.nuevoConsumo = {
        producto_id: null, // Inicializa el producto como nulo
        cantidad: 1, // Valor predeterminado para la cantidad
        precio: 0, // Inicializa el precio
        total: 0, // Inicializa el total
        descripcion: "", // Inicializa la descripción
        pagado: false, // Valor predeterminado para pagado
        metododepago: "", // Inicializa el método de pago
      };

      // Asigna los IDs necesarios a partir de la reserva seleccionada
      this.reservaId = reserva.id; // ID de la reserva actual
      this.userId = reserva.usuario.id; // ID del usuario actual
      this.turnoId = reserva.turno; // ID del turno

      // Abre el modal
      this.modalConsumoVisible = true;
    },
    actualizarPrecio() {
      const productoSeleccionado = this.productos.find(
        (producto) => producto.id === this.nuevoConsumo.producto_id
      );
      if (productoSeleccionado) {
        this.nuevoConsumo.precio = productoSeleccionado.precio_venta; // O precio_compra según tu lógica
        this.calcularTotal(); // Calcula el total al seleccionar el producto
      }
    },
    calcularTotal() {
      this.nuevoConsumo.total =
        this.nuevoConsumo.cantidad * this.nuevoConsumo.precio;
    },
    //----------------
    submitObservacion() {
      console.log("Formulario actual:", this.form);
      // Verifica que el objeto 'form' y 'reserva_id' estén definidos
      if (!this.form || !this.form.reserva_id) {
        console.error("La reserva_id no está definida o 'form' es nulo.");
        // alert("Error: La ID de reserva es requerida."); // Mensaje para el usuario
        return; // Detener la ejecución si reserva_id es nulo
      }

      // Aquí puedes continuar con la lógica para enviar la observación
      axios
        .post("/auth/observaciones", this.form)
        .then((response) => {
          console.log("Observación creada:", response.data);
          // Opcional: limpiar el formulario o cerrar el modal
          this.closeModal();
        })
        .catch((error) => {
          console.error("Error al crear la observación:", error);
        });
    },
    //funcion para abrir el modal de observacion
    openModal(reserva) {
      console.log("Reserva seleccionada:", reserva); // Muestra los detalles de la reserva
      this.reserva = reserva;
      this.form = {
        contenido: "",
        tipo: "General", // valor predeterminado
        reserva_id: reserva.id, // ID de la reserva actual
        cliente_id: reserva.cliente_nombre.id, // Nombre del cliente
        turno_id: reserva.turno, // ID del turno
        user_id: reserva.usuario.id, // ID del usuario actual
      };
      this.showModal = true; // Muestra el modal
    },

    closeModal() {
      this.showModal = false;
      this.form = { contenido: "", tipo: "General" }; // Resetear formulario
    },

    resourceRender: function (labelElement, resource) {
      labelElement.addEventListener("click", function () {
        console.log("Recurso clickeado:", resource.title);
      });
    },

    //funcion para llamar los clientes
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

    // Función para manejar el clic en una habitación
    handleResourceClick(info) {
      const habitacionElement = info.el;
      // Agregar clase personalizada
      habitacionElement.classList.add("custom-habitacion");

      // Agregar un listener manualmente al label del recurso
      if (info && info.el && info.resource) {
        info.el.addEventListener("click", () => {
          console.log("Habitación clickeada:", info.resource.title);
          this.abrirModalReserva(info.resource); // Abre el menú
        });
      } else {
        console.error("Elemento o recurso no disponible:", info);
      }
    },
    abrirModalReserva(habitacion) {
      this.habitacionSeleccionada = habitacion; // Guardar la habitación seleccionada
      this.crearreserva.total_pago = habitacion.precio; // Asignar el precio de la habitación
      this.showReservaModal = true; // Activar la visualización del modal
    },

    // Función para realizar la reserva
    realizarReserva() {
      // Obtener el token desde localStorage
      const token = localStorage.getItem("token");

      // Ajustar las horas de check-in y check-out
      const checkInTime = new Date(this.crearreserva.fecha_check_in);
      checkInTime.setHours(15, 0); // Entrada a las 3 pm

      const checkOutTime = new Date(this.crearreserva.fecha_check_out);
      checkOutTime.setHours(12, 0); // Salida a las 12 pm

      // // Ajustar la fecha de salida sumando un día para que el evento abarque el día completo
      // const checkOutForCalendar = new Date(this.crearreserva.fecha_check_out);
      // checkOutForCalendar.setDate(checkOutForCalendar.getDate() + 1); // Sumar un día para el calendario

      const reservaData = {
        habitacion_id: this.habitacionSeleccionada.id,
        fecha_check_in: this.crearreserva.fecha_check_in, // Añadir hora de entrada
        fecha_check_out: this.crearreserva.fecha_check_out, //checkOutTime.toISOString(), // Añadir hora de salida
        // fecha_check_out_calendario: this.crearreserva.fecha_check_out, //checkOutForCalendar.toISOString(), // Fecha ajustada para el calendario
        cliente_id: this.crearreserva.cliente_id,
        numero_personas: this.crearreserva.numero_personas,
        total_pago: this.crearreserva.total_pago,
        estado: this.crearreserva.estado,
        origen_reserva: this.crearreserva.origen_reserva,
      };

      axios
        .post("/auth/reserva", reservaData, {
          headers: {
            Authorization: `Bearer ${token}`, // Aquí incluyes el token JWT
          },
        })
        .then(() => {
          this.showNotification("Reserva realizada exitosamente.", "success");
          this.obtenerHuespedesEnCurso(); // Actualizar la lista de huéspedes
          this.limpiarFormulario(); // Limpiar el formulario
          this.showReservaModal = false;
          this.reserva = {
            fecha_check_in: "",
            fecha_check_out: "",
            cliente_id: null,
            numero_personas: null,
            total_pago: null,
            estado: "",
            origen_reserva: "",
          };
          this.fetchHabitaciones(); // Actualizar lista de habitaciones
          this.fetchReservas(); // actualizar lista de reservas
        })
        .catch((error) => {
          console.error("Error al registrar el egreso:", error);
          // Mensaje de error
          this.messageType = "error";
          this.message =
            error.response?.data?.error ||
            "Hubo un problema al registrar el egreso.";
          this.showNotificationModal = true;
        });
    },
    //limpiar el formulario de crear reserva
    limpiarFormulario() {
      this.crearreserva = {
        cliente_id: null,
        numero_personas: "",
        total_pago: 0,
        fecha_check_in: "",
        fecha_check_out: "",
        estado: "",
        origen_reserva: "",
      };
      this.searchTerm = "";
      this.filteredClientes = [];
    },

    showNotification(message, type) {
      this.message = message;
      this.messageType = type;
      this.showNotificationModal = true;
    },

    watch: {
      menuVisible(newValue) {
        console.log("menuVisible cambiado a:", newValue);
      },
    },
    //mostar menu
    openMenu(reserva) {
      this.reserva = reserva;
      this.menuVisible = true;
    },
    modificarReserva() {
      this.menuVisible = false; // Cierra el menú de opciones
      this.showDialog = true; // Abre el diálogo para modificar la reserva
      // Puedes precargar los datos de la reserva aquí si lo necesitas
    },
    async fetchHabitaciones() {
      try {
        const response = await axios.get("/auth/habitaciones"); // Cambia la URL según sea necesario

        // Ordenar las habitaciones por el número en el frontend
        const habitacionesOrdenadas = response.data.sort(
          (a, b) => a.numero - b.numero
        );

        // Imprime en consola para verificar el orden
        console.log("Habitaciones ordenadas:", habitacionesOrdenadas);
        // Asignamos las habitaciones a 'this.habitaciones'
        this.habitaciones = habitacionesOrdenadas;

        // Asigna los datos ordenados a las opciones de recursos, aplicando íconos según el estado de servicio
        this.calendarOptions.resources = habitacionesOrdenadas.map(
          (habitacion, index) => {
            let iconHtml;

            // Define el ícono según el estado de servicio
            switch (habitacion.estado_servicio) {
              case "Mantenimiento":
                iconHtml = "🛠️"; // Ícono de mantenimiento
                break;
              case "Limpieza":
                iconHtml = "🧹"; // Ícono de limpieza
                break;
              case "Disponible":
              default:
                iconHtml = ""; // Ícono de disponible
                break;
            }

            return {
              id: habitacion.id,
              title: `Hab. ${habitacion.numero} ${iconHtml}`, // Ícono junto al número de habitación
              _order: index, // Campo para forzar el orden
            };
          }
        );

        // // También actualiza el array de habitaciones, mostrando el estado de servicio en el nombre
        // this.habitaciones = habitacionesOrdenadas.map((habitacion) => ({
        //   id: habitacion.id,
        //   nombre: ` Hab. ${habitacion.numero}`,
        // }));

        // Refresca manualmente los recursos de FullCalendar
        if (this.$refs.calendar) {
          // Refresca FullCalendar y evita que ordene los recursos
          this.$refs.calendar.refetchResources();
        }
      } catch (error) {
        console.error("Error al obtener habitaciones:", error);
      }
    },

    async fetchReservas() {
      try {
        const response = await axios.get("/auth/reserva/todas");
        const reservas = response.data.map((reserva) => {
          let fechaCheckOut = new Date(reserva.fecha_check_out);
          fechaCheckOut.setDate(fechaCheckOut.getDate() + 1);

          // Verificar valores
          const clienteNombre = reserva.cliente_nombre || "Sin nombre";
          const numeroPersonas =
            reserva.numero_personas > 0
              ? `${reserva.numero_personas} personas`
              : "Cantidad no especificada";
          const creadoPor = reserva.name || "No especificado";
          const pagoRealizado =
            reserva.pago_realizado === 1 ? "Pago realizado" : "Pago pendiente";

          return {
            id: reserva.id,
            title: `${clienteNombre} - ${numeroPersonas}`, // Solo muestra el cliente y la cantidad de personas
            start: reserva.fecha_check_in,
            end: fechaCheckOut,
            resourceId: reserva.habitacion_id,
            classNames: [
              `event-${reserva.estado.toLowerCase().replace(/\s+/g, "")}`,
            ],

            extendedProps: {
              estado: reserva.estado,
              creadoPor: `Creado por: ${creadoPor}`, // Almacena el nombre para el tooltip
              pagoRealizado: pagoRealizado, // Almacena el pago realizado para el tooltip
              origenReserva: reserva.origen_reserva,
            },
          };
        });

        this.calendarOptions.events = reservas;
      } catch (error) {
        console.error("Error al obtener reservas:", error);
      }
    },

    handleEventClick(info) {
      console.log("Evento clickeado:", info.event); // Muestra el evento clickeado
      this.currentReservaId = info.event.id;
      //this.showEstadoModal = true; // Mostrar el modal para cambiar el estado

      if (this.currentReservaId) {
        // Hacer una solicitud al backend para obtener los detalles de la reserva
        axios
          .get(`/auth/reservas/${this.currentReservaId}`)
          .then((response) => {
            const reserva = response.data;

            // Asigna la respuesta al objeto de reservas para vincularlo en el modal
            this.reservas = {
              id: reserva.id,
              habitacion_id: reserva.habitacion_id,
              cliente: reserva.cliente_nombre, // Accede al objeto completo del cliente
              fecha_check_in: reserva.fecha_check_in,
              fecha_check_out: reserva.fecha_check_out,
              numero_personas: reserva.numero_personas,
              total_pago: reserva.total_pago,
              estado: reserva.estado,
              total_estadia: reserva.total_estadia,
              saldo_pendiente: reserva.saldo_pendiente,
              consumosBar: reserva.consumosBar || [],
              consumosNevera: reserva.consumosNevera || [],
              habitacion: reserva.habitacion,
              usuario: reserva.usuario,
            };

            // Cargar los datos en el modal
            this.selectedStatus = reserva.estado;
            this.checkInDate = reserva.fecha_check_in;
            this.checkOutDate = reserva.fecha_check_out;
            this.numeroPersonas = reserva.numero_personas;
            this.totalPago = reserva.total_pago;
            this.selectedHabitacion = reserva.habitacion_id;

            // Cargar datos adicionales del cliente y turno en el formulario
            this.form.reserva_id = reserva.id; // Asignar el ID de la reserva
            this.form.cliente_id = reserva.cliente_nombre; // Asignar el nombre del cliente
            this.form.turno_id = reserva.turno; // Asignar el turno
            this.form.user_id = this.usuario; // ID del usuario que crea la observación

            this.openMenu(response.data);

            // this.openMenu = true;
            this.openMenu(reserva);

            // Obtener los pedidos pendientes para la reserva seleccionada
            this.obtenerPedidosPorReserva(); // Aquí se llama a la función para obtener pedidos

            this.obtenerNeveraPorReserva(); // Aquí se llama a la función para obtener nevera
            console.log(
              "Contenido de neverap al montar el componente:",
              this.neverap
            );

            //  this.showDialog = true;
          })
          .catch((error) => {
            console.error(
              "Error al obtener los detalles de la reserva:",
              error
            );
          });
      }
    },

    async updateReservaEstado() {
      try {
        const response = await axios.put(
          `/auth/reserva/${this.currentReservaId}/estado`,
          {
            estado: this.selectedStatus,
            fecha_check_in: this.checkInDate,
            fecha_check_out: this.checkOutDate,
            numero_personas: this.numeroPersonas,
            total_pago: this.totalPago,
            habitacion_id: this.selectedHabitacion,
          }
        );
        this.fetchReservas(); // Recarga las reservas para reflejar los cambios
        this.showDialog = false;
        this.selectedStatus = ""; // Resetea el estado
        // Actualiza el estado en el calendario
        const event = this.calendarOptions.events.find(
          (e) => e.id === this.currentReservaId
        );
        if (event) {
          event.title = `${response.data.cliente_nombre} - ${response.data.numero_personas} personas (${this.selectedStatus})`;
          // También puedes actualizar otras propiedades si es necesario
        }
        this.showDialog = false; // Cierra el cuadro de diálogo
        this.selectedStatus = ""; // Resetea la selección
        // Muestra notificación de éxito
        this.showNotification("Reserva actualizada con éxito.", "success");
        this.obtenerHuespedesEnCurso();
      } catch (error) {
        // Manejo de errores
        if (error.response) {
          console.error("Error al actualizar la reserva:", error.response.data);
          const message =
            error.response.data.error ||
            error.response.data.message ||
            "Ocurrió un error inesperado.";
          this.showNotification(message, "error");
        } else {
          console.error("Error al actualizar la reserva:", error);
          this.showNotification("Error al actualizar la reserva.", "error");
        }
      }
    },
  },
};
</script>
<style>
.fc-resource-title span {
  margin-right: 5px; /* Ajusta la distancia entre el ícono y el título */
}
.tooltip {
  transition: opacity 0.3s;
  pointer-events: none; /* Evita que interfiera con el mouse */
}

input[type="text"],
input[type="number"],
input[type="date"],
select {
  width: 100%; /* Asegúrate de que los elementos ocupen todo el ancho disponible */
  padding: 5px; /* Menor espaciado interno para que ocupen menos espacio */
  font-size: 14px; /* Ajusta el tamaño de la fuente */
}
.fc-event:hover {
  background-color: #d3d3d3 !important; /* Asegúrate de usar !important si es necesario */
  transition: background-color 0.3s ease; /* Para la transición */
}

/* Aplica un fondo más oscuro a las filas impares */
.fc-row-dark {
  background-color: #e0e0e0; /* Color más oscuro para filas pares */
}

.fc-row-light {
  background-color: #f0f0f0; /* Color más claro para filas impares */
}

.confirmation-modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Estilos para los diferentes estados de las reservas */
/* Estilos para los diferentes estados de las reservas */
.event-pendiente {
  background-color: blue !important; /* Amarillo para pendiente */
  border-color: #ffc107 !important;
}
.fc-h-event {
  border-color: black !important;
  background-color: #fd4834 !important;
}

.event-confirmada {
  background-color: #28a745 !important; /* Verde para confirmada */
  border-color: #28a745 !important;
}
.event-reservada {
  background-color: #ffc107 !important; /* Púrpura para reservada */
  border-color: black !important;
}

.event-cancelada {
  background-color: mediumorchid !important; /* Rojo para cancelada */
  border-color: mediumorchid !important;
}

.event-completada {
  background-color: #6c757d !important; /* Gris para completada */
  border-color: #6c757d !important;
}
</style>

<style>
/* Estilos generales */
h3 {
  /* margin-bottom: 1.5rem; */
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

/* Estilos del calendario */
.fc-event {
  user-select: auto !important; /* Permite seleccionar el texto y hacer clic */
}

.fc-event-title {
  white-space: normal !important; /* Permite que el texto se ajuste al contenedor */
}

/* Lista de habitaciones */
.rooms-list {
  width: 150px;
  padding: 10px;
  background-color: #f9f9f9;
  border-right: 1px solid #ddd;
}

/* Diálogo genérico */
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
  .dialog {
    width: 85%;
  }
}
.dialog-content {
  /* background-color: #ffffff; */
  /* padding: 2rem; */
  border-radius: 10px;
  max-width: 600px;
  /* width: 87%; */
  /* box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); */
}

/* Formulario de reserva */
.reservation-form {
  display: flex;
  flex-direction: column;
  /* gap: 1.5rem; */
}

/* .form-group {
  display: flex;
  flex-direction: row;
} */

.form-label {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-input {
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Botones de acción */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-direction: column;
  margin: 10px 0;
}

/* Estilos básicos para los botones */
.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

/* Botón primario */
.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}

/* Botón secundario */
.btn-secondary {
  background-color: #e5e7eb;
  color: #111;
}

.btn-secondary:hover {
  background-color: #d1d5db;
  transform: translateY(-2px);
}

/* Botón de advertencia */
.btn-warning {
  background-color: #fbbf24;
  color: #111;
}

.btn-warning:hover {
  background-color: #f59e0b;
  transform: translateY(-2px);
}

/* Botón deshabilitado */
.btn:disabled {
  background-color: #d1d5db;
  color: #a1a1a1;
  cursor: not-allowed;
}

/* Estilo para el menú de opciones de la reserva */
.dialogo {
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: rgba(0, 0, 0, 0.5); */
  position: fixed;
  top: 0;
  left: 0;
  /* width: 100vw; */
  height: 100vh;
  z-index: 1000;
}

.menu {
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.15); /* Sombra más suave */
  background-color: #fff; /* Fondo blanco limpio */
}

.list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menu-item {
  cursor: pointer;
  padding: 10px 15px;
  background-color: #ffffff;
  border-radius: 8px;
  transition: background-color 0.2s;
  font-weight: 500;
  border: 0.5px solid black; /* Grosor de 2px, color negro */
}

.menu-item:hover {
  background-color: #e0e0e0;
}
.boton {
  justify-content: center;
}
.btn-close {
  min-width: 150px;
  margin: 0 auto;
}
.v-card-actions .boton {
  justify-content: center;
  margin-top: 20px;
}

/* Para marcar elementos activos en la lista */
.v-list-item.active {
  background-color: #3b82f6;
  color: #fff;
}

/* Diálogo para las opciones */
.v-dialog {
  z-index: 9999 !important;
}
.fc-timeline-event {
  align-items: center;
  border-radius: 0px;
  display: flex;
  font-size: var(--fc-small-font-size);
  margin-bottom: 1px;
  padding: 10px 0px;
  position: relative;
}
.fc-direction-ltr {
  /* direction: ltr; */
  text-align: center;
}
</style>
<style scoped>
/* Cambiar el color de fondo de los resources (habitaciones) */
element.style {
  height: 806.667px !important;
}

element.style {
  height: 306.667px;
}
.custom-habitacion {
  background-color: #f0f8ff; /* Azul claro */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  color: #333;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reserve-btn {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.reserve-btn:hover {
  background-color: #0056b3; /* Un color más oscuro al hacer hover */
}
</style>
<!-- estilo para el formulario de reserva -->
<style scoped>
.form-group {
  margin-bottom: 5px; /* Espacio entre grupos de formulario */
  justify-content: space-between;
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
  /* width: 100%; Asegura que el campo ocupe todo el ancho disponible */
  /* padding: 10px; Espacio interno del campo */
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
.fc-view-harness fc-view-harness-active {
  background-color: #f0f8ff;
  height: 706.667px;
}
.dialog-content {
  max-width: 90vw; /* Usa casi todo el ancho de la pantalla */
}
.pedidos-flotante {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #f00; /* Cambia el color si deseas */
  color: white;
  border-radius: 50%;
  padding: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Asegurarse de que el modal esté al frente */
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
.modall {
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  width: 75%;
  max-width: 800px;
}
/* Estilos específicos para pantallas más anchas (escritorio) */
@media (min-width: 768px) {
  /* Puedes ajustar este valor según tus necesidades */
  .modall {
    width: 45%; /* Cambia el ancho a 45% en vista escritorio */
  }
}
.close-modall {
  background: none;
  border: none;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
.modal-content {
  max-height: 500px;
  overflow-y: auto; /* Añadir scroll si hay muchos pedidos */
}
@media (max-width: 576px) {
  .modal-content {
    width: 100%; /* Full width en móviles */
    padding: 10px; /* Menor padding */
  }
}
.pedido-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 5px;
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}
.pedido-item:hover {
  background-color: #e9e9e9; /* Un color ligeramente diferente al pasar el mouse */
}
</style>
<!-- //detalles de reserva -->
<style>
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
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 80%;
  /* box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); */
  overflow: auto;
}

.details-sectionn {
  margin-bottom: 10px;
  /* border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px; */
}
.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #eaeaea;
}

h2,
h3,
h4,
h5 {
  margin-top: 20px;
  color: #333;
}
.cell {
  flex: 1;
  padding: 5px;
}

.payment-section {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}

.payment-section input[type="number"],
.payment-section select,
.payment-section input[type="text"] {
  flex: 1;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
}

.btn {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn:hover {
  opacity: 0.9;
}
.close-modal {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
.consumos-table {
  width: 100%;
  border-collapse: collapse;
}

.consumos-table th,
.consumos-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
.details-section ul {
  list-style-type: none; /* Elimina los puntos de la lista */
  padding: 0; /* Elimina el padding */
  /* margin: 0; Elimina el margen */
}

.income-category {
  margin-bottom: 15px;
}

.accordion-header {
  cursor: pointer;
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  margin-bottom: 5px;
}
.accordion-content {
  padding: 10px;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  background-color: #fafafa;
}

.historial-item {
  margin-bottom: 15px; /* Espacio entre los elementos */
}

.historial-box {
  border: 1px solid #ddd; /* Borde alrededor del cuadro */
  border-radius: 5px; /* Bordes redondeados */
  padding: 10px; /* Espaciado interno */
  background-color: #f9f9f9; /* Fondo suave */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Sombra sutil */
}

.detail-row {
  margin: 5px 0; /* Espaciado entre las filas */
}
</style>

<!-- <style>
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
  z-index: 1000; /* Asegúrate de que esté por encima de otros elementos */
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 20px;
  max-width: 500px;
  width: 90%;
  animation: fadeIn 0.3s ease;
}

.modal-title {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.modal-date {
  margin: 10px 0;
  color: #777;
}

.reservation-form {
  margin-top: 15px;
}


.income-type {
  font-weight: bold;
}

.income-amount {
  color: #2c3e50; /* Un color más oscuro para los montos */
}

.total-amount {
  font-weight: bold;
  font-size: 18px;
  color: #e74c3c; /* Color para resaltar el total */
}

.btn {
  background-color: #3498db; /* Color del botón */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #2980b9; /* Color del botón al pasar el mouse */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> -->
