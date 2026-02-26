import { baseUrl, getClientes, getAgendamientos, crearAgendamiento, getDetalle } from "./api.js";
import { generarCalendario } from "./calendario.js";
import { asignarVigilantes } from "./asignar.js";

const clienteSelect = document.getElementById("clienteSelect");
const btnGenerar = document.getElementById("btnGenerar");
const calendarContainer = document.getElementById("calendarContainer");
const estadoLabel = document.getElementById("estadoAgendamiento");
const mesLabel = document.getElementById("mesLabel");
const anioLabel = document.getElementById("anioLabel");

// 🔹 btnEliminar fue removido (ya no se usa) — CAMBIO NUEVO
// const btnEliminar = document.getElementById("btnEliminar");

let idAgendamientoActual = null;
let mesActual = new Date().getMonth() + 1;
let anio = new Date().getFullYear();

// ============================================================
// 🔹 Habilitar solo el mes actual y el siguiente
// ============================================================
function limitarMesesDisponibles() {
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  const selectMes = document.getElementById("mesSeleccionado");
  const inputAnio = document.getElementById("anioSeleccionado");

  const anioSeleccionado = parseInt(inputAnio.value);
  const diferenciaAnio = anioSeleccionado - anioActual;

  [...selectMes.options].forEach((opt) => {
    const mes = parseInt(opt.value);
    opt.disabled = true;
    const diferenciaMeses = (anioSeleccionado - anioActual) * 12 + (mes - mesActual);
    if (diferenciaMeses >= 0 && diferenciaMeses <= 1) {
      opt.disabled = false;
    }
  });

  if (selectMes.selectedOptions[0]?.disabled) {
    const primerHabilitado = [...selectMes.options].find((o) => !o.disabled);
    if (primerHabilitado) selectMes.value = primerHabilitado.value;
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await cargarClientes();
  limitarMesesDisponibles();
});

document.getElementById("anioSeleccionado").addEventListener("change", limitarMesesDisponibles);

// ============================================================
// 🔹 Mostrar mensajes visuales temporales
// ============================================================
function mostrarMensaje(mensaje, tipo = "info") {
  const host = document.querySelector(".contenedor-principal") || document.body;
  const div = document.createElement("div");
  div.className = "alert";
  div.style.background =
    {
      success: "#28a745",
      error: "#dc3545",
      info: "#0dcaf0",
      warning: "#ffc107",
    }[tipo] || "#0dcaf0";
  div.style.color = "#fff";
  div.style.padding = "10px";
  div.style.borderRadius = "6px";
  div.style.margin = "10px auto";
  div.style.textAlign = "center";
  div.textContent = mensaje;
  host.prepend(div);
  setTimeout(() => div.remove(), 2500);
}

// ============================================================
// 🔹 Cargar clientes
// ============================================================
async function cargarClientes() {
  const clientes = await getClientes();
  clienteSelect.innerHTML = `<option value="">Seleccione un cliente</option>`;
  clientes.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.idCliente;
    opt.textContent = `${c.nombre_cliente} (${c.servicio})`;
    clienteSelect.appendChild(opt);
  });
}

// ============================================================
// 🔹 Cargar agendamiento al cambiar cliente
// ============================================================
clienteSelect.addEventListener("change", async () => {
  const idCliente = clienteSelect.value;
  if (!idCliente) {
    calendarContainer.innerHTML = `<p class="text-center text-muted">Seleccione un cliente.</p>`;
    estadoLabel.textContent = "-";
    mesLabel.textContent = "-";
    anioLabel.textContent = "-";
    idAgendamientoActual = null;
    return;
  }

  const ags = await getAgendamientos(idCliente);
  if (ags.length === 0) {
    calendarContainer.innerHTML = `<p class="text-center text-muted">No existen agendamientos para este cliente.</p>`;
    estadoLabel.textContent = "Sin agendamiento";
    mesLabel.textContent = "-";
    anioLabel.textContent = "-";
    idAgendamientoActual = null;
    return;
  }

  const ultimo = ags[0];
  idAgendamientoActual = ultimo.idAgendamiento;
  mesActual = ultimo.mes;
  anio = ultimo.anio;
  estadoLabel.textContent = ultimo.estado;
  mesLabel.textContent = mesActual;
  anioLabel.textContent = anio;

  const dias = await getDetalle(idAgendamientoActual);
  generarCalendario(dias, calendarContainer, idAgendamientoActual);
});

