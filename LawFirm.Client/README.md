# Law Firm Client

Angular frontend for the Law Firm Website. The client provides the bilingual public experience, admin dashboard UI, route-based SEO metadata, and API integration for consultation requests, content, and analytics.

## Features

- Arabic-first interface with English language toggle.
- RTL/LTR layout switching.
- Responsive pages for home, services, blog articles, video library, and admin.
- Consultation request form connected to the ASP.NET Core API.
- Admin flows for blog posts, videos, consultation review, and dashboard statistics.
- YouTube embed and thumbnail handling.
- Dynamic page titles, descriptions, canonical URLs, Open Graph tags, sitemap, and robots file.

## Development

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm start
```

Open:

```text
http://127.0.0.1:4200
```

## Build

```powershell
npm run build
```

The production build is generated under:

```text
dist/LawFirm.Client/browser
```

The ASP.NET Core API project includes these files during publish.

## Configuration

Environment files live in:

```text
src/environments/environment.ts
src/environments/environment.prod.ts
```

Set `apiUrl` and `siteUrl` to match the deployment target.
