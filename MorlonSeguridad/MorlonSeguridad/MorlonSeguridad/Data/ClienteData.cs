using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace MorlonSeguridad.Data
{
    public class ClienteData
    {
        // ============================================================
        // 🔹 Registrar cliente (ID autogenerado en SQL)
        // ============================================================
        public static bool registrarCliente(Cliente oCliente)
        {
            ConexionBD objEst = new ConexionBD();
            string sentencia =
                "EXECUTE SP_INSERTAR_Cliente '" +
                oCliente.nombre_cliente + "','" +
                oCliente.contacto + "','" +
                oCliente.direccion + "','" +
                oCliente.radio + "','" +
                oCliente.codigo_omega + "','" +
                oCliente.servicio + "','" +
                oCliente.jornada + "','" +
                oCliente.IdZonas + "'";

            bool exito = objEst.EjecutarSentencia(sentencia, false);
            objEst = null;
            return exito;
        }

        // ============================================================
        // 🔹 Actualizar cliente
        // ============================================================
        public static bool actualizarCliente(Cliente oCliente)
        {
            ConexionBD objEst = new ConexionBD();
            string sentencia =
                "EXECUTE SP_ACTUALIZAR_Cliente '" +
                oCliente.idCliente + "','" +
                oCliente.nombre_cliente + "','" +
                oCliente.contacto + "','" +
                oCliente.direccion + "','" +
                oCliente.radio + "','" +
                oCliente.codigo_omega + "','" +
                oCliente.servicio + "','" +
                oCliente.jornada + "','" +
                oCliente.IdZonas + "'";

            bool exito = objEst.EjecutarSentencia(sentencia, false);
            objEst = null;
            return exito;
        }

        // ============================================================
        // 🔹 Eliminar cliente
        // ============================================================
        public static bool eliminarCliente(string idCliente)
        {
            ConexionBD objEst = new ConexionBD();
            string sentencia = "EXECUTE SP_ELIMINAR_Cliente '" + idCliente + "'";
            bool exito = objEst.EjecutarSentencia(sentencia, false);
            objEst = null;
            return exito;
        }

        // ============================================================
        // 🔹 Listar todos los clientes (con nombre de zona)
        // ============================================================
        public static List<Cliente> Listar()
        {
            List<Cliente> lista = new List<Cliente>();
            ConexionBD objEst = new ConexionBD();
            string sql = "EXECUTE listar_Cliente";

            if (objEst.Consultar(sql, false))
            {
                SqlDataReader dr = objEst.Reader;
                while (dr.Read())
                {
                    lista.Add(new Cliente()
                    {
                        idCliente = dr["idCliente"].ToString(),
                        nombre_cliente = dr["nombre_cliente"].ToString(),
                        contacto = dr["contacto"].ToString(),
                        direccion = dr["direccion"].ToString(),
                        radio = dr["radio"].ToString(),
                        codigo_omega = dr["codigo_omega"].ToString(),
                        servicio = dr["servicio"].ToString(),
                        jornada = dr["jornada"] == DBNull.Value ? "" : dr["jornada"].ToString(),
                        IdZonas = dr["IdZonas"].ToString(),
                        nombre_zona = dr["nombre_zona"] == DBNull.Value ? "" : dr["nombre_zona"].ToString()

                    });
                }
            }
            return lista;
        }

        // ============================================================
        // 🔹 Obtener cliente por ID
        // ============================================================
        
        public static List<Cliente> Obtener(string id)
        {
            List<Cliente> lista = new List<Cliente>();
            ConexionBD objEst = new ConexionBD();
            string sql = "EXECUTE Obtener_Cliente '" + id + "'";

            if (objEst.Consultar(sql, false))
            {
                SqlDataReader dr = objEst.Reader;
                while (dr.Read())
                {
                    lista.Add(new Cliente()
                    {
                        idCliente = dr["idCliente"].ToString(),
                        nombre_cliente = dr["nombre_cliente"].ToString(),
                        contacto = dr["contacto"].ToString(),
                        direccion = dr["direccion"].ToString(),
                        radio = dr["radio"].ToString(),
                        codigo_omega = dr["codigo_omega"].ToString(),
                        servicio = dr["servicio"].ToString(),
                        jornada = dr["jornada"] == DBNull.Value ? "" : dr["jornada"].ToString(),
                        IdZonas = dr["IdZonas"].ToString(),
                        nombre_zona = dr["nombre_zona"] == DBNull.Value ? "" : dr["nombre_zona"].ToString()

                    });
                }
            }
            return lista;
        }
    }
}
