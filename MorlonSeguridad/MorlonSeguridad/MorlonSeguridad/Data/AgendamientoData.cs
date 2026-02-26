using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using MorlonSeguridad.Models;

namespace MorlonSeguridad.Data
{
    public class AgendamientoData
    {
        // Crear agendamiento
        public static int CrearAgendamiento(string idCliente, short mes, short anio)
        {
            int nuevoId = 0;
            using (SqlConnection con = ConexionBD.ObtenerConexion())
            {
                string sql = @"INSERT INTO Agendamiento (idCliente, mes, anio)
                               OUTPUT INSERTED.idAgendamiento
                               VALUES (@idCliente, @mes, @anio)";
                using (SqlCommand cmd = new SqlCommand(sql, con))
                {
                    cmd.Parameters.AddWithValue("@idCliente", idCliente);
                    cmd.Parameters.AddWithValue("@mes", mes);
                    cmd.Parameters.AddWithValue("@anio", anio);
                    nuevoId = Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
            return nuevoId;
        }

        // Listar agendamientos por cliente
        public static List<Agendamiento> ListarPorCliente(string idCliente)
        {
            List<Agendamiento> lista = new List<Agendamiento>();
            ConexionBD obj = new ConexionBD();
            string sql = $"EXECUTE usp_listar_AgendamientoPorCliente '{idCliente}'";

            if (obj.Consultar(sql, false))
            {
                SqlDataReader dr = obj.Reader;
                while (dr.Read())
                {
                    lista.Add(new Agendamiento
                    {
                        idAgendamiento = Convert.ToInt32(dr["idAgendamiento"]),
                        idCliente = dr["idCliente"].ToString(),
                        mes = Convert.ToInt16(dr["mes"]),
                        anio = Convert.ToInt16(dr["anio"]),
                        estado = dr["estado"].ToString(),
                        fecha_creacion = Convert.ToDateTime(dr["fecha_creacion"])
                    });
                }
            }
            return lista;
        }
        // ============================================================
        // ?? ELIMINAR AGENDAMIENTO POR ID
        // ============================================================
        public static bool EliminarAgendamiento(int idAgendamiento)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                {
                    // Primero elimina los detalles asociados (por seguridad referencial)
                    SqlCommand cmdDetalle = new SqlCommand("DELETE FROM DetalleAgendamiento WHERE idAgendamiento = @id", con);
                    cmdDetalle.Parameters.AddWithValue("@id", idAgendamiento);
                    cmdDetalle.ExecuteNonQuery();

                    // Luego elimina el agendamiento principal
                    SqlCommand cmd = new SqlCommand("DELETE FROM Agendamiento WHERE idAgendamiento = @id", con);
                    cmd.Parameters.AddWithValue("@id", idAgendamiento);
                    int filas = cmd.ExecuteNonQuery();

                    return filas > 0;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al eliminar agendamiento: " + ex.Message);
                return false;
            }
        }


    }
}
