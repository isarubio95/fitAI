-- Generado automaticamente por scripts/generar-sql-renombres.mjs
-- Marca aplicar_rename = si / 1 / true / x en el CSV
-- Si existe columna nombre_final, tiene prioridad sobre sugerencia_fitcron
-- REGLA: borrar = si tiene PRIORIDAD ABSOLUTA. Esas filas NO generan UPDATE
-- aunque también tengan aplicar_rename o nombre_final (se borran en borrar_tipos...).

begin;

-- Abdominales colgados -> Elevación de piernas estiradas Colgado
update public.tipo_ejercicio set nombre = 'Elevación de piernas estiradas Colgado' where id = '6d689f66-4199-496f-8037-2659187203d9';

-- Abductores en Máquina -> Aductor Externo en Máquina
update public.tipo_ejercicio set nombre = 'Aductor Externo en Máquina' where id = 'e9f2a1a7-2600-4dd3-954a-fb4bbc03cd80';

-- Aductores en Máquina -> Aductor Interno en Máquina
update public.tipo_ejercicio set nombre = 'Aductor Interno en Máquina' where id = '067a9e50-5881-43a7-840b-1e0fd77259f6';

-- Burpees -> Burpee
update public.tipo_ejercicio set nombre = 'Burpee' where id = '04624301-2724-454f-bd45-36694b610a54';

-- Crunch Abdominal -> Crunch Superior
update public.tipo_ejercicio set nombre = 'Crunch Superior' where id = '55b5e593-ff46-4fdd-b9c9-a995ed77f096';

-- Curl con Mancuernas Alterno -> Curl con giro Alterno con Mancuernas
update public.tipo_ejercicio set nombre = 'Curl con giro Alterno con Mancuernas' where id = '2db35072-604a-4460-a897-5daea114762a';

-- Curl Concentrado -> Curl Concentrado en Supinación con Mancuerna
update public.tipo_ejercicio set nombre = 'Curl Concentrado en Supinación con Mancuerna' where id = 'f5a1a20e-9cba-4a07-a116-642ce2bc55ae';

-- Curl de Bíceps con Barra (Z o Recta) -> Curl en Supinación con Barra
update public.tipo_ejercicio set nombre = 'Curl en Supinación con Barra' where id = '10b8ebaa-6e2c-434d-9b73-47236e2e888f';

-- Curl en Polea Baja -> Curl en Supinación en Polea Baja
update public.tipo_ejercicio set nombre = 'Curl en Supinación en Polea Baja' where id = '0c0f395a-5388-45d8-8092-10ef60fb6327';

-- Curl Femoral Sentado -> Curl Femoral Vertical en Máquina
update public.tipo_ejercicio set nombre = 'Curl Femoral Vertical en Máquina' where id = '1cd4eeae-2a7c-4ac2-bcbf-6ed6503eb023';

-- Curl Femoral Tumbado -> Curl Femoral Horizontal en Máquina
update public.tipo_ejercicio set nombre = 'Curl Femoral Horizontal en Máquina' where id = 'ed4b45b5-db3b-46f9-bdf5-d83f768c8130';

-- Curl Martillo -> Curl en Martillo Alterno con Mancuernas
update public.tipo_ejercicio set nombre = 'Curl en Martillo Alterno con Mancuernas' where id = '23ae5b03-03df-42fb-858f-63179032613b';

-- Curl Predicador (Banco Scott) -> Curl en Supinación en banco Scott con Barra
update public.tipo_ejercicio set nombre = 'Curl en Supinación en banco Scott con Barra' where id = '772dd831-9941-48e6-bf49-ac82206beddd';

-- Dominadas -> Dominada
update public.tipo_ejercicio set nombre = 'Dominada' where id = '64fbe25c-d93b-4894-9e12-5b6b036d2a11';

-- Dominadas Neutras -> Dominada Cerrada en Martillo
update public.tipo_ejercicio set nombre = 'Dominada Cerrada en Martillo' where id = 'c2e8875a-3bf5-46c4-acd3-f1519f0cd2f8';

-- Dominadas Pronas (Pull-ups) -> Dominada
update public.tipo_ejercicio set nombre = 'Dominada' where id = '3ed25bd6-9c91-4806-8c29-d9f6813b0eca';

-- Dominadas Supinas (Chin-ups) -> Dominada en Supinación
update public.tipo_ejercicio set nombre = 'Dominada en Supinación' where id = '085b592d-9c55-4ce5-88f6-67357a1f6016';

