
export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  chavePix?: string;
}

export const authService = {
  async loginDemo(credentials: LoginCredentials): Promise<AuthUser> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: 1,
      nome: 'Usuário Demo',
      email: credentials.email,
      chavePix: 'demo@pix.com'
    };
  },

  logout(): void {
    localStorage.removeItem('demoUser');
  },

  saveUser(user: AuthUser): void {
    localStorage.setItem('demoUser', JSON.stringify(user));
  },

  getUser(): AuthUser | null {
    const stored = localStorage.getItem('demoUser');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getUser();
  }
};
