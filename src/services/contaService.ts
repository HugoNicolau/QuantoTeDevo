import api from './api';
import { 
  Conta, 
  ContaCreateRequest, 
  Divisao, 
  DivisaoCreateRequest, 
  DivisaoPorcentagemRequest,
  PagamentoDivisaoRequest,
  ContaFilter 
} from '../types/api';
import authService from './authService';

export class ContaService {
  // Helper para obter usuário atual
  private getUserId(): number {
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return userId;
  }

  // Contas por usuário
  async listarContas(usuarioId?: number, filtros?: ContaFilter): Promise<Conta[]> {
    const userId = usuarioId || this.getUserId();
    const params = new URLSearchParams();
    
    if (filtros?.paga !== undefined) {
      params.append('paga', filtros.paga.toString());
    }
    
    if (filtros?.vencimentoInicial) {
      params.append('vencimentoInicial', filtros.vencimentoInicial);
    }
    
    if (filtros?.vencimentoFinal) {
      params.append('vencimentoFinal', filtros.vencimentoFinal);
    }
    
    const url = params.toString() 
      ? `/api/contas/usuario/${userId}?${params.toString()}` 
      : `/api/contas/usuario/${userId}`;
    const response = await api.get<Conta[]>(url);
    return response.data;
  }

  async buscarConta(id: number): Promise<Conta> {
    const response = await api.get<Conta>(`/api/contas/${id}`);
    return response.data;
  }  async criarConta(conta: ContaCreateRequest): Promise<Conta> {
    const response = await api.post<Conta>('/api/contas', conta);
    return response.data;
  }

  async atualizarConta(id: number, conta: Partial<ContaCreateRequest>): Promise<Conta> {
    const response = await api.put<Conta>(`/api/contas/${id}`, conta);
    return response.data;
  }

  async excluirConta(id: number): Promise<void> {
    await api.delete(`/api/contas/${id}`);
  }

  async marcarComoPaga(id: number): Promise<Conta> {
    const response = await api.patch<Conta>(`/api/contas/${id}/marcar-paga`);
    return response.data;
  }

  async marcarComoVencida(id: number): Promise<Conta> {
    const response = await api.patch<Conta>(`/api/contas/${id}/marcar-vencida`);
    return response.data;
  }

  async marcarComoPendente(id: number): Promise<Conta> {
    // Esta rota pode não existir no backend, mantendo para compatibilidade
    const response = await api.patch<Conta>(`/api/contas/${id}/pendente`);
    return response.data;
  }

  // Novas funcionalidades de status
  async alterarStatus(id: number, status: 'PENDENTE' | 'PAGA' | 'VENCIDA' | 'PARCIALMENTE_PAGA'): Promise<Conta> {
    if (status === 'PAGA') {
      return this.marcarComoPaga(id);
    } else if (status === 'VENCIDA') {
      return this.marcarComoVencida(id);
    }
    // Para outros status, usar endpoint genérico se existir
    const response = await api.patch<Conta>(`/api/contas/${id}/status`, { status });
    return response.data;
  }

  // Filtros por usuário
  async listarContasPagas(usuarioId?: number): Promise<Conta[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Conta[]>(`/api/contas/usuario/${userId}?paga=true`);
    return response.data;
  }

  async listarContasPendentes(usuarioId?: number): Promise<Conta[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Conta[]>(`/api/contas/usuario/${userId}?paga=false`);
    return response.data;
  }

  async listarContasVencidas(usuarioId?: number): Promise<Conta[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Conta[]>(`/api/contas/usuario/${userId}/vencidas`);
    return response.data;
  }

