// ============================================================
// SUPERVISOR – SISTEMA COMPLETO Y CORREGIDO (NO SE QUITÓ NADA)
// ============================================================

import { getEndpoint } from "../Conexion/Conexion.js";

// =====================
// BASE API
// =====================
let apiBase = getEndpoint("").replace(/\/$/, "");
const apiSupervisor = `${apiBase}/Supervisor`;
const apiEPS = `${apiBase}/EPS`;
const apiARL = `${apiBase}/ARL`;
const apiZonas = `${apiBase}/Zonas`;
const apiTiposContrato = `${apiBase}/Vigilantes/tiposContrato`;

let supervisores = [];
let paginaActual = 1;
const registrosPorPagina = 10;

let modal = null;
let modalDetalles = null;
let fotoBase64 = null;

const usuario = JSON.parse(localStorage.getItem("usuario")) || {
  codOperativo: "18401",
  nombreOperativo: "Operativo General"
};

// ============================================================
// INICIO
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {

  modal = new bootstrap.Modal(document.getElementById("supervisorModal"));
  modalDetalles = new bootstrap.Modal(document.getElementById("detalleSupervisorModal"));

  await cargarSupervisores();
  await Promise.all([
    cargarEPS(),
    cargarARL(),
    cargarZonas(),
    cargarTiposContrato()
  ]);

  configurarEventos();
});

// ============================================================
// CARGAR LISTAS
// ============================================================
async function cargarEPS(seleccion = null) {
  try {
    const res = await fetch(apiEPS);
    const lista = await res.json();
    const sel = document.getElementById("idEPS");

    sel.innerHTML = `<option value="">Seleccione EPS...</option>`;
    lista.forEach(e => sel.innerHTML += `<option value="${e.idEPS}">${e.nombre_eps}</option>`);

    if (seleccion != null) sel.value = seleccion;
  } catch {}
}

async function cargarARL(seleccion = null) {
  try {
    const res = await fetch(apiARL);
    const lista = await res.json();
    const sel = document.getElementById("idARL");

    sel.innerHTML = `<option value="">Seleccione ARL...</option>`;
    lista.forEach(a => sel.innerHTML += `<option value="${a.idARL}">${a.nombre_arl}</option>`);

    if (seleccion != null) sel.value = seleccion;
  } catch {}
}

async function cargarZonas(seleccion = null) {
  try {
    const res = await fetch(apiZonas);
    const lista = await res.json();
    const sel = document.getElementById("IdZonas");

    sel.innerHTML = `<option value="">Seleccione zona...</option>`;
    lista.forEach(z => {
      const id = z.IdZonas || z.idZonas;
      const nombre = z.nombre_zona || z.nombreZona;
      sel.innerHTML += `<option value="${id}">${nombre}</option>`;
    });

    if (seleccion != null) sel.value = seleccion.trim();
  } catch {}
}

async function cargarTiposContrato(seleccion = null) {
  try {
    const res = await fetch(apiTiposContrato);
    const lista = await res.json();
    const sel = document.getElementById("idTipoContrato");

    sel.innerHTML = `<option value="">Seleccione tipo...</option>`;
    lista.forEach(t => sel.innerHTML += `<option value="${t.idTipoContrato}">${t.nombreTipo}</option>`);

    if (seleccion != null) sel.value = seleccion;
  } catch {}
}

// ============================================================
// CARGAR SUPERVISORES
// ============================================================
async function cargarSupervisores() {
  try {
    const res = await fetch(apiSupervisor);
    supervisores = await res.json();
    mostrarPagina(1);
  } catch {}
}

function mostrarPagina(pagina) {
  paginaActual = pagina;
  const inicio = (pagina - 1) * registrosPorPagina;
  const lista = supervisores.slice(inicio, inicio + registrosPorPagina);
  renderTabla(lista);
  renderPaginacion();
}

function renderPaginacion() {
  const total = supervisores.length;
  const totalPaginas = Math.ceil(total / registrosPorPagina);
  const cont = document.getElementById("paginacion");

  cont.innerHTML = "";
  for (let i = 1; i <= totalPaginas; i++) {
    cont.innerHTML += `
      <li class="page-item ${i === paginaActual ? "active" : ""}">
        <button class="page-link" onclick="mostrarPagina(${i})">${i}</button>
      </li>`;
  }
}

