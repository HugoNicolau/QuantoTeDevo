
import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div className="bg-white shadow-sm border-b border-emerald-200 px-6 py-4">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
    </div>
  );
};

export default Header;
