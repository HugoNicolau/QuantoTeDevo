import api from './api';
import { 
  Amizade, 
  AmizadeSolicitacaoRequest, 
  AmizadeVerificacao,
  Usuario 
} from '../types/api';
import authService from './authService';

export class AmizadeService {
  // Helper para obter usuário atual
  private getUserId(): number {
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return userId;
  }

  // Solicitar amizade
  async solicitarAmizade(convidadoId: number, mensagem?: string): Promise<Amizade> {
    const usuarioId = this.getUserId();
    const response = await api.post<Amizade>(`/api/amizades/solicitar/${usuarioId}`, {
      convidadoId,
      mensagem
    });
    return response.data;
  }

  // Aceitar solicitação de amizade
  async aceitarAmizade(amizadeId: number): Promise<Amizade> {
    const usuarioId = this.getUserId();
    const response = await api.post<Amizade>(`/api/amizades/${amizadeId}/aceitar/${usuarioId}`);
    return response.data;
  }

  // Rejeitar solicitação de amizade
  async rejeitarAmizade(amizadeId: number): Promise<void> {
    const usuarioId = this.getUserId();
    await api.post(`/api/amizades/${amizadeId}/rejeitar/${usuarioId}`);
  }

  // Listar convites pendentes
  async listarConvitesPendentes(usuarioId?: number): Promise<Amizade[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Amizade[]>(`/api/amizades/pendentes/${userId}`);
    return response.data;
  }

  // Listar amigos
  async listarAmigos(usuarioId?: number): Promise<Usuario[]> {
    const userId = usuarioId || this.getUserId();
    const response = await api.get<Usuario[]>(`/api/amizades/usuario/${userId}`);
    return response.data;
  }

  // Verificar se são amigos
  async verificarAmizade(usuario1Id: number, usuario2Id: number): Promise<AmizadeVerificacao> {
    const response = await api.get<AmizadeVerificacao>(`/api/amizades/verificar/${usuario1Id}/${usuario2Id}`);
    return response.data;
  }

  // Remover amizade
  async removerAmizade(usuario1Id: number, usuario2Id: number): Promise<void> {
    await api.delete(`/api/amizades/remover/${usuario1Id}/${usuario2Id}`);
  }

  // Bloquear usuário
  async bloquearUsuario(bloqueadoId: number): Promise<void> {
    const bloqueadorId = this.getUserId();
    await api.post(`/api/amizades/bloquear/${bloqueadorId}/${bloqueadoId}`);
  }

  // Método de conveniência para verificar se é amigo do usuário atual
  async saoAmigos(outroUsuarioId: number): Promise<boolean> {
    const currentUserId = this.getUserId();
    const verificacao = await this.verificarAmizade(currentUserId, outroUsuarioId);
    return verificacao.saoAmigos;
  }

  // Método de conveniência para remover amizade com usuário atual
  async removerAmizadeComigo(outroUsuarioId: number): Promise<void> {
    const currentUserId = this.getUserId();
    await this.removerAmizade(currentUserId, outroUsuarioId);
  }

  // Obter estatísticas de amizade
  async obterEstatisticas(usuarioId?: number): Promise<{
    totalAmigos: number;
    convitesPendentes: number;
    convitesEnviados: number;
  }> {
    const userId = usuarioId || this.getUserId();
    const [amigos, convitesPendentes] = await Promise.all([
      this.listarAmigos(userId),
      this.listarConvitesPendentes(userId)
    ]);

    return {
      totalAmigos: amigos.length,
      convitesPendentes: convitesPendentes.length,
      convitesEnviados: 0 // Esta informação pode vir de outro endpoint se implementado
    };
  }
}

const amizadeService = new AmizadeService();
export default amizadeService;