// ============================================================
// TABLA PRINCIPAL → sin operativo ni cel1
// ============================================================
function renderTabla(lista) {
  const tbody = document.getElementById("tablaSupervisores");
  tbody.innerHTML = "";

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="8">No hay supervisores registrados.</td></tr>`;
    return;
  }

  lista.forEach(s => {
    const foto = (s.fotografia && s.fotografia.length > 50)
      ? `data:image;base64,${s.fotografia}`
      : "../assets/img/user_default.jpg";

    tbody.innerHTML += `
      <tr>
        <td>${s.idSupervisor}</td>
        <td>
          <img src="${foto}" class="rounded-circle me-2 fotoZoom" data-foto="${foto}"
               style="width:40px;height:40px;object-fit:cover;cursor:pointer;">
          ${s.nombres_apellidos}
        </td>
        <td>${s.cedula}</td>
        <td>${s.rh || "-"}</td>
        <td>${s.email || "-"}</td>
        <td>${s.nombreZona || "-"}</td>
        <td>${s.nombreTipoContrato || "-"}</td>
        <td class="d-flex gap-2 justify-content-center">

          <button class="btn btn-info btn-sm btnDetalles" 
                  data-id="${s.idSupervisor}" 
                  title="Ver detalles del supervisor">
            <i class="fas fa-eye"></i>
          </button>

          <button class="btn btn-warning btn-sm btnEditar" 
                  data-id="${s.idSupervisor}" 
                  title="Editar supervisor">
            <i class="fas fa-edit"></i>
          </button>

          <button class="btn btn-danger btn-sm btnEliminar" 
                  data-id="${s.idSupervisor}"
                  title="Eliminar supervisor">
            <i class="fas fa-trash"></i>
          </button>

        </td>
      </tr>
    `;
  });
}

// ============================================================
// EVENTOS
// ============================================================
function configurarEventos() {

  document.getElementById("buscarInput").addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase().trim();
    if (!texto) return mostrarPagina(1);

    const filtrados = supervisores.filter(s =>
      s.nombres_apellidos.toLowerCase().includes(texto) ||
      s.cedula.toLowerCase().includes(texto)
    );

    renderTabla(filtrados);
  });

  document.getElementById("btnVerTodo").addEventListener("click", () => {
    mostrarPagina(1);
    document.getElementById("buscarInput").value = "";
  });

  document.getElementById("btnAgregar").addEventListener("click", async () => {
    limpiarFormulario();

    document.getElementById("modalTitle").textContent = "Nuevo Supervisor";

    await Promise.all([
      cargarEPS(),
      cargarARL(),
      cargarZonas(),
      cargarTiposContrato()
    ]);

    document.getElementById("nombreOperativoCreadorBadge").textContent =
      usuario.nombreOperativo;

    modal.show();
  });

  document.getElementById("fotografia").addEventListener("change", manejarFoto);

  document.getElementById("formSupervisor")
    .addEventListener("submit", guardarSupervisor);

  document.addEventListener("click", manejoGlobalClicks);
}

// ============================================================
// LIMPIAR FORM
// ============================================================
function limpiarFormulario() {
  document.getElementById("formSupervisor").reset();
  fotoBase64 = null;
  document.getElementById("previewFoto").src = "../assets/img/user_default.jpg";
  document.getElementById("idSupervisor").value = "";
}

// ============================================================
// PREVIEW FOTO
// ============================================================
function manejarFoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    Swal.fire("Archivo muy grande", "Máximo 2MB.", "warning");
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = ev => {
    fotoBase64 = ev.target.result.split(",")[1];
    document.getElementById("previewFoto").src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// ============================================================
// CLICK GLOBAL
// ============================================================
async function manejoGlobalClicks(e) {
  const btnDetalles = e.target.closest(".btnDetalles");
  const btnEditar = e.target.closest(".btnEditar");
  const btnEliminar = e.target.closest(".btnEliminar");
  const zoomFoto = e.target.closest(".fotoZoom");

  if (zoomFoto) {
    return Swal.fire({
      imageUrl: zoomFoto.dataset.foto,
      imageWidth: 250,
      imageHeight: 250,
      showConfirmButton: false,
      showCloseButton: true,
      background: "#222"
    });
  }

  if (btnDetalles) return mostrarDetalles(btnDetalles.dataset.id);
  if (btnEditar) return abrirEditar(btnEditar.dataset.id);
  if (btnEliminar) return eliminarSupervisor(btnEliminar.dataset.id);
}

// ============================================================
// DETALLES SUPERVISOR
// ============================================================
function mostrarDetalles(id) {
  const s = supervisores.find(x => x.idSupervisor === id);
  if (!s) return;

  const foto = (s.fotografia && s.fotografia.length > 50)
    ? `data:image;base64,${s.fotografia}`
    : "../assets/img/user_default.jpg";

  document.getElementById("detalleFoto").src = foto;
  document.getElementById("detalleNombre").textContent = s.nombres_apellidos;
  document.getElementById("detalleCedula").textContent = s.cedula;
  document.getElementById("detalleEmail").textContent = s.email || "-";
  document.getElementById("detalleCel1").textContent = s.cel1 || "-";
  document.getElementById("detalleCel2").textContent = s.cel2 || "-";
  document.getElementById("detalleRH").textContent = s.rh || "-";
  document.getElementById("detalleZona").textContent = s.nombreZona || "-";
  document.getElementById("detalleEPS").textContent = s.nombreEPS || "-";
  document.getElementById("detalleARL").textContent = s.nombreARL || "-";
  document.getElementById("detalleContrato").textContent = s.nombreTipoContrato || "-";
  document.getElementById("detalleOperativo").textContent = usuario.nombreOperativo;

  modalDetalles.show();
}

// ============================================================
// EDITAR SUPERVISOR
// ============================================================
async function abrirEditar(id) {
  const s = supervisores.find(x => x.idSupervisor === id);
  if (!s) return;

  limpiarFormulario();
  document.getElementById("modalTitle").textContent = "Editar Supervisor";

  await Promise.all([
    cargarEPS(s.idEPS),
    cargarARL(s.idARL),
    cargarZonas(s.IdZonas),
    cargarTiposContrato(s.idTipoContrato)
  ]);

  document.getElementById("idSupervisor").value = s.idSupervisor;
  document.getElementById("nombres_apellidos").value = s.nombres_apellidos;
  document.getElementById("cedula").value = s.cedula;
  document.getElementById("cel1").value = s.cel1 || "";
  document.getElementById("cel2").value = s.cel2 || "";
  document.getElementById("rh").value = s.rh || "";
  document.getElementById("email").value = s.email || "";
  document.getElementById("IdZonas").value = s.IdZonas;

  document.getElementById("nombreOperativoCreadorBadge").textContent =
    usuario.nombreOperativo;

  const foto = (s.fotografia && s.fotografia.length > 50)
    ? `data:image/jpeg;base64,${s.fotografia}`
    : "../assets/img/user_default.jpg";

  document.getElementById("previewFoto").src = foto;
  fotoBase64 = s.fotografia || null;

  modal.show();
}

// ============================================================
// GUARDAR (POST/PUT)
// ============================================================
async function guardarSupervisor(e) {
  e.preventDefault();

  const idSup = document.getElementById("idSupervisor").value.trim();

  const body = {
    idSupervisor: idSup || null,
    nombres_apellidos: document.getElementById("nombres_apellidos").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    idEPS: parseInt(document.getElementById("idEPS").value),
    idARL: parseInt(document.getElementById("idARL").value),
    idTipoContrato: parseInt(document.getElementById("idTipoContrato").value),
    cel1: document.getElementById("cel1").value.trim(),
    cel2: document.getElementById("cel2").value.trim(),
    rh: document.getElementById("rh").value,
    email: document.getElementById("email").value.trim(),
    IdZonas: document.getElementById("IdZonas").value.trim(),
    codOperativo: usuario.codOperativo,
    fotografia: fotoBase64
  };

  const metodo = idSup ? "PUT" : "POST";

  try {
    const res = await fetch(apiSupervisor, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    Swal.fire({
      icon: data.success ? "success" : "error",
      title: data.message,
      timer: 1500,
      showConfirmButton: false
    });

    if (data.success) {
      modal.hide();
      await cargarSupervisores();
    }

  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

// ============================================================
// ELIMINAR SUPERVISOR
// ============================================================
async function eliminarSupervisor(id) {

  if (id === "SUP000") {
    return Swal.fire("No permitido", "SUP000 no puede eliminarse.", "warning");
  }

  const conf = await Swal.fire({
    title: "¿Eliminar supervisor?",
    text: "No podrás deshacer esta acción.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!conf.isConfirmed) return;

  try {
    console.log("➡️ Enviando DELETE a:", `${apiSupervisor}/${id}?usuario_codigo=admin&usuario_nombre=admin`);

    const res = await fetch(`${apiSupervisor}/${id}?usuario_codigo=admin&usuario_nombre=admin`, {
      method: "DELETE"
    });

    const data = await res.json();

    Swal.fire({
      icon: data.success ? "success" : "error",
      title: data.message,
      timer: 1200,
      showConfirmButton: false
    });

    if (data.success) cargarSupervisores();

  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}
