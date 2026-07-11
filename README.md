# Law Firm Website

Arabic-first full-stack website for a Saudi law office, built with Angular, ASP.NET Core, Entity Framework Core, and SQL Server. The project combines a public marketing site with an admin dashboard for content, consultations, legal content, and visit tracking.

## Live Demo

- Website: https://alfaifi-law.com

## Preview

![Law firm website preview](LawFirm.Client/public/assets/law-hero-luxury-office.png)

## Highlights

- Responsive Arabic/English interface with RTL support and SEO metadata.
- Public pages for services, legal articles, YouTube video content, and consultation requests.
- Admin dashboard for managing blog posts, videos, consultation requests, and visit metrics.
- ASP.NET Core API with admin authentication and protected admin endpoints.
- Entity Framework Core persistence using SQL Server LocalDB for development.
- Angular production build is published through the ASP.NET Core app as static files.
- Production configuration notes for connection strings, admin credentials, JWT secret, CORS, sitemap, and API URL.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Angular 21, TypeScript, SCSS |
| Backend | ASP.NET Core, C#/.NET 10 |
| Data | Entity Framework Core, SQL Server LocalDB |
| Tooling | Angular CLI, Visual Studio/.NET CLI, npm |

## Repository Structure

```text
LawFirm.Api/              ASP.NET Core API, auth, controllers, publish pipeline
LawFirm.Client/           Angular client app and public assets
LawFirm.Domain/           Domain project
LawFirm.Infrastructure/   EF Core DbContext and entities
tools/                    Deployment helper scripts
DEPLOYMENT.md             Production configuration notes
```

## Core Features

### Public Website

- Bilingual home page with service navigation, legal content previews, and contact actions.
- Consultation request form backed by the API.
- Blog and video library served from the database with local fallback content.
- Dynamic page titles, descriptions, canonical URLs, Open Graph tags, sitemap, and robots file.

### Admin Dashboard

- Local admin login for protected dashboard access.
- Blog and video content management.
- Consultation request review workflow.
- Daily visit tracking by route.

### Backend API

- Public content endpoints for services, blogs, videos, consultations, and visits.
- Protected admin endpoints for dashboard data and content management.
- EF Core models for consultations, blog posts, video items, services, and daily visits.

## Run Locally

### Prerequisites

- .NET 10 SDK
- Node.js and npm
- SQL Server LocalDB

### API

```powershell
dotnet run --project LawFirm.Api\LawFirm.Api.csproj --launch-profile http
```

The local database is created automatically on startup with this development connection string:

```text
Server=(localdb)\MSSQLLocalDB;Database=LawFirmDb
```

### Client

```powershell
cd LawFirm.Client
npm install
npm start
```

Open the app at:

```text
http://127.0.0.1:4200
```

## Build

Build the Angular client:

```powershell
cd LawFirm.Client
npm run build
```

Build the API:

```powershell
dotnet build LawFirmWebsite.slnx
```

When publishing the API, the project includes the Angular production build from:

```text
LawFirm.Client\dist\LawFirm.Client\browser
```

## Local Admin Setup

Admin credentials and JWT secrets are intentionally not committed to source control. For local development, store them with .NET user secrets:

```powershell
dotnet user-secrets init --project LawFirm.Api\LawFirm.Api.csproj
dotnet user-secrets set "Admin:Email" "admin@lawfirm.local" --project LawFirm.Api\LawFirm.Api.csproj
dotnet user-secrets set "Admin:Password" "<local-admin-password>" --project LawFirm.Api\LawFirm.Api.csproj
dotnet user-secrets set "Admin:JwtSecret" "<at-least-32-random-characters>" --project LawFirm.Api\LawFirm.Api.csproj
```

For production, use a hashed password and server-side environment/app settings as described in [DEPLOYMENT.md](DEPLOYMENT.md).

## Production Notes

Production deployments should set the following outside source control:

- `ConnectionStrings:DefaultConnection`
- `Admin:Email`
- `Admin:PasswordHash`
- `Admin:JwtSecret`
- `Cors:AllowedOrigins`

The Angular production API URL is configured in:

```text
LawFirm.Client/src/environments/environment.prod.ts
```
