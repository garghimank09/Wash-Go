# Run the API using the project virtualenv (avoids global Python missing asyncpg).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    Write-Host "Creating virtualenv..."
    python -m venv .venv
    & $python -m pip install -r app\requirements.txt
}

& $python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
