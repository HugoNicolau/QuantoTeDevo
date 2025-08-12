import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  useAmigos, 
  useConvitesAmizadePendentes, 
  useSolicitarAmizade, 
  useAceitarAmizade, 
  useRejeitarAmizade,
  useRemoverAmizade,
  useBloquearUsuario,
  useEstatisticasAmizades,
  useSaoAmigos
} from "../hooks/useAmizades";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import CustomButton from "../components/CustomButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Mail,
  Clock,
  Trash2,
  Shield,
  MoreHorizontal,
  UserCheck,
  UserX,
  MessageCircle,
  Send
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Amizades = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [convidadoId, setConvidadoId] = useState("");
  const [mensagemConvite, setMensagemConvite] = useState("");
  const [buscaAmigo, setBuscaAmigo] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);

  // Hooks para amizades
  const { data: amigos = [], isLoading: loadingAmigos } = useAmigos(user?.id);
  const { data: convitesPendentes = [], isLoading: loadingConvites } = 
    useConvitesAmizadePendentes(user?.id);
  const { data: estatisticas } = useEstatisticasAmizades(user?.id);

  // Mutations
  const solicitarAmizadeMutation = useSolicitarAmizade();
  const aceitarAmizadeMutation = useAceitarAmizade();
  const rejeitarAmizadeMutation = useRejeitarAmizade();
  const removerAmizadeMutation = useRemoverAmizade();
  const bloquearUsuarioMutation = useBloquearUsuario();

  const handleSolicitarAmizade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convidadoId.trim()) {
      toast.error("Digite o ID do usuário");
      return;
    }

    try {
      await solicitarAmizadeMutation.mutateAsync({
        convidadoId: parseInt(convidadoId),
        mensagem: mensagemConvite.trim() || undefined
      });
      setConvidadoId("");
      setMensagemConvite("");
      setDialogAberto(false);
    } catch (error) {
      console.error("Erro ao solicitar amizade:", error);
    }
  };

  const handleAceitarAmizade = async (amizadeId: number) => {
    try {
      await aceitarAmizadeMutation.mutateAsync(amizadeId);
    } catch (error) {
      console.error("Erro ao aceitar amizade:", error);
    }
  };

  const handleRejeitarAmizade = async (amizadeId: number) => {
    try {
      await rejeitarAmizadeMutation.mutateAsync(amizadeId);
    } catch (error) {
      console.error("Erro ao rejeitar amizade:", error);
    }
  };

  const handleRemoverAmizade = async (amigoId: number) => {
    if (!user?.id) return;
    try {
      await removerAmizadeMutation.mutateAsync({
        usuario1Id: user.id,
        usuario2Id: amigoId
      });
    } catch (error) {
      console.error("Erro ao remover amizade:", error);
    }
  };

  const handleBloquearUsuario = async (usuarioId: number) => {
    try {
      await bloquearUsuarioMutation.mutateAsync(usuarioId);
    } catch (error) {
      console.error("Erro ao bloquear usuário:", error);
    }
  };

  const amigosFiltrados = amigos.filter(amigo =>
    amigo.nome.toLowerCase().includes(buscaAmigo.toLowerCase()) ||
    amigo.email.toLowerCase().includes(buscaAmigo.toLowerCase())
  );

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    const dataLocal = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return dataLocal.toLocaleDateString("pt-BR");
  };

  if (loadingAmigos || loadingConvites) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Minhas Amizades" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Carregando amizades...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Minhas Amizades" />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Minhas Amizades</h1>
            <div className="flex gap-2">
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Amigo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Solicitar Amizade</DialogTitle>
                    <DialogDescription>
                      Digite o ID do usuário para enviar uma solicitação de amizade.
                      <br />
                      <span className="text-xs text-emerald-600 font-medium">
                        💡 Dica: O ID aparece como #{'{'}número{'}'} no cabeçalho abaixo do nome do usuário
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSolicitarAmizade} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="convidadoId">ID do Usuário</Label>
                      <Input
                        id="convidadoId"
                        type="number"
                        placeholder="Ex: 123 (sem o #)"
                        value={convidadoId}
                        onChange={(e) => setConvidadoId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mensagem">Mensagem (opcional)</Label>
                      <Textarea
                        id="mensagem"
                        placeholder="Escreva uma mensagem..."
                        value={mensagemConvite}
                        onChange={(e) => setMensagemConvite(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setDialogAberto(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={solicitarAmizadeMutation.isPending}
                      >
                        {solicitarAmizadeMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Enviar Solicitação
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button onClick={() => navigate("/dashboard")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Amigos</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {estatisticas?.totalAmigos || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Convites Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {estatisticas?.convitesPendentes || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Amizades Ativas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {amigos.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Convites Pendentes */}
          {convitesPendentes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Solicitações de Amizade ({convitesPendentes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {convitesPendentes.map((convite) => (
                    <div
                      key={convite.id}
                      className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                          {convite.solicitante.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{convite.solicitante.nome}</p>
                          <p className="text-sm text-gray-600">{convite.solicitante.email}</p>
                          <p className="text-xs text-gray-500">ID: #{convite.solicitante.id}</p>
                          <p className="text-xs text-gray-400">
                            Recebido em {formatarData(convite.dataSolicitacao)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAceitarAmizade(convite.id)}
                          disabled={aceitarAmizadeMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejeitarAmizade(convite.id)}
                          disabled={rejeitarAmizadeMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Amigos */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>
                  Meus Amigos ({amigosFiltrados.length} amigo{amigosFiltrados.length !== 1 ? 's' : ''})
                </CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar amigos..."
                    value={buscaAmigo}
                    onChange={(e) => setBuscaAmigo(e.target.value)}
                    className="w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {amigosFiltrados.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amigo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {amigosFiltrados.map((amigo) => (
                        <TableRow key={amigo.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                                {amigo.nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{amigo.nome}</p>
                                <p className="text-sm text-gray-500">#{amigo.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {amigo.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Amigo
                            </Badge>
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

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <UserX className="mr-2 h-4 w-4" />
                                      Remover Amizade
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Remover Amizade
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja remover {amigo.nome} da sua lista de amigos?
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleRemoverAmizade(amigo.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      Bloquear Usuário
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Bloquear Usuário
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja bloquear {amigo.nome}?
                                        Eles não poderão mais interagir com você.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleBloquearUsuario(amigo.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Bloquear
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    {buscaAmigo ? 'Nenhum amigo encontrado' : 'Você ainda não tem amigos'}
                  </p>
                  <p className="text-gray-400 mb-4">
                    {buscaAmigo 
                      ? 'Tente buscar com outros termos.'
                      : 'Adicione amigos para começar a dividir despesas!'
                    }
                  </p>
                  {!buscaAmigo && (
                    <Button onClick={() => setDialogAberto(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar primeiro amigo
                    </Button>
                  )}
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

export default Amizades;
