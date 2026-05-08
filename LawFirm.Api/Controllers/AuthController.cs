using LawFirm.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IConfiguration configuration, AdminJwtService jwtService) : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        var email = configuration["Admin:Email"];
        var passwordHash = configuration["Admin:PasswordHash"];
        var developmentPassword = configuration["Admin:Password"];

        var passwordMatches = !string.IsNullOrWhiteSpace(passwordHash)
            ? AdminPasswordHasher.Verify(request.Password, passwordHash)
            : !string.IsNullOrWhiteSpace(developmentPassword) && request.Password == developmentPassword;

        if (request.Email == email && passwordMatches)
        {
            return Ok(new { token = jwtService.CreateToken(request.Email) });
        }

        return Unauthorized(new { message = "Invalid email or password." });
    }
}

public record LoginRequest(string Email, string Password);
