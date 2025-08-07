
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useCreateConta } from '../hooks/useContas';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const CadastrarConta = () => {
  const navigate = useNavigate();
  const { adicionarConta } = useApp();
  const { user } = useAuth();
  const createContaMutation = useCreateConta();
  
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [tipo, setTipo] = useState<'PESSOAL' | 'COMPARTILHADA'>('PESSOAL');
  const [usuariosCompartilhados, setUsuariosCompartilhados] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!descricao || !valor || !dataVencimento) {
      setErro('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    if (isNaN(Number(valor)) || Number(valor) <= 0) {
      setErro('Valor deve ser um número válido maior que zero');
      return;
    }

    const usuariosArray = tipo === 'COMPARTILHADA' 
      ? usuariosCompartilhados.split(',').map(u => u.trim()).filter(u => u)
      : [];

    try {
      // Tentar usar a API real primeiro
      await createContaMutation.mutateAsync({
        descricao,
        valor: Number(valor),
        vencimento: dataVencimento,
        criadorId: user?.id || 1 // Usa ID do usuário logado ou 1 como fallback
      });

      navigate('/dashboard');
    } catch (error) {
      // Fallback para dados locais em caso de erro na API
      console.warn('API não disponível, usando dados locais:', error);
      
      adicionarConta({
        descricao,
        valor: Number(valor),
        dataVencimento,
        tipo: tipo === 'PESSOAL' ? 'Pessoal' : 'Compartilhada',
        usuariosCompartilhados: usuariosArray
      });

      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Cadastrar Conta" />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Conta de luz, Jantar restaurante..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <Select value={tipo} onValueChange={(value: 'PESSOAL' | 'COMPARTILHADA') => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PESSOAL">Pessoal</SelectItem>
                    <SelectItem value="COMPARTILHADA">Compartilhada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {tipo === 'COMPARTILHADA' && (
                <div className="space-y-2">
                  <Label htmlFor="usuarios">Usuários Compartilhados (emails separados por vírgula)</Label>
                  <Input
                    id="usuarios"
                    value={usuariosCompartilhados}
                    onChange={(e) => setUsuariosCompartilhados(e.target.value)}
                    placeholder="joao@email.com, maria@email.com, pedro@email.com"
                  />
                </div>
              )}
              
              {erro && (
                <p className="text-red-500 text-sm">{erro}</p>
              )}
              
              <div className="flex gap-4">
                <CustomButton 
                  type="submit" 
                  className="flex-1"
                  disabled={createContaMutation.isPending}
                >
                  {createContaMutation.isPending ? 'Salvando...' : 'Salvar Conta'}
                </CustomButton>
                
                <CustomButton
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2"
                  disabled={createContaMutation.isPending}
                >
                  <ArrowLeft size={20} />
                  Voltar
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastrarConta;