  async listarContasVencendo(dias: number = 7, usuarioId?: number): Promise<Conta[]> {
    const userId = usuarioId || this.getUserId();
    // Esta rota pode não existir no backend, adaptando para filtros
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + dias);
    const response = await api.get<Conta[]>(`/api/contas/usuario/${userId}/filtros`, {
      params: { 
        paga: false,
        vencimentoFinal: dataFim.toISOString().split('T')[0]
      }
    });
    return response.data;
  }

  async listarContasCriadas(usuarioId?: number): Promise<Conta[]> {
    // Esta rota pode estar implícita em /api/contas/usuario/{usuarioId}
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Conta[]>(`/api/contas/usuario/${userId}`);
    return response.data;
  }

  async listarContasParticipando(usuarioId?: number): Promise<Conta[]> {
    // Esta rota pode precisar ser implementada ou usar divisões
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Conta[]>(`/api/contas/usuario/${userId}`);
    return response.data;
  }

  // Busca e filtros
  async buscarPorDescricao(termo: string, usuarioId?: number): Promise<Conta[]> {
    const userId = usuarioId || this.getUserId();
    // Adaptando para usar filtros do usuário
    const response = await api.get<Conta[]>(`/api/contas/usuario/${userId}`);
    // Filtro local por descrição (pode ser melhorado no backend)
    return response.data.filter(conta => 
      conta.descricao.toLowerCase().includes(termo.toLowerCase())
    );
  }

  async buscarPorPeriodo(dataInicio: string, dataFim: string, usuarioId?: number): Promise<Conta[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Conta[]>(`/api/contas/usuario/${userId}/filtros`, {
      params: { 
        vencimentoInicial: dataInicio, 
        vencimentoFinal: dataFim 
      }
    });
    return response.data;
  }

  async buscarPorValor(valorMinimo?: number, valorMaximo?: number, usuarioId?: number): Promise<Conta[]> {
    const userId = usuarioId || this.getUserId();
    // Adaptando para filtro local já que a API pode não ter este endpoint
    const response = await api.get<Conta[]>(`/api/contas/usuario/${userId}`);
    return response.data.filter(conta => {
      if (valorMinimo !== undefined && conta.valor < valorMinimo) return false;
      if (valorMaximo !== undefined && conta.valor > valorMaximo) return false;
      return true;
    });
  }

  // Divisões
  async listarDivisoes(contaId: number): Promise<Divisao[]> {
    const response = await api.get<Divisao[]>(`/api/divisoes/conta/${contaId}`);
    return response.data;
  }

  async buscarDivisao(divisaoId: number): Promise<Divisao> {
    // Adaptando já que não temos endpoint específico
    const response = await api.get<Divisao>(`/api/divisoes/${divisaoId}`);
    return response.data;
  }

  async criarDivisao(divisao: DivisaoCreateRequest): Promise<Divisao> {
    const response = await api.post<Divisao>('/api/divisoes', divisao);
    return response.data;
  }

  async atualizarDivisao(id: number, divisao: Partial<DivisaoCreateRequest>): Promise<Divisao> {
    const response = await api.put<Divisao>(`/api/divisoes/${id}`, divisao);
    return response.data;
  }

  async excluirDivisao(id: number): Promise<void> {
    await api.delete(`/api/divisoes/${id}`);
  }

  async marcarDivisaoComoPaga(id: number, dados: PagamentoDivisaoRequest): Promise<Divisao> {
    const response = await api.patch<Divisao>(`/api/divisoes/${id}/pagar`, dados);
    return response.data;
  }

  async marcarDivisaoComoPendente(id: number): Promise<Divisao> {
    // Esta rota pode não existir, mantendo para compatibilidade
    const response = await api.patch<Divisao>(`/api/divisoes/${id}/pendente`);
    return response.data;
  }

  // Divisão automática
  async dividirContaIgualmente(contaId: number, usuarioIds: number[]): Promise<Divisao[]> {
    // Esta rota pode não existir, adaptando para divisão por porcentagem
    const porcentagemPorUsuario = 1.0 / usuarioIds.length;
    const divisoes = usuarioIds.map(usuarioId => ({
      usuarioId,
      percentual: porcentagemPorUsuario
    }));
    
    await this.dividirContaPorPorcentagem({ contaId, divisoes });
    // Retorna as divisões criadas
    return this.listarDivisoes(contaId);
  }

  async dividirContaPorPorcentagem(request: DivisaoPorcentagemRequest): Promise<string> {
    const response = await api.post<string>('/api/divisoes/dividir-porcentagem', request);
    return response.data;
  }

  async dividirContaPorValor(contaId: number, divisoes: Array<{ usuarioId: number; valor: number }>): Promise<Divisao[]> {
    // Convertendo para chamadas individuais de divisão
    const criadaDivisoes: Divisao[] = [];
    for (const divisao of divisoes) {
      const novaDivisao = await this.criarDivisao({
        contaId,
        usuarioId: divisao.usuarioId,
        valor: divisao.valor
      });
      criadaDivisoes.push(novaDivisao);
    }
    return criadaDivisoes;
  }

  // Relatórios e estatísticas
  async obterEstatisticas(usuarioId?: number): Promise<{
    totalContas: number;
    contasPagas: number;
    contasPendentes: number;
    contasVencidas: number;
    valorTotalContas: number;
    valorTotalPago: number;
    valorTotalPendente: number;
    valorMedioConta: number;
    contasMaisCaras: Conta[];
    contasVencendoEstaSemanao: number;
  }> {
    const userId = usuarioId || this.getUserId();
    // Como não temos endpoint específico, calculamos localmente
    const contas = await this.listarContas(userId);
    const contasPagas = contas.filter(c => c.paga);
    const contasPendentes = contas.filter(c => !c.paga && c.status !== 'VENCIDA');
    const contasVencidas = contas.filter(c => c.status === 'VENCIDA');
    
    const valorTotalContas = contas.reduce((sum, c) => sum + c.valor, 0);
    const valorTotalPago = contasPagas.reduce((sum, c) => sum + c.valor, 0);
    const valorTotalPendente = valorTotalContas - valorTotalPago;
    
    return {
      totalContas: contas.length,
      contasPagas: contasPagas.length,
      contasPendentes: contasPendentes.length,
      contasVencidas: contasVencidas.length,
      valorTotalContas,
      valorTotalPago,
      valorTotalPendente,
      valorMedioConta: contas.length > 0 ? valorTotalContas / contas.length : 0,
      contasMaisCaras: contas.sort((a, b) => b.valor - a.valor).slice(0, 5),
      contasVencendoEstaSemanao: 0 // Implementar lógica se necessário
    };
  }

  // Minhas divisões
  async listarMinhasDivisoes(usuarioId?: number): Promise<Divisao[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Divisao[]>(`/api/divisoes/usuario/${userId}`);
    return response.data;
  }

  async listarDivisoesPendentes(usuarioId?: number): Promise<Divisao[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Divisao[]>(`/api/divisoes/usuario/${userId}?pago=false`);
    return response.data;
  }

  async listarDivisoesPagas(usuarioId?: number): Promise<Divisao[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Divisao[]>(`/api/divisoes/usuario/${userId}?pago=true`);
    return response.data;
  }

  // Métodos legados para compatibilidade
  async getContas(filter?: ContaFilter, usuarioId?: number): Promise<Conta[]> {
    return this.listarContas(usuarioId, filter);
  }

  async getContaById(id: number): Promise<Conta> {
    return this.buscarConta(id);
  }

  async createConta(conta: ContaCreateRequest): Promise<Conta> {
    return this.criarConta(conta);
  }

  async updateConta(id: number, conta: Partial<ContaCreateRequest>): Promise<Conta> {
    return this.atualizarConta(id, conta);
  }

  async deleteConta(id: number): Promise<void> {
    return this.excluirConta(id);
  }

  async getContasPorUsuario(usuarioId: number, filter?: ContaFilter): Promise<Conta[]> {
    return this.listarContas(usuarioId, filter);
  }
}

const contaService = new ContaService();
export default contaService;

export { contaService };
