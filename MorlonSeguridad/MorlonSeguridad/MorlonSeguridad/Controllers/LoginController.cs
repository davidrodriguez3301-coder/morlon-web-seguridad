using MorlonSeguridad.Data;
using MorlonSeguridad.Models;
using System.Web;
using System.Web.Http;

namespace MorlonSeguridad.Controllers
{
    public class LoginController : ApiController
    {
        [HttpPost]
        public IHttpActionResult Login([FromBody] OperativoLogin login)
        {
            if (login == null)
                return BadRequest("Datos incompletos.");

            string ip = HttpContext.Current?.Request?.UserHostAddress;

            var operativo = OperativoData.ValidarOperativo(login.codOperativo, login.contrasena);

            if (operativo != null)
            {
                OperativoData.RegistrarAuditoria(login.codOperativo, true, "Login correcto", ip);
                return Ok(new { success = true, message = "Inicio de sesión correcto", operativo });
            }
            else
            {
                OperativoData.RegistrarAuditoria(login.codOperativo, false, "Clave incorrecta", ip);
                return Ok(new { success = false, message = "Usuario o contraseña incorrectos." });
            }
        }

    }
}
