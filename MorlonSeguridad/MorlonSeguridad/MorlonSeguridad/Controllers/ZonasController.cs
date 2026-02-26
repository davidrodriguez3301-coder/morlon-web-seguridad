using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MorlonSeguridad.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ZonasController : ApiController
    {
        // ===============================
        // 📋 LISTAR TODAS LAS ZONAS
        // ===============================
        [HttpGet]
        public IHttpActionResult Get()
        {
            try
            {
                var zonas = ZonasData.Listar();
                return Ok(zonas);
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        // ===============================
        // 🔍 OBTENER ZONA POR ID
        // ===============================
        [HttpGet]
        public IHttpActionResult Get(string id)
        {
            try
            {
                var zonas = ZonasData.Obtener(id);
                return Ok(zonas);
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        // ===============================
        // 🟢 CREAR ZONA
        // ===============================
        [HttpPost]
        public IHttpActionResult Post([FromBody] Zonas zona)
        {
            if (zona == null || string.IsNullOrWhiteSpace(zona.nombre_zona))
                return BadRequest("Debe ingresar el nombre de la zona.");

            string nuevoId = ZonasData.registrarZonas(zona);
            if (!string.IsNullOrEmpty(nuevoId))
            {
                return Ok(new
                {
                    success = true,
                    message = "Zona registrada correctamente.",
                    idGenerado = nuevoId
                });
            }
            else
            {
                return Ok(new
                {
                    success = false,
                    message = "Error al registrar zona."
                });
            }
        }


        // ===============================
        // 🟡 ACTUALIZAR ZONA
        // ===============================
        [HttpPut]
        public IHttpActionResult Put([FromBody] Zonas zona)
        {
            if (zona == null)
                return BadRequest("Datos incompletos.");

            bool ok = ZonasData.actualizarZonas(zona);
            return Ok(new
            {
                success = ok,
                message = ok ? "Zona actualizada correctamente." : "Error al actualizar zona."
            });
        }

        // ===============================
        // 🔴 ELIMINAR ZONA
        // ===============================
        [HttpDelete]
        public IHttpActionResult Delete(string id)
        {
            bool ok = ZonasData.eliminarZonas(id);
            return Ok(new
            {
                success = ok,
                message = ok ? "Zona eliminada correctamente." : "Error al eliminar zona."
            });
        }
    }
}
