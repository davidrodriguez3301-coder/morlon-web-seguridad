using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using Newtonsoft.Json;

namespace MorlonSeguridad
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // ============================================================
            // 🌍 HABILITAR CORS GLOBALMENTE
            // ============================================================
            var cors = new EnableCorsAttribute("*", "*", "*");
            config.EnableCors(cors);

            // ============================================================
            // ⚙️ CONFIGURAR RUTAS
            // ============================================================
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            // ============================================================
            // ✅ FORZAR RESPUESTAS EN JSON (Y ELIMINAR XML)
            // ============================================================
            // Quita el formateador XML para evitar errores de serialización
            config.Formatters.Remove(config.Formatters.XmlFormatter);

            // Configura el formateador JSON como predeterminado
            config.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling =
                ReferenceLoopHandling.Ignore;
            config.Formatters.JsonFormatter.SerializerSettings.Formatting =
                Formatting.Indented; // (opcional, hace más legible el JSON)

            // Establece el tipo de contenido predeterminado
            config.Formatters.JsonFormatter.SupportedMediaTypes
                .Add(new System.Net.Http.Headers.MediaTypeHeaderValue("application/json"));
        }
    }
}
