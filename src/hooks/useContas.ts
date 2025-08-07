import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contaService } from '../services/contaService';
import { ContaCreateRequest, ContaFilter, ErrorResponse } from '../types/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const contaKeys = {
  all: ['contas'] as const,
  lists: () => [...contaKeys.all, 'list'] as const,
  list: (filter?: ContaFilter) => [...contaKeys.lists(), filter] as const,
  details: () => [...contaKeys.all, 'detail'] as const,
  detail: (id: number) => [...contaKeys.details(), id] as const,
  usuario: (usuarioId: number, filter?: ContaFilter) => [...contaKeys.all, 'usuario', usuarioId, filter] as const,
};

export const useContas = (filter?: ContaFilter) => {
  return useQuery({
    queryKey: contaKeys.list(filter),
    queryFn: () => contaService.getContas(filter),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useConta = (id: number) => {
  return useQuery({
    queryKey: contaKeys.detail(id),
    queryFn: () => contaService.getContaById(id),
    enabled: !!id,
  });
};

export const useContasPorUsuario = (usuarioId: number, filter?: ContaFilter) => {
  return useQuery({
    queryKey: contaKeys.usuario(usuarioId, filter),
    queryFn: () => contaService.getContasPorUsuario(usuarioId, filter),
    enabled: !!usuarioId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useCreateConta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conta: ContaCreateRequest) => contaService.createConta(conta),
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
      contaService.updateConta(id, conta),
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
    mutationFn: (id: number) => contaService.deleteConta(id),
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
