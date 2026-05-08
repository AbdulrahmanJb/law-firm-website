# Deployment Notes

## Required production settings

Set these values on the server instead of keeping secrets in source control:

- `ConnectionStrings:DefaultConnection`: production SQL Server connection string.
- `Admin:Email`: admin login email.
- `Admin:PasswordHash`: hashed admin password in `pbkdf2:...` format.
- `Admin:JwtSecret`: long random secret, at least 32 characters.
- `Cors:AllowedOrigins`: production frontend domains.

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
