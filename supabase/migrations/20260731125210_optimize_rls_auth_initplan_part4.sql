-- =============================================================================
-- cardio_sesion_running / cycling / track / track_point
-- =============================================================================
DROP POLICY IF EXISTS cardio_sesion_running_select_visible_session ON public.cardio_sesion_running;
CREATE POLICY cardio_sesion_running_select_visible_session
  ON public.cardio_sesion_running FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_running.cardio_sesion_id
        AND (s.usuario_id = (select auth.uid()) OR s.es_publica = true)
    )
  );

DROP POLICY IF EXISTS cardio_sesion_running_insert_owner_session ON public.cardio_sesion_running;
CREATE POLICY cardio_sesion_running_insert_owner_session
  ON public.cardio_sesion_running FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_running.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_sesion_running_update_owner_session ON public.cardio_sesion_running;
CREATE POLICY cardio_sesion_running_update_owner_session
  ON public.cardio_sesion_running FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_running.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_running.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_sesion_running_delete_owner_session ON public.cardio_sesion_running;
CREATE POLICY cardio_sesion_running_delete_owner_session
  ON public.cardio_sesion_running FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_running.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_sesion_cycling_select_visible_session ON public.cardio_sesion_cycling;
CREATE POLICY cardio_sesion_cycling_select_visible_session
  ON public.cardio_sesion_cycling FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
        AND (s.usuario_id = (select auth.uid()) OR s.es_publica = true)
    )
  );

DROP POLICY IF EXISTS cardio_sesion_cycling_insert_owner_session ON public.cardio_sesion_cycling;
CREATE POLICY cardio_sesion_cycling_insert_owner_session
  ON public.cardio_sesion_cycling FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_sesion_cycling_update_owner_session ON public.cardio_sesion_cycling;
CREATE POLICY cardio_sesion_cycling_update_owner_session
  ON public.cardio_sesion_cycling FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_sesion_cycling_delete_owner_session ON public.cardio_sesion_cycling;
CREATE POLICY cardio_sesion_cycling_delete_owner_session
  ON public.cardio_sesion_cycling FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_track_select_visible_session ON public.cardio_track;
CREATE POLICY cardio_track_select_visible_session
  ON public.cardio_track FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_track.cardio_sesion_id
        AND (s.usuario_id = (select auth.uid()) OR s.es_publica = true)
    )
  );

DROP POLICY IF EXISTS cardio_track_insert_owner_session ON public.cardio_track;
CREATE POLICY cardio_track_insert_owner_session
  ON public.cardio_track FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_track.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_track_update_owner_session ON public.cardio_track;
CREATE POLICY cardio_track_update_owner_session
  ON public.cardio_track FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_track.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_track.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_track_delete_owner_session ON public.cardio_track;
CREATE POLICY cardio_track_delete_owner_session
  ON public.cardio_track FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion s
      WHERE s.id = cardio_track.cardio_sesion_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_track_point_select_visible_session ON public.cardio_track_point;
CREATE POLICY cardio_track_point_select_visible_session
  ON public.cardio_track_point FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.cardio_track t
      JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
      WHERE t.id = cardio_track_point.cardio_track_id
        AND (s.usuario_id = (select auth.uid()) OR s.es_publica = true)
    )
  );

DROP POLICY IF EXISTS cardio_track_point_insert_owner_session ON public.cardio_track_point;
CREATE POLICY cardio_track_point_insert_owner_session
  ON public.cardio_track_point FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.cardio_track t
      JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
      WHERE t.id = cardio_track_point.cardio_track_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_track_point_update_owner_session ON public.cardio_track_point;
CREATE POLICY cardio_track_point_update_owner_session
  ON public.cardio_track_point FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.cardio_track t
      JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
      WHERE t.id = cardio_track_point.cardio_track_id
        AND s.usuario_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.cardio_track t
      JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
      WHERE t.id = cardio_track_point.cardio_track_id
        AND s.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS cardio_track_point_delete_owner_session ON public.cardio_track_point;
CREATE POLICY cardio_track_point_delete_owner_session
  ON public.cardio_track_point FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.cardio_track t
      JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
      WHERE t.id = cardio_track_point.cardio_track_id
        AND s.usuario_id = (select auth.uid())
    )
  );

-- =============================================================================
-- storage: profile-avatars
-- =============================================================================
DROP POLICY IF EXISTS profile_avatars_insert_own ON storage.objects;
CREATE POLICY profile_avatars_insert_own
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = ((select auth.uid())::text)
  );

DROP POLICY IF EXISTS profile_avatars_update_own ON storage.objects;
CREATE POLICY profile_avatars_update_own
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = ((select auth.uid())::text)
  )
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = ((select auth.uid())::text)
  );

DROP POLICY IF EXISTS profile_avatars_delete_own ON storage.objects;
CREATE POLICY profile_avatars_delete_own
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = ((select auth.uid())::text)
  );
