using System;

namespace MorlonSeguridad.Models
{
    public class Vigilantes
    {
        // 🆔 Identificador único del vigilante (autogenerado por SQL)
        public string idVigilantes { get; set; }

        // 👤 Nombre completo
        public string nombre_apellido { get; set; }

        // 🪪 Cédula
        public string cedula { get; set; }

        // 🏥 EPS y ARL
        public string idEPS { get; set; }
        public string idARL { get; set; }

        // 📞 Teléfonos
        public string cel1 { get; set; }
        public string cel2 { get; set; }

        // ⚙️ Contrato
        public string idTipoContrato { get; set; }

        // 🩸 RH
        public string rh { get; set; }

        // ✉️ Correo
        public string email { get; set; }

        // 🧑‍💼 Supervisor y operativo
        public string idSupervisor { get; set; }
        public string codOperativo { get; set; }

        // 🔄 Estado
        public string estado { get; set; }

        // 🖼️ Fotografía (almacenada en VARBINARY en SQL)
        public byte[] fotografia { get; set; }

        public string nombreSupervisor { get; set; }

        public string nombreTipoContrato { get; set; } // texto visible (opcional)

        public string nombreEPS { get; set; }
        public string nombreARL { get; set; }

     

    }
}
