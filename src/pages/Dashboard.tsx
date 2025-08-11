
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Eye, Calculator, FileText, Users } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <CustomButton
                  onClick={() => navigate('/cadastrar-conta')}
                  className="w-full h-16 text-lg flex items-center justify-center gap-3"
                >
                  <PlusCircle size={24} />
                  Cadastrar Conta
                </CustomButton>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <CustomButton
                  onClick={() => navigate('/visualizar-saldos')}
                  className="w-full h-16 text-lg flex items-center justify-center gap-3"
                >
                  <Eye size={24} />
                  Visualizar Saldos
                </CustomButton>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <CustomButton
                  onClick={() => navigate('/visualizar-contas')}
                  className="w-full h-16 text-lg flex items-center justify-center gap-3"
                >
                  <FileText size={24} />
                  Visualizar Contas
                </CustomButton>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <CustomButton
                  onClick={() => navigate('/dividir-despesas')}
                  className="w-full h-16 text-lg flex items-center justify-center gap-3"
                >
                  <Calculator size={24} />
                  Dividir Despesas
                </CustomButton>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <CustomButton
                  onClick={() => navigate('/amizades')}
                  className="w-full h-16 text-lg flex items-center justify-center gap-3"
                  variant="secondary"
                >
                  <Users size={24} />
                  Gerenciar Amizades
                </CustomButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
