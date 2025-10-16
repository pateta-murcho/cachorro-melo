import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bike, Package, MapPin, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { delivererApi } from '@/lib/delivererApiService';
import { useToast } from '@/hooks/use-toast';

export default function DelivererSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const deliverer = delivererApi.getDelivererData();

  const handleLogout = () => {
    delivererApi.logout();
    toast({
      title: '👋 Até logo!',
      description: 'Você foi desconectado com sucesso',
    });
    navigate('/deliverer/login');
  };

  const menuItems = [
    {
      path: '/motoboy',
      icon: Package,
      label: 'Pedidos Disponíveis',
      description: 'Ver pedidos prontos'
    },
    {
      path: '/entregando',
      icon: MapPin,
      label: 'Em Entrega',
      description: 'Entregas em andamento'
    }
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Bike className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Cachorro Melo</h1>
              <p className="text-xs text-gray-500">Área do Entregador</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {deliverer?.name || 'Entregador'}
              </p>
              <p className="text-xs text-gray-600">
                {deliverer?.total_deliveries || 0} entregas
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className={`text-xs ${isActive ? 'text-orange-100' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <nav className="flex justify-around items-center h-16">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1 font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full text-red-500 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Sair</span>
          </button>
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-gray-900">Cachorro Melo</h1>
              <p className="text-xs text-gray-500">Entregador</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-900">{deliverer?.name}</p>
            <p className="text-xs text-gray-500">{deliverer?.total_deliveries || 0} entregas</p>
          </div>
        </div>
      </div>
    </>
  );
}
