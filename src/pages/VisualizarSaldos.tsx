
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContas } from '../hooks/useContas';
import { Conta } from '../types/api';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, Users, Loader2 } from 'lucide-react';

const VisualizarSaldos = () => {
  const navigate = useNavigate();
  const { data: contas = [], isLoading, error } = useContas();

  // Função para detectar se uma conta tem participantes externos
  const contaTemParticipantesExternos = (conta: Conta) => {
    return conta.descricao.includes('(compartilhada com:');
  };

  // Função para detectar se uma conta é compartilhada (tem divisões OU externos)
  const contaEhCompartilhada = (conta: Conta) => {
    return (conta.divisoes && conta.divisoes.length > 0) || contaTemParticipantesExternos(conta) || conta.descricao.includes('(compartilhada)');
  };

  // Função para extrair nomes dos participantes externos da descrição
  const extrairParticipantesExternos = (conta: Conta) => {
    const match = conta.descricao.match(/\(compartilhada com: ([^)]+)\)/);
    if (match) {
      const todosNomes = match[1].split(', ').map((nome: string) => nome.trim());
      
      // Filtrar apenas os nomes que NÃO são de amigos nas divisões
      const nomesAmigosNasDivisoes = conta.divisoes ? conta.divisoes.map(divisao => divisao.usuario.nome) : [];
      
      console.log('🔍 Debug participantes (Saldos):', {
        contaId: conta.id,
        descricao: conta.descricao,
        todosNomes,
        nomesAmigosNasDivisoes,
        divisoes: conta.divisoes?.length || 0
      });
      
      // Retornar apenas os nomes que não estão nas divisões (ou seja, são externos)
      const externosReais = todosNomes.filter(nome => !nomesAmigosNasDivisoes.includes(nome));
      
      console.log('📊 Resultado filtro (Saldos):', {
        contaId: conta.id,
        externosReais,
        amigosNasDivisoes: nomesAmigosNasDivisoes
      });
      
      return externosReais;
    }
    return [];
  };

  // Adaptação dos dados da API para o formato esperado pela UI
  const contasAdaptadas = contas.map(conta => {
    const temDivisoes = conta.divisoes && conta.divisoes.length > 0;
    const temExternos = contaTemParticipantesExternos(conta);
    const isCompartilhada = contaEhCompartilhada(conta);
    
    let usuariosCompartilhados: string[] = [];
    
    if (temDivisoes) {
      usuariosCompartilhados = [...usuariosCompartilhados, ...conta.divisoes.map(divisao => divisao.usuario.nome)];
    }
    
    if (temExternos) {
      const externosReais = extrairParticipantesExternos(conta);
      usuariosCompartilhados = [...usuariosCompartilhados, ...externosReais];
    }

    return {
      ...conta,
      dataVencimento: conta.vencimento,
      tipo: isCompartilhada ? 'Compartilhada' as const : 'Pessoal' as const,
      usuariosCompartilhados: usuariosCompartilhados
    };
  });

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    const dataLocal = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return dataLocal.toLocaleDateString("pt-BR");
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Saldos e Contas" />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Carregando contas...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-red-500 text-lg mb-6">
                Erro ao carregar contas: {error.message}
              </p>
              <CustomButton onClick={() => navigate('/dashboard')}>
                Voltar ao Dashboard
              </CustomButton>
            </div>
          ) : contasAdaptadas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg mb-6">
                Nenhuma conta cadastrada ainda.
              </p>
              <CustomButton onClick={() => navigate('/cadastrar-conta')}>
                Cadastrar Primeira Conta
              </CustomButton>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6">
                {contasAdaptadas.map((conta) => (
                  <Card key={conta.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-gray-800">
                          {conta.descricao}
                        </CardTitle>
                        <Badge 
                          variant={conta.tipo === 'Pessoal' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {conta.tipo}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-2xl font-semibold text-green-600">
                        <DollarSign size={24} />
                        {formatarMoeda(conta.valor)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={20} />
                        <span>Vencimento: {formatarData(conta.dataVencimento)}</span>
                      </div>
                      
                      {conta.tipo === 'Compartilhada' && conta.usuariosCompartilhados && conta.usuariosCompartilhados.length > 0 && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <Users size={20} className="mt-0.5" />
                          <div>
                            <span className="font-medium">Compartilhada com:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {conta.usuariosCompartilhados.map((usuario, index) => (
                                <Badge key={index} variant="outline">
                                  {usuario}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {conta.tipo === 'Pessoal' && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users size={20} />
                          <span>Conta pessoal</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center bg-white rounded-xl shadow-lg p-6">
                <div className="text-2xl font-semibold text-gray-800 mb-2">
                  Total: {formatarMoeda(contasAdaptadas.reduce((total, conta) => total + conta.valor, 0))}
                </div>
                <p className="text-gray-600">
                  {contasAdaptadas.length} conta{contasAdaptadas.length !== 1 ? 's' : ''} cadastrada{contasAdaptadas.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <CustomButton
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 mx-auto"
            >
              <ArrowLeft size={20} />
              Voltar
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarSaldos;
