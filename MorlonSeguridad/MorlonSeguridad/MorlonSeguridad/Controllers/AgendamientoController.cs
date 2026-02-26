using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MorlonSeguridad.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class AgendamientoController : ApiController
    {
        // ============================================================
        // 🔹 OBTENER LISTA DE AGENDAMIENTOS POR CLIENTE
        // ============================================================
        [HttpGet]
        public IHttpActionResult Get(string idCliente)
        {
            if (string.IsNullOrEmpty(idCliente))
                return BadRequest("Debe especificar un idCliente.");

            try
            {
                List<Agendamiento> lista = AgendamientoData.ListarPorCliente(idCliente);
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = "Error al obtener agendamientos: " + ex.Message
                });
            }
        }

        // ============================================================
        // 🔹 CREAR NUEVO AGENDAMIENTO (Y GENERAR SUS DÍAS)
        // ============================================================
        [HttpPost]
        public IHttpActionResult Crear([FromBody] Agendamiento a)
        {
            if (a == null || string.IsNullOrEmpty(a.idCliente))
                return BadRequest("Datos incompletos.");

            try
            {
                // 1️⃣ Crear cabecera del agendamiento (SP_CREAR_Agendamiento)
                int id = AgendamientoData.CrearAgendamiento(a.idCliente, a.mes, a.anio);

                if (id > 0)
                {
                    // 2️⃣ Generar los días del mes (SP_GENERAR_DetalleAgendamiento)
                    DetalleAgendamientoData.GenerarDetalle(id, a.mes, a.anio);

                    // 3️⃣ Verificar estado general (SP_VERIFICAR_Completado)
                    DetalleAgendamientoData.VerificarCompletadoAgendamiento(id);

                    // 4️⃣ Responder al frontend
                    return Ok(new
                    {
                        success = true,
                        idAgendamiento = id,
                        message = "Agendamiento generado correctamente con sus días."
                    });
                }
                else
                {
                    return Ok(new
                    {
                        success = false,
                        message = "No se pudo crear el agendamiento (verifique los datos)."
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = "Error al crear agendamiento: " + ex.Message
                });
            }
        }

        // ============================================================
        // 🔹 ELIMINAR UN AGENDAMIENTO (opcional, para mantenimiento)
        // ============================================================
        [HttpDelete]
        public IHttpActionResult Eliminar(int idAgendamiento)
        {
            try
            {
                bool eliminado = AgendamientoData.EliminarAgendamiento(idAgendamiento);
                return Ok(new
                {
                    success = eliminado,
                    message = eliminado
                        ? "Agendamiento eliminado correctamente."
                        : "No se pudo eliminar el agendamiento."
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = "Error al eliminar agendamiento: " + ex.Message
                });
            }
        }
    }
}
