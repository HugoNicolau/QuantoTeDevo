import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import amizadeService from '../services/amizadeService';
import { toast } from 'sonner';

// Hooks para amizades com métodos disponíveis
export const useAmigos = (usuarioId?: number) => {
  return useQuery({
    queryKey: ['amizades', 'amigos', usuarioId],
    queryFn: () => amizadeService.listarAmigos(usuarioId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useConvitesAmizadePendentes = (usuarioId?: number) => {
  return useQuery({
    queryKey: ['amizades', 'convites-pendentes', usuarioId],
    queryFn: () => amizadeService.listarConvitesPendentes(usuarioId),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useVerificarAmizade = (usuario1Id: number, usuario2Id: number) => {
  return useQuery({
    queryKey: ['amizades', 'verificar', usuario1Id, usuario2Id],
    queryFn: () => amizadeService.verificarAmizade(usuario1Id, usuario2Id),
    enabled: !!usuario1Id && !!usuario2Id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEstatisticasAmizades = (usuarioId?: number) => {
  return useQuery({
    queryKey: ['amizades', 'estatisticas', usuarioId],
    queryFn: () => amizadeService.obterEstatisticas(usuarioId),
    staleTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useSolicitarAmizade = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ convidadoId, mensagem }: { convidadoId: number; mensagem?: string }) => 
      amizadeService.solicitarAmizade(convidadoId, mensagem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amizades'] });
      toast.success('Solicitação de amizade enviada!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao enviar solicitação';
      toast.error(message);
    },
  });
};

export const useAceitarAmizade = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (amizadeId: number) => amizadeService.aceitarAmizade(amizadeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amizades'] });
      toast.success('Amizade aceita com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao aceitar amizade';
      toast.error(message);
    },
  });
};

export const useRejeitarAmizade = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (amizadeId: number) => amizadeService.rejeitarAmizade(amizadeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amizades'] });
      toast.success('Solicitação rejeitada!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao rejeitar solicitação';
      toast.error(message);
    },
  });
};

export const useRemoverAmizade = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ usuario1Id, usuario2Id }: { usuario1Id: number; usuario2Id: number }) => 
      amizadeService.removerAmizade(usuario1Id, usuario2Id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amizades'] });
      toast.success('Amizade removida!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao remover amizade';
      toast.error(message);
    },
  });
};

export const useBloquearUsuario = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bloqueadoId: number) => amizadeService.bloquearUsuario(bloqueadoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amizades'] });
      toast.success('Usuário bloqueado!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao bloquear usuário';
      toast.error(message);
    },
  });
};

// Hooks de conveniência
export const useSaoAmigos = (outroUsuarioId: number) => {
  return useQuery({
    queryKey: ['amizades', 'sao-amigos', outroUsuarioId],
    queryFn: () => amizadeService.saoAmigos(outroUsuarioId),
    enabled: !!outroUsuarioId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRemoverAmizadeComigo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (outroUsuarioId: number) => amizadeService.removerAmizadeComigo(outroUsuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amizades'] });
      toast.success('Amizade removida!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao remover amizade';
      toast.error(message);
    },
  });
};
