import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Detectar se está acessando por IP ou localhost
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : `http://${window.location.hostname}:3001/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Verificar se já está logado
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      console.log('✅ Já está logado! Redirecionando para dashboard...');
      window.location.href = '/admin/dashboard';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Iniciando login...');
      console.log('📧 Email:', formData.email);
      console.log('🌐 API URL:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Status da resposta:', response.status);
      const result = await response.json();
      console.log('📥 Resposta do servidor:', result);

      if (!result.success) {
        throw new Error(result.error?.message || 'Credenciais inválidas');
      }

      if (!result.data || !result.data.admin || !result.data.token) {
        console.error('❌ Estrutura de resposta inválida:', result);
        throw new Error('Resposta do servidor inválida');
      }

      // Salvar dados no localStorage
      console.log('💾 Salvando dados no localStorage...');
      localStorage.setItem('adminToken', result.data.token);
      localStorage.setItem('adminData', JSON.stringify(result.data.admin));
      
      // Verificar se salvou
      const verificaToken = localStorage.getItem('adminToken');
      const verificaData = localStorage.getItem('adminData');
      console.log('✅ Token salvo:', verificaToken ? 'SIM' : 'NÃO');
      console.log('✅ Admin salvo:', verificaData ? 'SIM' : 'NÃO');
      console.log('👤 Admin:', result.data.admin.name);
      
      // Redirecionar SEM toast irritante
      console.log('🚀 Redirecionando para /admin/dashboard...');
      window.location.href = '/admin/dashboard';
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Verifique suas credenciais",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao site
        </Button>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
            <p className="text-sm text-gray-500">Cachorromelo Delivery</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@cachorromelo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Credenciais de teste:</p>
              <p className="font-mono text-xs mt-1">admin@cachorromelo.com / admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
