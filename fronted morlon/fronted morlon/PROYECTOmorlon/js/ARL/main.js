// ============================================================
// 🛡️ ARL — CRUD con conexión centralizada y soporte de edición
// ============================================================

import { getEndpoint } from "../Conexion/Conexion.js";
const apiUrl = getEndpoint("ARL"); // https://localhost:44301/api/ARL

let arlGlobal = [];
let filtradas = [];
let modoLista = "todo";
let paginaActual = 1;
const registrosPorPagina = 10;

// ======== Referencias a elementos del DOM ========
const tabla = document.getElementById("tablaARL");
const form = document.getElementById("formARL");
const inputId = document.getElementById("idARL");
const inputNombre = document.getElementById("nombreARL");
const inputBuscar = document.getElementById("buscarInput");
const btnAgregar = document.getElementById("btnAgregar");
const modal = new bootstrap.Modal(document.getElementById("arlModal"));
const paginacionEl = document.getElementById("paginacion");

// ============================================================
// 🔧 UTILIDADES
// ============================================================
function safeHTML(str) {
  return (str ?? "").toString().replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function datosFuente() {
  return modoLista === "filtro" ? filtradas : arlGlobal;
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
    contador.innerHTML = `<span class="text-danger">⚠️ No se encontraron ARL registradas</span>`;
  } else if (actual === total) {
    contador.innerHTML = `<span class="text-secondary">Mostrando ${total} ARL</span>`;
  } else {
    contador.innerHTML = `<span class="text-primary">Mostrando ${actual} de ${total} ARL</span>`;
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
// 📥 CARGAR Y RENDERIZAR TABLA
// ============================================================
document.addEventListener("DOMContentLoaded", cargarARL);

async function cargarARL() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    arlGlobal = await res.json();
    modoLista = "todo";
    filtradas = [];
    mostrarPagina(1);
  } catch (err) {
    console.error("Error al cargar ARL:", err);
    Swal.fire("Error", "No se pudieron cargar las ARL.", "error");
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
  tabla.innerHTML = "";

  if (!lista || lista.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger fw-bold">
          ⚠️ No se encontraron ARL registradas
        </td>
      </tr>`;
    return;
  }

  const rows = lista.map(a => `
    <tr>
      <td>${safeHTML(a.idARL)}</td>
      <td>${safeHTML(a.nombre_arl)}</td>
      <td>
        <button class="btn btn-primary btn-sm btn-editar" data-id="${a.idARL}" data-nombre="${a.nombre_arl}">
          <i class="fas fa-edit"></i>
        </button>
      </td>
      <td>
        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${a.idARL}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    </tr>
  `);
  tabla.innerHTML = rows.join("");
}

// ============================================================
// 🔍 BÚSQUEDA EN TIEMPO REAL
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
    filtradas = arlGlobal.filter(a =>
      a.nombre_arl?.toLowerCase().includes(q) ||
      String(a.idARL).toLowerCase().includes(q)
    );
    modoLista = "filtro";
    mostrarPagina(1);
  });
}

// ============================================================
// ➕ NUEVO Y ✏️ EDITAR
// ============================================================
if (btnAgregar) {
  btnAgregar.addEventListener("click", () => {
    form.reset();
    inputId.value = "";
    document.querySelector(".modal-title").textContent = "Nueva ARL";
    modal.show();
  });
}

// Delegación para los botones Editar/Eliminar
document.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn-editar");
  const delBtn = e.target.closest(".btn-eliminar");

  if (editBtn) {
    const id = editBtn.dataset.id;
    const nombre = editBtn.dataset.nombre;
    inputId.value = id;
    inputNombre.value = nombre;
    document.querySelector(".modal-title").textContent = "Editar ARL";
    modal.show();
  }

  if (delBtn) eliminarARL(delBtn.dataset.id);
});

// ============================================================
// 💾 GUARDAR (CREAR / EDITAR)
// ============================================================
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = (inputId.value || "").trim();
    const nombre = (inputNombre.value || "").trim();
    const esEdicion = !!id;

    // Validación
    const letrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    if (!letrasRegex.test(nombre)) {
      Swal.fire("Nombre inválido", "Solo se permiten letras y espacios.", "warning");
      return;
    }

    const body = esEdicion
      ? { idARL: Number(id), nombre_arl: nombre }
      : { nombre_arl: nombre };
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
          title: esEdicion ? "ARL actualizada" : "ARL creada",
          text: data.message || "",
          timer: 1600,
          showConfirmButton: false
        });
        modal.hide();
        await cargarARL();
      } else {
        Swal.fire("Error", data.message || "No se pudo guardar la ARL.", "error");
      }
    } catch (err) {
      console.error("Error al guardar ARL:", err);
      Swal.fire("Error", "No se pudo guardar la ARL.", "error");
    }
  });
}

// ============================================================
// 🗑️ ELIMINAR
// ============================================================
async function eliminarARL(id) {
  const confirm = await Swal.fire({
    title: "¿Eliminar ARL?",
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
      Swal.fire({ icon: "success", title: data.message || "Eliminado", timer: 1200, showConfirmButton: false });
      await cargarARL();
    } else {
      Swal.fire("Error", data.message || "No se pudo eliminar la ARL.", "error");
    }
  } catch (err) {
    console.error("Error al eliminar ARL:", err);
    Swal.fire("Error", "No se pudo eliminar la ARL.", "error");
  }
}
