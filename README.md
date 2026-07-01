# Law Firm Website

Arabic-first full-stack website for a Saudi law office, built with Angular, ASP.NET Core, Entity Framework Core, and SQL Server. The project combines a public marketing site with an admin dashboard for content, consultations, and visit tracking.

## Highlights

- Responsive Arabic/English interface with RTL support and SEO metadata.
- Public pages for services, legal articles, YouTube video content, and consultation requests.
- Admin dashboard for managing blog posts, videos, consultation requests, and visit metrics.
- ASP.NET Core API with JWT-style admin authentication and protected admin endpoints.
- Entity Framework Core persistence using SQL Server LocalDB for development.
- Angular production build is published through the ASP.NET Core app as static files.

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

- Bilingual landing page with service navigation, legal content previews, and contact actions.
- Consultation request form backed by the API.
- Blog and video library served from the database with local fallback content.
- Admin login, dashboard statistics, content CRUD, and consultation review workflow.
- Daily visit tracking by route.
- Sitemap, robots file, canonical URL handling, Open Graph metadata, and production API configuration.

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

## Local Admin Login

Development credentials are configured for local testing only:

```text
Email: admin@lawfirm.local
Password: ChangeMe123!
```

For production, replace these values with secure settings as described in [DEPLOYMENT.md](DEPLOYMENT.md).

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
