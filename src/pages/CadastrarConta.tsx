
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CadastrarConta = () => {
  const navigate = useNavigate();
  const { adicionarConta } = useApp();
  
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [tipo, setTipo] = useState<'Pessoal' | 'Compartilhada'>('Pessoal');
  const [usuariosCompartilhados, setUsuariosCompartilhados] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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

    const usuariosArray = tipo === 'Compartilhada' 
      ? usuariosCompartilhados.split(',').map(u => u.trim()).filter(u => u)
      : [];

    adicionarConta({
      descricao,
      valor: Number(valor),
      dataVencimento,
      tipo,
      usuariosCompartilhados: usuariosArray
    });

    toast.success('Conta cadastrada com sucesso!');
    navigate('/dashboard');
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
                <Select value={tipo} onValueChange={(value: 'Pessoal' | 'Compartilhada') => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pessoal">Pessoal</SelectItem>
                    <SelectItem value="Compartilhada">Compartilhada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {tipo === 'Compartilhada' && (
                <div className="space-y-2">
                  <Label htmlFor="usuarios">Usuários Compartilhados (vírgula separados)</Label>
                  <Input
                    id="usuarios"
                    value={usuariosCompartilhados}
                    onChange={(e) => setUsuariosCompartilhados(e.target.value)}
                    placeholder="João, Maria, Pedro"
                  />
                </div>
              )}
              
              {erro && (
                <p className="text-red-500 text-sm">{erro}</p>
              )}
              
              <div className="flex gap-4">
                <CustomButton type="submit" className="flex-1">
                  Salvar Conta
                </CustomButton>
                
                <CustomButton
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2"
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
