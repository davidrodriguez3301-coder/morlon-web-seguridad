
// ============================================================
// 🗺️ zonas_mod.js — Zonas con Paginación, Búsqueda y Modal corporativo
// ============================================================
// Requiere: Bootstrap 5, SweetAlert2 y apiUrl.js con:
//   export const apiUrl = 'https://localhost:44301/api/zonas';
// Carga sugerida en Zonas.html:
//   <script type="module" src="../js/Zonas/zonas_mod.js"></script>

import { getEndpoint } from "../Conexion/Conexion.js";

const apiUrl = getEndpoint("zonas");

let zonasGlobal = [];
let filtradas = [];
let modoLista = "todo"; // 'todo' | 'filtro'

let paginaActual = 1;
const registrosPorPagina = 10;

// Refs UI
const tabla = document.getElementById("tablaZonas");
const paginacionEl = document.getElementById("paginacion");
const inputBuscar = document.getElementById("buscarInput");
const btnAgregar = document.getElementById("btnAgregar");
const btnVerTodo = document.getElementById("btnVerTodo");

// Modal (corporativo) — campos
const modalEl = document.getElementById("zonaModal");
const modal = new bootstrap.Modal(modalEl);
const formZona = document.getElementById("formZona");
const inputIdHidden = document.getElementById("idZonaHidden"); // oculto
const inputNombre = document.getElementById("nombreZona");
const zonaModalLabel = document.getElementById("zonaModalLabel");

// ============================================================
// 🔧 Utilidades
// ============================================================
function safeHTML(str) {
  return (str ?? "").toString().replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function datosFuente() {
  return modoLista === "filtro" ? filtradas : zonasGlobal;
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
    contador.innerHTML = `<span class="text-danger">⚠️ No se encontraron zonas registradas</span>`;
  } else if (actual === total) {
    contador.innerHTML = `<span class="text-secondary">Mostrando ${total} zona${total !== 1 ? "s" : ""}</span>`;
  } else {
    contador.innerHTML = `<span class="text-primary">Mostrando ${actual} de ${total} zona${total !== 1 ? "s" : ""}</span>`;
  }
}

function renderPaginacion(totalRegistros, pagina, porPagina, onChange) {
  if (!paginacionEl) return;
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
// 📥 Cargar y render
// ============================================================
document.addEventListener("DOMContentLoaded", cargarZonas);

async function cargarZonas() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    zonasGlobal = await res.json();
    modoLista = "todo";
    filtradas = [];
    mostrarPagina(1);
  } catch (err) {
    console.error("Error al cargar zonas:", err);
    Swal.fire("Error", "No se pudieron cargar las zonas.", "error");
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

function renderTabla(zonas) {
  if (!tabla) return;
  tabla.innerHTML = "";

  if (!zonas || zonas.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger fw-bold">
          ⚠️ No se encontraron zonas registradas
        </td>
      </tr>
    `;
    return;
  }

  const rows = [];
  for (const z of zonas) {
    const id = safeHTML(z.IdZonas);
    const nombre = safeHTML(z.nombre_zona);

    rows.push(`
      <tr>
        <td>${id}</td>
        <td>${nombre}</td>
        <td class="text-center">
          <button class="btn btn-primary btn-sm btn-editar" data-id="${id}" data-nombre="${nombre}">
            <i class="fas fa-edit"></i>
          </button>
        </td>
        <td class="text-center">
          <button class="btn btn-danger btn-sm btn-eliminar" data-id="${id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `);
  }
  tabla.innerHTML = rows.join("");
}

// ============================================================
// 🔎 Búsqueda (con paginación de resultados)
// ============================================================
if (inputBuscar) {
  inputBuscar.addEventListener("input", () => {
    const q = inputBuscar.value.trim().toLowerCase();
    if (q === "") {
      modoLista = "todo";
      filtradas = [];
      mostrarPagina(1);
      return;
    }

    filtradas = zonasGlobal.filter(
      (z) =>
        z.nombre_zona?.toLowerCase().includes(q) ||
        z.IdZonas?.toLowerCase().includes(q)
    );
    modoLista = "filtro";
    mostrarPagina(1);
  });
}

// ============================================================
// ➕ Nuevo y ✏️ Editar — Modal corporativo
// ============================================================
if (btnAgregar) {
  btnAgregar.addEventListener("click", () => {
    formZona.reset();
    inputIdHidden.value = ""; // oculto
    zonaModalLabel.textContent = "Nueva Zona";
    modal.show();
  });
}

// Delegación para Editar/Eliminar
document.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn-editar");
  const delBtn = e.target.closest(".btn-eliminar");

  if (editBtn) {
    const id = editBtn.dataset.id;
    const nombre = editBtn.dataset.nombre;
    inputIdHidden.value = id;
    inputNombre.value = nombre;
    zonaModalLabel.textContent = "Editar Zona";
    modal.show();
  }

  if (delBtn) eliminarZona(delBtn.dataset.id);
});

// ============================================================
// 💾 Guardar (crear o actualizar)
// ============================================================
if (formZona) {
  formZona.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = (inputIdHidden.value || "").trim();
    const nombre = (inputNombre.value || "").trim();

    // Validación visual básica
    const letrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    inputNombre.classList.remove("is-invalid");
    if (!letrasRegex.test(nombre)) {
      inputNombre.classList.add("is-invalid");
      Swal.fire("Nombre inválido", "Solo se permiten letras y espacios.", "warning");
      return;
    }

    const esEdicion = !!id;
    const body = esEdicion
      ? { IdZonas: id, nombre_zona: nombre }
      : { nombre_zona: nombre };

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
          title: esEdicion ? "Zona actualizada" : "Zona creada",
          text: esEdicion ? "" : (data.idGenerado ? `ID generado: ${data.idGenerado}` : ""),
          timer: 1600,
          showConfirmButton: false
        });
        modal.hide();
        await cargarZonas();
      } else {
        Swal.fire("Error", data.message || "No se pudo guardar la zona.", "error");
      }
    } catch (err) {
      console.error("Error al guardar zona:", err);
      Swal.fire("Error", "No se pudo guardar la zona.", "error");
    }
  });
}

// ============================================================
// 🗑️ Eliminar
// ============================================================
async function eliminarZona(id) {
  const confirm = await Swal.fire({
    title: "¿Eliminar zona?",
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
      await cargarZonas();
    } else {
      Swal.fire("Error", data.message || "No se pudo eliminar.", "error");
    }
  } catch (err) {
    console.error("Error al eliminar zona:", err);
    Swal.fire("Error", "No se pudo eliminar la zona.", "error");
  }
}
