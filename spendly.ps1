# Quick Spendly Launcher
# This script can be run from anywhere and will navigate to the project directory

param(
    [string]$Mode = ""
)

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to the project directory
Set-Location $ScriptDir

# Run the main script
if ($Mode -eq "") {
    & ".\run-spendly.ps1"
} else {
    & ".\run-spendly.ps1" -Mode $Mode
}