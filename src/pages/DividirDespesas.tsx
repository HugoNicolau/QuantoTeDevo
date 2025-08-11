
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAmigos } from '../hooks/useAmizades';
import { useCreateConta, useDividirContaIgualmente } from '../hooks/useContas';
import { useCriarLinkPagamento } from '../hooks/usePagamentoExterno';
import authService from '../services/authService';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Calculator, Plus, Trash2, Users, Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Participante {
  id: string;
  nome: string;
  tipo: 'amigo' | 'externo';
  usuarioId?: number;
}

const DividirDespesas = () => {
  const navigate = useNavigate();
  const { usuario } = useApp();
  
  // Estados para a conta
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>(undefined);
  
  // Estados para participantes
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [incluirMim, setIncluirMim] = useState(true);
  const [novoParticipanteExterno, setNovoParticipanteExterno] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  
  // Estados para resultado
  const [divisaoCalculada, setDivisaoCalculada] = useState<{ participante: string; valor: number }[]>([]);
  const [contaCriada, setContaCriada] = useState<number | null>(null);
  const [linksExternos, setLinksExternos] = useState<{ [key: string]: string }>({});
  const [linkCopiado, setLinkCopiado] = useState<string | null>(null);
  
  // Hooks
  const userId = authService.getUserId();
  const { data: amigos = [] } = useAmigos(userId || undefined);
  const criarContaMutation = useCreateConta();
  const dividirContaMutation = useDividirContaIgualmente();
  const criarLinkMutation = useCriarLinkPagamento();

  const formatarDataParaBackend = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Definir data padrão para hoje
  useEffect(() => {
    const hoje = new Date();
    setDataVencimento(hoje);
  }, []);

  const adicionarAmigoParticipante = (amigoId: number, nomeAmigo: string) => {
    const jaAdicionado = participantes.some(p => p.tipo === 'amigo' && p.usuarioId === amigoId);
    if (jaAdicionado) {
      toast.error('Este amigo já foi adicionado!');
      return;
    }

    const novoParticipante: Participante = {
      id: `amigo-${amigoId}`,
      nome: nomeAmigo,
      tipo: 'amigo',
      usuarioId: amigoId
    };

    setParticipantes(prev => [...prev, novoParticipante]);
    toast.success(`${nomeAmigo} adicionado à divisão!`);
  };

  const adicionarParticipanteExterno = () => {
    if (!novoParticipanteExterno.trim()) {
      toast.error('Digite o nome do participante!');
      return;
    }

    const jaAdicionado = participantes.some(
      p => p.tipo === 'externo' && p.nome.toLowerCase() === novoParticipanteExterno.toLowerCase()
    );
    
    if (jaAdicionado) {
      toast.error('Este participante já foi adicionado!');
      return;
    }

    const novoParticipante: Participante = {
      id: `externo-${Date.now()}`,
      nome: novoParticipanteExterno.trim(),
      tipo: 'externo'
    };

    setParticipantes(prev => [...prev, novoParticipante]);
    setNovoParticipanteExterno('');
    setDialogAberto(false);
    toast.success(`${novoParticipante.nome} adicionado à divisão!`);
  };

  const removerParticipante = (id: string) => {
    setParticipantes(prev => prev.filter(p => p.id !== id));
  };

  const calcularDivisao = () => {
    if (!descricao || !valor || !dataVencimento) {
      toast.error('Preencha todos os campos da conta!');
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error('Digite um valor válido!');
      return;
    }

    let totalParticipantes = participantes.length;
    if (incluirMim) totalParticipantes += 1;

    if (totalParticipantes === 0) {
      toast.error('Adicione pelo menos um participante ou inclua você mesmo!');
      return;
    }

    const valorPorPessoa = valorNumerico / totalParticipantes;
    const resultado = [];

    if (incluirMim) {
      resultado.push({
        participante: 'Você',
        valor: valorPorPessoa
      });
    }

    participantes.forEach(p => {
      resultado.push({
        participante: p.nome,
        valor: valorPorPessoa
      });
    });

    setDivisaoCalculada(resultado);
  };

  const salvarContaEDivisao = async () => {
    if (!usuario?.id) {
      toast.error('Usuário não encontrado!');
      return;
    }

    if (divisaoCalculada.length === 0) {
      toast.error('Calcule a divisão primeiro!');
      return;
    }

    try {
      // Verificar tipos de participantes
      const participantesExternos = participantes.filter(p => p.tipo === 'externo');
      const amigosParticipantes = participantes.filter(p => p.tipo === 'amigo' && p.usuarioId);
      
      // Determinar tipo da conta baseado nos participantes
      let descricaoFinal = descricao;
      let deveConsiderarDividida = false;
      
      if (participantesExternos.length > 0) {
        // Tem pessoas externas
        if (amigosParticipantes.length > 0) {
          // Tem amigos E externos
          descricaoFinal = `${descricao} (dividida com ${amigosParticipantes.length} amigo(s) e ${participantesExternos.length} pessoa(s) externa(s))`;
        } else {
          // Só tem externos
          descricaoFinal = `${descricao} (dividida com ${participantesExternos.length} pessoa(s) externa(s) ao sistema)`;
        }
        deveConsiderarDividida = true;
      } else if (amigosParticipantes.length > 0) {
        // Só tem amigos do sistema
        descricaoFinal = `${descricao} (dividida com ${amigosParticipantes.length} amigo(s))`;
        deveConsiderarDividida = true;
      } else if (incluirMim) {
        // Só o usuário atual
        descricaoFinal = `${descricao} (conta pessoal)`;
      }

      // Criar a conta
      const novaConta = await criarContaMutation.mutateAsync({
        descricao: descricaoFinal,
        valor: parseFloat(valor),
        vencimento: formatarDataParaBackend(dataVencimento),
        criadorId: usuario.id
      });

      setContaCriada(novaConta.id);

      if (amigosParticipantes.length > 0) {
        const usuarioIds = amigosParticipantes.map(p => p.usuarioId!);
        
        // Se o usuário atual está incluído, adicionar seu ID
        if (incluirMim) {
          usuarioIds.push(usuario.id);
        }

        await dividirContaMutation.mutateAsync({
          contaId: novaConta.id,
          usuarioIds
        });
      }

      const tipoMensagem = deveConsiderarDividida 
        ? 'Conta dividida criada e registrada com sucesso!' 
        : 'Conta pessoal criada com sucesso!';
      
      toast.success(tipoMensagem);
      
    } catch (error) {
      console.error('Erro ao salvar conta e divisão:', error);
      toast.error('Erro ao salvar. Tente novamente.');
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const gerarLinkPagamento = async (nomeParticipante: string, valor: number) => {
    if (!usuario?.id || !contaCriada) {
      toast.error('Conta deve ser criada antes de gerar links');
      return;
    }

    try {
      const response = await criarLinkMutation.mutateAsync({
        nomeParticipante,
        valor,
        descricaoDespesa: descricao,
        contaId: contaCriada,
        criadoPorId: usuario.id,
        criadoPor: usuario.nome,
        dataVencimento: formatarDataParaBackend(dataVencimento)
      });

      const baseUrl = window.location.origin;
      const link = `${baseUrl}${response.url}`;
      
      setLinksExternos(prev => ({
        ...prev,
        [nomeParticipante]: link
      }));

      toast.success(`Link gerado para ${nomeParticipante}!`);
      return link;
    } catch (error) {
      toast.error('Erro ao gerar link de pagamento');
      console.error('Erro ao gerar link:', error);
    }
  };

  const copiarLink = async (link: string, nomeParticipante: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopiado(nomeParticipante);
      toast.success(`Link copiado para ${nomeParticipante}!`);
      
      // Remover indicador de copiado após 3 segundos
      setTimeout(() => {
        setLinkCopiado(null);
      }, 3000);
    } catch (error) {
      toast.error('Erro ao copiar link!');
    }
  };

  const reiniciar = () => {
    setDescricao('');
    setValor('');
    setParticipantes([]);
    setDivisaoCalculada([]);
    setContaCriada(null);
    setIncluirMim(true);
    setLinksExternos({});
    setLinkCopiado(null);
    const hoje = new Date();
    setDataVencimento(hoje);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dividir Despesas" />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            
            {/* Formulário da Conta */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Dados da Despesa
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Jantar no restaurante"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Total</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                  <DatePicker
                    date={dataVencimento}
                    onDateChange={setDataVencimento}
                    placeholder="Selecione a data de vencimento"
                  />
                </div>
              </div>
            </div>

            {/* Gerenciar Participantes */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participantes da Divisão
              </h2>
              
              {/* Incluir usuário atual */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluir-mim"
                    checked={incluirMim}
                    onCheckedChange={(checked) => setIncluirMim(checked as boolean)}
                  />
                  <Label htmlFor="incluir-mim">Me incluir na divisão</Label>
                </div>
              </div>
              
              {/* Lista de Amigos */}
              {amigos.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm font-medium">Seus Amigos</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {amigos.map((amigo) => (
                      <Button
                        key={amigo.id}
                        variant="outline"
                        size="sm"
                        onClick={() => adicionarAmigoParticipante(amigo.id, amigo.nome)}
                        className="justify-start h-auto p-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">{amigo.nome}</div>
                          <div className="text-xs text-gray-500">#{amigo.id}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Adicionar pessoa externa */}
              <div className="mb-4">
                <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Pessoa Externa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Pessoa Externa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome-externo">Nome da Pessoa</Label>
                        <Input
                          id="nome-externo"
                          value={novoParticipanteExterno}
                          onChange={(e) => setNovoParticipanteExterno(e.target.value)}
                          placeholder="Digite o nome..."
                          onKeyPress={(e) => e.key === 'Enter' && adicionarParticipanteExterno()}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setDialogAberto(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={adicionarParticipanteExterno}>
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Lista de Participantes Adicionados */}
              {participantes.length > 0 && (
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-medium">Participantes Adicionados:</Label>
                  <div className="space-y-2 mt-2">
                    {participantes.map((participante) => (
                      <div
                        key={participante.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{participante.nome}</span>
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                            {participante.tipo === 'amigo' ? 'Amigo' : 'Externo'}
                          </span>
                          {participante.tipo === 'amigo' && (
                            <span className="text-xs text-gray-500">#{participante.usuarioId}</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerParticipante(participante.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-4 mb-6">
              <CustomButton
                onClick={calcularDivisao}
                disabled={!descricao || !valor || !dataVencimento}
                className="w-full flex items-center justify-center gap-2"
              >
                <Calculator size={20} />
                Calcular Divisão
              </CustomButton>
              
              {divisaoCalculada.length > 0 && !contaCriada && (
                <CustomButton
                  onClick={salvarContaEDivisao}
                  disabled={criarContaMutation.isPending || dividirContaMutation.isPending}
                  className="w-full"
                  variant="secondary"
                >
                  {criarContaMutation.isPending || dividirContaMutation.isPending 
                    ? 'Salvando...' 
                    : 'Salvar Conta e Divisão'
                  }
                </CustomButton>
              )}
            </div>
            
            {/* Resultado da Divisão */}
            {divisaoCalculada.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Resultado da Divisão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {divisaoCalculada.map((resultado, index) => {
                      // Verificar se é participante externo
                      const participante = participantes.find(p => p.nome === resultado.participante);
                      const isExterno = participante?.tipo === 'externo';
                      const linkExiste = linksExternos[resultado.participante];
                      
                      return (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">
                                {resultado.participante}:
                              </span>
                              {isExterno && (
                                <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                                  Externo
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-green-600 text-lg">
                              {formatarMoeda(resultado.valor)}
                            </span>
                          </div>
                          
                          {/* Links de pagamento para externos */}
                          {isExterno && contaCriada && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {!linkExiste ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => gerarLinkPagamento(resultado.participante, resultado.valor)}
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Gerar Link de Pagamento
                                </Button>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <ExternalLink className="w-4 h-4" />
                                    Link de pagamento gerado
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={linkExiste}
                                      readOnly
                                      className="text-xs flex-1"
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copiarLink(linkExiste, resultado.participante)}
                                      className="flex items-center gap-1"
                                    >
                                      {linkCopiado === resultado.participante ? (
                                        <>
                                          <Check className="w-4 h-4 text-green-600" />
                                          Copiado
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-4 h-4" />
                                          Copiar
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Envie este link para {resultado.participante} marcar o pagamento
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">
                          {formatarMoeda(divisaoCalculada.reduce((acc, r) => acc + r.valor, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {contaCriada && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <span className="font-medium">✅ Conta criada com sucesso!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {(() => {
                          const participantesExternos = participantes.filter(p => p.tipo === 'externo');
                          const amigosParticipantes = participantes.filter(p => p.tipo === 'amigo');
                          
                          if (participantesExternos.length > 0 && amigosParticipantes.length > 0) {
                            return 'Conta dividida registrada! Divisões criadas para amigos do sistema e links gerados para pessoas externas.';
                          } else if (participantesExternos.length > 0) {
                            return 'Conta dividida com pessoas externas registrada! Use os links de pagamento para facilitar o processo.';
                          } else if (amigosParticipantes.length > 0) {
                            return 'Conta dividida registrada e as divisões foram criadas para os amigos do sistema.';
                          } else {
                            return 'Conta pessoal registrada com sucesso!';
                          }
                        })()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Botões de Navegação */}
            <div className="flex gap-4 justify-center">
              {(divisaoCalculada.length > 0 || contaCriada) && (
                <CustomButton
                  variant="secondary"
                  onClick={reiniciar}
                >
                  Nova Divisão
                </CustomButton>
              )}
              
              <CustomButton
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
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
