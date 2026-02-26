// ============================================================
// 🌐 API.js - Funciones para consumir el backend ASP.NET
// ============================================================

// Ajusta esta URL base si tu backend usa otro puerto
import { getEndpoint } from "../Conexion/Conexion.js";
export const baseUrl = getEndpoint("");
// ============================================================
// 🔹 Obtener todos los agendamientos de un cliente
// ============================================================
export async function getAgendamientos(idCliente) {
  try {
    const res = await fetch(`${baseUrl}/Agendamiento?idCliente=${idCliente}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error en getAgendamientos:", err);
    return [];
  }
}

// ============================================================
// 🔹 Crear un nuevo agendamiento
// ============================================================
export async function crearAgendamiento(idCliente, mes, anio) {
  try {
    const res = await fetch(`${baseUrl}/Agendamiento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idCliente, mes, anio }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Normalizamos el formato para que main.js lo entienda
    return {
      success: data.success ?? true, // asume éxito si no existe el campo
      idAgendamiento: data.idAgendamiento ?? data.IdAgendamiento ?? null,
      message: data.message ?? data.mensaje ?? "",
    };
  } catch (err) {
    console.error("Error en crearAgendamiento:", err);
    return { success: false, message: "Error de conexión con el servidor." };
  }
}

// ============================================================
// 🔹 Obtener detalle de un agendamiento
// ============================================================
export async function getDetalle(idAgendamiento) {
  try {
    const res = await fetch(`${baseUrl}/DetalleAgendamiento?idAgendamiento=${idAgendamiento}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // ⚡ Ajuste para aceptar distintas estructuras de respuesta
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn("Respuesta inesperada de DetalleAgendamiento:", data);
      return [];
    }
  } catch (err) {
    console.error("Error en getDetalle:", err);
    Swal.fire("Error", "No se pudieron obtener los días del agendamiento.", "error");
    return [];
  }
}

// ============================================================
// 🔹 Asignar vigilante a un día específico
// ============================================================
export async function asignarVigilante(idDetalle, idVigilante, tipo_turno) {
  try {
    const res = await fetch(`${baseUrl}/TurnoAsignado/asignar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idDetalle, idVigilante, tipo_turno }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error en asignarVigilante:", err);
    return { success: false, message: "Error al asignar vigilante." };
  }
}

// ============================================================
// 🔹 Obtener lista de vigilantes (para el modal de asignación)
// ============================================================
export async function getVigilantes() {
  try {
    const res = await fetch(`${baseUrl}/Vigilantes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error en getVigilantes:", err);
    return [];
  }
}

// ============================================================
// 🔹 Obtener lista de clientes para el combo
// ============================================================
export async function getClientes() {
  try {
    const res = await fetch(`${baseUrl}/Cliente`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error en getClientes:", err);
    return [];
  }
}

// ============================================================
// 🔹 Verificar si un agendamiento está completado
// ============================================================
export async function verificarCompletado(idAgendamiento) {
  try {
    const res = await fetch(`${baseUrl}/DetalleAgendamiento/verificar/${idAgendamiento}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error en verificarCompletado:", err);
    return { success: false, message: "Error al verificar estado del agendamiento." };
  }
}
// ============================================================
// 🔹 Obtener vigilantes asignados a un cliente
// ============================================================
export async function getVigilantesAsignados(idCliente) {
  try {
    const res = await fetch(`${baseUrl}/AsignacionClienteVigilante/${idCliente}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error en getVigilantesAsignados:", err);
    return [];
  }
}

