<#
.SYNOPSIS
  Lance Mord en mode développement (debug).
#>
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

# Rust / Cargo
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

# Environnement MSVC si disponible (Windows)
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

Write-Host "Démarrage de Mord (tauri dev)…" -ForegroundColor Green
npm run tauri -- dev
