import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Phone, Package, DollarSign, CheckCircle, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  status: string;
  total: number;
  payment_method: string;
  delivery_address: string;
  observations?: string;
  delivery_code?: string;
  created_at: string;
  delivery_started_at?: string;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-gray-100 text-gray-700', icon: '⏳' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: '✅' },
  PREPARING: { label: 'Em Preparo', color: 'bg-yellow-100 text-yellow-700', icon: '👨‍🍳' },
  READY: { label: 'Pronto', color: 'bg-green-100 text-green-700', icon: '✅' },
  OUT_FOR_DELIVERY: { label: 'Saiu para Entrega', color: 'bg-orange-100 text-orange-700', icon: '🏍️' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-700', icon: '✅' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: '❌' }
};

export default function MeusPedidos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    loadOrders();
    // Atualizar a cada 10 segundos
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrders = async () => {
    try {
      const url = orderId 
        ? `http://localhost:3001/api/orders/${orderId}`
        : 'http://localhost:3001/api/orders/customer/recent';
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setOrders(orderId ? [data.data] : data.data);
      } else {
        toast({
          title: 'Erro ao carregar pedidos',
          description: data.error?.message || 'Tente novamente',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
          <p className="text-gray-600">Acompanhe o status dos seus pedidos em tempo real</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-500 mb-6">Faça seu primeiro pedido!</p>
              <Button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600">
                Ver Cardápio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
              
              return (
                <Card key={order.id} className="overflow-hidden shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Pedido #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm opacity-90">{formatDate(order.created_at)}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full ${statusInfo.color} font-semibold`}>
                        {statusInfo.icon} {statusInfo.label}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Delivery Code - Destaque */}
                    {order.status === 'OUT_FOR_DELIVERY' && order.delivery_code && (
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-300 text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Truck className="w-6 h-6 text-orange-600" />
                          <p className="text-lg font-bold text-orange-900">
                            Entregador a caminho!
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Informe este código ao entregador:
                        </p>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                          <p className="text-6xl font-bold text-orange-500 tracking-widest">
                            {order.delivery_code}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          O entregador precisará deste código para confirmar a entrega
                        </p>
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div className="flex items-center justify-between px-4">
                      <div className={`flex flex-col items-center ${['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="w-8 h-8 mb-1" />
                        <span className="text-xs font-medium">Confirmado</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${['PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <div className={`flex flex-col items-center ${['PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <Package className="w-8 h-8 mb-1" />
                        <span className="text-xs font-medium">Preparando</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${['READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <div className={`flex flex-col items-center ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <Truck className="w-8 h-8 mb-1" />
                        <span className="text-xs font-medium">A Caminho</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${order.status === 'DELIVERED' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <div className={`flex flex-col items-center ${order.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="w-8 h-8 mb-1" />
                        <span className="text-xs font-medium">Entregue</span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Endereço de Entrega</p>
                        <p className="text-base text-gray-900">{order.delivery_address}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Itens do Pedido</h4>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Pagamento</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(order.total)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{order.payment_method}</p>
                      </div>
                    </div>

                    {order.observations && (
                      <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm font-medium text-yellow-900">Observações:</p>
                        <p className="text-sm text-yellow-800">{order.observations}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 text-center space-y-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="w-full max-w-md"
          >
            Voltar ao Cardápio
          </Button>
        </div>
      </div>
    </div>
  );
}
