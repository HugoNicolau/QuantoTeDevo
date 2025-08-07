import api from './api';
import { 
  Compra, 
  CompraCreateRequest, 
  ItemCompra,
  ItemCompraCreateRequest,
  CompraFilter 
} from '../types/api';
import authService from './authService';

export class CompraService {
  // Helper para obter usuário atual
  private getUserId(): number {
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return userId;
  }

  // Buscar compra por ID
  async buscarCompra(id: number): Promise<Compra> {
    const response = await api.get<Compra>(`/api/compras/${id}`);
    return response.data;
  }

  // Criar nova compra
  async criarCompra(compra: CompraCreateRequest): Promise<Compra> {
    const response = await api.post<Compra>('/api/compras', compra);
    return response.data;
  }

  // Atualizar compra
  async atualizarCompra(id: number, compra: Partial<CompraCreateRequest>): Promise<Compra> {
    const response = await api.put<Compra>(`/api/compras/${id}`, compra);
    return response.data;
  }

  // Excluir compra
  async excluirCompra(id: number): Promise<void> {
    await api.delete(`/api/compras/${id}`);
  }

  // Listar compras criadas pelo usuário
  async listarComprasCriadas(usuarioId?: number, filtros?: CompraFilter): Promise<Compra[]> {
    const userId = usuarioId || this.getUserId();
    const params = new URLSearchParams();
    
    if (filtros?.finalizada !== undefined) {
      params.append('finalizada', filtros.finalizada.toString());
    }

    const url = params.toString() 
      ? `/api/compras/usuario/${userId}/criadas?${params.toString()}` 
      : `/api/compras/usuario/${userId}/criadas`;
    const response = await api.get<Compra[]>(url);
    return response.data;
  }

  // Listar compras onde o usuário participa
  async listarComprasParticipando(usuarioId?: number, filtros?: CompraFilter): Promise<Compra[]> {
    const userId = usuarioId || this.getUserId();
    const params = new URLSearchParams();
    
    if (filtros?.ativas !== undefined) {
      params.append('ativas', filtros.ativas.toString());
    }

    const url = params.toString() 
      ? `/api/compras/usuario/${userId}/participando?${params.toString()}` 
      : `/api/compras/usuario/${userId}/participando`;
    const response = await api.get<Compra[]>(url);
    return response.data;
  }

  // Reabrir compra (esta rota pode não existir)
  async reabrirCompra(id: number): Promise<Compra> {
    const response = await api.patch<Compra>(`/api/compras/${id}/reabrir`);
    return response.data;
  }

  // Listar itens de uma compra
  async listarItens(compraId: number): Promise<ItemCompra[]> {
    // Esta funcionalidade pode estar incluída no GET /api/compras/{id}
    const compra = await this.buscarCompra(compraId);
    return compra.itens || [];
  }

