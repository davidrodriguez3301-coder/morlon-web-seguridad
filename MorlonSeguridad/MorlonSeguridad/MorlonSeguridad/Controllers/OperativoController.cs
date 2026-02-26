using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MorlonSeguridad.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/Operativo")]
    public class OperativoController : ApiController
    {
        [HttpGet, Route("")]
        public IHttpActionResult Get()
        {
            return Ok(OperativoData.Listar());
        }

        [HttpGet, Route("{id}")]
        public IHttpActionResult Get(string id)
        {
            var op = OperativoData.Obtener(id);
            if (op == null) return NotFound();
            return Ok(op);
        }

        [HttpPost, Route("")]
        public IHttpActionResult Post(Operativo o)
        {
            try
            {
                if (!Validar(o)) return BadRequest("Todos los campos son obligatorios.");

                bool ok = OperativoData.Guardar(o);
                return ok ? (IHttpActionResult)Ok(new { success = true })
                          : BadRequest("No se pudo guardar.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut, Route("{id}")]
        public IHttpActionResult Put(string id, Operativo o)
        {
            if (id != o.codOperativo) return BadRequest("El ID no coincide.");

            try
            {
                if (!Validar(o)) return BadRequest("Todos los campos son obligatorios.");

                bool ok = OperativoData.Editar(o);
                return ok ? (IHttpActionResult)Ok(new { success = true })
                          : BadRequest("No se pudo actualizar.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete, Route("{id}")]
        public IHttpActionResult Delete(string id)
        {
            bool ok = OperativoData.Eliminar(id);
            return ok ? (IHttpActionResult)Ok(new { success = true })
                      : BadRequest("No se pudo eliminar.");
        }

        private bool Validar(Operativo o)
        {
            return !(string.IsNullOrWhiteSpace(o.codOperativo) ||
                     string.IsNullOrWhiteSpace(o.nombreOperativo) ||
                     string.IsNullOrWhiteSpace(o.contrasena) ||
                     string.IsNullOrWhiteSpace(o.tipo_usuario));
        }
    }
}
