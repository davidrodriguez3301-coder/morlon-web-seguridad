// ============================================================
// 🗓️ calendario.js — Dibuja el calendario y gestiona los días
// ============================================================

import { baseUrl } from "./api.js";

export function generarCalendario(dias, contenedor, idAgendamiento) {
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (!Array.isArray(dias) || dias.length === 0) {
    contenedor.innerHTML = `<p class="text-center text-muted mt-3">
      No hay días generados para este agendamiento.
    </p>`;
    return;
  }

  const fechaPrimera = new Date(dias[0].fecha);
  const mes = fechaPrimera.toLocaleString("es-ES", { month: "long" });
  const anio = fechaPrimera.getFullYear();

  const header = document.createElement("div");
  header.className = "calendar-header";
  header.innerHTML = `<h3 class="text-center text-capitalize mb-3">${mes} ${anio}</h3>`;
  contenedor.appendChild(header);

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const encabezado = document.createElement("div");
  encabezado.className = "calendar-header-row";
  diasSemana.forEach((d) => {
    const cell = document.createElement("div");
    cell.className = "day-header";
    cell.textContent = d;
    encabezado.appendChild(cell);
  });
  contenedor.appendChild(encabezado);

  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  const primerDia = new Date(dias[0].fecha);
  const primerDiaSemana = (primerDia.getDay() + 6) % 7;
  for (let i = 0; i < primerDiaSemana; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    grid.appendChild(empty);
  }

  // Renderizar los días
  dias.forEach((d) => {
    const fecha = new Date(d.fecha);
    const dayCell = document.createElement("div");
    dayCell.className = `day ${d.estado === "Asignado" ? "assigned" : "pending"}`;
    dayCell.dataset.idDetalle = d.idDetalle;
    dayCell.textContent = fecha.getDate();

    const tooltipTurnos = d.turnos_csv || d.primer_tipo_turno || "Sin turnos";
const tooltipVigilantes = d.vigilantes_csv || "Sin vigilantes asignados";

// 🧾 Mostrar en tooltip al pasar el mouse
dayCell.title = `${fecha.toLocaleDateString("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
})}
Turnos: ${tooltipTurnos}
Vigilantes: ${tooltipVigilantes}`;

// 👇 Mostrar dentro del recuadro del día
if (d.vigilantes_csv) {
  const nombres = d.vigilantes_csv.split(',').map(n => n.trim());
  const lista = document.createElement("div");
  lista.className = "vigilantes-list";
  lista.style.fontSize = "0.7em";
  lista.style.marginTop = "4px";
  lista.style.color = "#fff";

  nombres.forEach(nombre => {
    const span = document.createElement("div");
    span.textContent = nombre.split(' ')[0]; // muestra solo el primer nombre
    lista.appendChild(span);
  });

  dayCell.appendChild(lista);
}



    const badgeContainer = document.createElement("div");
    badgeContainer.className = "badge-container";

    if (d.turnos_csv) {
      const tipos = d.turnos_csv.split(",").map((t) => t.trim());
      tipos.forEach((t) => {
        const badge = document.createElement("span");
        badge.className = "badge-turno";
        switch (t.toLowerCase()) {
          case "diurno":
            badge.textContent = "D";
            badge.classList.add("diurno");
            break;
          case "nocturno":
            badge.textContent = "N";
            badge.classList.add("nocturno");
            break;
          case "portería":
            badge.textContent = "P";
            badge.classList.add("porteria");
            break;
          case "rotación":
            badge.textContent = "R";
            badge.classList.add("rotacion");
            break;
          default:
            badge.textContent = t.charAt(0).toUpperCase();
        }
        badgeContainer.appendChild(badge);
      });
    }

    dayCell.appendChild(badgeContainer);
    grid.appendChild(dayCell);
  });

  contenedor.appendChild(grid);

  const legend = document.createElement("div");
  legend.className = "calendar-legend mt-4 text-center";
  legend.innerHTML = `
    <span class="badge bg-danger me-2">Pendiente</span>
    <span class="badge bg-success me-2">Asignado</span>
    <span class="badge bg-warning text-dark me-2">Diurno</span>
    <span class="badge bg-purple me-2">Nocturno</span>
    <span class="badge bg-info text-dark me-2">Portería</span>
    <span class="badge bg-secondary text-dark me-2">Rotación</span>
  `;
  contenedor.appendChild(legend);
}

