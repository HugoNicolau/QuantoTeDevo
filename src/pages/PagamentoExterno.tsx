import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, CreditCard, DollarSign, Calendar, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useBuscarPagamento, useConfirmarPagamento } from '@/hooks/usePagamentoExterno';
import type { PagamentoExternoDto } from '@/services/pagamentoExternoService';

const PagamentoExterno = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Hooks do TanStack Query
  const { 
    data: pagamentoInfo, 
    isLoading: loading, 
    error,
  } = useBuscarPagamento(linkId);
  
  const confirmarPagamentoMutation = useConfirmarPagamento();

  useEffect(() => {
    if (error) {
      toast.error('Link de pagamento não encontrado ou expirado');
    }
  }, [error]);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    const dataLocal = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return dataLocal.toLocaleDateString('pt-BR');
  };

  const confirmarPagamento = async () => {
    if (!formaPagamento.trim()) {
      toast.error('Informe como você pagou');
      return;
    }

    if (!linkId) {
      toast.error('Link inválido');
      return;
    }

    try {
      await confirmarPagamentoMutation.mutateAsync({
        linkId,
        request: {
          formaPagamento,
          observacoes: observacoes || undefined
        }
      });

      toast.success('Pagamento confirmado com sucesso!');
      
      navigate('/registro');
      
    } catch (error) {
      toast.error('Erro ao confirmar pagamento. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">QuantoTeDevo</h2>
          <p className="text-slate-600">Carregando informações do pagamento...</p>
        </div>
      </div>
    );
  }

  if (!pagamentoInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Link não encontrado
            </h2>
            <p className="text-slate-600 mb-6">
              Este link de pagamento não existe ou já expirou.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Ir para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pagamentoInfo.pago) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Pagamento Confirmado!
            </h2>
            <p className="text-slate-600 mb-4">
              Seu pagamento de <strong>{formatarMoeda(pagamentoInfo.valor)}</strong> foi confirmado.
            </p>
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Despesa:</strong> {pagamentoInfo.descricaoDespesa}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Pago em:</strong> {formatarData(pagamentoInfo.dataPagamento!)}
              </p>
              {pagamentoInfo.formaPagamento && (
                <p className="text-sm text-gray-600">
                  <strong>Forma:</strong> {pagamentoInfo.formaPagamento}
                </p>
              )}
            </div>
            <Button onClick={() => navigate('/registro')} className="w-full">
              Ir para o QuantoTeDevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">QuantoTeDevo</h1>
          <p className="text-slate-600">Confirmação de Pagamento</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Detalhes da Despesa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                <p className="font-semibold">{pagamentoInfo.descricaoDespesa}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Valor Total</Label>
                <p className="font-semibold">{formatarMoeda(pagamentoInfo.valor)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Organizado por</Label>
                <p className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {pagamentoInfo.criadoPor}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Vencimento</Label>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatarData(pagamentoInfo.dataVencimento)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Sua Parte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-emerald-600 mb-2">Valor a pagar por {pagamentoInfo.nomeParticipante}</p>
              <p className="text-3xl font-bold text-emerald-600">
                {formatarMoeda(pagamentoInfo.valor)}
              </p>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div>
                <Label htmlFor="formaPagamento">Como você pagou? *</Label>
                <Input
                  id="formaPagamento"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  placeholder="Ex: PIX, Dinheiro, Cartão, Transferência..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Input
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Alguma informação adicional..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            onClick={confirmarPagamento}
            disabled={confirmarPagamentoMutation.isPending || !formaPagamento.trim()}
            className="flex-1"
          >
            {confirmarPagamentoMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Pagamento
              </>
            )}
          </Button>
        </div>

        <div className="text-center mt-8 text-sm text-slate-500">
          <p>© 2025 QuantoTeDevo. Confirmação de pagamento segura.</p>
        </div>
      </div>
    </div>
  );
};

export default PagamentoExterno;
