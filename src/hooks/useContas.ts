import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import contaService from '../services/contaService';
import { 
  ContaCreateRequest, 
  ContaFilter, 
  ErrorResponse, 
  DivisaoCreateRequest,
  DivisaoPorcentagemRequest,
  PagamentoDivisaoRequest 
} from '../types/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Query keys para cache
export const contaKeys = {
  all: ['contas'] as const,
  lists: () => [...contaKeys.all, 'list'] as const,
  list: (filter?: ContaFilter) => [...contaKeys.lists(), filter] as const,
  details: () => [...contaKeys.all, 'detail'] as const,
  detail: (id: number) => [...contaKeys.details(), id] as const,
  pagas: () => [...contaKeys.all, 'pagas'] as const,
  pendentes: () => [...contaKeys.all, 'pendentes'] as const,
  vencidas: () => [...contaKeys.all, 'vencidas'] as const,
  vencendo: (dias?: number) => [...contaKeys.all, 'vencendo', dias] as const,
  criadas: () => [...contaKeys.all, 'criadas'] as const,
  participando: () => [...contaKeys.all, 'participando'] as const,
  divisoes: (contaId: number) => [...contaKeys.all, 'divisoes', contaId] as const,
  minhasDivisoes: () => [...contaKeys.all, 'minhas-divisoes'] as const,
  divisoesPendentes: () => [...contaKeys.all, 'divisoes-pendentes'] as const,
  divisoesPagas: () => [...contaKeys.all, 'divisoes-pagas'] as const,
  estatisticas: () => [...contaKeys.all, 'estatisticas'] as const,
};

