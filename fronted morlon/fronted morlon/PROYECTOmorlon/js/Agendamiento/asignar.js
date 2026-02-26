import { getVigilantesAsignados, asignarVigilante as asignarTurno } from "./api.js";


/**
 * Asigna un vigilante a un día determinado.
 * Filtra los tipos de turno según el servicio contratado del cliente.
 */
export async function asignarVigilantes(idDetalle, idAgendamiento, diaElem) {
  const idCliente = document.getElementById("clienteSelect")?.value;
  if (!idCliente) {
    Swal.fire("Atención", "Debe seleccionar un cliente primero.", "warning");
    return;
  }

  // 🔹 Cargar solo vigilantes asignados al cliente
  const vigilantes = await getVigilantesAsignados(idCliente);

  if (!Array.isArray(vigilantes) || vigilantes.length === 0) {
    Swal.fire(
      "Sin vigilantes asignados",
      "Este cliente aún no tiene vigilantes asignados. Asigne uno desde el módulo de Asignación de Vigilantes.",
      "info"
    );
    return;
  }

  // 🔹 Definir los turnos posibles según el servicio del cliente
  const servicio = (window.servicioClienteActual || "").toLowerCase();
  const todosLosTurnos = ["Diurno", "Nocturno", "Portería", "Rotación"];
  let turnosDisponibles = [];

  if (servicio.includes("todos") || servicio.trim() === "") {
    turnosDisponibles = todosLosTurnos;
  } else {
    turnosDisponibles = todosLosTurnos.filter((t) =>
      servicio.includes(t.toLowerCase())
    );
  }

  if (turnosDisponibles.length === 0) turnosDisponibles = todosLosTurnos;

  const turnoOptions = turnosDisponibles
    .map((t) => `<option value="${t}">${t}</option>`)
    .join("");

  const vigilanteOptions = vigilantes
    .map(
      (v) =>
        `<option value="${v.idVigilante}">${v.nombreVigilante} (${v.tipoContrato})</option>`
    )
    .join("");

  // 🔹 Modal SweetAlert para elegir vigilante y turno
  const { value: datos } = await Swal.fire({
    title: "Asignar Vigilante",
    html: `
      <label>Vigilante:</label>
      <select id="vigSel" class="form-select mb-3">
        ${vigilanteOptions}
      </select>
      <label>Turno:</label>
      <select id="turnSel" class="form-select">
        ${turnoOptions}
      </select>
    `,
    confirmButtonText: "Asignar",
    showCancelButton: true,
    confirmButtonColor: "#198754",
    cancelButtonText: "Cancelar",
    preConfirm: () => ({
      idVigilante: document.getElementById("vigSel").value,
      tipo_turno: document.getElementById("turnSel").value,
    }),
  });

  if (!datos) return;

  // 🔹 Enviar asignación al backend
  const res = await asignarTurno(idDetalle, datos.idVigilante, datos.tipo_turno);

  if (res.success) {
    diaElem.classList.add("assigned");
    diaElem.style.background = "#28a745";
    diaElem.style.color = "white";
    Swal.fire("✅ Asignado", "Vigilante asignado correctamente.", "success");

    document.dispatchEvent(new CustomEvent("refrescar-calendario"));
  } else {
    Swal.fire("⚠️", res.message || "No se pudo asignar el vigilante.", "error");
  }
}
