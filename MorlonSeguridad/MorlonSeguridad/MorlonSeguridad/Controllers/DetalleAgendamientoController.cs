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
    public class DetalleAgendamientoController : ApiController
    {
        // ============================================================
        // 🔹 OBTENER LOS DÍAS DE UN AGENDAMIENTO
        // ============================================================
        [HttpGet]
        [Route("api/DetalleAgendamiento")]
        public IHttpActionResult GetPorAgendamiento(int idAgendamiento)
        {
            try
            {
                var dias = DetalleAgendamientoData.ListarConTurnos(idAgendamiento);
                return Ok(dias);
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        // ============================================================
        // 🔹 VERIFICAR ESTADO GLOBAL DEL AGENDAMIENTO (completado o no)
        // ============================================================
        [HttpGet]
        [Route("api/DetalleAgendamiento/verificar/{idAgendamiento}")]
        public IHttpActionResult VerificarCompletado(int idAgendamiento)
        {
            try
            {
                // Ejecuta el SP que actualiza el estado
                DetalleAgendamientoData.VerificarCompletadoAgendamiento(idAgendamiento);

                // Consulta el estado actual desde la tabla Agendamiento
                string estadoActual = "";
                using (var con = MorlonSeguridad.Data.ConexionBD.ObtenerConexion())
                using (var cmd = new SqlCommand("SELECT estado FROM Agendamiento WHERE idAgendamiento = @id", con))
                {
                    cmd.Parameters.AddWithValue("@id", idAgendamiento);
                    var result = cmd.ExecuteScalar();
                    estadoActual = result != null ? result.ToString() : "Desconocido";
                }

                return Ok(new
                {
                    success = true,
                    idAgendamiento,
                    estado = estadoActual
                });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

    }
}
