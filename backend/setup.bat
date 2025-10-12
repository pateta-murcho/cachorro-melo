@echo off
echo 🚀 Configurando Backend do Cachorro Melo...
echo.

echo 📦 Instalando dependências...
npm install

echo.
echo 📋 Copiando arquivo de configuração...
if not exist .env (
    copy .env.example .env
    echo ✅ Arquivo .env criado! Configure suas variáveis de ambiente.
) else (
    echo ⚠️  Arquivo .env já existe.
)

echo.
echo 🗄️  Configurando banco de dados...
npm run db:generate
npm run db:migrate

echo.
echo 🌱 Populando banco com dados iniciais...
npm run db:seed

echo.
echo ✅ Setup concluído!
echo.
echo 📝 Próximos passos:
echo 1. Configure o arquivo .env com suas variáveis
echo 2. Execute 'npm run dev' para iniciar o servidor
echo 3. Acesse http://localhost:3001/health para verificar
echo.
echo 🔑 Login admin padrão:
echo Email: admin@cachorromelo.com
echo Senha: admin123
echo.
pause