-- Elevación de Piernas Colgado -> Elevación de piernas estiradas Colgado
update public.tipo_ejercicio set nombre = 'Elevación de piernas estiradas Colgado' where id = '4d6b1c7a-f945-47e6-9644-1643649146c4';

-- Elevación de Talones de Pie -> Extensión de Gemelos de pie
update public.tipo_ejercicio set nombre = 'Extensión de Gemelos de pie' where id = '1ee56ec0-3801-4bed-84d0-40f248d8061c';

-- Elevación de Talones Sentado -> Extensión de Gemelos sentado en Máquina
update public.tipo_ejercicio set nombre = 'Extensión de Gemelos sentado en Máquina' where id = '60638100-57df-4d82-8cd0-1cde0295c334';

-- Elevaciones Frontales -> Elevaciones Frontales en Pronación con Mancuernas
update public.tipo_ejercicio set nombre = 'Elevaciones Frontales en Pronación con Mancuernas' where id = '4deb27ea-8968-4ebc-90a9-4a339d6ae0c1';

-- Elevaciones Laterales con Mancuernas -> Elevaciones Laterales Neutras con Mancuernas
update public.tipo_ejercicio set nombre = 'Elevaciones Laterales Neutras con Mancuernas' where id = '3e82bc5e-4a99-4f81-9622-3538c73503b2';

-- Elevaciones Laterales en Polea -> Elevación Lateral Aislada en Polea
update public.tipo_ejercicio set nombre = 'Elevación Lateral Aislada en Polea' where id = 'ea84da8d-625f-4de5-9eea-e53d16ed2eeb';

-- Encogimientos con Barra (Shrugs) -> Encogimientos Delanteros con Barra
update public.tipo_ejercicio set nombre = 'Encogimientos Delanteros con Barra' where id = '9824a189-0211-47da-b9a5-aef20ee06110';

-- Extensión de Cuádriceps -> Extensión de Cuádriceps en Máquina
update public.tipo_ejercicio set nombre = 'Extensión de Cuádriceps en Máquina' where id = '0b41030a-bfd2-455f-bd90-20785a13eb7e';

-- Extensión de Tríceps con Cuerda -> Extensión Vertical en Pronación en Polea Alta
update public.tipo_ejercicio set nombre = 'Extensión Vertical en Pronación en Polea Alta' where id = '1663f060-ba66-4429-9767-4e979bc981c2';

-- Extensión de Tríceps en Polea Alta -> Extensión Vertical en Pronación en Polea Alta
update public.tipo_ejercicio set nombre = 'Extensión Vertical en Pronación en Polea Alta' where id = '601ec6e9-86fe-407b-990f-efdb38563b18';

-- Face Pull -> Remo Superior con Cuerda en Polea
update public.tipo_ejercicio set nombre = 'Remo Superior con Cuerda en Polea' where id = 'f1256c90-4790-4026-9b51-6d7829d64a55';

-- Jalón al Pecho (Polea Alta) -> Jalón en Pronación en Polea Alta
update public.tipo_ejercicio set nombre = 'Jalón en Pronación en Polea Alta' where id = '9ff67679-3c8a-43f8-9249-85d759abba1e';

-- Leñador en Polea (Woodchopper) -> Inclinación diagonal en Polea
update public.tipo_ejercicio set nombre = 'Inclinación diagonal en Polea' where id = 'c2ef4934-c5a5-4ca1-8ba8-d80bd3b0e0af';

-- Máquina abs alta -> Crunch Superior Vertical en Máquina
update public.tipo_ejercicio set nombre = 'Crunch Superior Vertical en Máquina' where id = '3e1b6707-0b37-484d-b309-4ec4028f3f41';

-- Pájaros con Mancuernas -> Pájaros de pie con Mancuernas
update public.tipo_ejercicio set nombre = 'Pájaros de pie con Mancuernas' where id = 'c8e683b5-b160-4695-91bc-6f6392ab4152';

-- Patada de Glúteo en Polea -> Extensión de Glúteos en Polea
update public.tipo_ejercicio set nombre = 'Extensión de Glúteos en Polea' where id = '632afd42-2735-495c-b303-6520e76f5208';

-- Patada de Tríceps -> Patadas Traseras en Polea
update public.tipo_ejercicio set nombre = 'Patadas Traseras en Polea' where id = 'fa8b2383-0e9b-42de-9cb8-dfafaed8e898';

-- Peck Deck (Mariposa) -> Aperturas en Máquina
update public.tipo_ejercicio set nombre = 'Aperturas en Máquina' where id = '646054d3-2dde-4f30-929f-5191b02949aa';

