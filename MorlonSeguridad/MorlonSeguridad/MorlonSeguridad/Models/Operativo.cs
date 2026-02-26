using Newtonsoft.Json;

namespace MorlonSeguridad.Models
{
    public class Operativo
    {
        public string codOperativo { get; set; }
        public string nombreOperativo { get; set; }

        [JsonProperty("contraseña")]
        public string contrasena { get; set; }

        public string tipo_usuario { get; set; }
    }
}
