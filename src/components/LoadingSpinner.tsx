import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">QuantoTeDevo</h2>
        <p className="text-slate-600">Carregando aplicação...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