-- Peso Muerto -> Peso Muerto con Barra
update public.tipo_ejercicio set nombre = 'Peso Muerto con Barra' where id = '622e8517-eee8-4acc-8e39-8488ef284c23';

-- Peso Muerto Convencional -> Peso Muerto con Barra
update public.tipo_ejercicio set nombre = 'Peso Muerto con Barra' where id = 'cf638b31-cc3e-460e-a6ef-2dd08d17ecdf';

-- Peso Muerto Rumano (RDL) -> Peso Muerto Rumano con Barra
update public.tipo_ejercicio set nombre = 'Peso Muerto Rumano con Barra' where id = 'cb6a0f24-92ef-4f86-a7fe-8dde45184ca0';

-- Peso Muerto Sumo -> Peso Muerto Sumo con Barra
update public.tipo_ejercicio set nombre = 'Peso Muerto Sumo con Barra' where id = '96c8936c-6135-4276-b366-5117aa842b1d';

-- Plancha Abdominal (Plank) -> Plancha
update public.tipo_ejercicio set nombre = 'Plancha' where id = '653649c6-1d0f-4555-a72c-c9a0eacc63ec';

-- Prensa de Piernas 45º -> Prensa Inclinada
update public.tipo_ejercicio set nombre = 'Prensa Inclinada' where id = '6c092127-16b2-4e12-a642-a1c23d2882c1';

-- Prensa de Piernas Horizontal -> Prensa Inclinada Cerrada
update public.tipo_ejercicio set nombre = 'Prensa Inclinada Cerrada' where id = '496c8f3e-a98a-433f-b390-0176387019a4';

-- Prensa de Piernas Vertical -> Prensa Inclinada
update public.tipo_ejercicio set nombre = 'Prensa Inclinada' where id = 'c2c74ef0-db31-44b9-87ed-ac5cc6c916da';

-- Prensa Hack -> Sentadilla Cerrada Inclinada en Máquina
update public.tipo_ejercicio set nombre = 'Sentadilla Cerrada Inclinada en Máquina' where id = 'f910acc9-8f80-4aee-9353-992ea63a405e';

-- Press Arnold -> Press Arnold con Mancuernas
update public.tipo_ejercicio set nombre = 'Press Arnold con Mancuernas' where id = '8ce36447-9eda-4c7b-a79c-406ff75315c1';

-- Press de Banca -> Press Banca con Barra
update public.tipo_ejercicio set nombre = 'Press Banca con Barra' where id = 'b1c5f17d-94bb-46ff-8ece-cc40be16c5ee';

-- Press de Banca Agarre Cerrado -> Press Banca Cerrado con Barra
update public.tipo_ejercicio set nombre = 'Press Banca Cerrado con Barra' where id = '1cbc3cd9-ed77-4b01-b3de-abc38cd67e30';

-- Press de Banca con Barra -> Press Banca con Barra
update public.tipo_ejercicio set nombre = 'Press Banca con Barra' where id = '0c6f3783-58e9-4536-b111-6af337117842';

-- Press de Banca con Mancuernas -> Press Banca con Mancuernas
update public.tipo_ejercicio set nombre = 'Press Banca con Mancuernas' where id = '6c592805-b4af-453b-b37b-2919c7289988';

-- Press Declinado -> Press Declinado con Barra
update public.tipo_ejercicio set nombre = 'Press Declinado con Barra' where id = '649a0be3-efa9-48c7-962f-19e226e39d01';

-- Press Inclinado con Mancuernas -> Press Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set nombre = 'Press Inclinado en Supinación con Mancuernas' where id = 'bff0c1a9-84fe-4210-ad5e-594789802cb5';

-- Press Militar -> Press Militar con Barra
update public.tipo_ejercicio set nombre = 'Press Militar con Barra' where id = 'f8cee9a3-5ce2-4109-a203-d7d7f133b2dc';

-- Press Militar con Mancuernas -> Press Militar Neutro con Mancuernas
update public.tipo_ejercicio set nombre = 'Press Militar Neutro con Mancuernas' where id = '872a6da6-c9c0-4a42-9d15-c35182faaedb';

-- Puente de Glúteo (Glute Bridge) -> Elevación de Cadera con flexión de rodillas v1
update public.tipo_ejercicio set nombre = 'Elevación de Cadera con flexión de rodillas v1' where id = 'b75c1c10-19b7-496c-bec8-4dd3bdc317ba';

-- Pull-over con Mancuerna -> Pullover con Mancuerna
update public.tipo_ejercicio set nombre = 'Pullover con Mancuerna' where id = '011e2f68-9f1e-4202-ac3b-13ddee6cbf6d';

-- Pull-over en Polea Alta -> Jalón Aislado en Polea Alta
update public.tipo_ejercicio set nombre = 'Jalón Aislado en Polea Alta' where id = '6edb782f-e45c-4d62-b9e9-fbecd77523d1';

-- Remo al Mentón (Upright Row) -> Remo al mentón con Barra
update public.tipo_ejercicio set nombre = 'Remo al mentón con Barra' where id = '2f0728ff-13fb-4dba-95a0-66abd09b7315';

-- Remo con Barra (Bent Over Row) -> Remo en Pronación con Barra
update public.tipo_ejercicio set nombre = 'Remo en Pronación con Barra' where id = '9c2ce62a-46d5-434b-85aa-048b34e6a293';

-- Remo con Mancuerna a una mano -> Remo Aislado con Mancuerna
update public.tipo_ejercicio set nombre = 'Remo Aislado con Mancuerna' where id = 'cf40077f-2234-49bf-b3cc-a49ce2454819';

-- Remo en Concept2 -> Máquina de Remo
update public.tipo_ejercicio set nombre = 'Máquina de Remo' where id = 'c76bbed5-a676-47a9-8c26-caecf7457e50';

-- Remo en Máquina T -> Remo en Barra T en Pronación
update public.tipo_ejercicio set nombre = 'Remo en Barra T en Pronación' where id = 'd713e14b-ec1f-4053-8da8-7812478a1d9d';

-- Remo Gironda (Polea Baja) -> Remo Horizontal Cerrado Neutro en Polea
update public.tipo_ejercicio set nombre = 'Remo Horizontal Cerrado Neutro en Polea' where id = 'fd7582f0-d923-4029-bb52-28ce80ff2cea';

-- Remo Pendlay -> Remo Inclinado en Pronación con Barra
update public.tipo_ejercicio set nombre = 'Remo Inclinado en Pronación con Barra' where id = '0b13c703-8746-4f28-b804-1dee7b8cc0cb';

-- Rompecráneos (Skullcrushers) -> Press Francés con Barra
update public.tipo_ejercicio set nombre = 'Press Francés con Barra' where id = '23ced254-68dd-42d4-a1fa-e9333c53707c';

-- Rueda Abdominal (Ab Wheel) -> Wheel Rollout de rodillas
update public.tipo_ejercicio set nombre = 'Wheel Rollout de rodillas' where id = '14362441-532d-4747-a299-a50f4833fa0a';

-- Saltar a la Comba -> Salto con Cuerda Normal
update public.tipo_ejercicio set nombre = 'Salto con Cuerda Normal' where id = '2aa7b386-1de4-4054-8ba6-d13d2e004827';

-- Sentadilla -> Sentadilla con Barra
update public.tipo_ejercicio set nombre = 'Sentadilla con Barra' where id = '82271a6c-aa53-43d4-870c-433a5f788957';

-- Sentadilla Búlgara -> Zancada Trasera con Mancuernas
update public.tipo_ejercicio set nombre = 'Zancada Trasera con Mancuernas' where id = 'ad86a555-48a4-4a8a-9fc6-27fd7b4d5428';

-- Sentadilla Goblet -> Sentadilla con Mancuernas
update public.tipo_ejercicio set nombre = 'Sentadilla con Mancuernas' where id = '21c2b024-500f-452c-a972-d9a87e0868b7';

-- Sentadilla Trasera (Back Squat) -> Sentadilla con Barra
update public.tipo_ejercicio set nombre = 'Sentadilla con Barra' where id = 'f751bdc8-3511-4857-b6b9-25068ead2aad';

-- Zancadas (Lunges) con Mancuernas -> Zancada Delantera con Mancuernas
update public.tipo_ejercicio set nombre = 'Zancada Delantera con Mancuernas' where id = '08c505d5-f012-4b63-982f-2043b689b8c6';

