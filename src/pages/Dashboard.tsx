
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Eye, Calculator, FileText, LogOut } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
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
              <CardContent className="p-8">
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
              <CardContent className="p-8">
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
              <CardContent className="p-8">
                <CustomButton
                  onClick={() => navigate('/dividir-despesas')}
                  className="w-full h-16 text-lg flex items-center justify-center gap-3"
                >
                  <Calculator size={24} />
                  Dividir Despesas
                </CustomButton>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <CustomButton
                variant="secondary"
                onClick={handleLogout}
                className="flex items-center gap-2 mx-auto"
              >
                <LogOut size={20} />
                Sair
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
