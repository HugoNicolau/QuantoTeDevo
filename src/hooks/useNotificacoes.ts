import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificacaoService from '../services/notificacaoService';
import { NotificacaoTipo, ErrorResponse } from '../types/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useEffect, useRef } from 'react';

// Query keys para cache
export const notificacaoKeys = {
  all: ['notificacoes'] as const,
  lists: () => [...notificacaoKeys.all, 'list'] as const,
  list: (params?: { page?: number; size?: number; lida?: boolean; tipo?: NotificacaoTipo }) => 
    [...notificacaoKeys.lists(), params] as const,
  details: () => [...notificacaoKeys.all, 'detail'] as const,
  detail: (id: number) => [...notificacaoKeys.details(), id] as const,
  contador: () => [...notificacaoKeys.all, 'contador'] as const,
  estatisticas: () => [...notificacaoKeys.all, 'estatisticas'] as const,
  naoLidas: () => [...notificacaoKeys.all, 'nao-lidas'] as const,
  porTipo: (tipo: NotificacaoTipo) => [...notificacaoKeys.all, 'tipo', tipo] as const,
  porPrioridade: (prioridade: string) => [...notificacaoKeys.all, 'prioridade', prioridade] as const,
  tipos: () => [...notificacaoKeys.all, 'tipos'] as const,
  preferencias: () => [...notificacaoKeys.all, 'preferencias'] as const,
};

// Hook principal para listar notificações com paginação
export const useNotificacoes = (
  page: number = 0,
  size: number = 20,
  lida?: boolean,
  tipo?: NotificacaoTipo
) => {
  return useQuery({
    queryKey: notificacaoKeys.list({ page, size, lida, tipo }),
    queryFn: () => notificacaoService.listarNotificacoes(page, size, lida, tipo),
    staleTime: 1 * 60 * 1000, // 1 minuto - dados dinâmicos
    refetchInterval: 2 * 60 * 1000, // Revalidar a cada 2 minutos
  });
};

// Hook para uma notificação específica
export const useNotificacao = (id: number) => {
  return useQuery({
    queryKey: notificacaoKeys.detail(id),
    queryFn: () => notificacaoService.buscarNotificacao(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para contador de notificações não lidas
export const useContadorNotificacoes = () => {
  return useQuery({
    queryKey: notificacaoKeys.contador(),
    queryFn: () => notificacaoService.obterContador(),
    staleTime: 30 * 1000, // 30 segundos - dados críticos
    refetchInterval: 1 * 60 * 1000, // Revalidar a cada minuto
  });
};

// Hook para estatísticas das notificações
export const useEstatisticasNotificacoes = () => {
  return useQuery({
    queryKey: notificacaoKeys.estatisticas(),
    queryFn: () => notificacaoService.obterEstatisticas(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para notificações não lidas
export const useNotificacoesNaoLidas = () => {
  return useQuery({
    queryKey: notificacaoKeys.naoLidas(),
    queryFn: () => notificacaoService.listarNaoLidas(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // Revalidar a cada 2 minutos
  });
};

// Hook para notificações por tipo
export const useNotificacoesPorTipo = (tipo: NotificacaoTipo) => {
  return useQuery({
    queryKey: notificacaoKeys.porTipo(tipo),
    queryFn: () => notificacaoService.listarPorTipo(tipo),
    enabled: !!tipo,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para notificações por prioridade
export const useNotificacoesPorPrioridade = (prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE') => {
  return useQuery({
    queryKey: notificacaoKeys.porPrioridade(prioridade),
    queryFn: () => notificacaoService.listarPorPrioridade(prioridade),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para tipos de notificação disponíveis
export const useTiposNotificacao = () => {
  return useQuery({
    queryKey: notificacaoKeys.tipos(),
    queryFn: () => notificacaoService.obterTiposNotificacao(),
    staleTime: 60 * 60 * 1000, // 1 hora - dados estáticos
  });
};

// Hook para preferências de notificação
export const usePreferenciasNotificacao = () => {
  return useQuery({
    queryKey: notificacaoKeys.preferencias(),
    queryFn: () => notificacaoService.obterPreferencias(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Mutations
export const useMarcarNotificacaoLida = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificacaoService.marcarComoLida(id),
    onSuccess: (updatedNotificacao) => {
      queryClient.invalidateQueries({ queryKey: notificacaoKeys.all });
      queryClient.setQueryData(notificacaoKeys.detail(updatedNotificacao.id), updatedNotificacao);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao marcar notificação como lida';
      toast.error(message);
    }
  });
};

export const useMarcarMultiplasLidas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => notificacaoService.marcarMultiplasComoLidas(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacaoKeys.all });
      toast.success('Notificações marcadas como lidas!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao marcar notificações como lidas';
      toast.error(message);
    }
  });
};

export const useMarcarTodasLidas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificacaoService.marcarTodasComoLidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacaoKeys.all });
      toast.success('Todas as notificações foram marcadas como lidas!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao marcar todas as notificações como lidas';
      toast.error(message);
    }
  });
};

export const useExcluirNotificacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificacaoService.excluirNotificacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacaoKeys.all });
      toast.success('Notificação excluída!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao excluir notificação';
      toast.error(message);
    }
  });
};

export const useExcluirMultiplasNotificacoes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => notificacaoService.excluirMultiplas(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacaoKeys.all });
      toast.success('Notificações excluídas!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao excluir notificações';
      toast.error(message);
    }
  });
};

