using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;



namespace MorlonSeguridad.Controllers
{
    public class NovedadesController : ApiController
    {
        // GET api/Novedades
        [HttpGet]
        public IEnumerable<Novedades> Get()
        {
            return NovedadesData.Listar();
        }

        // GET api/Novedades/ID
        [HttpGet]
        public Novedades Get(string id)
        {
            return NovedadesData.obtener(id);
        }

        // POST api/Novedades
        [HttpPost]
        public bool Post([FromBody] Novedades oNovedades)
        {
            return NovedadesData.registrar(oNovedades);
        }

        // PUT api/Novedades/ID
        [HttpPut]
        public bool Put(string id, [FromBody] Novedades oNovedades)
        {
            // Por si acaso, nos aseguramos que el id coincida
            oNovedades.idNovedad = id;
            return NovedadesData.actualizarNovedades(oNovedades);
        }

        // DELETE api/Novedades/ID
        [HttpDelete]
        public bool Delete(string id)
        {
            return NovedadesData.eliminarNovedades(id);
        }
    }
}

