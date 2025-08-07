# Integração Frontend-Backend

Este documento explica como o frontend React se integra com o backend Java.

## 📁 Estrutura da Integração

## 📁 Estrutura da Integração

```
src/
├── services/
│   ├── api.ts # Configuração do Axios
│   ├── authService.ts # Autenticação
│   └── contaService.ts # Serviços de contas
├── hooks/
│   ├── useAuth.ts # Hooks de autenticação
│   └── useContas.ts # Hooks de contas
├── types/
│   └── api.ts # Types TypeScript
└── pages/
    ├── Index.tsx # Login
    └── CadastrarConta.tsx # Cadastro de contas
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=QuantoTeDevo
VITE_APP_VERSION=1.0.0
```

### 2. Endpoints Esperados no Backend Java

#### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/logout` - Logout de usuário
- `POST /auth/register` - Registro de usuário
- `POST /auth/refresh` - Refresh token

#### Contas
- `GET /contas` - Listar contas (com filtros)
- `GET /contas/{id}` - Buscar conta por ID
- `POST /contas` - Criar nova conta
- `PUT /contas/{id}` - Atualizar conta
- `DELETE /contas/{id}` - Deletar conta
- `PATCH /contas/{id}/pagar` - Marcar como paga
- `GET /contas/vencidas` - Listar contas vencidas
- `GET /contas/pendentes` - Listar contas pendentes
- `GET /contas/saldos` - Total de saldos

#### Despesas Compartilhadas
- `GET /despesas` - Listar despesas
- `GET /despesas/{id}` - Buscar despesa por ID
- `POST /despesas` - Criar nova despesa
- `PATCH /despesas/{id}/finalizar` - Finalizar despesa
- `PATCH /despesas/{id}/participantes/{participanteId}/pagar` - Marcar pagamento
- `GET /despesas/usuario` - Despesas do usuário
- `POST /despesas/calcular` - Calcular divisão

## 📝 Tipos de Dados Esperados

### LoginRequest
```typescript
{
  email: string;
  senha: string;
}
```

### LoginResponse
```typescript
{
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  }
}
```

### Conta
```typescript
{
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string; // formato: YYYY-MM-DD
  tipo: 'PESSOAL' | 'COMPARTILHADA';
  usuariosCompartilhados?: string[];
  status: 'PAGA' | 'VENCIDA' | 'PENDENTE';
  dataPagamento?: string;
  usuarioId: string;
}
```

### Resposta Padrão da API
```typescript
{
  data: T; // dados solicitados
  message: string; // mensagem de sucesso
  success: boolean; // true para sucesso
}
```

### Resposta de Erro
```typescript
{
  message: string; // mensagem de erro
  errors?: string[]; // lista de erros específicos
  timestamp: string; // timestamp do erro
  status: number; // código HTTP
}
```

## 🚀 Como Usar

### 1. Hooks de Autenticação

```tsx
import { useLogin, useLogout } from '@/hooks/useAuth';

const LoginComponent = () => {
  const loginMutation = useLogin();
  
  const handleLogin = async (credentials) => {
    try {
      const response = await loginMutation.mutateAsync(credentials);
      // Usuário logado com sucesso
    } catch (error) {
      // Erro tratado automaticamente pelo hook
    }
  };
};
```

### 2. Hooks de Contas

```tsx
import { useContas, useCreateConta } from '@/hooks/useContas';

const ContasComponent = () => {
  // Buscar contas
  const { data: contas, isLoading } = useContas({ status: 'PENDENTE' });
  
  // Criar conta
  const createMutation = useCreateConta();
  
  const handleCreate = async (novaConta) => {
    await createMutation.mutateAsync(novaConta);
  };
};
```

### 3. Tratamento de Fallback

O sistema possui fallback automático para dados locais quando a API não está disponível:

```tsx
try {
  await createContaMutation.mutateAsync(contaData);
} catch (error) {
  // Fallback para dados locais
  adicionarConta(contaData);
}
```

## 🔐 Autenticação

O sistema usa JWT tokens armazenados no localStorage. O interceptor do Axios automaticamente:

1. Adiciona o token Bearer nos headers
2. Remove o token em caso de erro 401
3. Redireciona para login quando necessário

## 📱 Estados de Loading

Todos os hooks retornam estados úteis:

- `isLoading` - Carregamento inicial
- `isPending` - Carregamento de mutations
- `error` - Erros da API
- `isSuccess` - Sucesso nas operações

## 🔄 Cache e Invalidação

O React Query gerencia automaticamente:

- Cache de dados com tempo de vida configurável
- Invalidação automática após mutations
- Refetch em background
- Otimistic updates

## 🛠️ Desenvolvimento

### Testar sem Backend

O sistema funciona em modo "demo" mesmo sem backend. Use o botão "Entrar (Demo)" na tela de login.

### Integrar com Backend Real

1. Configure a `VITE_API_URL` no `.env`
2. Implemente os endpoints no backend Java
3. Configure CORS no backend
4. Use JWT para autenticação

### Debugar Requisições

As requisições são logadas no console do navegador. Use as ferramentas de desenvolvedor do React Query para inspecionar o cache.

## ⚠️ Requisitos do Backend

Para funcionar corretamente, o backend Java deve:

1. Implementar todos os endpoints listados
2. Retornar respostas no formato esperado
3. Configurar CORS adequadamente
4. Implementar autenticação JWT
5. Validar dados de entrada
6. Tratar erros adequadamente

## 🔍 Monitoramento

Para produção, considere adicionar:

- Logging de erros (Sentry)
- Monitoramento de performance
- Analytics de uso
- Health checks da API
