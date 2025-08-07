import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/localStorage'

console.log('🚀 Iniciando aplicação QuantoTeDevo...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('✅ Root element encontrado, renderizando App...');

createRoot(rootElement).render(<App />);

console.log('✅ App renderizado com sucesso!');
