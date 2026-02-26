using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace MorlonSeguridad.Data
{
    public class ZonasData
    {
        // ===============================
        // 🟢 INSERTAR ZONA
        // ===============================
        public static string registrarZonas(Zonas zona)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_INSERTAR_Zonas", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@nombre_zona", zona.nombre_zona);

                    // Capturar el nuevo ID generado
                    var nuevoId = cmd.ExecuteScalar()?.ToString();
                    return nuevoId ?? "";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al registrar zona: " + ex.Message);
                return "";
            }
        }


        // ===============================
        // 🟡 ACTUALIZAR ZONA
        // ===============================
        public static bool actualizarZonas(Zonas zona)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_ACTUALIZAR_Zonas", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@IdZonas", zona.IdZonas);
                    cmd.Parameters.AddWithValue("@nombre_zona", zona.nombre_zona);
                    cmd.ExecuteNonQuery();
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al actualizar zona: " + ex.Message);
                return false;
            }
        }

        // ===============================
        // 🔴 ELIMINAR ZONA
        // ===============================
        public static bool eliminarZonas(string IdZonas)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_ELIMINAR_Zonas", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@IdZonas", IdZonas);
                    cmd.ExecuteNonQuery();
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al eliminar zona: " + ex.Message);
                return false;
            }
        }

        // ===============================
        // 📋 LISTAR TODAS LAS ZONAS
        // ===============================
        public static List<Zonas> Listar()
        {
            var lista = new List<Zonas>();
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("listar_Zonas", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            lista.Add(new Zonas
                            {
                                IdZonas = dr["IdZonas"].ToString(),
                                nombre_zona = dr["nombre_zona"].ToString()
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al listar zonas: " + ex.Message);
            }
            return lista;
        }

        // ===============================
        // 🔍 OBTENER ZONA POR ID
        // ===============================
        public static List<Zonas> Obtener(string id)
        {
            var lista = new List<Zonas>();
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("Obtener_Zonas", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@IdZonas", id);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            lista.Add(new Zonas
                            {
                                IdZonas = dr["IdZonas"].ToString(),
                                nombre_zona = dr["nombre_zona"].ToString()
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al obtener zona: " + ex.Message);
            }
            return lista;
        }
    }
}
