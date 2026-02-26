using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MorlonSeguridad.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ClienteController : ApiController
    {
        // ============================================================
        // 🔹 Listar todos los clientes
        // ============================================================
        [HttpGet]
        public IHttpActionResult Get()
        {
            var lista = ClienteData.Listar();
            if (lista == null || lista.Count == 0)
                return Ok(new { success = false, message = "No se encontraron clientes." });

            return Ok(lista);
        }

        // ============================================================
        // 🔹 Obtener cliente por ID
        // ============================================================
        [HttpGet]
        public IHttpActionResult Get(string id)
        {
            var lista = ClienteData.Obtener(id);
            if (lista == null || lista.Count == 0)
                return Ok(new { success = false, message = "Cliente no encontrado." });

            return Ok(lista[0]);
        }

        // ============================================================
        // 🔹 Registrar cliente
        // ============================================================
        [HttpPost]
        public IHttpActionResult Post([FromBody] Cliente oCliente)
        {
            bool exito = ClienteData.registrarCliente(oCliente);
            return Ok(new { success = exito, message = exito ? "Cliente registrado correctamente." : "Error al registrar cliente." });
        }

        // ============================================================
        // 🔹 Actualizar cliente
        // ============================================================
        [HttpPut]
        public IHttpActionResult Put([FromBody] Cliente oCliente)
        {
            bool exito = ClienteData.actualizarCliente(oCliente);
            return Ok(new { success = exito, message = exito ? "Cliente actualizado correctamente." : "Error al actualizar cliente." });
        }

        // ============================================================
        // 🔹 Eliminar cliente
        // ============================================================
        [HttpDelete]
        public IHttpActionResult Delete(string id)
        {
            bool exito = ClienteData.eliminarCliente(id);
            return Ok(new { success = exito, message = exito ? "Cliente eliminado correctamente." : "Error al eliminar cliente." });
        }
    }
}
