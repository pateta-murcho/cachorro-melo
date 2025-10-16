import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminProductForm from "./pages/AdminProductForm";
import AdminOrders from "./pages/AdminOrders";
import AdminKitchen from "./pages/AdminKitchen";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";

// Deliverer pages
import DelivererLogin from "./pages/DelivererLogin";
import DelivererDashboard from "./pages/DelivererDashboard";
import DeliveringPage from "./pages/DeliveringPage";

// Customer pages
import MeusPedidos from "./pages/MeusPedidos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Index />} />
          <Route path="/cardapio" element={<Menu />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido/:id" element={<OrderTracking />} />
          <Route path="/meus-pedidos" element={<MeusPedidos />} />
          
          {/* Rotas admin */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/produtos" element={<AdminProducts />} />
          <Route path="/admin/produtos/novo" element={<AdminProductForm />} />
          <Route path="/admin/produtos/:id" element={<AdminProductForm />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          <Route path="/admin/cozinha" element={<AdminKitchen />} />
          <Route path="/admin/usuarios" element={<AdminUsers />} />
          <Route path="/admin/relatorios" element={<AdminReports />} />
          
          {/* Rotas motoboy/entregador */}
          <Route path="/deliverer/login" element={<DelivererLogin />} />
          <Route path="/motoboy" element={<DelivererDashboard />} />
          <Route path="/entregando" element={<DeliveringPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
