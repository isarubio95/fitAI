-- Arreglar gif_url locales usando aliases de nombre
-- Fuente: sql/ejercicios.csv (gif_url) + comprobación física en public/ejercicios
begin;
-- csv (alias): Air Bike (Assault Bike)
update public.tipo_ejercicio set gif_url = '/ejercicios/38931301-Assault-Bike-Run_Cardio_720.gif' where id = '2264e45d-d496-4902-a9b8-e42eaff5f5d0';
-- csv (alias): Aperturas con Mancuernas (Flyes)
update public.tipo_ejercicio set gif_url = '/ejercicios/03081301-Dumbbell-Fly_Chest-FIX_720.gif' where id = '3bd8696f-fba7-4500-a2d7-e10bc6fe5c67';
-- csv (alias): Cruce de Poleas (Alto a Bajo)
update public.tipo_ejercicio set gif_url = '/ejercicios/01881301-Cable-Middle-Fly_Chest_720.gif' where id = '85368ee3-2fc1-46b1-9188-800358ebd938';
-- csv (alias): Cruce de Poleas (Bajo a Alto)
update public.tipo_ejercicio set gif_url = '/ejercicios/01881301-Cable-Middle-Fly_Chest_720.gif' where id = '85074f0b-d739-458f-b5fd-0a24bc36dc64';
-- csv (alias): Flexiones (Push-ups)
update public.tipo_ejercicio set gif_url = '/ejercicios/06621301-Push-up-m_Chest-FIX_720.gif' where id = '22368eee-320f-4198-8e54-7b625a55260d';
-- csv (alias): Fondos en Paralelas (Dips)
update public.tipo_ejercicio set gif_url = '/ejercicios/02511301-Chest-Dip_Chest_720.gif' where id = 'a4a2782a-d597-4ea2-a0f1-17f68247835b';
-- csv (alias): Fondos entre Bancos
update public.tipo_ejercicio set gif_url = '/ejercicios/08121301-Triceps-Dip-bench-leg_Upper-Arms_720.gif' where id = 'e842fea7-9c4a-40e9-aaa3-5af1c42f4c81';
-- csv (alias): Hiperextensiones (Lumbares)
update public.tipo_ejercicio set gif_url = '/ejercicios/18601301-Hyperextension-VERSION-2_Hips_720.gif' where id = '3ba9a0e1-b044-4d20-80a5-daf6be1171c1';
-- csv (alias): Press Militar con Barra (Overhead)
update public.tipo_ejercicio set gif_url = '/ejercicios/11651301-Barbell-Standing-Military-Press-without-rack_Shoulders_720.gif' where id = '9f01fc30-8b1a-47fa-b643-cccbe89158f9';
commit;
