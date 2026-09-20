@echo off
REM Double-click this file to start the dashboard.
REM Requires Java 17+ installed. Keep this file in the same folder as the jar file.

cd /d "%~dp0"

set JARFILE=
for %%f in (business-dashboard-*.jar) do set JARFILE=%%f

if "%JARFILE%"=="" (
  echo Could not find business-dashboard-*.jar in this folder.
  echo Place this file next to the jar file and try again.
  pause
  exit /b 1
)

echo Starting dashboard...
echo Dashboard : http://localhost:8080
echo Admin     : http://localhost:8080/admin
echo Close this window to stop the server.
echo.

java -jar "%JARFILE%"
pause
