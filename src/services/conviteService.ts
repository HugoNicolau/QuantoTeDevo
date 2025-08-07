import api from './api';
import { 
  Convite, 
  ConviteCreateRequest, 
  ConviteAceitarRequest 
} from '../types/api';
import authService from './authService';

export class ConviteService {
  // Helper para obter usuário atual
  private getUserId(): number {
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return userId;
  }

  // Criar convite para uma conta
  async criarConvite(contaId: number, convite: ConviteCreateRequest): Promise<Convite> {
    const usuarioId = this.getUserId();
    const response = await api.post<Convite>(`/api/convites/conta/${contaId}/convidar/${usuarioId}`, convite);
    return response.data;
  }

  // Buscar convite por token
  async buscarConvitePorToken(token: string): Promise<Convite> {
    const response = await api.get<Convite>(`/api/convites/token/${token}`);
    return response.data;
  }

  // Aceitar convite
  async aceitarConvite(token: string, dados: ConviteAceitarRequest): Promise<Convite> {
    const response = await api.post<Convite>(`/api/convites/token/${token}/aceitar`, dados);
    return response.data;
  }

  // Rejeitar convite
  async rejeitarConvite(token: string): Promise<void> {
    await api.post(`/api/convites/token/${token}/rejeitar`);
  }

  // Listar convites de uma conta
  async listarConvitesConta(contaId: number): Promise<Convite[]> {
    const response = await api.get<Convite[]>(`/api/convites/conta/${contaId}`);
    return response.data;
  }

  // Listar convites enviados pelo usuário
  async listarConvitesEnviados(usuarioId?: number): Promise<Convite[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Convite[]>(`/api/convites/usuario/${userId}/enviados`);
    return response.data;
  }

  // Listar convites pendentes para um email
  async listarConvitesPorEmail(email: string): Promise<Convite[]> {
    const response = await api.get<Convite[]>(`/api/convites/email/${email}/pendentes`);
    return response.data;
  }

  // Marcar convites expirados (processo interno)
  async marcarExpirados(): Promise<void> {
    await api.post('/api/convites/marcar-expirados');
  }

  // Método de conveniência para verificar convites do usuário atual
  async obterEstatisticas(usuarioId?: number): Promise<{
    totalEnviados: number;
    pendentes: number;
    aceitos: number;
    rejeitados: number;
    expirados: number;
  }> {
    const userId = usuarioId || this.getUserId();
    const convites = await this.listarConvitesEnviados(userId);

    return {
      totalEnviados: convites.length,
      pendentes: convites.filter(c => c.status === 'PENDENTE').length,
      aceitos: convites.filter(c => c.status === 'ACEITO').length,
      rejeitados: convites.filter(c => c.status === 'REJEITADO').length,
      expirados: convites.filter(c => c.status === 'EXPIRADO').length
    };
  }
}

const conviteService = new ConviteService();
export default conviteService;
