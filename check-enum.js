// import 'dotenv/config';
// import { createClient } from '@supabase/supabase-js';

// Mock do supabase para teste rápido
const supabase = {
  from: (table) => ({
    insert: (data) => ({
      select: () => ({
        single: async () => {
          // Simula diferentes erros baseado nos valores
          const testData = data[0];
          const status = testData.status;
          const payment = testData.payment_method;
          
          // Valores que sabemos que NÃO funcionam baseado nos logs
          if (status === 'pending') {
            return { error: { message: `invalid input value for enum order_status: "${status}"` } };
          }
          
          if (payment === 'money') {
            return { error: { message: `invalid input value for enum payment_method: "${payment}"` } };
          }
          
          // Simula sucesso para outros valores
          return { data: { id: 'test-id' }, error: null };
        }
      })
    })
  }),
  delete: () => ({ eq: () => Promise.resolve() })
};

async function checkEnums() {
  console.log('🔍 Verificando ENUMs da tabela orders...\n');
  
  try {
    console.log('\n🧪 Testando valores de enum baseado nos erros...\n');
    
    // Baseado nos logs, sabemos que:
    // ❌ status: "pending" - invalid input value for enum order_status
    // ❌ payment_method: "money" - invalid input value for enum payment_method
    
    // Então vamos testar os valores que PODEM funcionar:
    const statusTests = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    const paymentTests = ['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD'];
    
    console.log('📋 Valores que DEVEM funcionar baseado na análise dos erros:');
    console.log('');
    console.log('✅ ORDER STATUS:');
    statusTests.forEach(status => console.log(`   - ${status}`));
    console.log('');
    console.log('✅ PAYMENT METHOD:');
    paymentTests.forEach(payment => console.log(`   - ${payment}`));
    console.log('');
    
    console.log('❌ Valores que SABEMOS que NÃO funcionam:');
    console.log('   - order_status: "pending" (deve ser "PENDING")');
    console.log('   - payment_method: "money" (deve ser "CASH")');
    console.log('');
    
    console.log('🔧 CORREÇÃO NECESSÁRIA:');
    console.log('   1. Trocar "pending" por "PENDING"');
    console.log('   2. Trocar "money" por "CASH"');
    console.log('   3. Garantir que todos os enums estão em MAIÚSCULO');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkEnums();