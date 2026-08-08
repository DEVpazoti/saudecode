-- =====================================================================
-- SaudeCode — dados de demonstração
-- Rode DEPOIS de schema.sql. Pode rodar mais de uma vez sem duplicar.
-- Pessoas e históricos são fictícios.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Unidades
-- ---------------------------------------------------------------------
insert into public.hospitais (id, nome, cnes, municipio, uf) values
  ('11111111-1111-4111-8111-111111111101', 'Hospital Municipal Santa Clara',      '2077485', 'São Paulo',      'SP'),
  ('11111111-1111-4111-8111-111111111102', 'UPA 24h Zona Leste',                  '6188064', 'São Paulo',      'SP'),
  ('11111111-1111-4111-8111-111111111103', 'Pronto-Socorro Central de Campinas',  '2079941', 'Campinas',       'SP'),
  ('11111111-1111-4111-8111-111111111104', 'Consultório na Rua — Distrito Sé',    '7690551', 'São Paulo',      'SP')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Pacientes
-- ---------------------------------------------------------------------
insert into public.pacientes (
  id, codigo, nome, apelido, sem_documento, cns, data_nascimento, idade_estimada,
  sexo, altura_cm, peso_kg, tipo_sanguineo, sinais_particulares, local_permanencia,
  contato_nome, contato_telefone, contato_vinculo, observacoes, consentimento,
  hospital_cadastro_id, criado_em
) values
  ('22222222-2222-4222-8222-222222222201', 'SC-4KQ7-M2XB',
   'Antônio Ferreira da Silva', 'Toninho', true, '702 4083 1927 4310', '1971-03-14', null,
   'masculino', 172, 61.40, 'O+',
   'Cicatriz de 8 cm no antebraço esquerdo. Tatuagem de âncora no ombro direito. Falta o incisivo superior direito.',
   'Praça da Sé e arredores, dorme sob a marquise da Rua Boa Vista.',
   'Marli Ferreira', '(11) 98812-4477', 'Irmã',
   'Fala pouco e com dificuldade após o AVC de 2022. Entende bem o que é dito. Responde melhor a perguntas de sim ou não.',
   true, '11111111-1111-4111-8111-111111111101', now() - interval '19 months'),

  ('22222222-2222-4222-8222-222222222202', 'SC-9WTB-3H6P',
   'Maria de Lourdes Andrade', 'Lurdinha', true, null, null, 58,
   'feminino', 158, 49.00, 'A+',
   'Queimadura antiga na mão direita. Usa lenço azul na cabeça.',
   'Entorno da Estação da Luz. Frequenta o albergue da Rua Prates.',
   null, null, null,
   'Diabética. Já chegou duas vezes em hipoglicemia grave. Não come com regularidade.',
   true, '11111111-1111-4111-8111-111111111102', now() - interval '14 months'),

  ('22222222-2222-4222-8222-222222222203', 'SC-2FDN-8QJ5',
   'José Carlos Pereira', 'Zé do Rádio', true, null, '1985-09-02', null,
   'masculino', 180, 72.80, 'B+',
   'Tatuagem "MARIA" no antebraço direito. Cicatriz cirúrgica vertical no abdome.',
   'Viaduto do Chá. Circula pelo centro durante o dia.',
   null, null, null,
   'Carrega sempre um rádio de pilha. Fica agitado se separado dos pertences — deixar a mochila à vista reduz muito a agitação.',
   true, '11111111-1111-4111-8111-111111111101', now() - interval '11 months'),

  ('22222222-2222-4222-8222-222222222204', 'SC-6PLR-5V1K',
   'Sebastião Rocha', 'Tião', true, '898 0012 5544 3321', null, 47,
   'masculino', 168, 55.20, 'O-',
   'Amputação parcial do 2º dedo da mão esquerda. Barba longa grisalha.',
   'Marginal Tietê, altura da Ponte das Bandeiras.',
   null, null, null,
   'Tuberculose em tratamento. Adesão irregular ao esquema — confirmar sempre a última dose tomada.',
   true, '11111111-1111-4111-8111-111111111103', now() - interval '8 months'),

  ('22222222-2222-4222-8222-222222222205', 'SC-8CJM-7YQ4',
   'Rosa Maria Batista', 'Rosa', true, null, null, 34,
   'feminino', 163, 58.90, 'AB+',
   'Tatuagem de estrela atrás da orelha esquerda.',
   'Região da Cracolândia. Acompanhada por equipe do Consultório na Rua.',
   'Equipe CnR Sé', '(11) 3397-8100', 'Equipe de referência',
   'Gestante na última avaliação (cerca de 22 semanas). Encaminhada ao pré-natal da UBS Sé.',
   true, '11111111-1111-4111-8111-111111111104', now() - interval '5 months'),

  ('22222222-2222-4222-8222-222222222206', 'SC-3NHX-9B2T',
   'Paulo Roberto Nunes', 'Paulinho', true, null, '1990-12-21', null,
   'masculino', 175, 64.00, 'desconhecido',
   'Cicatriz na sobrancelha esquerda. Usa boné vermelho.',
   'Largo do Arouche.',
   null, null, null,
   'Primeiro atendimento registrado na rede. Cadastro ainda incompleto.',
   false, '11111111-1111-4111-8111-111111111102', now() - interval '9 days')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Alergias
-- ---------------------------------------------------------------------
insert into public.alergias (paciente_id, agente, tipo, gravidade, reacao)
select * from (values
  ('22222222-2222-4222-8222-222222222201'::uuid, 'Dipirona',      'medicamento', 'grave',       'Edema de face e urticária generalizada'),
  ('22222222-2222-4222-8222-222222222202'::uuid, 'Penicilina',    'medicamento', 'anafilatica', 'Choque anafilático em 2019, precisou de adrenalina'),
  ('22222222-2222-4222-8222-222222222204'::uuid, 'Sulfa',         'medicamento', 'moderada',    'Rash cutâneo extenso'),
  ('22222222-2222-4222-8222-222222222205'::uuid, 'Látex',         'outro',       'moderada',    'Dermatite de contato')
) as v(paciente_id, agente, tipo, gravidade, reacao)
where not exists (select 1 from public.alergias a where a.paciente_id = v.paciente_id and a.agente = v.agente);

-- ---------------------------------------------------------------------
-- Condições
-- ---------------------------------------------------------------------
insert into public.condicoes (paciente_id, nome, cid10, tipo, status, desde, observacao)
select * from (values
  ('22222222-2222-4222-8222-222222222201'::uuid, 'Hipertensão arterial sistêmica', 'I10',   'cronica',             'ativa',      '2015-01-01'::date, 'Sem controle regular'),
  ('22222222-2222-4222-8222-222222222201'::uuid, 'Sequela de AVC isquêmico',       'I69.3', 'cronica',             'ativa',      '2022-06-10'::date, 'Afasia de expressão e hemiparesia leve à direita'),
  ('22222222-2222-4222-8222-222222222201'::uuid, 'Transtorno por uso de álcool',   'F10.2', 'dependencia_quimica', 'ativa',      '2010-01-01'::date, 'Uso diário relatado'),
  ('22222222-2222-4222-8222-222222222202'::uuid, 'Diabetes mellitus tipo 2',       'E11',   'cronica',             'ativa',      '2012-01-01'::date, 'Em uso de insulina NPH'),
  ('22222222-2222-4222-8222-222222222202'::uuid, 'Catarata bilateral',             'H25',   'cronica',             'ativa',      '2021-01-01'::date, 'Aguarda cirurgia pelo SUS'),
  ('22222222-2222-4222-8222-222222222203'::uuid, 'Esquizofrenia',                  'F20',   'saude_mental',        'controlada', '2008-01-01'::date, 'Estável com haloperidol depot'),
  ('22222222-2222-4222-8222-222222222203'::uuid, 'Epilepsia',                      'G40',   'cronica',             'controlada', '2016-01-01'::date, 'Última crise há cerca de 14 meses'),
  ('22222222-2222-4222-8222-222222222204'::uuid, 'Tuberculose pulmonar',           'A15',   'transmissivel',       'ativa',      '2025-11-03'::date, 'Esquema RIPE, 4º mês, adesão irregular'),
  ('22222222-2222-4222-8222-222222222204'::uuid, 'HIV',                            'B24',   'transmissivel',       'controlada', '2018-01-01'::date, 'TARV em uso, carga viral indetectável na última coleta'),
  ('22222222-2222-4222-8222-222222222205'::uuid, 'Transtorno por uso de cocaína',  'F14.2', 'dependencia_quimica', 'ativa',      '2019-01-01'::date, 'Acompanhamento no CAPS AD II Sé'),
  ('22222222-2222-4222-8222-222222222205'::uuid, 'Anemia ferropriva',              'D50',   'cronica',             'ativa',      '2026-02-01'::date, 'Hb 9,1 na última coleta')
) as v(paciente_id, nome, cid10, tipo, status, desde, observacao)
where not exists (select 1 from public.condicoes c where c.paciente_id = v.paciente_id and c.nome = v.nome);

