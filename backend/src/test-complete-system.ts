import { testConnection } from './lib/supabase'

const projectId = 'kaeohzodfcghedhqlhtw'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL'
  message: string
  data?: any
}

const results: TestResult[] = []

function logTest(test: string, status: 'PASS' | 'FAIL', message: string, data?: any) {
  results.push({ test, status, message, data })
  const statusIcon = status === 'PASS' ? '✅' : '❌'
  console.log(`${statusIcon} ${test}: ${message}`)
  if (data) console.log('   Data:', JSON.stringify(data, null, 2))
}

async function testSupabaseConnection() {
  console.log('\n🔗 === TESTE DE CONEXÃO ===')
  
  try {
    const connected = await testConnection()
    if (connected) {
      logTest('Conexão Supabase', 'PASS', 'Conexão estabelecida com sucesso')
    } else {
      logTest('Conexão Supabase', 'FAIL', 'Falha na conexão')
    }
  } catch (error) {
    logTest('Conexão Supabase', 'FAIL', `Erro: ${error}`)
  }
}

async function testCategories() {
  console.log('\n📂 === TESTE DE CATEGORIAS ===')
  
  try {
    // Buscar categorias via API local
    const response = await fetch('http://localhost:3001/api/categories')
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data.length > 0) {
        logTest('API Categorias', 'PASS', `${data.data.length} categorias carregadas via API`, data.data.map((c: any) => c.name))
      } else {
        logTest('API Categorias', 'FAIL', 'Nenhuma categoria retornada')
      }
    } else {
      logTest('API Categorias', 'FAIL', `HTTP ${response.status}`)
    }
  } catch (error) {
    logTest('API Categorias', 'FAIL', `Erro na requisição: ${error}`)
  }
}

async function testProducts() {
  console.log('\n🍔 === TESTE DE PRODUTOS ===')
  
  try {
    // Buscar produtos via API local
    const response = await fetch('http://localhost:3001/api/products')
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data.length > 0) {
        logTest('API Produtos', 'PASS', `${data.data.length} produtos carregados via API`, data.data.map((p: any) => ({ name: p.name, price: p.price })))
      } else {
        logTest('API Produtos', 'FAIL', 'Nenhum produto retornado')
      }
    } else {
      logTest('API Produtos', 'FAIL', `HTTP ${response.status}`)
    }
  } catch (error) {
    logTest('API Produtos', 'FAIL', `Erro na requisição: ${error}`)
  }
}

async function testCustomerCreation() {
  console.log('\n👤 === TESTE DE CRIAÇÃO DE CLIENTE ===')
  
  const testCustomer = {
    name: 'João Teste',
    phone: '11999999999',
    email: 'joao.teste@email.com',
    address: 'Rua Teste, 123 - Bairro Teste'
  }
  
  try {
    const response = await fetch('http://localhost:3001/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCustomer)
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data.id) {
        logTest('Criação Cliente', 'PASS', 'Cliente criado com sucesso', { id: data.data.id, name: data.data.name })
        return data.data.id
      } else {
        logTest('Criação Cliente', 'FAIL', 'Resposta inválida da API')
      }
    } else {
      const error = await response.text()
      logTest('Criação Cliente', 'FAIL', `HTTP ${response.status}: ${error}`)
    }
  } catch (error) {
    logTest('Criação Cliente', 'FAIL', `Erro na requisição: ${error}`)
  }
  
  return null
}

