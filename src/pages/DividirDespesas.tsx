
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator } from 'lucide-react';

interface DivisaoResult {
  participante: string;
  valor: number;
}

const DividirDespesas = () => {
  const navigate = useNavigate();
  const { contas } = useApp();
  
  const [contaSelecionada, setContaSelecionada] = useState('');
  const [participantes, setParticipantes] = useState('');
  const [divisaoResults, setDivisaoResults] = useState<DivisaoResult[]>([]);

  const calcularDivisao = () => {
    if (!contaSelecionada || !participantes) {
      return;
    }

    const conta = contas.find(c => c.id === contaSelecionada);
    if (!conta) return;

    const listaParticipantes = participantes
      .split(',')
      .map(p => p.trim())
      .filter(p => p);

    if (listaParticipantes.length === 0) return;

    const valorPorPessoa = conta.valor / listaParticipantes.length;

    const results: DivisaoResult[] = listaParticipantes.map(participante => ({
      participante,
      valor: valorPorPessoa
    }));

    setDivisaoResults(results);
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dividir Despesas" />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {contas.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-6">
                  Nenhuma conta disponível para divisão.
                </p>
                <CustomButton onClick={() => navigate('/cadastrar-conta')}>
                  Cadastrar Conta
                </CustomButton>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Selecionar Conta</Label>
                  <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma conta para dividir" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.descricao} - {formatarMoeda(conta.valor)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="participantes">Participantes (vírgula separados)</Label>
                  <Input
                    id="participantes"
                    value={participantes}
                    onChange={(e) => setParticipantes(e.target.value)}
                    placeholder="Você, João, Maria, Pedro"
                  />
                </div>
                
                <CustomButton
                  onClick={calcularDivisao}
                  disabled={!contaSelecionada || !participantes}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Calculator size={20} />
                  Calcular Divisão
                </CustomButton>
                
                {divisaoResults.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg text-center">Resultado da Divisão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {divisaoResults.map((result, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-700">
                              {result.participante} paga:
                            </span>
                            <span className="font-semibold text-green-600 text-lg">
                              {formatarMoeda(result.valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
    </div>
  );
};

export default DividirDespesas;
