<template>
  <div class="productos-container">
    <div class="panel-container">
      <!-- <MenuCompo :isActive="menuActive" /> -->
      <div class="content">
        <!-- <button class="menu-toggle" @click="toggleMenu">&#9776;</button> -->
        <header class="header">
          <div class="button-group">
            <button
              class="btn-agregar-stock"
              @click="abrirModalAgregarStock(producto)"
            >
              Agregar Stock
            </button>
            <button class="btn-agregar-stock" @click="realizarArqueoCaja">
              Arqueo de Caja
            </button>
            <button class="btn btn-danger" @click="abrirModalConfirmacion">
              Cerrar Turno
            </button>
          </div>
        </header>
        <h1>Venta de Productos</h1>

        <!-- Campo de entrada para filtrar productos por nombre -->
        <input
          type="text"
          v-model="filtroNombre"
          placeholder="Buscar producto por nombre"
          class="filtro-nombre"
        />

        <!-- Lista de productos agrupados por categoría -->
        <div
          v-for="(productos, categoria) in productosFiltradosPorCategoria"
          :key="categoria"
        >
          <h2>{{ categoria }}</h2>
          <div class="productos-grid">
            <div
              v-for="producto in productos"
              :key="producto.id"
              class="producto-card"
            >
              <img
                :src="producto.imagen || 'https://via.placeholder.com/150'"
                alt="Imagen del Producto"
                class="producto-imagen"
              />
              <div class="producto-info">
                <h3>{{ producto.nombre }}</h3>
                <p>Disponible: {{ producto.stock }}</p>
                <p>Precio: {{ producto.precio }} $</p>
              </div>

              <!-- Ajuste de cantidad a vender -->
              <div class="producto-cantidad">
                <button @click="disminuirCantidad(producto.id)">-</button>
                <span>{{ venta.cantidad[producto.id] || 0 }}</span>
                <button @click="aumentarCantidad(producto.id, producto.stock)">
                  +
                </button>
              </div>

              <!-- Botón para agregar al carrito -->
              <button
                :disabled="venta.cantidad[producto.id] <= 0"
                @click="agregarAlCarrito(producto)"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>

        <!-- Botón flotante para pedidos pendientes -->
        <div class="pedidos-flotante" @click="abrirPedidosPendientesModal">
          <span>{{ pedidosPendientesCount }}</span>
          <img
            src="https://img.icons8.com/ios-glyphs/30/ffffff/list.png"
            alt="Pedidos Pendientes"
          />
        </div>

        <!-- Botón flotante del carrito -->
        <div class="carrito-flotante" @click="abrirCarritoModal">
          <span>{{ totalArticulosCarrito }}</span>
          <img
            src="https://img.icons8.com/ios-glyphs/30/ffffff/shopping-cart.png"
            alt="Carrito"
          />
        </div>

        <!-- Modal de Arqueo de Caja -->
        <div v-if="mostrarModalArqueo" class="modal-arqueo-caja">
          <div class="modal-contentt">
            <h2>Arqueo de Caja - Turno Activo</h2>
            <!-- boton para genear el pdf del arqueo de caja -->

            <button @click="descargarPDF" class="btn-guardar">
              Generar PDF
            </button>

            <div class="total-propina">
              <h3>Total de Propina: {{ totalPropina }}</h3>
            </div>

            <button @click="cerrarModal" class="close-modal">X</button>

            <div v-if="pedidos.length">
              <table>
                <thead>
                  <tr>
                    <th>Pedido ID</th>
                    <th>Cliente</th>
                    <th>Mesa</th>
                    <th>Total</th>
                    <th>Propina</th>
                    <th>Estado</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in pedidos" :key="pedido.id">
                    <td>{{ pedido.id }}</td>
                    <td>{{ pedido.nombre_cliente }}</td>
                    <td>{{ pedido.mesa }}</td>
                    <td>{{ pedido.total }}</td>
                    <td>{{ pedido.propina }}</td>
                    <td>{{ pedido.estado }}</td>
                    <td>
                      <ul>
                        <li
                          v-for="detalle in pedido.detalles"
                          :key="detalle.id"
                        >
                          Producto ID: {{ detalle.producto_id }} - Cantidad:
                          {{ detalle.cantidad }} - Subtotal:
                          {{ detalle.subtotal }}
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else>
              <p>No hay pedidos para el turno actual.</p>
            </div>
          </div>
        </div>

        <!-- Modal para agregar stock -->
        <!-- Modal para agregar stock -->
        <div v-if="showAgregarStockModal" class="modal-overlay">
          <div class="modal">
            <button class="close-modal" @click="showAgregarStockModal = false">
              &times;
            </button>
            <h2>Agregar Stock</h2>
            <form @submit.prevent="agregarStock" class="form-agregar-stock">
              <label>Selecciona el Producto:</label>
              <select v-model="productoSeleccionado" required>
                <option disabled value="">Selecciona un producto</option>
                <option
                  v-for="producto in productos"
                  :key="producto.id"
                  :value="producto"
                >
                  {{ producto.nombre }}
                </option>
              </select>

              <label>Cantidad a agregar:</label>
              <input
                type="number"
                v-model.number="cantidadStock"
                min="1"
                required
              />

              <label>Comentario:</label>
              <input type="text" v-model="comentario" placeholder="Opcional" />

              <button type="submit" class="btn-guardar">Guardar Stock</button>
            </form>
          </div>
        </div>

        <!-- Modal para agregar detalles -->
        <!-- Modal para agregar detalles productos -->
        <div v-if="showAgregarDetallesModal" class="modal-overlay">
          <div class="modal">
            <div class="modal-content">
              <button
                class="close-modal"
                @click="showAgregarDetallesModal = false"
              >
                &times;
              </button>
              <h2>Agregar Detalles al Pedido ID: {{ selectedPedidoId }}</h2>
              <form
                @submit.prevent="agregarDetallesAPedido(selectedPedidoId)"
                class="form-detalles"
              >
                <div
                  v-for="(detalle, index) in nuevosDetalles"
                  :key="index"
                  class="detalle-item"
                >
                  <label>Producto:</label>
                  <select
                    v-model="detalle.producto_id"
                    @change="actualizarPrecio(detalle, index)"
                    required
                  >
                    <option
                      v-for="producto in productos"
                      :key="producto.id"
                      :value="producto.id"
                    >
                      {{ producto.nombre }}
                    </option>
                  </select>

                  <label>Cantidad:</label>
                  <input
                    type="number"
                    v-model.number="detalle.cantidad"
                    required
                    min="1"
                    class="input-cantidad"
                  />

                  <label>Precio Unitario:</label>
                  <span class="precio-unitario"
                    >- {{ detalle.precio_unitario }}$</span
                  >

                  <label>Subtotal:</label>
                  <span class="subtotal">
                    -
                    {{
                      (detalle.cantidad * detalle.precio_unitario).toFixed(2)
                    }}$
                  </span>
                  <button
                    type="button"
                    @click="eliminarDetalle(index)"
                    class="btn-eliminar"
                  >
                    Eliminar
                  </button>
                </div>

                <!-- Mostrar Total del Pedido -->
                <div class="total">
                  <label>Total:</label>
                  <span>{{ totalPedido }}$</span>
                </div>

                <!-- Mostrar Total con Propina -->
                <div class="total-con-propina">
                  <label>Total con Propina:</label>
                  <span>{{ totalConPropina }}$</span>
                </div>

                <button
                  type="button"
                  @click="agregarDetalle"
                  class="btn-agregar"
                >
                  Agregar Otro Detalle
                </button>

                <label>Propina:</label>
                <input
                  type="number"
                  v-model.number="propina"
                  min="0"
                  class="input-propina"
                />

                <button type="submit" class="btn-guardar">
                  Guardar Detalles
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Modal de pedidos pendientes -->
        <div v-if="showPedidosPendientesModal" class="modal-overlay">
          <div class="modal">
            <button
              class="close-modal"
              @click="showPedidosPendientesModal = false"
            >
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
                  <p>Cliente: {{ pedido.nombre_cliente || "Sin nombre" }}</p>
                  <p>Total: {{ pedido.total }} $</p>
                  <p>Propina: {{ pedido.propina }} $</p>
                  <p>Estado: {{ pedido.estado }}</p>
                  <h4>Detalles:</h4>
                  <ul>
                    <li v-for="detalle in pedido.detalles" :key="detalle.id">
                      {{ detalle.producto?.nombre || "Producto no disponible" }}
                      - {{ detalle.cantidad }} x {{ detalle.precio_unitario }} =
                      {{ detalle.subtotal }} $
                    </li>
                  </ul>
                  <!-- Botón para agregar detalles al pedido -->
                  <button @click="abrirModalAgregarDetalles(pedido.id)">
                    Agregar Detalles
                  </button>
                </div>
              </div>
              <div v-else>
                <p>No hay pedidos pendientes.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal del carrito de compras -->
        <!-- Modal del carrito de compras -->
        <div v-if="showCarritoModal" class="modal-overlay">
          <div class="modal">
            <button class="close-modal" @click="showCarritoModal = false">
              &times;
            </button>
            <h2>Carrito de Compras</h2>
            <div v-if="carrito.length > 0">
              <div
                v-for="item in carrito"
                :key="item.producto.id"
                class="carrito-item"
              >
                <p>
                  {{ item.producto.nombre }} ({{ item.cantidad }})
                  <button
                    @click="eliminarDelCarrito(index)"
                    class="delete-button"
                  >
                    Eliminar
                  </button>
                </p>
                <p>
                  SubTotal:
                  {{ item.producto.precio * item.cantidad }} $
                </p>
              </div>

              <!-- nombre del cliente  -->
              <div class="form-group">
                <label for="nombreCliente">Nombre del Cliente:</label>
                <input
                  v-model="venta.nombre_cliente"
                  id="nombreCliente"
                  type="text"
                  required
                />
              </div>

              <!-- observacion del cliente -->
              <div class="form-group">
                <label for="observacionCliente">Observación del Cliente:</label>
                <input
                  v-model="venta.observacion_cliente"
                  id="observacionCliente"
                  type="text"
                  required
                />
              </div>

              <!-- Campo para la propina -->
              <div class="form-group">
                <label for="propina">Propina (opcional):</label>
                <input
                  v-model.number="venta.propina"
                  id="propina"
                  type="number"
                  min="0"
                  placeholder="Ingrese la propina (0 si no desea dar propina)"
                />
              </div>

              <!-- Selección entre cuenta abierta o pago inmediato -->
              <div class="form-group">
                <label for="tipoPago">Tipo de Pago:</label>
                <select v-model="venta.tipo_pago" id="tipoPago" required>
                  <option value="cuenta_abierta">
                    Agregar a cuenta de habitación
                  </option>
                  <option value="pago_inmediato">Pagar ahora</option>
                </select>
              </div>
              <div class="form-group">
                <label>Total Final:</label>
                <p>{{ calcularTotalFinal() }} $</p>
              </div>

              <!-- Si se selecciona cuenta abierta, mostrar campo para el número de habitación -->

              <div
                v-if="venta.tipo_pago === 'cuenta_abierta'"
                class="form-group"
              >
                <label for="numHabitacion">Número de Habitación:</label>
                <select v-model="venta.reserva_id" id="numHabitacion" required>
                  <option
                    v-for="habitacion in habitaciones"
                    :key="habitacion.id"
                    :value="habitacion.reservaciones[0]?.id"
                  >
                    {{ habitacion.reservaciones[0].fecha_check_out }} -
                    <span
                      v-if="
                        habitacion.reservaciones &&
                        habitacion.reservaciones.length > 0
                      "
                    >
                      Habitación: {{ habitacion.numero }}
                    </span>
                    <span v-else>Sin reservas en curso</span>
                  </option>
                </select>
              </div>

              <!-- Mostrar el método de pago solo si es un pago inmediato -->
              <div
                v-if="venta.tipo_pago === 'pago_inmediato'"
                class="form-group"
              >
                <label for="metodoPago">Método de Pago:</label>
                <select v-model="venta.metodo_pago" id="metodoPago" required>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <button @click="realizarVenta">Finalizar Venta</button>
            </div>
            <div v-else>
              <p>El carrito está vacío.</p>
            </div>
          </div>
          <!-- Mostrar total final -->
        </div>

        <!-- Modal de Confirmación -->
        <div v-if="showConfirmationModal" class="dialog">
          <div class="modal-content">
            <h2>Confirmación</h2>
            <p>¿Está seguro de que desea cerrar la caja?</p>
            <button @click="cerrarTurno" class="btn btn-primary">
              Sí, cerrar
            </button>
            <button
              @click="showConfirmationModal = false"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
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
    </div>
  </div>