-- ---------------------------------------------------------------------
-- Medicamentos
-- ---------------------------------------------------------------------
insert into public.medicamentos (paciente_id, nome, dosagem, frequencia, via, em_uso, inicio)
select * from (values
  ('22222222-2222-4222-8222-222222222201'::uuid, 'Losartana',     '50 mg',   '12/12h',       'Oral',          true,  '2015-02-01'::date),
  ('22222222-2222-4222-8222-222222222201'::uuid, 'AAS',           '100 mg',  '1x ao dia',    'Oral',          true,  '2022-07-01'::date),
  ('22222222-2222-4222-8222-222222222202'::uuid, 'Insulina NPH',  '20 UI',   'Manhã e noite','Subcutânea',    true,  '2013-05-01'::date),
  ('22222222-2222-4222-8222-222222222202'::uuid, 'Metformina',    '850 mg',  '2x ao dia',    'Oral',          true,  '2012-08-01'::date),
  ('22222222-2222-4222-8222-222222222203'::uuid, 'Haloperidol decanoato', '50 mg', 'Mensal', 'Intramuscular', true,  '2009-01-01'::date),
  ('22222222-2222-4222-8222-222222222203'::uuid, 'Carbamazepina', '200 mg',  '12/12h',       'Oral',          true,  '2016-04-01'::date),
  ('22222222-2222-4222-8222-222222222204'::uuid, 'Esquema RIPE',  '4 comp.', '1x ao dia em jejum', 'Oral',    true,  '2025-11-03'::date),
  ('22222222-2222-4222-8222-222222222204'::uuid, 'Dolutegravir',  '50 mg',   '1x ao dia',    'Oral',          true,  '2018-06-01'::date),
  ('22222222-2222-4222-8222-222222222205'::uuid, 'Sulfato ferroso','40 mg',  '1x ao dia',    'Oral',          true,  '2026-02-10'::date),
  ('22222222-2222-4222-8222-222222222205'::uuid, 'Ácido fólico',  '5 mg',    '1x ao dia',    'Oral',          true,  '2026-01-20'::date)
) as v(paciente_id, nome, dosagem, frequencia, via, em_uso, inicio)
where not exists (select 1 from public.medicamentos m where m.paciente_id = v.paciente_id and m.nome = v.nome);

-- ---------------------------------------------------------------------
-- Cirurgias
-- ---------------------------------------------------------------------
insert into public.cirurgias (paciente_id, procedimento, data, local, complicacoes)
select * from (values
  ('22222222-2222-4222-8222-222222222201'::uuid, 'Osteossíntese de fêmur esquerdo', '2019-08-12'::date, 'Hospital Municipal Santa Clara', null),
  ('22222222-2222-4222-8222-222222222202'::uuid, 'Colecistectomia',                 '2017-03-22'::date, 'Hospital das Clínicas',          null),
  ('22222222-2222-4222-8222-222222222203'::uuid, 'Laparotomia exploradora por ferimento por arma branca', '2014-11-05'::date, 'Pronto-Socorro Central de Campinas', 'Infecção de ferida operatória'),
  ('22222222-2222-4222-8222-222222222204'::uuid, 'Amputação parcial de 2º quirodáctilo esquerdo', '2021-01-30'::date, 'UPA 24h Zona Leste', null)
) as v(paciente_id, procedimento, data, local, complicacoes)
where not exists (select 1 from public.cirurgias c where c.paciente_id = v.paciente_id and c.procedimento = v.procedimento);

