document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const nombreOperativo = document.getElementById("nombreOperativo");
  const tipoUsuario = document.getElementById("tipoUsuario");
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");

  if (!usuario) {
    // Si no hay sesión activa, redirigir al login
    window.location.href = "../Login/login.html";
    return;
  }

  // Mostrar nombre y tipo
  if (nombreOperativo && tipoUsuario) {
    nombreOperativo.textContent = usuario.nombreOperativo || "Usuario";
    tipoUsuario.textContent = `(${usuario.tipo_usuario || "sin rol"})`;
  }

  // Botón de cerrar sesión
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
      Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Tu sesión actual se cerrará.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("usuario");
          Swal.fire({
            title: "Sesión cerrada",
            text: "Has cerrado sesión correctamente.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
          setTimeout(() => {
            window.location.href = "../Dashboard/login.html";
          }, 1500);
        }
      });
    });
  }
});