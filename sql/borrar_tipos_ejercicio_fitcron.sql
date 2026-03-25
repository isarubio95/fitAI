-- Generado automaticamente por scripts/generar-sql-borrar-tipos-ejercicio.mjs
-- Filas con borrar = si / 1 / true / x (sin excepción: también si tienen aplicar_rename).
-- Fuente: sql/ejercicios_no_coinciden_con_sugerencia.csv
-- Orden: serie -> ejercicio -> rutina_ejercicio -> tipo_ejercicio

begin;

-- borrar tipo_ejercicio: Carrera 10 k (b13d57fc-c515-4678-b0a6-2a22ba1387eb)
-- borrar tipo_ejercicio: Clean & Jerk (Dos Tiempos) (308982d1-11b8-4815-92f7-2b35875719eb)
-- borrar tipo_ejercicio: Hells touch (0a05b7de-6655-449c-84e4-6f602b283d70)
-- borrar tipo_ejercicio: Kettlebell Swing (ec944d11-b3fb-49a8-a365-7f0812deb0ce)
-- borrar tipo_ejercicio: Prensa de Piernas Unilateral (9fcdb46e-706b-47e9-8c49-1aa3ce06863e)
-- borrar tipo_ejercicio: Press de Banca en Multipower (Smith) (914df4f0-f8b3-4b09-9463-a0c6cdf915ef)
-- borrar tipo_ejercicio: Rack Pulls (d6e5f608-a65f-4903-ab15-fe7de700a729)
-- borrar tipo_ejercicio: Salto al Cajón (Box Jump) (17545867-9a73-4845-b4f3-3be67e3dac08)
-- borrar tipo_ejercicio: Sentadilla Frontal (3efd1dcc-bd9b-4c57-82c6-f801e0bd4e1d)
-- borrar tipo_ejercicio: Snatch (Arrancada) (52b39d8a-9d3f-488b-a938-b98e6ab565bc)
-- borrar tipo_ejercicio: Vacuum Abdominal (38abd934-e35c-4d76-9687-e1254994bb3f)

delete from public.serie
where ejercicio_id in (
  select id from public.ejercicio
  where tipo_ejercicio_id in (
    'b13d57fc-c515-4678-b0a6-2a22ba1387eb',
  '308982d1-11b8-4815-92f7-2b35875719eb',
  '0a05b7de-6655-449c-84e4-6f602b283d70',
  'ec944d11-b3fb-49a8-a365-7f0812deb0ce',
  '9fcdb46e-706b-47e9-8c49-1aa3ce06863e',
  '914df4f0-f8b3-4b09-9463-a0c6cdf915ef',
  'd6e5f608-a65f-4903-ab15-fe7de700a729',
  '17545867-9a73-4845-b4f3-3be67e3dac08',
  '3efd1dcc-bd9b-4c57-82c6-f801e0bd4e1d',
  '52b39d8a-9d3f-488b-a938-b98e6ab565bc',
  '38abd934-e35c-4d76-9687-e1254994bb3f'
  )
);

delete from public.ejercicio
where tipo_ejercicio_id in (
  'b13d57fc-c515-4678-b0a6-2a22ba1387eb',
  '308982d1-11b8-4815-92f7-2b35875719eb',
  '0a05b7de-6655-449c-84e4-6f602b283d70',
  'ec944d11-b3fb-49a8-a365-7f0812deb0ce',
  '9fcdb46e-706b-47e9-8c49-1aa3ce06863e',
  '914df4f0-f8b3-4b09-9463-a0c6cdf915ef',
  'd6e5f608-a65f-4903-ab15-fe7de700a729',
  '17545867-9a73-4845-b4f3-3be67e3dac08',
  '3efd1dcc-bd9b-4c57-82c6-f801e0bd4e1d',
  '52b39d8a-9d3f-488b-a938-b98e6ab565bc',
  '38abd934-e35c-4d76-9687-e1254994bb3f'
);

delete from public.rutina_ejercicio
where tipo_ejercicio_id in (
  'b13d57fc-c515-4678-b0a6-2a22ba1387eb',
  '308982d1-11b8-4815-92f7-2b35875719eb',
  '0a05b7de-6655-449c-84e4-6f602b283d70',
  'ec944d11-b3fb-49a8-a365-7f0812deb0ce',
  '9fcdb46e-706b-47e9-8c49-1aa3ce06863e',
  '914df4f0-f8b3-4b09-9463-a0c6cdf915ef',
  'd6e5f608-a65f-4903-ab15-fe7de700a729',
  '17545867-9a73-4845-b4f3-3be67e3dac08',
  '3efd1dcc-bd9b-4c57-82c6-f801e0bd4e1d',
  '52b39d8a-9d3f-488b-a938-b98e6ab565bc',
  '38abd934-e35c-4d76-9687-e1254994bb3f'
);

delete from public.tipo_ejercicio
where id in (
  'b13d57fc-c515-4678-b0a6-2a22ba1387eb',
  '308982d1-11b8-4815-92f7-2b35875719eb',
  '0a05b7de-6655-449c-84e4-6f602b283d70',
  'ec944d11-b3fb-49a8-a365-7f0812deb0ce',
  '9fcdb46e-706b-47e9-8c49-1aa3ce06863e',
  '914df4f0-f8b3-4b09-9463-a0c6cdf915ef',
  'd6e5f608-a65f-4903-ab15-fe7de700a729',
  '17545867-9a73-4845-b4f3-3be67e3dac08',
  '3efd1dcc-bd9b-4c57-82c6-f801e0bd4e1d',
  '52b39d8a-9d3f-488b-a938-b98e6ab565bc',
  '38abd934-e35c-4d76-9687-e1254994bb3f'
);

commit;