-- ---------------------------------------------------------------------
-- Vacinas
-- ---------------------------------------------------------------------
insert into public.vacinas (paciente_id, vacina, dose, data)
select * from (values
  ('22222222-2222-4222-8222-222222222201'::uuid, 'Antitetânica (dT)', 'Reforço',  '2023-04-18'::date),
  ('22222222-2222-4222-8222-222222222201'::uuid, 'Influenza',         'Anual',    '2026-04-02'::date),
  ('22222222-2222-4222-8222-222222222202'::uuid, 'Influenza',         'Anual',    '2026-04-11'::date),
  ('22222222-2222-4222-8222-222222222204'::uuid, 'Hepatite B',        '3ª dose',  '2019-09-14'::date),
  ('22222222-2222-4222-8222-222222222205'::uuid, 'Antitetânica (dT)', '2ª dose',  '2026-03-05'::date)
) as v(paciente_id, vacina, dose, data)
where not exists (select 1 from public.vacinas x where x.paciente_id = v.paciente_id and x.vacina = v.vacina and x.data = v.data);

-- ---------------------------------------------------------------------
-- Alertas fixados manualmente
-- ---------------------------------------------------------------------
insert into public.alertas (paciente_id, titulo, descricao, severidade)
select * from (values
  ('22222222-2222-4222-8222-222222222201'::uuid, 'Dificuldade de fala por afasia',
   'Entende o que é dito, mas não consegue formular frases. Use perguntas de sim ou não e dê tempo para responder.', 'atencao'),
  ('22222222-2222-4222-8222-222222222203'::uuid, 'Agitação ao ser separado dos pertences',
   'Manter a mochila e o rádio à vista durante todo o atendimento. Evita contenção na maioria das vezes.', 'atencao'),
  ('22222222-2222-4222-8222-222222222204'::uuid, 'Precaução para aerossóis',
   'Tuberculose pulmonar em tratamento. Máscara N95 e sala com ventilação adequada.', 'critico'),
  ('22222222-2222-4222-8222-222222222205'::uuid, 'Gestante',
   'Cerca de 22 semanas na última avaliação. Checar idade gestacional antes de qualquer medicação ou exame de imagem.', 'critico')
) as v(paciente_id, titulo, descricao, severidade)
where not exists (select 1 from public.alertas a where a.paciente_id = v.paciente_id and a.titulo = v.titulo);

