import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import grupoService from '../services/grupoService';
import { GrupoCreateRequest, GrupoMembrosRequest, ErrorResponse } from '../types/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Query keys para cache
export const grupoKeys = {
  all: ['grupos'] as const,
  lists: () => [...grupoKeys.all, 'list'] as const,
  list: () => [...grupoKeys.lists()] as const,
  details: () => [...grupoKeys.all, 'detail'] as const,
  detail: (id: number) => [...grupoKeys.details(), id] as const,
  membros: (id: number) => [...grupoKeys.all, 'membros', id] as const,
  contas: (id: number) => [...grupoKeys.all, 'contas', id] as const,
  ativos: () => [...grupoKeys.all, 'ativos'] as const,
  inativos: () => [...grupoKeys.all, 'inativos'] as const,
  criados: () => [...grupoKeys.all, 'criados'] as const,
  participando: () => [...grupoKeys.all, 'participando'] as const,
  estatisticas: (id: number) => [...grupoKeys.all, 'estatisticas', id] as const,
  buscar: (nome: string) => [...grupoKeys.all, 'buscar', nome] as const,
};

// Hooks para consultas
export const useGrupos = () => {
  return useQuery({
    queryKey: grupoKeys.list(),
    queryFn: () => grupoService.listarGrupos(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useGrupo = (id: number) => {
  return useQuery({
    queryKey: grupoKeys.detail(id),
    queryFn: () => grupoService.buscarGrupo(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGruposAtivos = () => {
  return useQuery({
    queryKey: grupoKeys.ativos(),
    queryFn: () => grupoService.listarGruposAtivos(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGruposInativos = () => {
  return useQuery({
    queryKey: grupoKeys.inativos(),
    queryFn: () => grupoService.listarGruposInativos(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGruposCriados = () => {
  return useQuery({
    queryKey: grupoKeys.criados(),
    queryFn: () => grupoService.listarGruposCriados(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGruposParticipando = () => {
  return useQuery({
    queryKey: grupoKeys.participando(),
    queryFn: () => grupoService.listarGruposParticipando(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMembrosGrupo = (id: number) => {
  return useQuery({
    queryKey: grupoKeys.membros(id),
    queryFn: () => grupoService.listarMembros(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useContasGrupo = (id: number) => {
  return useQuery({
    queryKey: grupoKeys.contas(id),
    queryFn: () => grupoService.listarContasGrupo(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useEstatisticasGrupo = (id: number) => {
  return useQuery({
    queryKey: grupoKeys.estatisticas(id),
    queryFn: () => grupoService.obterEstatisticas(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useBuscarGruposPorNome = (nome: string) => {
  return useQuery({
    queryKey: grupoKeys.buscar(nome),
    queryFn: () => grupoService.buscarGruposPorNome(nome),
    enabled: nome.length >= 3, // Só buscar com 3+ caracteres
    staleTime: 5 * 60 * 1000,
  });
};

// Hooks para verificações
export const useVerificarMembroGrupo = (grupoId: number, usuarioId?: number) => {
  return useQuery({
    queryKey: [...grupoKeys.all, 'verificar-membro', grupoId, usuarioId],
    queryFn: () => grupoService.verificarMembro(grupoId, usuarioId),
    enabled: !!grupoId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useVerificarCriadorGrupo = (grupoId: number, usuarioId?: number) => {
  return useQuery({
    queryKey: [...grupoKeys.all, 'verificar-criador', grupoId, usuarioId],
    queryFn: () => grupoService.verificarCriador(grupoId, usuarioId),
    enabled: !!grupoId,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations
export const useCreateGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (grupo: GrupoCreateRequest) => grupoService.criarGrupo(grupo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grupoKeys.all });
      toast.success('Grupo criado com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao criar grupo';
      toast.error(message);
    }
  });
};

export const useUpdateGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...grupo }: { id: number } & Partial<GrupoCreateRequest>) =>
      grupoService.atualizarGrupo(id, grupo),
    onSuccess: (updatedGrupo) => {
      queryClient.invalidateQueries({ queryKey: grupoKeys.all });
      queryClient.setQueryData(grupoKeys.detail(updatedGrupo.id), updatedGrupo);
      toast.success('Grupo atualizado com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao atualizar grupo';
      toast.error(message);
    }
  });
};

export const useDeleteGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => grupoService.excluirGrupo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grupoKeys.all });
      toast.success('Grupo excluído com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao excluir grupo';
      toast.error(message);
    }
  });
};

export const useAtivarGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => grupoService.ativarGrupo(id),
    onSuccess: (updatedGrupo) => {
      queryClient.invalidateQueries({ queryKey: grupoKeys.all });
      queryClient.setQueryData(grupoKeys.detail(updatedGrupo.id), updatedGrupo);
      toast.success('Grupo ativado com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao ativar grupo';
      toast.error(message);
    }
  });
};

export const useDesativarGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => grupoService.desativarGrupo(id),
    onSuccess: (updatedGrupo) => {
      queryClient.invalidateQueries({ queryKey: grupoKeys.all });
      queryClient.setQueryData(grupoKeys.detail(updatedGrupo.id), updatedGrupo);
      toast.success('Grupo desativado com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao desativar grupo';
      toast.error(message);
    }
  });
};

export const useAdicionarMembrosGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, usuarioIds }: { id: number; usuarioIds: number[] }) =>
      grupoService.adicionarMembros(id, usuarioIds),
    onSuccess: (updatedGrupo) => {
      queryClient.invalidateQueries({ queryKey: grupoKeys.all });
      queryClient.invalidateQueries({ queryKey: grupoKeys.membros(updatedGrupo.id) });
      queryClient.setQueryData(grupoKeys.detail(updatedGrupo.id), updatedGrupo);
      toast.success('Membros adicionados com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao adicionar membros';
      toast.error(message);
    }
  });
};

export const useRemoverMembrosGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, usuarioIds }: { id: number; usuarioIds: number[] }) =>
      grupoService.removerMembros(id, usuarioIds),
    onSuccess: (updatedGrupo) => {
      queryClient.invalidateQueries({ queryKey: grupoKeys.all });
      queryClient.invalidateQueries({ queryKey: grupoKeys.membros(updatedGrupo.id) });
      queryClient.setQueryData(grupoKeys.detail(updatedGrupo.id), updatedGrupo);
      toast.success('Membros removidos com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao remover membros';
      toast.error(message);
    }
  });
};

export const useSairDoGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => grupoService.sairDoGrupo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grupoKeys.all });
      toast.success('Você saiu do grupo com sucesso!');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Erro ao sair do grupo';
      toast.error(message);
    }
  });
};
