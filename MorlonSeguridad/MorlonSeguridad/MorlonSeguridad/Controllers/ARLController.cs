using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MorlonSeguridad.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/ARL")]
    public class ARLController : ApiController
    {
        [HttpGet, Route("")]
        public IHttpActionResult GetAll()
        {
            return Ok(ARLData.ListarARL());
        }

        [HttpPost, Route("")]
        public IHttpActionResult Post([FromBody] ARL arl)
        {
            if (arl == null || string.IsNullOrWhiteSpace(arl.nombre_arl))
                return BadRequest("Debe ingresar el nombre de la ARL.");

            int id = ARLData.InsertarARL(arl);
            return Ok(new
            {
                success = id > 0,
                idGenerado = id,
                message = id > 0 ? "ARL registrada correctamente." : "Error al registrar ARL."
            });
        }

        [HttpPut, Route("")]
        public IHttpActionResult Put([FromBody] ARL arl)
        {
            if (arl == null || arl.idARL <= 0)
                return BadRequest("Datos incompletos.");

            bool ok = ARLData.ActualizarARL(arl);
            return Ok(new
            {
                success = ok,
                message = ok ? "ARL actualizada correctamente." : "Error al actualizar ARL."
            });
        }

        [HttpDelete, Route("{id}")]
        public IHttpActionResult Delete(int id)
        {
            bool ok = ARLData.EliminarARL(id);
            return Ok(new
            {
                success = ok,
                message = ok ? "ARL eliminada correctamente." : "Error al eliminar ARL."
            });
        }
    }
}
