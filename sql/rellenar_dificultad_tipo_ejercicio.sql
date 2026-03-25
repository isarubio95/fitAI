-- Rellenar dificultad (text) en tipo_ejercicio solo donde esté vacío
-- Fuente: sql/ejercicios.csv dificultad_actual / dificultad_maxima → texto "A/B"
-- Condición: dificultad NULL o cadena vacía (tras trim)
begin;
-- csv: Abdominales en V con Mancuerna
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Abdominales en V con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Aductor Externo Aislado en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aductor Externo Aislado en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Aductor Externo en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Aductor Externo en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Aductor Externo en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aductor Externo en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Aductor Interno Aislado en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aductor Interno Aislado en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Aductor Interno en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Aductor Interno en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Aductor Interno en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aductor Interno en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv (alias): Air Bike (Assault Bike)
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Air Bike (Assault Bike)' and (dificultad is null or trim(dificultad) = '');
-- csv: Apertura Aislada Declinada con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Apertura Aislada Declinada con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Apertura Aislada en Punta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Apertura Aislada en Punta' and (dificultad is null or trim(dificultad) = '');
-- csv: Aperturas con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Aperturas con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv (alias): Aperturas con Mancuernas (Flyes)
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Aperturas con Mancuernas (Flyes)' and (dificultad is null or trim(dificultad) = '');
-- csv: Aperturas Declinadas con giro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aperturas Declinadas con giro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Aperturas Declinadas con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aperturas Declinadas con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Aperturas en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aperturas en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Aperturas Extendidas en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aperturas Extendidas en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Aperturas Inclinadas con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aperturas Inclinadas con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Aperturas Traseras en Pronación en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aperturas Traseras en Pronación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Aperturas Traseras Neutras en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Aperturas Traseras Neutras en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Bicicleta Estática Deportiva
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Bicicleta Estática Deportiva' and (dificultad is null or trim(dificultad) = '');
-- csv: Bicicleta Estática Normal
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Bicicleta Estática Normal' and (dificultad is null or trim(dificultad) = '');
-- csv: Bicicleta Estática Reclinada
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Bicicleta Estática Reclinada' and (dificultad is null or trim(dificultad) = '');
-- csv: Brazada en Fitball
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Brazada en Fitball' and (dificultad is null or trim(dificultad) = '');
-- csv: Buenos días con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Buenos días con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Burpee
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Burpee' and (dificultad is null or trim(dificultad) = '');
-- csv: Burpee con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Burpee con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Burpee Jack
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Burpee Jack' and (dificultad is null or trim(dificultad) = '');
-- csv: Butt Kicks
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Butt Kicks' and (dificultad is null or trim(dificultad) = '');
-- csv: Caminar
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Caminar' and (dificultad is null or trim(dificultad) = '');
-- csv: Caminar a paso ligero
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Caminar a paso ligero' and (dificultad is null or trim(dificultad) = '');
-- csv: Caminar con peso
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Caminar con peso' and (dificultad is null or trim(dificultad) = '');
-- csv: Caminar con rodilla arriba
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Caminar con rodilla arriba' and (dificultad is null or trim(dificultad) = '');
-- csv: Caminar en cuclillas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Caminar en cuclillas' and (dificultad is null or trim(dificultad) = '');
-- csv: Carrera con salto
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Carrera con salto' and (dificultad is null or trim(dificultad) = '');
-- csv: Carrera continua
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Carrera continua' and (dificultad is null or trim(dificultad) = '');
-- csv: Carrera de pasos cortos
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Carrera de pasos cortos' and (dificultad is null or trim(dificultad) = '');
-- csv: Carrera de skater
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Carrera de skater' and (dificultad is null or trim(dificultad) = '');
-- csv: Carrera en Cinta
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Carrera en Cinta' and (dificultad is null or trim(dificultad) = '');
-- csv: Carrera en Cinta Inclinada
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Carrera en Cinta Inclinada' and (dificultad is null or trim(dificultad) = '');
-- csv: Carrera en zigzag
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Carrera en zigzag' and (dificultad is null or trim(dificultad) = '');
-- csv: Carrera hacia atrás
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Carrera hacia atrás' and (dificultad is null or trim(dificultad) = '');
-- csv: Carrera rápida en el sitio
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Carrera rápida en el sitio' and (dificultad is null or trim(dificultad) = '');
-- csv: Cocoons
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Cocoons' and (dificultad is null or trim(dificultad) = '');
-- csv: Cruce completo de Poleas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Cruce completo de Poleas' and (dificultad is null or trim(dificultad) = '');
-- csv (alias): Cruce de Poleas (Alto a Bajo)
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Cruce de Poleas (Alto a Bajo)' and (dificultad is null or trim(dificultad) = '');
-- csv (alias): Cruce de Poleas (Bajo a Alto)
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Cruce de Poleas (Bajo a Alto)' and (dificultad is null or trim(dificultad) = '');
-- csv: Cruce inferior de Poleas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Cruce inferior de Poleas' and (dificultad is null or trim(dificultad) = '');
-- csv: Cruce superior de Poleas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Cruce superior de Poleas' and (dificultad is null or trim(dificultad) = '');
-- csv: Cruces en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Cruces en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Cruzado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Cruzado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Cruzado con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Cruzado con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Cruzado con piernas elevadas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Cruzado con piernas elevadas' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Cruzado estirado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Cruzado estirado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Diagonal de pie con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Diagonal de pie con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Diagonal de rodillas con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Diagonal de rodillas con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Diagonal en Polea
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Diagonal en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Doble Vertical en Máquina
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Doble Vertical en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch en Decúbito Lateral con curl de bíceps
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch en Decúbito Lateral con curl de bíceps' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch en Plancha Lateral
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch en Plancha Lateral' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Frog
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Frog' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Horizontal en Silla Romana
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Horizontal en Silla Romana' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior con flexión y extensión
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Inferior con flexión y extensión' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior con Rodillas Flexionadas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Crunch Inferior con Rodillas Flexionadas' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior Cruzado
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Inferior Cruzado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior Cruzado Alterno
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Inferior Cruzado Alterno' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior en círculos
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Inferior en círculos' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior en Máquina Smith
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Inferior en Máquina Smith' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Inferior en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior Horizontal en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Inferior Horizontal en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior Inclinado con piernas estiradas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Inferior Inclinado con piernas estiradas' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior sentado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Inferior sentado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Inferior sentado en banco
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Inferior sentado en banco' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Lateral con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Lateral con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Lateral con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Lateral con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Lateral de pie con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Lateral de pie con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Lateral de pie en Polea Alta
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Crunch Lateral de pie en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Lateral de pie en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Lateral de pie en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Lateral en soporte
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Lateral en soporte' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Lateral Horizontal Alterno
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Lateral Horizontal Alterno' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Lateral Horizontal Concentrado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Lateral Horizontal Concentrado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Lateral Inclinado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Lateral Inclinado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior Concentrado Elevado
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Superior Concentrado Elevado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior Cruzado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior Cruzado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior Cruzado Concentrado
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Superior Cruzado Concentrado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior Cruzado Concentrado Elevado
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Crunch Superior Cruzado Concentrado Elevado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior Cruzado Declinado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior Cruzado Declinado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior de pie con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior de pie con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior de pie con Polea delante
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior de pie con Polea delante' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior de rodillas con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior de rodillas con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior Declinado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior Declinado' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior en Fitball
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior en Fitball' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior Horizontal en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior Horizontal en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior sentado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior sentado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Crunch Superior Vertical Amplio en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Crunch Superior Vertical Amplio en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Cuarto de Sentadilla con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Cuarto de Sentadilla con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Cuarto de Sentadilla con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Cuarto de Sentadilla con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl a una mano en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl a una mano en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Aislado con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Aislado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Aislado en Pronación con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Aislado en Pronación con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Aislado en Pronación en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Aislado en Pronación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Aislado en Supinación con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Aislado en Supinación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Aislado hacia abajo con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Aislado hacia abajo con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Aislado Largo en Supinación en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Aislado Largo en Supinación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Aislado Neutro con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Aislado Neutro con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Alterno en Supinación en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Alterno en Supinación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl con giro Alterno con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl con giro Alterno con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl con peso libre
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl con peso libre' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado Cerrado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Concentrado Cerrado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado Cerrado con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Concentrado Cerrado con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado Cerrado en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Concentrado Cerrado en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Concentrado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado de Dedos con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Concentrado de Dedos con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Concentrado en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Pronación con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Concentrado en Pronación con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Pronación con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Concentrado en Pronación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Pronación con Mancuerna
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Concentrado en Pronación con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Pronación con Polea
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Concentrado en Pronación con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Supinación con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Concentrado en Supinación con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Supinación con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Concentrado en Supinación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Supinación con Mancuerna
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Concentrado en Supinación con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Supinación con Polea
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Concentrado en Supinación con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado en Supinación en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Concentrado en Supinación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado Frontal Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Concentrado Frontal Aislado en Supinación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado Lateral Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Concentrado Lateral Aislado en Supinación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Concentrado Neutral con Mancuerna
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Concentrado Neutral con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Banco Scott en Pronación Aislado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Banco Scott en Pronación Aislado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Banco Scott en Pronación con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Banco Scott en Pronación con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Banco Scott en Pronación con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Banco Scott en Pronación con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Banco Scott en Supinación Aislado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Banco Scott en Supinación Aislado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Banco Scott en Supinación con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Banco Scott en Supinación con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Banco Scott en Supinación con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Banco Scott en Supinación con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Banco Scott Neutro Aislado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Banco Scott Neutro Aislado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Banco Scott Neutro con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Banco Scott Neutro con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Banco Scott Neutro con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Banco Scott Neutro con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en caída con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en caída con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Martillo Alterno con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Martillo Alterno con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Martillo con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Martillo con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Martillo Cruzado con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Martillo Cruzado con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Martillo en Máquina Scott
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Martillo en Máquina Scott' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Martillo en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Martillo en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Martillo en Polea Baja
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Martillo en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Pronación Abierto con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Pronación Abierto con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Pronación con agarre Z en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Pronación con agarre Z en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Pronación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Pronación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Pronación con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Pronación con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Pronación en banco Scott con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Pronación en banco Scott con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Pronación en banco Scott con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Pronación en banco Scott con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Pronación en Máquina Scott
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Pronación en Máquina Scott' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Abierto Con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación Abierto Con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Abierto Con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación Abierto Con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Abierto en banco Scott con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación Abierto en banco Scott con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Aislado con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación Aislado con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Alterno con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación Alterno con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Cerrado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación Cerrado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Cerrado Con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación Cerrado Con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Cerrado en banco Scott con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación Cerrado en banco Scott con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Cerrado en Polea Baja
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación Cerrado en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación con agarre Z en Polea Baja
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación con agarre Z en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación con Barra Z
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Concentrado con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación Concentrado con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Corto con Barra Z
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación Corto con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación en banco Scott con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación en banco Scott con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación en Máquina Scott
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación en Máquina Scott' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación en Polea Baja
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl en Supinación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación hacia abajo con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación hacia abajo con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación hacia abajo con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación hacia abajo con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Retraído con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación Retraído con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en Supinación Retraído en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en Supinación Retraído en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl en V en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl en V en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Femoral Aislado en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Femoral Aislado en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Femoral Horizontal en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Femoral Horizontal en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Femoral Libre
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Curl Femoral Libre' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Femoral Libre Asistido con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Femoral Libre Asistido con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Femoral Vertical en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Femoral Vertical en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Femoral Vertical en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Femoral Vertical en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Horizontal Cerrado en Supinación con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Horizontal Cerrado en Supinación con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Horizontal con giro con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Curl Horizontal con giro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Horizontal con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Curl Horizontal con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Horizontal en Supinación con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Curl Horizontal en Supinación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Horizontal en Supinación con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Horizontal en Supinación con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Horizontal Inclinado con Polea
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Curl Horizontal Inclinado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Inclinado Alterno en Supinación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Inclinado Alterno en Supinación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Inclinado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Inclinado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Inclinado con giro Alterno con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Curl Inclinado con giro Alterno con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Inclinado Lateral con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Curl Inclinado Lateral con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Inclinado Neutro Alterno con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Inclinado Neutro Alterno con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Lateral con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Curl Lateral con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Lateral en Supinación Aislado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Lateral en Supinación Aislado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Lateral en Supinación con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Lateral en Supinación con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Spider Aislado en Pronación con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Spider Aislado en Pronación con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Spider Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Spider Aislado en Supinación con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Spider Aislado Neutro con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Spider Aislado Neutro con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Spider en Pronación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Spider en Pronación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Spider en Supinación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Spider en Supinación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Spider en Supinación con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Spider en Supinación con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Spider Neutro con Mancuerna
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Curl Spider Neutro con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Vertical de Dedos con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Vertical de Dedos con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Vertical en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Vertical en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Vertical en Supinación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Vertical en Supinación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Curl Vertical en Supinación con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Curl Vertical en Supinación con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Desplazamientos de Boxeo
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Desplazamientos de Boxeo' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Dominada' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada a una mano
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Dominada a una mano' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada a una mano asistida
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Dominada a una mano asistida' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada Abierta
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Dominada Abierta' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada Cerrada
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Dominada Cerrada' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada Cerrada Corta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Dominada Cerrada Corta' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada Cerrada en Martillo
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Dominada Cerrada en Martillo' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada Circular en Supinación
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Dominada Circular en Supinación' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada en Supinación
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Dominada en Supinación' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada Invertida
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Dominada Invertida' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada Lateral
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Dominada Lateral' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada Mixta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Dominada Mixta' and (dificultad is null or trim(dificultad) = '');
-- csv: Dominada Trasera
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Dominada Trasera' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Completa con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación Completa con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de Cadera con flexión de rodillas v1
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación de Cadera con flexión de rodillas v1' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de Cadera con flexión de rodillas v2
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación de Cadera con flexión de rodillas v2' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de Cadera con piernas estiradas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación de Cadera con piernas estiradas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de Cadera con piernas estiradas v2
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación de Cadera con piernas estiradas v2' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de Cadera con piernas flexionadas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación de Cadera con piernas flexionadas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de piernas alternas Colgado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación de piernas alternas Colgado' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de piernas colgado con Polea
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación de piernas colgado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de piernas con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación de piernas con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de Piernas con torsión en soporte
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación de Piernas con torsión en soporte' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de piernas en Fitball
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación de piernas en Fitball' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de piernas estiradas Colgado
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación de piernas estiradas Colgado' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de piernas estiradas en soporte
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación de piernas estiradas en soporte' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de piernas flexionadas Colgado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación de piernas flexionadas Colgado' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de piernas flexionadas en soporte
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación de piernas flexionadas en soporte' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de piernas laterales Colgado
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación de piernas laterales Colgado' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de rodillas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Elevación de rodillas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación de rodillas con apoyo
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Elevación de rodillas con apoyo' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal Aislada en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal Aislada en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal Cerrada en Pronación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal Cerrada en Pronación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal con giros con Barra Z
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación Frontal con giros con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal con Mancuerna
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Elevación Frontal con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal Declinada Abierta con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal Declinada Abierta con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal Declinada con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal Declinada con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal Declinada en Pronación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal Declinada en Pronación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal en Pronación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal en Pronación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal Horizontal en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal Horizontal en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal Inclinada en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal Inclinada en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Frontal Inclinada en Supinación con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Frontal Inclinada en Supinación con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Lateral Aislada con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Elevación Lateral Aislada con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Lateral Aislada en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Lateral Aislada en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Lateral Concentrada en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Lateral Concentrada en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Lateral en Punta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Lateral en Punta' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Lateral Horizontal Aislada con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Lateral Horizontal Aislada con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Lateral Horizontal en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Lateral Horizontal en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Lateral Inclinada Aislada con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Lateral Inclinada Aislada con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Total Colgado
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevación Total Colgado' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevación Trasera con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevación Trasera con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Circulares con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevaciones Circulares con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Completas con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Completas con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Completas con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevaciones Completas con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Frontales con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Elevaciones Frontales con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Frontales Declinadas en Pronación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Frontales Declinadas en Pronación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Frontales Declinadas Neutras con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Frontales Declinadas Neutras con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Frontales en Pronación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Frontales en Pronación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Frontales en Supinación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Frontales en Supinación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Frontales Inclinadas con giro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Frontales Inclinadas con giro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Frontales Inclinadas en Pronación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Frontales Inclinadas en Pronación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Lateral - Frontal Alto con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevaciones Lateral - Frontal Alto con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Lateral - Frontal con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Lateral - Frontal con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Elevaciones Laterales con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales Declinadas con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Laterales Declinadas con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales Declinadas en Pronación con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevaciones Laterales Declinadas en Pronación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales Declinadas en Supinación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Laterales Declinadas en Supinación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales Declinadas Neutras con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Elevaciones Laterales Declinadas Neutras con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales Delanteras con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Laterales Delanteras con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Elevaciones Laterales en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales en Supinación con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Elevaciones Laterales en Supinación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales Horizontales con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Elevaciones Laterales Horizontales con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Elevaciones Laterales Neutras con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Elevaciones Laterales Neutras con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimiento Aislado con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Encogimiento Aislado con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos Concentrados en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos Concentrados en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos Declinados con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Encogimientos Declinados con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos Delanteros con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos Delanteros con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos en Paralelas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Encogimientos en Paralelas' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos en Polea
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos en Press Militar con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Encogimientos en Press Militar con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos Horizontales en Polea
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos Horizontales en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos Inclinados con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos Inclinados con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos Laterales con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Encogimientos Laterales con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos Libres en Banco
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Encogimientos Libres en Banco' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos Sentado con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos Sentado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Encogimientos Traseros con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Encogimientos Traseros con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Concentrada en Polea Alta
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensión Concentrada en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Concentrada en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Concentrada en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Cuádriceps Aislada con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Cuádriceps Aislada con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Cuádriceps con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Cuádriceps con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Cuádriceps en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensión de Cuádriceps en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelo Aislado con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelo Aislado con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelo Aislado Delantero con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelo Aislado Delantero con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelo Aislado en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelo Aislado en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelo Aislado sentado con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelo Aislado sentado con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensión de Gemelos con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos Concentrada en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelos Concentrada en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos de pie
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensión de Gemelos de pie' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos de pie con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Extensión de Gemelos de pie con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos de pie con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelos de pie con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos Declinada en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelos Declinada en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos en Máquina con carga Inferior
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelos en Máquina con carga Inferior' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos en Máquina con carga Superior
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelos en Máquina con carga Superior' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelos en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos en Prensa
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelos en Prensa' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos Inclinada en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelos Inclinada en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos sentado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Gemelos sentado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos sentado con Mancuerna
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensión de Gemelos sentado con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Gemelos sentado en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensión de Gemelos sentado en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión de Glúteos en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión de Glúteos en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Declinada con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Declinada con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Delante-Detrás con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Delante-Detrás con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Diagonal en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Diagonal en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión en caída con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión en caída con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Frontal Aislada con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Frontal Aislada con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Frontal Aislada en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Frontal Aislada en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Frontal con Arnés
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Frontal con Arnés' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Frontal con Disco
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Frontal con Disco' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Frontal en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Frontal en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Frontal en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Frontal en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión hacia abajo con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensión hacia abajo con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Horizontal con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Horizontal con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Horizontal con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Horizontal con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Horizontal Concentrada Interna con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Horizontal Concentrada Interna con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Horizontal Concentrada Superior con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Horizontal Concentrada Superior con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Horizontal en Martillo en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Horizontal en Martillo en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Inclinada con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Inclinada con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Lateral Aislada con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Lateral Aislada con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Lateral Aislada en Supinación en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Lateral Aislada en Supinación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Lateral con Arnés
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Lateral con Arnés' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Lateral en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Lateral en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Trasera Aislada en Polea Alta
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Extensión Trasera Aislada en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Trasera Aislada en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Trasera Aislada en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Trasera con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Trasera con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Trasera en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Trasera en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical Aislada con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical Aislada con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical Aislada en Pronación en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical Aislada en Pronación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical Aislada en Pronación en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical Aislada en Pronación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical Aislada en Supinación en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical Aislada en Supinación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical en Pronación en Polea Alta
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensión Vertical en Pronación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical en Pronación en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical en Pronación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical en Supinación en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical en Supinación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical Neutra en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical Neutra en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensión Vertical Neutra en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensión Vertical Neutra en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones Concentradas en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensiones Concentradas en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones Cruzadas en Polea
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Extensiones Cruzadas en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones Cruzadas en Polea Alta
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Extensiones Cruzadas en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones en caída libre
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensiones en caída libre' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensiones en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones en Pronación en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensiones en Pronación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones Horizontales Internas con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Extensiones Horizontales Internas con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones Inclinadas con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Extensiones Inclinadas con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones Laterales Amplias con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensiones Laterales Amplias con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Extensiones Laterales con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Extensiones Laterales con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexión Frontal con Disco
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexión Frontal con Disco' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexión Frontal en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexión Frontal en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv (alias): Flexiones (Push-ups)
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones (Push-ups)' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones a una mano
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Flexiones a una mano' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones a una mano asistidas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Flexiones a una mano asistidas' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Abiertas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones Abiertas' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Archer
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Flexiones Archer' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Básicas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Flexiones Básicas' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Cerradas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones Cerradas' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones con codos
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Flexiones con codos' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones con Soportes
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones con Soportes' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Cruzadas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones Cruzadas' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Declinadas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones Declinadas' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Diamante
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones Diamante' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones en supinación
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones en supinación' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Pliométricas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones Pliométricas' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Pliométricas con Palmada
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Flexiones Pliométricas con Palmada' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Verticales con Banco
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Flexiones Verticales con Banco' and (dificultad is null or trim(dificultad) = '');
-- csv: Flexiones Verticales entre Bancos
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Flexiones Verticales entre Bancos' and (dificultad is null or trim(dificultad) = '');
-- csv: Fondos Cerrados en Paralelas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Fondos Cerrados en Paralelas' and (dificultad is null or trim(dificultad) = '');
-- csv: Fondos Coreanos en Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Fondos Coreanos en Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Fondos en banco
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Fondos en banco' and (dificultad is null or trim(dificultad) = '');
-- csv: Fondos en Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Fondos en Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Fondos en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Fondos en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv (alias): Fondos en Paralelas (Dips)
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Fondos en Paralelas (Dips)' and (dificultad is null or trim(dificultad) = '');
-- csv: Fondos en Pronación en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Fondos en Pronación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv (alias): Fondos entre Bancos
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Fondos entre Bancos' and (dificultad is null or trim(dificultad) = '');
-- csv: Fondos Imposibles
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Fondos Imposibles' and (dificultad is null or trim(dificultad) = '');
-- csv: Giros de cintura de pie con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Giros de cintura de pie con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Giros de cintura doblado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Giros de cintura doblado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Giros de cintura sentado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Giros de cintura sentado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Giros de cintura sentado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Giros de cintura sentado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Giros Inferiores de Oblicuos en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Giros Inferiores de Oblicuos en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Giros sentado en Fitball
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Giros sentado en Fitball' and (dificultad is null or trim(dificultad) = '');
-- csv: Giros Superiores de Oblicuos en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Giros Superiores de Oblicuos en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Giros Superiores Sentado
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Giros Superiores Sentado' and (dificultad is null or trim(dificultad) = '');
-- csv: Giros Superiores Sentado con peso
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Giros Superiores Sentado con peso' and (dificultad is null or trim(dificultad) = '');
-- csv: Golpes alternos
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Golpes alternos' and (dificultad is null or trim(dificultad) = '');
-- csv: Half Wipers con piernas estiradas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Half Wipers con piernas estiradas' and (dificultad is null or trim(dificultad) = '');
-- csv: Half Wipers con piernas flexionadas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Half Wipers con piernas flexionadas' and (dificultad is null or trim(dificultad) = '');
-- csv: Hand Grip
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Hand Grip' and (dificultad is null or trim(dificultad) = '');
-- csv: Hip Thrust Aislado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Hip Thrust Aislado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Hip Thrust con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Hip Thrust con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Hip Thrust con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Hip Thrust con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Hip Thrust con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Hip Thrust con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Hip Thrust Declinado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Hip Thrust Declinado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Hip Thrust Inclinado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Hip Thrust Inclinado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv (alias): Hiperextensiones (Lumbares)
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Hiperextensiones (Lumbares)' and (dificultad is null or trim(dificultad) = '');
-- csv: Hiperextensiones en Fitball
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Hiperextensiones en Fitball' and (dificultad is null or trim(dificultad) = '');
-- csv: Hiperextensiones en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Hiperextensiones en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Hiperextensiones Inclinadas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Hiperextensiones Inclinadas' and (dificultad is null or trim(dificultad) = '');
-- csv: Hollow Hold
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Hollow Hold' and (dificultad is null or trim(dificultad) = '');
-- csv: Inclinación diagonal en Polea
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Inclinación diagonal en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Jackknife Sit-Up
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Jackknife Sit-Up' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Abierto Doble Neutro en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Abierto Doble Neutro en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Abierto en Pronación en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Abierto en Pronación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Abierto en Supinación en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Abierto en Supinación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Abierto Neutro en Polea Alta
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Jalón Abierto Neutro en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Aislado en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Aislado en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Aislado Prono-Neutro en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Aislado Prono-Neutro en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Aislado Prono-Supino en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Aislado Prono-Supino en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Cerrado con Cuerda en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Cerrado con Cuerda en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Cerrado en Pronación en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Cerrado en Pronación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Cerrado Neutro con Inclinación en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Cerrado Neutro con Inclinación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Cerrado Neutro en Polea Alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Cerrado Neutro en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón en Pronación en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Jalón en Pronación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón en Pronación en Polea Alta
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Jalón en Pronación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón en Supinación con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Jalón en Supinación con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón en Supinación en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Jalón en Supinación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón en Supinación en Polea Alta
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Jalón en Supinación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Neutro con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Jalón Neutro con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Jalón Trasero Abierto en Pronación en Polea Alta
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Jalón Trasero Abierto en Pronación en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Janda Sit-up
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Janda Sit-up' and (dificultad is null or trim(dificultad) = '');
-- csv: Jumping Jacks
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Jumping Jacks' and (dificultad is null or trim(dificultad) = '');
-- csv: Krankcycle
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Krankcycle' and (dificultad is null or trim(dificultad) = '');
-- csv: Máquina de Remo
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Máquina de Remo' and (dificultad is null or trim(dificultad) = '');
-- csv: Máquina de Step
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Máquina de Step' and (dificultad is null or trim(dificultad) = '');
-- csv: Máquina Elíptica
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Máquina Elíptica' and (dificultad is null or trim(dificultad) = '');
-- csv: Máquina Escaladora
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Máquina Escaladora' and (dificultad is null or trim(dificultad) = '');
-- csv: Marcha Horizontal Aislada con pierna extendida
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Marcha Horizontal Aislada con pierna extendida' and (dificultad is null or trim(dificultad) = '');
-- csv: Marcha Horizontal Alterna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Marcha Horizontal Alterna' and (dificultad is null or trim(dificultad) = '');
-- csv: Marcha Horizontal Alterna con palmada
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Marcha Horizontal Alterna con palmada' and (dificultad is null or trim(dificultad) = '');
-- csv: Media Sentadilla con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Media Sentadilla con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Media Sentadilla con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Media Sentadilla con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Mountain Climbers
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Mountain Climbers' and (dificultad is null or trim(dificultad) = '');
-- csv: Pájaros Aislados con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pájaros Aislados con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Pájaros Aislados en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pájaros Aislados en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Pájaros de pie con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pájaros de pie con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Pájaros de pie con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pájaros de pie con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Pájaros sentado con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pájaros sentado con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Paso lateral con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Paso lateral con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Patadas altas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Patadas altas' and (dificultad is null or trim(dificultad) = '');
-- csv: Patadas Traseras Alternas con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Patadas Traseras Alternas con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Patadas Traseras con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Patadas Traseras con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Patadas Traseras en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Patadas Traseras en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto a una pierna con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Peso Muerto a una pierna con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto a una pierna con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Peso Muerto a una pierna con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto Abierto con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Peso Muerto Abierto con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto Asistido con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Peso Muerto Asistido con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Peso Muerto con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Peso Muerto con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Peso Muerto con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Peso Muerto con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Peso Muerto en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto en Punta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Peso Muerto en Punta' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto Rígido con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Peso Muerto Rígido con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto Rumano con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Peso Muerto Rumano con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto Rumano con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Peso Muerto Rumano con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Peso Muerto Sumo con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Peso Muerto Sumo con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Pies rápidos agachado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pies rápidos agachado' and (dificultad is null or trim(dificultad) = '');
-- csv: Pies rápidos de pie
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pies rápidos de pie' and (dificultad is null or trim(dificultad) = '');
-- csv: Plancha
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Plancha' and (dificultad is null or trim(dificultad) = '');
-- csv: Plancha con rodillas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Plancha con rodillas' and (dificultad is null or trim(dificultad) = '');
-- csv: Plancha Lateral
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Plancha Lateral' and (dificultad is null or trim(dificultad) = '');
-- csv: Plancha Lateral Inclinada
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Plancha Lateral Inclinada' and (dificultad is null or trim(dificultad) = '');
-- csv: Pliegue completo con Bandas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Pliegue completo con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Pliegue completo entre Poleas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Pliegue completo entre Poleas' and (dificultad is null or trim(dificultad) = '');
-- csv: Plyo Jacks
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Plyo Jacks' and (dificultad is null or trim(dificultad) = '');
-- csv: Post-Workout
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Post-Workout' and (dificultad is null or trim(dificultad) = '');
-- csv: Pre-Workout
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Pre-Workout' and (dificultad is null or trim(dificultad) = '');
-- csv: Prensa Inclinada
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Prensa Inclinada' and (dificultad is null or trim(dificultad) = '');
-- csv: Prensa Inclinada Cerrada
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Prensa Inclinada Cerrada' and (dificultad is null or trim(dificultad) = '');
-- csv: Press a una mano con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press a una mano con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Abierto Neutro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Abierto Neutro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Aislado en Punta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Aislado en Punta' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Aislado en Supinación con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Arnold Abierto con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Arnold Abierto con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Arnold con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Arnold con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca Abierto con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Banca Abierto con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca Abierto Inverso con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Banca Abierto Inverso con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca Aislado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Banca Aislado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca Alterno con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Banca Alterno con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca Cerrado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Banca Cerrado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Banca con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Banca con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca con giro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Banca con giro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Banca con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Banca en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca en Supinación Aislado con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Banca en Supinación Aislado con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Banca Neutro con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Banca Neutro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Cerrado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Cerrado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Cerrado en Máquina Smith
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Cerrado en Máquina Smith' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Cerrado en Supinación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Cerrado en Supinación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Cerrado Neutro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Cerrado Neutro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Cubano Circular con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Press Cubano Circular con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Cubano con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Cubano con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Declinado Aislado con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Declinado Aislado con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Declinado Aislado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Declinado Aislado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Declinado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Declinado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Declinado con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Declinado con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Declinado Inverso con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Declinado Inverso con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Declinado Neutro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Declinado Neutro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Francés con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés Declinado Abierto con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés Declinado Abierto con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés Declinado Cerrado con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés Declinado Cerrado con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés Declinado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés Declinado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés Inclinado Alterno con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés Inclinado Alterno con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés Inclinado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés Inclinado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés Inverso con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Press Francés Inverso con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés Neutro con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Francés Neutro con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Francés tras nuca con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Press Francés tras nuca con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal a una mano en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Frontal a una mano en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal Cerrado con Poleas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Frontal Cerrado con Poleas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal Cerrado en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Frontal Cerrado en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal con Poleas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Frontal con Poleas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Frontal en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal en Pronación con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Frontal en Pronación con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal Inclinado con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Frontal Inclinado con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal Inferior en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Frontal Inferior en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal Neutral con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Frontal Neutral con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal Neutral con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Frontal Neutral con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Frontal Superior en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Frontal Superior en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Horizontal con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Press Horizontal con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado Aislado con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Inclinado Aislado con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado Aislado con Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Inclinado Aislado con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado Cerrado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Inclinado Cerrado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado Cerrado Neutro con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Inclinado Cerrado Neutro con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Inclinado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Inclinado en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado en Supinación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Inclinado en Supinación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado en Supinación con giro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Inclinado en Supinación con giro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Inclinado en Supinación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Inclinado Inverso con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Inclinado Inverso con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Abierto con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Abierto con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Aislado con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Militar Aislado con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Cerrado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Cerrado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Cerrado en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Cerrado en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Militar con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Militar con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv (alias): Press Militar con Barra (Overhead)
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Militar con Barra (Overhead)' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar con giro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar con giro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Declinado en Pronación en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Declinado en Pronación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar en Polea
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Militar en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar en Pronación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar en Pronación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar en Pronación en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Militar en Pronación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar en Supinación con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar en Supinación con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar en Supinación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar en Supinación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Inclinado en Pronación en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Inclinado en Pronación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Inclinado Neutro en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Inclinado Neutro en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Libre
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Press Militar Libre' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Libre entre Bancos
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Press Militar Libre entre Bancos' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Mixto con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Mixto con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Neutro Alterno en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Neutro Alterno en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Neutro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Neutro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Neutro en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Militar Neutro en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Trasero con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Press Militar Trasero con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Militar Trasero con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Militar Trasero con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Scott con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Scott con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Press Svend
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Press Svend' and (dificultad is null or trim(dificultad) = '');
-- csv: Puente Lateral
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Puente Lateral' and (dificultad is null or trim(dificultad) = '');
-- csv: Puente Lateral con Abducción de Cadera
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Puente Lateral con Abducción de Cadera' and (dificultad is null or trim(dificultad) = '');
-- csv: Puente Lateral con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Puente Lateral con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Puente Lateral Declinado
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Puente Lateral Declinado' and (dificultad is null or trim(dificultad) = '');
-- csv: Puente Lateral Declinado Aislada
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Puente Lateral Declinado Aislada' and (dificultad is null or trim(dificultad) = '');
-- csv: Pullover con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pullover con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Pullover con Barra Z
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pullover con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Pullover con cuerda en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pullover con cuerda en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Pullover con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pullover con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Pullover Declinado Cerrado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pullover Declinado Cerrado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Pullover Declinado con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pullover Declinado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Pullover Extenso con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pullover Extenso con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Pulse Up
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Pulse Up' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Aislado con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Aislado con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Aislado con Mancuerna
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Aislado con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Aislado en Pronación en Máquina Smith
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Aislado en Pronación en Máquina Smith' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Aislado en Punta
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Aislado en Punta' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Aislado Neutro en Máquina Smith
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Aislado Neutro en Máquina Smith' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo al mentón Cerrado con Barra Z
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo al mentón Cerrado con Barra Z' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo al mentón con Banda
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo al mentón con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo al mentón con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo al mentón con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo al mentón con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo al mentón con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo al mentón en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo al mentón en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo al mentón Horizontal en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo al mentón Horizontal en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Colgado en Pronación
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Colgado en Pronación' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Colgado en Supinación
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Colgado en Supinación' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo con giro Aislado en Polea Baja
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Remo con giro Aislado en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Cruzado en Polea Alta
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Remo Cruzado en Polea Alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Declinado Abierto en Pronación en Polea
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Remo Declinado Abierto en Pronación en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Declinado Alterno con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Declinado Alterno con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Declinado en Pronación en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Declinado en Pronación en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Declinado Neutro en Pronación en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Declinado Neutro en Pronación en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo en Barra T en Pronación
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo en Barra T en Pronación' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo en Barra T en Supinación
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo en Barra T en Supinación' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo en Pronación Abierto con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo en Pronación Abierto con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo en Pronación con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo en Pronación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo en Pronación con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo en Pronación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo en Punta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo en Punta' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo en Supinación con Barra
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo en Supinación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo en Supinación con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo en Supinación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo en Supinación en Máquina Smith
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo en Supinación en Máquina Smith' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal Abierto en Pronación en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Horizontal Abierto en Pronación en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal Aislado con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Horizontal Aislado con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal Aislado en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Horizontal Aislado en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal Cerrado en Pronación en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Horizontal Cerrado en Pronación en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal Cerrado Neutro Amplio en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Horizontal Cerrado Neutro Amplio en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal Cerrado Neutro en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Horizontal Cerrado Neutro en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal con Bandas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Horizontal con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal en Pronación en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Horizontal en Pronación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal en Pronación en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Horizontal en Pronación en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal en Supinación en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Horizontal en Supinación en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal Neutro en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Horizontal Neutro en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal Neutro en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Horizontal Neutro en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Horizontal Superior con Cuerda en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Horizontal Superior con Cuerda en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Inclinado Alterno con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Inclinado Alterno con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Inclinado en Pronación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Inclinado en Pronación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Inclinado en Pronación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Inclinado en Pronación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Inclinado en Supinación con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Inclinado en Supinación con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Inclinado en Supinación con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Inclinado Neutro con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Inclinado Neutro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Inferior Aislado con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Inferior Aislado con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Inferior Aislado en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Inferior Aislado en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Inferior en Pronación en Polea Baja
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Inferior en Pronación en Polea Baja' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Libre Declinado con Cuerdas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Remo Libre Declinado con Cuerdas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Libre Horizontal Abierto con Cuerdas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Libre Horizontal Abierto con Cuerdas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Libre Horizontal Cerrado con Cuerda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Libre Horizontal Cerrado con Cuerda' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Libre Inclinado Abierto con Cuerda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Libre Inclinado Abierto con Cuerda' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Libre Inclinado Cerrado con Cuerda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Libre Inclinado Cerrado con Cuerda' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Neutro con Mancuernas
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Remo Neutro con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Superior Aislado con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Superior Aislado con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Superior Aislado con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Superior Aislado con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Superior Aislado en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Superior Aislado en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Superior con Bandas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Superior con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Superior con Cuerda en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Superior con Cuerda en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Superior en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Superior en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Superior en Pronación en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Superior en Pronación en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Remo Superior Trasero con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Remo Superior Trasero con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Retracción Escapular Colgado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Retracción Escapular Colgado' and (dificultad is null or trim(dificultad) = '');
-- csv: Retracción Escapular entre Bancos
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Retracción Escapular entre Bancos' and (dificultad is null or trim(dificultad) = '');
-- csv: Rodilla al codo
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rodilla al codo' and (dificultad is null or trim(dificultad) = '');
-- csv: Rodilla al codo con giro
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rodilla al codo con giro' and (dificultad is null or trim(dificultad) = '');
-- csv: Rodilla al codo con sentadilla
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rodilla al codo con sentadilla' and (dificultad is null or trim(dificultad) = '');
-- csv: Roll Reverse Crunch
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Roll Reverse Crunch' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación Concentrada con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación Concentrada con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación de Aductor Externa con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación de Aductor Externa con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación de Aductor Interna con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación de Aductor Interna con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación de Cadera Externa con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación de Cadera Externa con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación de Cadera Interna con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación de Cadera Interna con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación Externa Aislada con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación Externa Aislada con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación Externa Aislada en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación Externa Aislada en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación Externa Concentrada con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación Externa Concentrada con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación Interna Aislada en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación Interna Aislada en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación Vertical Aislada con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación Vertical Aislada con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Rotación Vertical Aislada en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Rotación Vertical Aislada en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Russian Twist
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Russian Twist' and (dificultad is null or trim(dificultad) = '');
-- csv: Russian Twist con Mancuerna
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Russian Twist con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Russian Twist en Fitball con Polea
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Russian Twist en Fitball con Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Salto alterno en el sitio
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Salto alterno en el sitio' and (dificultad is null or trim(dificultad) = '');
-- csv: Salto con Cuerda Alterno Alto
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Salto con Cuerda Alterno Alto' and (dificultad is null or trim(dificultad) = '');
-- csv: Salto con Cuerda Alterno Normal
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Salto con Cuerda Alterno Normal' and (dificultad is null or trim(dificultad) = '');
-- csv: Salto con Cuerda Alto
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Salto con Cuerda Alto' and (dificultad is null or trim(dificultad) = '');
-- csv: Salto con Cuerda Lateral
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Salto con Cuerda Lateral' and (dificultad is null or trim(dificultad) = '');
-- csv: Salto con Cuerda Normal
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Salto con Cuerda Normal' and (dificultad is null or trim(dificultad) = '');
-- csv: Salto con desplazamiento lateral
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Salto con desplazamiento lateral' and (dificultad is null or trim(dificultad) = '');
-- csv: Salto con desplazamiento lateral cruzado
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Salto con desplazamiento lateral cruzado' and (dificultad is null or trim(dificultad) = '');
-- csv: Salto de esquí
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Salto de esquí' and (dificultad is null or trim(dificultad) = '');
-- csv: Saltos rodillas en cuclillas con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Saltos rodillas en cuclillas con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla a una pierna con Banda Debajo
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla a una pierna con Banda Debajo' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla a una pierna con Banda Delante
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla a una pierna con Banda Delante' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla a una pierna con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Sentadilla a una pierna con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla a una pierna con Mancuerna
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Sentadilla a una pierna con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla Abierta con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla Abierta con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla Aislada Asistida con Cuerda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla Aislada Asistida con Cuerda' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla Asistida con Mancuerna
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla Asistida con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla Cerrada Inclinada en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla Cerrada Inclinada en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla con Poleas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla con Poleas' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla con salto con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Sentadilla con salto con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla con salto con Mancuernas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Sentadilla con salto con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla en Máquina
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Sentadilla en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla en Pared con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla en Pared con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla en Punta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla en Punta' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla en zancada con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla en zancada con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla en zancada inclinada con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla en zancada inclinada con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla en zancada inclinada con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla en zancada inclinada con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla Profunda con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Sentadilla Profunda con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla Sumo con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla Sumo con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla Sumo con Mancuerna
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Sentadilla Sumo con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Sentadilla Sumo Inclinada en Máquina
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sentadilla Sumo Inclinada en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Serratos Aislados en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Serratos Aislados en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Serratos con Cuerda en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Serratos con Cuerda en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Serratos con giro en Polea
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Serratos con giro en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Serratos Inclinados Cerrados con Barra en Polea
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Serratos Inclinados Cerrados con Barra en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Serratos Inclinados con Barra en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Serratos Inclinados con Barra en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Serratos Inferiores con Barra en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Serratos Inferiores con Barra en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Sit Up con Bandas
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Sit Up con Bandas' and (dificultad is null or trim(dificultad) = '');
-- csv: Sit Up en Fitball
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Sit Up en Fitball' and (dificultad is null or trim(dificultad) = '');
-- csv: Sit Up en Máquina
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Sit Up en Máquina' and (dificultad is null or trim(dificultad) = '');
-- csv: Skips
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Skips' and (dificultad is null or trim(dificultad) = '');
-- csv: Split Jacks
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Split Jacks' and (dificultad is null or trim(dificultad) = '');
-- csv: Sprints con rodilla alta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Sprints con rodilla alta' and (dificultad is null or trim(dificultad) = '');
-- csv: Squat Tuck Jumps
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Squat Tuck Jumps' and (dificultad is null or trim(dificultad) = '');
-- csv: Step Up
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Step Up' and (dificultad is null or trim(dificultad) = '');
-- csv: Step Up con Banda
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Step Up con Banda' and (dificultad is null or trim(dificultad) = '');
-- csv: Step Up con Barra
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Step Up con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Step Up con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Step Up con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Step Up Lateral
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Step Up Lateral' and (dificultad is null or trim(dificultad) = '');
-- csv: Tuck Jumps
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Tuck Jumps' and (dificultad is null or trim(dificultad) = '');
-- csv: Wheel Rollout de pie
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Wheel Rollout de pie' and (dificultad is null or trim(dificultad) = '');
-- csv: Wheel Rollout de rodillas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Wheel Rollout de rodillas' and (dificultad is null or trim(dificultad) = '');
-- csv: Wrist Roller
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Wrist Roller' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada con salto
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Zancada con salto' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Delantera con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Zancada Delantera con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Delantera en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Zancada Delantera en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Lateral con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Zancada Lateral con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Lateral con Mancuerna
update public.tipo_ejercicio set dificultad = '1/3' where nombre = 'Zancada Lateral con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Lateral Cruzada con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Zancada Lateral Cruzada con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Lateral Cruzada con Mancuerna
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Zancada Lateral Cruzada con Mancuerna' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Lateral en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Zancada Lateral en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Trasera con Barra
update public.tipo_ejercicio set dificultad = '3/3' where nombre = 'Zancada Trasera con Barra' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Trasera con Mancuernas
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Zancada Trasera con Mancuernas' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Trasera en Polea
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Zancada Trasera en Polea' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancada Trasera en Punta
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Zancada Trasera en Punta' and (dificultad is null or trim(dificultad) = '');
-- csv: Zancadas con salto
update public.tipo_ejercicio set dificultad = '2/3' where nombre = 'Zancadas con salto' and (dificultad is null or trim(dificultad) = '');
commit;
