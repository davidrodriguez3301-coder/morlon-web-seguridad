import { getEndpoint } from "../js/Conexion/Conexion.js";
const apiUrl = getEndpoint("Login"); // https://.../api/Login

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Campos del formulario
  const codOperativo = document.getElementById("user").value.trim();

  // 🔥 IMPORTANTE: esta variable DEBE llamarse "contraseña"
  const contraseña = document.getElementById("pass").value.trim();

  const alertContainer = document.getElementById("alertContainer");
  const alertMessage = document.getElementById("alertMessage");

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      // 🔥 Aquí NO CAMBIAS NADA → se envía "contraseña"
      body: JSON.stringify({ codOperativo, contraseña }),
    });

    // Si el servidor falla
    if (!res.ok) {
      mostrarAlerta("Error de conexión con el servidor (HTTP " + res.status + ")", "warning");
      return;
    }

    const data = await res.json();
    console.log("Respuesta backend:", data);

    if (data && data.success && data.operativo) {
      const user = data.operativo;

      // Guardamos la sesión
      localStorage.setItem("usuario", JSON.stringify(user));

      mostrarAlerta(`Bienvenido ${user.nombreOperativo}`, "success");

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        window.location.href = "../PrincipalIndex/index.html";
      }, 1500);

    } else {
      mostrarAlerta(data.message || "Usuario o contraseña incorrectos.", "danger");
    }

  } catch (error) {
    console.error("Error de conexión:", error);
    mostrarAlerta("No se pudo conectar al servidor.", "warning");
  }

  // Función para mostrar alertas en pantalla
  function mostrarAlerta(mensaje, tipo) {
    alertMessage.className = `alert alert-${tipo}`;
    alertMessage.textContent = mensaje;
    alertContainer.style.display = "block";

    // Ocultar después de 3 segundos
    setTimeout(() => {
      alertContainer.style.display = "none";
    }, 3000);
  }
});
