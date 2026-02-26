import { getEndpoint } from "../Conexion/Conexion.js";

const apiBase = getEndpoint("");
const apiEliminados = `${apiBase}/Supervisor/eliminados`;

let supervisoresEliminados = [];
let modalDetalles = null;

document.addEventListener("DOMContentLoaded", async () => {
    modalDetalles = new bootstrap.Modal(document.getElementById("modalDetallesEliminado"));
    await cargarEliminados();
});

// ======================================================
// CARGAR SUPERVISORES ELIMINADOS
// ======================================================
async function cargarEliminados() {
    try {
        const res = await fetch(apiEliminados);
        supervisoresEliminados = await res.json();
        renderTabla(supervisoresEliminados);
    } catch (err) {
        console.error("Error cargando eliminados:", err);
        Swal.fire("Error", "No se pudo cargar supervisores eliminados", "error");
    }
}

// ======================================================
// RENDER TABLA
// ======================================================
function renderTabla(lista) {
    const tbody = document.getElementById("tablaSupervisoresEliminados");
    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="7">No hay supervisores eliminados.</td></tr>`;
        return;
    }

    lista.forEach(s => {
        const foto = s.fotografia
            ? `data:image;base64,${s.fotografia}`
            : "../assets/img/user_default.jpg";

        tbody.innerHTML += `
        <tr>
            <td>${s.idSupervisor}</td>
            <td>
                <img src="${foto}" class="rounded-circle me-2 fotoZoom"
                     style="width:40px;height:40px;object-fit:cover;cursor:pointer;">
                ${s.nombres_apellidos}
            </td>
            <td>${s.cedula}</td>
            <td>${s.nombreZona ?? "-"}</td>
            <td>${s.eliminado_por_nombre ?? "-"}</td>
            <td>${s.fecha_eliminado ?? "-"}</td>
            <td>
                <button class="btn btn-info btn-sm btnDetalles" data-id="${s.idSupervisor}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
        `;
    });

    document.querySelectorAll(".btnDetalles").forEach(btn => {
        btn.addEventListener("click", () => mostrarDetalles(btn.dataset.id));
    });
}

// ======================================================
// MOSTRAR DETALLES EN MODAL
// ======================================================
function mostrarDetalles(id) {
    const s = supervisoresEliminados.find(x => x.idSupervisor === id);
    if (!s) return;

    const foto = s.fotografia
        ? `data:image;base64,${s.fotografia}`
        : "../assets/img/user_default.jpg";

    document.getElementById("detalleFoto").src = foto;

    document.getElementById("detalleID").textContent = s.idSupervisor;
    document.getElementById("detalleNombre").textContent = s.nombres_apellidos;
    document.getElementById("detalleCedula").textContent = s.cedula;
    document.getElementById("detalleCorreo").textContent = s.email ?? "-";
    document.getElementById("detalleZona").textContent = s.nombreZona ?? "-";

    document.getElementById("detalleCreador").textContent = s.creado_por_nombre ?? "Desconocido";
    document.getElementById("detalleEliminador").textContent = s.eliminado_por_nombre ?? "Desconocido";
    document.getElementById("detalleFechaEliminado").textContent = s.fecha_eliminado ?? "-";

    modalDetalles.show();
}
