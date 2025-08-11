
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import CustomButton from './CustomButton';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const { logout, usuario } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-white shadow-sm border-b border-emerald-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        
        <div className="flex items-center gap-4">
          {usuario && (
            <div className="flex items-center gap-2 text-slate-600">
              <User size={20} />
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{usuario.nome}</span>
                <span className="text-xs text-slate-500">#{usuario.id}</span>
              </div>
            </div>
          )}
          
          <CustomButton
            variant="secondary"
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 px-4 py-2"
          >
            <LogOut size={16} />
            Sair
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default Header;
