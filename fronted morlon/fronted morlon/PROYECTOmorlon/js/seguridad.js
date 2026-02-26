// ======================================================
//  SEGURIDAD DEL SISTEMA MORLON
//  Roles: Administrador, Operativo, Visitante
// ======================================================

// ----------------------------------------------
// OBTENER USUARIO DESDE LOCALSTORAGE
// ----------------------------------------------
function obtenerUsuario() {
    const raw = localStorage.getItem("usuario");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Error leyendo usuario:", e);
        return null;
    }
}

// ----------------------------------------------
// CONFIGURAR BOTONES DEL MENÚ SEGÚN ROL
// ----------------------------------------------
function configurarMenuPorRol() {

    const usuario = obtenerUsuario();
    if (!usuario) return;

    const rol = usuario.tipo_usuario;

    // ============================
    // 🔐 OCULTAR OPERATIVOS para NO administradores
    // ============================
    if (rol !== "Administrador") {
        const btnOperativos = document.getElementById("btnOperativos");
        if (btnOperativos) btnOperativos.style.display = "none";
    }

    // ============================
    // 🔐 VISITANTE: solo consulta
    // ============================
    if (rol === "Visitante") {

        // VISITANTE solo debe ocultar Operativos
        const btnOperativos = document.getElementById("btnOperativos");
        if (btnOperativos) btnOperativos.style.display = "none";
        
        // NO ocultar los demás módulos
        // Los demás módulos se manejan dentro de cada página
    }
}


// ----------------------------------------------
// BLOQUEAR ACCESO A MÓDULO POR URL
// ----------------------------------------------
function verificarAccesoModulo(nombreModulo, opciones) {

    const usuario = obtenerUsuario();
    if (!usuario) {
        // No hay sesión, enviar a login
        window.location.href = "../Login/login.html";
        return false;
    }

    const rol = usuario.tipo_usuario;

    // ==========================================
    // 🔐 PERMISOS POR MÓDULO
    // ==========================================
    const permisos = {
    "Operativos": ["Administrador"],   // solo admin

    // Visitante ahora puede acceder
    "Clientes": ["Administrador", "Operativo", "Visitante"],
    "Supervisores": ["Administrador", "Operativo", "Visitante"],
    "Vigilantes": ["Administrador", "Operativo", "Visitante"],
    "Agendamiento": ["Administrador", "Operativo", "Visitante"],
    "Zonas": ["Administrador", "Operativo", "Visitante"],
    "Novedades": ["Administrador", "Operativo", "Visitante"],
    "EPS": ["Administrador", "Operativo", "Visitante"],
    "ARL": ["Administrador", "Operativo", "Visitante"],
    "Campos": ["Administrador", "Operativo", "Visitante"]
};


    const permitidos = permisos[nombreModulo];

    // Si el módulo no existe o el rol no es permitido
    if (!permitidos || !permitidos.includes(rol)) {

        // Mostrar alerta solo si está habilitado
        if (!opciones || opciones.redirigirSiNo !== false) {
            alert("❌ No tienes permiso para acceder a este módulo.");
        }

        window.location.href = "../PrincipalIndex/index.html";
        return false;
    }

    return true;
}

function bloquearBotonesParaVisitante() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || usuario.tipo_usuario !== "Visitante") return;

  // Visitante SÍ puede buscar y SÍ puede ver todos → NO tocarlos

  const botonesBloqueados = [
    ".btn-nuevo",
    ".btn-editar",
    ".btn-eliminar",
    ".btn-guardar"
  ];

  botonesBloqueados.forEach(selector => {
    document.querySelectorAll(selector).forEach(btn => {
      btn.classList.add("disabled");
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.6";
    });
  });
}



