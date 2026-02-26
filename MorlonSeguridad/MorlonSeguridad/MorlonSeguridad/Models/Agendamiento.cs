using System;

namespace MorlonSeguridad.Models
{
    public class Agendamiento
    {
        public int idAgendamiento { get; set; }
        public string idCliente { get; set; }
        public short mes { get; set; }
        public short anio { get; set; }
        public string estado { get; set; }
        public DateTime fecha_creacion { get; set; }
    }
}