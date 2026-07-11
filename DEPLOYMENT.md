# Deployment Notes

## Required production settings

Set these values on the server instead of keeping secrets in source control:

- `ConnectionStrings:DefaultConnection`: production SQL Server connection string.
- `Admin:Email`: admin login email.
- `Admin:PasswordHash`: hashed admin password in `pbkdf2:...` format.
- `Admin:JwtSecret`: long random secret, at least 32 characters.
- `Cors:AllowedOrigins`: production frontend domains.

## Local development secrets

Do not commit admin passwords, JWT secrets, production connection strings, or API keys. For local development, use .NET user secrets:

```powershell
dotnet user-secrets init --project LawFirm.Api\LawFirm.Api.csproj
dotnet user-secrets set "Admin:Email" "admin@lawfirm.local" --project LawFirm.Api\LawFirm.Api.csproj
dotnet user-secrets set "Admin:Password" "<local-admin-password>" --project LawFirm.Api\LawFirm.Api.csproj
dotnet user-secrets set "Admin:JwtSecret" "<at-least-32-random-characters>" --project LawFirm.Api\LawFirm.Api.csproj
```

Use `Admin:Password` only for local development. Production should use `Admin:PasswordHash`.

## Current production frontend API URL

Angular production builds use:

```ts
https://alfaifi-law.com/api
```

Change `LawFirm.Client/src/environments/environment.prod.ts` if the API will be hosted on another subdomain, for example:

```ts
https://api.alfaifi-law.com/api
```

## SEO files

The frontend includes:

- `robots.txt`
- `sitemap.xml`
- basic Open Graph metadata

Update the sitemap domain if the final public domain changes.
