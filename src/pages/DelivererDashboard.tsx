import { useState, useEffect } from 'react';
import { Package, Clock, MapPin, DollarSign, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { delivererApi, DeliveryOrder } from '@/lib/delivererApiService';
import DelivererSidebar from '@/components/DelivererSidebar';
import { useNavigate } from 'react-router-dom';

export default function DelivererDashboard() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingDelivery, setStartingDelivery] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!delivererApi.isAuthenticated()) {
      navigate('/deliverer/login');
      return;
    }
    loadOrders();
    // Recarregar a cada 30 segundos
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadOrders = async () => {
    const response = await delivererApi.getAvailableOrders();
    if (response.success && response.data) {
      setOrders(response.data);
    }
    setLoading(false);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleStartDelivery = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: '⚠️ Nenhum pedido selecionado',
        description: 'Selecione pelo menos um pedido para iniciar a entrega',
        variant: 'destructive',
      });
      return;
    }

    setStartingDelivery(true);

    const response = await delivererApi.startDelivery(selectedOrders);

    if (response.success) {
      toast({
        title: '🚀 Entrega iniciada!',
        description: `${selectedOrders.length} pedido(s) adicionado(s) à sua rota`,
      });
      setSelectedOrders([]);
      await loadOrders();
      navigate('/entregando');
    } else {
      toast({
        title: '❌ Erro',
        description: response.error?.message || 'Não foi possível iniciar a entrega',
        variant: 'destructive',
      });
    }

    setStartingDelivery(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-yellow-100 text-yellow-800',
      READY: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      CONFIRMED: 'Confirmado',
      PREPARING: 'Preparando',
      READY: 'Pronto',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DelivererSidebar />

      {/* Main Content */}
      <div className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              📦 Pedidos Disponíveis
            </h1>
            <p className="text-gray-600">
              Selecione os pedidos que deseja entregar e inicie sua rota
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Disponíveis</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Selecionados</p>
                    <p className="text-2xl font-bold text-orange-500">{selectedOrders.length}</p>
                  </div>
                  <Check className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-1">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        orders
                          .filter(o => selectedOrders.includes(o.id))
                          .reduce((sum, o) => sum + Number(o.total), 0)
                      )}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          {selectedOrders.length > 0 && (
            <div className="mb-6">
              <Button
                onClick={handleStartDelivery}
                disabled={startingDelivery}
                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6 text-lg"
                size="lg"
              >
                {startingDelivery ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Iniciando entrega...
                  </>
                ) : (
                  <>
                    🚀 Iniciar Entrega ({selectedOrders.length} {selectedOrders.length === 1 ? 'pedido' : 'pedidos'})
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Carregando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhum pedido disponível
                </h3>
                <p className="text-gray-500">
                  Aguarde novos pedidos ficarem prontos para entrega
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className={`transition-all cursor-pointer hover:shadow-md ${
                    selectedOrders.includes(order.id)
                      ? 'ring-2 ring-orange-500 bg-orange-50'
                      : ''
                  }`}
                  onClick={() => toggleOrderSelection(order.id)}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                        className="mt-1"
                      />

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {order.customer_name || 'Cliente'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {order.customer_phone}
                            </p>
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-1">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(Number(order.total))}
                            </p>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-2 mb-3 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{order.delivery_address}</p>
                        </div>

                        {/* Items */}
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            📦 Itens ({order.items?.length || 0}):
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {order.items?.map((item, idx) => (
                              <li key={idx}>
                                • {item.quantity}x {item.product_name}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Payment & Time */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {order.payment_method}
                          </div>
                        </div>

                        {order.observations && (
                          <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-xs text-yellow-800">
                              <strong>Obs:</strong> {order.observations}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
