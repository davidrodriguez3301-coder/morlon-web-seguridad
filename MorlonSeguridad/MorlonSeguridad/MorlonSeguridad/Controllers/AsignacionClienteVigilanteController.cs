using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MorlonSeguridad.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/AsignacionClienteVigilante")]
    public class AsignacionClienteVigilanteController : ApiController
    {
        // ============================================================
        // 🔹 LISTAR ASIGNACIONES POR CLIENTE
        // ============================================================
        [HttpGet]
        [Route("{idCliente}")]
        public IHttpActionResult ListarPorCliente(string idCliente)
        {
            try
            {
                var lista = AsignacionClienteVigilanteData.ListarPorCliente(idCliente);
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = "Error al listar asignaciones: " + ex.Message });
            }
        }

        // ============================================================
        // 🔹 CREAR NUEVA ASIGNACIÓN
        // ============================================================
        [HttpPost]
        [Route("")]
        public IHttpActionResult Crear([FromBody] AsignacionClienteVigilante a)
        {
            if (a == null || string.IsNullOrEmpty(a.idCliente) || string.IsNullOrEmpty(a.idVigilante))
                return BadRequest("Datos incompletos para crear la asignación.");

            try
            {
                bool ok = AsignacionClienteVigilanteData.Crear(a);
                return Ok(new
                {
                    success = ok,
                    message = ok ? "✅ Asignación creada correctamente." : "⚠️ No se pudo crear la asignación."
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        // ============================================================
        // 🔹 ELIMINAR ASIGNACIÓN
        // ============================================================
        [HttpDelete]
        [Route("{idAsignacion:int}")]
        public IHttpActionResult Eliminar(int idAsignacion)
        {
            bool ok = AsignacionClienteVigilanteData.Eliminar(idAsignacion);
            return Ok(new
            {
                success = ok,
                message = ok ? "🗑️ Asignación eliminada correctamente." : "⚠️ Error al eliminar la asignación."
            });
        }
    }
}