-- ---------------------------------------------------------------------
-- Atendimentos
-- ---------------------------------------------------------------------
insert into public.atendimentos (
  paciente_id, hospital_id, data_hora, tipo, classificacao_risco, queixa,
  pressao_sistolica, pressao_diastolica, frequencia_cardiaca, temperatura, saturacao, glicemia,
  sob_efeito_alcool, sob_efeito_substancias, substancias, diagnostico, cid10, conduta, desfecho, encaminhamento
)
select * from (values
  -- Antônio — recorrência de embriaguez, o padrão que o sistema precisa destacar
  ('22222222-2222-4222-8222-222222222201'::uuid, '11111111-1111-4111-8111-111111111101'::uuid, now() - interval '11 months', 'emergencia', 'amarelo',
   'Trazido pelo SAMU após queda na via', 160, 100, 104, 36.2, 95, 88, true, false, 'Álcool',
   'Traumatismo craniano leve. Intoxicação alcoólica aguda.', 'S06.0', 'Observação por 12h, TC de crânio sem alterações.', 'alta', 'CAPS AD II Sé'),
  ('22222222-2222-4222-8222-222222222201'::uuid, '11111111-1111-4111-8111-111111111102'::uuid, now() - interval '8 months', 'emergencia', 'laranja',
   'Encontrado desacordado em via pública', 150, 95, 112, 35.8, 93, 71, true, false, 'Álcool',
   'Intoxicação alcoólica aguda. Hipoglicemia.', 'F10.0', 'Glicose hipertônica EV, tiamina, hidratação.', 'alta', null),
  ('22222222-2222-4222-8222-222222222201'::uuid, '11111111-1111-4111-8111-111111111101'::uuid, now() - interval '5 months', 'emergencia', 'amarelo',
   'Ferimento corto-contuso em couro cabeludo', 155, 92, 96, 36.5, 96, null, true, false, 'Álcool',
   'Ferimento corto-contuso. Intoxicação alcoólica.', 'S01.0', 'Sutura com 6 pontos. Antitetânica em dia.', 'alta', null),
  ('22222222-2222-4222-8222-222222222201'::uuid, '11111111-1111-4111-8111-111111111102'::uuid, now() - interval '2 months', 'emergencia', 'amarelo',
   'Vômitos e tremor de extremidades', 170, 105, 108, 36.9, 95, 79, true, false, 'Álcool',
   'Síndrome de abstinência alcoólica.', 'F10.3', 'Diazepam, tiamina, hidratação. Observação 24h.', 'encaminhamento', 'CAPS AD II Sé'),
  ('22222222-2222-4222-8222-222222222201'::uuid, '11111111-1111-4111-8111-111111111101'::uuid, now() - interval '16 days', 'consulta', 'verde',
   'Retorno para avaliação de pressão arterial', 158, 96, 84, 36.4, 97, 102, false, false, null,
   'Hipertensão sem controle adequado.', 'I10', 'Reforçada orientação. Losartana mantida.', 'alta', 'UBS Sé'),

  -- Maria de Lourdes — hipoglicemias de repetição
  ('22222222-2222-4222-8222-222222222202'::uuid, '11111111-1111-4111-8111-111111111102'::uuid, now() - interval '7 months', 'emergencia', 'laranja',
   'Confusão mental e sudorese', 110, 70, 98, 36.0, 97, 38, false, false, null,
   'Hipoglicemia grave.', 'E16.2', 'Glicose 50% EV. Melhora do nível de consciência em 10 min.', 'alta', null),
  ('22222222-2222-4222-8222-222222222202'::uuid, '11111111-1111-4111-8111-111111111101'::uuid, now() - interval '3 months', 'emergencia', 'laranja',
   'Encontrada torporosa no albergue', 105, 65, 92, 35.9, 96, 44, false, false, null,
   'Hipoglicemia grave. Dose de insulina sem refeição correspondente.', 'E16.2', 'Glicose 50% EV. Ajuste do esquema de insulina.', 'encaminhamento', 'UBS Sé'),
  ('22222222-2222-4222-8222-222222222202'::uuid, '11111111-1111-4111-8111-111111111102'::uuid, now() - interval '21 days', 'curativo', 'verde',
   'Úlcera em maléolo direito', 130, 80, 78, 36.3, 98, 187, false, false, null,
   'Úlcera de perna em pé diabético, sem sinais de infecção.', 'E11.6', 'Curativo com hidrofibra. Retorno em 3 dias.', 'alta', null),

  -- José Carlos
  ('22222222-2222-4222-8222-222222222203'::uuid, '11111111-1111-4111-8111-111111111101'::uuid, now() - interval '6 months', 'saude_mental', 'amarelo',
   'Agitação psicomotora em via pública', 140, 85, 110, 36.6, 97, null, false, false, null,
   'Surto psicótico. Interrupção da medicação depot.', 'F20', 'Haloperidol IM. Contato com CAPS de referência.', 'encaminhamento', 'CAPS II Sé'),
  ('22222222-2222-4222-8222-222222222203'::uuid, '11111111-1111-4111-8111-111111111103'::uuid, now() - interval '14 months', 'emergencia', 'laranja',
   'Crise convulsiva presenciada por transeuntes', 135, 82, 96, 37.0, 96, 91, false, false, null,
   'Crise tônico-clônica generalizada.', 'G40.9', 'Diazepam EV. Nível sérico de carbamazepina abaixo do terapêutico.', 'alta', null),
  ('22222222-2222-4222-8222-222222222203'::uuid, '11111111-1111-4111-8111-111111111101'::uuid, now() - interval '27 days', 'consulta', 'verde',
   'Aplicação de depot mensal', 128, 78, 76, 36.2, 98, null, false, false, null,
   'Esquizofrenia estável.', 'F20', 'Haloperidol decanoato 50 mg IM aplicado.', 'alta', null),

  -- Sebastião
  ('22222222-2222-4222-8222-222222222204'::uuid, '11111111-1111-4111-8111-111111111103'::uuid, now() - interval '9 months', 'emergencia', 'laranja',
   'Tosse com sangue há duas semanas', 120, 75, 102, 38.1, 92, null, false, false, null,
   'Tuberculose pulmonar bacilífera.', 'A15.0', 'Baciloscopia positiva. Esquema RIPE iniciado. Notificação compulsória feita.', 'internacao', null),
  ('22222222-2222-4222-8222-222222222204'::uuid, '11111111-1111-4111-8111-111111111104'::uuid, now() - interval '2 months', 'busca_ativa', 'verde',
   'Busca ativa por abandono de tratamento', 118, 72, 84, 36.4, 96, null, false, true, 'Álcool e crack',
   'Tuberculose em tratamento, adesão irregular.', 'A15.0', 'Tratamento diretamente observado reestabelecido.', 'encaminhamento', 'UBS Sé — TDO'),
  ('22222222-2222-4222-8222-222222222204'::uuid, '11111111-1111-4111-8111-111111111103'::uuid, now() - interval '12 days', 'consulta', 'verde',
   'Retorno de tratamento', 122, 76, 80, 36.1, 97, null, false, false, null,
   'Tuberculose em tratamento, 4º mês.', 'A15.0', 'Baciloscopia de controle negativa. Tratamento mantido.', 'alta', null),

  -- Rosa Maria
  ('22222222-2222-4222-8222-222222222205'::uuid, '11111111-1111-4111-8111-111111111104'::uuid, now() - interval '4 months', 'busca_ativa', 'verde',
   'Avaliação em campo pela equipe de rua', 108, 68, 88, 36.5, 98, null, false, true, 'Crack',
   'Uso de substâncias. Suspeita de gestação.', 'F14.2', 'Teste rápido de gravidez positivo. Encaminhada ao pré-natal.', 'encaminhamento', 'UBS Sé — pré-natal'),
  ('22222222-2222-4222-8222-222222222205'::uuid, '11111111-1111-4111-8111-111111111102'::uuid, now() - interval '6 weeks', 'consulta', 'verde',
   'Primeira consulta de pré-natal na rede', 102, 64, 94, 36.3, 98, null, false, false, null,
   'Gestação de aproximadamente 16 semanas. Anemia.', 'O26', 'Sulfato ferroso e ácido fólico iniciados. Ultrassom solicitado.', 'alta', 'UBS Sé'),
  ('22222222-2222-4222-8222-222222222205'::uuid, '11111111-1111-4111-8111-111111111101'::uuid, now() - interval '5 days', 'emergencia', 'amarelo',
   'Dor abdominal e tontura', 98, 60, 106, 36.7, 97, null, false, false, null,
   'Gestação de 22 semanas. Anemia sintomática, sem sangramento.', 'O99.0', 'Hidratação. Hb 9,1. Mantido sulfato ferroso. Orientado retorno em 7 dias.', 'alta', 'UBS Sé — pré-natal'),

  -- Paulo Roberto — cadastro recente
  ('22222222-2222-4222-8222-222222222206'::uuid, '11111111-1111-4111-8111-111111111102'::uuid, now() - interval '9 days', 'emergencia', 'verde',
   'Dor no pé direito após pisar em objeto cortante', 124, 78, 82, 36.4, 98, null, false, false, null,
   'Ferimento perfurante em planta do pé.', 'S91.3', 'Limpeza, curativo e antitetânica. Primeiro cadastro no SaudeCode.', 'alta', null)
) as v(paciente_id, hospital_id, data_hora, tipo, classificacao_risco, queixa,
       pressao_sistolica, pressao_diastolica, frequencia_cardiaca, temperatura, saturacao, glicemia,
       sob_efeito_alcool, sob_efeito_substancias, substancias, diagnostico, cid10, conduta, desfecho, encaminhamento)
where not exists (
  select 1 from public.atendimentos a
  where a.paciente_id = v.paciente_id and a.queixa = v.queixa
);
