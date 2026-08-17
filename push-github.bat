@echo off
chcp 65001 > nul
echo ========================================================
echo   🚀 Healthy Routine - Subir Alterações para o GitHub
echo ========================================================
echo.

:: Verifica se a mensagem de commit foi passada como argumento
set "COMMIT_MSG=%~1"
if "%COMMIT_MSG%"=="" (
    set /p "COMMIT_MSG=Digite a mensagem do commit: "
)

if "%COMMIT_MSG%"=="" (
    set "COMMIT_MSG=chore: update healthy-routine codebase"
)

echo.
echo 📦 1. Adicionando todos os arquivos do projeto (back-end, mobile, front-end, docs)...
git add .

echo.
echo 📝 2. Criando commit com a mensagem: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

echo.
echo 🌐 3. Verificando branch principal...
git branch -M main

echo.
echo 🚀 4. Enviando para o GitHub (AndreBezBirolo/healthy-routine.git)...
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   ✅ Sucesso! Código atualizado no GitHub.
    echo ========================================================
) else (
    echo ========================================================
    echo   ❌ Erro ao enviar para o GitHub. Verifique os logs acima.
    echo ========================================================
)
echo.
pause