// Hooks para contas
export const useContas = (filter?: ContaFilter, usuarioId?: number) => {
  return useQuery({
    queryKey: contaKeys.list(filter),
    queryFn: () => contaService.listarContas(usuarioId, filter),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useConta = (id: number) => {
  return useQuery({
    queryKey: contaKeys.detail(id),
    queryFn: () => contaService.buscarConta(id),
    enabled: !!id,
  });
};

export const useContasPagas = (usuarioId?: number) => {
  return useQuery({
    queryKey: contaKeys.pagas(),
    queryFn: () => contaService.listarContasPagas(usuarioId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useContasPendentes = (usuarioId?: number) => {
  return useQuery({
    queryKey: contaKeys.pendentes(),
    queryFn: () => contaService.listarContasPendentes(usuarioId),
    staleTime: 2 * 60 * 1000, // 2 minutos 
  });
};

export const useContasVencidas = (usuarioId?: number) => {
  return useQuery({
    queryKey: contaKeys.vencidas(),
    queryFn: () => contaService.listarContasVencidas(usuarioId),
    staleTime: 2 * 60 * 1000,
  });
};

export const useContasVencendo = (dias: number = 7, usuarioId?: number) => {
  return useQuery({
    queryKey: contaKeys.vencendo(dias),
    queryFn: () => contaService.listarContasVencendo(dias, usuarioId),
    staleTime: 1 * 60 * 1000, // 1 minuto 
  });
};

export const useContasCriadas = () => {
  return useQuery({
    queryKey: contaKeys.criadas(),
    queryFn: () => contaService.listarContasCriadas(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useContasParticipando = () => {
  return useQuery({
    queryKey: contaKeys.participando(),
    queryFn: () => contaService.listarContasParticipando(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEstatisticasContas = () => {
  return useQuery({
    queryKey: contaKeys.estatisticas(),
    queryFn: () => contaService.obterEstatisticas(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hooks para busca
export const useBuscarContasPorDescricao = (termo: string) => {
  return useQuery({
    queryKey: [...contaKeys.all, 'buscar', termo],
    queryFn: () => contaService.buscarPorDescricao(termo),
    enabled: termo.length >= 3, // Só buscar com 3+ caracteres
    staleTime: 5 * 60 * 1000,
  });
};

export const useBuscarContasPorPeriodo = (dataInicio: string, dataFim: string) => {
  return useQuery({
    queryKey: [...contaKeys.all, 'periodo', dataInicio, dataFim],
    queryFn: () => contaService.buscarPorPeriodo(dataInicio, dataFim),
    enabled: !!(dataInicio && dataFim),
    staleTime: 10 * 60 * 1000,
  });
};

// Hooks para divisões
export const useDivisoes = (contaId: number) => {
  return useQuery({
    queryKey: contaKeys.divisoes(contaId),
    queryFn: () => contaService.listarDivisoes(contaId),
    enabled: !!contaId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMinhasDivisoes = () => {
  return useQuery({
    queryKey: contaKeys.minhasDivisoes(),
    queryFn: () => contaService.listarMinhasDivisoes(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useDivisoesPendentes = () => {
  return useQuery({
    queryKey: contaKeys.divisoesPendentes(),
    queryFn: () => contaService.listarDivisoesPendentes(),
    staleTime: 1 * 60 * 1000, // 1 minuto - dados importantes
  });
};

export const useDivisoesPagas = () => {
  return useQuery({
    queryKey: contaKeys.divisoesPagas(),
    queryFn: () => contaService.listarDivisoesPagas(),
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations para contas
export const useCreateConta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conta: ContaCreateRequest) => contaService.criarConta(conta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      toast.success('Conta criada com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      toast.error(message);
    }
  });
};

export const useUpdateConta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...conta }: { id: number } & Partial<ContaCreateRequest>) => 
      contaService.atualizarConta(id, conta),
    onSuccess: (updatedConta) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      queryClient.setQueryData(contaKeys.detail(updatedConta.id), updatedConta);
      toast.success('Conta atualizada com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao atualizar conta';
      toast.error(message);
    }
  });
};

export const useDeleteConta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contaService.excluirConta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      toast.success('Conta excluída com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao excluir conta';
      toast.error(message);
    }
  });
};

export const useMarcarContaComoPaga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contaService.marcarComoPaga(id),
    onSuccess: (updatedConta) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      queryClient.setQueryData(contaKeys.detail(updatedConta.id), updatedConta);
      toast.success('Conta marcada como paga!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao marcar conta como paga';
      toast.error(message);
    }
  });
};

export const useMarcarContaComoPendente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contaService.marcarComoPendente(id),
    onSuccess: (updatedConta) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      queryClient.setQueryData(contaKeys.detail(updatedConta.id), updatedConta);
      toast.success('Conta marcada como pendente!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao marcar conta como pendente';
      toast.error(message);
    }
  });
};

export const useAlterarStatusConta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'PENDENTE' | 'PAGA' | 'VENCIDA' | 'PARCIALMENTE_PAGA' }) =>
      contaService.alterarStatus(id, status),
    onSuccess: (updatedConta) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      queryClient.setQueryData(contaKeys.detail(updatedConta.id), updatedConta);
      toast.success('Status da conta atualizado!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao alterar status da conta';
      toast.error(message);
    }
  });
};

// Hook para reduzir valor da conta quando pagamento externo for confirmado
export const useReduzirValorConta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contaId, valorPago }: { contaId: number; valorPago: number }) => {
      // Buscar dados atuais da conta
      const conta = await contaService.buscarConta(contaId);
      
      const novoValor = conta.valor - valorPago;
      
      // Se o novo valor for zero ou negativo, marcar como paga
      if (novoValor <= 0) {
        return await contaService.alterarStatus(contaId, 'PAGA');
      } else {
        // Reduzir o valor primeiro
        await contaService.atualizarConta(contaId, { valor: novoValor });
        
        // Depois marcar como parcialmente paga
        return await contaService.alterarStatus(contaId, 'PARCIALMENTE_PAGA');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      toast.success('Valor da conta atualizado com o pagamento!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao atualizar valor da conta';
      toast.error(message);
    }
  });
};

export const useMarcarContaComoVencida = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contaService.marcarComoVencida(id),
    onSuccess: (updatedConta) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      queryClient.setQueryData(contaKeys.detail(updatedConta.id), updatedConta);
      toast.success('Conta marcada como vencida!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao marcar conta como vencida';
      toast.error(message);
    }
  });
};

export const useVerificarContasVencidas = () => {
  const queryClient = useQueryClient();
  const marcarVencida = useMarcarContaComoVencida();

  return useMutation({
    mutationFn: async (usuarioId?: number) => {
      const contas = await contaService.listarContas(usuarioId);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Zera as horas para comparação apenas da data
      
      const contasVencidas = contas.filter(conta => {
        if (conta.paga || conta.status === 'VENCIDA') return false;
        
        const dataVencimento = new Date(conta.vencimento);
        dataVencimento.setHours(0, 0, 0, 0);
        
        return dataVencimento < hoje;
      });

      // Marcar todas as contas vencidas
      const promises = contasVencidas.map(conta => 
        contaService.marcarComoVencida(conta.id)
      );

      await Promise.all(promises);
      return contasVencidas.length;
    },
    onSuccess: (quantidadeVencidas) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      if (quantidadeVencidas > 0) {
        toast.info(`${quantidadeVencidas} conta(s) marcada(s) como vencida(s)`);
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao verificar contas vencidas';
      toast.error(message);
    }
  });
};

// Mutations para divisões
export const useCreateDivisao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (divisao: DivisaoCreateRequest) => contaService.criarDivisao(divisao),
    onSuccess: (novaDivisao) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      queryClient.invalidateQueries({ queryKey: contaKeys.divisoes(novaDivisao.conta.id) });
      toast.success('Divisão criada com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao criar divisão';
      toast.error(message);
    }
  });
};

