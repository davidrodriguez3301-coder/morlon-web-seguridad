using System;

namespace MorlonSeguridad.Models
{
    public class DetalleAgendamiento
    {
        public int idDetalle { get; set; }
        public int idAgendamiento { get; set; }
        public DateTime fecha { get; set; }
        public string estado { get; set; }
        public string turnos { get; set; } // ← NUEVO

        public string primer_tipo_turno { get; set; }
        public string turnos_csv { get; set; }

        public string vigilantes_csv { get; set; }

    }
}