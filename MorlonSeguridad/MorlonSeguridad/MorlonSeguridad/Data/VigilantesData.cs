using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace MorlonSeguridad.Data
{
    public class VigilantesData
    {
        // ============================================================
        // 🔹 LISTAR VIGILANTES ACTIVOS
        // ============================================================
        public static List<Vigilantes> ListarActivos()
        {
            List<Vigilantes> lista = new List<Vigilantes>();
            ConexionBD obj = new ConexionBD();
            string sql = "EXEC SP_LISTAR_VigilantesActivos";

            if (obj.Consultar(sql, false))
            {
                SqlDataReader dr = obj.Reader;
                while (dr.Read())
                {
                    lista.Add(new Vigilantes
                    {
                        idVigilantes = dr["idVigilantes"].ToString().Trim(),
                        nombre_apellido = dr["nombre_apellido"].ToString(),
                        cedula = dr["cedula"].ToString(),
                        cel1 = dr["cel1"].ToString(),
                        cel2 = dr["cel2"].ToString(),
                        rh = dr["rh"].ToString(),
                        email = dr["email"].ToString(),
                        idSupervisor = dr["idSupervisor"].ToString(),
                        nombreSupervisor = dr["nombreSupervisor"].ToString(),
                        codOperativo = dr["codOperativo"].ToString(),
                        estado = dr["estado"].ToString(),
                        idEPS = dr["idEPS"]?.ToString(),
                        idARL = dr["idARL"]?.ToString(),
                        nombreEPS = dr["nombreEPS"]?.ToString(),
                        nombreARL = dr["nombreARL"]?.ToString(),
                        idTipoContrato = dr["idTipoContrato"]?.ToString(),
                        nombreTipoContrato = dr["tipo_contrato"]?.ToString(),
                        fotografia = dr["fotografia"] == DBNull.Value ? null : (byte[])dr["fotografia"]
                    });
                }
                obj.CerrarConexion();
            }
            return lista;
        }


        // ============================================================
        // 🔹 LISTAR VIGILANTES INACTIVOS
        // ============================================================
        public static List<Vigilantes> ListarInactivos()
        {
            List<Vigilantes> lista = new List<Vigilantes>();
            ConexionBD obj = new ConexionBD();
            string sql = "EXEC SP_LISTAR_VigilantesInactivos";

            if (obj.Consultar(sql, false))
            {
                SqlDataReader dr = obj.Reader;
                while (dr.Read())
                {
                    lista.Add(new Vigilantes
                    {
                        idVigilantes = dr["idVigilantes"].ToString().Trim(),
                        nombre_apellido = dr["nombre_apellido"].ToString(),
                        cedula = dr["cedula"].ToString(),
                        cel1 = dr["cel1"].ToString(),
                        cel2 = dr["cel2"].ToString(),
                        rh = dr["rh"].ToString(),
                        email = dr["email"].ToString(),
                        idSupervisor = dr["idSupervisor"].ToString(),
                        nombreSupervisor = dr["nombreSupervisor"].ToString(),
                        codOperativo = dr["codOperativo"].ToString(),
                        estado = dr["estado"].ToString(),
                        idEPS = dr["idEPS"]?.ToString(),
                        idARL = dr["idARL"]?.ToString(),
                        nombreEPS = dr["nombreEPS"]?.ToString(),
                        nombreARL = dr["nombreARL"]?.ToString(),
                        idTipoContrato = dr["idTipoContrato"]?.ToString(),
                        nombreTipoContrato = dr["tipo_contrato"]?.ToString(),
                        fotografia = dr["fotografia"] == DBNull.Value ? null : (byte[])dr["fotografia"]
                    });
                }
                obj.CerrarConexion();
            }
            return lista;
        }

        // ============================================================
        // 🔹 OBTENER VIGILANTE POR ID
        // ============================================================
        public static Vigilantes Obtener(string id)
        {
            Vigilantes v = null;
            ConexionBD obj = new ConexionBD();
            string sql = $"EXEC SP_OBTENER_Vigilante '{id}'";

            if (obj.Consultar(sql, false))
            {
                SqlDataReader dr = obj.Reader;
                if (dr.Read())
                {
                    v = new Vigilantes
                    {
                        idVigilantes = dr["idVigilantes"].ToString(),
                        nombre_apellido = dr["nombre_apellido"].ToString(),
                        cedula = dr["cedula"].ToString(),
                        cel1 = dr["cel1"].ToString(),
                        cel2 = dr["cel2"].ToString(),
                        idTipoContrato = dr["idTipoContrato"]?.ToString(),
                        nombreTipoContrato = dr["tipo_contrato"]?.ToString(),
                        rh = dr["rh"].ToString(),
                        email = dr["email"].ToString(),
                        idSupervisor = dr["idSupervisor"].ToString(),
                        codOperativo = dr["codOperativo"].ToString(),
                        estado = dr["estado"].ToString(),
                        fotografia = dr["fotografia"] == DBNull.Value ? null : (byte[])dr["fotografia"]
                    };

                    if (ColumnExists(dr, "idEPS"))
                        v.idEPS = dr["idEPS"]?.ToString();
                    if (ColumnExists(dr, "idARL"))
                        v.idARL = dr["idARL"]?.ToString();
                }
                obj.CerrarConexion();
            }
            return v;
        }

        // ============================================================
        // 🔹 REGISTRAR NUEVO VIGILANTE (reforzado)
        // ============================================================
        // ============================================================
        // 🔹 REGISTRAR NUEVO VIGILANTE (corregido para @idTipoContrato INT)
        // ============================================================
        // ============================================================
        // 🔹 REGISTRAR NUEVO VIGILANTE (compatible con C# 7.3)
        // ============================================================


        public static bool Registrar(Vigilantes v)
        {
            try
            {
                using (SqlConnection cn = ConexionBD.ObtenerConexion())
                using (SqlCommand cmd = new SqlCommand("SP_INSERTAR_Vigilantes", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Campos obligatorios
                    cmd.Parameters.AddWithValue("@nombre_apellido", v.nombre_apellido != null ? v.nombre_apellido.Trim() : "");
                    cmd.Parameters.AddWithValue("@cedula", v.cedula != null ? v.cedula.Trim() : "");

                    // EPS
                    SqlParameter pEps = cmd.Parameters.Add("@idEPS", SqlDbType.Int);
                    int eps;
                    if (int.TryParse(v.idEPS, out eps))
                        pEps.Value = eps;
                    else
                        pEps.Value = DBNull.Value;

                    // ARL
                    SqlParameter pArl = cmd.Parameters.Add("@idARL", SqlDbType.Int);
                    int arl;
                    if (int.TryParse(v.idARL, out arl))
                        pArl.Value = arl;
                    else
                        pArl.Value = DBNull.Value;

                    // Tipo de Contrato
                    SqlParameter pTipo = cmd.Parameters.Add("@idTipoContrato", SqlDbType.Int);
                    int tipo;
                    if (int.TryParse(v.idTipoContrato, out tipo))
                        pTipo.Value = tipo;
                    else
                        pTipo.Value = DBNull.Value;

                    // Otros campos opcionales
                    cmd.Parameters.Add("@cel1", SqlDbType.VarChar, 12).Value =
                        !string.IsNullOrWhiteSpace(v.cel1) ? (object)v.cel1.Trim() : DBNull.Value;

                    cmd.Parameters.Add("@cel2", SqlDbType.VarChar, 12).Value =
                        !string.IsNullOrWhiteSpace(v.cel2) ? (object)v.cel2.Trim() : DBNull.Value;

                    cmd.Parameters.Add("@rh", SqlDbType.VarChar, 5).Value =
                        !string.IsNullOrWhiteSpace(v.rh) ? (object)v.rh.Trim() : DBNull.Value;

                    cmd.Parameters.Add("@email", SqlDbType.VarChar, 50).Value =
                        !string.IsNullOrWhiteSpace(v.email) ? (object)v.email.Trim() : DBNull.Value;

                    cmd.Parameters.Add("@idSupervisor", SqlDbType.Char, 6).Value =
                        !string.IsNullOrWhiteSpace(v.idSupervisor) ? (object)v.idSupervisor.Trim() : DBNull.Value;

                    cmd.Parameters.Add("@codOperativo", SqlDbType.VarChar, 15).Value =
                        !string.IsNullOrWhiteSpace(v.codOperativo) ? (object)v.codOperativo.Trim() : DBNull.Value;

                    // Fotografía (varbinary)
                    SqlParameter pFoto = cmd.Parameters.Add("@fotografia", SqlDbType.VarBinary, -1);
                    if (v.fotografia != null && v.fotografia.Length > 0)
                        pFoto.Value = v.fotografia;
                    else
                        pFoto.Value = DBNull.Value;

                    // ============================================================
                    // 🔹 Ejecutar SP y obtener el ID generado
                    // ============================================================
                    object result = cmd.ExecuteScalar();

                    if (result != null)
                    {
                        string nuevoID = result.ToString();
                        Console.WriteLine("✅ Vigilante registrado correctamente con ID: " + nuevoID);
                        return true;
                    }
                    else
                    {
                        Console.WriteLine("⚠️ SP_INSERTAR_Vigilantes ejecutado, pero no devolvió un ID.");
                        return false;
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                Console.WriteLine("⚠️ SQL Error al registrar vigilante: " + sqlEx.Message);
                foreach (SqlError err in sqlEx.Errors)
                {
                    Console.WriteLine($"👉 SQL Error {err.Number} | Línea {err.LineNumber} | {err.Message}");
                }
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Error general al registrar vigilante: " + ex.Message);
                if (ex.InnerException != null)
                    Console.WriteLine("➡️ Inner: " + ex.InnerException.Message);
                return false;
            }
        }




        // ============================================================
        // 🔹 ACTUALIZAR VIGILANTE
        // ============================================================
        public static bool Actualizar(Vigilantes v)
        {
            SqlCommand cmd = null;

            try
            {
                using (SqlConnection cn = ConexionBD.ObtenerConexion())
                {
                    cmd = new SqlCommand("SP_ACTUALIZAR_Vigilantes", cn);
                    cmd.CommandType = CommandType.StoredProcedure;

                    // --- Limpieza de valores ---
                    v.idVigilantes = v.idVigilantes?.Trim();
                    v.nombre_apellido = v.nombre_apellido?.Trim();
                    v.cedula = v.cedula?.Trim();
                    v.email = v.email?.Trim();
                    v.cel1 = v.cel1?.Trim();
                    v.cel2 = v.cel2?.Trim();
                    v.rh = v.rh?.Trim();
                    v.idSupervisor = v.idSupervisor?.Trim();
                    v.codOperativo = v.codOperativo?.Trim();
                    v.estado = string.IsNullOrWhiteSpace(v.estado) ? "Activo" : v.estado.Trim();

                    // --- Asignación de parámetros ---
                    cmd.Parameters.AddWithValue("@idVigilantes", v.idVigilantes ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@nombre_apellido", v.nombre_apellido ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@cedula", v.cedula ?? (object)DBNull.Value);

                    // ✅ EPS y ARL
                    int tmp;
                    SqlParameter pEps = cmd.Parameters.Add("@idEPS", SqlDbType.Int);
                    if (int.TryParse(v.idEPS, out tmp)) pEps.Value = tmp; else pEps.Value = DBNull.Value;

                    SqlParameter pArl = cmd.Parameters.Add("@idARL", SqlDbType.Int);
                    if (int.TryParse(v.idARL, out tmp)) pArl.Value = tmp; else pArl.Value = DBNull.Value;

                    // ✅ Tipo de contrato (INT)
                    SqlParameter pTipo = cmd.Parameters.Add("@idTipoContrato", SqlDbType.Int);
                    if (int.TryParse(v.idTipoContrato, out int tipoID))
                        pTipo.Value = tipoID;
                    else
                        pTipo.Value = DBNull.Value;

                    // Otros campos
                    cmd.Parameters.AddWithValue("@cel1", string.IsNullOrEmpty(v.cel1) ? (object)DBNull.Value : v.cel1);
                    cmd.Parameters.AddWithValue("@cel2", string.IsNullOrEmpty(v.cel2) ? (object)DBNull.Value : v.cel2);
                    cmd.Parameters.AddWithValue("@rh", string.IsNullOrEmpty(v.rh) ? (object)DBNull.Value : v.rh);
                    cmd.Parameters.AddWithValue("@email", string.IsNullOrEmpty(v.email) ? (object)DBNull.Value : v.email);
                    cmd.Parameters.AddWithValue("@idSupervisor", string.IsNullOrEmpty(v.idSupervisor) ? (object)DBNull.Value : v.idSupervisor);
                    cmd.Parameters.AddWithValue("@codOperativo", string.IsNullOrEmpty(v.codOperativo) ? (object)DBNull.Value : v.codOperativo);
                    cmd.Parameters.AddWithValue("@estado", v.estado ?? "Activo");

                    // ✅ Fotografía
                    SqlParameter pFoto = cmd.Parameters.Add("@fotografia", SqlDbType.VarBinary, -1);
                    pFoto.Value = (v.fotografia != null && v.fotografia.Length > 0) ? (object)v.fotografia : DBNull.Value;

                    // --- Ejecutar SP ---
                    cmd.ExecuteNonQuery();
                    cn.Close();
                    return true;
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine("❌ SQL EXCEPTION DETECTADA:");
                foreach (SqlError err in ex.Errors)
                    Console.WriteLine($"👉 SQL Error {err.Number} | Línea {err.LineNumber} | {err.Message}");

                if (cmd != null)
                {
                    Console.WriteLine("==== DEBUG COMANDO ====");
                    Console.WriteLine(cmd.CommandText);
                    foreach (SqlParameter p in cmd.Parameters)
                        Console.WriteLine($"@{p.ParameterName} = {(p.Value == DBNull.Value ? "NULL" : p.Value)}");
                    Console.WriteLine("========================");
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine("⚠️ Error general Actualizar(): " + ex.Message);
                if (ex.InnerException != null)
                    Console.WriteLine("➡️ Inner: " + ex.InnerException.Message);
                return false;
            }
        }




        // ============================================================
        // 🔹 CAMBIAR ESTADO
        // ============================================================
        public static bool CambiarEstado(string id, string nuevoEstado)
        {
            ConexionBD obj = new ConexionBD();
            string sql = $"EXEC SP_CAMBIAR_ESTADO_Vigilantes '{id}', '{nuevoEstado}'";
            bool ok = obj.EjecutarSentencia(sql, false);
            obj.CerrarConexion();
            return ok;
        }

        // ============================================================
        // 🔹 AUXILIAR: VERIFICAR COLUMNA
        // ============================================================
        private static bool ColumnExists(SqlDataReader reader, string columnName)
        {
            for (int i = 0; i < reader.FieldCount; i++)
                if (reader.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            return false;
        }
    }
}

