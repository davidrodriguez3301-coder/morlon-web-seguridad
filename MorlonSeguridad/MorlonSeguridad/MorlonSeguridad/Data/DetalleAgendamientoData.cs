using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace MorlonSeguridad.Data
{
    public class DetalleAgendamientoData
    {
        // ------------------------------------------------------------
        // 1) Compatibilidad: lista simple de días (sin turnos agregados)
        //    Procedimiento: usp_listar_DetalleAgendamiento
        // ------------------------------------------------------------
        public static List<DetalleAgendamiento> ListarPorAgendamiento(int idAgendamiento)
        {
            var lista = new List<DetalleAgendamiento>();

            using (SqlConnection con = ConexionBD.ObtenerConexion())
            using (SqlCommand cmd = new SqlCommand("usp_listar_DetalleAgendamiento", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@idAgendamiento", idAgendamiento);

                using (var dr = cmd.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        lista.Add(new DetalleAgendamiento
                        {
                            idDetalle = Convert.ToInt32(dr["idDetalle"]),
                            idAgendamiento = Convert.ToInt32(dr["idAgendamiento"]),
                            fecha = Convert.ToDateTime(dr["fecha"]),
                            estado = dr["estado"].ToString()
                        });
                    }
                }
            }

            return lista;
        }

        // ------------------------------------------------------------
        // 2) Lectura enriquecida: días + primer tipo de turno + CSV
        //    Procedimiento: usp_listar_DetalleConTurnos
        // ------------------------------------------------------------
        public static List<DetalleAgendamiento> ListarConTurnos(int idAgendamiento)
        {
            var lista = new List<DetalleAgendamiento>();

            using (SqlConnection con = ConexionBD.ObtenerConexion())
            using (SqlCommand cmd = new SqlCommand("usp_listar_DetalleConTurnos", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@idAgendamiento", idAgendamiento);

                using (var dr = cmd.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        lista.Add(new DetalleAgendamiento
                        {
                            idDetalle = Convert.ToInt32(dr["idDetalle"]),
                            idAgendamiento = Convert.ToInt32(dr["idAgendamiento"]),
                            fecha = Convert.ToDateTime(dr["fecha"]),
                            estado = dr["estado"].ToString(),
                            primer_tipo_turno = dr["primer_tipo_turno"] == DBNull.Value ? null : dr["primer_tipo_turno"].ToString(),
                            turnos_csv = dr["turnos_csv"] == DBNull.Value ? "" : dr["turnos_csv"].ToString(),

                            // 🆕 NUEVO: nombres de los vigilantes asignados
                            vigilantes_csv = dr["vigilantes_csv"] == DBNull.Value ? "" : dr["vigilantes_csv"].ToString()
                        });
                    }
                }
            }

            return lista;
        }

        // ------------------------------------------------------------
        // 3) Generar los días del mes para un agendamiento
        //    Procedimiento: SP_GENERAR_DetalleAgendamiento
        // ------------------------------------------------------------
        public static void GenerarDetalle(int idAgendamiento, int mes, int anio)
        {
            using (SqlConnection con = ConexionBD.ObtenerConexion())
            using (SqlCommand cmd = new SqlCommand("SP_GENERAR_DetalleAgendamiento", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@idAgendamiento", idAgendamiento);
                cmd.Parameters.AddWithValue("@mes", mes);
                cmd.Parameters.AddWithValue("@anio", anio);
                cmd.ExecuteNonQuery();
            }
        }

        // ------------------------------------------------------------
        // 4) Verificar y actualizar el estado de un día puntual
        //    Procedimiento: SP_VERIFICAR_EstadoDetalle
        // ------------------------------------------------------------
        public static void VerificarEstadoDetalle(int idDetalle)
        {
            using (SqlConnection con = ConexionBD.ObtenerConexion())
            using (SqlCommand cmd = new SqlCommand("SP_VERIFICAR_EstadoDetalle", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@idDetalle", idDetalle);
                cmd.ExecuteNonQuery();
            }
        }

        // ------------------------------------------------------------
        // 5) Verificar si un agendamiento quedó completo (todos asignados)
        //    Procedimiento: SP_VERIFICAR_Completado
        // ------------------------------------------------------------
        public static void VerificarCompletadoAgendamiento(int idAgendamiento)
        {
            using (SqlConnection con = ConexionBD.ObtenerConexion())
            using (SqlCommand cmd = new SqlCommand("SP_VERIFICAR_Completado", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@idAgendamiento", idAgendamiento);
                cmd.ExecuteNonQuery();
            }
        }
    }
}
