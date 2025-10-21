import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Edit, Trash2, Shield, Bike } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  active?: boolean;
  vehicle_type?: string;
  created_at: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('👥 Buscando usuários...');
      
      // Buscar admins e deliverers
      const [adminsResult, deliverersResult] = await Promise.all([
        supabase.from('admins').select('*').order('created_at', { ascending: false }),
        supabase.from('deliverers').select('*').order('created_at', { ascending: false })
      ]);
      
      if (adminsResult.error) throw adminsResult.error;
      if (deliverersResult.error) throw deliverersResult.error;
      
      // Combinar e normalizar dados
      const allUsers: User[] = [
        ...(adminsResult.data || []).map(admin => ({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'admin',
          active: admin.active,
          created_at: admin.created_at
        })),
        ...(deliverersResult.data || []).map(deliverer => ({
          id: deliverer.id,
          name: deliverer.name,
          phone: deliverer.phone,
          email: deliverer.email,
          role: 'deliverer',
          status: deliverer.status,
          vehicle_type: deliverer.vehicle_type,
          active: deliverer.status !== 'OFFLINE', // Considerar ativo se não estiver OFFLINE
          created_at: deliverer.created_at
        }))
      ];
      
      console.log('✅ Usuários carregados:', allUsers.length);
      setUsers(allUsers);
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean, role: string) => {
    try {
      console.log('🔄 Alternando status do usuário:', userId, role);
      
      const table = role === 'admin' ? 'admins' : 'deliverers';
      const updateData = role === 'admin' 
        ? { active: !currentStatus }
        : { status: !currentStatus ? 'AVAILABLE' : 'OFFLINE' };
      
      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      });
      
      fetchUsers();
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário",
        variant: "destructive"
      });
    }
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
            <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          </div>
          <Button onClick={() => navigate('/admin/usuarios/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários Administrativos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário cadastrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3">Nome</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Função</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Criado em</th>
                      <th className="text-right p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            <Shield className="mr-2 h-4 w-4 text-blue-500" />
                            {user.name}
                          </div>
                        </td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              user.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="p-3">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/usuarios/${user.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={user.active ? "destructive" : "default"}
                              onClick={() => handleToggleActive(user.id, user.active, user.role)}
                            >
                              {user.active ? 'Desativar' : 'Ativar'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
