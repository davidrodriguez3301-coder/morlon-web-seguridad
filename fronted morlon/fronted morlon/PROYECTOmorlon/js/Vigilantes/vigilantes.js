// ============================================================
// 🧠 MÓDULO DE VIGILANTES COMPLETO (EPS, ARL, Contratos, CRUD)
// ============================================================

// ============================================================
// 🌐 Conexión centralizada con Conexion.js
// ============================================================
import { getEndpoint } from "../Conexion/Conexion.js";
const apiUrl = getEndpoint(""); // base = https://localhost:44301/api/

let vigilantesGlobal = [];
let paginaActual = 1;
const registrosPorPagina = 10;
let fotoBase64 = null;
let estadoOriginal = null;

// Modal global
const modalEl = document.getElementById("vigilanteModal");
let modal = null;

// ============================================================
// 🔹 CARGAR SUPERVISORES
// ============================================================
async function cargarSupervisores() {
  try {
    const res = await fetch(`${apiUrl}/Supervisor`);
    if (!res.ok) throw new Error("Error al obtener supervisores");
    const supervisores = await res.json();
    const select = document.getElementById("idSupervisor");
    select.innerHTML = `<option value="">Seleccione un supervisor...</option>`;
    supervisores.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.idSupervisor;
      opt.textContent = s.nombres_apellidos;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("❌ No se pudieron cargar supervisores:", err);
  }
}

// ============================================================
// 🔹 CARGAR TIPO DE CONTRATO
// ============================================================
async function cargarTiposContrato(seleccionActual = null) {
  try {
    const res = await fetch(`${apiUrl}/Vigilantes/tiposContrato`);
    if (!res.ok) throw new Error("Error al obtener tipos de contrato");

    const tipos = await res.json();
    const select = document.getElementById("idTipoContrato");

    if (!select) return;

    // Limpia y llena el <select>
    select.innerHTML = `<option value="">Seleccione un tipo...</option>`;
    tipos.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.idTipoContrato;
      opt.textContent = t.nombreTipo;
      select.appendChild(opt);
    });

    // ✅ Si se pasa un valor actual (para editar), selecciónalo
    if (seleccionActual) {
      const opt = Array.from(select.options).find(
        o => o.value == seleccionActual || o.textContent.trim().toLowerCase() === seleccionActual.trim().toLowerCase()
      );
      if (opt) select.value = opt.value;
    }

  } catch (err) {
    console.error("❌ No se pudieron cargar los tipos de contrato:", err);
  }
}


