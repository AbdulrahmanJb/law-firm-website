using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace LawFirm.Api.Services;

public class AdminJwtService(IConfiguration configuration)
{
    public string CreateToken(string email)
    {
        var now = DateTimeOffset.UtcNow;
        var payload = new Dictionary<string, object>
        {
            ["sub"] = email,
            ["role"] = "admin",
            ["iat"] = now.ToUnixTimeSeconds(),
            ["exp"] = now.AddHours(8).ToUnixTimeSeconds()
        };

        var headerJson = JsonSerializer.Serialize(new { alg = "HS256", typ = "JWT" });
        var payloadJson = JsonSerializer.Serialize(payload);
        var header = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var body = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
        var signature = Sign($"{header}.{body}");

        return $"{header}.{body}.{signature}";
    }

    public bool ValidateToken(string token)
    {
        var parts = token.Split('.');
        if (parts.Length != 3) return false;

        var expectedSignature = Sign($"{parts[0]}.{parts[1]}");
        if (!CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(parts[2]),
            Encoding.UTF8.GetBytes(expectedSignature)))
        {
            return false;
        }

        var payloadJson = Encoding.UTF8.GetString(Base64UrlDecode(parts[1]));
        using var payload = JsonDocument.Parse(payloadJson);

        if (!payload.RootElement.TryGetProperty("role", out var role) || role.GetString() != "admin")
        {
            return false;
        }

        if (!payload.RootElement.TryGetProperty("exp", out var exp))
        {
            return false;
        }

        return DateTimeOffset.UtcNow.ToUnixTimeSeconds() < exp.GetInt64();
    }

    private string Sign(string value)
    {
        var secret = configuration["Admin:JwtSecret"];
        if (string.IsNullOrWhiteSpace(secret) || secret.Length < 32)
        {
            throw new InvalidOperationException("Admin:JwtSecret must be at least 32 characters.");
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        return Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(value)));
    }

    private static string Base64UrlEncode(byte[] value)
    {
        return Convert.ToBase64String(value)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static byte[] Base64UrlDecode(string value)
    {
        var padded = value.Replace('-', '+').Replace('_', '/');
        padded += new string('=', (4 - padded.Length % 4) % 4);
        return Convert.FromBase64String(padded);
    }
}
