import api from './api';
import { 
  Usuario, 
  UsuarioCreateRequest,
  HistoricoUsuario 
} from '../types/api';

export class UsuarioService {
  // Listar usuários
  async listarUsuarios(): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>('/api/usuarios');
    return response.data;
  }

  // Buscar usuário por ID
  async buscarUsuario(id: number): Promise<Usuario> {
    const response = await api.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  }

  // Criar usuário
  async criarUsuario(usuario: UsuarioCreateRequest): Promise<Usuario> {
    const response = await api.post<Usuario>('/api/usuarios', usuario);
    return response.data;
  }

  // Atualizar usuário
  async atualizarUsuario(id: number, usuario: Partial<UsuarioCreateRequest>): Promise<Usuario> {
    const response = await api.put<Usuario>(`/usuarios/${id}`, usuario);
    return response.data;
  }

  // Excluir usuário
  async excluirUsuario(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  }

  // Buscar usuário por email
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    try {
      const response = await api.get<Usuario>(`/usuarios/email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      if ((error as { response?: { status?: number } }).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Buscar usuários por nome ou email
  async buscarUsuarios(termo: string): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>(`/usuarios/buscar?termo=${encodeURIComponent(termo)}`);
    return response.data;
  }

  // Verificar se email já existe
  async verificarEmailExiste(email: string): Promise<boolean> {
    try {
      const response = await api.get<{ existe: boolean }>(`/usuarios/verificar-email?email=${encodeURIComponent(email)}`);
      return response.data.existe;
    } catch {
      return false;
    }
  }

  // Obter perfil do usuário atual
  async obterPerfil(): Promise<Usuario> {
    const response = await api.get<Usuario>('/api/usuarios/perfil');
    return response.data;
  }

  // Atualizar perfil do usuário atual
  async atualizarPerfil(dados: Partial<UsuarioCreateRequest>): Promise<Usuario> {
    const response = await api.put<Usuario>('/api/usuarios/perfil', dados);
    return response.data;
  }

  // Obter histórico do usuário
  async obterHistorico(): Promise<HistoricoUsuario> {
    const response = await api.get<HistoricoUsuario>('/api/usuarios/historico');
    return response.data;
  }

  // Validar chave PIX
  async validarChavePix(chavePix: string): Promise<{
    valida: boolean;
    tipo: 'CPF' | 'CNPJ' | 'TELEFONE' | 'EMAIL' | 'ALEATORIA' | 'INVALIDA';
    formatada?: string;
  }> {
    const response = await api.post('/api/usuarios/validar-chave-pix', { chavePix });
    return response.data;
  }

  // Métodos legados para compatibilidade
  async getUsuarios(): Promise<Usuario[]> {
    return this.listarUsuarios();
  }

  async getUsuarioById(id: number): Promise<Usuario> {
    return this.buscarUsuario(id);
  }

  async createUsuario(usuario: UsuarioCreateRequest): Promise<Usuario> {
    return this.criarUsuario(usuario);
  }

  async updateUsuario(id: number, usuario: Partial<UsuarioCreateRequest>): Promise<Usuario> {
    return this.atualizarUsuario(id, usuario);
  }

  async deleteUsuario(id: number): Promise<void> {
    return this.excluirUsuario(id);
  }
}

const usuarioService = new UsuarioService();
export default usuarioService;

// Exportar também como objeto para compatibilidade
export { usuarioService };
