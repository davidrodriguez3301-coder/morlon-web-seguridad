// ============================================================
// 🛡️ Módulo: Asignación de Vigilantes a Clientes
// Archivo: /js/Asignacion/AsignacionClienteVigilante.js
// ============================================================

import { getEndpoint } from "../Conexion/Conexion.js";
const apiUrl = getEndpoint(""); // base: https://localhost:44301/api/

const clienteSelect = document.getElementById("clienteSelect");
const vigilanteSelect = document.getElementById("idVigilante");
const tablaAsignaciones = document.getElementById("tablaAsignaciones");
const formAsignacion = document.getElementById("formAsignacion");
const modal = new bootstrap.Modal(document.getElementById("modalAsignacion"));

let vigilantesCache = [];

// ============================================================
// 🔹 Inicialización
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarClientes();
  await cargarVigilantes();
});

// ============================================================
// 🔹 Cargar clientes activos
// ============================================================
async function cargarClientes() {
  try {
    const res = await fetch(`${apiUrl}/Cliente`);
    const data = await res.json();

    clienteSelect.innerHTML = '<option value="">Seleccione cliente...</option>';
    data.forEach(c => {
      clienteSelect.innerHTML += `<option value="${c.idCliente.trim()}">${c.nombre_cliente}</option>`;
    });
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  }
}

// ============================================================
// 🔹 Cargar vigilantes activos
// ============================================================
async function cargarVigilantes() {
  try {
    const res = await fetch(`${apiUrl}/Vigilantes/activos`);
    const data = await res.json();

    vigilantesCache = data;
    vigilanteSelect.innerHTML = '<option value="">Seleccione vigilante...</option>';
    data.forEach(v => {
      vigilanteSelect.innerHTML += `<option value="${v.idVigilantes}">${v.nombre_apellido}</option>`;
    });
  } catch (error) {
    console.error("Error al cargar vigilantes:", error);
  }
}

// ============================================================
// 🖼️ Mostrar foto y nombre del vigilante seleccionado
// ============================================================
vigilanteSelect.addEventListener("change", () => {
  const id = vigilanteSelect.value;
  const vigilante = vigilantesCache.find(v => v.idVigilantes === id);

  const fotoEl = document.getElementById("fotoVigilante");
  const nombreEl = document.getElementById("nombreVigilantePreview");

  if (vigilante) {
    nombreEl.textContent = vigilante.nombre_apellido;
    if (vigilante.fotografia && vigilante.fotografia.length > 0) {
      const base64 =
        typeof vigilante.fotografia === "string"
          ? vigilante.fotografia
          : btoa(String.fromCharCode(...new Uint8Array(vigilante.fotografia)));
      fotoEl.src = `data:image/jpeg;base64,${base64}`;
    } else {
      fotoEl.src = "../assets/img/user_default.jpg";
    }
  } else {
    nombreEl.textContent = "Sin seleccionar";
    fotoEl.src = "../assets/img/user_default.jpg";
  }
});

// ============================================================
// 🔹 Ver asignaciones por cliente
// ============================================================
document.getElementById("btnVerAsignaciones").addEventListener("click", async () => {
  const idCliente = clienteSelect.value;
  if (!idCliente) {
    Swal.fire("Atención", "Seleccione un cliente primero.", "warning");
    return;
  }
  await listarAsignaciones(idCliente);
});

async function listarAsignaciones(idCliente) {
  try {
    const res = await fetch(`${apiUrl}/AsignacionClienteVigilante/${idCliente}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      tablaAsignaciones.innerHTML = `
        <tr><td colspan="7" class="text-muted">No hay asignaciones para este cliente.</td></tr>`;
      return;
    }

    tablaAsignaciones.innerHTML = "";
    data.forEach(a => {
      // 🎨 Determinar color según el tipo de contrato
      let badgeClass = "bg-secondary text-white"; // por defecto
      if (a.tipoContrato) {
        const tipo = a.tipoContrato.toLowerCase();
        if (tipo.includes("fijo")) badgeClass = "bg-success text-white";
        else if (tipo.includes("relevante")) badgeClass = "bg-info text-dark";
      }

      tablaAsignaciones.innerHTML += `
        <tr>
          <td>${a.idAsignacion}</td>
          <td>${a.nombreVigilante}</td>
          <td><span class="badge ${badgeClass} px-3 py-2">${a.tipoContrato || "-"}</span></td>
          <td>${a.fecha_inicio || "-"}</td>
          <td>${a.fecha_fin || "-"}</td>
          <td>${a.observaciones || "-"}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="editarAsignacion(${a.idAsignacion})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="eliminarAsignacion(${a.idAsignacion})">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
    });
  } catch (error) {
    console.error("Error al listar asignaciones:", error);
  }
}

// ============================================================
// 🔹 Nueva Asignación
// ============================================================
document.getElementById("btnNuevaAsignacion").addEventListener("click", () => {
  if (!clienteSelect.value) {
    Swal.fire("Atención", "Debe seleccionar un cliente antes de asignar.", "warning");
    return;
  }
  limpiarFormulario();
  document.getElementById("modalTitle").innerText = "Nueva Asignación";
  modal.show();
});

