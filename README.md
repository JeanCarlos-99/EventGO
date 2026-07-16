# EventGo — protótipo funcional

Protótipo full-stack do EventGo: descoberta de eventos num mapa em tempo real,
criação/participação de eventos, sistema de pontos (gamificação), perfil com
foto, amigos e chat. Roda local no VS Code e pode ser publicado na Netlify.

## O que já funciona de ponta a ponta

- Cadastro e login com e-mail/senha (sessão via cookie JWT httpOnly)
- Mapa interativo (Leaflet/OpenStreetMap) com marcadores de eventos e popup
- Lista de eventos com busca por texto/categoria, ao lado do mapa
- Criar evento (formulário completo: categoria, local, data, preço, comodidades)
- Participar / favoritar evento, com contagem de interesse da comunidade (%)
- Sistema de pontos: cria evento, participa, convida amigo → ganha pontos e sobe de nível
- Perfil editável: nome, nome de usuário, bio, cidade, foto (upload) e privacidade
- Perfil público em `/u/[usuario]`, respeitando a opção de perfil privado
- Amigos: adicionar por nome de usuário, telefone ou e-mail; aceitar/recusar
  solicitação; sininho de notificação com contador de pedidos pendentes
- Chat 1-para-1 com amigos (atualiza por polling a cada poucos segundos)

## O que está estruturado no banco mas ainda **não** tem UI (próximos passos)

- Avaliações de evento (`Review` já existe no schema)
- Feed de atividades dos amigos
- Painel administrativo
- Login social (Google/Facebook/Apple) — os botões existem na tela de login,
  mas precisam das credenciais OAuth reais e da lógica de callback, que não
  incluí aqui para não gerar uma integração que pareceria funcionar sem
  realmente autenticar ninguém
- Notificações push de verdade (Firebase/Web Push) — hoje o sininho funciona
  por polling dentro do próprio app, não como notificação do sistema operacional

## Rodando local no VS Code

Pré-requisitos: Node.js 18+ e uma connection string de Postgres (veja o passo
1 abaixo — é grátis e leva 2 minutos).

### 1. Crie o banco de dados (Supabase)

1. Crie uma conta grátis em https://supabase.com e crie um novo projeto
2. Vá em **Project Settings > Database > Connection string**
3. Copie **duas** strings (troque `[SUA-SENHA]` pela senha do seu projeto nas duas):
   - Aba **Transaction pooler** (porta `6543`) → cole em `DATABASE_URL`
   - Aba **Direct connection** (porta `5432`) → cole em `DIRECT_URL`

   (Usar as duas evita um erro comum de "prepared statement" quando o app
   roda em produção usando só a conexão em pool.)

### 2. Configure e rode o projeto

```bash
# instalar dependências
npm install

# configurar variáveis de ambiente
cp .env.example .env
# abra o .env e cole sua DATABASE_URL do Supabase, e defina um JWT_SECRET qualquer

# criar as tabelas no banco
npm run db:push

# popular com categorias + usuários e eventos de exemplo
npm run db:seed

# rodar em desenvolvimento
npm run dev
```

Abra http://localhost:3000. Logins de demonstração:
- `demo@eventgo.app` / `demo1234`
- `amigo@eventgo.app` / `demo1234` (útil para testar pedido de amizade e chat)

## Publicando na Netlify

1. **Suba o projeto para o GitHub** (crie um repositório e faça o push da pasta)
2. **Use o mesmo banco Supabase do passo acima** (ou crie um projeto Supabase
   separado só para produção) — os dados ficam salvos nele, não na Netlify
3. Na Netlify: **Add new site > Import an existing project**, conecte o repositório
4. A Netlify detecta automaticamente que é um projeto Next.js (o `netlify.toml`
   já está incluído no projeto com o plugin certo — não precisa mexer em nada)
5. Em **Site settings > Environment variables**, adicione:
   - `DATABASE_URL` → a connection string do Supabase (Transaction pooler, porta 6543)
   - `DIRECT_URL` → a connection string direta do Supabase (porta 5432)
   - `JWT_SECRET` → um texto longo e aleatório (pode gerar em https://generate-secret.vercel.app/32)
6. Clique em **Deploy site**

Pronto — o site fica no ar com um endereço `.netlify.app`, e todo cadastro,
evento criado, ponto ganho, amizade e mensagem de chat fica salvo no Supabase.

### Depois do primeiro deploy

Se você mudar o `prisma/schema.prisma` no futuro (novos campos/tabelas), rode
`npm run db:push` localmente (com o `.env` apontando pro banco de produção)
antes de fazer o deploy, para as tabelas novas existirem no banco.

## Estrutura do projeto

```
prisma/schema.prisma     modelos: User, Event, Category, EventInterest,
                          Review, PointsTransaction, Friendship, Message
src/lib/                 prisma client, autenticação (JWT), regras de pontos
src/app/api/             rotas de API (auth, events, friends, messages,
                          notifications, profile, users)
src/app/                 páginas (explorar, login, cadastro, criar evento,
                          detalhe do evento, perfil, perfil público, amigos, chat)
src/components/          Navbar, EventCard, MapView, InterestGauge
netlify.toml             configuração de build/deploy da Netlify
```

## Identidade visual

- Cor de assinatura: gradiente "pin" (rosa `#FF4D6D` → âmbar `#FF8A3D`), usado no
  marcador do mapa e no medidor circular de interesse da comunidade
- Verde/azul/amarelo/vermelho no medidor de interesse, seguindo a especificação
- Tipografia: Space Grotesk (títulos), Inter (texto), IBM Plex Mono (números/pontos)
