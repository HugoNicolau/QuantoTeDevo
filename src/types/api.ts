// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
  message: string;
}

// Resposta específica da API de autenticação
export interface ApiAuthResponse {
  message: string;
  data: AuthResponse;
}

// Tipos de autenticação
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  chavePix: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

// Tipos para usuários
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
  status: 'PENDENTE' | 'PAGA' | 'VENCIDA' | 'PARCIALMENTE_PAGA';
  dataCriacao: string; // ISO datetime
  divisoes: Divisao[];
  grupo?: Grupo;
}

export interface ContaCreateRequest {
  descricao: string;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  criadorId: number;
  grupoId?: number;
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

export interface DivisaoPorcentagemRequest {
  contaId: number;
  divisoes: {
    usuarioId: number;
    percentual: number;
  }[];
}

export interface PagamentoDivisaoRequest {
  formaPagamento: string;
}

// Tipos para dívidas
export interface Divida {
  id: number;
  descricao: string;
  valor: number;
  usuarioDevedor: Usuario;
  usuarioCredor: Usuario;
  dataCriacao: string;
  dataVencimento?: string;
  paga: boolean;
  dataPagamento?: string;
  formaPagamento?: string;
}

export interface DividaCreateRequest {
  descricao: string;
  valor: number;
  usuarioDevedorId: number;
  usuarioCredorId: number;
  dataVencimento?: string;
}

export interface SaldoUsuario {
  usuarioId: number;
  totalDevendo: number;
  totalRecebendo: number;
  saldoLiquido: number;
}

// Tipos para compras
export interface Compra {
  id: number;
  descricao: string;
  dataCompra: string;
  dataCriacao: string;
  usuarioCriador: Usuario;
  itens: ItemCompra[];
  finalizada: boolean;
  observacoes?: string;
  valorTotal: number;
}

export interface ItemCompra {
  id: number;
  descricao: string;
  valor: number;
  quantidade: number;
  usuarioResponsavel: Usuario;
  observacoes?: string;
  valorTotal: number;
}

export interface CompraCreateRequest {
  descricao: string;
  usuarioCriadorId: number;
  observacoes?: string;
  itens: ItemCompraCreateRequest[];
}

export interface ItemCompraCreateRequest {
  descricao: string;
  valor: number;
  quantidade: number;
  usuarioResponsavelId: number;
  observacoes?: string;
}

// Tipos para grupos
export interface Grupo {
  id: number;
  nome: string;
  descricao: string;
  criador: Usuario;
  membros: Usuario[];
  dataCriacao: string;
  ativo: boolean;
  totalMembros: number;
  totalContas: number;
  usuarioECriador: boolean;
  usuarioEMembro: boolean;
}

export interface GrupoCreateRequest {
  nome: string;
  descricao: string;
  membrosIniciais: number[];
}

export interface GrupoMembrosRequest {
  usuarioIds: number[];
  acao: 'ADICIONAR' | 'REMOVER';
}

// Tipos para amizades
export interface Amizade {
  id: number;
  solicitanteId: number;
  solicitante: Usuario;
  convidadoId: number;
  convidado: Usuario;
  status: 'PENDENTE' | 'ACEITA' | 'REJEITADA' | 'BLOQUEADA';
  dataSolicitacao: string;
  dataResposta?: string;
  solicitacao: boolean;
}

export interface AmizadeSolicitacaoRequest {
  convidadoId: number;
  mensagem?: string;
}

export interface AmizadeVerificacao {
  saoAmigos: boolean;
}

// Tipos para convites
export interface Convite {
  id: number;
  token: string;
  emailConvidado: string;
  nomeConvidado: string;
  valorSugerido?: number;
  mensagem?: string;
  status: 'PENDENTE' | 'ACEITO' | 'REJEITADO' | 'EXPIRADO';
  dataConvite: string;
  dataExpiracao: string;
  dataAceite?: string;
  contaId: number;
  contaDescricao: string;
  contaValor: number;
  usuarioConvidanteId: number;
  usuarioConvidanteNome: string;
  usuarioConvidadoId?: number;
  usuarioConvidadoNome?: string;
  expirado: boolean;
  diasParaVencer: number;
}

export interface ConviteCreateRequest {
  emailConvidado: string;
  nomeConvidado: string;
  valorSugerido?: number;
  mensagem?: string;
  diasValidadeConvite?: number;
}

export interface ConviteAceitarRequest {
  nome: string;
  chavePix: string;
  aceitarDivisao: boolean;
}

// Tipos para notificações
export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: NotificacaoTipo;
  tipoDescricao: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  prioridadeDescricao: string;
  prioridadeCor: string;
  dataCriacao: string;
  dataLeitura?: string;
  lida: boolean;
  referenciaId?: number;
  referenciaTipo?: 'CONTA' | 'DIVIDA' | 'COMPRA' | 'CONVITE';
  dataExpiracao?: string;
  expirada: boolean;
  diasAteExpiracao?: number;
}

export type NotificacaoTipo = 
  | 'CONTA_VENCENDO'
  | 'CONTA_VENCIDA'
  | 'DIVIDA_PENDENTE'
  | 'DIVISAO_PENDENTE'
  | 'PAGAMENTO_RECEBIDO'
  | 'CONVITE_RECEBIDO'
  | 'CONTA_CRIADA'
  | 'LEMBRETE_PAGAMENTO'
  | 'SISTEMA';

export interface NotificacaoContador {
  naoLidas: number;
  temNovas: boolean;
}

export interface NotificacaoEstatisticas {
  totalNotificacoes: number;
  notificacoesNaoLidas: number;
  notificacoesLidas: number;
  notificacoesExpiradas: number;
  contaVencendo: number;
  contaVencida: number;
  dividaPendente: number;
  divisaoPendente: number;
  conviteRecebido: number;
  percentualLidas: number;
}

export interface NotificacaoTipoInfo {
  codigo: NotificacaoTipo;
  descricao: string;
  icone: string;
}

// Tipos para histórico
export interface HistoricoUsuario {
  usuarioId: number;
  contasCriadas: number;
  divisoesPendentes: number;
  divisoesPagas: number;
  dividasDevendo: number;
  dividasRecebendo: number;
  comprasCriadas: number;
  comprasParticipando: number;
  saldoTotal: number;
}

// Tipos para filtros
export interface ContaFilter {
  paga?: boolean;
  vencimentoInicial?: string;
  vencimentoFinal?: string;
}

export interface DivisaoFilter {
  pago?: boolean;
}

export interface DividaFilter {
  paga?: boolean;
}

export interface CompraFilter {
  finalizada?: boolean;
  ativas?: boolean;
}

// Tipos de resposta para erros
export interface ErrorResponse {
  message: string;
  timestamp: string;
  status: number;
  path: string;
  error?: string;
}
