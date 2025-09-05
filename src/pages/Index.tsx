import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-food text-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="space-y-4">
            <div className="text-8xl animate-bounce">🌭</div>
            <h1 className="text-4xl font-bold">Cachorro Melo</h1>
            <p className="text-xl opacity-90">Os melhores cachorros-quentes da região!</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <p className="text-sm opacity-80 mb-2">🚚 Entrega Rápida</p>
              <p className="font-semibold">30-40 minutos</p>
            </div>
            
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full text-lg font-semibold"
              onClick={() => window.location.href = '/cardapio'}
            >
              Ver Cardápio
            </Button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-6 text-center text-sm opacity-75">
        <p>📱 WhatsApp: (11) 99999-9999</p>
        <p>📍 Food Truck - Localização via GPS</p>
      </footer>
    </div>
  );
};

export default Index;
