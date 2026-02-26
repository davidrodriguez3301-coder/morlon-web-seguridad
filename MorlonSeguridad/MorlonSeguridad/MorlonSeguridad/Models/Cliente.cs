using System;

namespace MorlonSeguridad.Models
{
    public class Cliente
    {
        public string idCliente { get; set; }
        public string nombre_cliente { get; set; }
        public string contacto { get; set; }
        public string direccion { get; set; }
        public string radio { get; set; }
        public string codigo_omega { get; set; }
        public string servicio { get; set; }
        public string jornada { get; set; }     // Jornada contratada (Diurna, Nocturna, etc.)
        public string IdZonas { get; set; }       // FK hacia Zonas
        public string nombre_zona { get; set; }   // Para mostrar el nombre de la zona
    }
}
