// ============================================================
// Módulo Novedades — Ajustado al estándar corporativo
// Compatible con backend (bool) y selects inteligentes
// ============================================================

import { getEndpoint } from "../Conexion/Conexion.js";

// URL del controlador
const NOV_URL = getEndpoint("Novedades");

// Estado global
let novedadesGlobal = [];
const registrosPorPagina = 10;
let paginaActual = 1;

// Helper para selects, SweetAlert, DOM
const $ = (sel) => document.querySelector(sel);

function toastOK(t) {
  Swal.fire({ icon: "success", title: t, timer: 1500, showConfirmButton: false });
}

function toastERR(t, txt = "") {
  Swal.fire({ icon: "error", title: t, text: txt || "" });
}

function bootstrapModal() {
  const el = document.getElementById("novedadModal");
  return bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
}

// ============================================================
// 🌟 FUNCIÓN CLAVE: Selección inteligente para combos
// ============================================================
function seleccionarOpcionNormalizada(selectId, valorBD) {
  const select = document.getElementById(selectId);
  if (!select || valorBD == null) return;

  // 1) Intento directo (caso simple: value en BD == value del option)
  select.value = valorBD;
  if (select.value === valorBD) {
    return; // ya quedó seleccionado
  }

  // 2) Intento normalizado (ignora mayúsculas, tildes y espacios extras)
  const normalizar = (txt) =>
    String(txt || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const normalizadoBD = normalizar(valorBD);
  let encontrado = false;

  for (const opt of select.options) {
    const valOpt = normalizar(opt.value);
    const txtOpt = normalizar(opt.textContent);

    if (valOpt === normalizadoBD || txtOpt === normalizadoBD) {
      opt.selected = true;
      encontrado = true;
      break;
    }
  }

  // 3) Si aún no se encontró, lo dejamos en blanco pero mostramos un aviso en consola
  if (!encontrado) {
    console.warn(
      `No se encontró opción en <select id="${selectId}"> para el valor BD: "${valorBD}".`,
      {
        valorBD,
        opciones: Array.from(select.options).map((o) => ({
          value: o.value,
          text: o.textContent,
        })),
      }
    );
  }
}


// ============================================================
// 📌 Carga inicial de datos
// ============================================================
async function listarNovedades() {
  try {
    const r = await fetch(NOV_URL);
    if (!r.ok) throw new Error("No se pudo cargar el listado.");
    novedadesGlobal = await r.json();
    mostrarPagina(1);
  } catch (e) {
    console.error(e);
    $("#tablaNovedades").innerHTML = `
      <tr><td colspan="5" class="text-danger">Error al cargar novedades.</td></tr>`;
  }
}

// ============================================================
// 📌 Guardar (crear/editar) — Backend retorna bool
// ============================================================
async function guardarNovedad(novedad, esEdicion) {
  const url = esEdicion
    ? `${NOV_URL}/${encodeURIComponent(novedad.idNovedad)}`
    : NOV_URL;

  const r = await fetch(url, {
    method: esEdicion ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novedad),
  });

  if (!r.ok) throw new Error(await r.text());

  let ok = true;
  try {
    ok = await r.json();
  } catch (_) {}

  if (ok !== true) {
    throw new Error("El servidor respondió false.");
  }

  return true;
}

