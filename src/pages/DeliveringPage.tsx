import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, CheckCircle, Phone, DollarSign, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { delivererApi, DeliveryOrder } from '@/lib/delivererApiService';
import DelivererSidebar from '@/components/DelivererSidebar';

export default function DeliveringPage() {
  console.log('🚀 DeliveringPage montado!');
  
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [currentDeliveryIndex, setCurrentDeliveryIndex] = useState(0);
  const [deliveryCode, setDeliveryCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        if (!delivererApi.isAuthenticated()) {
          console.log('❌ Não autenticado, redirecionando...');
          navigate('/deliverer/login');
          return;
        }
        console.log('✅ Autenticado, carregando entregas...');
        await loadDeliveries();
      } catch (error) {
        console.error('❌ Erro ao carregar:', error);
        setHasError(true);
        setLoading(false);
      }
    };
    
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    // Simular navegação quando iniciar
    if (isNavigating) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
            setIsNavigating(false);
            toast({
              title: '📍 Chegou ao destino!',
              description: 'Insira o código de entrega para confirmar',
            });
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isNavigating, toast]);

  const loadDeliveries = async () => {
    try {
      const response = await delivererApi.getMyDeliveries();
      
      if (response.success) {
        if (response.data && response.data.length === 0) {
          toast({
            title: '📦 Nenhuma entrega ativa',
            description: 'Inicie entregas primeiro no dashboard',
          });
          setDeliveries([]);
          setLoading(false);
          return;
        }
        if (response.data && response.data.length > 0) {
          setDeliveries(response.data);
        }
      } else {
        toast({
          title: 'Erro ao carregar',
          description: response.error?.message || 'Erro desconhecido',
          variant: 'destructive',
        });
        setHasError(true);
      }
    } catch (error) {
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao servidor',
        variant: 'destructive',
      });
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNavigation = () => {
    console.log('🚀 Iniciando navegação simulada...');
    setIsNavigating(true);
    setProgress(0);
    
    // Simular progresso automático
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsNavigating(false);
          console.log('✅ Chegou ao destino!');
          toast({
            title: '📍 Você chegou!',
            description: 'Digite o código de entrega',
          });
          return 100;
        }
        return prev + 2; // Aumenta 2% a cada 100ms = 5 segundos total
      });
    }, 100);
    
    toast({
      title: '🚀 Navegação iniciada',
      description: 'Simulando trajeto até o destino...',
    });
  };

  const handleSkipToConfirmation = () => {
    console.log('⚡ Pulando direto para confirmação...');
    setProgress(100);
    setIsNavigating(false);
    toast({
      title: '📍 Você chegou!',
      description: 'Digite o código de entrega',
    });
  };

  const handleConfirmDelivery = async () => {
    if (!currentDelivery) return;

    if (deliveryCode.length !== 3) {
      toast({
        title: '⚠️ Código inválido',
        description: 'O código deve ter 3 dígitos',
        variant: 'destructive',
      });
      return;
    }

    setConfirming(true);

    const response = await delivererApi.confirmDelivery(currentDelivery.id, deliveryCode);

    if (response.success) {
      toast({
        title: '✅ Entrega confirmada!',
        description: 'Pedido entregue com sucesso! 🎉',
      });

      // Remover o pedido entregue da lista
      const updatedDeliveries = deliveries.filter(d => d.id !== currentDelivery.id);
      setDeliveries(updatedDeliveries);

      // Verificar se ainda há entregas pendentes
      if (updatedDeliveries.length === 0) {
        // Não há mais entregas - voltar ao dashboard
        toast({
          title: '🎉 Todas as entregas concluídas!',
          description: 'Parabéns pelo excelente trabalho!',
        });
        setTimeout(() => navigate('/motoboy'), 1500);
      } else {
        // Ainda há entregas - resetar para a próxima
        setCurrentDeliveryIndex(0);
        setDeliveryCode('');
        setIsNavigating(false);
        setProgress(0);
        
        toast({
          title: '📦 Próxima entrega',
          description: `${updatedDeliveries.length} entrega(s) restante(s)`,
        });
      }
    } else {
      toast({
        title: '❌ Código incorreto',
        description: response.error?.message || 'Verifique o código e tente novamente',
        variant: 'destructive',
      });
    }

    setConfirming(false);
  };

  const currentDelivery = deliveries[currentDeliveryIndex];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <DelivererSidebar />
        <div className="text-center p-8">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-xl font-semibold text-gray-700">Carregando entregas...</p>
          <p className="text-sm text-gray-500 mt-2">Por favor, aguarde</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <DelivererSidebar />
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao Carregar</h2>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar as entregas. Verifique sua conexão.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-orange-500 hover:bg-orange-600"
            >
              🔄 Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sem entregas
  if (!currentDelivery || deliveries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <DelivererSidebar />
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma Entrega</h2>
            <p className="text-gray-600 mb-4">
              Você não tem entregas em andamento no momento.
            </p>
            <Button 
              onClick={() => navigate('/motoboy')} 
              className="bg-orange-500 hover:bg-orange-600"
            >
              📦 Ver Pedidos Disponíveis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ Renderizando página de entrega completa...');

  return (
    <div className="min-h-screen bg-gray-50">
      <DelivererSidebar />

      <div className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                🏍️ Entrega {currentDeliveryIndex + 1} de {deliveries.length}
              </h1>
              <p className="text-sm text-gray-600">{currentDelivery.customer_name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(currentDelivery.total))}
              </p>
              <p className="text-xs text-gray-500">{currentDelivery.payment_method}</p>
            </div>
          </div>

          {/* Map Simulator - LAYOUT RESPONSIVO MELHORADO */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 via-green-50 to-orange-50">
            <div className="h-full w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden min-h-[60vh]">
              
              {/* Background pattern decorativo */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000015_1px,transparent_1px),linear-gradient(to_bottom,#00000015_1px,transparent_1px)] bg-[size:50px_50px]"></div>
              </div>

              {/* Container Principal - Responsivo */}
              <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6">
                
                {/* Animação de Entrega */}
                <div className="text-center w-full">
                  {isNavigating ? (
                    <div className="space-y-4">
                      <div className="text-7xl md:text-8xl animate-bounce">🏍️</div>
                      <div className="w-full max-w-md mx-auto">
                        <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 transition-all duration-100 ease-linear shadow-lg"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="mt-3 text-xl md:text-2xl font-bold text-gray-800">
                          Navegando... {progress}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Você está a caminho do destino 🚀
                        </p>
                      </div>
                    </div>
                  ) : progress === 100 ? (
                    <div className="space-y-3">
                      <div className="text-7xl md:text-8xl animate-pulse">📍</div>
                      <p className="text-2xl md:text-3xl font-bold text-green-600">
                        Você chegou!
                      </p>
                      <p className="text-gray-600">
                        Solicite o código de confirmação ao cliente
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-7xl md:text-8xl">🗺️</div>
                      <p className="text-xl md:text-2xl font-semibold text-gray-700">
                        Pronto para iniciar?
                      </p>
                      <p className="text-gray-600">
                        Inicie a navegação ou pule direto para confirmação
                      </p>
                    </div>
                  )}
                </div>

                {/* Card de Estatísticas */}
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-2 border-orange-100">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium">Distância</p>
                      <p className="text-2xl font-bold text-orange-600">~2.5 km</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium">Tempo estimado</p>
                      <p className="text-2xl font-bold text-orange-600">~10 min</p>
                    </div>
                  </div>
                </div>

                {/* Botões de Navegação - Layout Responsivo */}
                {!isNavigating && progress < 100 && (
                  <div className="w-full max-w-md space-y-3 mt-4">
                    <Button
                      onClick={handleStartNavigation}
                      size="lg"
                      className="w-full h-16 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl text-base md:text-lg font-bold transform transition hover:scale-105 active:scale-95"
                    >
                      <Navigation className="mr-2 w-6 h-6" />
                      Iniciar Navegação (5s)
                    </Button>
                    
                    <Button
                      onClick={handleSkipToConfirmation}
                      variant="outline"
                      size="lg"
                      className="w-full h-14 bg-white hover:bg-gray-50 shadow-xl border-2 border-orange-400 text-orange-600 font-semibold transform transition hover:scale-105 active:scale-95"
                    >
                      ⚡ Pular e Confirmar Agora
                    </Button>
                  </div>
                )}
                
              </div>
            </div>
          </div>

          {/* Delivery Info Card */}
          <div className="bg-white border-t p-4 max-h-[50vh] overflow-y-auto shadow-lg">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Endereço de Entrega</p>
                  <p className="text-base text-gray-900 font-semibold">{currentDelivery.delivery_address}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Contato</p>
                  <a 
                    href={`tel:${currentDelivery.customer_phone}`}
                    className="text-base text-green-600 font-semibold hover:underline"
                  >
                    {currentDelivery.customer_phone}
                  </a>
                </div>
              </div>

              {/* Items */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Itens do Pedido ({currentDelivery.items?.length || 0})
                  </p>
                  <ul className="space-y-1">
                    {currentDelivery.items?.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • <strong>{item.quantity}x</strong> {item.product_name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Pagamento</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(Number(currentDelivery.total))}
                  </p>
                  <p className="text-sm text-gray-600">{currentDelivery.payment_method}</p>
                </div>
              </div>

              {currentDelivery.observations && (
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Observação:</strong> {currentDelivery.observations}
                  </p>
                </div>
              )}

              {/* Delivery Confirmation */}
              {progress === 100 && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                  <div className="flex items-center gap-2 text-green-700 justify-center">
                    <CheckCircle className="w-6 h-6" />
                    <p className="font-bold text-lg">Você chegou ao destino!</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-white rounded-lg border-2 border-orange-300">
                      <p className="text-sm text-gray-600 mb-2">Código de Entrega do Pedido:</p>
                      <p className="text-5xl font-bold text-orange-500 tracking-widest">
                        {currentDelivery.delivery_code || '???'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Peça este código ao cliente</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Digite o código fornecido pelo cliente:
                      </label>
                      <Input
                        type="text"
                        placeholder="123"
                        maxLength={3}
                        value={deliveryCode}
                        onChange={(e) => setDeliveryCode(e.target.value.replace(/\D/g, ''))}
                        className="text-center text-3xl font-bold tracking-widest h-16"
                      />
                    </div>

                    <Button
                      onClick={handleConfirmDelivery}
                      disabled={confirming || deliveryCode.length !== 3}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-6 text-lg"
                      size="lg"
                    >
                      {confirming ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 w-6 h-6" />
                          Confirmar Entrega
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
