import api from './api';
import { 
  Notificacao, 
  NotificacaoContador, 
  NotificacaoEstatisticas,
  NotificacaoTipoInfo,
  NotificacaoTipo 
} from '../types/api';

export class NotificacaoService {
  // Listar notificações do usuário
  async listarNotificacoes(
    page: number = 0, 
    size: number = 20,
    lida?: boolean,
    tipo?: NotificacaoTipo
  ): Promise<{
    content: Notificacao[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    if (lida !== undefined) {
      params.append('lida', lida.toString());
    }
    
    if (tipo) {
      params.append('tipo', tipo);
    }

    const response = await api.get(`/notificacoes?${params.toString()}`);
    return response.data;
  }

  // Buscar notificação por ID
  async buscarNotificacao(id: number): Promise<Notificacao> {
    const response = await api.get<Notificacao>(`/notificacoes/${id}`);
    return response.data;
  }

  // Marcar notificação como lida
  async marcarComoLida(id: number): Promise<Notificacao> {
    const response = await api.patch<Notificacao>(`/notificacoes/${id}/marcar-lida`);
    return response.data;
  }

  // Marcar múltiplas notificações como lidas
  async marcarMultiplasComoLidas(ids: number[]): Promise<void> {
    await api.patch('/api/notificacoes/marcar-lidas', { ids });
  }

  // Marcar todas como lidas
  async marcarTodasComoLidas(): Promise<void> {
    await api.patch('/api/notificacoes/marcar-todas-lidas');
  }

  // Excluir notificação
  async excluirNotificacao(id: number): Promise<void> {
    await api.delete(`/notificacoes/${id}`);
  }

  // Excluir múltiplas notificações
  async excluirMultiplas(ids: number[]): Promise<void> {
    await api.delete('/api/notificacoes/excluir-multiplas', { data: { ids } });
  }

  // Excluir todas as notificações lidas
  async excluirTodasLidas(): Promise<void> {
    await api.delete('/api/notificacoes/excluir-lidas');
  }

  // Obter contador de notificações não lidas
  async obterContador(): Promise<NotificacaoContador> {
    const response = await api.get<NotificacaoContador>('/api/notificacoes/contador');
    return response.data;
  }

  // Obter estatísticas das notificações
  async obterEstatisticas(): Promise<NotificacaoEstatisticas> {
    const response = await api.get<NotificacaoEstatisticas>('/api/notificacoes/estatisticas');
    return response.data;
  }

  // Listar notificações não lidas
  async listarNaoLidas(): Promise<Notificacao[]> {
    const response = await api.get<Notificacao[]>('/api/notificacoes/nao-lidas');
    return response.data;
  }

  // Listar notificações por tipo
  async listarPorTipo(tipo: NotificacaoTipo): Promise<Notificacao[]> {
    const response = await api.get<Notificacao[]>(`/notificacoes/tipo/${tipo}`);
    return response.data;
  }

  // Listar notificações por prioridade
  async listarPorPrioridade(prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'): Promise<Notificacao[]> {
    const response = await api.get<Notificacao[]>(`/notificacoes/prioridade/${prioridade}`);
    return response.data;
  }

  // Obter tipos de notificação disponíveis
  async obterTiposNotificacao(): Promise<NotificacaoTipoInfo[]> {
    const response = await api.get<NotificacaoTipoInfo[]>('/api/notificacoes/tipos');
    return response.data;
  }

  // Verificar se há novas notificações
  async verificarNovas(ultimaVerificacao?: string): Promise<{
    temNovas: boolean;
    quantidade: number;
    ultimaNotificacao?: Notificacao;
  }> {
    const params = ultimaVerificacao 
      ? `?ultimaVerificacao=${encodeURIComponent(ultimaVerificacao)}`
      : '';
    
    const response = await api.get(`/notificacoes/verificar-novas${params}`);
    return response.data;
  }

  // Criar notificação manual (para administradores)
  async criarNotificacao(notificacao: {
    titulo: string;
    mensagem: string;
    tipo: NotificacaoTipo;
    prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
    usuarioId: number;
    referenciaId?: number;
    referenciaTipo?: 'CONTA' | 'DIVIDA' | 'COMPRA' | 'CONVITE';
    dataExpiracao?: string;
  }): Promise<Notificacao> {
    const response = await api.post<Notificacao>('/api/notificacoes', notificacao);
    return response.data;
  }

  // Configurar preferências de notificação
  async configurarPreferencias(preferencias: {
    contaVencendo: boolean;
    contaVencida: boolean;
    dividaPendente: boolean;
    divisaoPendente: boolean;
    pagamentoRecebido: boolean;
    conviteRecebido: boolean;
    contaCriada: boolean;
    lembretesPagamento: boolean;
    notificacoesSistema: boolean;
    emailNotificacoes: boolean;
    diasAntecedenciaVencimento: number;
  }): Promise<void> {
    await api.put('/api/notificacoes/preferencias', preferencias);
  }

  // Obter preferências de notificação
  async obterPreferencias(): Promise<{
    contaVencendo: boolean;
    contaVencida: boolean;
    dividaPendente: boolean;
    divisaoPendente: boolean;
    pagamentoRecebido: boolean;
    conviteRecebido: boolean;
    contaCriada: boolean;
    lembretesPagamento: boolean;
    notificacoesSistema: boolean;
    emailNotificacoes: boolean;
    diasAntecedenciaVencimento: number;
  }> {
    const response = await api.get('/api/notificacoes/preferencias');
    return response.data;
  }

  // Solicitar permissão para notificações push (navegador)
  async solicitarPermissaoPush(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Mostrar notificação push no navegador
  mostrarNotificacaoPush(notificacao: Notificacao): void {
    if (Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(notificacao.titulo, {
      body: notificacao.mensagem,
      icon: '/api/icons/notification-icon.png',
      badge: '/api/icons/badge-icon.png',
      tag: `notificacao-${notificacao.id}`,
      requireInteraction: notificacao.prioridade === 'URGENTE',
      silent: notificacao.prioridade === 'BAIXA'
    });

    notification.onclick = () => {
      window.focus();
      this.marcarComoLida(notificacao.id);
      notification.close();
      
      // Navegar para a referência se existir
      if (notificacao.referenciaId && notificacao.referenciaTipo) {
        this.navegarParaReferencia(notificacao.referenciaTipo, notificacao.referenciaId);
      }
    };

    // Auto-fechar após 5 segundos para notificações não urgentes
    if (notificacao.prioridade !== 'URGENTE') {
      setTimeout(() => notification.close(), 5000);
    }
  }

  // Helper para navegar para referência da notificação
  private navegarParaReferencia(tipo: string, id: number): void {
    const baseUrl = window.location.origin;
    let url = '';

    switch (tipo) {
      case 'CONTA':
        url = `${baseUrl}/contas/${id}`;
        break;
      case 'DIVIDA':
        url = `${baseUrl}/dividas/${id}`;
        break;
      case 'COMPRA':
        url = `${baseUrl}/compras/${id}`;
        break;
      case 'CONVITE':
        url = `${baseUrl}/convites/${id}`;
        break;
      default:
        url = `${baseUrl}/dashboard`;
    }

    window.location.href = url;
  }

  // Polling para verificar novas notificações
  iniciarPollingNotificacoes(intervalo: number = 30000): number {
    return window.setInterval(async () => {
      try {
        const contador = await this.obterContador();
        
        // Emitir evento para atualizar UI
        window.dispatchEvent(new CustomEvent('notificacoesAtualizadas', {
          detail: contador
        }));

        // Se há novas notificações, buscar e mostrar
        if (contador.temNovas) {
          const novas = await this.listarNaoLidas();
          novas.slice(0, 3).forEach(notificacao => {
            this.mostrarNotificacaoPush(notificacao);
          });
        }
      } catch (error) {
        console.warn('Erro ao verificar notificações:', error);
      }
    }, intervalo);
  }

  // Parar polling
  pararPollingNotificacoes(intervalId: number): void {
    clearInterval(intervalId);
  }
}


const notificacaoService = new NotificacaoService();
export default notificacaoService;
