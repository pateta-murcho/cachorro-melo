import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderMobile } from "@/components/HeaderMobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Phone, User, CreditCard, QrCode } from "lucide-react";
import { mockStore, CartItem } from "@/lib/mockData";
import { apiService, CreateOrderRequest } from "@/lib/apiService";
import { toast } from "@/hooks/use-toast";

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  observations: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems] = useState<CartItem[]>(mockStore.getCart());
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'delivery'>('pix');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    observations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartTotal = mockStore.getCartTotal();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo",
        variant: "destructive"
      });
      return false;
    }

    if (!customerInfo.phone.trim() || customerInfo.phone.length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, informe um número de telefone válido",
        variant: "destructive"
      });
      return false;
    }

    if (!customerInfo.address.trim()) {
      toast({
        title: "Endereço obrigatório",
        description: "Por favor, informe o endereço completo para entrega",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para a API
      const orderData: CreateOrderRequest = {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: `${customerInfo.phone}@temp.com`, // Email temporário
        delivery_address: customerInfo.address,
        payment_method: paymentMethod === 'pix' ? 'PIX' : 'CASH',
        notes: customerInfo.observations || undefined,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          observations: item.observations
        }))
      };

      // Fazer requisição real para a API
      const order = await apiService.createOrder(orderData);
      
      // Limpar carrinho local
      mockStore.clearCart();
      
      // Navigate to meus pedidos com o ID do pedido
      navigate(`/meus-pedidos?orderId=${order.id}`);
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      toast({
        title: "Erro ao processar pedido",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <HeaderMobile />
        <main className="container px-4 py-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">🛒</div>
            <h2 className="text-2xl font-bold">Carrinho vazio</h2>
            <p className="text-muted-foreground">Adicione produtos ao carrinho para continuar</p>
            <Button onClick={() => navigate("/cardapio")} variant="food">
              Ver Cardápio
            </Button>
          </div>
        </main>
      </div>
    );
  }

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

        <h1 className="text-2xl font-bold text-center">Finalizar Pedido</h1>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-sm">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="font-semibold">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(cartTotal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp
              </Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço Completo
              </Label>
              <Textarea
                id="address"
                placeholder="Rua, número, complemento, bairro, CEP"
                value={customerInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações (opcional)</Label>
              <Textarea
                id="observations"
                placeholder="Ponto de referência, observações sobre a entrega..."
                value={customerInfo.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={(value: 'pix' | 'delivery') => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">PIX</div>
                    <div className="text-sm text-muted-foreground">Pagamento instantâneo via QR Code</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Pagar na Entrega</div>
                    <div className="text-sm text-muted-foreground">Cartão de débito/crédito ou dinheiro</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          variant="food"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processando..." : `Confirmar Pedido - ${formatPrice(cartTotal)}`}
        </Button>
      </main>
    </div>
  );
}