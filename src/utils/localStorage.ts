export const clearCorruptedData = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (user) {
      try {
        JSON.parse(user);
      } catch {
        console.warn('Dados de usuário corrompidos, removendo...');
        localStorage.removeItem('user');
      }
    }
    
    if (token && (token === 'null' || token === 'undefined')) {
      console.warn('Token inválido, removendo...');
      localStorage.removeItem('token');
    }
    
    console.log('✅ Verificação de localStorage concluída');
  } catch (error) {
    console.error('Erro ao verificar localStorage:', error);
  }
};

clearCorruptedData();
