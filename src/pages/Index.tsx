
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import CustomButton from '../components/CustomButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Index = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setErro('Email ou senha inválidos');
      return;
    }

    // Simulação de login - aceita qualquer email/senha preenchidos
    if (email && senha) {
      login();
      navigate('/dashboard');
    } else {
      setErro('Email ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">QuantoTeDevo</h1>
          <h2 className="text-xl font-semibold text-emerald-600">Login</h2>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Digite seu email(qualquer um funciona)" 
              className="w-full border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="senha" className="text-slate-700">Senha</Label>
            <Input 
              id="senha" 
              type="password" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              placeholder="Digite sua senha(qualquer uma funciona))" 
              className="w-full border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
          
          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
          
          <CustomButton type="submit" className="w-full">
            Entrar
          </CustomButton>
        </form>
      </div>
    </div>
  );
};

export default Index;