export const useExcluirTodasLidas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificacaoService.excluirTodasLidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacaoKeys.all });
      toast.success('Todas as notificações lidas foram excluídas!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao excluir notificações lidas';
      toast.error(message);
    }
  });
};

export const useConfigurarPreferencias = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferencias: {
      contaVencendo: boolean;
      contaVencida: boolean;
      dividaPendente: boolean;
      divisaoPendente: boolean;
      pagamentoRecebido: boolean;
      conviteRecebido: boolean;
      contaCriada: boolean;
      lembretesPagamento: boolean;
      notificacoesSistema: boolean;
      emailNotificacoes: boolean;
      diasAntecedenciaVencimento: number;
    }) => notificacaoService.configurarPreferencias(preferencias),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacaoKeys.preferencias() });
      toast.success('Preferências de notificação atualizadas!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao atualizar preferências';
      toast.error(message);
    }
  });
};

// Hook para polling de notificações
export const usePollingNotificacoes = (intervalo: number = 30000) => {
  const intervalRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const iniciarPolling = () => {
      intervalRef.current = notificacaoService.iniciarPollingNotificacoes(intervalo);
    };

    const pararPolling = () => {
      if (intervalRef.current) {
        notificacaoService.pararPollingNotificacoes(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleNotificacoesAtualizadas = (event: CustomEvent) => {
      queryClient.setQueryData(notificacaoKeys.contador(), event.detail);
      queryClient.invalidateQueries({ queryKey: notificacaoKeys.naoLidas() });
    };

    // Escutar eventos de notificações
    window.addEventListener('notificacoesAtualizadas', handleNotificacoesAtualizadas as EventListener);

    // Iniciar polling quando o componente monta
    iniciarPolling();

    // Cleanup quando o componente desmonta
    return () => {
      pararPolling();
      window.removeEventListener('notificacoesAtualizadas', handleNotificacoesAtualizadas as EventListener);
    };
  }, [intervalo, queryClient]);

  return {
    iniciarPolling: () => {
      if (!intervalRef.current) {
        intervalRef.current = notificacaoService.iniciarPollingNotificacoes(intervalo);
      }
    },
    pararPolling: () => {
      if (intervalRef.current) {
        notificacaoService.pararPollingNotificacoes(intervalRef.current);
        intervalRef.current = null;
      }
    },
    isPolling: !!intervalRef.current
  };
};

// Hook para solicitar permissão de notificações push
export const usePermissaoNotificacoesPush = () => {
  return useMutation({
    mutationFn: () => notificacaoService.solicitarPermissaoPush(),
    onSuccess: (granted) => {
      if (granted) {
        toast.success('Permissão para notificações concedida!');
      } else {
        toast.warning('Permissão para notificações negada. Você pode alterar isso nas configurações do navegador.');
      }
    },
    onError: () => {
      toast.error('Seu navegador não suporta notificações push');
    }
  });
};

// Hook para verificar novas notificações
export const useVerificarNovasNotificacoes = (ultimaVerificacao?: string) => {
  return useQuery({
    queryKey: [...notificacaoKeys.all, 'verificar-novas', ultimaVerificacao],
    queryFn: () => notificacaoService.verificarNovas(ultimaVerificacao),
    enabled: !!ultimaVerificacao,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 1 * 60 * 1000, // Revalidar a cada minuto
  });
};
