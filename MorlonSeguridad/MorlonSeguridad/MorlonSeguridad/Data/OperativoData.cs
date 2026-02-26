using apiwebpractica.Data;
using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web.Services.Description;

namespace MorlonSeguridad.Data
{
    public class OperativoData
    {
        // ============================================================
        // VALIDACIÓN INTERNA DE CAMPOS
        // ============================================================
        private static void ValidarCampos(Operativo o)
        {
            if (string.IsNullOrWhiteSpace(o.codOperativo) ||
                string.IsNullOrWhiteSpace(o.nombreOperativo) ||
                string.IsNullOrWhiteSpace(o.contrasena) ||
                string.IsNullOrWhiteSpace(o.tipo_usuario))
            {
                throw new Exception("Todos los campos de Operativo son obligatorios.");
            }
        }

        // ============================================================
        // LISTAR
        // ============================================================
        public static List<Operativo> Listar()
        {
            var lista = new List<Operativo>();

            using (var cn = ConexionBD.ObtenerConexion())
            using (var cmd = new SqlCommand("usp_listar_Operativo", cn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                using (var dr = cmd.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        lista.Add(new Operativo
                        {
                            codOperativo = dr["codOperativo"].ToString(),
                            nombreOperativo = dr["nombreOperativo"].ToString(),
                            contrasena = dr["contrasena"].ToString(),
                            tipo_usuario = dr["tipo_usuario"].ToString()
                        });
                    }
                }
            }

            return lista;
        }

        // ============================================================
        // OBTENER UNO
        // ============================================================
        public static Operativo Obtener(string cod)
        {
            Operativo op = null;

            using (var cn = ConexionBD.ObtenerConexion())
            using (var cmd = new SqlCommand("usp_obtener_Operativo", cn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@codOperativo", cod);

                using (var dr = cmd.ExecuteReader())
                {
                    if (dr.Read())
                    {
                        op = new Operativo
                        {
                            codOperativo = dr["codOperativo"].ToString(),
                            nombreOperativo = dr["nombreOperativo"].ToString(),
                            contrasena = dr["contrasena"].ToString(),
                            tipo_usuario = dr["tipo_usuario"].ToString()
                        };
                    }
                }
            }

            return op;
        }

        // ============================================================
        // INSERTAR
        // ============================================================
        public static bool Guardar(Operativo o)
        {
            ValidarCampos(o);

            using (var cn = ConexionBD.ObtenerConexion())
            using (var cmd = new SqlCommand("SP_INSERTAR_Operativo", cn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@codOperativo", o.codOperativo);
                cmd.Parameters.AddWithValue("@nombreOperativo", o.nombreOperativo);

                // Convertir contraseña a SHA-256 correctamente
                string hash = SeguridadUtils.HashSHA256(o.contrasena);
                cmd.Parameters.AddWithValue("@contrasena", hash);

                cmd.Parameters.AddWithValue("@tipo_usuario", o.tipo_usuario);

                // Capturar valor de retorno del SP
                var returnParameter = cmd.Parameters.Add("@ReturnVal", SqlDbType.Int);
                returnParameter.Direction = ParameterDirection.ReturnValue;

                cmd.ExecuteNonQuery();

                int result = (int)returnParameter.Value;

                if (result == 1) return true; // OK
                if (result == 2) throw new Exception("Todos los campos son obligatorios.");
                if (result == 3) throw new Exception("El código del operativo ya existe.");

                throw new Exception("Error desconocido al insertar");
            }
        }


        // ============================================================
        // ACTUALIZAR
        // ============================================================
        public static bool Editar(Operativo o)
        {
            ValidarCampos(o);

            using (var cn = ConexionBD.ObtenerConexion())
            using (var cmd = new SqlCommand("SP_ACTUALIZAR_Operativo", cn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@codOperativo", o.codOperativo);
                cmd.Parameters.AddWithValue("@nombreOperativo", o.nombreOperativo);

                // Convertir contraseña a SHA-256
                string hash = SeguridadUtils.HashSHA256(o.contrasena);
                cmd.Parameters.AddWithValue("@contrasena", hash);

                cmd.Parameters.AddWithValue("@tipo_usuario", o.tipo_usuario);

                // Capturar return value
                var returnParameter = cmd.Parameters.Add("@ReturnVal", SqlDbType.Int);
                returnParameter.Direction = ParameterDirection.ReturnValue;

                cmd.ExecuteNonQuery();

                int result = (int)returnParameter.Value;

                if (result == 1) return true;             // OK
                if (result == 2) throw new Exception("Todos los campos son obligatorios.");
                if (result == 3) throw new Exception("El código del operativo no existe.");

                throw new Exception("Error desconocido al actualizar.");
            }
        }



        // ============================================================
        // ELIMINAR
        // ============================================================
        public static bool Eliminar(string cod)
        {
            using (var cn = ConexionBD.ObtenerConexion())
            using (var cmd = new SqlCommand("SP_ELIMINAR_Operativo", cn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@codOperativo", cod);

                var returnParameter = cmd.Parameters.Add("@ReturnVal", SqlDbType.Int);
                returnParameter.Direction = ParameterDirection.ReturnValue;

                cmd.ExecuteNonQuery();
                int result = (int)returnParameter.Value;

                if (result == 1) return true; // OK
                if (result == 2) throw new Exception("El código del operativo está vacío.");
                if (result == 3) throw new Exception("El operativo no existe.");
                if (result == 4) throw new Exception("No se puede eliminar el operativo general OP0000.");

                throw new Exception("Error desconocido al eliminar.");
            }
        }


        // ============================================================
        // VALIDAR LOGIN
        // ============================================================
        public static OperativoLogin ValidarOperativo(string codOperativo, string contraseña)
        {
            try
            {
                using (SqlConnection con = ConexionBD.ObtenerConexion())
                {
                    SqlCommand cmd = new SqlCommand("sp_ValidarOperativo", con);
                    cmd.CommandType = CommandType.StoredProcedure;

                    string hash = SeguridadUtils.HashSHA256(contraseña);

                    cmd.Parameters.AddWithValue("@codOperativo", codOperativo);
                    cmd.Parameters.AddWithValue("@hash", hash);

                    SqlDataReader dr = cmd.ExecuteReader();
                    if (dr.Read())
                    {
                        return new OperativoLogin
                        {
                            codOperativo = dr["codOperativo"].ToString(),
                            nombreOperativo = dr["nombreOperativo"].ToString(),
                            tipo_usuario = dr["tipo_usuario"].ToString()
                        };
                    }
                    return null;
                }
            }
            catch
            {
                return null;
            }
        }

        public static void RegistrarAuditoria(string usuario, bool exito, string mensaje, string ip)
        {
            using (SqlConnection con = ConexionBD.ObtenerConexion())
            {
                SqlCommand cmd = new SqlCommand("SP_Auditar_Login", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@codOperativo", usuario);
                cmd.Parameters.AddWithValue("@exito", exito);
                cmd.Parameters.AddWithValue("@mensaje", mensaje);
                cmd.Parameters.AddWithValue("@ip", (object)ip ?? DBNull.Value);

                cmd.ExecuteNonQuery();
            }
        }


    }
}
