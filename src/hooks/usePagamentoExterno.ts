import { useMutation, useQuery } from '@tanstack/react-query';
import { pagamentoExternoService, type PagamentoExternoDto, type CriarLinkRequest, type ConfirmarPagamentoRequest } from '../services/pagamentoExternoService';

// Hook para criar link de pagamento
export const useCriarLinkPagamento = () => {
  return useMutation({
    mutationFn: (request: CriarLinkRequest) => pagamentoExternoService.criarLink(request),
    onError: (error) => {
      console.error('Erro ao criar link de pagamento:', error);
    }
  });
};

// Hook para buscar informações do pagamento (para página pública)
export const useBuscarPagamento = (linkId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['pagamento-externo', linkId],
    queryFn: () => linkId ? pagamentoExternoService.buscarPagamento(linkId) : Promise.reject('Link ID não fornecido'),
    enabled: !!linkId && enabled,
    retry: false, // Não retry para links inválidos
    refetchOnWindowFocus: false
  });
};

// Hook para confirmar pagamento
export const useConfirmarPagamento = () => {
  return useMutation({
    mutationFn: ({ linkId, request }: { linkId: string; request: ConfirmarPagamentoRequest }) => 
      pagamentoExternoService.confirmarPagamento(linkId, request),
    onError: (error) => {
      console.error('Erro ao confirmar pagamento:', error);
    }
  });
};

// Hook para listar pagamentos externos de uma conta
export const usePagamentosExternosPorConta = (contaId: number | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['pagamentos-externos', contaId],
    queryFn: () => contaId ? pagamentoExternoService.listarPorConta(contaId) : Promise.reject('Conta ID não fornecido'),
    enabled: !!contaId && enabled,
    refetchOnWindowFocus: false
  });
};
