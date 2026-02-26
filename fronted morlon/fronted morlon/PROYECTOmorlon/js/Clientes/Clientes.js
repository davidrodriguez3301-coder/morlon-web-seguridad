// ============================================================
// 👥 CLIENTES — CRUD completo con conexión centralizada
// ============================================================
import { getEndpoint } from "../Conexion/Conexion.js";

const apiCliente = getEndpoint("Cliente");
const apiZonas = getEndpoint("Zonas");

let clientesGlobal = [];
let paginaActual = 1;
const registrosPorPagina = 10;

// ============================================================
// 🔧 Utilidades
// ============================================================
function safeGet(id) {
  return document.getElementById(id);
}

function safeHTML(str) {
  return (str ?? "").toString().replace(/[<>&"']/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&#39;"
  }[c]));
}

// ============================================================
// 📄 Listado y Renderizado
// ============================================================
async function cargarClientes() {
  try {
    const res = await fetch(apiCliente);
    if (!res.ok) throw new Error("Error al obtener clientes");

    clientesGlobal = await res.json();
    localStorage.setItem("clientesGlobal", JSON.stringify(clientesGlobal));
    mostrarPagina(1);
  } catch (error) {
    console.error("Error al cargar clientes:", error);
    const tbody = safeGet("tablaClientes");
    if (tbody) tbody.innerHTML = "<tr><td colspan='10'>No fue posible cargar los clientes.</td></tr>";
  }
}

