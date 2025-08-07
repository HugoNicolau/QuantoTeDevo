import api from './api';
import { 
  Conta, 
  ContaCreateRequest, 
  ContaFilter 
} from '../types/api';

export const contaService = {
  async getContas(filter?: ContaFilter): Promise<Conta[]> {
    const params = new URLSearchParams();
    
    if (filter?.paga !== undefined) params.append('paga', filter.paga.toString());

    const response = await api.get<Conta[]>(`/api/contas?${params}`);
    return response.data;
  },

  async getContaById(id: number): Promise<Conta> {
    const response = await api.get<Conta>(`/api/contas/${id}`);
    return response.data;
  },

  async createConta(conta: ContaCreateRequest): Promise<Conta> {
    const response = await api.post<Conta>('/api/contas', conta);
    return response.data;
  },

  async updateConta(id: number, conta: Partial<ContaCreateRequest>): Promise<Conta> {
    const response = await api.put<Conta>(`/api/contas/${id}`, conta);
    return response.data;
  },

  async deleteConta(id: number): Promise<void> {
    await api.delete(`/api/contas/${id}`);
  },

  async getContasPorUsuario(usuarioId: number, filter?: ContaFilter): Promise<Conta[]> {
    const params = new URLSearchParams();
    
    if (filter?.paga !== undefined) params.append('paga', filter.paga.toString());

    const response = await api.get<Conta[]>(`/api/contas/usuario/${usuarioId}?${params}`);
    return response.data;
  }
};
