using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MorlonSeguridad.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/EPS")]
    public class EPSController : ApiController
    {
        // ============================================================
        // 📋 LISTAR TODAS LAS EPS
        // ============================================================
        [HttpGet, Route("")]
        public IHttpActionResult GetAll()
        {
            return Ok(EPSData.ListarEPS());
        }

        // ============================================================
        // 🟢 CREAR EPS
        // ============================================================
        [HttpPost, Route("")]
        public IHttpActionResult Post([FromBody] EPS eps)
        {
            if (eps == null || string.IsNullOrWhiteSpace(eps.nombre_eps))
                return BadRequest("Debe ingresar el nombre de la EPS.");

            int idGenerado = EPSData.InsertarEPS(eps);
            return Ok(new
            {
                success = idGenerado > 0,
                idGenerado,
                message = idGenerado > 0 ? "EPS registrada correctamente." : "Error al registrar EPS."
            });
        }

        // ============================================================
        // 🟡 ACTUALIZAR EPS
        // ============================================================
        [HttpPut, Route("")]
        public IHttpActionResult Put([FromBody] EPS eps)
        {
            if (eps == null || eps.idEPS <= 0)
                return BadRequest("Datos incompletos.");

            bool ok = EPSData.ActualizarEPS(eps);
            return Ok(new
            {
                success = ok,
                message = ok ? "EPS actualizada correctamente." : "Error al actualizar EPS."
            });
        }

        // ============================================================
        // 🔴 ELIMINAR EPS (definitivamente)
        // ============================================================
        [HttpDelete, Route("{id}")]
        public IHttpActionResult Delete(int id)
        {
            bool ok = EPSData.EliminarEPS(id);
            return Ok(new
            {
                success = ok,
                message = ok ? "EPS eliminada correctamente." : "Error al eliminar EPS."
            });
        }
    }
}
