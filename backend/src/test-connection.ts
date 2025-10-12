import { testConnection } from './lib/supabase'

async function test() {
  console.log('Testando conexão com Supabase...')
  const connected = await testConnection()
  console.log('Conexão:', connected ? 'Sucesso!' : 'Falhou')
  process.exit(0)
}

test()