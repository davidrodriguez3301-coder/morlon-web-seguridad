using System.Web.Http;
using System.Web.Http.Cors;
using MorlonSeguridad.Data;
using MorlonSeguridad.Models;

namespace MorlonSeguridad.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/Supervisor")]
    public class SupervisorController : ApiController
    {
        // ===========================================
        // GET: api/Supervisor
        // ===========================================
        [HttpGet]
        [Route("")]
        public IHttpActionResult Listar()
        {
            var lista = SupervisorData.Listar();
            return Ok(lista);
        }

        // ===========================================
        // GET: api/Supervisor/{id}
        // ===========================================
        [HttpGet]
        [Route("{id}")]
        public IHttpActionResult Obtener(string id)
        {
            var obj = SupervisorData.Obtener(id);
            if (obj == null)
                return Ok(new { success = false, message = "Supervisor no encontrado." });

            return Ok(obj);
        }

        // ===========================================
        // POST: api/Supervisor
        // ===========================================
        [HttpPost]
        [Route("")]
        public IHttpActionResult Insertar([FromBody] Supervisor s)
        {
            string idGenerado = SupervisorData.Insertar(s);

            return Ok(new
            {
                success = idGenerado != null,
                idGenerado = idGenerado,
                message = idGenerado != null
                    ? "Supervisor registrado correctamente."
                    : "Error al registrar supervisor."
            });
        }

        // ===========================================
        // PUT: api/Supervisor
        // ===========================================
        [HttpPut]
        [Route("")]
        public IHttpActionResult Actualizar([FromBody] Supervisor s)
        {
            bool ok = SupervisorData.Actualizar(s);
            return Ok(new
            {
                success = ok,
                message = ok ? "Supervisor actualizado correctamente."
                             : "Error al actualizar supervisor."
            });
        }

        // ===========================================
        // DELETE: api/Supervisor/{id}
        // ===========================================
        [HttpDelete]
        [Route("{id}")]
        public IHttpActionResult Eliminar(
            string id,
            [FromUri] string usuario_codigo = "admin",
            [FromUri] string usuario_nombre = "Administrador")
        {
            bool ok = SupervisorData.Eliminar(id, usuario_codigo, usuario_nombre);

            return Ok(new
            {
                success = ok,
                message = ok ? "Supervisor eliminado correctamente."
                             : "Error al eliminar supervisor."
            });
        }
    }
}