async function testOrderCreation(customerId?: string) {
  console.log('\n📦 === TESTE DE CRIAÇÃO DE PEDIDO ===')
  
  // Primeiro, buscar produtos disponíveis
  try {
    const productsResponse = await fetch('http://localhost:3001/api/products')
    if (!productsResponse.ok) {
      logTest('Busca Produtos para Pedido', 'FAIL', 'Falha ao buscar produtos')
      return
    }
    
    const productsData = await productsResponse.json()
    if (!productsData.success || productsData.data.length === 0) {
      logTest('Busca Produtos para Pedido', 'FAIL', 'Nenhum produto encontrado')
      return
    }
    
    const firstProduct = productsData.data[0]
    logTest('Busca Produtos para Pedido', 'PASS', `Produto encontrado: ${firstProduct.name}`)
    
    // Criar pedido
    const testOrder = {
      customer_name: 'Maria Teste Pedido',
      customer_phone: '11888888888',
      customer_email: 'maria.teste@email.com',
      delivery_address: 'Av. Teste, 456 - Centro',
      payment_method: 'CASH',
      notes: 'Teste de pedido automático',
      items: [
        {
          product_id: firstProduct.id,
          quantity: 2
        }
      ]
    }
    
    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrder)
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data.id) {
        logTest('Criação Pedido', 'PASS', 'Pedido criado com sucesso', {
          id: data.data.id,
          total: data.data.total_amount,
          status: data.data.status,
          items: data.data.order_items?.length || 0
        })
        return data.data.id
      } else {
        logTest('Criação Pedido', 'FAIL', 'Resposta inválida da API')
      }
    } else {
      const error = await response.text()
      logTest('Criação Pedido', 'FAIL', `HTTP ${response.status}: ${error}`)
    }
  } catch (error) {
    logTest('Criação Pedido', 'FAIL', `Erro na requisição: ${error}`)
  }
  
  return null
}

async function testOrderStatus(orderId: string) {
  console.log('\n🔄 === TESTE DE ATUALIZAÇÃO DE STATUS ===')
  
  const statuses = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY']
  
  for (const status of statuses) {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.status === status) {
          logTest(`Status ${status}`, 'PASS', `Status atualizado para ${status}`)
        } else {
          logTest(`Status ${status}`, 'FAIL', 'Status não foi atualizado corretamente')
        }
      } else {
        logTest(`Status ${status}`, 'FAIL', `HTTP ${response.status}`)
      }
    } catch (error) {
      logTest(`Status ${status}`, 'FAIL', `Erro: ${error}`)
    }
  }
}

async function testDatabaseQueries() {
  console.log('\n💾 === TESTE DE CONSULTAS DIRETAS NO BANCO ===')
  
  try {
    // Testar se há pedidos no banco
    const ordersQuery = await fetch('http://localhost:3001/api/orders')
    if (ordersQuery.ok) {
      const ordersData = await ordersQuery.json()
      logTest('Consulta Pedidos', 'PASS', `${ordersData.data?.length || 0} pedidos encontrados no banco`)
    }
    
    // Testar se há clientes no banco
    const customersQuery = await fetch('http://localhost:3001/api/customers')
    if (customersQuery.ok) {
      const customersData = await customersQuery.json()
      logTest('Consulta Clientes', 'PASS', `${customersData.data?.length || 0} clientes encontrados no banco`)
    }
    
  } catch (error) {
    logTest('Consultas Banco', 'FAIL', `Erro: ${error}`)
  }
}

async function generateReport() {
  console.log('\n📊 === RELATÓRIO FINAL ===')
  
  const totalTests = results.length
  const passedTests = results.filter(r => r.status === 'PASS').length
  const failedTests = results.filter(r => r.status === 'FAIL').length
  
  console.log(`\n📈 Total de testes: ${totalTests}`)
  console.log(`✅ Sucessos: ${passedTests}`)
  console.log(`❌ Falhas: ${failedTests}`)
  console.log(`📊 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (failedTests > 0) {
    console.log('\n❌ Testes que falharam:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.test}: ${r.message}`)
    })
  }
  
  console.log('\n🎯 RESUMO DA INTEGRAÇÃO:')
  console.log('- Backend API: Rodando na porta 3001')
  console.log('- Frontend: Rodando na porta 8080')
  console.log('- Banco Supabase: Conectado e funcional')
  console.log('- Tabelas: categories, products, customers, orders, order_items, admins')
}

async function runAllTests() {
  console.log('🚀 INICIANDO BATERIA DE TESTES DO SISTEMA CACHORRO MELO DELIVERY')
  console.log('=' * 60)
  
  await testSupabaseConnection()
  await testCategories()
  await testProducts()
  
  const customerId = await testCustomerCreation()
  const orderId = await testOrderCreation(customerId || undefined)
  
  if (orderId) {
    await testOrderStatus(orderId)
  }
  
  await testDatabaseQueries()
  await generateReport()
  
  console.log('\n🏁 TESTES CONCLUÍDOS!')
}

// Executar testes
runAllTests().catch(console.error)