-- Validacion rapida
select id, nombre from public.tipo_ejercicio where id in (
  '6d689f66-4199-496f-8037-2659187203d9',
  'e9f2a1a7-2600-4dd3-954a-fb4bbc03cd80',
  '067a9e50-5881-43a7-840b-1e0fd77259f6',
  '04624301-2724-454f-bd45-36694b610a54',
  '55b5e593-ff46-4fdd-b9c9-a995ed77f096',
  '2db35072-604a-4460-a897-5daea114762a',
  'f5a1a20e-9cba-4a07-a116-642ce2bc55ae',
  '10b8ebaa-6e2c-434d-9b73-47236e2e888f',
  '0c0f395a-5388-45d8-8092-10ef60fb6327',
  '1cd4eeae-2a7c-4ac2-bcbf-6ed6503eb023',
  'ed4b45b5-db3b-46f9-bdf5-d83f768c8130',
  '23ae5b03-03df-42fb-858f-63179032613b',
  '772dd831-9941-48e6-bf49-ac82206beddd',
  '64fbe25c-d93b-4894-9e12-5b6b036d2a11',
  'c2e8875a-3bf5-46c4-acd3-f1519f0cd2f8',
  '3ed25bd6-9c91-4806-8c29-d9f6813b0eca',
  '085b592d-9c55-4ce5-88f6-67357a1f6016',
  '4d6b1c7a-f945-47e6-9644-1643649146c4',
  '1ee56ec0-3801-4bed-84d0-40f248d8061c',
  '60638100-57df-4d82-8cd0-1cde0295c334',
  '4deb27ea-8968-4ebc-90a9-4a339d6ae0c1',
  '3e82bc5e-4a99-4f81-9622-3538c73503b2',
  'ea84da8d-625f-4de5-9eea-e53d16ed2eeb',
  '9824a189-0211-47da-b9a5-aef20ee06110',
  '0b41030a-bfd2-455f-bd90-20785a13eb7e',
  '1663f060-ba66-4429-9767-4e979bc981c2',
  '601ec6e9-86fe-407b-990f-efdb38563b18',
  'f1256c90-4790-4026-9b51-6d7829d64a55',
  '9ff67679-3c8a-43f8-9249-85d759abba1e',
  'c2ef4934-c5a5-4ca1-8ba8-d80bd3b0e0af',
  '3e1b6707-0b37-484d-b309-4ec4028f3f41',
  'c8e683b5-b160-4695-91bc-6f6392ab4152',
  '632afd42-2735-495c-b303-6520e76f5208',
  'fa8b2383-0e9b-42de-9cb8-dfafaed8e898',
  '646054d3-2dde-4f30-929f-5191b02949aa',
  '622e8517-eee8-4acc-8e39-8488ef284c23',
  'cf638b31-cc3e-460e-a6ef-2dd08d17ecdf',
  'cb6a0f24-92ef-4f86-a7fe-8dde45184ca0',
  '96c8936c-6135-4276-b366-5117aa842b1d',
  '653649c6-1d0f-4555-a72c-c9a0eacc63ec',
  '6c092127-16b2-4e12-a642-a1c23d2882c1',
  '496c8f3e-a98a-433f-b390-0176387019a4',
  'c2c74ef0-db31-44b9-87ed-ac5cc6c916da',
  'f910acc9-8f80-4aee-9353-992ea63a405e',
  '8ce36447-9eda-4c7b-a79c-406ff75315c1',
  'b1c5f17d-94bb-46ff-8ece-cc40be16c5ee',
  '1cbc3cd9-ed77-4b01-b3de-abc38cd67e30',
  '0c6f3783-58e9-4536-b111-6af337117842',
  '6c592805-b4af-453b-b37b-2919c7289988',
  '649a0be3-efa9-48c7-962f-19e226e39d01',
  'bff0c1a9-84fe-4210-ad5e-594789802cb5',
  'f8cee9a3-5ce2-4109-a203-d7d7f133b2dc',
  '872a6da6-c9c0-4a42-9d15-c35182faaedb',
  'b75c1c10-19b7-496c-bec8-4dd3bdc317ba',
  '011e2f68-9f1e-4202-ac3b-13ddee6cbf6d',
  '6edb782f-e45c-4d62-b9e9-fbecd77523d1',
  '2f0728ff-13fb-4dba-95a0-66abd09b7315',
  '9c2ce62a-46d5-434b-85aa-048b34e6a293',
  'cf40077f-2234-49bf-b3cc-a49ce2454819',
  'c76bbed5-a676-47a9-8c26-caecf7457e50',
  'd713e14b-ec1f-4053-8da8-7812478a1d9d',
  'fd7582f0-d923-4029-bb52-28ce80ff2cea',
  '0b13c703-8746-4f28-b804-1dee7b8cc0cb',
  '23ced254-68dd-42d4-a1fa-e9333c53707c',
  '14362441-532d-4747-a299-a50f4833fa0a',
  '2aa7b386-1de4-4054-8ba6-d13d2e004827',
  '82271a6c-aa53-43d4-870c-433a5f788957',
  'ad86a555-48a4-4a8a-9fc6-27fd7b4d5428',
  '21c2b024-500f-452c-a972-d9a87e0868b7',
  'f751bdc8-3511-4857-b6b9-25068ead2aad',
  '08c505d5-f012-4b63-982f-2043b689b8c6'
);

commit;

