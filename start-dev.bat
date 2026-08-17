@echo off
title Healthy Routine - Dev Starter
echo ========================================================
echo         HEALTHY ROUTINE - STARTING DEV ENVIRONMENT
echo ========================================================
echo.

echo [1/2] Iniciando Back-end API (Fastify)...
start "Healthy Routine - Backend API" cmd /k "cd /d %~dp0back-end && npm run dev"

echo [2/2] Iniciando App Mobile / Web (Expo)...
start "Healthy Routine - Mobile & Web App" cmd /k "cd /d %~dp0mobile && npx expo start --web"

echo.
echo ========================================================
echo   Ambos os servicos foram iniciados!
echo   - Backend: http://localhost:3333/health
echo   - Web / Navegador: http://localhost:8081 (Abre automaticamente)
echo   - Mobile: Abra o app 'Expo Go' e escaneie o QR Code
echo ========================================================
echo.
pause
