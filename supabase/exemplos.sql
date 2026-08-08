-- =====================================================================
-- SaudeCode — comandos avulsos para o SQL Editor do Supabase
--
-- Não rode este arquivo inteiro. Copie só o bloco que você precisa,
-- troque os valores entre aspas e execute.
--
-- O SQL Editor roda como superusuário e ignora as políticas de RLS —
-- por isso estes comandos funcionam mesmo mexendo em linhas de outras
-- pessoas, o que o app nunca deixaria fazer.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. ADICIONAR UMA UNIDADE
--
-- O id é gerado sozinho. O `returning` mostra o que foi criado.
-- A unidade aparece na hora no seletor da tela de criar acesso.
-- ---------------------------------------------------------------------
insert into public.hospitais (nome, cnes, municipio, uf)
values ('Hospital Municipal do Jabaquara', '2078201', 'São Paulo', 'SP')
returning id, nome, municipio, uf;


-- Versão que pode ser executada mais de uma vez sem criar duplicata:
insert into public.hospitais (nome, cnes, municipio, uf)
select 'Hospital Municipal do Jabaquara', '2078201', 'São Paulo', 'SP'
where not exists (
  select 1 from public.hospitais
  where nome = 'Hospital Municipal do Jabaquara'
)
returning id, nome;


-- Conferir o que existe:
select id, nome, cnes, municipio, uf, criado_em
from public.hospitais
order by nome;


-- ---------------------------------------------------------------------
-- 2. EDITAR OS DADOS DE UM PROFISSIONAL
--
-- A tabela `profissionais` guarda o perfil; o e-mail e a senha ficam em
-- `auth.users`, e as duas se ligam pelo mesmo id. Como você conhece a
-- pessoa pelo e-mail e não pelo uuid, o jeito prático é fazer a junção.
--
-- Cargos aceitos: enfermeiro, tecnico, medico, assistente_social,
--                 recepcao, admin
-- ---------------------------------------------------------------------

-- Antes: ver quem existe e em que unidade está.
select u.email,
       p.nome,
       p.cargo,
       p.registro,
       h.nome as unidade
from public.profissionais p
join auth.users u on u.id = p.id
left join public.hospitais h on h.id = p.hospital_id
order by p.nome;


-- Editar tudo de uma vez, identificando pelo e-mail:
update public.profissionais p
set nome        = 'Ana Beatriz Souza',
    cargo       = 'enfermeiro',
    registro    = 'COREN-SP 123456',
    hospital_id = (
      select id from public.hospitais
      where nome = 'Hospital Municipal Santa Clara'
    )
from auth.users u
where u.id = p.id
  and u.email = 'ana.souza@hospital.sp.gov.br'
returning p.id, p.nome, p.cargo, p.registro, p.hospital_id;


-- Mudar só a unidade, deixando o resto como está:
update public.profissionais p
set hospital_id = (
      select id from public.hospitais where nome = 'UPA 24h Zona Leste'
    )
from auth.users u
where u.id = p.id
  and u.email = 'ana.souza@hospital.sp.gov.br'
returning p.nome, p.hospital_id;


-- Promover alguém a administrador:
update public.profissionais p
set cargo = 'admin'
from auth.users u
where u.id = p.id
  and u.email = 'ana.souza@hospital.sp.gov.br'
returning p.nome, p.cargo;


-- ---------------------------------------------------------------------
-- Se o `update` devolver 0 linhas
--
-- Quer dizer que o perfil não existe — acontece quando o gatilho
-- `ao_criar_usuario` não pôde ser criado no schema.sql. Este comando
-- cria o perfil que está faltando para quem já tem acesso:
-- ---------------------------------------------------------------------
insert into public.profissionais (id, nome, cargo, registro, hospital_id)
select u.id,
       'Ana Beatriz Souza',
       'enfermeiro',
       'COREN-SP 123456',
       (select id from public.hospitais where nome = 'Hospital Municipal Santa Clara')
from auth.users u
where u.email = 'ana.souza@hospital.sp.gov.br'
on conflict (id) do update
  set nome        = excluded.nome,
      cargo       = excluded.cargo,
      registro    = excluded.registro,
      hospital_id = excluded.hospital_id
returning id, nome, cargo;