export const useDividirContaIgualmente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contaId, usuarioIds }: { contaId: number; usuarioIds: number[] }) =>
      contaService.dividirContaIgualmente(contaId, usuarioIds),
    onSuccess: (divisoes) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      if (divisoes.length > 0) {
        queryClient.invalidateQueries({ queryKey: contaKeys.divisoes(divisoes[0].conta.id) });
      }
      // Removido o toast automático para não conflitar com o controle manual
      console.log('✅ Divisões criadas:', divisoes.length);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao dividir conta';
      console.error('❌ Erro ao dividir conta:', message);
      // Não mostrar toast aqui - deixar para o componente decidir
      throw error; // Re-throw para que o componente possa capturar
    }
  });
};

export const useDividirContaPorPorcentagem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: DivisaoPorcentagemRequest) => contaService.dividirContaPorPorcentagem(request),
    onSuccess: (message, variables) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      queryClient.invalidateQueries({ queryKey: contaKeys.divisoes(variables.contaId) });
      toast.success(message || 'Conta dividida por porcentagem com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao dividir conta por porcentagem';
      toast.error(message);
    }
  });
};

export const useMarcarDivisaoComoPaga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: PagamentoDivisaoRequest }) =>
      contaService.marcarDivisaoComoPaga(id, dados),
    onSuccess: (divisaoAtualizada) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      queryClient.invalidateQueries({ queryKey: contaKeys.divisoes(divisaoAtualizada.conta.id) });
      toast.success('Divisão marcada como paga!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao marcar divisão como paga';
      toast.error(message);
    }
  });
};

export const useMarcarDivisaoComoPendente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contaService.marcarDivisaoComoPendente(id),
    onSuccess: (divisaoAtualizada) => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      queryClient.invalidateQueries({ queryKey: contaKeys.divisoes(divisaoAtualizada.conta.id) });
      toast.success('Divisão marcada como pendente!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao marcar divisão como pendente';
      toast.error(message);
    }
  });
};

export const useDeleteDivisao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contaService.excluirDivisao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contaKeys.all });
      toast.success('Divisão excluída com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao excluir divisão';
      toast.error(message);
    }
  });
};

// Hooks legados para compatibilidade
export const useContasPorUsuario = (usuarioId: number, filter?: ContaFilter) => {
  return useContas(filter); // Agora usa o método padrão
};

// Hook para verificação automática de contas vencidas
export const useAutoVerificarContasVencidas = (usuarioId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...contaKeys.all, 'auto-verificar-vencidas', usuarioId],
    queryFn: async () => {
      const contas = await contaService.listarContas(usuarioId);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const contasVencidas = contas.filter(conta => {
        if (conta.paga || conta.status === 'VENCIDA') return false;
        
        const dataVencimento = new Date(conta.vencimento);
        dataVencimento.setHours(0, 0, 0, 0);
        
        return dataVencimento < hoje;
      });

      // Retorna apenas informações, não executa a marcação automaticamente
      return {
        contasVencidas: contasVencidas.length,
        contas: contasVencidas
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
