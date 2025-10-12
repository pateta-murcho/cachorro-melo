@echo off
echo 🐘 Configurando PostgreSQL para Cachorro Melo...
echo.

echo Este script irá criar o banco de dados PostgreSQL.
echo Certifique-se de que o PostgreSQL está instalado e rodando.
echo.

set /p POSTGRES_USER="Digite o usuário do PostgreSQL (padrão: postgres): "
if "%POSTGRES_USER%"=="" set POSTGRES_USER=postgres

set /p POSTGRES_PASSWORD="Digite a senha do PostgreSQL: "
if "%POSTGRES_PASSWORD%"=="" (
    echo Senha é obrigatória!
    pause
    exit /b 1
)

set /p DATABASE_NAME="Digite o nome do banco (padrão: cachorromelo_delivery): "
if "%DATABASE_NAME%"=="" set DATABASE_NAME=cachorromelo_delivery

echo.
echo 🗄️  Criando banco de dados...
psql -U %POSTGRES_USER% -c "CREATE DATABASE %DATABASE_NAME%;"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Banco de dados '%DATABASE_NAME%' criado com sucesso!
    echo.
    echo 📝 Atualize seu arquivo .env com:
    echo DATABASE_URL="postgresql://%POSTGRES_USER%:%POSTGRES_PASSWORD%@localhost:5432/%DATABASE_NAME%?schema=public"
) else (
    echo ❌ Erro ao criar banco de dados.
    echo Verifique se o PostgreSQL está rodando e as credenciais estão corretas.
)

echo.
pause