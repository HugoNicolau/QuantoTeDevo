// Tipos para usuários (mantido para contexto)
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  chavePix: string;
}
export interface UsuarioCreateRequest {
  nome: string;
  email: string;
  chavePix: string;
}
// Tipos para contas
export interface Conta {
  id: number;
  descricao: string;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  criador: Usuario;
  paga: boolean;
  dataCriacao: string; // ISO datetime
  divisoes: Divisao[];
}

export interface ContaCreateRequest {
  descricao: string;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  criadorId: number;
}

// Tipos para divisões
export interface Divisao {
  id: number;
  conta: Conta;
  usuario: Usuario;
  valor: number;
  pago: boolean;
  dataPagamento?: string;
  formaPagamento?: string;
}

export interface DivisaoCreateRequest {
  contaId: number;
  usuarioId: number;
  valor: number;
}

export interface PagamentoDivisaoRequest {
  formaPagamento: string;
}

// Tipos para filtros
export interface ContaFilter {
  paga?: boolean;
}

// Tipos de resposta para erros
export interface ErrorResponse {
  message: string;
  timestamp: string;
  status: number;
  path: string;
}
