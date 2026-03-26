-- Arreglar gif_url locales que apuntan a archivos inexistentes
-- Fuente: sql/ejercicios.csv (gif_url) + comprobación física en public/ejercicios
begin;
update public.tipo_ejercicio set gif_url = '/ejercicios/04461301-EZ-Barbell-Close-grip-Curl_Upper-Arms_720-1.gif' where id = '0ffb44e5-ced1-43f8-a1c7-07eab96f0f98'; -- Curl en Supinación Cerrado Con Barra Z
update public.tipo_ejercicio set gif_url = '/ejercicios/05971301-Lever-Seated-Hip-Abduction_Hips-FIX_720.gif' where id = 'e9f2a1a7-2600-4dd3-954a-fb4bbc03cd80'; -- Aductor Externo en Máquina
update public.tipo_ejercicio set gif_url = '/ejercicios/05981301-Lever-Seated-Hip-Adduction_Thighs_720.gif' where id = '067a9e50-5881-43a7-840b-1e0fd77259f6'; -- Aductor Interno en Máquina
update public.tipo_ejercicio set gif_url = '/ejercicios/11601301-Burpee_Cardio_720.gif' where id = '04624301-2724-454f-bd45-36694b610a54'; -- Burpee
update public.tipo_ejercicio set gif_url = '/ejercicios/36791301-Sit-up-with-Arms-on-Chest_Waist_720.gif' where id = '55b5e593-ff46-4fdd-b9a5-a995ed77f096'; -- Crunch Superior
update public.tipo_ejercicio set gif_url = '/ejercicios/02851301-Dumbbell-Alternate-Biceps-Curl_Upper-Arms_720.gif' where id = '2db35072-604a-4460-a897-5daea114762a'; -- Curl con giro Alterno con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/03641301-Dumbbell-One-arm-Wrist-Curl_Forearm-SFIX_720.gif' where id = 'f5a1a20e-9cba-4a07-a116-642ce2bc55ae'; -- Curl Concentrado en Supinación con Mancuerna
update public.tipo_ejercicio set gif_url = '/ejercicios/00311301-Barbell-Curl_Upper-Arms_720.gif' where id = '10b8ebaa-6e2c-434d-9b73-47236e2e888f'; -- Curl en Supinación con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/08681301-Cable-Curl-m_Upper-Arms_720.gif' where id = '0c0f395a-5388-45d8-8092-10ef60fb6327'; -- Curl en Supinación en Polea Baja
update public.tipo_ejercicio set gif_url = '/ejercicios/05991301-Lever-Seated-Leg-Curl_Thighs-FIX_720.gif' where id = '1cd4eeae-2a7c-4ac2-bcbf-6ed6503eb023'; -- Curl Femoral Vertical en Máquina
update public.tipo_ejercicio set gif_url = '/ejercicios/05861301-Lever-Lying-Leg-Curl_Thighs_720.gif' where id = 'ed4b45b5-db3b-46f9-bdf5-d83f768c8130'; -- Curl Femoral Horizontal en Máquina
update public.tipo_ejercicio set gif_url = '/ejercicios/02981301-Dumbbell-Cross-Body-Hammer-Curl_Forearms_720.gif' where id = '23ae5b03-03df-42fb-858f-63179032613b'; -- Curl en Martillo Alterno con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/00701301-Barbell-Preacher-Curl_Upper-Arms_720.gif' where id = '772dd831-9941-48e6-bf49-ac82206beddd'; -- Curl en Supinación en banco Scott con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/18651301-Hammer-Grip-Pull-up-on-Dip-Cage_Back_720.gif' where id = 'c2e8875a-3bf5-46c4-acd3-f1519f0cd2f8'; -- Dominada Cerrada en Martillo
update public.tipo_ejercicio set gif_url = '/ejercicios/14291301-Wide-Grip-Pull-Up_Back_720.gif' where id = '3ed25bd6-9c91-4806-8c29-d9f6813b0eca'; -- Dominada
update public.tipo_ejercicio set gif_url = '/ejercicios/13261301-Chin-Up_Back_720.gif' where id = '085b592d-9c55-4ce5-88f6-67357a1f6016'; -- Dominada en Supinación
update public.tipo_ejercicio set gif_url = '/ejercicios/04751301-Hanging-Straight-Leg-Raise_Hips_720.gif' where id = '4d6b1c7a-f945-47e6-9644-1643649146c4'; -- Elevación de piernas estiradas Colgado
update public.tipo_ejercicio set gif_url = '/ejercicios/02841301-Donkey-Calf-Raise_Calves_720.gif' where id = '1ee56ec0-3801-4bed-84d0-40f248d8061c'; -- Extensión de Gemelos de pie
update public.tipo_ejercicio set gif_url = '/ejercicios/26661301-Lever-Seated-Calf-Raise-plate-loaded-VERSION-2_Calves_720.gif' where id = '60638100-57df-4d82-8cd0-1cde0295c334'; -- Extensión de Gemelos sentado en Máquina
update public.tipo_ejercicio set gif_url = '/ejercicios/03101301-Dumbbell-Front-Raise_Shoulders_720.gif' where id = '4deb27ea-8968-4ebc-90a9-4a339d6ae0c1'; -- Elevaciones Frontales en Pronación con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/03341301-Dumbbell-Lateral-Raise_shoulder-AFIX_720.gif' where id = '3e82bc5e-4a99-4f81-9622-3538c73503b2'; -- Elevaciones Laterales Neutras con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/01921301-Cable-One-Arm-Lateral-Raise_Shoulders_720.gif' where id = 'ea84da8d-625f-4de5-9eea-e53d16ed2eeb'; -- Elevación Lateral Aislada en Polea
update public.tipo_ejercicio set gif_url = '/ejercicios/00951301-Barbell-Shrug_Back_720.gif' where id = '9824a189-0211-47da-b9a5-aef20ee06110'; -- Encogimientos Delanteros con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/05851301-Lever-Leg-Extension_Thighs_720.gif' where id = '0b41030a-bfd2-455f-bd90-20785a13eb7e'; -- Extensión de Cuádriceps en Máquina
update public.tipo_ejercicio set gif_url = '/ejercicios/02411301-Cable-Triceps-Pushdown-V-bar-attachment_Upper-Arms_720.gif' where id = '601ec6e9-86fe-407b-990f-efdb38563b18'; -- Extensión Vertical en Pronación en Polea Alta
update public.tipo_ejercicio set gif_url = '/ejercicios/01671301-Cable-High-Row-kneeling-rope-attachment_Back_720.gif' where id = 'f1256c90-4790-4026-9b51-6d7829d64a55'; -- Remo Superior con Cuerda en Polea
update public.tipo_ejercicio set gif_url = '/ejercicios/02831301-Diamond-Push-up_Upper-Arms_720.gif' where id = '95e4a3f9-a23a-4151-8767-96d7c58ed917'; -- Flexiones Diamante
update public.tipo_ejercicio set gif_url = '/ejercicios/29641301-Barbell-Glute-Bridge-hands-on-bar_Hips_720.gif' where id = '502ee112-94b5-4279-b04d-dc92667fc4ab'; -- Hip Thrust con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/01981301-Cable-Pulldown_Back_720.gif' where id = '9ff67679-3c8a-43f8-9249-85d759abba1e'; -- Jalón en Pronación en Polea Alta
update public.tipo_ejercicio set gif_url = '/ejercicios/08621301-Cable-twist-up-down_Waist_720.gif' where id = 'c2ef4934-c5a5-4ca1-8ba8-d80bd3b0e0af'; -- Inclinación diagonal en Polea
update public.tipo_ejercicio set gif_url = '/ejercicios/03801301-Dumbbell-Rear-Lateral-Raise_Shoulders_720.gif' where id = 'c8e683b5-b160-4695-91bc-6f6392ab4152'; -- Pájaros de pie con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/33521301-Cable-Kneeling-Pull-Through_Hips_720.gif' where id = '632afd42-2735-495c-b303-6520e76f5208'; -- Extensión de Glúteos en Polea
update public.tipo_ejercicio set gif_url = '/ejercicios/08601301-Cable-kickback_Upper-arms_720.gif' where id = 'fa8b2383-0e9b-42de-9cb8-dfafaed8e898'; -- Patadas Traseras en Polea
update public.tipo_ejercicio set gif_url = '/ejercicios/10301301-Lever-Pec-Deck-Fly_Chest_720.gif' where id = '646054d3-2dde-4f30-929f-5191b02949aa'; -- Aperturas en Máquina
update public.tipo_ejercicio set gif_url = '/ejercicios/00321301-Barbell-Deadlift_Hips-FIX_720.gif' where id = 'cf638b31-cc3e-460e-a6f0-2dd08d17ecdf'; -- Peso Muerto con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/00851301-Barbell-Romanian-Deadlift_Hips_720.gif' where id = 'cb6a0f24-92ef-4f86-a7fe-8dde45184ca0'; -- Peso Muerto Rumano con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/01171301-Barbell-Sumo-Deadlift_Hips_720.gif' where id = '96c8936c-6135-4276-b366-5117aa842b1d'; -- Peso Muerto Sumo con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/04631301-Front-Plank_waist-FIX_720.gif' where id = '653649c6-1d0f-4555-a72c-c9a0eacc63ec'; -- Plancha
update public.tipo_ejercicio set gif_url = '/ejercicios/07151301-Side-Plank-m_Waist_720.gif' where id = '2ff51a58-8dbb-4238-b5b4-56701be7bfad'; -- Plancha Lateral
update public.tipo_ejercicio set gif_url = '/ejercicios/19921301-Sled-Full-Hack-Squat_Thighs_720.gif' where id = 'f910acc9-8f80-4aee-9353-992ea63a405e'; -- Sentadilla Cerrada Inclinada en Máquina
update public.tipo_ejercicio set gif_url = '/ejercicios/21371301-Dumbbell-Arnold-Press_Shoulders_720.gif' where id = '8ce36447-9eda-4c7b-a79c-406ff75315c1'; -- Press Arnold con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/24321301-EZ-bar-Close-Grip-Bench-Press_Upper-Arms_720.gif' where id = '1cbc3cd9-ed77-4b01-b3de-abc38cd67e30'; -- Press Banca Cerrado con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/00251301-Barbell-Bench-Press_Chest-FIX_720.gif' where id = '0c6f3783-58e9-4536-b111-6af337117842'; -- Press Banca con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/02891301-Dumbbell-Bench-Press_Chest_720.gif' where id = '6c592805-b4af-453b-b37b-2919c7289988'; -- Press Banca con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/00361301-Barbell-Decline-Wide-grip-Press_Chest_720.gif' where id = '649a0be3-efa9-48c7-962f-19e226e39d01'; -- Press Declinado con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/04501301-EZ-Barbell-JM-Bench-Press_Upper-Arms_720.gif' where id = '6c65da7e-5663-410c-bda3-2b73af3b557c'; -- Press Francés con Barra Z
update public.tipo_ejercicio set gif_url = '/ejercicios/00471301-Barbell-Incline-Bench-Press_Chest_720.gif' where id = '9cc9325d-1ace-4e6e-bef6-08207c440988'; -- Press Inclinado con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/03241301-Dumbbell-Incline-Palm-in-Press_Chest_720.gif' where id = 'bff0c1a9-84fe-4210-ad5e-594789802cb5'; -- Press Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/04271301-Dumbbell-Standing-Palms-In-Press_Shoulders_720.gif' where id = '872a6da6-c9c0-4a42-9d15-c35182faaedb'; -- Press Militar Neutro con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/11651301-Barbell-Standing-Military-Press-without-rack_Shoulders_720.gif' where id = 'f8cee9a3-5ce2-4109-a203-d7d7f133b2dc'; -- Press Militar con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/05701301-Leg-Pull-In-Flat-Bench_waist_720.gif' where id = 'b75c1c10-19b7-496c-bec8-4dd3bdc317ba'; -- Elevación de Cadera con flexión de rodillas v1
update public.tipo_ejercicio set gif_url = '/ejercicios/03751301-Dumbbell-Pullover_Chest_720.gif' where id = '011e2f68-9f1e-4202-ac3b-13ddee6cbf6d'; -- Pullover con Mancuerna
update public.tipo_ejercicio set gif_url = '/ejercicios/00071301-Alternate-Lateral-Pulldown_back_720.gif' where id = '6edb782f-e45c-4d62-b9e9-fbecd77523d1'; -- Jalón Aislado en Polea Alta
update public.tipo_ejercicio set gif_url = '/ejercicios/01231301-Barbell-Wide-Grip-Upright-Row_Shoulders_720.gif' where id = '2f0728ff-13fb-4dba-95a0-66abd09b7315'; -- Remo al mentón con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/00271301-Barbell-Bent-Over-Row_Back-FIX_720.gif' where id = '9c2ce62a-46d5-434b-85aa-048b34e6a293'; -- Remo en Pronación con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/02921301-Dumbbell-Bent-over-Row_back_Back_720.gif' where id = 'cf40077f-2234-49bf-b3cc-a49ce2454819'; -- Remo Aislado con Mancuerna
update public.tipo_ejercicio set gif_url = '/ejercicios/11611301-Rowing-with-rowing-machine_Cardio_720.gif' where id = 'c76bbed5-a676-47a9-8c26-caecf7457e50'; -- Máquina de Remo
update public.tipo_ejercicio set gif_url = '/ejercicios/11941301-Lever-Lying-T-bar-Row_Back_720.gif' where id = 'd713e14b-ec1f-4053-8da8-7812478a1d9d'; -- Remo en Barra T en Pronación
update public.tipo_ejercicio set gif_url = '/ejercicios/26611301-Cable-Seated-Row-with-V-bar_Back_720.gif' where id = 'fd7582f0-d923-4029-bb52-28ce80ff2cea'; -- Remo Horizontal Cerrado Neutro en Polea
update public.tipo_ejercicio set gif_url = '/ejercicios/00491301-Barbell-Incline-Row_Back_720.gif' where id = '0b13c703-8746-4f28-b804-1dee7b8cc0cb'; -- Remo Inclinado en Pronación con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/00601301-Barbell-Lying-Triceps-Extension-Skull-Crusher_Triceps-SFIX_720.gif' where id = '23ced254-68dd-42d4-a1fa-e9333c53707c'; -- Press Francés con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/08571301-Wheel-Rollout_Waist-FIX_720.gif' where id = '14362441-532d-4747-a299-a50f4833fa0a'; -- Wheel Rollout de rodillas
update public.tipo_ejercicio set gif_url = '/ejercicios/06871301-Russian-Twist_Waist-FIX_720.gif' where id = '335ff6ce-52c4-4a06-be22-f805d32dce66'; -- Russian Twist
update public.tipo_ejercicio set gif_url = '/ejercicios/26121301-Jump-Rope-male_Cardio_720.gif' where id = '2aa7b386-1de4-4054-8ba6-d13d2e004827'; -- Salto con Cuerda Normal
update public.tipo_ejercicio set gif_url = '/ejercicios/03811301-Dumbbell-Rear-Lunge_Thighs_720.gif' where id = 'ad86a555-48a4-4a8a-9fc6-27fd7b4d5428'; -- Zancada Trasera con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/15551301-Dumbbell-Squat_Thighs_720.gif' where id = '21c2b024-500f-452c-a972-d9a87e0868b7'; -- Sentadilla con Mancuernas
update public.tipo_ejercicio set gif_url = '/ejercicios/00631301-Barbell-Narrow-Stance-Squat_Thighs_720.gif' where id = 'f751bdc8-3511-4857-b6b9-25068ead2aad'; -- Sentadilla con Barra
update public.tipo_ejercicio set gif_url = '/ejercicios/03361301-Dumbbell-Lunge_Hips_720.gif' where id = '08c505d5-f012-4b63-982f-2043b689b8c6'; -- Zancada Delantera con Mancuernas
commit;