</template>

<script>
import axios from "../plugins/axios";
// import MenuCompo from "@/components/MenuCompo.vue";

export default {
  components: {
    // MenuCompo,
  },
  data() {
    return {
      filtroNombre: "",
      showConfirmationModal: false,
      mostrarModalArqueo: false, // Variable para mostrar el modal de arqueo de caja
      pedidos: [], // Variable para almacenar los pedidos
      propina: 0,
      habitaciones: [],
      // productos: [],
      productos: [], // Para mapear producto_id a nombre
      venta: {
        cantidad: {},
        metodo_pago: "no_pagado",
        tipo_pago: "",
        reserva_id: null,
        nombre_cliente: "",
        observacion_cliente: "",
        propina: 0, // Añadir propina aquí
      },
      nuevosDetalles: [{ producto_id: null, cantidad: 1, precio_unitario: 0 }], // Inicializa un detalle
      carrito: [],
      pedidosPendientes: [],
      pedidosPendientesCount: 0,
      showAgregarStockModal: false, // Control para mostrar el modal de agregar stock
      showCarritoModal: false,
      showNotificationModal: false,
      showPedidosPendientesModal: false,
      showAgregarDetallesModal: false,
      selectedPedidoId: null,
      productoSeleccionado: null, // Para guardar el producto seleccionado
      cantidadStock: 1, // Cantidad a agregar
      comentario: "", // Comentario opcional
      area: "", // Área opcional
      menuActive: false,
      message: "",
      messageType: "",
    };
  },
  computed: {
    productosFiltradosPorCategoria() {
      // Filtrar productos por nombre y agruparlos por categoría
      return this.productos
        .filter((producto) =>
          producto.nombre
            .toLowerCase()
            .includes(this.filtroNombre.toLowerCase())
        )
        .reduce((categorias, producto) => {
          if (!categorias[producto.categoria]) {
            categorias[producto.categoria] = [];
          }
          categorias[producto.categoria].push(producto);
          return categorias;
        }, {});
    },
    totalPedido() {
      let total = this.nuevosDetalles.reduce((sum, detalle) => {
        return sum + detalle.cantidad * detalle.precio_unitario;
      }, 0);

      return total.toFixed(2);
    },
    totalConPropina() {
      return (
        parseFloat(this.totalPedido) + parseFloat(this.propina || 0)
      ).toFixed(2);
    },

    totalArticulosCarrito() {
      return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    },
  },
  mounted() {
    this.fetchProductos();
    this.fetchHabitaciones(); // Llama a la función para obtener habitaciones
    this.obtenerPedidosPendientes(); // Llama a la función para obtener pedidos pendientes
  },
  methods: {
    eliminarDelCarrito(index) {
      this.carrito.splice(index, 1);
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
    async descargarPDF() {
      try {
        const response = await axios.get("/auth/balance/turno", {
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

    // async generarPdfBar() {
    //   try {
    //     // Hacer una solicitud GET a tu endpoint para generar el PDF
    //     const response = await axios.get("/auth/balance/turno", {
    //       params: {
    //         response_type: "pdf",
    //       },
    //       responseType: "blob", // Especifica que esperas un archivo binario
    //     });

    //     // Crear un enlace para descargar el archivo
    //     const url = window.URL.createObjectURL(new Blob([response.data]));
    //     const link = document.createElement("a");
    //     link.href = url;
    //     link.setAttribute(
    //       "download",
    //       `arqueo_turnobar_${new Date().toISOString().split("T")[0]}.pdf`
    //     ); // Puedes formatear la fecha como desees
    //     document.body.appendChild(link);
    //     link.click();

    //     // Limpiar el enlace después de descargar
    //     link.parentNode.removeChild(link);
    //   } catch (error) {
    //     console.error("Error al generar el PDF:", error);
    //     // Aquí puedes manejar el error como prefieras, tal vez mostrando un mensaje al usuario
    //   }
    // },
    async obtenerPedidosTurnoActivo() {
      try {
        const token = localStorage.getItem("token"); // Asegúrate de que el token esté almacenado en localStorage
        if (!token) {
          console.error("Token no encontrado en localStorage.");
          return;
        }

        const response = await axios.get("/auth/balance/turno", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.pedidos = response.data.pedidos;
        this.totalPropina = response.data.totalPropina;
      } catch (error) {
        console.error(
          "Error al obtener pedidos del turno activo:",
          error.response ? error.response.data : error
        );
      }
    },

    realizarArqueoCaja() {
      this.mostrarModalArqueo = true;
      this.obtenerPedidosTurnoActivo(); // Asegúrate de llamar a la función aquí
    },
    cerrarModal() {
      this.mostrarModalArqueo = false;
    },
    // Método para abrir el modal de stock a un producto
    abrirModalAgregarStock() {
      this.productoSeleccionado = null; // Reiniciar la selección de producto
      this.cantidadStock = 1; // Reiniciar la cantidad
      this.comentario = ""; // Reiniciar el comentario
      this.showAgregarStockModal = true; // Mostrar el modal
    },
    agregarStock() {
      // Aquí puedes hacer la llamada a tu API para agregar stock
      axios
        .post(`/auth/productos/${this.productoSeleccionado.id}/agregar-stock`, {
          cantidad: this.cantidadStock,
          comentario: this.comentario,
        })
        .then((response) => {
          this.showNotificationModal = true; // Mostrar modal de notificación
          this.message = response.data.message; // Mensaje de éxito
          this.messageType = "success"; // Tipo de mensaje
          this.cantidadStock = 1; // Reiniciar cantidad
          this.showAgregarStockModal = false; // Cerrar modal
          // Actualizar stock en la lista de productos
          this.productoSeleccionado.stock += this.cantidadStock;
        })
        .catch((error) => {
          this.showNotificationModal = true; // Mostrar modal de notificación
          this.message = error.response.data.error; // Mensaje de error
          this.messageType = "error"; // Tipo de mensaje
        });
    },
    async agregarDetallesAPedido(pedidoId) {
      try {
        // Crear el payload que contiene los detalles y la propina
        const detallesPedido = {
          detalles: this.nuevosDetalles.map((detalle) => ({
            producto_id: detalle.producto_id,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
          })),
          propina: this.propina || 0, // Si la propina no es proporcionada, usa 0
        };

        // Enviar la solicitud POST al endpoint de la API
        const response = await axios.post(
          `/auth/pedidos/${pedidoId}/detalles`,
          detallesPedido
        );

        // Si la solicitud fue exitosa, manejar la respuesta
        console.log("Detalles agregados correctamente:", response.data);

        // Mostrar una notificación o mensaje de éxito
        this.showNotification("Detalles agregados correctamente.", "success");

        // Opcional: Limpiar el formulario o cerrar el modal
        this.limpiarFormulario();
        this.showAgregarDetallesModal = false; // Cierra el modal
      } catch (error) {
        console.error(
          "Error al agregar detalles al pedido:",
          error.response?.data || error.message
        );

        // Mostrar una notificación o mensaje de error
        this.showNotification(
          "Error al agregar detalles. Por favor, inténtalo de nuevo.",
          "error"
        );
      }
    },

    // Método opcional para limpiar el formulario después de agregar detalles
    limpiarFormulario() {
      this.nuevosDetalles = [
        { producto_id: null, cantidad: 1, precio_unitario: 0 },
      ];
      this.propina = 0;
    },

    // Función para agregar detalles a un pedido
    eliminarDetalle(index) {
      // Eliminar el detalle de la lista basándote en el índice
      this.nuevosDetalles.splice(index, 1);
    },
    // Función para actualizar el precio unitario cuando se selecciona un producto
    actualizarPrecio(detalle, index) {
      const producto = this.productos.find((p) => p.id === detalle.producto_id);
      if (producto) {
        this.nuevosDetalles[index].precio_unitario = producto.precio;
      }
    },
    agregarDetalle() {
      this.nuevosDetalles.push({
        producto_id: null,
        cantidad: 1,
        precio_unitario: 0,
      });
    },
    // Función para abrir el modal de agregar detalles
    abrirModalAgregarDetalles(pedidoId) {
      this.selectedPedidoId = pedidoId; // Guarda el ID del pedido seleccionado
      this.showPedidosPendientesModal = false; // Cierra el modal de pedidos pendientes
      this.showAgregarDetallesModal = true; // Muestra el modal para agregar detalles
    },
    // Función para obtener los pedidos pendientes
    abrirPedidosPendientesModal() {
      this.showPedidosPendientesModal = true;
      this.obtenerPedidosPendientes();
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

    // Función para calcular el total final
    calcularTotalFinal() {
      let totalFinal = 0;

      // Sumar el total de los productos en el carrito
      this.carrito.forEach((item) => {
        totalFinal += item.producto.precio * item.cantidad;
      });

      // Añadir la propina al total final
      const propina = this.venta.propina || 0;
      totalFinal += parseFloat(propina); // Sumar la propina al total
      // totalFinal += this.venta.propina;

      return totalFinal.toFixed(2); // Retorna el total final formateado
    },
    // Función para obtener las habitaciones
    async fetchHabitaciones() {
      try {
        const response = await axios.get("/auth/habitaciones-en-curso"); // Cambia la URL según sea necesario
        // Mapea los datos de habitaciones para que se adapten al formato que espera FullCalendar
        this.habitaciones = response.data.map((habitacion) => ({
          id: habitacion.id, // Usa el id de la habitación
          numero: habitacion.numero, // Asegúrate de que 'numero' está aquí
          nombre: `Hab. ${habitacion.numero}`, // Título que muestra el número de habitación
          reservaciones: habitacion.reservaciones, // Incluye las reservaciones de la habitación
        }));
        // // // También mapea los datos para el array de habitaciones
        // // this.habitaciones = response.data.map((habitacion) => ({
        // //   id: habitacion.id,
        // //   nombre: `Hab. ${habitacion.numero}`, // Asigna el número de habitación como nombre
        // }));
      } catch (error) {
        console.error("Error al obtener habitaciones:", error);
      }
    },
    toggleMenu() {
      this.menuActive = !this.menuActive;
    },
    fetchProductos() {
      axios
        .get("/auth/productos")
        .then((response) => {
          this.productos = response.data;
        })
        .catch(() => {
          this.showNotification("Error al cargar los productos.", "error");
        });
    },
    aumentarCantidad(productoId, stockDisponible) {
      if (!this.venta.cantidad[productoId]) {
        this.venta.cantidad[productoId] = 0;
      }
      if (this.venta.cantidad[productoId] < stockDisponible) {
        this.venta.cantidad[productoId]++;
      }
    },
    disminuirCantidad(productoId) {
      if (this.venta.cantidad[productoId] > 0) {
        this.venta.cantidad[productoId]--;
      }
    },
    agregarAlCarrito(producto) {
      const cantidad = this.venta.cantidad[producto.id] || 0;
      if (cantidad > 0) {
        const itemExistente = this.carrito.find(
          (item) => item.producto.id === producto.id
        );
        if (itemExistente) {
          itemExistente.cantidad += cantidad;
        } else {
          this.carrito.push({ producto, cantidad });
        }
        this.venta.cantidad[producto.id] = 0; // Reiniciar la cantidad
      }
    },
    abrirCarritoModal() {
      this.showCarritoModal = true;
    },
    realizarVenta() {
      if (this.carrito.length === 0) {
        this.showNotification("El carrito está vacío.", "error");
        return;
      }

      // Construcción de la ventaData
      const ventaData = {
        tipo_pago: this.venta.tipo_pago,
        metodo_pago: this.venta.metodo_pago,
        precio: this.carrito.reduce(
          (total, item) => total + item.producto.precio * item.cantidad,
          0
        ),
        reserva_id: this.venta.reserva_id || null, // Solo se incluirá si es necesario
        productos: this.carrito.map((item) => ({
          id: item.producto.id, // Cambiar de 'producto_id' a 'id'
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio, // Agregar el precio unitario del producto
        })),
        nombre_cliente: this.venta.nombre_cliente, // Añadir nombre del cliente
        observaciones: this.venta.observacion_cliente, // Añadir observación del cliente
        propina: this.venta.propina, // Añadir propina
      };

      axios
        .post("/auth/pedidos", ventaData)
        .then(() => {
          this.showNotification("Venta realizada exitosamente.", "success");
          this.carrito = []; // Vaciar el carrito
          this.fetchProductos(); // Actualiza el stock después de la venta
          this.obtenerPedidosPendientes(); // Actualiza los pedidos pendientes

          this.showCarritoModal = false; // Cerrar el modal del
          // Opcional: resetear el objeto venta
          this.venta = {
            cantidad: {},
            metodo_pago: "no_pagado",
            tipo_pago: "",
            reserva_id: null,
            nombre_cliente: "",
            observacion_cliente: "",
            propina: 0,
          };
        })
        .catch(() => {
          this.showNotification("Error al realizar la venta.", "error");
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
/* nueovs */
h2 {
  margin-bottom: 20px;
  color: #333;
}

.form-detalles {
  display: flex;
  flex-direction: column;
}

.detalle-item {
  margin-bottom: 15px;
}

label {
  margin-bottom: 5px;
  color: #555;
}

select,
input[type="number"] {
  padding: 3px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input-cantidad,
.input-precio,
.input-propina {
  width: calc(100% - 16px);
}

.btn-agregar,
.btn-guardar {
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.btn-agregar:hover,
.btn-guardar:hover {
  background-color: #0056b3;
}
/* hata aqui los nuevos estilos */
.ventas-carta-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
}

.producto-card {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

.producto-card:hover {
  transform: translateY(-5px);
}

.producto-imagen {
  width: 50%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.producto-info {
  margin: 10px 0;
}

.producto-cantidad {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.producto-cantidad button {
  padding: 5px 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.producto-cantidad span {
  margin: 0 10px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

button:disabled {
  background-color: #95a5a6;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
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
}

.carrito-flotante {
  position: fixed;
  bottom: 20px;
  right: 110px;
  background-color: #3498db;
  color: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.carrito-flotante img {
  width: 24px;
  height: 24px;
}

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
  top: 100px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
</style>

<!-- nuevos estilos -->
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
  /* margin-left: 180px; Espacio para el menú lateral en pantallas grandes */
  /* padding: 20px; */
  flex: 1;
  background-color: #f5f5f5;
  /* height: 100%; */
  overflow-y: auto; /* Para hacer scroll si el contenido es muy largo */
}
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Evitar scroll si no es necesario */
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
.btn.btn-danger {
  background-color: #dc3545; /* Color rojo para cerrar turno */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  margin: 5px;
}

/* Media query para dispositivos pequeños */
@media (max-width: 768px) {
  .menu-toggle {
    display: block; /* Mostrar botón del menú en pantallas pequeñas */
  }

  /* .content {
    margin-left: 0; /* Quitar espacio del menú lateral en pantallas pequeñas 
  } */

  /* .panel-container {
    flex-direction: column; /* Cambiar la disposición en pantallas pequeñas 
  } */

  .MenuCompo {
    width: 100%; /* Asegurar que el menú ocupe todo el ancho */
  }
}
</style>

<style scoped>
.productos-container {
  padding: 20px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  height: 100vh; /* Ocupará todo el alto de la ventana */
  width: 100%; /* Ocupará todo el ancho */
}
/* .panel-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  flex: 1; /* Esto permitirá que el panel ocupe todo el espacio restante 
} */

/* .content {
  margin-left: 180px; /* Espacio para el menú lateral en pantallas grandes 
  padding: 20px;
  flex: 1;
  background-color: #f5f5f5;
  height: 100vh;
  overflow-y: auto;
} */

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
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto; /* Permitir scroll si es necesario */
  max-height: 80vh; /* Altura máxima del modal */
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
}

.modal-content {
  max-height: 70vh; /* Altura máxima para el contenido */
  overflow-y: auto; /* Scroll en el contenido si es necesario */
}

.pedido-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}

.pedido-item:hover {
  background-color: #e9e9e9;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.modal-arqueo-caja {
  position: fixed;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 700px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  padding: 1.5rem;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-contentt {
  max-height: 80vh;
  overflow-y: auto;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: bold;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 15px;
  background: #f44336;
  color: #fff;
  border: none;
  font-size: 1.2rem;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-modal:hover {
  background: #d32f2f;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.8rem;
  text-align: left;
  font-size: 0.9rem;
  color: #555;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

tbody tr:hover {
  background-color: #f1f1f1;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

ul {
  padding: 0;
  list-style-type: none;
}

ul li {
  padding: 0.2rem 0;
  font-size: 0.85rem;
  color: #666;
}

/* Empty state message */
.modal-contentt p {
  text-align: center;
  color: #777;
  font-size: 1rem;
  padding: 1rem 0;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
</style>