// ============================================================
// 🏥 CARGAR EPS
// ============================================================
async function cargarEPS() {
  try {
    const res = await fetch(`${apiUrl}/EPS`);
    if (!res.ok) throw new Error("Error al obtener EPS");
    const eps = await res.json();

    const select = document.getElementById("idEPS");
    select.innerHTML = `<option value="">Seleccione una EPS...</option>`;
    eps.forEach((e) => {
      const opt = document.createElement("option");
      opt.value = e.idEPS;
      opt.textContent = e.nombre_eps;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("⚠️ No se pudieron cargar las EPS:", err);
  }
}

// ============================================================
// 🦺 CARGAR ARL
// ============================================================
async function cargarARL() {
  try {
    const res = await fetch(`${apiUrl}/ARL`);
    if (!res.ok) throw new Error("Error al obtener ARL");
    const arl = await res.json();

    const select = document.getElementById("idARL");
    select.innerHTML = `<option value="">Seleccione una ARL...</option>`;
    arl.forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.idARL;
      opt.textContent = a.nombre_arl;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("⚠️ No se pudieron cargar las ARL:", err);
  }
}

// ============================================================
// 🔹 CARGAR Y MOSTRAR VIGILANTES
// ============================================================
async function cargarVigilantes() {
  try {
    const res = await fetch(`${apiUrl}/Vigilantes/activos`);
    if (!res.ok) throw new Error("Error al obtener vigilantes");
    vigilantesGlobal = await res.json();
    mostrarPagina(1);
  } catch (err) {
    console.error("⚠️ Error al cargar vigilantes:", err);
  }
}

function mostrarPagina(pagina) {
  const total = vigilantesGlobal.length;
  const actualCount = Math.min(registrosPorPagina, total - ((pagina - 1) * registrosPorPagina));
  actualizarContador(actualCount, total);
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
// 🔹 TABLA DE VIGILANTES
// ============================================================
function renderTabla(vigilantes) {
  actualizarContador(vigilantes.length, vigilantesGlobal.length);
  const tbody = document.getElementById("tablaVigilantes");
  tbody.innerHTML = "";

  if (!vigilantes || vigilantes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center">No hay vigilantes registrados.</td></tr>`;
    return;
  }

  vigilantes.forEach((v) => {
    const fotoSrc = (v.fotografia && v.fotografia.length > 50)
  ? `data:image;base64,${v.fotografia}`
  : "../assets/img/user_default.jpg";


    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${v.idVigilantes}</td>
      <td>
        <img src="${fotoSrc}" class="rounded-circle me-2 fotoZoom"
             style="width:40px;height:40px;object-fit:cover;cursor:pointer;"
             data-foto="${fotoSrc}">
        ${v.nombre_apellido}
      </td>
      <td>${v.cedula}</td>
      <td>${v.cel1 || "-"}</td>
      <td>${v.tipo_contrato || v.nombreTipoContrato || "-"}</td>
      <td>${v.rh || "-"}</td>
      <td>${v.email || "-"}</td>
      <td>${v.nombreSupervisor || "-"}</td>
      <td class="d-flex gap-2 justify-content-center">
        <button class="btn btn-info btn-sm btnDetalles" data-id="${v.idVigilantes}" title="Ver Detalles">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-warning btn-sm btnEditar" data-id="${v.idVigilantes}" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
      </td>`;
    tbody.appendChild(fila);
  });
}

// ============================================================
// 📸 PREVISUALIZAR IMAGEN
// ============================================================
const fotoInput = document.getElementById("fotografia");
const previewImg = document.getElementById("previewFoto");

fotoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) {
    fotoBase64 = null;
    previewImg.src = "../assets/img/user_default.jpg";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    Swal.fire("Archivo demasiado grande", "La imagen no puede superar los 2 MB.", "warning");
    fotoInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    fotoBase64 = ev.target.result.split(",")[1];
    previewImg.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// ============================================================
// 🆕 NUEVO VIGILANTE
// ============================================================
document.getElementById("btnAgregar").addEventListener("click", async () => {
  const form = document.getElementById("formVigilante");
  form.reset();
  document.getElementById("modalTitle").textContent = "Nuevo Vigilante";
  document.getElementById("isEdit").value = "false";
  previewImg.src = "../assets/img/user_default.jpg";
  fotoBase64 = null;
  estadoOriginal = "Activo";

  await Promise.all([cargarSupervisores(), cargarTiposContrato(), cargarEPS(), cargarARL()]);
  modal.show();
});

// ============================================================
// ✏️ EDITAR VIGILANTE (sincroniza EPS, ARL y TipoContrato correctamente)
// ============================================================
async function abrirEditarVigilante(id) {
  const v = vigilantesGlobal.find(x => x.idVigilantes === id);
  if (!v) return;

  // Cambiar título y modo
  document.getElementById("modalTitle").textContent = "Editar Vigilante";
  document.getElementById("isEdit").value = "true";
  document.getElementById("idVigilantes").value = v.idVigilantes;

  // Cargar primero todas las listas
  await Promise.all([cargarEPS(), cargarARL(), cargarTiposContrato(), cargarSupervisores()]);

  // Campos comunes
  const campos = [
    "nombre_apellido", "cedula", "email", "cel1", "cel2",
    "codOperativo", "estado", "rh", "idSupervisor"
  ];
  campos.forEach(c => {
    const el = document.getElementById(c);
    if (el) el.value = v[c]?.toString().trim() || "";
  });

  // ======================================================
  // 🔹 EPS
  // ======================================================
  const selectEPS = document.getElementById("idEPS");
  if (v.idEPS) {
    const valor = v.idEPS.toString().trim();
    if ([...selectEPS.options].some(opt => opt.value === valor)) {
      selectEPS.value = valor;
    }
  }

  // ======================================================
  // 🔹 ARL
  // ======================================================
  const selectARL = document.getElementById("idARL");
  if (v.idARL) {
    const valor = v.idARL.toString().trim();
    if ([...selectARL.options].some(opt => opt.value === valor)) {
      selectARL.value = valor;
    }
  }

  // ======================================================
  // 🔹 Tipo de Contrato (corrige “Sin definir”)
  // ======================================================
 // ✅ Tipo de contrato (por ID, no por nombre)
const selectTipo = document.getElementById("idTipoContrato");
if (selectTipo) {
  if (v.idTipoContrato) {
    // Si llega el id (1,2, etc.)
    selectTipo.value = v.idTipoContrato;
  } else if (v.tipo_contrato) {
    // Si llega el texto ("Fijo", "Relevante", etc.)
    const opt = Array.from(selectTipo.options).find(
      o => o.textContent.trim().toLowerCase() === v.tipo_contrato.trim().toLowerCase()
    );
    if (opt) selectTipo.value = opt.value;
  }
}


  // ======================================================
  // 🔹 Estado
  // ======================================================
  const selectEstado = document.getElementById("estado");
  if (selectEstado) {
    const val = v.estado?.trim() || "Activo";
    selectEstado.value = ["Activo", "Inactivo"].includes(val) ? val : "Activo";
  }

  // ======================================================
  // 🔹 RH (tipo de sangre)
  // ======================================================
  const selectRh = document.getElementById("rh");
  if (selectRh) selectRh.value = v.rh?.trim() || "";

  // ======================================================
  // 🔹 Imagen
  // ======================================================
  previewImg.src = v.fotografia
    ? `data:image/jpeg;base64,${v.fotografia}`
    : "../assets/img/user_default.jpg";

  fotoBase64 = v.fotografia || null;
  estadoOriginal = v.estado ? v.estado.trim() : "Activo";

  modal.show();
}


  // ============================================================
  // 💾 GUARDAR (CREAR O ACTUALIZAR)
  // ============================================================
document.getElementById("formVigilante").addEventListener("submit", async (e) => {
  e.preventDefault();

  const esEdicion = document.getElementById("isEdit").value === "true";
  const estadoActual = document.getElementById("estado").value;

  if (esEdicion && estadoActual !== estadoOriginal) {
    const confirm = await Swal.fire({
      title: "Confirmar cambio de estado",
      text: `¿Desea cambiar el estado de ${estadoOriginal} a ${estadoActual}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) {
      document.getElementById("estado").value = estadoOriginal;
      return;
    }
  }

  // 🔹 Si es nuevo, no enviar el idVigilantes
  let idVig = document.getElementById("idVigilantes").value.trim();
  if (!esEdicion) {
    idVig = ""; // 🚫 Limpia el ID para que el backend genere uno nuevo
  }

  const vigilante = {
    idVigilantes: idVig,
    nombre_apellido: document.getElementById("nombre_apellido").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    email: document.getElementById("email").value.trim(),
    cel1: document.getElementById("cel1").value.trim(),
    cel2: document.getElementById("cel2").value.trim(),
    idEPS: document.getElementById("idEPS").value || null,
    idARL: document.getElementById("idARL").value || null,
    idTipoContrato: document.getElementById("idTipoContrato").value || null,
    rh: document.getElementById("rh").value.trim(),
    idSupervisor: document.getElementById("idSupervisor").value.trim(),
    codOperativo: document.getElementById("codOperativo").value || "18401",
    estado: estadoActual,
    fotografia: fotoBase64,
  };

  console.log("🟡 Datos enviados al backend:", vigilante);

  const metodo = esEdicion ? "PUT" : "POST";

  try {
    const res = await fetch(`${apiUrl}/Vigilantes`, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vigilante),
    });

    if (!res.ok) throw new Error("No se pudo guardar el vigilante");

    Swal.fire({
      icon: "success",
      title: esEdicion ? "Actualizado correctamente" : "Registrado correctamente",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      modal.hide();
      document.body.classList.remove("modal-open");
      document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());
      cargarVigilantes();
    });
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
});


