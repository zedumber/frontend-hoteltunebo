<template>
  <div class="productos-container">
    <div class="panel-container">
      <MenuCompo :isActive="menuActive" />
      <div class="content">
        <button class="menu-toggle" @click="toggleMenu">&#9776;</button>
        <h1>Panel de Administración de Productos</h1>

        <button @click="showModal = true">Crear/Actualizar Producto</button>

        <h2>Lista de Productos</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>stock</th>
              <th>Precio de Compra</th>
              <th>Precio de Venta</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productos" :key="producto.id">
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.descripcion }}</td>
              <td>{{ producto.stock }}</td>
              <td>{{ producto.precio_compra }}</td>
              <td>{{ producto.precio }}</td>
              <td>{{ producto.categoria }}</td>
              <td>
                <button @click="editProducto(producto)">Editar</button>
                <button @click="confirmDeleteProducto(producto.id)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal del formulario -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <button class="close-modal" @click="showModal = false">&times;</button>
        <h3>{{ editing ? "Editar Producto" : "Crear Producto" }}</h3>

        <form @submit.prevent="saveProducto">
          <div class="form-group">
            <label for="nombre">Nombre del producto:</label>
            <input type="text" v-model="producto.nombre" id="nombre" required />
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción:</label>
            <input
              type="text"
              v-model="producto.descripcion"
              id="descripcion"
            />
          </div>

          <div class="form-group">
            <label for="stock">stock:</label>
            <input type="number" v-model="producto.stock" id="stock" required />
          </div>

          <div class="form-group">
            <label for="precioCompra">Precio de compra:</label>
            <input
              type="number"
              v-model="producto.precio_compra"
              id="precioCompra"
              required
            />
          </div>

          <div class="form-group">
            <label for="precioVenta">Precio de venta:</label>
            <input
              type="number"
              v-model="producto.precio"
              id="precioVenta"
              required
            />
          </div>

          <div class="form-group">
            <label for="categoria">Categoría:</label>
            <select v-model="producto.categoria" id="categoria" required>
              <option value="comida">Comida</option>
              <option value="bebida">Bebida</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <button type="submit">Guardar</button>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <h3>Confirmación</h3>
        <p>¿Estás seguro de que deseas eliminar este producto?</p>
        <button @click="deleteProducto(confirmationId)">Confirmar</button>
        <button @click="showConfirmModal = false">Cancelar</button>
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
      productos: [],
      producto: {
        nombre: "",
        descripcion: "",
        stock: "",
        precio_compra: "",
        precio: "",
        categoria: "comida",
      },
      editing: false,
      showModal: false,
      showConfirmModal: false,
      confirmationId: null,
      showNotificationModal: false,
      message: "",
      messageType: "",
    };
  },
  mounted() {
    this.fetchProductos();
  },
  methods: {
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
    saveProducto() {
      const request = this.editing
        ? axios.put(`/auth/productos/${this.producto.id}`, this.producto)
        : axios.post("/auth/productos", this.producto);

      request
        .then(() => {
          this.resetForm();
          this.fetchProductos();
          this.showModal = false;
          this.showNotification("Producto guardado exitosamente.", "success");
        })
        .catch(() => {
          this.showNotification("Error al guardar el producto.", "error");
        });
    },
    editProducto(producto) {
      this.producto = { ...producto };
      this.editing = true;
      this.showModal = true;
    },
    confirmDeleteProducto(id) {
      this.confirmationId = id;
      this.showConfirmModal = true;
    },
    deleteProducto(id) {
      axios
        .delete(`/auth/productos/${id}`)
        .then(() => {
          this.fetchProductos();
          this.showNotification("Producto eliminado exitosamente.", "success");
          this.showConfirmModal = false;
        })
        .catch(() => {
          this.showNotification("Error al eliminar el producto.", "error");
          this.showConfirmModal = false;
        });
    },
    resetForm() {
      this.producto = {
        nombre: "",
        descripcion: "",
        stock: "",
        precio_compra: "",
        precio: "",
        categoria: "comida",
      };
      this.editing = false;
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
  margin-left: 180px; /* Espacio para el menú lateral en pantallas grandes */
  padding: 20px;
  flex: 1;
  background-color: #f5f5f5;
  height: 100%;
  overflow-y: auto; /* Para hacer scroll si el contenido es muy largo */
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

/* Media query para dispositivos pequeños */
@media (max-width: 768px) {
  .menu-toggle {
    display: block; /* Mostrar botón del menú en pantallas pequeñas */
  }

  .content {
    margin-left: 0; /* Quitar espacio del menú lateral en pantallas pequeñas */
  }

  .panel-container {
    flex-direction: column; /* Cambiar la disposición en pantallas pequeñas */
  }

  MenuCompo {
    width: 100%; /* Asegurar que el menú ocupe todo el ancho */
  }
}
</style>

<style scoped>
.panel-container {
  display: flex;
}

.content {
  margin-left: 180px; /* Espacio para el menú lateral en pantallas grandes */
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
