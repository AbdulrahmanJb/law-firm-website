using LawFirm.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LawFirm.Api.Filters;

public class AdminTokenAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var authorization = context.HttpContext.Request.Headers.Authorization.ToString();
        var token = authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? authorization["Bearer ".Length..].Trim()
            : context.HttpContext.Request.Headers["X-Admin-Token"].ToString();

        var jwtService = context.HttpContext.RequestServices.GetRequiredService<AdminJwtService>();

        if (string.IsNullOrWhiteSpace(token) || !jwtService.ValidateToken(token))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Admin access required." });
        }
    }
}
