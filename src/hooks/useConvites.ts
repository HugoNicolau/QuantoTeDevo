import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import conviteService from '../services/conviteService';
import { ConviteCreateRequest, ConviteAceitarRequest } from '../types/api';
import { toast } from 'sonner';

export const useConvitesEnviados = (usuarioId?: number) => {
  return useQuery({
    queryKey: ['convites', 'enviados', usuarioId],
    queryFn: () => conviteService.listarConvitesEnviados(usuarioId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useConvitePorToken = (token: string) => {
  return useQuery({
    queryKey: ['convites', 'token', token],
    queryFn: () => conviteService.buscarConvitePorToken(token),
    enabled: !!token,
    retry: false, // Não tentar novamente se o token for inválido
  });
};

export const useConvitesConta = (contaId: number) => {
  return useQuery({
    queryKey: ['convites', 'conta', contaId],
    queryFn: () => conviteService.listarConvitesConta(contaId),
    enabled: !!contaId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useConvitesPorEmail = (email: string) => {
  return useQuery({
    queryKey: ['convites', 'email', email],
    queryFn: () => conviteService.listarConvitesPorEmail(email),
    enabled: !!email,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEstatisticasConvites = (usuarioId?: number) => {
  return useQuery({
    queryKey: ['convites', 'estatisticas', usuarioId],
    queryFn: () => conviteService.obterEstatisticas(usuarioId),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useCriarConvite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contaId, convite }: { contaId: number; convite: ConviteCreateRequest }) => 
      conviteService.criarConvite(contaId, convite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convites'] });
      toast.success('Convite enviado com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao enviar convite';
      toast.error(message);
    },
  });
};

export const useAceitarConvite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ token, dados }: { token: string; dados: ConviteAceitarRequest }) => 
      conviteService.aceitarConvite(token, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convites'] });
      queryClient.invalidateQueries({ queryKey: ['contas'] });
      toast.success('Convite aceito com sucesso!');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao aceitar convite';
      toast.error(message);
    },
  });
};

export const useRejeitarConvite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => conviteService.rejeitarConvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convites'] });
      toast.success('Convite rejeitado');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao rejeitar convite';
      toast.error(message);
    },
  });
};

export const useMarcarConvitesExpirados = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => conviteService.marcarExpirados(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convites'] });
      toast.success('Convites expirados marcados');
    },
    onError: (error: Error) => {
      const message = (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao marcar convites expirados';
      toast.error(message);
    },
  });
};
