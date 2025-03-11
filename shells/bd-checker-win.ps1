###################################
# About:
# This script will check if BetterDiscord is installed and launch the installer if it isn't.
# If BetterDiscord is installed, it will just launch Discord.
#
# How to use:
# Launch PowerShell and run the script.
#
# Alternatively, create a shortcut with the following target:
# pwsh "PATH/TO/BDD_CHECKER_SCRIPT.ps1"
# Example:
# pwsh "%USERPROFILE%/Desktop/bdd_checker.ps1"
#
# If you want to run the script at startup, place the shortcut in the startup folder.
# Tip: The startup folder can be opened by pressing Win+R and typing "shell:startup".
#
# Requirements:
# - PowerShell 7
# - Windows
#
# Version: 0.4
###################################

# DEbug notes:
# After BD patch + failure to launch due to "Inconsistent installer state" + launching with regular "Discord short"
# Consider making the script launc "Update.exe" from root Discord folder, instead of Discord.exe

$betterDiscordDownloadUrl = "https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Windows.exe";

$localAppData = [Environment]::GetFolderPath("LocalApplicationData");
$bdInstallerFileLocation = Join-Path ([System.IO.Path]::GetTempPath()) "BetterDiscord-Windows.exe";
$discordFolder = Join-Path $localAppData "Discord";
$updateExePath = Join-Path $discordFolder "Update.exe";
$updateArgsPath = @("--processStart", "Discord.exe")

# Find newest folder that contains a dot in its name
$discordVersionFolder = Get-ChildItem $discordFolder
| Where-Object { $_.PSIsContainer -and $_.Name -match "\." }
| Sort-Object Name -Descending
| Select-Object -First 1
| Select-Object -ExpandProperty PSChildName;

$discordAppFolder = Join-Path $discordFolder $discordVersionFolder;
# $discordExePath = Join-Path $discordAppFolder "Discord.exe";
$discordIndexJsFolder = Join-Path $discordAppFolder "modules/discord_desktop_core-1/discord_desktop_core";
if (-not (Test-Path $discordIndexJsFolder)) {
    $discordIndexJsFolder = Join-Path $discordAppFolder "modules/discord_desktop_core-2/discord_desktop_core";
}

$discordIndexJsPath = Join-Path $discordIndexJsFolder "index.js";

if (-not (Test-Path $discordIndexJsPath)) {
    Write-Host "Discord index.js not found! Creating index.js manually";
    Write-Output "module.exports = require('./core.asar');" | Out-File $discordIndexJsPath;
}

function LaunchInBackground($path, $launchArgs) {
    Write-Host $path;
    Wait-Job -Id (Start-Process $path -ArgumentList $launchArgs &).Id
}

function LaunchAndWait($path) {
    Write-Host $path;
    Start-Process -FilePath $path -Wait;
}

Write-Host "Checking for BetterDiscord...";

# Check if index.js cointains the string "betterdiscord.asar"
$betterDiscordIsInstalled = (Get-Content $discordIndexJsPath) -match "betterdiscord.asar";
if ($betterDiscordIsInstalled) {
    Write-Host "BetterDiscord is installed!";

    # Launch Discord via Update.exe
    LaunchInBackground $updateExePath $updateArgsPath;
}
else {
    Write-Host "BetterDiscord is not installed!";

    $install = Read-Host "Do you want to launch the BetterDiscord installer? [y/n] (default is `"y`")";

    if ($install -ne "n") {
        # Check if BetterDiscord installer is already downloaded.
        # TODO: Check age of file and redownload if older than 1 month
        if (Test-Path $bdInstallerFileLocation) {
            Write-Host "BetterDiscord installer already downloaded!";
        }
        # Download BetterDiscord installer
        else {
            Write-Host "Downloading BetterDiscord installer...";

            try {
                Start-BitsTransfer $betterDiscordDownloadUrl -Destination $bdInstallerFileLocation;
            }
            catch {
                Write-Host "Error downloading BetterDiscord installer: $_.Exception.Message";
                exit;
            }
        }

        # Launch BetterDiscord installer and wait for it to finish
        LaunchAndWait $bdInstallerFileLocation;

        # Launch Discord via Update.exe
        LaunchInBackground $updateExePath $updateArgsPath
    }
}
