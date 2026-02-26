using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using MorlonSeguridad.Models;

namespace MorlonSeguridad.Data
{
    public class SupervisorData
    {
        // ============================================================
        // LISTAR ACTIVOS
        // ============================================================
        public static List<Supervisor> Listar()
        {
            List<Supervisor> lista = new List<Supervisor>();
            ConexionBD obj = new ConexionBD();

            string sql = "EXEC usp_listar_Supervisor";

            if (obj.Consultar(sql, false))
            {
                SqlDataReader dr = obj.Reader;

                while (dr.Read())
                {
                    Supervisor s = new Supervisor
                    {
                        idSupervisor = dr["idSupervisor"].ToString(),
                        nombres_apellidos = dr["nombres_apellidos"].ToString(),
                        cedula = dr["cedula"].ToString(),

                        idEPS = Convert.ToInt32(dr["idEPS"]),
                        nombreEPS = dr["nombreEPS"].ToString(),

                        idARL = Convert.ToInt32(dr["idARL"]),
                        nombreARL = dr["nombreARL"].ToString(),

                        idTipoContrato = Convert.ToInt32(dr["idTipoContrato"]),
                        nombreTipoContrato = dr["nombreTipoContrato"].ToString(),

                        cel1 = dr["cel1"].ToString(),
                        cel2 = dr["cel2"].ToString(),
                        rh = dr["rh"].ToString(),
                        email = dr["email"].ToString(),

                        IdZonas = dr["IdZonas"].ToString(),
                        nombreZona = dr["nombreZona"].ToString(),

                        codOperativo = dr["codOperativo"].ToString(),

                        fotografia = dr["fotografia"] is DBNull ? null : (byte[])dr["fotografia"],

                        creado_por_codigo = dr["creado_por_codigo"]?.ToString(),
                        creado_por_nombre = dr["creado_por_nombre"]?.ToString(),

                        /*estado = "Activo"*/
                    };

                    lista.Add(s);
                }

                obj.CerrarConexion();
            }

            return lista;
        }

        // ============================================================
        // LISTAR ELIMINADOS
        // ============================================================
        public static List<Supervisor> ListarEliminados()
        {
            List<Supervisor> lista = new List<Supervisor>();
            ConexionBD obj = new ConexionBD();

            string sql = "EXEC usp_listar_Supervisores_Eliminados";

            if (obj.Consultar(sql, false))
            {
                SqlDataReader dr = obj.Reader;

                while (dr.Read())
                {
                    Supervisor s = new Supervisor
                    {
                        idSupervisor = dr["idSupervisor"].ToString(),
                        nombres_apellidos = dr["nombres_apellidos"].ToString(),
                        cedula = dr["cedula"].ToString(),

                        idEPS = Convert.ToInt32(dr["idEPS"]),
                        nombreEPS = dr["nombreEPS"]?.ToString(),

                        idARL = Convert.ToInt32(dr["idARL"]),
                        nombreARL = dr["nombreARL"]?.ToString(),

                        idTipoContrato = Convert.ToInt32(dr["idTipoContrato"]),
                        nombreTipoContrato = dr["nombreTipoContrato"]?.ToString(),

                        cel1 = dr["cel1"]?.ToString(),
                        cel2 = dr["cel2"]?.ToString(),
                        rh = dr["rh"]?.ToString(),
                        email = dr["email"]?.ToString(),

                        IdZonas = dr["IdZonas"].ToString(),
                        nombreZona = dr["nombreZona"]?.ToString(),

                        codOperativo = dr["codOperativo"]?.ToString(),
                        fotografia = dr["fotografia"] is DBNull ? null : (byte[])dr["fotografia"],

                        creado_por_codigo = dr["creado_por_codigo"]?.ToString(),
                        creado_por_nombre = dr["creado_por_nombre"]?.ToString(),

                        eliminado_por_codigo = dr["eliminado_por_codigo"]?.ToString(),
                        eliminado_por_nombre = dr["eliminado_por_nombre"]?.ToString(),
                        fecha_eliminado = dr["fecha_eliminado"] is DBNull ? null : (DateTime?)dr["fecha_eliminado"],

                        /*estado = dr["estado"].ToString()*/
                    };

                    lista.Add(s);
                }

                obj.CerrarConexion();
            }

            return lista;
        }

