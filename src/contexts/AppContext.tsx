
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthUser } from '../services/authService';

export interface Conta {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  tipo: 'Pessoal' | 'Compartilhada';
  usuariosCompartilhados?: string[];
  status?: 'Paga' | 'Vencida' | 'Pendente';
  dataPagamento?: string;
}

interface AppContextType {
  isLoggedIn: boolean;
  usuario: AuthUser | null;
  login: (usuario: AuthUser) => void;
  logout: () => void;
  
  contas: Conta[];
  adicionarConta: (conta: Omit<Conta, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const dadosFicticios: Conta[] = [
  {
    id: '1',
    descricao: 'Conta de Luz',
    valor: 185.50,
    dataVencimento: '2024-12-25',
    tipo: 'Pessoal',
    status: 'Pendente'
  },
  {
    id: '2',
    descricao: 'Aluguel do Apartamento',
    valor: 1200.00,
    dataVencimento: '2024-12-10',
    tipo: 'Compartilhada',
    usuariosCompartilhados: ['João Silva', 'Maria Santos'],
    status: 'Vencida'
  },
  {
    id: '3',
    descricao: 'Internet Fibra',
    valor: 89.90,
    dataVencimento: '2024-12-15',
    tipo: 'Pessoal',
    status: 'Paga',
    dataPagamento: '2024-12-12'
  },
  {
    id: '4',
    descricao: 'Jantar no Restaurante',
    valor: 160.00,
    dataVencimento: '2024-12-20',
    tipo: 'Compartilhada',
    usuariosCompartilhados: ['Ana Costa', 'Pedro Lima', 'Carlos Oliveira'],
    status: 'Pendente'
  },
  {
    id: '5',
    descricao: 'Cartão de Crédito',
    valor: 450.75,
    dataVencimento: '2024-12-05',
    tipo: 'Pessoal',
    status: 'Vencida'
  },
  {
    id: '6',
    descricao: 'Assinatura Netflix',
    valor: 45.90,
    dataVencimento: '2024-12-18',
    tipo: 'Compartilhada',
    usuariosCompartilhados: ['Família Silva'],
    status: 'Paga',
    dataPagamento: '2024-12-16'
  }
];

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [contas, setContas] = useState<Conta[]>(dadosFicticios);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState<AuthUser | null>(null);

  // Verificar se há usuário salvo ao inicializar
  useEffect(() => {
    const savedUser = authService.getUser();
    if (savedUser) {
      setIsLoggedIn(true);
      setUsuario(savedUser);
    }
  }, []);

  const adicionarConta = (novaConta: Omit<Conta, 'id'>) => {
    const conta: Conta = {
      ...novaConta,
      id: Date.now().toString(),
      status: 'Pendente'
    };
    setContas(prev => [...prev, conta]);
  };

  const login = (userData: AuthUser) => {
    setIsLoggedIn(true);
    setUsuario(userData);
    authService.saveUser(userData);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsuario(null);
    authService.logout();
  };

  return (
    <AppContext.Provider value={{
      isLoggedIn,
      usuario,
      login,
      logout,
      
      contas,
      adicionarConta
    }}>
      {children}
    </AppContext.Provider>
  );
};
