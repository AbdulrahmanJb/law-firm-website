using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LawFirm.Api.Filters;

public class AdminTokenAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var configuredToken = context.HttpContext.RequestServices
            .GetRequiredService<IConfiguration>()["Admin:Token"];

        var requestToken = context.HttpContext.Request.Headers["X-Admin-Token"].ToString();

        if (string.IsNullOrWhiteSpace(configuredToken) || requestToken != configuredToken)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Admin access required." });
        }
    }
}
