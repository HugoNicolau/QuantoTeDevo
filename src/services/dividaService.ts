import api from './api';
import { 
  Divida, 
  DividaCreateRequest, 
  SaldoUsuario,
  DividaFilter 
} from '../types/api';
import authService from './authService';

export class DividaService {
  // Helper para obter usuário atual
  private getUserId(): number {
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return userId;
  }

  // Listar todas as dívidas (admin) ou filtradas
  async listarDividas(filtros?: DividaFilter): Promise<Divida[]> {
    const params = new URLSearchParams();
    
    if (filtros?.paga !== undefined) {
      params.append('paga', filtros.paga.toString());
    }

    const url = params.toString() ? `/api/dividas?${params.toString()}` : '/api/dividas';
    const response = await api.get<Divida[]>(url);
    return response.data;
  }

  // Buscar dívida por ID
  async buscarDivida(id: number): Promise<Divida> {
    const response = await api.get<Divida>(`/api/dividas/${id}`);
    return response.data;
  }

  // Criar nova dívida
  async criarDivida(divida: DividaCreateRequest): Promise<Divida> {
    const response = await api.post<Divida>('/api/dividas', divida);
    return response.data;
  }

  // Atualizar dívida
  async atualizarDivida(id: number, divida: Partial<DividaCreateRequest>): Promise<Divida> {
    const response = await api.put<Divida>(`/api/dividas/${id}`, divida);
    return response.data;
  }

  // Excluir dívida
  async excluirDivida(id: number): Promise<void> {
    await api.delete(`/api/dividas/${id}`);
  }

  // Marcar dívida como paga
  async marcarComoPaga(id: number, formaPagamento: string): Promise<Divida> {
    const response = await api.patch<Divida>(`/api/dividas/${id}/pagar`, {
      formaPagamento
    });
    return response.data;
  }

  // Listar dívidas que o usuário deve
  async listarDividasDevendo(usuarioId?: number): Promise<Divida[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Divida[]>(`/api/dividas/usuario/${userId}/devendo`);
    return response.data;
  }

  // Listar dívidas que o usuário tem a receber
  async listarDividasRecebendo(usuarioId?: number): Promise<Divida[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Divida[]>(`/api/dividas/usuario/${userId}/recebendo`);
    return response.data;
  }

  // Obter saldo do usuário
  async obterSaldoUsuario(usuarioId?: number): Promise<SaldoUsuario> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<SaldoUsuario>(`/api/dividas/usuario/${userId}/saldo`);
    return response.data;
  }

  // Métodos que podem não existir no backend, mantendo para compatibilidade
  async desfazerPagamento(id: number): Promise<Divida> {
    // Esta rota pode não existir, implementar se necessário
    const response = await api.patch<Divida>(`/api/dividas/${id}/desfazer-pagamento`);
    return response.data;
  }

  async listarDividasVencidas(usuarioId?: number): Promise<Divida[]> {
    // Implementar usando filtros nas rotas existentes
    const dividasDevendo = await this.listarDividasDevendo(usuarioId);
    const dividasRecebendo = await this.listarDividasRecebendo(usuarioId);
    
    const hoje = new Date();
    const vencidas = [...dividasDevendo, ...dividasRecebendo].filter(divida => 
      !divida.paga && new Date(divida.dataVencimento) < hoje
    );
    
    return vencidas;
  }

  async listarDividasVencendo(dias: number = 7, usuarioId?: number): Promise<Divida[]> {
    // Implementar usando filtros nas rotas existentes
    const dividasDevendo = await this.listarDividasDevendo(usuarioId);
    const dividasRecebendo = await this.listarDividasRecebendo(usuarioId);
    
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + dias);
    
    const vencendo = [...dividasDevendo, ...dividasRecebendo].filter(divida => 
      !divida.paga && 
      new Date(divida.dataVencimento) >= hoje &&
      new Date(divida.dataVencimento) <= dataLimite
    );
    
    return vencendo;
  }

  // Funcionalidades que podem ser implementadas no futuro
  async obterSaldoComUsuario(usuarioId: number): Promise<{
    usuarioId: number;
    totalDevendo: number;
    totalRecebendo: number;
    saldoLiquido: number;
    dividas: Divida[];
  }> {
    // Implementação local baseada nas rotas existentes
    const todasDividas = await this.listarDividas();
    const currentUserId = this.getUserId();
    
    const dividasRelacionadas = todasDividas.filter(divida =>
      (divida.usuarioDevedor.id === currentUserId && divida.usuarioCredor.id === usuarioId) ||
      (divida.usuarioDevedor.id === usuarioId && divida.usuarioCredor.id === currentUserId)
    );

    const totalDevendo = dividasRelacionadas
      .filter(d => d.usuarioDevedor.id === currentUserId && !d.paga)
      .reduce((sum, d) => sum + d.valor, 0);
      
    const totalRecebendo = dividasRelacionadas
      .filter(d => d.usuarioCredor.id === currentUserId && !d.paga)
      .reduce((sum, d) => sum + d.valor, 0);

    return {
      usuarioId,
      totalDevendo,
      totalRecebendo,
      saldoLiquido: totalRecebendo - totalDevendo,
      dividas: dividasRelacionadas
    };
  }

  // Métodos simplificados para funcionalidades avançadas
  async quitarDividasComUsuario(usuarioId: number): Promise<{
    dividasQuitadas: number;
    valorTotal: number;
    novoSaldo: number;
  }> {
    const saldo = await this.obterSaldoComUsuario(usuarioId);
    const dividasPendentes = saldo.dividas.filter(d => !d.paga);
    
    // Marcar todas como pagas
    for (const divida of dividasPendentes) {
      await this.marcarComoPaga(divida.id, 'QUITACAO');
    }

    return {
      dividasQuitadas: dividasPendentes.length,
      valorTotal: Math.abs(saldo.saldoLiquido),
      novoSaldo: 0
    };
  }

  async obterEstatisticas(usuarioId?: number): Promise<{
    totalDividas: number;
    totalDevendo: number;
    totalRecebendo: number;
    saldoLiquido: number;
    dividasPagas: number;
    dividasPendentes: number;
    dividasVencidas: number;
    maiorDivida: number;
    menorDivida: number;
    ticketMedio: number;
  }> {
    const userId = usuarioId || this.getUserId();
    const dividasDevendo = await this.listarDividasDevendo(userId);
    const dividasRecebendo = await this.listarDividasRecebendo(userId);
    const todasDividas = [...dividasDevendo, ...dividasRecebendo];

    const totalDevendo = dividasDevendo.filter(d => !d.paga).reduce((sum, d) => sum + d.valor, 0);
    const totalRecebendo = dividasRecebendo.filter(d => !d.paga).reduce((sum, d) => sum + d.valor, 0);
    const dividasPagas = todasDividas.filter(d => d.paga).length;
    const dividasPendentes = todasDividas.filter(d => !d.paga).length;
    
    const valores = todasDividas.map(d => d.valor);
    const maiorDivida = valores.length > 0 ? Math.max(...valores) : 0;
    const menorDivida = valores.length > 0 ? Math.min(...valores) : 0;
    const ticketMedio = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;

    const vencidas = await this.listarDividasVencidas(userId);

    return {
      totalDividas: todasDividas.length,
      totalDevendo,
      totalRecebendo,
      saldoLiquido: totalRecebendo - totalDevendo,
      dividasPagas,
      dividasPendentes,
      dividasVencidas: vencidas.length,
      maiorDivida,
      menorDivida,
      ticketMedio
    };
  }
}


const dividaService = new DividaService();
export default dividaService;
