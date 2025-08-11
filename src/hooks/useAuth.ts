import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authService from '../services/authService';
import { LoginRequest, RegisterRequest, Usuario } from '../types/api';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Hook principal para autenticação
export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query para obter usuário atual
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      return user;
    },
    enabled: authService.isAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: false
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.usuario);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      toast.success(`Bem-vindo, ${data.usuario.nome}!`);
      
      // Navegar para o dashboard
      navigate('/dashboard');
    },
    onError: (error: unknown) => {
      console.error('Erro no login:', error);
      
      // Tratamento específico por status code
      const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string } } };
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message || axiosError.response?.data?.error;
      
      switch (status) {
        case 400:
          toast.error(message || 'Dados de login inválidos. Verifique email e senha.');
          break;
        case 401:
          toast.error(message || 'Email ou senha incorretos.');
          break;
        case 404:
          toast.error(message || 'Usuário não encontrado.');
          break;
        case 500:
          toast.error('Erro interno do servidor. Tente novamente mais tarde.');
          break;
        default:
          toast.error(message || 'Erro no login. Verifique suas credenciais.');
      }
    }
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    },
    onError: () => {
      toast.error('Erro ao fazer logout');
    }
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!(user && authService.isAuthenticated()),
    login: (credentials: LoginRequest) => loginMutation.mutate(credentials),
    logout: () => logoutMutation.mutate(),
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

// Hook para login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.usuario);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Bem-vindo, ${data.usuario.nome}!`);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Erro no login:', error);
      toast.error('Erro no login. Verifique suas credenciais.');
    }
  });
};

// Hook para registro
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.usuario);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Bem-vindo, ${data.usuario.nome}! Conta criada com sucesso.`);
      navigate('/dashboard');
    },
    onError: (error: unknown) => {
      console.error('Erro no registro:', error);
      
      // Tratamento específico por status code
      const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string } } };
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message || axiosError.response?.data?.error;
      
      switch (status) {
        case 400:
          toast.error(message || 'Dados inválidos. Verifique as informações fornecidas.');
          break;
        case 403:
          toast.error(message || 'Acesso negado. Verifique suas permissões ou se o servidor está configurado corretamente.');
          break;
        case 409:
          toast.error(message || 'Email já está em uso. Tente com outro email.');
          break;
        case 422:
          toast.error(message || 'Dados de entrada inválidos. Verifique todos os campos.');
          break;
        case 500:
          toast.error('Erro interno do servidor. Tente novamente mais tarde.');
          break;
        default:
          toast.error(message || 'Erro ao criar conta. Tente novamente.');
      }
    }
  });
};

// Hook para logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
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

// Hook para obter usuário atual
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      return user;
    },
    enabled: authService.isAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: false
  });
};

// Hook para atualizar perfil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<Usuario>) => authService.updateProfile(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil');
    }
  });
};

// Hook para alterar senha
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao alterar senha. Verifique a senha atual.');
    }
  });
};

// Hook para recuperação de senha
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success('Email de recuperação enviado!');
    },
    onError: () => {
      toast.error('Erro ao enviar email de recuperação');
    }
  });
};

// Hook para redefinir senha
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao redefinir senha. Token pode estar inválido.');
    }
  });
};

// Hook para verificar email
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      toast.success('Email verificado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao verificar email. Token pode estar inválido.');
    }
  });
};

// Hook para reenviar email de verificação
export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: () => authService.resendVerificationEmail(),
    onSuccess: () => {
      toast.success('Email de verificação reenviado!');
    },
    onError: () => {
      toast.error('Erro ao reenviar email de verificação');
    }
  });
};

// Hook para inicializar autenticação
export const useInitializeAuth = () => {
  useEffect(() => {
    authService.initialize();
  }, []);
};

// Hook para escutar eventos de autenticação
export const useAuthEvents = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUserLogin = (event: CustomEvent) => {
      queryClient.setQueryData(['auth', 'user'], event.detail);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleUserLogout = () => {
      queryClient.clear();
    };

    const handleUserUpdated = (event: CustomEvent) => {
      queryClient.setQueryData(['auth', 'user'], event.detail);
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    };

    window.addEventListener('userLogin', handleUserLogin as EventListener);
    window.addEventListener('userLogout', handleUserLogout);
    window.addEventListener('userUpdated', handleUserUpdated as EventListener);

    return () => {
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
      window.removeEventListener('userLogout', handleUserLogout);
      window.removeEventListener('userUpdated', handleUserUpdated as EventListener);
    };
  }, [queryClient]);
};

// Hook para verificar permissões
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    canCreateAccount: !!user,
    canEditAccount: (accountCreatorId: number) => user?.id === accountCreatorId,
    canDeleteAccount: (accountCreatorId: number) => user?.id === accountCreatorId,
    canCreateGroup: !!user,
    canEditGroup: (groupCreatorId: number) => user?.id === groupCreatorId,
    canDeleteGroup: (groupCreatorId: number) => user?.id === groupCreatorId,
    canInviteUsers: !!user,
    getUserId: () => user?.id || null,
    getUserEmail: () => user?.email || null,
    getUserName: () => user?.nome || null,
  };
};

// Tipos legados para compatibilidade
export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  chavePix: string;
}
