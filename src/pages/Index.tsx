
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CustomButton from '../components/CustomButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login, isLoggingIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !senha) {
      return;
    }

    login({ email, senha });
  };

  const handleDemoLogin = () => {
    login({ 
      email: 'demo@quantotedevo.com', 
      senha: 'demo123' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">QuantoTeDevo</h1>
          <p className="text-slate-600">Controle suas finanças compartilhadas</p>
        </div>

        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-600">Entrar</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar suas despesas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-slate-700">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <CustomButton 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Entrando...' : 'Entrar'}
              </CustomButton>
            </form>

            <div className="mt-4 pt-4 border-t">
              <CustomButton 
                variant="secondary" 
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoggingIn}
              >
                Entrar como Demo
              </CustomButton>
              <p className="text-xs text-slate-500 text-center mt-2">
                Use o modo demo para testar a aplicação
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Não tem uma conta?{' '}
                <Link 
                  to="/registro" 
                  className="text-emerald-600 hover:text-emerald-500 font-medium"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-500">
          <p>© 2025 QuantoTeDevo. Gerenciamento de despesas compartilhadas.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
