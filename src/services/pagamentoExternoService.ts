interface CriarLinkRequest {
  nomeParticipante: string;
  valor: number;
  descricaoDespesa: string;
  contaId: number;
  criadoPorId: number;
  criadoPor: string;
  dataVencimento: string;
}

interface CriarLinkResponse {
  linkId: string;
  url: string;
}

interface PagamentoExternoDto {
  id: string;
  nomeParticipante: string;
  valor: number;
  descricaoDespesa: string;
  criadoPor: string;
  dataCriacao: string;
  dataVencimento: string;
  pago: boolean;
  dataPagamento?: string;
  formaPagamento?: string;
  observacoes?: string;
}

interface ConfirmarPagamentoRequest {
  formaPagamento: string;
  observacoes?: string;
}

class PagamentoExternoService {
  private baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080' 
    : '';

  // Criar link de pagamento (rota autenticada)
  async criarLink(request: CriarLinkRequest): Promise<CriarLinkResponse> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.baseUrl}/api/pagamentos-externos/criar-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Erro ao criar link de pagamento');
    }

    return response.json();
  }

  // Buscar informações do pagamento (rota pública)
  async buscarPagamento(linkId: string): Promise<PagamentoExternoDto> {
    const response = await fetch(`${this.baseUrl}/api/pagamentos-externos/public/${linkId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Link de pagamento não encontrado ou expirado');
      }
      throw new Error('Erro ao buscar informações do pagamento');
    }

    return response.json();
  }

  // Confirmar pagamento (rota pública)
  async confirmarPagamento(linkId: string, request: ConfirmarPagamentoRequest): Promise<PagamentoExternoDto> {
    const response = await fetch(`${this.baseUrl}/api/pagamentos-externos/public/${linkId}/confirmar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Pagamento já foi confirmado ou link expirado');
      }
      throw new Error('Erro ao confirmar pagamento');
    }

    return response.json();
  }

  // Listar pagamentos externos de uma conta (rota autenticada)
  async listarPorConta(contaId: number): Promise<PagamentoExternoDto[]> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.baseUrl}/api/pagamentos-externos/conta/${contaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar pagamentos externos');
    }

    return response.json();
  }
}

export const pagamentoExternoService = new PagamentoExternoService();
export type { PagamentoExternoDto, CriarLinkRequest, ConfirmarPagamentoRequest };
