using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace MorlonSeguridad.Data
{
    public class NovedadesData
    {
        // =========================
        // LISTAR TODAS LAS NOVEDADES
        // =========================
        public static List<Novedades> Listar()
        {
            List<Novedades> lista = new List<Novedades>();
            ConexionBD objCnx = new ConexionBD();

            string sentencia = "EXEC SP_LISTAR_Novedades";

            if (!objCnx.Consultar(sentencia, false))
            {
                // puedes revisar objCnx.Error si quieres loguear
                objCnx.CerrarConexion();
                return lista;
            }

            try
            {
                while (objCnx.Reader.Read())
                {
                    Novedades nov = new Novedades
                    {
                        idNovedad = objCnx.Reader["idNovedad"].ToString().Trim(),
                        nombre_novedad = objCnx.Reader["nombre_novedad"].ToString().Trim(),
                        tipo_de_novedad = objCnx.Reader["tipo_de_novedad"].ToString().Trim(),
                        clave_novedad = objCnx.Reader["clave_novedad"].ToString().Trim()
                    };

                    lista.Add(nov);
                }
            }
            finally
            {
                objCnx.CerrarConexion();
            }

            return lista;
        }

        // =========================
        // OBTENER UNA NOVEDAD POR ID
        // =========================
        public static Novedades obtener(string id)
        {
            Novedades nov = null;
            ConexionBD objCnx = new ConexionBD();

            string sentencia = "EXEC SP_OBTENER_Novedades '" + id + "'";

            if (!objCnx.Consultar(sentencia, false))
            {
                objCnx.CerrarConexion();
                return null;
            }

            try
            {
                if (objCnx.Reader.Read())
                {
                    nov = new Novedades
                    {
                        idNovedad = objCnx.Reader["idNovedad"].ToString().Trim(),
                        nombre_novedad = objCnx.Reader["nombre_novedad"].ToString().Trim(),
                        tipo_de_novedad = objCnx.Reader["tipo_de_novedad"].ToString().Trim(),
                        clave_novedad = objCnx.Reader["clave_novedad"].ToString().Trim()
                    };
                }
            }
            finally
            {
                objCnx.CerrarConexion();
            }

            return nov;
        }

        // =========================
        // INSERTAR NOVEDAD
        // =========================
        public static bool registrar(Novedades oNovedades)
        {
            ConexionBD objCnx = new ConexionBD();

            string sentencia =
                "EXEC SP_INSERTAR_Novedades '" +
                oNovedades.idNovedad + "', '" +
                oNovedades.nombre_novedad + "', '" +
                oNovedades.tipo_de_novedad + "', '" +
                oNovedades.clave_novedad + "'";

            bool ok = objCnx.EjecutarSentencia(sentencia, false);
            objCnx.CerrarConexion();
            return ok;
        }

        // =========================
        // ACTUALIZAR NOVEDAD
        // =========================
        public static bool actualizarNovedades(Novedades oNovedades)
        {
            ConexionBD objCnx = new ConexionBD();

            string sentencia =
                "EXEC SP_ACTUALIZAR_Novedades '" +
                oNovedades.idNovedad + "', '" +
                oNovedades.nombre_novedad + "', '" +
                oNovedades.tipo_de_novedad + "', '" +
                oNovedades.clave_novedad + "'";

            bool ok = objCnx.EjecutarSentencia(sentencia, false);
            objCnx.CerrarConexion();
            return ok;
        }

        // =========================
        // ELIMINAR NOVEDAD
        // =========================
        public static bool eliminarNovedades(string id)
        {
            ConexionBD objCnx = new ConexionBD();

            string sentencia = "EXEC SP_ELIMINAR_Novedades '" + id + "'";

            bool ok = objCnx.EjecutarSentencia(sentencia, false);
            objCnx.CerrarConexion();
            return ok;
        }
    }






}


       
       