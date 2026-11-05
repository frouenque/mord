<#
.SYNOPSIS
  Compile Mord et produit l'installateur Windows (NSIS).
#>
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

$cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"
if (Test-Path $cargoBin) {
    $env:Path = "$cargoBin;$env:Path"
}

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Error "Rust/Cargo introuvable. Installez rustup : https://rustup.rs/"
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm introuvable. Installez Node.js LTS."
}

$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
    $vsPath = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if ($vsPath) {
        $devCmd = Join-Path $vsPath "Common7\Tools\Launch-VsDevShell.ps1"
        if (Test-Path $devCmd) {
            & $devCmd -Arch amd64 -HostArch amd64 -SkipAutomaticLocation | Out-Null
        }
    }
}

if (-not (Test-Path (Join-Path $Root "node_modules"))) {
    Write-Host "Installation des dépendances npm…" -ForegroundColor Cyan
    npm install
}

Write-Host "Build release + installateur NSIS…" -ForegroundColor Cyan
npm run tauri -- build

$bundle = Join-Path $Root "src-tauri\target\release\bundle"
Write-Host ""
Write-Host "Build terminé." -ForegroundColor Green
if (Test-Path $bundle) {
    Write-Host "Artefacts :" -ForegroundColor Green
    Get-ChildItem -Path $bundle -Recurse -File |
        Where-Object { $_.Extension -in ".exe", ".msi" -or $_.Name -like "*.exe" } |
        ForEach-Object { Write-Host " - $($_.FullName)" }
    $nsis = Join-Path $bundle "nsis"
    if (Test-Path $nsis) {
        Get-ChildItem $nsis -File | ForEach-Object {
            Write-Host " - $($_.FullName)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Dossier bundle introuvable : $bundle" -ForegroundColor Yellow
}
