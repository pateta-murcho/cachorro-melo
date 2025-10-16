import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, DollarSign, ShoppingBag, Users, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : `http://${window.location.hostname}:3001/api`;

interface ReportStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByPeriod: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function AdminReports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30'); // dias

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/reports?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleExport = () => {
    toast({
      title: "Exportando",
      description: "Relatório será baixado em breve..."
    });
    // Implementar exportação CSV/PDF
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
          </div>
          <div className="flex space-x-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando relatórios...</div>
        ) : stats ? (
          <>
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Últimos {period} dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pedidos realizados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.averageOrderValue)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Por pedido
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Clientes únicos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Produtos mais vendidos */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topProducts && stats.topProducts.length > 0 ? (
                    stats.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.quantity} unidades</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(product.revenue)}</div>
                          <div className="text-sm text-gray-500">Receita</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Nenhum dado disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Evolução de vendas */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.revenueByPeriod && stats.revenueByPeriod.length > 0 ? (
                    stats.revenueByPeriod.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm">{item.date}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.revenue)}</div>
                          <div className="text-xs text-gray-500">{item.orders} pedidos</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Nenhum dado disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhum dado disponível para o período selecionado
          </div>
        )}
      </div>
    </div>
  );
}
