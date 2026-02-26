// ============================================================
// Operativo.js — versión FINAL, corregida con protecciones
// ============================================================

import { getEndpoint } from "../Conexion/Conexion.js";

// Endpoint: /api/Operativo
const apiUrl = getEndpoint("Operativo");

// Helper y utilitarios
const $ = (sel) => document.querySelector(sel);

function toastOK(title) {
  Swal.fire({ icon: "success", title: title, timer: 1400, showConfirmButton: false });
}
function toastERR(title, text) {
  Swal.fire({ icon: "error", title: title, text: text || "" });
}

function openModal() {
  if (!window._opeModal) window._opeModal = new bootstrap.Modal($("#operativoModal"));
  window._opeModal.show();
}
function closeModal() {
  if (window._opeModal) window._opeModal.hide();
}

let operativosGlobal = [];
let mode = "crear"; 
const REG_PAG = 10;

// ============================================================
// RENDER TABLA
// ============================================================
function renderTabla(items) {
  const tbody = $("#tablaOperativos");
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No hay operativos registrados.</td></tr>';
    return;
  }

  for (let i = 0; i < items.length; i++) {
    const o = items[i];
    const pass = o["contraseña"] || o.contrasena || "";

    let botones = "";

    // ------------------------------------------------------------
    // PROTECCIÓN: NO PERMITIR EDITAR O ELIMINAR AL USUARIO OP0000
    // ------------------------------------------------------------
    if (o.codOperativo !== "OP0000") {
      botones =
        '<button class="btn btn-warning btn-sm btnEditar" data-id="' + o.codOperativo + '">' +
          '<i class="fas fa-pen"></i>' +
        '</button> ' +
        '<button class="btn btn-danger btn-sm btnEliminar" data-id="' + o.codOperativo + '">' +
          '<i class="fas fa-trash"></i>' +
        '</button>';
    } else {
      botones = '<span class="text-muted">Operativo general</span>';
    }

    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + (o.codOperativo || "") + "</td>" +
      "<td>" + (o.nombreOperativo || "") + "</td>" +
      "<td>" + pass + "</td>" +
      "<td>" + (o.tipo_usuario || "") + "</td>" +
      "<td>" + botones + "</td>";

    tbody.appendChild(tr);
  }
}

// ============================================================
// PAGINACIÓN
// ============================================================
function renderPaginacion(total, pagina, tam, onChange) {
  const ul = $("#paginacion");
  ul.innerHTML = "";

  if (total <= tam) return;

  const totalPag = Math.ceil(total / tam);

  function add(lbl, p, disabled, active) {
    const li = document.createElement("li");
    li.className = "page-item" +
      (disabled ? " disabled" : "") +
      (active ? " active" : "");
    li.innerHTML = '<a class="page-link" href="#" data-page="' + p + '">' + lbl + "</a>";
    ul.appendChild(li);
  }

  add("«", pagina - 1, pagina === 1, false);

  for (let p = 1; p <= totalPag; p++) add(p, p, false, p === pagina);

  add("»", pagina + 1, pagina === totalPag, false);

  ul.addEventListener(
    "click",
    function (e) {
      const a = e.target.closest("a[data-page]");
      if (!a) return;
      e.preventDefault();
      onChange(parseInt(a.getAttribute("data-page"), 10));
    },
    { once: true }
  );
}

function mostrarPagina(pagina) {
  const ini = (pagina - 1) * REG_PAG;
  renderTabla(operativosGlobal.slice(ini, ini + REG_PAG));
  renderPaginacion(operativosGlobal.length, pagina, REG_PAG, mostrarPagina);
}

// ============================================================
// CRUD API
// ============================================================
async function cargarOperativos() {
  try {
    const r = await fetch(apiUrl);
    if (!r.ok) throw new Error("Error HTTP " + r.status);

    const data = await r.json();
    operativosGlobal = Array.isArray(data) ? data : [];
    mostrarPagina(1);
  } catch (err) {
    console.error("cargarOperativos:", err);
    $("#tablaOperativos").innerHTML = '<tr><td colspan="5">Error al cargar operativos</td></tr>';
  }
}

async function crearOperativo(data) {
  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data),
  });

  if (!resp.ok) throw new Error(await resp.text());
}

async function actualizarOperativo(id, data) {
  const resp = await fetch(apiUrl + "/" + encodeURIComponent(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data),
  });

  if (!resp.ok) throw new Error(await resp.text());
}

