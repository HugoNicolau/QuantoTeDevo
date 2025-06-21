
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, Users } from 'lucide-react';

const VisualizarSaldos = () => {
  const navigate = useNavigate();
  const { contas } = useApp();

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
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
          {contas.length === 0 ? (
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
                {contas.map((conta) => (
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
                      
                      {conta.tipo === 'Compartilhada' && conta.usuariosCompartilhados && (
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
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center bg-white rounded-xl shadow-lg p-6">
                <div className="text-2xl font-semibold text-gray-800 mb-2">
                  Total: {formatarMoeda(contas.reduce((total, conta) => total + conta.valor, 0))}
                </div>
                <p className="text-gray-600">
                  {contas.length} conta{contas.length !== 1 ? 's' : ''} cadastrada{contas.length !== 1 ? 's' : ''}
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
