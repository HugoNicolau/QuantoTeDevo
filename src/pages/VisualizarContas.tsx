
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, DollarSign, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const VisualizarContas = () => {
  const navigate = useNavigate();
  const { contas } = useApp();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const contasFiltradas = filtroStatus === 'todos' 
    ? contas 
    : contas.filter(conta => conta.status?.toLowerCase() === filtroStatus.toLowerCase());

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paga':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Vencida':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Pendente':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paga':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paga</Badge>;
      case 'Vencida':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencida</Badge>;
      case 'Pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const contarPorStatus = (status: string) => {
    return contas.filter(conta => conta.status === status).length;
  };

  const calcularTotalPorStatus = (status: string) => {
    return contas
      .filter(conta => conta.status === status)
      .reduce((total, conta) => total + conta.valor, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Visualizar Contas" />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Contas Pagas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {contarPorStatus('Paga')}
                    </p>
                    <p className="text-sm text-green-600">
                      {formatarMoeda(calcularTotalPorStatus('Paga'))}
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
                      {contarPorStatus('Vencida')}
                    </p>
                    <p className="text-sm text-red-600">
                      {formatarMoeda(calcularTotalPorStatus('Vencida'))}
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
                      {contarPorStatus('Pendente')}
                    </p>
                    <p className="text-sm text-yellow-600">
                      {formatarMoeda(calcularTotalPorStatus('Pendente'))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Filtrar por Status</CardTitle>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Contas</SelectItem>
                    <SelectItem value="paga">Pagas</SelectItem>
                    <SelectItem value="vencida">Vencidas</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          {/* Tabela de Contas */}
          <Card>
            <CardHeader>
              <CardTitle>
                Lista de Contas ({contasFiltradas.length} conta{contasFiltradas.length !== 1 ? 's' : ''})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Compartilhada com</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasFiltradas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(conta.status || 'Pendente')}
                          {getStatusBadge(conta.status || 'Pendente')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{conta.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={conta.tipo === 'Pessoal' ? 'default' : 'secondary'}>
                          {conta.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatarMoeda(conta.valor)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatarData(conta.dataVencimento)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {conta.tipo === 'Compartilhada' && conta.usuariosCompartilhados ? (
                          <div className="flex flex-wrap gap-1">
                            {conta.usuariosCompartilhados.map((usuario, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {usuario}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="text-center">
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

export default VisualizarContas;
