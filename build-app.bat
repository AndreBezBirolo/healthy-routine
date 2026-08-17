@echo off
chcp 65001 > nul
title Healthy Routine - EAS Build Suite (Gerador de App para Celular e Lojas)
color 0A

echo ======================================================================
echo          🥗 HEALTHY ROUTINE - ASSISTENTE DE BUILD EAS (MOBILE)
echo ======================================================================
echo.
echo Escolha a opção de compilação desejada:
echo.
echo [1] Gerar APK Android Direto (Instalar e testar no celular agora)
echo [2] Gerar Android App Bundle (.aab) para a Google Play Store
echo [3] Gerar Build para iOS (Apple App Store)
echo [4] Fazer Login no EAS / Expo CLI
echo [5] Verificar Configuração do Projeto (Doctor)
echo [0] Sair
echo.
echo ======================================================================
set /p opt="Digite o número da opção e pressione ENTER: "

if "%opt%"=="1" goto build_apk
if "%opt%"=="2" goto build_aab
if "%opt%"=="3" goto build_ios
if "%opt%"=="4" goto eas_login
if "%opt%"=="5" goto eas_doctor
if "%opt%"=="0" exit

echo Opção inválida!
pause
exit

:build_apk
cls
echo ======================================================================
echo 📱 Iniciando Build do APK Android (Preview / Instalação Direta)...
echo ======================================================================
cd /d "%~dp0mobile"
call npx -y eas-cli build --platform android --profile preview
echo.
echo Build finalizada ou enviada para a nuvem do Expo!
pause
exit

:build_aab
cls
echo ======================================================================
echo 🚀 Iniciando Build do .aab de Produção para Google Play Store...
echo ======================================================================
cd /d "%~dp0mobile"
call npx -y eas-cli build --platform android --profile production
echo.
echo Build finalizada! O arquivo .aab estará disponível no dashboard do Expo.
pause
exit

:build_ios
cls
echo ======================================================================
echo 🍏 Iniciando Build de Produção para iOS (Apple App Store)...
echo ======================================================================
cd /d "%~dp0mobile"
call npx -y eas-cli build --platform ios --profile production
echo.
echo Build iOS enviada!
pause
exit

:eas_login
cls
echo ======================================================================
echo 🔑 Conectando sua conta Expo / EAS...
echo ======================================================================
cd /d "%~dp0mobile"
call npx -y eas-cli login
echo.
pause
exit

:eas_doctor
cls
echo ======================================================================
echo 🩺 Verificando integridade das dependências e assets com Expo Doctor...
echo ======================================================================
cd /d "%~dp0mobile"
call npx -y expo-doctor
echo.
pause
exit