-- SIN MATCH EN sql/ejercicios.csv (revisar manualmente):
-- 2264e45d-d496-4902-a9b8-e42eaff5f5d0 | Air Bike (Assault Bike)
-- 3bd8696f-fba7-4500-a2d7-e10bc6fe5c67 | Aperturas con Mancuernas (Flyes)
-- 85368ee3-2fc1-46b1-9188-800358ebd938 | Cruce de Poleas (Alto a Bajo)
-- 85074f0b-d739-458f-b5fd-0a24bc36dc64 | Cruce de Poleas (Bajo a Alto)
-- 22368eee-320f-4198-8e54-7b625a55260d | Flexiones (Push-ups)
-- a4a2782a-d597-4ea2-a0f1-17f68247835b | Fondos en Paralelas (Dips)
-- e842fea7-9c4a-40e9-aaa3-5af1c42f4c81 | Fondos entre Bancos
-- 3ba9a0e1-b044-4d20-80a5-daf6be1171c1 | Hiperextensiones (Lumbares)
-- 9f01fc30-8b1a-47fa-b643-cccbe89158f9 | Press Militar con Barra (Overhead)

-- MATCH PERO FALTA EL GIF EN public/ejercicios (revisar deploy/archivos):
-- 7a4c3df6-8450-4074-a797-592d85ff9434 | Pre-Workout -> /ejercicios/calentamiento.jpg
-- 1e9cb3e6-a6f0-4bb1-8f5d-16665847d916 | Post-Workout -> /ejercicios/estiramiento.jpg
-- 496c8f3e-a98a-433f-b390-0176387019a4 | Prensa Inclinada Cerrada -> /ejercicios/15751301-Sled-45°-Narrow-Stance-Leg-Press_Thighs_720.gif
-- c2c74ef0-db31-44b9-87ed-ac5cc6c916da | Prensa Inclinada -> /ejercicios/07401301-Sled-45°-Leg-Wide-Press_Thighs_720.gif
