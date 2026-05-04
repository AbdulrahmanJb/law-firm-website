# Law Firm Website

Full-stack starter for an Arabic-first law firm website with an Angular frontend, ASP.NET Core API, and SQL Server LocalDB database.

## Run Locally

Start the API:

```powershell
dotnet run --project LawFirm.Api\LawFirm.Api.csproj --launch-profile http
```

Start the Angular client:

```powershell
cd LawFirm.Client
npm start
```

Open:

```text
http://127.0.0.1:4200
```

## Local Admin Login

```text
Email: admin@lawfirm.local
Password: ChangeMe123!
```

Change these values before any real deployment in `LawFirm.Api/appsettings.json`.

## Database

The API uses:

```text
Server=(localdb)\MSSQLLocalDB;Database=LawFirmDb
```

The database is created automatically on API startup for local development.
