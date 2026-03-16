# App de Tarefas com Supabase

Aplicativo web para organizar tarefas do dia a dia com:

- criação de tarefas
- anotações opcionais
- filtro por status
- ordenação
- atualização em tempo real (Realtime)

## 1) Pré-requisitos

- Node.js 20+
- Conta no Supabase
- Um projeto Supabase criado

## 2) Como conectar seu Supabase (passo a passo)

### Ainda não tenho as chaves?

Sem problemas: as chaves ficam no painel do Supabase e você pode copiar em menos de 1 minuto:

1. Abra seu projeto no Supabase.
2. Vá em **Project Settings > API**.
3. Copie **Project URL** e **anon public key**.
4. Cole no `.env` como `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.


1. Crie um projeto no [Supabase](https://supabase.com/).
2. No painel do projeto, vá em **SQL Editor** e rode o conteúdo de `supabase/schema.sql`.
3. Vá em **Project Settings > API** e copie:
   - **Project URL**
   - **anon public key**
4. No projeto local, crie o arquivo `.env`:

```bash
cp .env.example .env
```

5. Preencha as variáveis no `.env`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

> Importante: não use a `service_role` no frontend. Use apenas a `anon key`.

## 3) Rodando localmente

```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## 4) Teste rápido de conexão

Após subir a aplicação:

1. Crie uma tarefa no formulário.
2. Confira no Supabase em **Table Editor > tasks** se a linha foi criada.
3. Abra duas abas do navegador e altere uma tarefa em uma aba.
4. Verifique se a outra aba atualiza em tempo real.

## 5) Solução de problemas comuns

### Erro: "Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"
Seu `.env` está ausente/incompleto ou com nomes errados. Garanta os nomes exatos:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Erro de permissão (RLS / policy)
Rode novamente o SQL de `supabase/schema.sql` para recriar tabela/policies.

### Realtime não atualiza
Garanta que a tabela `tasks` está adicionada à publicação `supabase_realtime` (o SQL do projeto já faz isso).

### CORS/URL incorreta
Confirme se a URL começa com `https://` e termina com `.supabase.co`.

## 6) Build de produção

```bash
npm run build
npm run preview
```

## 7) Deploy na Vercel

Para este projeto, o **Application Preset correto é: `Vite`**.

- **Não** use `Vue.js` (este app é React).
- **Não** use `Django` (backend Python, não se aplica aqui).
- Também pode usar `Other`, mas `Vite` já configura build/output corretamente.

### Configuração recomendada na Vercel

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Variáveis de ambiente (obrigatórias)

Adicione no painel da Vercel (Project Settings > Environment Variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Depois faça um novo deploy.

## 8) Estou no Codex online + Vercel + GitHub: onde colocar as chaves?

Se você **não roda localmente**, configure as variáveis direto no ambiente de deploy/CI:

### Vercel (obrigatório)

No projeto da Vercel:

1. `Project` → `Settings` → `Environment Variables`
2. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Marque os ambientes que devem receber as variáveis (`Production`, `Preview`, `Development`)
4. Faça **Redeploy** após salvar

> Como este projeto usa Vite, variáveis de frontend precisam começar com `VITE_`.

### GitHub Actions (se você tiver pipeline de build)

No GitHub do repositório:

1. `Settings` → `Secrets and variables` → `Actions`
2. Crie os secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. No workflow, injete em `env` no job ou step de build:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

### Sobre segurança

- No frontend, use apenas a **anon key**.
- **Nunca** exponha a `service_role` no app web.

