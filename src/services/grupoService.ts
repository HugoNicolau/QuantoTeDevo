import api from './api';
import { 
  Grupo, 
  GrupoCreateRequest, 
  GrupoMembrosRequest, 
  Usuario,
  Conta 
} from '../types/api';

export class GrupoService {
  // Listar grupos do usuário
  async listarGrupos(): Promise<Grupo[]> {
    const response = await api.get<Grupo[]>('/api/grupos');
    return response.data;
  }

  // Buscar grupo por ID
  async buscarGrupo(id: number): Promise<Grupo> {
    const response = await api.get<Grupo>(`/grupos/${id}`);
    return response.data;
  }

  // Criar novo grupo
  async criarGrupo(grupo: GrupoCreateRequest): Promise<Grupo> {
    const response = await api.post<Grupo>('/api/grupos', grupo);
    return response.data;
  }

  // Atualizar grupo
  async atualizarGrupo(id: number, grupo: Partial<GrupoCreateRequest>): Promise<Grupo> {
    const response = await api.put<Grupo>(`/grupos/${id}`, grupo);
    return response.data;
  }

  // Excluir grupo
  async excluirGrupo(id: number): Promise<void> {
    await api.delete(`/grupos/${id}`);
  }

  // Ativar/Desativar grupo
  async ativarGrupo(id: number): Promise<Grupo> {
    const response = await api.patch<Grupo>(`/grupos/${id}/ativar`);
    return response.data;
  }

  async desativarGrupo(id: number): Promise<Grupo> {
    const response = await api.patch<Grupo>(`/grupos/${id}/desativar`);
    return response.data;
  }

  // Gerenciar membros
  async adicionarMembros(id: number, usuarioIds: number[]): Promise<Grupo> {
    const request: GrupoMembrosRequest = {
      usuarioIds,
      acao: 'ADICIONAR'
    };
    const response = await api.post<Grupo>(`/grupos/${id}/membros`, request);
    return response.data;
  }

  async removerMembros(id: number, usuarioIds: number[]): Promise<Grupo> {
    const request: GrupoMembrosRequest = {
      usuarioIds,
      acao: 'REMOVER'
    };
    const response = await api.delete<Grupo>(`/grupos/${id}/membros`, { data: request });
    return response.data;
  }

  // Listar membros do grupo
  async listarMembros(id: number): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>(`/grupos/${id}/membros`);
    return response.data;
  }

  // Sair do grupo
  async sairDoGrupo(id: number): Promise<void> {
    await api.delete(`/grupos/${id}/sair`);
  }

  // Listar contas do grupo
  async listarContasGrupo(id: number): Promise<Conta[]> {
    const response = await api.get<Conta[]>(`/grupos/${id}/contas`);
    return response.data;
  }

  // Buscar grupos por nome
  async buscarGruposPorNome(nome: string): Promise<Grupo[]> {
    const response = await api.get<Grupo[]>(`/grupos/buscar?nome=${encodeURIComponent(nome)}`);
    return response.data;
  }

  // Verificar se usuário é membro
  async verificarMembro(grupoId: number, usuarioId?: number): Promise<boolean> {
    const url = usuarioId 
      ? `/grupos/${grupoId}/membros/${usuarioId}/verificar`
      : `/grupos/${grupoId}/membros/verificar`;
    
    const response = await api.get<{ ehMembro: boolean }>(url);
    return response.data.ehMembro;
  }

  // Verificar se usuário é criador
  async verificarCriador(grupoId: number, usuarioId?: number): Promise<boolean> {
    const url = usuarioId 
      ? `/grupos/${grupoId}/criador/${usuarioId}/verificar`
      : `/grupos/${grupoId}/criador/verificar`;
    
    const response = await api.get<{ ehCriador: boolean }>(url);
    return response.data.ehCriador;
  }

  // Obter estatísticas do grupo
  async obterEstatisticas(id: number): Promise<{
    totalMembros: number;
    totalContas: number;
    totalContasPagas: number;
    totalContasPendentes: number;
    valorTotalContas: number;
    valorTotalPago: number;
    valorTotalPendente: number;
  }> {
    const response = await api.get(`/grupos/${id}/estatisticas`);
    return response.data;
  }

  // Listar grupos ativos
  async listarGruposAtivos(): Promise<Grupo[]> {
    const response = await api.get<Grupo[]>('/api/grupos/ativos');
    return response.data;
  }

  // Listar grupos inativos
  async listarGruposInativos(): Promise<Grupo[]> {
    const response = await api.get<Grupo[]>('/api/grupos/inativos');
    return response.data;
  }

  // Listar grupos onde o usuário é criador
  async listarGruposCriados(): Promise<Grupo[]> {
    const response = await api.get<Grupo[]>('/api/grupos/criados');
    return response.data;
  }

  // Listar grupos onde o usuário é apenas membro
  async listarGruposParticipando(): Promise<Grupo[]> {
    const response = await api.get<Grupo[]>('/api/grupos/participando');
    return response.data;
  }
}


const grupoService = new GrupoService();
export default grupoService;
