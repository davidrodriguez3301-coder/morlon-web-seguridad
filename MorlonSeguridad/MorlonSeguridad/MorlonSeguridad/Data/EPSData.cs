using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using MorlonSeguridad.Models;

namespace MorlonSeguridad.Data
{
    public class EPSData
    {
        // 🟢 INSERTAR EPS
        public static int InsertarEPS(EPS eps)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_INSERTAR_EPS", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@nombre_eps", eps.nombre_eps);
                    var idGenerado = cmd.ExecuteScalar();
                    return Convert.ToInt32(idGenerado);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al insertar EPS: " + ex.Message);
                return 0;
            }
        }

        // 🟡 ACTUALIZAR EPS
        public static bool ActualizarEPS(EPS eps)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_ACTUALIZAR_EPS", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@idEPS", eps.idEPS);
                    cmd.Parameters.AddWithValue("@nombre_eps", eps.nombre_eps);
                    cmd.ExecuteNonQuery();
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al actualizar EPS: " + ex.Message);
                return false;
            }
        }

        // 🔴 ELIMINAR EPS
        public static bool EliminarEPS(int idEPS)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_ELIMINAR_EPS", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@idEPS", idEPS);
                    cmd.ExecuteNonQuery();
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al eliminar EPS: " + ex.Message);
                return false;
            }
        }

        // 📋 LISTAR TODAS LAS EPS
        public static List<EPS> ListarEPS()
        {
            var lista = new List<EPS>();
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("USP_LISTAR_EPS", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            lista.Add(new EPS
                            {
                                idEPS = Convert.ToInt32(dr["idEPS"]),
                                nombre_eps = dr["nombre_eps"].ToString(),
                                fecha_creacion = Convert.ToDateTime(dr["fecha_creacion"]).ToString("yyyy-MM-dd")
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al listar EPS: " + ex.Message);
            }
            return lista;
        }
    }
}
