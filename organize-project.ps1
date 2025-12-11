# organize-project.ps1
#
# This script organizes the Geoscite project files into their correct directories.
# It should be placed in the root of the 'Geoscite' folder and run from there.

# 1. Check for Administrator Privileges
Write-Host "Checking for Administrator privileges..." -ForegroundColor Yellow
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "This script needs to be run as an Administrator."
    Write-Warning "Please right-click the PowerShell icon and select 'Run as Administrator'."
    # Pause to allow the user to read the message before the window closes.
    Read-Host "Press Enter to exit..."
    exit
}
Write-Host "Success: Running with Administrator privileges." -ForegroundColor Green

# 2. Define Project Paths
try {
    $rootPath = Get-Location
    $projectPath = Join-Path -Path $rootPath -ChildPath "ArtiFact"
    $vscodePath = Join-Path -Path $rootPath -ChildPath ".vscode"

    Write-Host "Project Root: $rootPath"
    Write-Host "Application Path: $projectPath"

    # Ensure the target directories exist
    if (-NOT (Test-Path -Path $projectPath)) {
        New-Item -ItemType Directory -Path $projectPath | Out-Null
        Write-Host "Created directory: $projectPath"
    }
    if (-NOT (Test-Path -Path $vscodePath)) {
        New-Item -ItemType Directory -Path $vscodePath | Out-Null
        Write-Host "Created directory: $vscodePath"
    }

    # 3. Define File Mappings
    # List of files that should be in the 'ArtiFact' directory
    $projectFiles = @(
        "package.json",
        ".prettierrc.json",
        "tailwind.config.ts", # Add other files as needed
        "postcss.config.js",
        "next.config.mjs",
        "tsconfig.json"
    )

    # List of files that should be in the '.vscode' directory
    $vscodeFiles = @(
        "extensions.json",
        "launch.json",
        "settings.json",
        "tasks.json"
    )

    # 4. Move Files to their Correct Locations
    Write-Host "`nChecking and organizing files..." -ForegroundColor Cyan

    # Move project files into 'ArtiFact'
    foreach ($file in $projectFiles) {
        $sourceFile = Join-Path -Path $rootPath -ChildPath $file
        $destinationFile = Join-Path -Path $projectPath -ChildPath $file

        if ((Test-Path $sourceFile) -and -not (Test-Path $destinationFile)) {
            Move-Item -Path $sourceFile -Destination $projectPath
            Write-Host "Moved '$file' to 'ArtiFact\'" -ForegroundColor Green
        }
    }

    # Move VS Code files into '.vscode'
    foreach ($file in $vscodeFiles) {
        $sourceFile = Join-Path -Path $rootPath -ChildPath $file
        $destinationFile = Join-Path -Path $vscodePath -ChildPath $file

        if ((Test-Path $sourceFile) -and -not (Test-Path $destinationFile)) {
            Move-Item -Path $sourceFile -Destination $vscodePath
            Write-Host "Moved '$file' to '.vscode\'" -ForegroundColor Green
        }
    }

    Write-Host "`nFile organization complete." -ForegroundColor Green
}
catch {
    Write-Error "An error occurred: $_"
}

# Pause at the end to review the output
Read-Host "Press Enter to exit..."