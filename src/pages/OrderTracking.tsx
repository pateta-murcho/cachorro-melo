import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeaderMobile } from "@/components/HeaderMobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Truck, 
  ChefHat,
  Phone,
  MapPin,
  QrCode
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/lib/apiService";

interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  total: number;
  payment_method: 'pix' | 'card' | 'cash';
  delivery_address: string;
  customer_name: string;
  customer_phone: string;
  otp?: string;
  estimated_delivery?: string;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: string;
    };
  }>;
}

const statusConfig: Record<Order['status'], {label: string; description: string; icon: any; color: string}> = {
  PENDING: {
    label: "Pedido Recebido",
    description: "Seu pedido foi recebido",
    icon: CheckCircle,
    color: "bg-blue-500"
  },
  CONFIRMED: {
    label: "Confirmado",
    description: "Pedido confirmado e será preparado em breve",
    icon: CheckCircle,
    color: "bg-blue-500"
  },
  PREPARING: {
    label: "Preparando",
    description: "Nossos chefs estão preparando seu pedido",
    icon: ChefHat,
    color: "bg-yellow-500"
  },
  READY: {
    label: "Pronto para Entrega",
    description: "Pedido finalizado, aguardando motoboy",
    icon: CheckCircle,
    color: "bg-green-500"
  },
  OUT_FOR_DELIVERY: {
    label: "Saiu para Entrega",
    description: "Motoboy a caminho do seu endereço",
    icon: Truck,
    color: "bg-blue-600"
  },
  DELIVERED: {
    label: "Entregue",
    description: "Pedido entregue com sucesso! Bom apetite!",
    icon: CheckCircle,
    color: "bg-green-600"
  },
  CANCELLED: {
    label: "Cancelado",
    description: "Pedido foi cancelado",
    icon: CheckCircle,
    color: "bg-red-500"
  }
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadOrder = async () => {
      if (id) {
        try {
          const apiOrder = await apiService.getOrder(id);
          if (apiOrder) {
            // Map API order to component order format
            setOrder({
              id: apiOrder.id,
              status: apiOrder.status,
              total: parseFloat(apiOrder.total_amount),
              payment_method: apiOrder.payment_method,
              delivery_address: apiOrder.delivery_address || '',
              customer_name: apiOrder.customer?.name || '',
              customer_phone: apiOrder.customer?.phone || '',
              otp: apiOrder.otp || undefined,
              estimated_delivery: apiOrder.estimated_delivery_time || undefined,
              items: apiOrder.items || []
            });
          }
        } catch (error) {
          console.error('Erro ao carregar pedido:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar o pedido",
            variant: "destructive"
          });
        }
      }
    };

    loadOrder();
  }, [id]);

  // Real-time clock update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <HeaderMobile />
        <main className="container px-4 py-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">😕</div>
            <h2 className="text-2xl font-bold">Pedido não encontrado</h2>
            <p className="text-muted-foreground">Verifique o número do pedido</p>
            <Button onClick={() => navigate("/cardapio")} variant="food">
              Fazer Novo Pedido
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <HeaderMobile />
      
      <main className="container px-4 py-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/cardapio")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Cardápio
        </Button>

        {/* Order Header */}
        <Card className="bg-gradient-food text-white">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">🌭</div>
            <h1 className="text-xl font-bold mb-2">Pedido #{order.id}</h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <StatusIcon className="h-5 w-5" />
              <span className="font-semibold">{currentStatus.label}</span>
            </div>
            <p className="text-sm opacity-90">{currentStatus.description}</p>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Acompanhar Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statusConfig).map(([status, config], index) => {
                const isActive = order.status === status;
                const isCompleted = Object.keys(statusConfig).indexOf(order.status) > index;
                const StatusIcon = config.icon;

                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive || isCompleted ? config.color : 'bg-gray-200'}
                      ${isActive ? 'ring-4 ring-blue-200' : ''}
                    `}>
                      <StatusIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {config.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                      {isActive && (
                        <div className="text-xs text-primary font-medium mt-1">
                          Atualizado às {formatTime(currentTime)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        {order.status === 'out_for_delivery' && order.otp && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-primary">Código de Entrega (OTP)</h3>
                <div className="text-3xl font-mono font-bold text-primary">
                  {order.otp}
                </div>
                <p className="text-sm text-muted-foreground">
                  Informe este código ao entregador para confirmar a entrega
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estimated Time */}
        {order.estimatedDelivery && order.status !== 'delivered' && (
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Tempo Estimado</h3>
              <p className="text-lg font-bold text-primary">
                {formatTime(order.estimatedDelivery)}
              </p>
              <p className="text-sm text-muted-foreground">
                Estimativa de entrega
              </p>
            </CardContent>
          </Card>
        )}

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Forma de pagamento:</span>
              <Badge variant={order.paymentMethod === 'pix' ? 'default' : 'secondary'}>
                {order.paymentMethod === 'pix' ? (
                  <><QrCode className="h-3 w-3 mr-1" /> PIX</>
                ) : (
                  <>💳 Na Entrega</>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <span>{item.quantity}x {item.product.name}</span>
                <span className="font-semibold">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <span className="font-semibold">{order.customerInfo.name}</span>
                <br />
                <span className="text-muted-foreground">{order.customerInfo.phone}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <span className="text-sm">{order.customerInfo.address}</span>
            </div>
            {order.customerInfo.observations && (
              <div className="text-sm text-muted-foreground">
                <strong>Observações:</strong> {order.customerInfo.observations}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="food" className="w-full" onClick={() => navigate("/cardapio")}>
            Fazer Novo Pedido
          </Button>
          <Button variant="outline" className="w-full">
            <Phone className="h-4 w-4 mr-2" />
            Entrar em Contato
          </Button>
        </div>
      </main>
    </div>
  );
}