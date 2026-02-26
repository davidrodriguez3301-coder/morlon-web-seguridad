// ============================================================
// 🌐 Archivo: Conexion.js
// 📁 Ruta: /js/Conexion/Conexion.js
// ============================================================

// URL base de la API (ajústala solo aquí)
export const API_BASE_URL = "https://localhost:44301/api/";

// ============================================================
// 🔗 Función auxiliar para construir rutas completas
// ============================================================
export function getEndpoint(endpoint) {
  // Garantiza que siempre termine en "/"
  return `${API_BASE_URL}${endpoint.replace(/^\/+/, "")}`;
}
