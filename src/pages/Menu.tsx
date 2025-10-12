import { useState, useMemo, useEffect } from "react";
import { HeaderMobile } from "@/components/HeaderMobile";
import { ProductCard, Product } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { mockProducts, categories, mockStore, CartItem } from "@/lib/mockData";
import { apiService } from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function Menu() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar produtos da API
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        console.log('🔍 Carregando produtos da API...');
        const apiProducts = await apiService.getProducts();
        
        // Converter produtos da API para o formato do frontend
        const formattedProducts: Product[] = apiProducts.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price),
          image: `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(product.name)}`,
          category: product.category?.name?.toLowerCase() || 'outros',
          available: product.available !== false
        }));
        
        console.log('✅ Produtos carregados da API:', formattedProducts.length);
        setProducts(formattedProducts);
      } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        toast({
          title: "Aviso",
          description: "Usando dados locais temporariamente",
          variant: "default"
        });
        // Usar produtos mock como fallback
        setProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const handleAddToCart = (product: Product) => {
    mockStore.addToCart(product);
    setCartItems(mockStore.getCart());
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  const handleProductClick = (product: Product) => {
    navigate(`/produto/${product.id}`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    mockStore.updateCartItemQuantity(productId, quantity);
    setCartItems(mockStore.getCart());
  };

  const handleRemoveItem = (productId: string) => {
    mockStore.removeFromCart(productId);
    setCartItems(mockStore.getCart());
    toast({
      title: "Produto removido",
      description: "Item removido do carrinho",
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <HeaderMobile 
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <main className="container px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="text-6xl">🌭</div>
          <h1 className="text-3xl font-bold text-primary">Cachorro Melo</h1>
          <p className="text-muted-foreground">Os melhores cachorros-quentes da região!</p>
          <Badge className="bg-gradient-food text-white border-0">Entrega em 30-40min</Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "food" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😕</div>
            <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">Tente buscar por outro termo ou categoria</p>
          </div>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        cartTotal={mockStore.getCartTotal()}
      />
    </div>
  );
}