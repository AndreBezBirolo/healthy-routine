@echo off
chcp 65001 > nul
echo ========================================================
echo   🚀 Healthy Routine - Deploy do Back-end no Heroku
echo ========================================================
echo.

cd /d "%~dp0"

echo 📦 1. Salvando alterações locais...
git add .
git commit -m "deploy: update back-end for heroku" 2>nul

echo.
echo 🚀 2. Compilando e Enviando Back-end para o Heroku...
powershell -Command "$split = git subtree split --prefix back-end main; git push heroku \"${split}:main\" --force"

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
