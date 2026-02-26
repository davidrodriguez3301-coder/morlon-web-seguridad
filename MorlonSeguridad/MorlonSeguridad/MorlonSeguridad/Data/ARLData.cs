using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using MorlonSeguridad.Models;

namespace MorlonSeguridad.Data
{
    public class ARLData
    {
        // 🟢 INSERTAR ARL
        public static int InsertarARL(ARL arl)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_INSERTAR_ARL", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@nombre_arl", arl.nombre_arl);
                    var id = cmd.ExecuteScalar();
                    return Convert.ToInt32(id);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al insertar ARL: " + ex.Message);
                return 0;
            }
        }

        // 🟡 ACTUALIZAR ARL
        public static bool ActualizarARL(ARL arl)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_ACTUALIZAR_ARL", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@idARL", arl.idARL);
                    cmd.Parameters.AddWithValue("@nombre_arl", arl.nombre_arl);
                    cmd.ExecuteNonQuery();
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al actualizar ARL: " + ex.Message);
                return false;
            }
        }

        // 🔴 ELIMINAR ARL
        public static bool EliminarARL(int idARL)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_ELIMINAR_ARL", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@idARL", idARL);
                    cmd.ExecuteNonQuery();
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al eliminar ARL: " + ex.Message);
                return false;
            }
        }

        // 📋 LISTAR ARL
        public static List<ARL> ListarARL()
        {
            var lista = new List<ARL>();
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("USP_LISTAR_ARL", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    using (var dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            lista.Add(new ARL
                            {
                                idARL = Convert.ToInt32(dr["idARL"]),
                                nombre_arl = dr["nombre_arl"].ToString(),
                                fecha_creacion = Convert.ToDateTime(dr["fecha_creacion"]).ToString("yyyy-MM-dd")
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al listar ARL: " + ex.Message);
            }
            return lista;
        }
    }
}