// ============================================================
// 🔍 BÚSQUEDA POR NOMBRE O CÉDULA
// ============================================================
document.getElementById("buscarInput").addEventListener("input", () => {
  const texto = document.getElementById("buscarInput").value.trim().toLowerCase();
  if (texto === "") {
    mostrarPagina(1);
    return;
  }
  const filtrados = vigilantesGlobal.filter(
    (v) =>
      v.nombre_apellido?.toLowerCase().includes(texto) ||
      v.cedula?.toLowerCase().includes(texto)
  );
  renderTabla(filtrados);
});

// ============================================================
// 🔹 BOTÓN VER TODOS
// ============================================================
document.getElementById("btnVerTodo").addEventListener("click", async () => {
  document.getElementById("buscarInput").value = "";
  if (vigilantesGlobal.length === 0) {
    await cargarVigilantes();
  } else {
    mostrarPagina(1);
  }
});

// ============================================================
// 🔹 CLICK GENERAL (foto o editar)
// ============================================================
document.addEventListener("click", async (e) => {
  const btnEdit = e.target.closest(".btnEditar");
  const btnDetalles = e.target.closest(".btnDetalles");
  const zoomFoto = e.target.closest(".fotoZoom");

  // 📸 Ampliar foto
  if (zoomFoto) {
    await Swal.fire({
      imageUrl: zoomFoto.dataset.foto,
      imageWidth: 250,
      imageHeight: 250,
      background: "#222",
      showCloseButton: true,
      showConfirmButton: false,
    });
    return;
  }

  // 🟡 Ver detalles del vigilante
  if (btnDetalles) {
    const id = btnDetalles.dataset.id;
    const v = vigilantesGlobal.find(x => x.idVigilantes === id);
    if (!v) return;

    // Llenar el modal de detalles
    document.getElementById("detalleId").textContent = v.idVigilantes;
    document.getElementById("detalleNombre").textContent = v.nombre_apellido;
    document.getElementById("detalleCedula").textContent = v.cedula;
    document.getElementById("detalleEmail").textContent = v.email || "-";
    document.getElementById("detalleCel1").textContent = v.cel1 || "-";
    document.getElementById("detalleCel2").textContent = v.cel2 || "-";
    document.getElementById("detalleContrato").textContent = v.tipo_contrato || v.nombreTipoContrato || "-";
    document.getElementById("detalleRH").textContent = v.rh || "-";
    document.getElementById("detalleSupervisor").textContent = v.nombreSupervisor || "-";
    document.getElementById("detalleEPS").textContent = v.nombreEPS || "-";
    document.getElementById("detalleARL").textContent = v.nombreARL || "-";
    document.getElementById("detalleEstado").textContent = v.estado || "-";
    // ✅ Mostrar imagen guardada o la predeterminada
if (v.fotografia && v.fotografia.length > 50) {
  // Si viene en base64 real desde el backend
  document.getElementById("detalleFoto").src = `data:image;base64,${v.fotografia}`;
} else {
  // Imagen por defecto si no hay foto
  document.getElementById("detalleFoto").src = "../assets/img/user_default.jpg";
}


    // Mostrar el modal de detalles
    const detalleModal = new bootstrap.Modal(document.getElementById("detalleVigilanteModal"));
    detalleModal.show();
    return;
  }

  // ✏️ Editar vigilante
  if (btnEdit) abrirEditarVigilante(btnEdit.dataset.id);
});