function mostrarPagina(pagina) {
  paginaActual = pagina;
  const inicio = (pagina - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const clientes = clientesGlobal.slice(inicio, fin);
  renderTabla(clientes);
  renderPaginacion(clientesGlobal.length, pagina, registrosPorPagina, mostrarPagina);
  actualizarContador(clientes.length, clientesGlobal.length);
}

function renderTabla(clientes) {
  const tbody = safeGet("tablaClientes");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (clientes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10">No hay clientes registrados.</td></tr>`;
    actualizarContador(0, clientesGlobal.length);
    return;
  }

  clientes.forEach((cli) => {
    const zona = cli.nombre_zona || "Sin zona";
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${safeHTML(cli.idCliente)}</td>
      <td>${safeHTML(cli.nombre_cliente)}</td>
      <td>${safeHTML(cli.contacto)}</td>
      <td>${safeHTML(cli.direccion)}</td>
      <td>${safeHTML(cli.radio)}</td>
      <td>${safeHTML(cli.codigo_omega)}</td>
      <td>${safeHTML(cli.servicio)}</td>
      <td>${safeHTML(cli.jornada)}</td>
      <td>${safeHTML(zona)}</td>
      <td>
        <!-- 🔹 CORREGIDO: las clases ahora sirven para seguridad -->
        <button class="btn btn-warning btn-sm btn-editar" data-id="${cli.idCliente}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${cli.idCliente}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

function renderPaginacion(total, pagina, porPagina, onChange) {
  const paginacion = safeGet("paginacion");
  if (!paginacion) return;
  paginacion.innerHTML = "";

  const totalPaginas = Math.ceil(total / porPagina);
  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === pagina ? "active" : ""}`;
    const btn = document.createElement("button");
    btn.className = "page-link";
    btn.textContent = i;
    btn.addEventListener("click", () => onChange(i));
    li.appendChild(btn);
    paginacion.appendChild(li);
  }
}

function actualizarContador(actual, total) {
  let contador = document.getElementById("contadorResultados");
  if (!contador) {
    contador = document.createElement("div");
    contador.id = "contadorResultados";
    contador.className = "text-center text-muted mt-2 fw-bold";
    const table = document.querySelector(".table-responsive");
    if (table) table.after(contador);
  }
  if (actual === 0)
    contador.innerHTML = `<span class="text-danger">No se encontraron resultados</span>`;
  else
    contador.innerHTML = `<span class="text-primary">Mostrando ${actual} de ${total} clientes</span>`;
}

// ============================================================
// 🔍 Búsqueda
// ============================================================
function buscarClientes() {
  const texto = safeGet("buscarInput").value.trim().toLowerCase();

  // Si el campo está vacío, recargar página 1
  if (!texto) {
    mostrarPagina(1);
    return;
  }

  const filtrados = clientesGlobal.filter((c) =>
    (c.nombre_cliente && c.nombre_cliente.toLowerCase().includes(texto)) ||
    (c.contacto && c.contacto.toLowerCase().includes(texto)) ||
    (c.direccion && c.direccion.toLowerCase().includes(texto)) ||
    (c.nombre_zona && c.nombre_zona.toLowerCase().includes(texto))
  );

  renderTabla(filtrados);
  actualizarContador(filtrados.length, clientesGlobal.length);
}



// ============================================================
// 🧱 Cargar Zonas
// ============================================================
async function cargarZonas() {
  try {
    const res = await fetch(apiZonas);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const zonas = await res.json();
    const select = safeGet("IdZonas");
    select.innerHTML = "<option value=''>Seleccione zona...</option>";
    zonas.forEach((z) => {
      const opt = document.createElement("option");
      opt.value = z.IdZonas;
      opt.textContent = z.nombre_zona;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error al cargar zonas:", err);
  }
}

// ============================================================
// 💾 Guardar Cliente (nuevo o edición)
// ============================================================
async function guardarCliente(cliente, esEdicion = false) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario?.tipo_usuario === "Visitante") {
    Swal.fire("Acceso denegado", "No puedes guardar información.", "warning");
    return;
  }

  const metodo = esEdicion ? "PUT" : "POST";
  try {
    const res = await fetch(apiCliente, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente),
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: esEdicion ? "Cliente actualizado" : "Cliente registrado",
        timer: 1500,
        showConfirmButton: false,
      });
      cargarClientes();
    } else {
      Swal.fire("Error", "No se pudo guardar el cliente.", "error");
    }
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

// ============================================================
// 🗑️ Eliminar Cliente
// ============================================================
async function eliminarCliente(idCliente) {

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario?.tipo_usuario === "Visitante") {
    Swal.fire("Acceso denegado", "No puedes eliminar clientes.", "warning");
    return;
  }

  const confirmacion = await Swal.fire({
    title: "¿Eliminar cliente?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });
  if (!confirmacion.isConfirmed) return;

  try {
    const res = await fetch(`${apiCliente}/${idCliente}`, { method: "DELETE" });
    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Cliente eliminado",
        timer: 1500,
        showConfirmButton: false,
      });
      cargarClientes();
    } else {
      Swal.fire("Error", "No se pudo eliminar el cliente.", "error");
    }
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

// ============================================================
// 🪟 Modal y eventos
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  cargarClientes();
  cargarZonas();

  // Buscar
  safeGet("buscarInput")?.addEventListener("input", buscarClientes);
  safeGet("btnVerTodo")?.addEventListener("click", () => {
    safeGet("buscarInput").value = "";
    cargarClientes();   // 🔹 Recarga desde API
});


  // Nuevo cliente
  safeGet("btnAgregar")?.addEventListener("click", () => {

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario?.tipo_usuario === "Visitante") {
      Swal.fire("Acceso denegado", "No puedes crear clientes.", "warning");
      return;
    }

    safeGet("modalTitle").textContent = "Nuevo Cliente";
    safeGet("formCliente").reset();
    safeGet("isEdit").value = "false";
    cargarZonas();
    const modalEl = safeGet("clienteModal");
    new bootstrap.Modal(modalEl).show();
  });

  // Guardar
  safeGet("formCliente")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario?.tipo_usuario === "Visitante") {
      Swal.fire("Acceso denegado", "No puedes guardar información.", "warning");
      return;
    }

    const cliente = {
      idCliente: safeGet("idCliente").value.trim(),
      nombre_cliente: safeGet("nombre_cliente").value.trim(),
      contacto: safeGet("contacto").value.trim(),
      direccion: safeGet("direccion").value.trim(),
      radio: safeGet("radio").value.trim(),
      codigo_omega: safeGet("codigo_omega").value.trim(),
      servicio: safeGet("servicio").value.trim(),
      jornada: safeGet("jornada").value.trim(),
      IdZonas: safeGet("IdZonas").value.trim(),
    };
    const esEdicion = safeGet("isEdit").value === "true";

    await guardarCliente(cliente, esEdicion);

    const modalEl = safeGet("clienteModal");
    bootstrap.Modal.getInstance(modalEl)?.hide();
  });

  // Editar / Eliminar
  document.addEventListener("click", (e) => {
    const editarBtn = e.target.closest(".btn-editar");
    const eliminarBtn = e.target.closest(".btn-eliminar");

    // EDITAR
    if (editarBtn) {

      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (usuario?.tipo_usuario === "Visitante") {
        Swal.fire("Acceso denegado", "No puedes editar clientes.", "warning");
        return;
      }

      const id = editarBtn.dataset.id;
      const cliente = clientesGlobal.find((c) => c.idCliente === id);
      if (cliente) {
        safeGet("modalTitle").textContent = "Editar Cliente";
        safeGet("idCliente").value = cliente.idCliente;
        safeGet("nombre_cliente").value = cliente.nombre_cliente;
        safeGet("contacto").value = cliente.contacto;
        safeGet("direccion").value = cliente.direccion;
        safeGet("radio").value = cliente.radio;
        safeGet("codigo_omega").value = cliente.codigo_omega;
        safeGet("servicio").value = cliente.servicio;
        safeGet("jornada").value = cliente.jornada;
        safeGet("IdZonas").value = cliente.IdZonas;
        safeGet("isEdit").value = "true";
        const modalEl = safeGet("clienteModal");
        new bootstrap.Modal(modalEl).show();
      }
    }

    // ELIMINAR
    if (eliminarBtn) eliminarCliente(eliminarBtn.dataset.id);
  });
});
