# SaudeCode

**Sistema de identificação e histórico de saúde para pessoas em situação de rua.**

🔗 **[saudecode.vercel.app](https://saudecode.vercel.app/)** · Protótipo funcional

<p align="center">
  <img width="1899" height="940" alt="pessoa-saudecode" src="https://github.com/user-attachments/assets/7279de6f-baae-410b-9cf3-020c28fd446e" />
 
  <br>
  <em>O prontuário abre pelos alertas — não por nome e endereço</em>
</p>

<p align="center">
  <img width="1901" height="942" alt="painel-saudecode" src="https://github.com/user-attachments/assets/bfab7484-cfcb-4770-b5aa-dfcad12e4a4f" />
 
  <br>
  <em>Painel da unidade: últimos atendimentos, quem retorna com frequência e classificação de risco</em>
</p>
   
---

## O problema

Quem vive na rua costuma chegar ao pronto-socorro sem documento, sem acompanhante e muitas vezes sem conseguir falar. Cada unidade abre uma ficha nova e recomeça do zero: não se sabe as alergias, as condições crônicas, o que foi prescrito na semana passada nem quantas vezes aquela pessoa já voltou pelo mesmo motivo.

O SaudeCode dá a essa pessoa uma pulseira com QR Code. A leitura abre, em qualquer unidade da rede, o prontuário inteiro dela.

---

## Como funciona

```
cadastro com foto  →  gera código e pulseira  →  leitura do QR em qualquer unidade  →  prontuário completo
```

| Tela | O que faz |
|---|---|
| `/pacientes/novo` | Cadastro com foto; ao salvar, gera o código e a pulseira |
| `/pacientes/[id]/pulseira` | Pulseira e cartão de bolso, prontos para impressão |
| `/escanear` | Leitura do QR pela câmera, com digitação do código como alternativa |
| `/p/[codigo]` | Destino do QR — resolve o código e abre o prontuário |
| `/pacientes/[id]` | Prontuário: alertas, alergias, condições, medicamentos, cirurgias, vacinas e linha do tempo |
| `/pacientes` | Busca por nome, apelido, código, tatuagem, cicatriz ou local de permanência |
| `/painel` | Números da unidade, últimos atendimentos, quem retorna com frequência e classificação de risco |

A busca por tatuagem, cicatriz e local de permanência não é detalhe: quando a pessoa não tem documento e não consegue dizer o nome, é por aí que a equipe chega até ela.

---

## Os alertas automáticos

Esta é a parte central do sistema. O prontuário não abre por nome e endereço — abre pelo que muda a conduta nos próximos dez minutos.

Além do que a equipe marca à mão, o sistema deriva do próprio histórico:

- **Alergias graves e anafiláticas**
- **Doenças transmissíveis ativas**, com a precaução indicada
- **Embriaguez recorrente** — quantas das últimas chegadas foram sob efeito de álcool em 12 meses
- **Hipoglicemia de repetição**, com o menor valor já registrado
- **Evasão antes da alta** — a janela de contato é curta, vale resolver na primeira abordagem
- **Uso frequente da emergência**, que sinaliza necessidade não resolvida na atenção básica
- **Medicação de uso contínuo** e lacunas do cadastro

A regra de decisão está isolada em `src/lib/alertas.ts`, separada da tela — o que permite mudar o critério clínico sem mexer na interface.

---

## Privacidade

A pulseira **não carrega nenhum dado clínico**. O QR Code guarda apenas um código aleatório. Quem escaneia sem estar autenticado é parado no login e não vê nada, nem o nome.

Cada abertura de prontuário é gravada na tabela `acessos`, com o profissional, a hora e a origem (pulseira ou busca). O cadastro registra o consentimento da pessoa para o histórico ser compartilhado entre as unidades.

### Limites deste protótipo, assumidos de propósito

- Qualquer profissional autenticado enxerga a rede inteira. É o ponto do sistema — a pessoa é atendida em qualquer unidade —, mas num sistema real isso pediria perfis de acesso mais finos.
- O bucket de fotos é público com nomes de arquivo aleatórios. Em produção deveria ser privado, com URLs assinadas.
- Uso real exigiria parecer de comitê de ética, avaliação de impacto à proteção de dados (LGPD, art. 11 — dado de saúde é dado sensível) e homologação junto à secretaria de saúde.

**Todos os dados de demonstração são fictícios.**

---

## Stack

`Next.js 16 (App Router)` · `TypeScript` · `Tailwind CSS 4` · `Supabase (Postgres, Auth e Storage)` · `Vercel`

---

## Rodar localmente

**1. Criar o projeto no Supabase.** Em [supabase.com](https://supabase.com), escolha a região *South America (São Paulo)* para o banco ficar perto de quem vai usar.

**2. Rodar o esquema e os dados de demonstração.** No SQL Editor, execute na ordem:

- `supabase/schema.sql` — tabelas, políticas de segurança (RLS), o gatilho que cria o perfil do profissional no primeiro acesso e o bucket de fotos
- `supabase/seed.sql` — quatro unidades e seis pessoas fictícias com históricos completos, incluindo um caso de embriaguez recorrente e um de hipoglicemia de repetição, que são os padrões que o sistema detecta sozinho

Os dois scripts podem rodar mais de uma vez sem duplicar nada.

> O SQL Editor roda o script inteiro numa transação só: se qualquer comando falhar, tudo é desfeito — inclusive as tabelas criadas antes dele. Um `relation "public.hospitais" does not exist` ao rodar o seed quase sempre significa que o `schema.sql` falhou em algum ponto e não deixou nada de pé.
>
> Por isso as duas partes que dependem de permissões especiais — o gatilho em `auth.users` e a configuração do storage — estão isoladas em blocos que avisam em vez de abortar. Se aparecer um desses avisos, o resto do banco já está criado e você só precisa completar o que faltou pela interface.

**3. Desligar a confirmação por e-mail.** Em *Authentication › Sign In / Providers › Email*, desmarque **Confirm email**. Sem isso, a conta criada na tela de acesso fica pendente e não consegue entrar.

**4. Preencher as chaves.** Copie `.env.example` para `.env.local` com os valores de *Project Settings › API*:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

**5. Rodar.**

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`, clique em **Acessar o sistema** e use a aba *Criar acesso* para gerar a primeira conta da equipe. Enquanto as chaves não estiverem preenchidas, o sistema mostra a tela de configuração em vez de quebrar.

### Deploy na Vercel

Importe o repositório em *Add New › Project* — o Next.js é detectado sozinho. Em *Environment Variables*, adicione `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e, depois do primeiro deploy, `NEXT_PUBLIC_URL_BASE` com o domínio final — é ele que vai impresso dentro do QR Code das pulseiras.

Pulseiras impressas antes de o domínio final existir continuam válidas: o código é o mesmo e pode ser digitado na tela de leitura. Mas vale reimprimir.

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

```bash
npm run dev     # desenvolvimento
npm run build   # build de produção
npm run lint    # eslint
npm run start   # servir o build
```

---

Feito por **Guilherme Pazoti** — [LinkedIn](https://www.linkedin.com/in/guilherme-pazoti)
