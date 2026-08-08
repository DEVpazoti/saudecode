# SaudeCode

Protótipo funcional de um sistema de identificação e histórico de saúde para
pessoas em situação de rua.

A ideia: quem vive na rua costuma chegar ao pronto-socorro sem documento, sem
acompanhante e muitas vezes sem conseguir falar. Cada unidade abre uma ficha
nova e recomeça do zero. O SaudeCode dá a essa pessoa uma pulseira com QR Code —
a leitura abre, em qualquer unidade da rede, o prontuário inteiro dela.

**Pilha:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase
(Postgres, Auth e Storage) · deploy na Vercel.

---

## Colocar para rodar

### 1. Criar o projeto no Supabase

Em [supabase.com](https://supabase.com), crie um projeto novo. Escolha a região
**South America (São Paulo)** para o banco ficar perto de quem vai usar.

### 2. Rodar o esquema e os dados de demonstração

No **SQL Editor** do projeto:

1. Cole e execute todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql)
   — cria as tabelas, as políticas de segurança (RLS), o gatilho que cria o
   perfil do profissional no primeiro acesso e o bucket de fotos.
2. Cole e execute [`supabase/seed.sql`](supabase/seed.sql) — carrega quatro
   unidades e seis pessoas fictícias com históricos completos, inclusive um caso
   de embriaguez recorrente e um de hipoglicemia de repetição, que são os
   padrões que o sistema detecta sozinho.

Os dois scripts podem ser executados mais de uma vez sem duplicar nada.

> Se o `schema.sql` avisar que não teve permissão para criar as políticas de
> **storage**, crie as quatro pela interface em Storage › `fotos-pacientes` ›
> Policies. O resto do script já terá rodado normalmente.

### 3. Desligar a confirmação por e-mail

Em **Authentication › Sign In / Providers › Email**, desmarque **Confirm email**.
Sem isso, a conta criada na tela de acesso fica pendente e não consegue entrar.

### 4. Preencher as chaves

Copie `.env.example` para `.env.local` e preencha com os valores de
**Project Settings › API**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 5. Rodar

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>, clique em **Acessar o sistema** e use a aba
**Criar acesso** para gerar a primeira conta da equipe. Enquanto as chaves não
estiverem preenchidas, o sistema mostra a tela de configuração em vez de quebrar.

---

## O que dá para fazer

| Tela | O que faz |
| --- | --- |
| `/` | Landing page explicando o sistema, com uma pulseira de verdade renderizada |
| `/entrar` | Acesso e criação de conta da equipe, vinculada a uma unidade |
| `/painel` | Números da unidade, últimos atendimentos, quem retorna com frequência, classificação de risco e encaminhamentos |
| `/pacientes` | Busca por nome, apelido, código, tatuagem, cicatriz ou local de permanência |
| `/pacientes/novo` | Cadastro com foto; ao salvar, gera o código e a pulseira |
| `/pacientes/[id]` | Prontuário: alertas, alergias, condições, medicamentos, cirurgias, vacinas e linha do tempo |
| `/pacientes/[id]/atendimento` | Registro de atendimento com triagem de Manchester e sinais vitais |
| `/pacientes/[id]/pulseira` | Pulseira e cartão de bolso, prontos para impressão |
| `/escanear` | Leitura do QR pela câmera, com digitação do código como alternativa |
| `/p/[codigo]` | Destino do QR Code — resolve o código e abre o prontuário |

### Os alertas automáticos

O prontuário não abre por nome e endereço; abre pelo que muda a conduta nos
próximos dez minutos. Além do que a equipe fixa à mão, [`src/lib/alertas.ts`](src/lib/alertas.ts)
deriva do histórico:

- alergias graves e anafiláticas;
- doenças transmissíveis ativas, com a precaução indicada;
- **embriaguez recorrente** — quantas das últimas chegadas foram sob efeito de
  álcool em 12 meses;
- uso recorrente de outras substâncias;
- **hipoglicemia de repetição**, com o menor valor já registrado;
- evasão antes da alta (a janela de contato é curta — vale resolver na primeira
  abordagem);
- uso frequente da emergência, que sinaliza necessidade não resolvida na
  atenção básica;
- medicação de uso contínuo e lacunas do cadastro.

---

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Na Vercel, **Add New › Project** e importe o repositório. O Next.js é
   detectado sozinho.
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` e, depois do primeiro deploy,
   `NEXT_PUBLIC_URL_BASE` com o domínio final — é ele que vai impresso dentro
   do QR Code das pulseiras.
4. Deploy.

> Pulseiras impressas antes de o domínio final existir continuam válidas: o
> código é o mesmo e pode ser digitado na tela de leitura. Mas vale reimprimir.

---

## Privacidade

A pulseira **não carrega nenhum dado clínico** — o QR Code guarda apenas um
código aleatório. Quem escaneia sem estar autenticado é parado no login e não vê
nada, nem o nome. Cada abertura de prontuário é gravada na tabela `acessos`,
com o profissional, a hora e a origem (pulseira ou busca). O cadastro registra
o consentimento da pessoa para o histórico ser compartilhado entre as unidades.

**Limites deste protótipo, assumidos de propósito:**

- Qualquer profissional autenticado enxerga a rede inteira. É o ponto do
  sistema — a pessoa é atendida em qualquer unidade —, mas num sistema real
  isso pediria perfis de acesso mais finos.
- O bucket de fotos é público com nomes de arquivo aleatórios. Em produção
  deveria ser privado com URLs assinadas.
- Uso real exigiria parecer de comitê de ética, avaliação de impacto à proteção
  de dados (LGPD, art. 11 — dado de saúde é dado sensível) e homologação junto
  à secretaria de saúde.

Todos os dados de demonstração são fictícios.

---

## Estrutura

```
src/
  app/
    page.tsx                    landing page
    entrar/                     acesso da equipe
    (sistema)/                  tudo que exige login
      painel/
      pacientes/
      escanear/
    p/[codigo]/                 destino do QR Code
    acoes/pacientes.ts          server actions
  components/                   peças de UI
  lib/
    alertas.ts                  regras que geram a faixa de alertas
    codigo.ts                   geração e leitura do código da pulseira
    prontuario.ts               carregamento do prontuário
    formato.ts                  datas, idades, rótulos
    supabase/                   clientes de navegador e servidor
  proxy.ts                      guarda de rotas autenticadas
supabase/
  schema.sql                    tabelas, RLS, gatilhos, bucket
  seed.sql                      dados de demonstração
```

## Comandos

```bash
npm run dev     # desenvolvimento
npm run build   # build de produção
npm run lint    # eslint
npm run start   # servir o build
```
