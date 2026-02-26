using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MorlonSeguridad.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class TurnoAsignadoController : ApiController
    {
        // ============================================================
        // 🔹 Asignar vigilante a turno
        // ============================================================
        [HttpPost]
        [Route("api/TurnoAsignado/asignar")]
        public IHttpActionResult Asignar([FromBody] TurnoAsignado t)
        {
            if (t == null || string.IsNullOrEmpty(t.idVigilante) || string.IsNullOrEmpty(t.tipo_turno))
                return BadRequest("Datos incompletos.");

            try
            {
                // 🧠 Obtener servicio contratado del cliente (para validar compatibilidad)
                string servicioCliente = TurnoAsignadoData.ObtenerServicioPorDetalle(t.idDetalle) ?? "";

                // Normalización básica para comparación
                string servicioLower = servicioCliente.Trim().ToLower()
                    .Replace("á", "a").Replace("é", "e").Replace("í", "i").Replace("ó", "o").Replace("ú", "u")
                    .Replace(" ", "").Replace("-", "").Replace("/", "");
                string turnoLower = t.tipo_turno.Trim().ToLower()
                    .Replace("á", "a").Replace("é", "e").Replace("í", "i").Replace("ó", "o").Replace("ú", "u")
                    .Replace(" ", "");

                bool coincide = servicioLower.Contains(turnoLower) || servicioLower.Contains("todos");

                if (!coincide)
                {
                    string mensajeError = $"El cliente tiene contratado el servicio '{servicioCliente}'. " +
                        $"Solo puede asignar turnos compatibles ({servicioCliente}). " +
                        $"Intentó asignar un turno de tipo '{t.tipo_turno}'.";
                    return Ok(new { success = false, message = mensajeError });
                }

                // ✅ Intentar asignar el vigilante
                bool ok = TurnoAsignadoData.AsignarVigilante(t.idDetalle, t.idVigilante, t.tipo_turno);
                if (ok)
                {
                    // 🟢 Actualizar estado del día
                    DetalleAgendamientoData.VerificarEstadoDetalle(t.idDetalle);

                    // 🟢 Obtener idAgendamiento del detalle
                    int idAgendamiento = 0;
                    using (var con = MorlonSeguridad.Data.ConexionBD.ObtenerConexion())
                    using (var cmd = new SqlCommand("SELECT idAgendamiento FROM DetalleAgendamiento WHERE idDetalle = @id", con))
                    {
                        cmd.Parameters.AddWithValue("@id", t.idDetalle);
                        idAgendamiento = Convert.ToInt32(cmd.ExecuteScalar());
                    }

                    // 🟢 Verificar si el agendamiento quedó completo
                    DetalleAgendamientoData.VerificarCompletadoAgendamiento(idAgendamiento);

                    return Ok(new
                    {
                        success = true,
                        estado = "Asignado",
                        message = "✅ Vigilante asignado correctamente."
                    });
                }

                return Ok(new { success = false, message = "⚠️ No se pudo asignar el vigilante (SP no devolvió éxito)." });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = "Error al asignar vigilante: " + ex.Message });
            }
        }


        // ============================================================
        // 🔹 Contar turnos asignados por detalle
        // ============================================================
        [HttpGet]
        [Route("api/TurnoAsignado/contar/{idDetalle}")]
        public IHttpActionResult ContarTurnos(int idDetalle)
        {
            try
            {
                int cantidad = TurnoAsignadoData.ContarTurnosPorDetalle(idDetalle);
                return Ok(new { idDetalle, cantidad });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }
    }
}