  // Buscar item por ID
  async buscarItem(compraId: number, itemId: number): Promise<ItemCompra> {
    const itens = await this.listarItens(compraId);
    const item = itens.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item não encontrado');
    }
    return item;
  }

  // Adicionar item à compra
  async adicionarItem(compraId: number, item: ItemCompraCreateRequest): Promise<ItemCompra> {
    const response = await api.post<ItemCompra>(`/api/compras/${compraId}/itens`, item);
    return response.data;
  }

  // Atualizar item
  async atualizarItem(compraId: number, itemId: number, item: Partial<ItemCompraCreateRequest>): Promise<ItemCompra> {
    const response = await api.put<ItemCompra>(`/api/compras/${compraId}/itens/${itemId}`, item);
    return response.data;
  }

  // Remover item
  async removerItem(compraId: number, itemId: number): Promise<void> {
    await api.delete(`/api/compras/${compraId}/itens/${itemId}`);
  }

  // Assumir responsabilidade por item
  async assumirItem(compraId: number, itemId: number): Promise<ItemCompra> {
    const response = await api.patch<ItemCompra>(`/compras/${compraId}/itens/${itemId}/assumir`);
    return response.data;
  }

  // Transferir responsabilidade de item
  async transferirItem(compraId: number, itemId: number, novoResponsavelId: number): Promise<ItemCompra> {
    const response = await api.patch<ItemCompra>(`/compras/${compraId}/itens/${itemId}/transferir`, {
      novoResponsavelId
    });
    return response.data;
  }

  // Dividir item entre múltiplos usuários
  async dividirItem(
    compraId: number, 
    itemId: number, 
    responsaveis: Array<{ usuarioId: number; percentual: number }>
  ): Promise<ItemCompra[]> {
    const response = await api.post<ItemCompra[]>(`/compras/${compraId}/itens/${itemId}/dividir`, {
      responsaveis
    });
    return response.data;
  }

  // Finalizar compra
  async finalizarCompra(id: number): Promise<{
    id: number;
    descricao: string;
    finalizada: boolean;
    dividasGeradas: number;
  }> {
    const response = await api.patch(`/api/compras/${id}/finalizar`);
    return response.data;
  }

  // Listar compras ativas
  async listarComprasAtivas(usuarioId?: number): Promise<Compra[]> {
    return this.listarComprasParticipando(usuarioId, { ativas: true });
  }

  // Listar compras finalizadas
  async listarComprasFinalizadas(): Promise<Compra[]> {
    const response = await api.get<Compra[]>('/api/compras/finalizadas');
    return response.data;
  }

  // Obter resumo da compra
  async obterResumo(id: number): Promise<{
    compra: Compra;
    valorTotal: number;
    totalItens: number;
    participantes: Array<{
      usuarioId: number;
      usuarioNome: string;
      totalResponsavel: number;
      itensResponsavel: number;
      percentualParticipacao: number;
    }>;
    itensSemResponsavel: ItemCompra[];
  }> {
    const response = await api.get(`/compras/${id}/resumo`);
    return response.data;
  }

  // Converter compra em contas
  async converterEmContas(id: number, options?: {
    criarContasPorUsuario?: boolean;
    criarContaUnica?: boolean;
    descricaoBase?: string;
    vencimento?: string;
  }): Promise<{
    contasCriadas: number;
    contasIds: number[];
    valorTotal: number;
  }> {
    const response = await api.post(`/compras/${id}/converter-contas`, options);
    return response.data;
  }

  // Duplicar compra
  async duplicarCompra(id: number, novaDescricao?: string): Promise<Compra> {
    const response = await api.post<Compra>(`/compras/${id}/duplicar`, {
      novaDescricao
    });
    return response.data;
  }

  // Importar lista de compras
  async importarLista(arquivo: File): Promise<{
    compraId: number;
    itensImportados: number;
    erros: Array<{ linha: number; erro: string }>;
  }> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const response = await api.post('/api/compras/importar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Exportar compra para CSV
  async exportarCSV(id: number): Promise<Blob> {
    const response = await api.get(`/compras/${id}/exportar/csv`, { 
      responseType: 'blob' 
    });
    return response.data;
  }

  // Gerar relatório da compra
  async gerarRelatorio(id: number, formato: 'PDF' | 'EXCEL' = 'PDF'): Promise<Blob> {
    const response = await api.get(`/compras/${id}/relatorio?formato=${formato}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Compartilhar compra
  async compartilharCompra(id: number, usuarioIds: number[]): Promise<{
    compraCompartilhada: boolean;
    usuariosConvidados: number;
    erros: Array<{ usuarioId: number; erro: string }>;
  }> {
    const response = await api.post(`/compras/${id}/compartilhar`, {
      usuarioIds
    });
    return response.data;
  }

  // Obter estatísticas das compras
  async obterEstatisticas(): Promise<{
    totalCompras: number;
    comprasAtivas: number;
    comprasFinalizadas: number;
    totalItens: number;
    valorTotalCompras: number;
    valorMedioCompra: number;
    valorMedioItem: number;
    categoriasMaisCompradas: Array<{
      categoria: string;
      quantidade: number;
      valor: number;
    }>;
  }> {
    const response = await api.get('/api/compras/estatisticas');
    return response.data;
  }

  // Buscar compras por período
  async buscarPorPeriodo(dataInicio: string, dataFim: string): Promise<Compra[]> {
    const response = await api.get<Compra[]>('/api/compras/periodo', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  }

  // Buscar itens por descrição
  async buscarItensPorDescricao(termo: string): Promise<ItemCompra[]> {
    const response = await api.get<ItemCompra[]>('/api/compras/itens/buscar', {
      params: { termo }
    });
    return response.data;
  }

  // Obter histórico de preços de um item
  async obterHistoricoPrecos(descricao: string): Promise<Array<{
    data: string;
    valor: number;
    compraId: number;
    compraDescricao: string;
  }>> {
    const response = await api.get('/api/compras/itens/historico-precos', {
      params: { descricao }
    });
    return response.data;
  }

  // Sugerir itens baseado no histórico
  async sugerirItens(limite: number = 10): Promise<Array<{
    descricao: string;
    frequencia: number;
    valorMedio: number;
    ultimaCompra: string;
  }>> {
    const response = await api.get('/api/compras/itens/sugestoes', {
      params: { limite }
    });
    return response.data;
  }
}


const compraService = new CompraService();
export default compraService;
