-- GIFs de demos de ejercicios (lectura pública; escritura solo service role)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ejercicios',
  'ejercicios',
  true,
  5242880,
  ARRAY['image/gif', 'image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS ejercicios_public_select ON storage.objects;
CREATE POLICY ejercicios_public_select
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ejercicios');
