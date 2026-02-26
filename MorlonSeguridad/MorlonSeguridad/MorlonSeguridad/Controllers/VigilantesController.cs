using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Web.Http;
using MorlonSeguridad.Data;
using MorlonSeguridad.Models;

namespace MorlonSeguridad.Controllers
{
    [RoutePrefix("api/Vigilantes")]
    public class VigilantesController : ApiController
    {
        // ============================================================
        // 🔹 LISTAR TODOS LOS VIGILANTES (para compatibilidad con frontend)
        // ============================================================
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetTodos()
        {
            try
            {
                var lista = VigilantesData.ListarActivos(); // o combinar activos + inactivos si prefieres
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return BadRequest("Error al listar vigilantes: " + ex.Message);
            }
        }

        // ============================================================
        // 🔹 LISTAR VIGILANTES ACTIVOS
        // ============================================================
        [HttpGet]
        [Route("activos")]
        public IHttpActionResult GetActivos()
        {
            try
            {
                var lista = VigilantesData.ListarActivos();
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return BadRequest("Error al listar vigilantes activos: " + ex.Message);
            }
        }

        // ============================================================
        // 🔹 LISTAR VIGILANTES INACTIVOS
        // ============================================================
        [HttpGet]
        [Route("inactivos")]
        public IHttpActionResult GetInactivos()
        {
            try
            {
                var lista = VigilantesData.ListarInactivos();
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return BadRequest("Error al listar vigilantes inactivos: " + ex.Message);
            }
        }

        // ============================================================
        // 🔹 OBTENER UN VIGILANTE POR ID
        // ============================================================
        [HttpGet]
        [Route("{id}")]
        public IHttpActionResult GetById(string id)
        {
            try
            {
                var v = VigilantesData.Obtener(id);
                if (v == null)
                    return NotFound();

                return Ok(v);
            }
            catch (Exception ex)
            {
                return BadRequest("Error al obtener el vigilante: " + ex.Message);
            }
        }

        // ============================================================
        // 🔹 INSERTAR NUEVO VIGILANTE
        // ============================================================

        // ============================================================
        // 🔹 INSERTAR NUEVO VIGILANTE (versión reforzada)
        // ============================================================
        [HttpPost]
        [Route("")]
        public IHttpActionResult Insertar([FromBody] Vigilantes v)
        {
            if (v == null)
                return BadRequest("Datos no válidos para insertar el vigilante.");

            try
            {
                // 🧹 Aseguramos que no llegue ID desde el frontend
                if (!string.IsNullOrEmpty(v.idVigilantes))
                {
                    v.idVigilantes = null;
                }

                // 🧹 Limpieza general de espacios en campos críticos
                if (v.cedula != null) v.cedula = v.cedula.Trim();
                if (v.nombre_apellido != null) v.nombre_apellido = v.nombre_apellido.Trim();
                if (v.email != null) v.email = v.email.Trim();
                if (v.cel1 != null) v.cel1 = v.cel1.Trim();
                if (v.cel2 != null) v.cel2 = v.cel2.Trim();
                if (v.rh != null) v.rh = v.rh.Trim();
                if (v.idSupervisor != null) v.idSupervisor = v.idSupervisor.Trim();
                if (v.codOperativo != null) v.codOperativo = v.codOperativo.Trim();

                // ✅ Conversión de Base64 (solo si realmente es texto)
                try
                {
                    if (v.fotografia != null && v.fotografia.Length > 0)
                    {
                        // Si viene como texto base64 (por ejemplo "iVBORw0K..."), convertir a bytes
                        string posibleTexto = System.Text.Encoding.UTF8.GetString(v.fotografia);
                        if (!string.IsNullOrWhiteSpace(posibleTexto) && (posibleTexto.StartsWith("/9j") || posibleTexto.StartsWith("iV")))
                        {
                            v.fotografia = Convert.FromBase64String(posibleTexto);
                        }
                    }
                    else
                    {
                        v.fotografia = null;
                    }
                }
                catch
                {
                    v.fotografia = null;
                }

                // Ejecutar la inserción en la base de datos
                bool ok = VigilantesData.Registrar(v);

                if (ok)
                    return Ok(new { success = true, message = "✅ Vigilante registrado correctamente." });
                else
                    return BadRequest("⚠️ Error al registrar vigilante (SP o conexión).");
            }
            catch (Exception ex)
            {
                return BadRequest("Error general al registrar vigilante: " + ex.Message);
            }
        }



        // ============================================================
        // 🔹 ACTUALIZAR VIGILANTE
        // ============================================================
        [HttpPut]
        [Route("")]
        public IHttpActionResult Actualizar([FromBody] Vigilantes v)
        {
            if (v == null)
                return BadRequest("Datos no válidos para actualizar el vigilante.");

            Console.WriteLine("=== [DEBUG BACKEND] Datos recibidos en PUT ===");
            Console.WriteLine($"🆔 idVigilantes: {v.idVigilantes}");
            Console.WriteLine($"👤 Nombre: {v.nombre_apellido}");
            Console.WriteLine($"📧 Email: {v.email}");
            Console.WriteLine($"📱 Cel1: {v.cel1}");
            Console.WriteLine($"📱 Cel2: {v.cel2}");

            bool ok = VigilantesData.Actualizar(v);
            return ok ? (IHttpActionResult)Ok("✅ Vigilante actualizado correctamente.")
                      : BadRequest("⚠️ Actualización fallida (SP o conexión).");
        }

        // ============================================================
        // 🔹 CAMBIAR ESTADO (Activo/Inactivo)
        // ============================================================
        // ============================================================
        // 🔹 CAMBIAR ESTADO (versión tipada y 100% compatible con JSON)
        // ============================================================
        public class EstadoRequest
        {
            public string nuevoEstado { get; set; }
        }

        [HttpPut]
        [Route("estado/{id}")]
        public IHttpActionResult CambiarEstado(string id, [FromBody] EstadoRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.nuevoEstado))
                return BadRequest("Debe indicar el nuevo estado ('Activo' o 'Inactivo').");

            string nuevoEstado = req.nuevoEstado.Trim();

            bool ok = VigilantesData.CambiarEstado(id, nuevoEstado);
            if (ok)
            {
                return Ok(new
                {
                    success = true,
                    id,
                    nuevoEstado,
                    message = $"✅ Estado del vigilante actualizado a '{nuevoEstado}'."
                });
            }
            else
            {
                return BadRequest("⚠️ No se pudo cambiar el estado del vigilante.");
            }
        }


        // ============================================================
        // 🔹 OBTENER TIPOS DE CONTRATO (Nuevo endpoint)
        // ============================================================
        [HttpGet]
        [Route("tiposContrato")]
        public IHttpActionResult ObtenerTiposContrato()
        {
            try
            {
                var lista = new List<object>();

                using (var cn = ConexionBD.ObtenerConexion())
                using (var cmd = new SqlCommand("SELECT idTipoContrato, nombreTipo FROM TipoContrato ORDER BY nombreTipo", cn))
                using (var dr = cmd.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        lista.Add(new
                        {
                            idTipoContrato = dr["idTipoContrato"].ToString(),
                            nombreTipo = dr["nombreTipo"].ToString()
                        });
                    }
                }

                return Ok(lista);
            }
            catch (Exception ex)
            {
                return BadRequest("Error al obtener tipos de contrato: " + ex.Message);
            }
        }
    }
}
