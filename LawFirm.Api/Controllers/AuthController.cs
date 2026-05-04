using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        var email = configuration["Admin:Email"];
        var password = configuration["Admin:Password"];
        var token = configuration["Admin:Token"];

        if (request.Email == email && request.Password == password)
        {
            return Ok(new { token });
        }

        return Unauthorized(new { message = "Invalid email or password." });
    }
}

public record LoginRequest(string Email, string Password);
