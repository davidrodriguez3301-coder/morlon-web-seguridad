using System;

namespace MorlonSeguridad.Models
{
    public class AsignacionClienteVigilante
    {
        public int idAsignacion { get; set; }          // ID autogenerado
        public string idCliente { get; set; }          // FK Cliente
        public string nombreCliente { get; set; }      // Nombre del cliente
        public string idVigilante { get; set; }        // FK Vigilante
        public string nombreVigilante { get; set; }    // Nombre del vigilante
        public int? idTipoContrato { get; set; }       // ID del tipo de contrato
        public string tipoContrato { get; set; }       // Nombre del contrato
        public string fecha_inicio { get; set; }       // Fecha inicio
        public string fecha_fin { get; set; }          // Fecha fin
        public string observaciones { get; set; }      // Comentarios
        public string estado { get; set; }             // Activo/Inactivo (uso interno)
    }
}

