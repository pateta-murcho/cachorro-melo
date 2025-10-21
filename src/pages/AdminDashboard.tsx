import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  ChefHat,
  LogOut,
  Settings,
  TrendingUp,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { adminApi as adminApiService } from "@/lib/adminApiService";

interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    todayOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AdminDashboard - Verificando autenticação...');
    
    // Verificar se está logado
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");
    
    console.log('Token existe?', !!token);
    console.log('AdminData existe?', !!adminData);
    
    if (!token || !adminData) {
      console.log('❌ NÃO autenticado - Redirecionando para /admin/login');
      navigate("/admin/login", { replace: true });
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      console.log('✅ Admin autenticado:', parsedAdmin.name);
      setAdminUser(parsedAdmin);
      loadDashboardData();
    } catch (error) {
      console.error('❌ Erro ao parsear adminData:', error);
      localStorage.clear();
      navigate("/admin/login", { replace: true });
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Carregando dados do dashboard...');
      
      const response = await adminApiService.getDashboardStats();
      console.log('📥 Resposta getDashboardStats:', response);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Erro ao carregar estatísticas');
      }
      
      // A API retorna { success: true, data: {...} }
      const statsData = response.data;
      console.log('📊 Stats data:', statsData);
      
      setStats({
        totalOrders: statsData.totalOrders || 0,
        todayOrders: statsData.totalOrders || 0, // Usando totalOrders como fallback
        totalProducts: statsData.totalProducts || 0,
        totalRevenue: statsData.totalRevenue || 0,
        pendingOrders: statsData.pendingOrders || 0
      });
      
      console.log('✅ Stats atualizados:', {
        totalOrders: statsData.totalOrders,
        totalProducts: statsData.totalProducts,
        pendingOrders: statsData.pendingOrders
      });
    } catch (error) {
      console.error("❌ Erro ao carregar dados do dashboard:", error);
      
      // Manter valores zerados em caso de erro
      setStats({
        totalOrders: 0,
        todayOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        pendingOrders: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Fazendo logout...');
    localStorage.clear();
    
    // SEM TOAST IRRITANTE
    console.log('🚀 Redirecionando para /admin/login');
    window.location.href = '/admin/login';
  };

  if (!adminUser) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔄</div>
        <p>Carregando...</p>
      </div>
    </div>;
  }

  const quickActions = [
    {
      title: "Cadastrar Produto",
      description: "Adicionar novo produto ao cardápio",
      icon: Package,
      onClick: () => navigate("/admin/produtos/novo"),
      color: "bg-blue-500"
    },
    {
      title: "Ver Pedidos",
      description: "Gerenciar pedidos recebidos",
      icon: ShoppingCart,
      onClick: () => navigate("/admin/pedidos"),
      color: "bg-green-500"
    },
    {
      title: "Cozinha",
      description: "Acompanhar preparo dos pedidos",
      icon: ChefHat,
      onClick: () => navigate("/admin/cozinha"),
      color: "bg-orange-500"
    },
    {
      title: "Produtos",
      description: "Gerenciar cardápio completo",
      icon: Package,
      onClick: () => navigate("/admin/produtos"),
      color: "bg-purple-500"
    }
  ];

  const statsCards = [
    {
      title: "Pedidos Hoje",
      value: stats.todayOrders,
      subtitle: "pedidos",
      icon: Clock,
      color: "text-blue-600"
    },
    {
      title: "Total de Pedidos",
      value: stats.totalOrders,
      subtitle: "pedidos",
      icon: ShoppingCart,
      color: "text-green-600"
    },
    {
      title: "Produtos Ativos",
      value: stats.totalProducts,
      subtitle: "produtos",
      icon: Package,
      color: "text-purple-600"
    },
    {
      title: "Faturamento",
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      subtitle: "hoje",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🌭</div>
              <div>
                <h1 className="text-xl font-bold">Cachorro Melo - Admin</h1>
                <p className="text-sm text-muted-foreground">Painel Administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {stats.pendingOrders > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {stats.pendingOrders} pedidos pendentes
                </Badge>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Olá, {adminUser.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </p>
                    </div>
                    <div className={`${stat.color}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted/50"
                    onClick={action.onClick}
                  >
                    <div className={`${action.color} text-white p-3 rounded-lg`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Últimos Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: "#1234", customer: "João Silva", total: "R$ 25,50", status: "Preparando" },
                  { id: "#1235", customer: "Maria Santos", total: "R$ 18,00", status: "Pronto" },
                  { id: "#1236", customer: "Pedro Costa", total: "R$ 32,90", status: "Entregue" }
                ].map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{order.total}</p>
                      <Badge 
                        variant={order.status === "Entregue" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/admin/pedidos")}
              >
                Ver Todos os Pedidos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos em Destaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Hot Dog Especial", sales: 45, revenue: "R$ 540,00" },
                  { name: "X-Dog Burger", sales: 32, revenue: "R$ 480,00" },
                  { name: "Combo Dog + Batata", sales: 28, revenue: "R$ 504,00" }
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} vendidos hoje</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/admin/produtos")}
              >
                Gerenciar Produtos
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}