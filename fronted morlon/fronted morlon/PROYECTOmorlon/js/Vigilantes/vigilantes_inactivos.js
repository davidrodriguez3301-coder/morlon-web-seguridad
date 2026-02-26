// ============================================================
// 💤 MÓDULO DE VIGILANTES INACTIVOS
// ============================================================

import { getEndpoint } from "../Conexion/Conexion.js";
const apiUrl = getEndpoint(""); // base = https://localhost:44301/api/

let vigilantesGlobal = [];
let paginaActual = 1;
const registrosPorPagina = 10;

// ============================================================
// 🔹 CARGAR INACTIVOS
// ============================================================
async function cargarVigilantesInactivos() {
  try {
    const res = await fetch(`${apiUrl}/Vigilantes/inactivos`);
    if (!res.ok) throw new Error("Error al obtener vigilantes retirados");
    vigilantesGlobal = await res.json();
    mostrarPagina(1);
  } catch (err) {
    console.error("⚠️ No se pudieron cargar vigilantes retirados:", err);
  }
}

function mostrarPagina(pagina) {
  paginaActual = pagina;
  const inicio = (pagina - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const paginaDatos = vigilantesGlobal.slice(inicio, fin);
  renderTabla(paginaDatos);
  renderPaginacion(vigilantesGlobal.length, pagina, registrosPorPagina, mostrarPagina);
}

function renderPaginacion(total, actual, porPagina, callback) {
  const totalPaginas = Math.ceil(total / porPagina);
  const cont = document.getElementById("paginacion");
  cont.innerHTML = "";
  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === actual ? "active" : ""}`;
    const btn = document.createElement("button");
    btn.className = "page-link";
    btn.textContent = i;
    btn.onclick = () => callback(i);
    li.appendChild(btn);
    cont.appendChild(li);
  }
}

// ============================================================
// 🔹 TABLA DE INACTIVOS
// ============================================================
function renderTabla(vigilantes) {
  const tbody = document.getElementById("tablaVigilantes");
  tbody.innerHTML = "";

  if (!vigilantes || vigilantes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No hay vigilantes retirados.</td></tr>`;
    return;
  }

  vigilantes.forEach((v) => {
    const fotoSrc = (v.fotografia && v.fotografia.length > 50)
      ? `data:image;base64,${v.fotografia}`
      : "../assets/img/user_default.jpg";

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${v.idVigilantes}</td>
      <td><img src="${fotoSrc}" class="rounded-circle me-2"
           style="width:40px;height:40px;object-fit:cover;"> ${v.nombre_apellido}</td>
      <td>${v.cedula}</td>
      <td>${v.cel1 || "-"}</td>
      <td>${v.tipo_contrato || "-"}</td>
      <td>${v.rh || "-"}</td>
      <td>${v.email || "-"}</td>
      <td>${v.nombreSupervisor || "-"}</td>
      <td>
        <button class="btn btn-info btn-sm btnDetalles" data-id="${v.idVigilantes}" title="Ver Detalles">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-warning btn-sm btnEditar" data-id="${v.idVigilantes}" title="Reactivar">
          <i class="fas fa-edit"></i>
        </button>
      </td>`;
    tbody.appendChild(fila);
  });
}

// ============================================================
// ✏️ REACTIVAR VIGILANTE
// ============================================================
document.addEventListener("click", async (e) => {
  const btnEdit = e.target.closest(".btnEditar");
  const btnDetalles = e.target.closest(".btnDetalles");

  // 🔍 Detalles
  if (btnDetalles) {
    const v = vigilantesGlobal.find(x => x.idVigilantes === btnDetalles.dataset.id);
    if (!v) return;
    Swal.fire({
      title: v.nombre_apellido,
      html: `
        <p><b>Cédula:</b> ${v.cedula}</p>
        <p><b>Correo:</b> ${v.email}</p>
        <p><b>Teléfono:</b> ${v.cel1}</p>
        <p><b>Supervisor:</b> ${v.nombreSupervisor || "-"}</p>
        <p><b>Estado:</b> ${v.estado}</p>`,
      imageUrl: v.fotografia ? `data:image;base64,${v.fotografia}` : "../assets/img/user_default.jpg",
      imageWidth: 120,
      imageHeight: 120,
      confirmButtonText: "Cerrar",
    });
    return;
  }

  // 🔁 Reactivar
  // 🔁 Reactivar
if (btnEdit) {
  const id = btnEdit.dataset.id;
  const confirmar = await Swal.fire({
    title: "¿Reactivar vigilante?",
    text: "El vigilante volverá al estado 'Activo'.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, reactivar",
    cancelButtonText: "Cancelar"
  });

  if (!confirmar.isConfirmed) return;

  try {
    const res = await fetch(`${apiUrl}/Vigilantes/estado/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      // 👇 Este es el cambio clave
      body: JSON.stringify({ nuevoEstado: "Activo" }),
    });

    if (!res.ok) throw new Error("No se pudo cambiar el estado");

    const data = await res.json();
    console.log("✅ Respuesta del backend:", data);

    Swal.fire({
      icon: "success",
      title: "✅ Vigilante reactivado",
      text: "El usuario ha sido reactivado correctamente",
      confirmButtonColor: "#28a745",
      didOpen: (popup) => popup.classList.add("swal2-reactivado") // ✨ Animación verde
    });

    await cargarVigilantesInactivos();

  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

});

// ============================================================
// 🔍 BUSCAR
// ============================================================
document.getElementById("buscarInput").addEventListener("input", () => {
  const texto = document.getElementById("buscarInput").value.toLowerCase();
  const filtrados = vigilantesGlobal.filter(
    (v) =>
      v.nombre_apellido?.toLowerCase().includes(texto) ||
      v.cedula?.toLowerCase().includes(texto)
  );
  renderTabla(filtrados);
});

// ============================================================
// 🔹 INICIALIZACIÓN
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarVigilantesInactivos();
});
