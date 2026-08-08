-- =====================================================================
-- SaudeCode — esquema do banco (Supabase / PostgreSQL)
-- Rode este arquivo inteiro no SQL Editor do Supabase.
-- =====================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------
-- Hospitais / unidades de saúde
-- ---------------------------------------------------------------------
create table if not exists public.hospitais (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  cnes        text,
  municipio   text,
  uf          char(2),
  criado_em   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Profissionais — perfil vinculado ao usuário de autenticação
-- ---------------------------------------------------------------------
create table if not exists public.profissionais (
  id          uuid primary key references auth.users on delete cascade,
  nome        text not null,
  cargo       text not null default 'enfermeiro'
              check (cargo in ('enfermeiro','tecnico','medico','assistente_social','recepcao','admin')),
  registro    text,                                   -- COREN / CRM
  hospital_id uuid references public.hospitais on delete set null,
  criado_em   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Pacientes
-- ---------------------------------------------------------------------
create table if not exists public.pacientes (
  id                    uuid primary key default gen_random_uuid(),
  codigo                text not null unique,          -- código impresso na pulseira
  nome                  text not null,
  nome_social           text,
  apelido               text,                          -- como é conhecido na rua
  sem_documento         boolean not null default true,
  cpf                   text,
  cns                   text,                          -- Cartão Nacional de Saúde
  rg                    text,
  nome_mae              text,
  data_nascimento       date,
  idade_estimada        integer check (idade_estimada between 0 and 130),
  sexo                  text check (sexo in ('feminino','masculino','outro','nao_informado')),
  altura_cm             integer check (altura_cm between 30 and 260),
  peso_kg               numeric(5,2) check (peso_kg between 1 and 400),
  tipo_sanguineo        text check (tipo_sanguineo in ('A+','A-','B+','B-','AB+','AB-','O+','O-','desconhecido')),
  foto_url              text,
  sinais_particulares   text,   -- tatuagens, cicatrizes: reidentifica sem a pulseira
  local_permanencia     text,   -- onde costuma ser encontrado
  contato_nome          text,
  contato_telefone      text,
  contato_vinculo       text,
  observacoes           text,
  consentimento         boolean not null default false,
  ativo                 boolean not null default true,
  hospital_cadastro_id  uuid references public.hospitais on delete set null,
  cadastrado_por        uuid references public.profissionais on delete set null,
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now()
);

create index if not exists pacientes_nome_trgm   on public.pacientes using gin (nome gin_trgm_ops);
create index if not exists pacientes_apelido_trgm on public.pacientes using gin (apelido gin_trgm_ops);
create index if not exists pacientes_criado_em   on public.pacientes (criado_em desc);

-- ---------------------------------------------------------------------
-- Condições de saúde (doenças que teve ou tem)
-- ---------------------------------------------------------------------
create table if not exists public.condicoes (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes on delete cascade,
  nome         text not null,
  cid10        text,
  tipo         text not null default 'cronica'
               check (tipo in ('cronica','aguda','transmissivel','saude_mental','dependencia_quimica')),
  status       text not null default 'ativa'
               check (status in ('ativa','controlada','curada')),
  desde        date,
  observacao   text,
  criado_em    timestamptz not null default now()
);
create index if not exists condicoes_paciente on public.condicoes (paciente_id);

-- ---------------------------------------------------------------------
-- Alergias
-- ---------------------------------------------------------------------
create table if not exists public.alergias (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes on delete cascade,
  agente       text not null,
  tipo         text not null default 'medicamento'
               check (tipo in ('medicamento','alimento','ambiental','outro')),
  gravidade    text not null default 'moderada'
               check (gravidade in ('leve','moderada','grave','anafilatica')),
  reacao       text,
  criado_em    timestamptz not null default now()
);
create index if not exists alergias_paciente on public.alergias (paciente_id);

-- ---------------------------------------------------------------------
-- Medicamentos
-- ---------------------------------------------------------------------
create table if not exists public.medicamentos (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes on delete cascade,
  nome         text not null,
  dosagem      text,
  frequencia   text,
  via          text,
  em_uso       boolean not null default true,
  inicio       date,
  fim          date,
  observacao   text,
  criado_em    timestamptz not null default now()
);
create index if not exists medicamentos_paciente on public.medicamentos (paciente_id);

-- ---------------------------------------------------------------------
-- Cirurgias e procedimentos
-- ---------------------------------------------------------------------
create table if not exists public.cirurgias (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes on delete cascade,
  procedimento text not null,
  data         date,
  local        text,
  complicacoes text,
  observacao   text,
  criado_em    timestamptz not null default now()
);
create index if not exists cirurgias_paciente on public.cirurgias (paciente_id);

-- ---------------------------------------------------------------------
-- Vacinas
-- ---------------------------------------------------------------------
create table if not exists public.vacinas (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes on delete cascade,
  vacina       text not null,
  dose         text,
  data         date,
  criado_em    timestamptz not null default now()
);
create index if not exists vacinas_paciente on public.vacinas (paciente_id);

-- ---------------------------------------------------------------------
-- Alertas manuais fixados no prontuário
-- ---------------------------------------------------------------------
create table if not exists public.alertas (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes on delete cascade,
  titulo       text not null,
  descricao    text,
  severidade   text not null default 'atencao' check (severidade in ('critico','atencao','info')),
  ativo        boolean not null default true,
  criado_por   uuid references public.profissionais on delete set null,
  criado_em    timestamptz not null default now()
);
create index if not exists alertas_paciente on public.alertas (paciente_id);

-- ---------------------------------------------------------------------
-- Atendimentos
-- ---------------------------------------------------------------------
create table if not exists public.atendimentos (
  id                     uuid primary key default gen_random_uuid(),
  paciente_id            uuid not null references public.pacientes on delete cascade,
  hospital_id            uuid references public.hospitais on delete set null,
  profissional_id        uuid references public.profissionais on delete set null,
  data_hora              timestamptz not null default now(),
  tipo                   text not null default 'emergencia'
                         check (tipo in ('emergencia','consulta','curativo','odontologico','saude_mental','busca_ativa')),
  classificacao_risco    text check (classificacao_risco in ('vermelho','laranja','amarelo','verde','azul')),
  queixa                 text,
  pressao_sistolica      integer,
  pressao_diastolica     integer,
  frequencia_cardiaca    integer,
  frequencia_respiratoria integer,
  temperatura            numeric(4,1),
  saturacao              integer,
  glicemia               integer,
  sob_efeito_alcool      boolean not null default false,
  sob_efeito_substancias boolean not null default false,
  substancias            text,
  diagnostico            text,
  cid10                  text,
  conduta                text,
  desfecho               text check (desfecho in ('alta','internacao','transferencia','evasao','encaminhamento','obito')),
  encaminhamento         text,
  observacoes            text,
  criado_em              timestamptz not null default now()
);
create index if not exists atendimentos_paciente on public.atendimentos (paciente_id, data_hora desc);
create index if not exists atendimentos_data     on public.atendimentos (data_hora desc);

-- ---------------------------------------------------------------------
-- Trilha de acesso (LGPD) — quem abriu qual prontuário
-- ---------------------------------------------------------------------
create table if not exists public.acessos (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid not null references public.pacientes on delete cascade,
  profissional_id uuid references public.profissionais on delete set null,
  acao            text not null default 'consulta',
  origem          text,                                -- 'qrcode' | 'busca' | 'link'
  criado_em       timestamptz not null default now()
);
create index if not exists acessos_paciente on public.acessos (paciente_id, criado_em desc);

-- ---------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------
create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

drop trigger if exists pacientes_atualizado_em on public.pacientes;
create trigger pacientes_atualizado_em
  before update on public.pacientes
  for each row execute function public.tocar_atualizado_em();

-- Cria o perfil do profissional assim que a conta de acesso é criada
create or replace function public.criar_profissional()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profissionais (id, nome, cargo, registro, hospital_id)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nome', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'cargo', ''), 'enfermeiro'),
    nullif(new.raw_user_meta_data->>'registro', ''),
    nullif(new.raw_user_meta_data->>'hospital_id', '')::uuid
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_profissional();

-- ---------------------------------------------------------------------
-- Row Level Security
-- Protótipo: qualquer profissional autenticado enxerga a rede toda —
-- é o ponto do sistema (a pessoa é atendida em qualquer unidade).
-- Visitante anônimo não lê nada. Hospitais são o único catálogo público,
-- para preencher o seletor da tela de criar acesso.
-- ---------------------------------------------------------------------
alter table public.hospitais     enable row level security;
alter table public.profissionais enable row level security;
alter table public.pacientes     enable row level security;
alter table public.condicoes     enable row level security;
alter table public.alergias      enable row level security;
alter table public.medicamentos  enable row level security;
alter table public.cirurgias     enable row level security;
alter table public.vacinas       enable row level security;
alter table public.alertas       enable row level security;
alter table public.atendimentos  enable row level security;
alter table public.acessos       enable row level security;

drop policy if exists hospitais_leitura on public.hospitais;
create policy hospitais_leitura on public.hospitais for select using (true);

drop policy if exists profissionais_leitura on public.profissionais;
create policy profissionais_leitura on public.profissionais
  for select to authenticated using (true);

drop policy if exists profissionais_proprio on public.profissionais;
create policy profissionais_proprio on public.profissionais
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

do $$
declare
  t text;
  politica text;
begin
  foreach t in array array[
    'pacientes','condicoes','alergias','medicamentos',
    'cirurgias','vacinas','alertas','atendimentos','acessos'
  ] loop
    politica := t || '_equipe';
    execute format('drop policy if exists %I on public.%I', politica, t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      politica, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Storage: fotos de identificação
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('fotos-pacientes', 'fotos-pacientes', true)
on conflict (id) do nothing;

-- Dependendo do plano, o papel do SQL Editor não é dono de storage.objects
-- e não consegue criar políticas. Nesse caso o bloco avisa em vez de abortar
-- o script inteiro — as quatro políticas podem ser criadas pela interface,
-- em Storage › fotos-pacientes › Policies.
do $$
begin
  execute 'drop policy if exists fotos_leitura on storage.objects';
  execute 'create policy fotos_leitura on storage.objects
             for select using (bucket_id = ''fotos-pacientes'')';

  execute 'drop policy if exists fotos_escrita on storage.objects';
  execute 'create policy fotos_escrita on storage.objects
             for insert to authenticated with check (bucket_id = ''fotos-pacientes'')';

  execute 'drop policy if exists fotos_atualizacao on storage.objects';
  execute 'create policy fotos_atualizacao on storage.objects
             for update to authenticated using (bucket_id = ''fotos-pacientes'')';

  execute 'drop policy if exists fotos_remocao on storage.objects';
  execute 'create policy fotos_remocao on storage.objects
             for delete to authenticated using (bucket_id = ''fotos-pacientes'')';
exception
  when insufficient_privilege then
    raise notice 'Sem permissão para criar as políticas de storage. Crie-as pela interface do Supabase, em Storage > fotos-pacientes > Policies.';
end $$;
