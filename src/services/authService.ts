
import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, Usuario, ApiAuthResponse } from '../types/api';

export class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Autenticação
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiAuthResponse>('/auth/login', credentials);
    const authData = response.data.data;
    this.setAuthData(authData);
    return authData;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiAuthResponse>('/auth/register', userData);
    const authData = response.data.data;
    this.setAuthData(authData);
    return authData;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor:', error);
    }
    this.clearAuthData();
  }

  async refreshToken(): Promise<string> {
    const response = await api.post<{ token: string }>('/auth/refresh');
    this.setToken(response.data.token);
    return response.data.token;
  }

  // Validação de token
  async validateToken(): Promise<boolean> {
    try {
      await api.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  }

  // Perfil do usuário
  async getProfile(): Promise<Usuario> {
    const response = await api.get<Usuario>('/auth/profile');
    return response.data;
  }

  async updateProfile(userData: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put<Usuario>('/auth/profile', userData);
    this.updateUserData(response.data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      senhaAtual: currentPassword,
      novaSenha: newPassword
    });
  }

  // Recuperação de senha
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      novaSenha: newPassword
    });
  }

  // Verificação de conta
  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }

  async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification');
  }

  // Gerenciamento de token local
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  // Gerenciamento de dados do usuário
  getCurrentUser(): Usuario | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Erro ao parsear dados do usuário do localStorage:', error);
      // Limpar dados corrompidos
      this.removeUserData();
      return null;
    }
  }

  setUserData(user: Usuario): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  updateUserData(user: Usuario): void {
    this.setUserData(user);
    // Emitir evento para atualizar componentes
    window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
  }

  removeUserData(): void {
    localStorage.removeItem('user');
  }

  // Verificação de autenticação
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Helper para login/logout completo
  private setAuthData(authResponse: AuthResponse): void {
    this.setToken(authResponse.token);
    this.setUserData(authResponse.usuario);
    // Emitir evento de login
    window.dispatchEvent(new CustomEvent('userLogin', { detail: authResponse.usuario }));
  }

  private clearAuthData(): void {
    this.removeToken();
    this.removeUserData();
    // Emitir evento de logout
    window.dispatchEvent(new CustomEvent('userLogout'));
  }

  // Verificação de permissões
  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user?.email || null;
  }

  getUserName(): string | null {
    const user = this.getCurrentUser();
    return user?.nome || null;
  }

  // Configuração automática na inicialização
  initialize(): void {
    // Verificar se há token válido no localStorage
    const token = this.getToken();
    if (token) {
      // O interceptor do api.ts já vai incluir o token automaticamente
      // Opcionalmente, validar o token
      this.validateToken().catch(() => {
        this.clearAuthData();
      });
    }
  }
}


const authService = AuthService.getInstance();
export default authService;

// Tipos legados para compatibilidade (podem ser removidos depois)
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
