// ============================================================
// 🏥 EPS — Gestión con conexión centralizada
// ============================================================
import { getEndpoint } from "../Conexion/Conexion.js";
const apiUrl = getEndpoint("EPS");

let epsGlobal = [];
let filtradas = [];
let modoLista = "todo";
let paginaActual = 1;
const registrosPorPagina = 10;

// Elementos UI
const tabla = document.getElementById("tablaEPS");
const paginacionEl = document.getElementById("paginacion");
const inputBuscar = document.getElementById("buscarInput");
const btnAgregar = document.getElementById("btnAgregar");
const btnVerTodo = document.getElementById("btnVerTodo");

// Modal
const modalEl = document.getElementById("epsModal");
const modal = new bootstrap.Modal(modalEl);
const formEPS = document.getElementById("formEPS");
const inputIdHidden = document.getElementById("idEPSHidden");
const inputNombre = document.getElementById("nombreEPS");
const epsModalLabel = document.getElementById("epsModalLabel");

// ============================================================
// 🔧 Utilidades
// ============================================================
function safeHTML(str) {
  return (str ?? "").toString().replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function datosFuente() {
  return modoLista === "filtro" ? filtradas : epsGlobal;
}

function actualizarContador(actual, total) {
  let contador = document.getElementById("contadorResultados");
  if (!contador) {
    contador = document.createElement("div");
    contador.id = "contadorResultados";
    contador.className = "text-center text-muted mt-2 fw-bold";
    const table = document.querySelector(".table");
    if (table) table.after(contador);
  }

  if (actual === 0) {
    contador.innerHTML = `<span class="text-danger">⚠️ No se encontraron EPS registradas</span>`;
  } else if (actual === total) {
    contador.innerHTML = `<span class="text-secondary">Mostrando ${total} EPS</span>`;
  } else {
    contador.innerHTML = `<span class="text-primary">Mostrando ${actual} de ${total} EPS</span>`;
  }
}

function renderPaginacion(totalRegistros, pagina, porPagina, onChange) {
  paginacionEl.innerHTML = "";
  const totalPaginas = Math.ceil(totalRegistros / porPagina);
  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === pagina ? "active" : ""}`;
    const btn = document.createElement("button");
    btn.className = "page-link";
    btn.textContent = i;
    btn.addEventListener("click", () => onChange(i));
    li.appendChild(btn);
    paginacionEl.appendChild(li);
  }
}

// ============================================================
// 📥 Cargar y renderizar
// ============================================================
document.addEventListener("DOMContentLoaded", cargarEPS);

async function cargarEPS() {
  try {
    const res = await fetch(apiUrl); // ✅ CORREGIDO
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    epsGlobal = await res.json();
    modoLista = "todo";
    filtradas = [];
    mostrarPagina(1);
  } catch (err) {
    console.error("Error al cargar EPS:", err);
    Swal.fire("Error", "No se pudieron cargar las EPS.", "error");
  }
}

function mostrarPagina(pagina) {
  paginaActual = pagina;
  const fuente = datosFuente();
  const total = fuente.length;

  const inicio = (pagina - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const pageData = fuente.slice(inicio, fin);

  renderTabla(pageData);
  renderPaginacion(total, pagina, registrosPorPagina, mostrarPagina);
  actualizarContador(pageData.length, total);
}

function renderTabla(lista) {
  if (!tabla) return;
  tabla.innerHTML = "";

  if (!lista || lista.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger fw-bold">
          ⚠️ No se encontraron EPS registradas
        </td>
      </tr>`;
    return;
  }

  const rows = lista.map(e => `
    <tr>
      <td>${safeHTML(e.idEPS)}</td>
      <td>${safeHTML(e.nombre_eps)}</td>
      <td>
        <button class="btn btn-primary btn-sm btn-editar" data-id="${e.idEPS}" data-nombre="${e.nombre_eps}">
          <i class="fas fa-edit"></i>
        </button>
      </td>
      <td>
        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${e.idEPS}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    </tr>
  `);
  tabla.innerHTML = rows.join("");
}

// ============================================================
// 🔍 Búsqueda
// ============================================================
if (inputBuscar) {
  inputBuscar.addEventListener("input", () => {
    const q = inputBuscar.value.trim().toLowerCase();
    if (!q) {
      modoLista = "todo";
      filtradas = [];
      mostrarPagina(1);
      return;
    }
    filtradas = epsGlobal.filter(e =>
      e.nombre_eps?.toLowerCase().includes(q) ||
      String(e.idEPS).toLowerCase().includes(q)
    );
    modoLista = "filtro";
    mostrarPagina(1);
  });
}

// ============================================================
// ➕ Nuevo / Editar
// ============================================================
if (btnAgregar) {
  btnAgregar.addEventListener("click", () => {
    formEPS.reset();
    inputIdHidden.value = "";
    epsModalLabel.textContent = "Nueva EPS";
    modal.show();
  });
}

document.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn-editar");
  const delBtn = e.target.closest(".btn-eliminar");

  if (editBtn) {
    inputIdHidden.value = editBtn.dataset.id;
    inputNombre.value = editBtn.dataset.nombre;
    epsModalLabel.textContent = "Editar EPS";
    modal.show();
  }

  if (delBtn) eliminarEPS(delBtn.dataset.id);
});

// ============================================================
// 💾 Guardar
// ============================================================
if (formEPS) {
  formEPS.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = (inputIdHidden.value || "").trim();
    const nombre = (inputNombre.value || "").trim();

    const letrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    if (!letrasRegex.test(nombre)) {
      Swal.fire("Nombre inválido", "Solo se permiten letras y espacios.", "warning");
      return;
    }

    const esEdicion = !!id;
    const body = esEdicion
      ? { idEPS: Number(id), nombre_eps: nombre }
      : { nombre_eps: nombre };

    const metodo = esEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(apiUrl, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: esEdicion ? "EPS actualizada" : "EPS creada",
          timer: 1600,
          showConfirmButton: false
        });
        modal.hide();
        await cargarEPS();
      } else {
        Swal.fire("Error", data.message || "No se pudo guardar la EPS.", "error");
      }
    } catch (err) {
      console.error("Error al guardar EPS:", err);
      Swal.fire("Error", "No se pudo guardar la EPS.", "error");
    }
  });
}

// ============================================================
// 🗑️ Eliminar
// ============================================================
async function eliminarEPS(id) {
  const confirm = await Swal.fire({
    title: "¿Eliminar EPS?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });
  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      Swal.fire({ icon: "success", title: "Eliminado", timer: 1200, showConfirmButton: false });
      await cargarEPS();
    } else {
      Swal.fire("Error", data.message || "No se pudo eliminar.", "error");
    }
  } catch (err) {
    console.error("Error al eliminar EPS:", err);
    Swal.fire("Error", "No se pudo eliminar la EPS.", "error");
  }
}
