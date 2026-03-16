# App de Tarefas com Supabase

Aplicativo web para organizar tarefas do dia a dia com:

- criação de tarefas
- anotações opcionais
- filtro por status
- ordenação
- atualização em tempo real (Realtime)

## 1) Pré-requisitos

- Node.js 20+
- Projeto no Supabase

## 2) Configuração no Supabase

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Execute o SQL em `supabase/schema.sql` no SQL Editor do projeto.
3. Em **Project Settings > API**, copie:
   - URL do projeto
   - `anon public` key

## 3) Configuração local

```bash
cp .env.example .env
```

Edite `.env` com suas chaves:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 4) Rodar o projeto

```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## 5) Build de produção

```bash
npm run build
npm run preview
```
