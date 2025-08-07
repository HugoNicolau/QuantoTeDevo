# Quanto Te Devo

Uma aplicação web para controle de dívidas e divisão de despesas, construída com React, Vite, TypeScript e integração com backend Java.

## 🚀 Funcionalidades

- ✅ **Autenticação** - Login/logout com JWT
- ✅ **Gestão de Contas** - Criar, visualizar e gerenciar contas pessoais e compartilhadas
- ✅ **Divisão de Despesas** - Calcular e dividir gastos entre participantes
- ✅ **Dashboard Interativo** - Visão geral dos saldos e contas
- ✅ **Modo Offline** - Funciona mesmo sem backend (modo demo)
- ✅ **Responsive Design** - Interface adaptável para mobile e desktop

## 🛠️ Tecnologias

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **TailwindCSS** - Estilização
- **Shadcn/ui** - Componentes de UI
- **TanStack Query** - Gerenciamento de estado servidor
- **Axios** - Cliente HTTP
- **React Router** - Navegação

### Backend (Java - esperado)
- **Spring Boot** - Framework principal
- **Spring Security** - Autenticação/autorização
- **JPA/Hibernate** - ORM
- **JWT** - Tokens de autenticação
- **PostgreSQL/MySQL** - Banco de dados

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18+ ou Bun
- npm, yarn ou bun

### Frontend

1. **Clone o repositório**
```bash
git clone https://github.com/HugoNicolau/quanto-te-devo.git
cd QuantoTeDevo
```

2. **Instale as dependências**
```bash
# Com Bun (recomendado)
bun install

# Com npm
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=QuantoTeDevo
VITE_APP_VERSION=1.0.0
```

4. **Execute o projeto**
```bash
# Com Bun
bun run dev

# Com npm
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Backend Java (opcional)

Para integração completa, você precisa do backend Java rodando em `http://localhost:8080`. 

Consulte o arquivo [INTEGRATION.md](INTEGRATION.md) para detalhes sobre os endpoints esperados.

## 🎯 Como Usar

### Modo Demo (sem backend)
1. Acesse a aplicação
2. Digite qualquer email/senha
3. Clique em "Entrar (Demo)"
4. Use todas as funcionalidades com dados fictícios

### Modo Integrado (com backend)
1. Configure o backend Java
2. Configure a `VITE_API_URL` no `.env`
3. Use login/senha reais
4. Dados são persistidos no backend

## 🔗 Integração com Backend

A aplicação foi projetada para se integrar com um backend Java. Consulte [INTEGRATION.md](INTEGRATION.md) para:

- Lista completa de endpoints esperados
- Tipos de dados e contratos da API
- Configuração de autenticação JWT
- Tratamento de erros
- Estados de loading e cache

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev    # ou npm run dev

# Build para produção
bun run build  # ou npm run build

# Preview do build
bun run preview # ou npm run preview

# Lint
bun run lint   # ou npm run lint
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `VITE_API_URL` | URL base do backend | `http://localhost:8080` |
| `VITE_APP_NAME` | Nome da aplicação | `QuantoTeDevo` |
| `VITE_APP_VERSION` | Versão da aplicação | `1.0.0` |

### Customização

O projeto usa **TailwindCSS** e **Shadcn/ui**. Para customizar:

1. **Cores e temas**: Edite `tailwind.config.ts`
2. **Componentes**: Customize em `src/components/ui/`
3. **Layout**: Modifique `src/index.css`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais informações.

## 🐛 Issues

Encontrou um bug ou tem uma sugestão? [Abra uma issue](../../issues)

## 📞 Suporte

Para dúvidas sobre integração com backend Java ou uso da aplicação, consulte:

- [Documentação de Integração](INTEGRATION.md)
- [Issues do GitHub](../../issues)
- Documentação dos componentes Shadcn/ui