        // ============================================================
        // OBTENER POR ID
        // ============================================================
        public static Supervisor Obtener(string id)
        {
            Supervisor s = null;
            ConexionBD obj = new ConexionBD();

            string sql = $"EXEC usp_obtener_Supervisor '{id}'";

            if (obj.Consultar(sql, false))
            {
                SqlDataReader dr = obj.Reader;

                if (dr.Read())
                {
                    s = new Supervisor
                    {
                        idSupervisor = dr["idSupervisor"].ToString(),
                        nombres_apellidos = dr["nombres_apellidos"].ToString(),
                        cedula = dr["cedula"].ToString(),

                        idEPS = Convert.ToInt32(dr["idEPS"]),
                        nombreEPS = dr["nombreEPS"].ToString(),

                        idARL = Convert.ToInt32(dr["idARL"]),
                        nombreARL = dr["nombreARL"].ToString(),

                        idTipoContrato = Convert.ToInt32(dr["idTipoContrato"]),
                        nombreTipoContrato = dr["nombreTipoContrato"].ToString(),

                        cel1 = dr["cel1"].ToString(),
                        cel2 = dr["cel2"].ToString(),
                        rh = dr["rh"].ToString(),
                        email = dr["email"].ToString(),

                        IdZonas = dr["IdZonas"].ToString(),
                        nombreZona = dr["nombreZona"].ToString(),

                        codOperativo = dr["codOperativo"].ToString(),

                        fotografia = dr["fotografia"] is DBNull ? null : (byte[])dr["fotografia"],

                        creado_por_codigo = dr["creado_por_codigo"]?.ToString(),
                        creado_por_nombre = dr["creado_por_nombre"]?.ToString()
                    };
                }

                obj.CerrarConexion();
            }

            return s;
        }

        // ============================================================
        // INSERTAR
        // ============================================================
        public static string Insertar(Supervisor s)
        {
            string idGenerado = null;

            using (SqlConnection cn = ConexionBD.ObtenerConexion())
            using (SqlCommand cmd = new SqlCommand("SP_INSERTAR_Superviso", cn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@nombres_apellidos", s.nombres_apellidos);
                cmd.Parameters.AddWithValue("@cedula", s.cedula);
                cmd.Parameters.AddWithValue("@idEPS", s.idEPS);
                cmd.Parameters.AddWithValue("@idARL", s.idARL);
                cmd.Parameters.AddWithValue("@idTipoContrato", s.idTipoContrato);

                cmd.Parameters.AddWithValue("@cel1", (object)s.cel1 ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@cel2", (object)s.cel2 ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@rh", (object)s.rh ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@correo", (object)s.email ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@IdZonas", s.IdZonas);
                cmd.Parameters.AddWithValue("@codOperativo", s.codOperativo);

                cmd.Parameters.AddWithValue("@creado_por_codigo", s.creado_por_codigo);
                cmd.Parameters.AddWithValue("@creado_por_nombre", s.creado_por_nombre);

                SqlParameter pFoto = cmd.Parameters.Add("@fotografia", SqlDbType.VarBinary, -1);
                pFoto.Value = (object)s.fotografia ?? DBNull.Value;

                SqlDataReader dr = cmd.ExecuteReader();
                if (dr.Read())
                    idGenerado = dr["nuevoID"].ToString();
            }

            return idGenerado;
        }

        // ============================================================
        // ACTUALIZAR
        // ============================================================
        public static bool Actualizar(Supervisor s)
        {
            using (SqlConnection cn = ConexionBD.ObtenerConexion())
            using (SqlCommand cmd = new SqlCommand("SP_ACTUALIZAR_Supervisor", cn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@idSupervisor", s.idSupervisor);
                cmd.Parameters.AddWithValue("@nombres_apellidos", s.nombres_apellidos);
                cmd.Parameters.AddWithValue("@cedula", s.cedula);

                cmd.Parameters.AddWithValue("@idEPS", s.idEPS);
                cmd.Parameters.AddWithValue("@idARL", s.idARL);
                cmd.Parameters.AddWithValue("@idTipoContrato", s.idTipoContrato);

                cmd.Parameters.AddWithValue("@cel1", (object)s.cel1 ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@cel2", (object)s.cel2 ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@rh", (object)s.rh ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@correo", (object)s.email ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@IdZonas", s.IdZonas);
                cmd.Parameters.AddWithValue("@codOperativo", s.codOperativo);

                SqlParameter pFoto = cmd.Parameters.Add("@fotografia", SqlDbType.VarBinary, -1);
                pFoto.Value = (object)s.fotografia ?? DBNull.Value;

                cmd.ExecuteNonQuery();
            }

            return true;
        }

        // ============================================================
        // ELIMINAR (SOFT DELETE + AUDITORÍA)
        // ============================================================
        public static bool Eliminar(string id, string usuario_codigo, string usuario_nombre)
        {
            try
            {
                ConexionBD obj = new ConexionBD();
                string sql = $"EXEC SP_ELIMINAR_Superviso '{id}', '{usuario_codigo}', '{usuario_nombre}'";

                // Ejecutamos, pero ignoramos el bool de retorno
                obj.EjecutarSentencia(sql, false);
                obj.CerrarConexion();

                // Si no hubo excepción, asumimos éxito
                return true;
            }
            catch (Exception ex)
            {
                // Opcional: loguear el error
                Console.WriteLine("ERROR Eliminar Supervisor: " + ex.Message);
                return false;
            }
        }



    }
}
