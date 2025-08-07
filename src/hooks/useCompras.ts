import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompraService } from '../services/compraService';
import { CompraCreateRequest, CompraFilter, ItemCompraCreateRequest } from '../types/api';
import { toast } from 'sonner';

const compraService = new CompraService();

// Hook principal que combina compras criadas e participando
export const useCompras = (filtros?: CompraFilter) => {
  return useQuery({
    queryKey: ['compras', 'todas', filtros],
    queryFn: async () => {
      // Combina compras criadas e participando
      const [criadas, participando] = await Promise.all([
        compraService.listarComprasCriadas(undefined, filtros),
        compraService.listarComprasParticipando(undefined, filtros)
      ]);
      
      // Remove duplicatas baseado no ID
      const comprasMap = new Map();
      [...criadas, ...participando].forEach(compra => {
        comprasMap.set(compra.id, compra);
      });
      
      return Array.from(comprasMap.values());
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useComprasCriadas = () => {
  return useQuery({
    queryKey: ['compras', 'criadas'],
    queryFn: () => compraService.listarComprasCriadas(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useComprasParticipando = () => {
  return useQuery({
    queryKey: ['compras', 'participando'],
    queryFn: () => compraService.listarComprasParticipando(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useComprasAtivas = () => {
  return useQuery({
    queryKey: ['compras', 'ativas'],
    queryFn: () => compraService.listarComprasAtivas(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useComprasFinalizadas = () => {
  return useQuery({
    queryKey: ['compras', 'finalizadas'],
    queryFn: () => compraService.listarComprasFinalizadas(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useComprasPorPeriodo = (dataInicio: string, dataFim: string) => {
  return useQuery({
    queryKey: ['compras', 'periodo', dataInicio, dataFim],
    queryFn: () => compraService.buscarPorPeriodo(dataInicio, dataFim),
    enabled: !!dataInicio && !!dataFim,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCompra = (id: number) => {
  return useQuery({
    queryKey: ['compras', id],
    queryFn: () => compraService.buscarCompra(id),
    enabled: !!id,
  });
};

export const useItensCompra = (compraId: number) => {
  return useQuery({
    queryKey: ['compras', compraId, 'itens'],
    queryFn: () => compraService.listarItens(compraId),
    enabled: !!compraId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useItemCompra = (compraId: number, itemId: number) => {
  return useQuery({
    queryKey: ['compras', compraId, 'itens', itemId],
    queryFn: () => compraService.buscarItem(compraId, itemId),
    enabled: !!compraId && !!itemId,
  });
};

export const useResumoCompra = (id: number) => {
  return useQuery({
    queryKey: ['compras', id, 'resumo'],
    queryFn: () => compraService.obterResumo(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEstatisticasCompras = () => {
  return useQuery({
    queryKey: ['compras', 'estatisticas'],
    queryFn: () => compraService.obterEstatisticas(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useBuscarItensPorDescricao = (termo: string) => {
  return useQuery({
    queryKey: ['compras', 'itens', 'buscar', termo],
    queryFn: () => compraService.buscarItensPorDescricao(termo),
    enabled: !!termo && termo.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
  });
};

export const useHistoricoPrecos = (descricao: string) => {
  return useQuery({
    queryKey: ['compras', 'itens', 'historico-precos', descricao],
    queryFn: () => compraService.obterHistoricoPrecos(descricao),
    enabled: !!descricao,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSugerirItens = (limite: number = 10) => {
  return useQuery({
    queryKey: ['compras', 'itens', 'sugestoes', limite],
    queryFn: () => compraService.sugerirItens(limite),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCriarCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (compra: CompraCreateRequest) => compraService.criarCompra(compra),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra criada com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao criar compra';
      toast.error(message);
    },
  });
};

export const useAtualizarCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: Partial<CompraCreateRequest> }) => 
      compraService.atualizarCompra(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra atualizada com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao atualizar compra';
      toast.error(message);
    },
  });
};

export const useExcluirCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (compraId: number) => compraService.excluirCompra(compraId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra excluída com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao excluir compra';
      toast.error(message);
    },
  });
};

export const useFinalizarCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (compraId: number) => compraService.finalizarCompra(compraId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra finalizada com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao finalizar compra';
      toast.error(message);
    },
  });
};

export const useReabrirCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (compraId: number) => compraService.reabrirCompra(compraId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra reaberta com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao reabrir compra';
      toast.error(message);
    },
  });
};

export const useAdicionarItemCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ compraId, item }: { compraId: number; item: ItemCompraCreateRequest }) => 
      compraService.adicionarItem(compraId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Item adicionado com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao adicionar item';
      toast.error(message);
    },
  });
};

export const useAtualizarItemCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ compraId, itemId, dados }: { compraId: number; itemId: number; dados: Partial<ItemCompraCreateRequest> }) => 
      compraService.atualizarItem(compraId, itemId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Item atualizado com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao atualizar item';
      toast.error(message);
    },
  });
};

export const useRemoverItemCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ compraId, itemId }: { compraId: number; itemId: number }) => 
      compraService.removerItem(compraId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Item removido com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao remover item';
      toast.error(message);
    },
  });
};

export const useAssumirItemCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ compraId, itemId }: { compraId: number; itemId: number }) => 
      compraService.assumirItem(compraId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Responsabilidade assumida com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao assumir responsabilidade';
      toast.error(message);
    },
  });
};

export const useTransferirItemCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ compraId, itemId, novoResponsavelId }: { compraId: number; itemId: number; novoResponsavelId: number }) => 
      compraService.transferirItem(compraId, itemId, novoResponsavelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Responsabilidade transferida com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao transferir responsabilidade';
      toast.error(message);
    },
  });
};

