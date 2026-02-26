namespace MorlonSeguridad.Models
{
    public class TurnoAsignado
    {
        public int idTurno { get; set; }
        public int idDetalle { get; set; }
        public string idVigilante { get; set; }
        public string nombreVigilante { get; set; }
        public string tipo_turno { get; set; }
        public string estado { get; set; }
    }
}