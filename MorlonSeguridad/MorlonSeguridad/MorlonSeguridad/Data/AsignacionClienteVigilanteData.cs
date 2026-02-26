using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using MorlonSeguridad.Models;

namespace MorlonSeguridad.Data
{
    public class AsignacionClienteVigilanteData
    {
        // ============================================================
        // 🔹 INSERTAR ASIGNACIÓN NUEVA
        // ============================================================
        public static bool Crear(AsignacionClienteVigilante a)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_INSERTAR_AsignacionClienteVigilante", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@idCliente", a.idCliente);
                    cmd.Parameters.AddWithValue("@idVigilante", a.idVigilante);
                    cmd.Parameters.AddWithValue("@idTipoContrato", (object)a.idTipoContrato ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@fecha_inicio", string.IsNullOrEmpty(a.fecha_inicio) ? DateTime.Now : DateTime.Parse(a.fecha_inicio));
                    cmd.Parameters.AddWithValue("@fecha_fin", string.IsNullOrEmpty(a.fecha_fin) ? (object)DBNull.Value : DateTime.Parse(a.fecha_fin));
                    cmd.Parameters.AddWithValue("@observaciones", (object)a.observaciones ?? DBNull.Value);

                    object result = cmd.ExecuteScalar();
                    return result != null && Convert.ToInt32(result) > 0;
                }
            }
            catch (SqlException ex)
            {
                // Captura de error desde el SP (vigilante fijo ocupado)
                if (ex.Message.Contains("ya está asignado"))
                    throw new Exception("❌ El vigilante con contrato Fijo ya tiene una asignación activa.");

                Console.WriteLine("⚠️ SQL Error: " + ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine("⚠️ Error general al crear asignación: " + ex.Message);
                throw;
            }
        }


        // ============================================================
        // 🔹 LISTAR ASIGNACIONES POR CLIENTE
        // ============================================================
        public static List<AsignacionClienteVigilante> ListarPorCliente(string idCliente)
        {
            var lista = new List<AsignacionClienteVigilante>();

            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_LISTAR_AsignacionesPorCliente", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@idCliente", idCliente);

                    using (var dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            lista.Add(new AsignacionClienteVigilante
                            {
                                idAsignacion = Convert.ToInt32(dr["idAsignacion"]),
                                idCliente = dr["idCliente"].ToString(),
                                nombreCliente = dr["nombre_cliente"].ToString(),
                                idVigilante = dr["idVigilante"].ToString(),
                                nombreVigilante = dr["nombreVigilante"].ToString(),
                                idTipoContrato = dr["idTipoContrato"] == DBNull.Value ? null : (int?)Convert.ToInt32(dr["idTipoContrato"]),
                                tipoContrato = dr["tipoContrato"] == DBNull.Value ? "" : dr["tipoContrato"].ToString(),
                                fecha_inicio = Convert.ToDateTime(dr["fecha_inicio"]).ToShortDateString(),
                                fecha_fin = dr["fecha_fin"] == DBNull.Value ? "" : Convert.ToDateTime(dr["fecha_fin"]).ToShortDateString(),
                                observaciones = dr["observaciones"] == DBNull.Value ? "" : dr["observaciones"].ToString(),
                                estado = dr["estado"].ToString()
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("⚠️ Error al listar asignaciones: " + ex.Message);
            }

            return lista;
        }

        // ============================================================
        // 🔹 ELIMINAR ASIGNACIÓN
        // ============================================================
        public static bool Eliminar(int idAsignacion)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("DELETE FROM AsignacionClienteVigilante WHERE idAsignacion = @id", con))
                {
                    cmd.Parameters.AddWithValue("@id", idAsignacion);
                    return cmd.ExecuteNonQuery() > 0;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("⚠️ Error al eliminar asignación: " + ex.Message);
                return false;
            }
        }
    }
}