// ============================================================
// 📊 CONTADOR DE RESULTADOS (nuevo)
// ============================================================
function actualizarContador(actual, total) {
  let contador = document.getElementById("contadorResultados");
  if (!contador) {
    contador = document.createElement("div");
    contador.id = "contadorResultados";
    contador.className = "text-center text-muted mt-2 fw-bold";
    const tableResp = document.querySelector(".table-responsive");
    if (tableResp) tableResp.after(contador);
  }

  if (actual === 0) {
    contador.innerHTML = `<span class="text-danger">No se encontraron vigilantes</span>`;
  } else if (actual === total) {
    contador.innerHTML = `<span class="text-secondary">Mostrando ${total} vigilante${total !== 1 ? "s" : ""}</span>`;
  } else {
    contador.innerHTML = `<span class="text-primary">Mostrando ${actual} coincidencia${actual !== 1 ? "s" : ""} de ${total} vigilante${total !== 1 ? "s" : ""}</span>`;
  }
}

// Añadido contador dentro de renderTabla y mostrarPagina
// ============================================================
// 🔹 INICIALIZAR

// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  modal = new bootstrap.Modal(modalEl);
  await Promise.all([cargarSupervisores(), cargarTiposContrato(), cargarEPS(), cargarARL()]);
  await cargarVigilantes();

  let operativo = localStorage.getItem("codOperativo");
  if (!operativo) {
    operativo = "18401";
    localStorage.setItem("codOperativo", operativo);
    console.warn("⚠️ No se detectó sesión activa. Usando código operativo por defecto:", operativo);
  }
});
