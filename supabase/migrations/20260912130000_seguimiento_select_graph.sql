-- El drawer de perfil (y las listas de seguidores/seguidos) necesita leer el
-- grafo social de cualquier usuario, no solo las filas donde el viewer es parte.
-- Insert/delete siguen limitados al propio seguidor.

DROP POLICY IF EXISTS seguimiento_select_by_follower ON public.seguimiento;
DROP POLICY IF EXISTS seguimiento_select_graph ON public.seguimiento;

CREATE POLICY seguimiento_select_graph
  ON public.seguimiento FOR SELECT TO authenticated
  USING (true);