// ============================================================
// 🔹 Generar nuevo agendamiento
// ============================================================
btnGenerar.addEventListener("click", async () => {
  const idCliente = clienteSelect.value;
  const mesSeleccionado = parseInt(document.getElementById("mesSeleccionado").value);
  const anioSeleccionado = parseInt(document.getElementById("anioSeleccionado").value);

  if (!idCliente) {
    mostrarMensaje("Selecciona un cliente antes de continuar.", "warning");
    return;
  }

  const hoy = new Date();
  const mesActualSistema = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();
  const diferenciaMeses =
    (anioSeleccionado - anioActual) * 12 + (mesSeleccionado - mesActualSistema);

  if (diferenciaMeses > 1) {
    mostrarMensaje("Solo puedes generar agendamientos hasta el mes siguiente al actual.", "warning");
    return;
  }

  if (diferenciaMeses < 0) {
    mostrarMensaje("No puedes generar agendamientos para meses pasados.", "warning");
    return;
  }

  const ags = await getAgendamientos(idCliente);
  const existente = ags.find((a) => a.mes === mesSeleccionado && a.anio === anioSeleccionado);

  const mesNombre = new Date(anioSeleccionado, mesSeleccionado - 1).toLocaleString("es-ES", {
    month: "long",
  });

  if (existente) {
    const confirmarCargar = await Swal.fire({
      title: "Agendamiento existente",
      html: `Ya existe un agendamiento para <b>${mesNombre.toUpperCase()} ${anioSeleccionado}</b>.<br>¿Desea cargarlo en lugar de crear uno nuevo?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sí, cargar existente",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0d6efd",
    });

    if (!confirmarCargar.isConfirmed) return;

    idAgendamientoActual = existente.idAgendamiento;
    const dias = await getDetalle(idAgendamientoActual);
    generarCalendario(dias, calendarContainer, idAgendamientoActual);

    estadoLabel.textContent = existente.estado;
    mesLabel.textContent = existente.mes;
    anioLabel.textContent = existente.anio;

    mostrarMensaje(`📅 Cargando agendamiento existente de ${mesNombre} ${anioSeleccionado}`, "info");
    return;
  }

  const confirmarNuevo = await Swal.fire({
    title: "¿Crear agendamiento?",
    html: `¿Desea crear un nuevo agendamiento para <b>${mesNombre.toUpperCase()} ${anioSeleccionado}</b>?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, crear nuevo",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#28a745",
  });

  if (!confirmarNuevo.isConfirmed) return;

  try {
    const res = await crearAgendamiento(idCliente, mesSeleccionado, anioSeleccionado);

    if (res.idAgendamiento) {
      idAgendamientoActual = res.idAgendamiento;
      mesActual = mesSeleccionado;
      anio = anioSeleccionado;

      const dias = await getDetalle(idAgendamientoActual);
      generarCalendario(dias, calendarContainer, idAgendamientoActual);

      estadoLabel.textContent = "Nuevo agendamiento";
      mesLabel.textContent = mesActual;
      anioLabel.textContent = anio;

      mostrarMensaje("✅ Nuevo agendamiento generado correctamente.", "success");

      // 🔄 CAMBIO NUEVO: refrescar estado automáticamente
      document.dispatchEvent(new CustomEvent("refrescar-calendario"));
    } else {
      mostrarMensaje(res.message || "No se pudo generar el agendamiento.", "warning");
    }
  } catch (e) {
    console.error("Error al generar o cargar agendamiento:", e);
    mostrarMensaje("Error de conexión con el servidor.", "error");
  }
});


// ============================================================
// 🔹 Refrescar calendario y mostrar mensaje si está completo
// ============================================================
document.addEventListener("refrescar-calendario", async () => {
  if (!idAgendamientoActual) return;
  const dias = await getDetalle(idAgendamientoActual);
  generarCalendario(dias, calendarContainer, idAgendamientoActual);

  const asignados = dias.filter((d) => d.estado === "Asignado").length;
  const total = dias.length;
  const nuevoEstado = asignados === total ? "Completado" : "Pendiente";
  estadoLabel.textContent = nuevoEstado;
  estadoLabel.dataset.estado = nuevoEstado;

  // ✅ CAMBIO NUEVO:
  // Si se completaron todos los días, mostrar un mensaje de confirmación
  if (nuevoEstado === "Completado") {
    Swal.fire({
      title: "✅ ¡Todos los días han sido agendados!",
      text: "El agendamiento del mes está completamente asignado.",
      icon: "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#28a745"
    });
  }
});

// ============================================================
// 🔹 Clic sobre los días del calendario → Asignar vigilantes
// ============================================================
document.addEventListener("click", async (e) => {
  const dia = e.target.closest(".day");
  if (!dia || !idAgendamientoActual) return;

  const idDetalle = dia.dataset.idDetalle;
  await asignarVigilantes(idDetalle, idAgendamientoActual, dia);

  // 🔄 CAMBIO NUEVO: refrescar estado después de asignar
  document.dispatchEvent(new CustomEvent("refrescar-calendario"));
});


