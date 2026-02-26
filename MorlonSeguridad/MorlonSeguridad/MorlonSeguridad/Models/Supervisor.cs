using System;

namespace MorlonSeguridad.Models
{
    public class Supervisor
    {
        public string idSupervisor { get; set; }
        public string nombres_apellidos { get; set; }
        public string cedula { get; set; }

        public int idEPS { get; set; }
        public int idARL { get; set; }
        public int idTipoContrato { get; set; }

        public string cel1 { get; set; }
        public string cel2 { get; set; }
        public string rh { get; set; }
        public string email { get; set; }

        public string IdZonas { get; set; }
        public string codOperativo { get; set; }

        public byte[] fotografia { get; set; }

        // AUDITORÍA DE CREACIÓN
        public string creado_por_codigo { get; set; }
        public string creado_por_nombre { get; set; }

        // AUDITORÍA DE ELIMINACIÓN
        public string eliminado_por_codigo { get; set; }
        public string eliminado_por_nombre { get; set; }
        public DateTime? fecha_eliminado { get; set; }

        // Campos decorativos
        public string nombreEPS { get; set; }
        public string nombreARL { get; set; }
        public string nombreTipoContrato { get; set; }
        public string nombreZona { get; set; }
    }

}
