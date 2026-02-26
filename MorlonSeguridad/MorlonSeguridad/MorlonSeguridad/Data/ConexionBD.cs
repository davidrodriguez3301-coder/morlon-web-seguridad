using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace MorlonSeguridad.Data
{
    public class ConexionBD : IDisposable
    {
        #region "Atributos"
        private string strError;
        private bool blnBDAbierta;
        private string strCadenaCnx;
        private SqlConnection objCnnBD;
        private SqlCommand objCmdBD;
        private SqlDataReader objReader;
        private SqlDataAdapter dapGenerico;
        private DataSet dts;
        private string strVrUnico;
        private SqlParameter objParametro;
        private bool disposed = false; // Para controlar la liberación
        #endregion

        #region "Constructor"
        public ConexionBD()
        {
            objCnnBD = new SqlConnection();
            objCmdBD = new SqlCommand();
            dapGenerico = new SqlDataAdapter();
            strVrUnico = "";
            objParametro = new SqlParameter();
            strError = "";
        }
        #endregion

        #region "Propiedades"
        public SqlDataReader Reader => objReader;
        public DataSet DataSet_Retornado => dts;
        public string Error { get => strError; set => strError = value; }
        public string ValorUnico => strVrUnico;
        #endregion

        #region "Métodos Privados"
        private bool AbrirConexion()
        {
            try
            {
                // ⚙️ Puedes modificar tu cadena de conexión aquí
                strCadenaCnx = "Data Source=JHONGIL;Initial Catalog=bd_morlon_proyecto;Integrated Security=True";

                objCnnBD.ConnectionString = strCadenaCnx;
                objCnnBD.Open();
                blnBDAbierta = true;
                return true;
            }
            catch (Exception ex)
            {
                blnBDAbierta = false;
                strError = "Error al abrir la conexión: " + ex.Message;
                return false;
            }
        }
        #endregion

        #region "Métodos Públicos"
        public bool Consultar(string SentenciaSQL, bool blnCon_Parametros)
        {
            if (string.IsNullOrWhiteSpace(SentenciaSQL))
            {
                strError = "Error en instrucción SQL";
                return false;
            }

            if (!blnBDAbierta && !AbrirConexion())
                return false;

            objCmdBD.Connection = objCnnBD;
            objCmdBD.CommandType = blnCon_Parametros ? CommandType.StoredProcedure : CommandType.Text;
            objCmdBD.CommandText = SentenciaSQL;

            try
            {
                objReader = objCmdBD.ExecuteReader();
                return true;
            }
            catch (Exception ex)
            {
                strError = "Falla al ejecutar comando: " + ex.Message;
                return false;
            }
        }

        public bool EjecutarSentencia(string SentenciaSQL, bool blnCon_Parametros)
        {
            if (string.IsNullOrWhiteSpace(SentenciaSQL))
            {
                strError = "No se ha definido la sentencia a ejecutar.";
                return false;
            }

            if (!blnBDAbierta && !AbrirConexion())
                return false;

            objCmdBD.Connection = objCnnBD;
            objCmdBD.CommandType = blnCon_Parametros ? CommandType.StoredProcedure : CommandType.Text;
            objCmdBD.CommandText = SentenciaSQL;

            try
            {
                objCmdBD.ExecuteNonQuery();
                return true;
            }
            catch (Exception ex)
            {
                strError = "Error al ejecutar instrucción: " + ex.Message;
                return false;
            }
        }

        public bool ConsultarValorUnico(string SentenciaSQL, bool blnCon_Parametros)
        {
            if (string.IsNullOrWhiteSpace(SentenciaSQL))
            {
                strError = "No se ha definido la sentencia a ejecutar.";
                return false;
            }

            if (!blnBDAbierta && !AbrirConexion())
                return false;

            objCmdBD.Connection = objCnnBD;
            objCmdBD.CommandType = blnCon_Parametros ? CommandType.StoredProcedure : CommandType.Text;
            objCmdBD.CommandText = SentenciaSQL;

            try
            {
                strVrUnico = Convert.ToString(objCmdBD.ExecuteScalar());
                return true;
            }
            catch (Exception ex)
            {
                strError = "Error al ejecutar instrucción: " + ex.Message;
                return false;
            }
        }

        public void CerrarConexion()
        {
            try
            {
                objCmdBD = null;
            }
            catch (Exception ex)
            {
                strError = "Falla al limpiar Command: " + ex.Message;
            }

            try
            {
                if (objCnnBD?.State == ConnectionState.Open)
                    objCnnBD.Close();
                objCnnBD = null;
                blnBDAbierta = false;
            }
            catch (Exception ex)
            {
                strError = "Falla al cerrar conexión: " + ex.Message;
            }
        }

        public bool LlenarDataSet(string NombreTabla, string SentenciaSQL, bool blnCon_Parametros)
        {
            if (!blnBDAbierta && !AbrirConexion())
                return false;

            objCmdBD.Connection = objCnnBD;
            objCmdBD.CommandType = blnCon_Parametros ? CommandType.StoredProcedure : CommandType.Text;
            objCmdBD.CommandText = SentenciaSQL;

            try
            {
                dts = new DataSet();
                dapGenerico.SelectCommand = objCmdBD;
                dapGenerico.Fill(dts, NombreTabla);
                return true;
            }
            catch (Exception ex)
            {
                strError = ex.Message;
                return false;
            }
        }

        public bool AgregarParametro(ParameterDirection Direccion, string Nombre_En_SP, SqlDbType TipoDato, Int16 Tamaño, object Valor)
        {
            try
            {
                objParametro.Direction = Direccion;
                objParametro.ParameterName = Nombre_En_SP;
                objParametro.SqlDbType = TipoDato;
                objParametro.Size = Tamaño;
                objParametro.Value = Valor;
                objCmdBD.Parameters.Add(objParametro);
                objParametro = new SqlParameter();
                return true;
            }
            catch (Exception ex)
            {
                strError = ex.Message;
                return false;
            }
        }

        public static SqlConnection ObtenerConexion()
        {
            try
            {
                string cadena = ConfigurationManager.ConnectionStrings["ConexionBD"].ConnectionString;
                SqlConnection conexion = new SqlConnection(cadena);
                conexion.Open();
                return conexion;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener la conexión: " + ex.Message);
            }
        }
        #endregion

        #region "Implementación de IDisposable"
        // Este método permite usar 'using (ConexionBD obj = new ConexionBD()) { ... }'
        public void Dispose()
        {
            if (!disposed)
            {
                CerrarConexion(); // Cierra la conexión activa
                disposed = true;
            }
            GC.SuppressFinalize(this); // Evita que el recolector de basura lo ejecute de nuevo
        }
        #endregion
    }
}
