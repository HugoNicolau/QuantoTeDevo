
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import Index from "./pages/Index";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import CadastrarConta from "./pages/CadastrarConta";
import VisualizarSaldos from "./pages/VisualizarSaldos";
import VisualizarContas from "./pages/VisualizarContas";
import DividirDespesas from "./pages/DividirDespesas";
import NotFound from "./pages/NotFound";
import React, { Suspense } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cadastrar-conta" element={<CadastrarConta />} />
                <Route path="/visualizar-saldos" element={<VisualizarSaldos />} />
                <Route path="/visualizar-contas" element={<VisualizarContas />} />
                <Route path="/dividir-despesas" element={<DividirDespesas />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </Suspense>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
