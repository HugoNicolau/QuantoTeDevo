import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DividaService } from '../services/dividaService';
import { DividaCreateRequest, DividaFilter } from '../types/api';
import { toast } from 'sonner';

const dividaService = new DividaService();

export const useDividas = (filtros?: DividaFilter) => {
  return useQuery({
    queryKey: ['dividas', filtros],
    queryFn: () => dividaService.listarDividas(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useDividasDevendo = () => {
  return useQuery({
    queryKey: ['dividas', 'devendo'],
    queryFn: () => dividaService.listarDividasDevendo(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDividasRecebendo = () => {
  return useQuery({
    queryKey: ['dividas', 'recebendo'],
    queryFn: () => dividaService.listarDividasRecebendo(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDividasVencidas = () => {
  return useQuery({
    queryKey: ['dividas', 'vencidas'],
    queryFn: () => dividaService.listarDividasVencidas(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDividasVencendo = (dias: number = 7) => {
  return useQuery({
    queryKey: ['dividas', 'vencendo', dias],
    queryFn: () => dividaService.listarDividasVencendo(dias),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDividasPagas = () => {
  return useDividas({ paga: true });
};

export const useDividasPendentes = () => {
  return useDividas({ paga: false });
};

export const useDivida = (id: number) => {
  return useQuery({
    queryKey: ['dividas', id],
    queryFn: () => dividaService.buscarDivida(id),
    enabled: !!id,
  });
};

export const useSaldoUsuario = () => {
  return useQuery({
    queryKey: ['dividas', 'saldo'],
    queryFn: () => dividaService.obterSaldoUsuario(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useSaldoComUsuario = (usuarioId: number) => {
  return useQuery({
    queryKey: ['dividas', 'saldo', usuarioId],
    queryFn: () => dividaService.obterSaldoComUsuario(usuarioId),
    enabled: !!usuarioId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useEstatisticasDividas = () => {
  return useQuery({
    queryKey: ['dividas', 'estatisticas'],
    queryFn: () => dividaService.obterEstatisticas(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};


export const useCriarDivida = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (divida: DividaCreateRequest) => dividaService.criarDivida(divida),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividas'] });
      toast.success('Dívida criada com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao criar dívida';
      toast.error(message);
    },
  });
};

export const useAtualizarDivida = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: Partial<DividaCreateRequest> }) => 
      dividaService.atualizarDivida(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividas'] });
      toast.success('Dívida atualizada com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao atualizar dívida';
      toast.error(message);
    },
  });
};

export const useMarcarDividaComoPaga = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formaPagamento }: { id: number; formaPagamento: string }) => 
      dividaService.marcarComoPaga(id, formaPagamento),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividas'] });
      toast.success('Dívida marcada como paga!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao marcar dívida como paga';
      toast.error(message);
    },
  });
};

export const useExcluirDivida = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dividaId: number) => dividaService.excluirDivida(dividaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividas'] });
      toast.success('Dívida excluída com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao excluir dívida';
      toast.error(message);
    },
  });
};

export const useQuitarDividasComUsuario = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (usuarioId: number) => dividaService.quitarDividasComUsuario(usuarioId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dividas'] });
      toast.success(`${data.dividasQuitadas} dívidas quitadas! Valor total: R$ ${data.valorTotal.toFixed(2)}`);
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao quitar dívidas';
      toast.error(message);
    },
  });
};


