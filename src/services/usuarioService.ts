import api from './api';
import { Usuario, UsuarioCreateRequest } from '../types/api';

export const usuarioService = {
  async getUsuarios(): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>('/api/usuarios');
    return response.data;
  },

  async getUsuarioById(id: number): Promise<Usuario> {
    const response = await api.get<Usuario>(`/api/usuarios/${id}`);
    return response.data;
  },

  async createUsuario(usuario: UsuarioCreateRequest): Promise<Usuario> {
    const response = await api.post<Usuario>('/api/usuarios', usuario);
    return response.data;
  },

  async updateUsuario(id: number, usuario: Partial<UsuarioCreateRequest>): Promise<Usuario> {
    const response = await api.put<Usuario>(`/api/usuarios/${id}`, usuario);
    return response.data;
  },

  async deleteUsuario(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}`);
  }
};
