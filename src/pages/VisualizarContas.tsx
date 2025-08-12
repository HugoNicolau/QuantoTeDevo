import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useContas,
  useContasPagas,
  useContasPendentes,
  useContasVencidas,
  useContasVencendo,
  useMarcarContaComoPaga,
  useMarcarContaComoPendente,
  useMarcarContaComoVencida,
  useVerificarContasVencidas,
  useAutoVerificarContasVencidas,
  useDeleteConta,
  useEstatisticasContas,
} from "../hooks/useContas";
import { useAuth } from "../hooks/useAuth";
import { usePagamentosExternosPorConta } from "../hooks/usePagamentoExterno";
import { Conta } from "../types/api";
import Header from "../components/Header";
import CustomButton from "../components/CustomButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

const VisualizarContas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  // Hooks para diferentes tipos de consulta
  const { data: todasContas = [], isLoading: loadingTodas } = useContas();
  const { data: contasPagas = [] } = useContasPagas();
  const { data: contasPendentes = [] } = useContasPendentes();
  const { data: contasVencidas = [] } = useContasVencidas();
  const { data: contasVencendo = [] } = useContasVencendo(7);
  const { data: estatisticas } = useEstatisticasContas();

  // Verificação automática de contas vencidas
  const { data: verificacaoVencidas } = useAutoVerificarContasVencidas(
    user?.id
  );
  const verificarVencidasMutation = useVerificarContasVencidas();

  // Mutations
  const marcarComoPagaMutation = useMarcarContaComoPaga();
  const marcarComoPendenteMutation = useMarcarContaComoPendente();
  const marcarComoVencidaMutation = useMarcarContaComoVencida();
  const deletarContaMutation = useDeleteConta();

  const handleVerificarVencidas = useCallback(() => {
    if (verificacaoVencidas && verificacaoVencidas.contasVencidas > 0) {
      toast.warning(
        `Você tem ${verificacaoVencidas.contasVencidas} conta(s) vencida(s)!`,
        {
          action: {
            label: "Marcar como vencidas",
            onClick: () => verificarVencidasMutation.mutate(user?.id),
          },
        }
      );
    }
  }, [verificacaoVencidas, user?.id, verificarVencidasMutation]);

  useEffect(() => {
    handleVerificarVencidas();
  }, [handleVerificarVencidas]);

  // Determinar qual conjunto de contas usar baseado no filtro
  const getContasPorFiltro = () => {
    switch (filtroStatus) {
      case "pagas":
        return contasPagas;
      case "pendentes":
        return contasPendentes;
      case "vencidas":
        return contasVencidas;
      case "vencendo":
        return contasVencendo;
      default:
        return todasContas;
    }
  };

  const contas = getContasPorFiltro();

  // Filtro adicional por tipo
  const contasFiltradas =
    filtroTipo === "todos"
      ? contas
      : contas.filter((conta) => {
          if (filtroTipo === "criadas") return conta.criador.id === user?.id;
          if (filtroTipo === "participando")
            return conta.criador.id !== user?.id;
          if (filtroTipo === "grupos") return !!conta.grupo;
          if (filtroTipo === "compartilhadas") return contaEhCompartilhada(conta);
          if (filtroTipo === "individuais") return !contaEhCompartilhada(conta);
          return true;
        });

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    const dataLocal = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return dataLocal.toLocaleDateString("pt-BR");
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAGA":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "VENCIDA":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "PARCIALMENTE_PAGA":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "PENDENTE":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAGA":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Paga
          </Badge>
        );
      case "VENCIDA":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Vencida
          </Badge>
        );
      case "PARCIALMENTE_PAGA":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Parcialmente Paga
          </Badge>
        );
      case "PENDENTE":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pendente
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isContaVencida = (vencimento: string) => {
    const [ano, mes, dia] = vencimento.split('-');
    const dataVencimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataVencimento.setHours(0, 0, 0, 0);
    return dataVencimento < hoje;
  };

  const podeEditarConta = (conta: Conta) => {
    return user?.id === conta.criador.id;
  };

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
      const todosNomes = match[1].split(', ').map(nome => nome.trim());
      
      // Filtrar apenas os nomes que NÃO são de amigos nas divisões
      const nomesAmigosNasDivisoes = conta.divisoes ? conta.divisoes.map(divisao => divisao.usuario.nome) : [];
      
      console.log('🔍 Debug participantes:', {
        contaId: conta.id,
        descricao: conta.descricao,
        todosNomes,
        nomesAmigosNasDivisoes,
        divisoes: conta.divisoes?.length || 0
      });
      
      // Retornar apenas os nomes que não estão nas divisões (ou seja, são externos)
      const externosReais = todosNomes.filter(nome => !nomesAmigosNasDivisoes.includes(nome));
      
      console.log('📊 Resultado filtro:', {
        contaId: conta.id,
        externosReais,
        amigosNasDivisoes: nomesAmigosNasDivisoes
      });
      
      return externosReais;
    }
    return [];
  };

  // Componente para mostrar informações de pagamentos externos
  const PagamentosExternos = ({ conta }: { conta: Conta }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: pagamentosExternos = [] } = usePagamentosExternosPorConta(conta.id);

    if (!contaTemParticipantesExternos(conta) || pagamentosExternos.length === 0) {
      return null;
    }

    const pagamentosPagos = pagamentosExternos.filter(p => p.pago);
    const valorTotalPago = pagamentosPagos.reduce((sum, p) => sum + p.valor, 0);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Pagamentos Externos ({pagamentosPagos.length}/{pagamentosExternos.length})
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Valor pago por externos: {formatarMoeda(valorTotalPago)}
            </div>
            {pagamentosPagos.map((pagamento) => (
              <div key={pagamento.id} className="flex justify-between items-center text-xs text-gray-600">
                <span>{pagamento.nomeParticipante}</span>
                <div className="flex items-center gap-2">
                  <span>{formatarMoeda(pagamento.valor)}</span>
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const handleMarcarComoPaga = async (contaId: number) => {
    try {
      await marcarComoPagaMutation.mutateAsync(contaId);
    } catch (error) {
      console.error("Erro ao marcar conta como paga:", error);
    }
  };

  const handleMarcarComoPendente = async (contaId: number) => {
    try {
      await marcarComoPendenteMutation.mutateAsync(contaId);
    } catch (error) {
      console.error("Erro ao marcar conta como pendente:", error);
    }
  };

  const handleMarcarComoVencida = async (contaId: number) => {
    try {
      await marcarComoVencidaMutation.mutateAsync(contaId);
    } catch (error) {
      console.error("Erro ao marcar conta como vencida:", error);
    }
  };

  const handleDeletarConta = async (contaId: number) => {
    try {
      await deletarContaMutation.mutateAsync(contaId);
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
    }
  };

  const getContadorPorStatus = (status: string) => {
    if (!estatisticas) return 0;
    switch (status) {
      case "pagas":
        return estatisticas.contasPagas;
      case "pendentes":
        return estatisticas.contasPendentes;
      case "vencidas":
        return estatisticas.contasVencidas;
      default:
        return estatisticas.totalContas;
    }
  };

  const getValorPorStatus = (status: string) => {
    if (!estatisticas) return 0;
    switch (status) {
      case "pagas":
        return estatisticas.valorTotalPago;
      case "pendentes":
        return estatisticas.valorTotalPendente;
      case "vencidas":
        return estatisticas.valorTotalVencido;
      default:
        return estatisticas.valorTotalContas;
    }
  };

  if (loadingTodas) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Visualizar Contas" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Carregando contas...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Visualizar Contas" />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Ações principais */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Minhas Contas</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => verificarVencidasMutation.mutate(user?.id)}
                disabled={verificarVencidasMutation.isPending}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {verificarVencidasMutation.isPending
                  ? "Verificando..."
                  : "Verificar Vencidas"}
              </Button>

              <Button onClick={() => navigate("/cadastrar-conta")} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Contas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {getContadorPorStatus("total")}
                    </p>
                    <p className="text-sm text-blue-600">
                      {formatarMoeda(getValorPorStatus("total"))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Contas Pagas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {getContadorPorStatus("pagas")}
                    </p>
                    <p className="text-sm text-green-600">
                      {formatarMoeda(getValorPorStatus("pagas"))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Contas Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {getContadorPorStatus("pendentes")}
                    </p>
                    <p className="text-sm text-yellow-600">
                      {formatarMoeda(getValorPorStatus("pendentes"))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Contas Vencidas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {getContadorPorStatus("vencidas")}
                    </p>
                    <p className="text-sm text-red-600">
                      {formatarMoeda(getValorPorStatus("vencidas"))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as Contas</SelectItem>
                      <SelectItem value="pendentes">Pendentes</SelectItem>
                      <SelectItem value="pagas">Pagas</SelectItem>
                      <SelectItem value="vencidas">Vencidas</SelectItem>
                      <SelectItem value="vencendo">
                        Vencendo (7 dias)
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="criadas">Criadas por Mim</SelectItem>
                      <SelectItem value="participando">Participando</SelectItem>
                      <SelectItem value="compartilhadas">Compartilhadas</SelectItem>
                      <SelectItem value="individuais">Individuais</SelectItem>
                      <SelectItem value="grupos">Em Grupos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabela de Contas */}
          <Card>
            <CardHeader>
              <CardTitle>
                Lista de Contas ({contasFiltradas.length} conta
                {contasFiltradas.length !== 1 ? "s" : ""})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Criador</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Participantes</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasFiltradas.map((conta) => (
                      <TableRow
                        key={conta.id}
                        className={
                          isContaVencida(conta.vencimento) && !conta.paga
                            ? "bg-red-50"
                            : ""
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(conta.status)}
                            {getStatusBadge(conta.status)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            {conta.descricao}
                            {contaTemParticipantesExternos(conta) && (
                              <div className="mt-1">
                                <PagamentosExternos conta={conta} />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {conta.criador.nome.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm">
                              {conta.criador.nome}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {contaEhCompartilhada(conta) ? (
                            <div>
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                Compartilhada
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                {(() => {
                                  const divisoesCount = conta.divisoes ? conta.divisoes.length : 0;
                                  const externosCount = contaTemParticipantesExternos(conta) ? extrairParticipantesExternos(conta).length : 0;
                                  const totalParticipantes = divisoesCount + externosCount;
                                  
                                  if (totalParticipantes > 0) {
                                    return `${totalParticipantes} participante${totalParticipantes !== 1 ? 's' : ''}`;
                                  } else if (conta.descricao.includes('(compartilhada)')) {
                                    return 'Com amigos do sistema';
                                  }
                                  return 'Compartilhada';
                                })()}
                              </div>
                            </div>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                              Pessoal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatarMoeda(conta.valor)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span
                              className={
                                isContaVencida(conta.vencimento) && !conta.paga
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {formatarData(conta.vencimento)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            {contaEhCompartilhada(conta) ? (
                              <div className="space-y-1">
                                {(() => {
                                  const amigosDivisoes = conta.divisoes || [];
                                  const externosNomes = contaTemParticipantesExternos(conta) ? extrairParticipantesExternos(conta) : [];
                                  const totalParticipantes = amigosDivisoes.length + externosNomes.length;
                                  
                                  if (totalParticipantes > 0) {
                                    return (
                                      <>
                                        <div className="text-sm font-medium">
                                          {totalParticipantes} pessoa{totalParticipantes !== 1 ? 's' : ''}
                                        </div>
                                        <div className="text-xs text-gray-500 max-w-32">
                                          {amigosDivisoes.length > 0 && (
                                            <div className="truncate mb-1">
                                              <span className="font-medium text-blue-600">Amigos:</span> {amigosDivisoes.map(divisao => divisao.usuario.nome).join(', ')}
                                            </div>
                                          )}
                                          {externosNomes.length > 0 && (
                                            <div className="truncate">
                                              <span className="font-medium text-orange-600">Externos:</span> {externosNomes.join(', ')}
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    );
                                  } else if (conta.descricao.includes('(compartilhada)')) {
                                    return (
                                      <div className="text-sm text-blue-600">
                                        Amigos do sistema
                                      </div>
                                    );
                                  }
                                  return <span className="text-sm text-gray-500">Compartilhada</span>;
                                })()}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Apenas você</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {!conta.paga && (
                                <DropdownMenuItem
                                  onClick={() => handleMarcarComoPaga(conta.id)}
                                  disabled={marcarComoPagaMutation.isPending}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Marcar como Paga
                                </DropdownMenuItem>
                              )}

                              {!conta.paga && conta.status !== "VENCIDA" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleMarcarComoVencida(conta.id)
                                  }
                                  disabled={marcarComoVencidaMutation.isPending}
                                >
                                  <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                                  Marcar como Vencida
                                </DropdownMenuItem>
                              )}

                              {conta.paga && podeEditarConta(conta) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleMarcarComoPendente(conta.id)
                                  }
                                  disabled={
                                    marcarComoPendenteMutation.isPending
                                  }
                                >
                                  <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                                  Marcar como Pendente
                                </DropdownMenuItem>
                              )}

                              {podeEditarConta(conta) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Confirmar Exclusão
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir a conta
                                          "{conta.descricao}"? Esta ação não
                                          pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeletarConta(conta.id)
                                          }
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {contasFiltradas.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    Nenhuma conta encontrada
                  </p>
                  <p className="text-gray-400 mb-4">
                    {filtroStatus === "todos"
                      ? "Você ainda não tem contas cadastradas."
                      : `Não há contas com o filtro selecionado.`}
                  </p>
                  <Button onClick={() => navigate("/cadastrar-conta")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeira conta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botão Voltar */}
          <div className="text-center">
            <CustomButton
              variant="secondary"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 mx-auto"
            >
              <ArrowLeft size={20} />
              Voltar ao Dashboard
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarContas;