// ============================================================
// 🗑 Eliminar novedad
// ============================================================
async function eliminarNovedad(id) {
  const conf = await Swal.fire({
    title: "¿Eliminar novedad?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (!conf.isConfirmed) return;

  const r = await fetch(`${NOV_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!r.ok) throw new Error(await r.text());

  let ok = true;
  try {
    ok = await r.json();
  } catch (_) {}

  if (ok !== true) throw new Error("El servidor respondió false.");

  toastOK("Novedad eliminada");
  await listarNovedades();
}

// ============================================================
// 📄 Render de tabla
// ============================================================
function renderTabla(items) {
  const tbody = $("#tablaNovedades");
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger fw-bold">
          No hay novedades registradas.
        </td>
      </tr>`;
    return;
  }

  items.forEach((n) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${n.idNovedad ?? ""}</td>
      <td class="text-start">${n.nombre_novedad ?? ""}</td>
      <td>${n.tipo_de_novedad ?? ""}</td>
      <td>${n.clave_novedad ?? ""}</td>
      <td>
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-warning btn-sm btnEditar" data-id="${n.idNovedad}">
            <i class="fas fa-pen-to-square"></i>
          </button>
          <button class="btn btn-danger btn-sm btnEliminar" data-id="${n.idNovedad}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// 📄 Paginación
// ============================================================
function renderPaginacion(total, pagina, tam, onChange) {
  const ul = $("#paginacion");
  ul.innerHTML = "";
  const totalPag = Math.max(1, Math.ceil(total / tam));

  const add = (lbl, p, disabled = false, active = false) => {
    const li = document.createElement("li");
    li.className = `page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#" data-page="${p}">${lbl}</a>`;
    ul.appendChild(li);
  };

  add("«", Math.max(1, pagina - 1), pagina === 1);

  for (let p = 1; p <= totalPag; p++) {
    add(p, p, false, p === pagina);
  }

  add("»", Math.min(totalPag, pagina + 1), pagina === totalPag);

  ul.onclick = (e) => {
    const a = e.target.closest("a[data-page]");
    if (!a) return;
    e.preventDefault();
    onChange(Number(a.dataset.page));
  };
}

function mostrarPagina(pagina) {
  paginaActual = pagina;
  const ini = (pagina - 1) * registrosPorPagina;
  const fin = ini + registrosPorPagina;
  const lista = novedadesGlobal.slice(ini, fin);
  renderTabla(lista);
  renderPaginacion(novedadesGlobal.length, pagina, registrosPorPagina, mostrarPagina);
}

// ============================================================
// 🔍 Búsqueda instantánea
// ============================================================
function buscar() {
  const q = $("#buscarInput").value.trim().toLowerCase();
  if (q === "") return mostrarPagina(1);

  const f = novedadesGlobal.filter((n) =>
    (n.idNovedad ?? "").toLowerCase().includes(q) ||
    (n.nombre_novedad ?? "").toLowerCase().includes(q) ||
    (n.tipo_de_novedad ?? "").toLowerCase().includes(q) ||
    (n.clave_novedad ?? "").toLowerCase().includes(q)
  );

  renderTabla(f);
}

// ============================================================
// 📝 Crear / Editar
// ============================================================
function abrirCrear() {
  $("#modalTitle").textContent = "Nueva Novedad";
  $("#isEdit").value = "false";
  $("#formNovedad").reset();
  $("#formNovedad").classList.remove("was-validated");
  $("#idNovedad").readOnly = false;
  bootstrapModal().show();
}

function abrirEditar(id) {
  const n = novedadesGlobal.find((x) => String(x.idNovedad).trim() === String(id).trim());
  if (!n) return toastERR("Novedad no encontrada");

  $("#modalTitle").textContent = "Editar Novedad";
  $("#isEdit").value = "true";
  $("#formNovedad").classList.remove("was-validated");

  // ID fijo al editar
  $("#idNovedad").value = (n.idNovedad ?? "").trim();
  $("#idNovedad").readOnly = true;

  // 🌟 Selección inteligente en los SELECTS
  seleccionarOpcionNormalizada("nombre_novedad", n.nombre_novedad);
  seleccionarOpcionNormalizada("tipo_de_novedad", n.tipo_de_novedad);
  seleccionarOpcionNormalizada("clave_novedad", n.clave_novedad);

  bootstrapModal().show();
}

// ============================================================
// 🎧 EVENTOS
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  await listarNovedades();

  $("#btnAgregar").addEventListener("click", abrirCrear);
  $("#buscarInput").addEventListener("input", buscar);

  $("#btnVerTodo").addEventListener("click", () => {
    $("#buscarInput").value = "";
    mostrarPagina(1);
  });

  // Delegación de botones
  document.addEventListener("click", (e) => {
    const edit = e.target.closest(".btnEditar");
    const del = e.target.closest(".btnEliminar");

    if (edit) abrirEditar(edit.dataset.id);
    if (del)
      eliminarNovedad(del.dataset.id).catch((err) =>
        toastERR("Error al eliminar", err.message)
      );
  });

  // Guardar novedad
  $("#formNovedad").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const nov = {
      idNovedad: $("#idNovedad").value.trim(),
      nombre_novedad: $("#nombre_novedad").value.trim(),
      tipo_de_novedad: $("#tipo_de_novedad").value.trim(),
      clave_novedad: $("#clave_novedad").value.trim(),
    };

    const esEd = $("#isEdit").value === "true";

    try {
      await guardarNovedad(nov, esEd);
      toastOK(esEd ? "Novedad actualizada" : "Novedad registrada");
      bootstrapModal().hide();
      await listarNovedades();
    } catch (err) {
      toastERR("Error al guardar", err.message);
    }
  });
});
