import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { delivererApi } from '@/lib/delivererApiService';

export default function DelivererLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await delivererApi.login({ phone, password });

      if (response.success) {
        toast({
          title: '✅ Login realizado!',
          description: `Bem-vindo, ${response.data?.deliverer.name}!`,
        });
        navigate('/motoboy');
      } else {
        toast({
          title: '❌ Erro no login',
          description: response.error?.message || 'Credenciais inválidas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '❌ Erro',
        description: 'Não foi possível conectar ao servidor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
              <Bike className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Cachorro Melo</CardTitle>
          <CardDescription className="text-base">
            Área do Entregador - Faça login para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Entrando...
                </>
              ) : (
                <>
                  <Bike className="mr-2 h-5 w-5" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              🧪 Credenciais de Teste:
            </p>
            <p className="text-xs text-blue-800">
              <strong>Telefone:</strong> 11988776655<br />
              <strong>Senha:</strong> motoboy123
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              ← Voltar para o site
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