async function eliminarOperativo(id) {
  const resp = await fetch(apiUrl + "/" + encodeURIComponent(id), {
    method: "DELETE",
  });

  if (!resp.ok) throw new Error(await resp.text());
}

// ============================================================
// FORM HELPERS
// ============================================================
function getFormData() {
  const cod = $("#codOperativo")?.value.trim() || "";
  const nom = $("#nombreOperativo")?.value.trim() || "";
  const tipoSel = $("#tipoUsuarioInput");
  const tipo = (tipoSel && tipoSel.value && tipoSel.value !== "Seleccione...") ? tipoSel.value.trim() : null;
  const pass = $("#contrasena")?.value.trim() || "";

  return {
    codOperativo: cod,
    nombreOperativo: nom,
    tipo_usuario: tipo,
    "contraseña": pass,
  };
}

function setFormData(op) {
  $("#codOperativo").value = op?.codOperativo || "";
  $("#nombreOperativo").value = op?.nombreOperativo || "";
  $("#tipoUsuarioInput").value = op?.tipo_usuario || "";
  $("#contrasena").value = op?.["contraseña"] || op?.contrasena || "";
}

// ============================================================
// BUSCAR
// ============================================================
function onBuscar() {
  const q = $("#buscarInput")?.value.trim().toLowerCase();
  if (!q) return mostrarPagina(1);

  const filtrados = operativosGlobal.filter(
    (o) =>
      (o.codOperativo || "").toLowerCase().includes(q) ||
      (o.nombreOperativo || "").toLowerCase().includes(q)
  );

  renderTabla(filtrados);
}

// ============================================================
// FORM SUBMIT
// ============================================================
async function onSubmit(e) {
  e.preventDefault();
  const data = getFormData();

  if (!data.codOperativo || !data.nombreOperativo || !data["contraseña"] || !data.tipo_usuario) {
    toastERR("Campos obligatorios", "Todos los campos deben estar diligenciados.");
    return;
  }

  try {
    if (mode === "crear") {
      await crearOperativo(data);
      toastOK("Operativo creado");
    } else {
      await actualizarOperativo(data.codOperativo, data);
      toastOK("Operativo actualizado");
    }

    closeModal();
    cargarOperativos();
  } catch (err) {
    toastERR("Error al guardar", err.message);
  }
}

// ============================================================
// EDITAR / ELIMINAR
// ============================================================
function onNuevo() {
  mode = "crear";
  setFormData(null);
  $("#codOperativo").readOnly = false;
  $("#modalTitle").textContent = "Nuevo Operativo";
  openModal();
}

function onEditar(id) {
  if (id === "OP0000") {
    Swal.fire({
      icon: "warning",
      title: "Operativo General",
      text: "Este operativo no se puede editar.",
    });
    return;
  }

  const op = operativosGlobal.find((x) => String(x.codOperativo) === String(id));
  if (!op) return toastERR("No encontrado", "No se encontró el operativo.");

  mode = "editar";
  setFormData(op);
  $("#codOperativo").readOnly = true;
  $("#modalTitle").textContent = "Editar Operativo";
  openModal();
}

async function onEliminar(id) {
  if (id === "OP0000") {
    Swal.fire({
      icon: "warning",
      title: "Operativo General",
      text: "No se puede eliminar el operativo OP0000.",
    });
    return;
  }

  const conf = await Swal.fire({
    title: "¿Eliminar operativo?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!conf.isConfirmed) return;

  try {
    await eliminarOperativo(id);
    toastOK("Operativo eliminado");
    cargarOperativos();
  } catch (err) {
    toastERR("Error", err.message);
  }
}

// ============================================================
// INICIO
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  cargarOperativos();

  $("#btnAgregar")?.addEventListener("click", onNuevo);
  $("#formOperativo")?.addEventListener("submit", onSubmit);
  $("#buscarInput")?.addEventListener("input", onBuscar);

  $("#btnVerTodo")?.addEventListener("click", function () {
    $("#buscarInput").value = "";
    mostrarPagina(1);
  });

  $("#tablaOperativos")?.addEventListener("click", function (e) {
    const editBtn = e.target.closest(".btnEditar");
    const delBtn = e.target.closest(".btnEliminar");

    if (editBtn) onEditar(editBtn.dataset.id);
    if (delBtn) onEliminar(delBtn.dataset.id);
  });
});