function limpiarFormulario() {
  formAsignacion.reset();
  document.getElementById("idAsignacion").value = "";
  document.getElementById("fotoVigilante").src = "../assets/img/user_default.jpg";
  document.getElementById("nombreVigilantePreview").textContent = "Sin seleccionar";
}

// ============================================================
// 🕵️ Validar disponibilidad (contrato fijo)
// ============================================================
async function verificarDisponibilidad(vigilanteId) {
  try {
    const res = await fetch(`${apiUrl}/AsignacionClienteVigilante/${clienteSelect.value}`);
    const data = await res.json();

    const asignacionActiva = data.find(
      a => a.idVigilante === vigilanteId && a.tipoContrato && a.tipoContrato.toLowerCase().includes("fijo")
    );
    return !asignacionActiva;
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    return true;
  }
}

// ============================================================
// 🔹 Guardar Asignación (Crear / Actualizar)
// ============================================================
formAsignacion.addEventListener("submit", async (e) => {
  e.preventDefault();

  const idVigilante = vigilanteSelect.value;
  const vigilante = vigilantesCache.find(v => v.idVigilantes === idVigilante);
  const esFijo = vigilante?.nombreTipoContrato?.toLowerCase().includes("fijo");

  if (esFijo) {
    const disponible = await verificarDisponibilidad(idVigilante);
    if (!disponible) {
      Swal.fire(
        "Atención",
        "El vigilante con contrato Fijo ya tiene una asignación activa y no puede asignarse a otro cliente.",
        "warning"
      );
      return;
    }
  }

  const asignacion = {
    idAsignacion: document.getElementById("idAsignacion").value || 0,
    idCliente: clienteSelect.value.trim(),
    idVigilante: idVigilante,
    idTipoContrato: vigilante?.idTipoContrato || null,
    fecha_inicio: document.getElementById("fecha_inicio").value,
    fecha_fin: document.getElementById("fecha_fin").value || null,
    observaciones: document.getElementById("observaciones").value
  };

  const esNuevo = asignacion.idAsignacion == 0;
  const url = `${apiUrl}/AsignacionClienteVigilante`;
  const method = esNuevo ? "POST" : "PUT";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(asignacion)
    });
    const data = await res.json();

    if (data.success) {
      Swal.fire("Éxito", data.message, "success");
      modal.hide();
      listarAsignaciones(asignacion.idCliente);
    } else {
      Swal.fire("Error", data.message || "No se pudo guardar la asignación.", "error");
    }
  } catch (error) {
    console.error("Error al guardar asignación:", error);
    Swal.fire("Error", "Error al conectar con el servidor.", "error");
  }
});

// ============================================================
// 🔹 Editar Asignación
// ============================================================
window.editarAsignacion = async function (idAsignacion) {
  const idCliente = clienteSelect.value;
  try {
    const res = await fetch(`${apiUrl}/AsignacionClienteVigilante/${idCliente}`);
    const data = await res.json();
    const a = data.find(x => x.idAsignacion === idAsignacion);
    if (!a) return;

    document.getElementById("idAsignacion").value = a.idAsignacion;
    document.getElementById("idVigilante").value = a.idVigilante;
    document.getElementById("fecha_inicio").value = a.fecha_inicio;
    document.getElementById("fecha_fin").value = a.fecha_fin || "";
    document.getElementById("observaciones").value = a.observaciones || "";

    const v = vigilantesCache.find(v => v.idVigilantes === a.idVigilante);
    if (v) {
      const fotoEl = document.getElementById("fotoVigilante");
      const nombreEl = document.getElementById("nombreVigilantePreview");
      nombreEl.textContent = v.nombre_apellido;
      if (v.fotografia && v.fotografia.length > 0) {
        const base64 =
          typeof v.fotografia === "string"
            ? v.fotografia
            : btoa(String.fromCharCode(...new Uint8Array(v.fotografia)));
        fotoEl.src = `data:image/jpeg;base64,${base64}`;
      } else {
        fotoEl.src = "../assets/img/user_default.jpg";
      }
    }

    document.getElementById("modalTitle").innerText = "Editar Asignación";
    modal.show();
  } catch (error) {
    console.error("Error al editar asignación:", error);
  }
};

// ============================================================
// 🔹 Eliminar Asignación
// ============================================================
window.eliminarAsignacion = async function (idAsignacion) {
  const idCliente = clienteSelect.value;
  const confirmar = await Swal.fire({
    title: "¿Eliminar asignación?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!confirmar.isConfirmed) return;

  try {
    const res = await fetch(`${apiUrl}/AsignacionClienteVigilante/${idAsignacion}`, {
      method: "DELETE"
    });
    const data = await res.json();

    if (data.success) {
      Swal.fire("Eliminado", data.message, "success");
      listarAsignaciones(idCliente);
    } else {
      Swal.fire("Error", data.message || "No se pudo eliminar la asignación.", "error");
    }
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
  }
};

