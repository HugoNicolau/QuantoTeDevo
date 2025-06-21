
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CadastrarConta from "./pages/CadastrarConta";
import VisualizarSaldos from "./pages/VisualizarSaldos";
import VisualizarContas from "./pages/VisualizarContas";
import DividirDespesas from "./pages/DividirDespesas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cadastrar-conta" element={<CadastrarConta />} />
            <Route path="/visualizar-saldos" element={<VisualizarSaldos />} />
            <Route path="/visualizar-contas" element={<VisualizarContas />} />
            <Route path="/dividir-despesas" element={<DividirDespesas />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
