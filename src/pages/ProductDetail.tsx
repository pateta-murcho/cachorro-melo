import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeaderMobile } from "@/components/HeaderMobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { mockProducts, mockStore, CartItem } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold mb-4">Produto não encontrado</h2>
          <Button onClick={() => navigate("/cardapio")}>
            Voltar ao Cardápio
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      mockStore.addToCart(product);
    }
    setCartItems(mockStore.getCart());
    toast({
      title: "Produto adicionado!",
      description: `${quantity}x ${product.name} adicionado ao carrinho`,
    });
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <HeaderMobile 
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => navigate("/cardapio")}
      />
      
      <main className="container px-4 py-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/cardapio")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Cardápio
        </Button>

        {/* Product Image */}
        <div className="relative h-64 bg-gradient-subtle rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='256' viewBox='0 0 400 256'%3E%3Crect width='400' height='256' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='sans-serif' font-size='24'%3E🌭%3C/text%3E%3C/svg%3E";
            }}
          />
          {!product.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">Indisponível</Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <Badge className="bg-gradient-food text-white border-0">
                {product.category}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quantity & Observations */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Quantity Selector */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Quantidade</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Observações (opcional)</Label>
              <Textarea
                placeholder="Ex: sem cebola, molho à parte, bem passado..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Add to Cart */}
        <div className="sticky bottom-4 bg-background border rounded-lg p-4 shadow-food">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <Button
            variant="food"
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={!product.available}
          >
            {product.available ? "Adicionar ao Carrinho" : "Indisponível"}
          </Button>
        </div>
      </main>
    </div>
  );
}