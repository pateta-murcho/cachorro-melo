import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  customer_id: string;
  total: number;
  status: string;
  payment_method: string;
  delivery_address: string;
  observations?: string;
  created_at: string;
  items?: Array<{
    product_id: string;
    quantity: number;
    observations?: string;
  }>;
}

export default function AdminKitchen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Atualiza a cada 10s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('👨‍🍳 Buscando pedidos da cozinha...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, phone),
          items:order_items(*, product:products(name))
        `)
        .in('status', ['PENDING', 'CONFIRMED', 'PREPARING'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      console.log('✅ Pedidos da cozinha:', data?.length || 0);
      setOrders(data || []);
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('🔄 Atualizando status do pedido:', orderId, newStatus);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Pedido movido para: ${getStatusText(newStatus)}`
      });
      
      fetchOrders();
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmado',
      PREPARING: 'Preparando',
      OUT_FOR_DELIVERY: 'Saiu para entrega',
      DELIVERED: 'Entregue'
    };
    return texts[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'border-yellow-300 bg-yellow-50',
      CONFIRMED: 'border-blue-300 bg-blue-50',
      PREPARING: 'border-purple-300 bg-purple-50'
    };
    return colors[status] || 'border-gray-300 bg-gray-50';
  };

  const getNextStatus = (currentStatus: string) => {
    const flow: Record<string, string> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'OUT_FOR_DELIVERY'
    };
    return flow[currentStatus];
  };

  const getNextStatusText = (currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    return getStatusText(nextStatus);
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/dashboard')}
              className="mb-4 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-white">🍳 Cozinha - Pedidos em Tempo Real</h1>
          </div>
          <div className="text-white text-sm">
            Atualizado a cada 10 segundos
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-white">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Coluna: Novos Pedidos */}
            <div>
              <h2 className="text-xl font-bold text-yellow-400 mb-4">
                📋 Novos Pedidos ({pendingOrders.length})
              </h2>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card key={order.id} className={`border-2 ${getStatusColor(order.status)}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>Pedido #{order.id.substring(0, 8)}</span>
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </CardTitle>
                      <div className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <strong>Endereço:</strong> {order.delivery_address}
                      </div>
                      {order.observations && (
                        <div className="text-sm bg-yellow-100 p-2 rounded">
                          <strong>Obs:</strong> {order.observations}
                        </div>
                      )}
                      <div className="text-lg font-bold">
                        Total: R$ {order.total.toFixed(2)}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {getNextStatusText(order.status)}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {pendingOrders.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    Nenhum pedido novo
                  </div>
                )}
              </div>
            </div>

            {/* Coluna: Confirmados */}
            <div>
              <h2 className="text-xl font-bold text-blue-400 mb-4">
                ✅ Confirmados ({confirmedOrders.length})
              </h2>
              <div className="space-y-4">
                {confirmedOrders.map((order) => (
                  <Card key={order.id} className={`border-2 ${getStatusColor(order.status)}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Pedido #{order.id.substring(0, 8)}
                      </CardTitle>
                      <div className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-lg font-bold">
                        R$ {order.total.toFixed(2)}
                      </div>
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                      >
                        🍳 Iniciar Preparo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {confirmedOrders.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    Nenhum pedido confirmado
                  </div>
                )}
              </div>
            </div>

            {/* Coluna: Em Preparo */}
            <div>
              <h2 className="text-xl font-bold text-purple-400 mb-4">
                🍳 Em Preparo ({preparingOrders.length})
              </h2>
              <div className="space-y-4">
                {preparingOrders.map((order) => (
                  <Card key={order.id} className={`border-2 ${getStatusColor(order.status)}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Pedido #{order.id.substring(0, 8)}
                      </CardTitle>
                      <div className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-lg font-bold">
                        R$ {order.total.toFixed(2)}
                      </div>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                      >
                        🚚 Pedido Pronto
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {preparingOrders.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    Nenhum pedido em preparo
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
