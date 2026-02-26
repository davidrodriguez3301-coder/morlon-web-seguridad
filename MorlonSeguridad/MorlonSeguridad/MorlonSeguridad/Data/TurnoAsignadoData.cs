using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using MorlonSeguridad.Models;

namespace MorlonSeguridad.Data
{
    public class TurnoAsignadoData
    {
        // ============================================================
        // 🔹 Asignar vigilante a un detalle específico
        // ============================================================
        public static bool AsignarVigilante(int idDetalle, string idVigilante, string tipo_turno)
        {
            using (SqlConnection con = ConexionBD.ObtenerConexion())
            {
                using (SqlCommand cmd = new SqlCommand("SP_ASIGNAR_TURNO_VIGILANTE", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@idDetalle", idDetalle);
                    cmd.Parameters.AddWithValue("@idVigilante", idVigilante);
                    cmd.Parameters.AddWithValue("@tipo_turno", tipo_turno);

                    // ✅ Captura el SELECT @Exito AS Exito
                    object result = cmd.ExecuteScalar();

                    if (result == null)
                        return false;

                    int exito;
                    if (int.TryParse(result.ToString(), out exito))
                        return exito == 1;

                    return false;
                }
            }
        }

        // ============================================================
        // 🔹 OBTENER SERVICIO CONTRATADO SEGÚN UN idDetalle
        // ============================================================
        public static string ObtenerServicioPorDetalle(int idDetalle)
        {
            using (SqlConnection con = ConexionBD.ObtenerConexion())
            using (SqlCommand cmd = new SqlCommand(@"
        SELECT c.servicio
        FROM Cliente c
        INNER JOIN Agendamiento a ON a.idCliente = c.idCliente
        INNER JOIN DetalleAgendamiento d ON d.idAgendamiento = a.idAgendamiento
        WHERE d.idDetalle = @idDetalle", con))
            {
                cmd.Parameters.AddWithValue("@idDetalle", idDetalle);
                object result = cmd.ExecuteScalar();
                return result == null ? "" : result.ToString();
            }
        }

        // ============================================================
        // 🔹 Contar cuántos turnos están asignados para un detalle
        // ============================================================
        public static int ContarTurnosPorDetalle(int idDetalle)
        {
            using (SqlConnection con = ConexionBD.ObtenerConexion())
            {
                SqlCommand cmd = new SqlCommand("SELECT COUNT(*) FROM TurnoAsignado WHERE idDetalle = @idDetalle", con);
                cmd.Parameters.AddWithValue("@idDetalle", idDetalle);
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }
    }
}