export const useDividirItemCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      compraId, 
      itemId, 
      responsaveis 
    }: { 
      compraId: number; 
      itemId: number; 
      responsaveis: Array<{ usuarioId: number; percentual: number }>;
    }) => compraService.dividirItem(compraId, itemId, responsaveis),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Item dividido com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao dividir item';
      toast.error(message);
    },
  });
};

export const useConverterCompraEmContas = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      options 
    }: { 
      id: number; 
      options?: {
        criarContasPorUsuario?: boolean;
        criarContaUnica?: boolean;
        descricaoBase?: string;
        vencimento?: string;
      };
    }) => compraService.converterEmContas(id, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['contas'] });
      toast.success(`${data.contasCriadas} contas criadas com sucesso!`);
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao converter compra em contas';
      toast.error(message);
    },
  });
};

export const useDuplicarCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, novaDescricao }: { id: number; novaDescricao?: string }) => 
      compraService.duplicarCompra(id, novaDescricao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra duplicada com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao duplicar compra';
      toast.error(message);
    },
  });
};

export const useCompartilharCompra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, usuarioIds }: { id: number; usuarioIds: number[] }) => 
      compraService.compartilharCompra(id, usuarioIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success(`Compra compartilhada com ${data.usuariosConvidados} usuários!`);
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao compartilhar compra';
      toast.error(message);
    },
  });
};

export const useImportarListaCompras = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (arquivo: File) => compraService.importarLista(arquivo),
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success(`${resultado.itensImportados} itens importados com sucesso!`);
      if (resultado.erros.length > 0) {
        toast.warning(`${resultado.erros.length} erros encontrados na importação`);
      }
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao importar lista';
      toast.error(message);
    },
  });
};

export const useExportarCompraCSV = () => {
  return useMutation({
    mutationFn: (compraId: number) => compraService.exportarCSV(compraId),
    onSuccess: (blob) => {
      // Criar download do arquivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compra-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Arquivo exportado com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao exportar arquivo';
      toast.error(message);
    },
  });
};

export const useGerarRelatorioCompra = () => {
  return useMutation({
    mutationFn: ({ id, formato }: { id: number; formato?: 'PDF' | 'EXCEL' }) => 
      compraService.gerarRelatorio(id, formato),
    onSuccess: (blob, variables) => {
      // Criar download do arquivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extensao = variables.formato === 'EXCEL' ? 'xlsx' : 'pdf';
      a.download = `relatorio-compra-${new Date().toISOString().slice(0, 10)}.${extensao}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Relatório gerado com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao gerar relatório';
      toast.error(message);
    },
  });
};
