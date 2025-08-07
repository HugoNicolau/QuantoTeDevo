import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, LoginCredentials, AuthUser } from '../services/authService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query para obter usuário atual
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authService.getUser(),
    staleTime: Infinity, // Dados locais não ficam stale
  });

  // Mutation para login demo
  const loginMutation = useMutation({
    mutationFn: authService.loginDemo,
    onSuccess: (userData) => {
      authService.saveUser(userData);
      queryClient.setQueryData(['auth', 'user'], userData);
      toast.success(`Bem-vindo, ${userData.nome}!`);
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Erro no login. Tente novamente.');
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: () => Promise.resolve(authService.logout()),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear(); // Limpar cache de queries
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: (credentials: LoginCredentials) => loginMutation.mutate(credentials),
    logout: () => logoutMutation.mutate(),
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

// Hooks individuais (mantidos para compatibilidade)
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.loginDemo(credentials),
    onSuccess: (userData) => {
      authService.saveUser(userData);
      queryClient.setQueryData(['auth', 'user'], userData);
      queryClient.invalidateQueries();
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Erro ao fazer login');
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => Promise.resolve(authService.logout()),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    },
    onError: () => {
      toast.error('Erro ao fazer logout');
    }
  });
};
