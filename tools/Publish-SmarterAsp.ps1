param(
    [string]$PublishSettingsPath = "C:\Users\Lenovo\Downloads\site1.PublishSettings",
    [string]$PublishFolder = ".\artifacts\publish-live"
)

$ErrorActionPreference = "Stop"

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

$workspace = Resolve-Path (Join-Path $PSScriptRoot "..")
$publishFolderPath = Resolve-Path (Join-Path $workspace $PublishFolder)
$profileXml = [xml](Get-Content -LiteralPath $PublishSettingsPath)
$profile = $profileXml.publishData.publishProfile |
    Where-Object { $_.publishMethod -eq "MSDeploy" } |
    Select-Object -First 1

if (-not $profile) {
    throw "No MSDeploy profile found in $PublishSettingsPath"
}

$msdeploy = "C:\Program Files\IIS\Microsoft Web Deploy V3\msdeploy.exe"
if (-not (Test-Path $msdeploy)) {
    $msdeploy = "C:\Program Files (x86)\IIS\Microsoft Web Deploy V3\msdeploy.exe"
}

if (-not (Test-Path $msdeploy)) {
    throw "msdeploy.exe was not found. Install Microsoft Web Deploy or publish from Visual Studio."
}

$password = Convert-SecureStringToPlainText (Read-Host "Enter SmarterASP WebDeploy/FTP password" -AsSecureString)

cmd /c "subst P: /d" 2>$null | Out-Null
cmd /c "subst P: `"$workspace`""

try {
    $relativePublish = $publishFolderPath.Path.Substring($workspace.Path.Length).TrimStart("\")
    $sourcePath = "P:\$relativePublish"
    $sourceArg = "-source:contentPath=$sourcePath"
    $destArg = "-dest:contentPath=$($profile.msdeploySite),computerName=$($profile.publishUrl),userName=$($profile.userName),password=$password,authType=Basic"

    & $msdeploy -verb:sync $sourceArg $destArg -allowUntrusted -enableRule:AppOffline
}
finally {
    cmd /c "subst P: /d" | Out-Null
}
