param(
    [string]$SqlServer = "sql6033.site4now.net",
    [string]$Database = "db_ac910e_lawfirmdb",
    [string]$DatabaseUser = "db_ac910e_lawfirmdb_admin",
    [string]$AdminEmail = "admin@lawfirm.local"
)

$ErrorActionPreference = "Stop"

function New-PasswordHash {
    param([string]$Password)

    $salt = New-Object byte[] 16
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($salt)
    $rng.Dispose()
    $iterations = 100000
    $pbkdf2 = [System.Security.Cryptography.Rfc2898DeriveBytes]::new(
        $Password,
        $salt,
        $iterations,
        [System.Security.Cryptography.HashAlgorithmName]::SHA256
    )
    $hash = $pbkdf2.GetBytes(32)
    $pbkdf2.Dispose()

    "pbkdf2:${iterations}:$([Convert]::ToBase64String($salt)):$([Convert]::ToBase64String($hash))"
}

function Convert-SecureStringToPlainText {
    param([securestring]$SecureString)

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
    try {
        [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

$databasePassword = Convert-SecureStringToPlainText (Read-Host "Enter SQL database password" -AsSecureString)
$adminPassword = Convert-SecureStringToPlainText (Read-Host "Enter production admin password" -AsSecureString)
$jwtSecretBytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($jwtSecretBytes)
$rng.Dispose()
$jwtSecret = [Convert]::ToBase64String($jwtSecretBytes)

$settings = [ordered]@{
    ConnectionStrings = [ordered]@{
        DefaultConnection = "Server=$SqlServer;Database=$Database;User Id=$DatabaseUser;Password=$databasePassword;TrustServerCertificate=True;"
    }
    Admin = [ordered]@{
        Email = $AdminEmail
        PasswordHash = New-PasswordHash $adminPassword
        JwtSecret = $jwtSecret
    }
    Cors = [ordered]@{
        AllowedOrigins = @(
            "http://abdulrahmanjb-001-site1.anytempurl.com",
            "https://abdulrahmanjb-001-site1.anytempurl.com",
            "https://alfaifi-law.com",
            "https://www.alfaifi-law.com"
        )
    }
}

$outPath = Join-Path $PSScriptRoot "..\LawFirm.Api\appsettings.Production.json"
$settings | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $outPath -Encoding UTF8

Write-Host "Created $outPath"
