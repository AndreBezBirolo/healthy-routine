@echo off
chcp 65001 > nul
echo ========================================================
echo   🚀 Healthy Routine - Deploy do Back-end no Heroku
echo ========================================================
echo.

cd /d "%~dp0back-end"

echo 📦 1. Adicionando arquivos da pasta back-end...
git add .

set "COMMIT_MSG=%~1"
if "%COMMIT_MSG%"=="" (
    set "COMMIT_MSG=deploy: update back-end api on heroku"
)

echo 📝 2. Criando commit: "%COMMIT_MSG%"...
git commit -m "%COMMIT_MSG%"

echo.
echo 🚀 3. Enviando para o Heroku (healthy-routine-api)...
git push heroku master:main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   ✅ Deploy no Heroku concluído com sucesso!
    echo   🌐 API URL: https://healthy-routine-api.herokuapp.com/api/v1
    echo ========================================================
) else (
    echo ========================================================
    echo   ❌ Erro ao fazer deploy no Heroku. Verifique os logs acima.
    echo ========================================================
)
echo.
pause
