-- Rellenar grupo_muscular (text) en tipo_ejercicio solo donde esté vacío
-- Fuente: sql/ejercicios.csv columna grupo_muscular
-- Condición: grupo_muscular NULL o cadena vacía (tras trim)
begin;
-- csv: Abdominales en V con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Abdominales en V con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aductor Externo Aislado en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Aductor Externo Aislado en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aductor Externo en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Aductor Externo en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aductor Externo en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Aductor Externo en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aductor Interno Aislado en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Aductor Interno Aislado en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aductor Interno en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Aductor Interno en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aductor Interno en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Aductor Interno en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv (alias): Air Bike (Assault Bike)
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Air Bike (Assault Bike)' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Apertura Aislada Declinada con Polea
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Apertura Aislada Declinada con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Apertura Aislada en Punta
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Apertura Aislada en Punta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aperturas con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Aperturas con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv (alias): Aperturas con Mancuernas (Flyes)
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Aperturas con Mancuernas (Flyes)' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aperturas Declinadas con giro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Aperturas Declinadas con giro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aperturas Declinadas con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Aperturas Declinadas con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aperturas en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Aperturas en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aperturas Extendidas en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Aperturas Extendidas en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aperturas Inclinadas con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Aperturas Inclinadas con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aperturas Traseras en Pronación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Aperturas Traseras en Pronación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Aperturas Traseras Neutras en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Aperturas Traseras Neutras en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Bicicleta Estática Deportiva
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Bicicleta Estática Deportiva' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Bicicleta Estática Normal
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Bicicleta Estática Normal' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Bicicleta Estática Reclinada
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Bicicleta Estática Reclinada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Brazada en Fitball
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Brazada en Fitball' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Buenos días con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Buenos días con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Burpee
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Burpee' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Burpee con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Burpee con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Burpee Jack
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Burpee Jack' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Butt Kicks
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Butt Kicks' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Caminar
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Caminar' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Caminar a paso ligero
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Caminar a paso ligero' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Caminar con peso
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Caminar con peso' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Caminar con rodilla arriba
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Caminar con rodilla arriba' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Caminar en cuclillas
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Caminar en cuclillas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Carrera con salto
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Carrera con salto' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Carrera continua
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Carrera continua' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Carrera de pasos cortos
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Carrera de pasos cortos' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Carrera de skater
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Carrera de skater' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Carrera en Cinta
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Carrera en Cinta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Carrera en Cinta Inclinada
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Carrera en Cinta Inclinada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Carrera en zigzag
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Carrera en zigzag' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Carrera hacia atrás
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Carrera hacia atrás' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Carrera rápida en el sitio
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Carrera rápida en el sitio' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Cocoons
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Cocoons' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Cruce completo de Poleas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Cruce completo de Poleas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv (alias): Cruce de Poleas (Alto a Bajo)
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Cruce de Poleas (Alto a Bajo)' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv (alias): Cruce de Poleas (Bajo a Alto)
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Cruce de Poleas (Bajo a Alto)' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Cruce inferior de Poleas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Cruce inferior de Poleas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Cruce superior de Poleas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Cruce superior de Poleas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Cruces en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Cruces en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Cruzado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Cruzado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Cruzado con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Cruzado con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Cruzado con piernas elevadas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Cruzado con piernas elevadas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Cruzado estirado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Cruzado estirado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Diagonal de pie con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Diagonal de pie con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Diagonal de rodillas con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Diagonal de rodillas con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Diagonal en Polea
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Diagonal en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Doble Vertical en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Doble Vertical en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch en Decúbito Lateral con curl de bíceps
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch en Decúbito Lateral con curl de bíceps' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch en Plancha Lateral
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch en Plancha Lateral' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Frog
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Frog' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Horizontal en Silla Romana
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Horizontal en Silla Romana' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior con flexión y extensión
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior con flexión y extensión' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior con Rodillas Flexionadas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior con Rodillas Flexionadas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior Cruzado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior Cruzado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior Cruzado Alterno
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior Cruzado Alterno' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior en círculos
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior en círculos' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior en Máquina Smith
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior en Máquina Smith' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior en Polea
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior Horizontal en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior Horizontal en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior Inclinado con piernas estiradas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior Inclinado con piernas estiradas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior sentado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior sentado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Inferior sentado en banco
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Inferior sentado en banco' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Lateral con Barra
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Lateral con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Lateral con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Lateral con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Lateral de pie con Banda
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Lateral de pie con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Lateral de pie en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Lateral de pie en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Lateral de pie en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Lateral de pie en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Lateral en soporte
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Lateral en soporte' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Lateral Horizontal Alterno
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Lateral Horizontal Alterno' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Lateral Horizontal Concentrado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Lateral Horizontal Concentrado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Lateral Inclinado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Lateral Inclinado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior Concentrado Elevado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior Concentrado Elevado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior Cruzado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior Cruzado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior Cruzado Concentrado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior Cruzado Concentrado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior Cruzado Concentrado Elevado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior Cruzado Concentrado Elevado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior Cruzado Declinado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior Cruzado Declinado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior de pie con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior de pie con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior de pie con Polea delante
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior de pie con Polea delante' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior de rodillas con Polea
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior de rodillas con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior Declinado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior Declinado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior en Fitball
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior en Fitball' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior Horizontal en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior Horizontal en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior sentado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior sentado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Crunch Superior Vertical Amplio en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Crunch Superior Vertical Amplio en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Cuarto de Sentadilla con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Cuarto de Sentadilla con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Cuarto de Sentadilla con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Cuarto de Sentadilla con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl a una mano en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl a una mano en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Aislado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Aislado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Aislado en Pronación con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Aislado en Pronación con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Aislado en Pronación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Aislado en Pronación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Aislado en Supinación con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Aislado en Supinación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Aislado hacia abajo con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Aislado hacia abajo con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Aislado Largo en Supinación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Aislado Largo en Supinación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Aislado Neutro con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Aislado Neutro con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Alterno en Supinación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Alterno en Supinación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl con giro Alterno con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl con giro Alterno con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl con peso libre
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl con peso libre' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado Cerrado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Concentrado Cerrado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado Cerrado con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Concentrado Cerrado con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado Cerrado en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Concentrado Cerrado en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Concentrado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado de Dedos con Barra
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado de Dedos con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Concentrado en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Pronación con Banda
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado en Pronación con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Pronación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado en Pronación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Pronación con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado en Pronación con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Pronación con Polea
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado en Pronación con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Supinación con Banda
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado en Supinación con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Supinación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado en Supinación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Supinación con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado en Supinación con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Supinación con Polea
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado en Supinación con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado en Supinación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Concentrado en Supinación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado Frontal Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Concentrado Frontal Aislado en Supinación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado Lateral Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Concentrado Lateral Aislado en Supinación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Concentrado Neutral con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Concentrado Neutral con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Banco Scott en Pronación Aislado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Banco Scott en Pronación Aislado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Banco Scott en Pronación con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Banco Scott en Pronación con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Banco Scott en Pronación con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Banco Scott en Pronación con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Banco Scott en Supinación Aislado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Banco Scott en Supinación Aislado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Banco Scott en Supinación con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Banco Scott en Supinación con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Banco Scott en Supinación con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Banco Scott en Supinación con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Banco Scott Neutro Aislado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Banco Scott Neutro Aislado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Banco Scott Neutro con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Banco Scott Neutro con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Banco Scott Neutro con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Banco Scott Neutro con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en caída con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en caída con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Martillo Alterno con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Martillo Alterno con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Martillo con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Martillo con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Martillo Cruzado con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Martillo Cruzado con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Martillo en Máquina Scott
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Martillo en Máquina Scott' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Martillo en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Martillo en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Martillo en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Martillo en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Pronación Abierto con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Pronación Abierto con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Pronación con agarre Z en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Pronación con agarre Z en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Pronación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Pronación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Pronación con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Pronación con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Pronación en banco Scott con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Pronación en banco Scott con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Pronación en banco Scott con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Pronación en banco Scott con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Pronación en Máquina Scott
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Pronación en Máquina Scott' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Abierto Con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Abierto Con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Abierto Con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Abierto Con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Abierto en banco Scott con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Abierto en banco Scott con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Aislado con Banda
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Aislado con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Alterno con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Alterno con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Cerrado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Cerrado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Cerrado Con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Cerrado Con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Cerrado en banco Scott con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Cerrado en banco Scott con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Cerrado en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Cerrado en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación con agarre Z en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación con agarre Z en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Concentrado con Banda
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Concentrado con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Corto con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Corto con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación en banco Scott con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación en banco Scott con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación en Máquina Scott
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación en Máquina Scott' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación hacia abajo con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación hacia abajo con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación hacia abajo con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación hacia abajo con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Retraído con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Retraído con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en Supinación Retraído en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en Supinación Retraído en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl en V en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl en V en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Femoral Aislado en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Curl Femoral Aislado en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Femoral Horizontal en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Curl Femoral Horizontal en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Femoral Libre
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Curl Femoral Libre' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Femoral Libre Asistido con Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Curl Femoral Libre Asistido con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Femoral Vertical en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Curl Femoral Vertical en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Femoral Vertical en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Curl Femoral Vertical en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Horizontal Cerrado en Supinación con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Horizontal Cerrado en Supinación con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Horizontal con giro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Horizontal con giro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Horizontal con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Horizontal con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Horizontal en Supinación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Horizontal en Supinación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Horizontal en Supinación con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Horizontal en Supinación con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Horizontal Inclinado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Horizontal Inclinado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Inclinado Alterno en Supinación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Inclinado Alterno en Supinación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Inclinado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Inclinado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Inclinado con giro Alterno con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Inclinado con giro Alterno con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Inclinado Lateral con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Inclinado Lateral con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Inclinado Neutro Alterno con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Inclinado Neutro Alterno con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Lateral con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Lateral con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Lateral en Supinación Aislado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Lateral en Supinación Aislado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Lateral en Supinación con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Lateral en Supinación con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Spider Aislado en Pronación con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Spider Aislado en Pronación con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Spider Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Spider Aislado en Supinación con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Spider Aislado Neutro con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Spider Aislado Neutro con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Spider en Pronación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Spider en Pronación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Spider en Supinación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Spider en Supinación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Spider en Supinación con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Spider en Supinación con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Spider Neutro con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Spider Neutro con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Vertical de Dedos con Barra
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Vertical de Dedos con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Vertical en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Vertical en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Vertical en Supinación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Curl Vertical en Supinación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Curl Vertical en Supinación con Polea
update public.tipo_ejercicio set grupo_muscular = 'Bíceps' where nombre = 'Curl Vertical en Supinación con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Desplazamientos de Boxeo
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Desplazamientos de Boxeo' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada a una mano
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada a una mano' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada a una mano asistida
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada a una mano asistida' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada Abierta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada Abierta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada Cerrada
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada Cerrada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada Cerrada Corta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada Cerrada Corta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada Cerrada en Martillo
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada Cerrada en Martillo' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada Circular en Supinación
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada Circular en Supinación' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada en Supinación
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada en Supinación' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada Invertida
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada Invertida' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada Lateral
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada Lateral' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada Mixta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada Mixta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Dominada Trasera
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Dominada Trasera' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Completa con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Completa con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de Cadera con flexión de rodillas v1
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de Cadera con flexión de rodillas v1' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de Cadera con flexión de rodillas v2
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de Cadera con flexión de rodillas v2' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de Cadera con piernas estiradas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de Cadera con piernas estiradas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de Cadera con piernas estiradas v2
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de Cadera con piernas estiradas v2' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de Cadera con piernas flexionadas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de Cadera con piernas flexionadas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de piernas alternas Colgado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de piernas alternas Colgado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de piernas colgado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de piernas colgado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de piernas con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de piernas con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de Piernas con torsión en soporte
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de Piernas con torsión en soporte' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de piernas en Fitball
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de piernas en Fitball' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de piernas estiradas Colgado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de piernas estiradas Colgado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de piernas estiradas en soporte
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de piernas estiradas en soporte' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de piernas flexionadas Colgado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de piernas flexionadas Colgado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de piernas flexionadas en soporte
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de piernas flexionadas en soporte' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de piernas laterales Colgado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación de piernas laterales Colgado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de rodillas
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Elevación de rodillas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación de rodillas con apoyo
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Elevación de rodillas con apoyo' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal Aislada en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal Aislada en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal Cerrada en Pronación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal Cerrada en Pronación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal con giros con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal con giros con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal Declinada Abierta con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal Declinada Abierta con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal Declinada con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal Declinada con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal Declinada en Pronación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal Declinada en Pronación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal en Pronación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal en Pronación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal Horizontal en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal Horizontal en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal Inclinada en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal Inclinada en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Frontal Inclinada en Supinación con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Frontal Inclinada en Supinación con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Lateral Aislada con Banda
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Lateral Aislada con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Lateral Aislada en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Lateral Aislada en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Lateral Concentrada en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Lateral Concentrada en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Lateral en Punta
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Lateral en Punta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Lateral Horizontal Aislada con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Lateral Horizontal Aislada con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Lateral Horizontal en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Lateral Horizontal en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Lateral Inclinada Aislada con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Lateral Inclinada Aislada con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Total Colgado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Elevación Total Colgado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevación Trasera con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevación Trasera con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Circulares con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Circulares con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Completas con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Completas con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Completas con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Completas con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Frontales con Banda
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Frontales con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Frontales Declinadas en Pronación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Frontales Declinadas en Pronación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Frontales Declinadas Neutras con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Frontales Declinadas Neutras con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Frontales en Pronación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Frontales en Pronación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Frontales en Supinación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Frontales en Supinación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Frontales Inclinadas con giro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Frontales Inclinadas con giro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Frontales Inclinadas en Pronación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Frontales Inclinadas en Pronación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Lateral - Frontal Alto con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Lateral - Frontal Alto con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Lateral - Frontal con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Lateral - Frontal con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales con Banda
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales Declinadas con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales Declinadas con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales Declinadas en Pronación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales Declinadas en Pronación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales Declinadas en Supinación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales Declinadas en Supinación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales Declinadas Neutras con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales Declinadas Neutras con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales Delanteras con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales Delanteras con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales en Supinación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales en Supinación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales Horizontales con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales Horizontales con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Elevaciones Laterales Neutras con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Elevaciones Laterales Neutras con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimiento Aislado con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimiento Aislado con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos con Banda
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos Concentrados en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos Concentrados en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos Declinados con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos Declinados con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos Delanteros con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos Delanteros con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos en Paralelas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos en Paralelas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos en Press Militar con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos en Press Militar con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos Horizontales en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos Horizontales en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos Inclinados con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos Inclinados con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos Laterales con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos Laterales con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos Libres en Banco
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos Libres en Banco' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos Sentado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos Sentado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Encogimientos Traseros con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Encogimientos Traseros con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Concentrada en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Concentrada en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Concentrada en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Concentrada en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Cuádriceps Aislada con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Cuádriceps Aislada con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Cuádriceps con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Cuádriceps con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Cuádriceps en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Cuádriceps en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelo Aislado con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelo Aislado con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelo Aislado Delantero con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelo Aislado Delantero con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelo Aislado en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelo Aislado en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelo Aislado sentado con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelo Aislado sentado con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos Concentrada en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos Concentrada en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos de pie
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos de pie' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos de pie con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos de pie con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos de pie con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos de pie con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos Declinada en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos Declinada en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos en Máquina con carga Inferior
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos en Máquina con carga Inferior' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos en Máquina con carga Superior
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos en Máquina con carga Superior' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos en Prensa
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos en Prensa' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos Inclinada en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos Inclinada en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos sentado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos sentado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos sentado con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos sentado con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Gemelos sentado en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Gemelos sentado en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión de Glúteos en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión de Glúteos en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Declinada con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Declinada con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Delante-Detrás con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Delante-Detrás con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Diagonal en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Extensión Diagonal en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión en caída con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión en caída con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Frontal Aislada con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión Frontal Aislada con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Frontal Aislada en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Frontal Aislada en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Frontal con Arnés
update public.tipo_ejercicio set grupo_muscular = 'Cuello' where nombre = 'Extensión Frontal con Arnés' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Frontal con Disco
update public.tipo_ejercicio set grupo_muscular = 'Cuello' where nombre = 'Extensión Frontal con Disco' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Frontal en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Cuello' where nombre = 'Extensión Frontal en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Frontal en Polea
update public.tipo_ejercicio set grupo_muscular = 'Cuello' where nombre = 'Extensión Frontal en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión hacia abajo con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión hacia abajo con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Horizontal con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Horizontal con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Horizontal con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Horizontal con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Horizontal Concentrada Interna con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Horizontal Concentrada Interna con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Horizontal Concentrada Superior con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Horizontal Concentrada Superior con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Horizontal en Martillo en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Horizontal en Martillo en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Inclinada con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Inclinada con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Lateral Aislada con Banda
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Lateral Aislada con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Lateral Aislada en Supinación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Lateral Aislada en Supinación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Lateral con Arnés
update public.tipo_ejercicio set grupo_muscular = 'Cuello' where nombre = 'Extensión Lateral con Arnés' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Lateral en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Cuello' where nombre = 'Extensión Lateral en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Trasera Aislada en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Trasera Aislada en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Trasera Aislada en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión Trasera Aislada en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Trasera con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Extensión Trasera con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Trasera en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Extensión Trasera en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical Aislada con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical Aislada con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical Aislada en Pronación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical Aislada en Pronación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical Aislada en Pronación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical Aislada en Pronación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical Aislada en Supinación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical Aislada en Supinación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical en Pronación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical en Pronación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical en Pronación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical en Pronación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical en Supinación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical en Supinación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical Neutra en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical Neutra en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensión Vertical Neutra en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensión Vertical Neutra en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones Concentradas en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensiones Concentradas en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones Cruzadas en Polea
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensiones Cruzadas en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones Cruzadas en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Extensiones Cruzadas en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones en caída libre
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensiones en caída libre' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensiones en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones en Pronación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensiones en Pronación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones Horizontales Internas con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensiones Horizontales Internas con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones Inclinadas con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Extensiones Inclinadas con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones Laterales Amplias con Banda
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Extensiones Laterales Amplias con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Extensiones Laterales con Banda
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Extensiones Laterales con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexión Frontal con Disco
update public.tipo_ejercicio set grupo_muscular = 'Cuello' where nombre = 'Flexión Frontal con Disco' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexión Frontal en Polea
update public.tipo_ejercicio set grupo_muscular = 'Cuello' where nombre = 'Flexión Frontal en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv (alias): Flexiones (Push-ups)
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones (Push-ups)' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones a una mano
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones a una mano' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones a una mano asistidas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones a una mano asistidas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Abiertas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones Abiertas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Archer
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones Archer' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Básicas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Flexiones Básicas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Cerradas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones Cerradas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones con codos
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Flexiones con codos' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones con Soportes
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones con Soportes' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Cruzadas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Flexiones Cruzadas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Declinadas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones Declinadas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Diamante
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Flexiones Diamante' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones en supinación
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Flexiones en supinación' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Pliométricas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones Pliométricas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Pliométricas con Palmada
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Flexiones Pliométricas con Palmada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Verticales con Banco
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Flexiones Verticales con Banco' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Flexiones Verticales entre Bancos
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Flexiones Verticales entre Bancos' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Fondos Cerrados en Paralelas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Fondos Cerrados en Paralelas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Fondos Coreanos en Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Fondos Coreanos en Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Fondos en banco
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Fondos en banco' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Fondos en Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Fondos en Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Fondos en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Fondos en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv (alias): Fondos en Paralelas (Dips)
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Fondos en Paralelas (Dips)' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Fondos en Pronación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Fondos en Pronación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv (alias): Fondos entre Bancos
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Fondos entre Bancos' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Fondos Imposibles
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Fondos Imposibles' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Giros de cintura de pie con Banda
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Giros de cintura de pie con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Giros de cintura doblado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Giros de cintura doblado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Giros de cintura sentado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Giros de cintura sentado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Giros de cintura sentado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Giros de cintura sentado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Giros Inferiores de Oblicuos en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Giros Inferiores de Oblicuos en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Giros sentado en Fitball
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Giros sentado en Fitball' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Giros Superiores de Oblicuos en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Giros Superiores de Oblicuos en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Giros Superiores Sentado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Giros Superiores Sentado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Giros Superiores Sentado con peso
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Giros Superiores Sentado con peso' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Golpes alternos
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Golpes alternos' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Half Wipers con piernas estiradas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Half Wipers con piernas estiradas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Half Wipers con piernas flexionadas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Half Wipers con piernas flexionadas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hand Grip
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Hand Grip' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hip Thrust Aislado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Hip Thrust Aislado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hip Thrust con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Hip Thrust con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hip Thrust con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Hip Thrust con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hip Thrust con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Hip Thrust con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hip Thrust Declinado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Hip Thrust Declinado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hip Thrust Inclinado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Hip Thrust Inclinado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv (alias): Hiperextensiones (Lumbares)
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Hiperextensiones (Lumbares)' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hiperextensiones en Fitball
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Hiperextensiones en Fitball' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hiperextensiones en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Hiperextensiones en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hiperextensiones Inclinadas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Hiperextensiones Inclinadas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Hollow Hold
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Hollow Hold' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Inclinación diagonal en Polea
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Inclinación diagonal en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jackknife Sit-Up
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Jackknife Sit-Up' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Abierto Doble Neutro en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Abierto Doble Neutro en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Abierto en Pronación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Abierto en Pronación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Abierto en Supinación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Abierto en Supinación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Abierto Neutro en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Abierto Neutro en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Aislado en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Aislado en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Aislado Prono-Neutro en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Aislado Prono-Neutro en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Aislado Prono-Supino en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Aislado Prono-Supino en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Cerrado con Cuerda en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Cerrado con Cuerda en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Cerrado en Pronación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Cerrado en Pronación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Cerrado Neutro con Inclinación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Cerrado Neutro con Inclinación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Cerrado Neutro en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Cerrado Neutro en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón en Pronación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón en Pronación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón en Pronación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón en Pronación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón en Supinación con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón en Supinación con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón en Supinación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón en Supinación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón en Supinación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón en Supinación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Neutro con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Neutro con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jalón Trasero Abierto en Pronación en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Jalón Trasero Abierto en Pronación en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Janda Sit-up
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Janda Sit-up' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Jumping Jacks
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Jumping Jacks' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Krankcycle
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Krankcycle' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Máquina de Remo
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Máquina de Remo' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Máquina de Step
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Máquina de Step' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Máquina Elíptica
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Máquina Elíptica' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Máquina Escaladora
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Máquina Escaladora' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Marcha Horizontal Aislada con pierna extendida
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Marcha Horizontal Aislada con pierna extendida' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Marcha Horizontal Alterna
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Marcha Horizontal Alterna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Marcha Horizontal Alterna con palmada
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Marcha Horizontal Alterna con palmada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Media Sentadilla con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Media Sentadilla con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Media Sentadilla con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Media Sentadilla con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Mountain Climbers
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Mountain Climbers' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pájaros Aislados con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Pájaros Aislados con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pájaros Aislados en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Pájaros Aislados en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pájaros de pie con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Pájaros de pie con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pájaros de pie con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Pájaros de pie con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pájaros sentado con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Pájaros sentado con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Paso lateral con Banda
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Paso lateral con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Patadas altas
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Patadas altas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Patadas Traseras Alternas con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Patadas Traseras Alternas con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Patadas Traseras con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Patadas Traseras con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Patadas Traseras en Polea
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Patadas Traseras en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto a una pierna con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto a una pierna con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto a una pierna con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto a una pierna con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto Abierto con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto Abierto con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto Asistido con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto Asistido con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto en Punta
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto en Punta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto Rígido con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto Rígido con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto Rumano con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto Rumano con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto Rumano con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto Rumano con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Peso Muerto Sumo con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Peso Muerto Sumo con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pies rápidos agachado
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Pies rápidos agachado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pies rápidos de pie
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Pies rápidos de pie' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Plancha
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Plancha' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Plancha con rodillas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Plancha con rodillas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Plancha Lateral
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Plancha Lateral' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Plancha Lateral Inclinada
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Plancha Lateral Inclinada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pliegue completo con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Pliegue completo con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pliegue completo entre Poleas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Pliegue completo entre Poleas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Plyo Jacks
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Plyo Jacks' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Post-Workout
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Post-Workout' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pre-Workout
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Pre-Workout' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Prensa Inclinada
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Prensa Inclinada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Prensa Inclinada Cerrada
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Prensa Inclinada Cerrada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press a una mano con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press a una mano con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Abierto Neutro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Abierto Neutro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Aislado en Punta
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Aislado en Punta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Aislado en Supinación con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Arnold Abierto con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Arnold Abierto con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Arnold con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Arnold con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca Abierto con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Banca Abierto con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca Abierto Inverso con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Banca Abierto Inverso con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca Aislado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Banca Aislado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca Alterno con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Banca Alterno con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca Cerrado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Banca Cerrado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Banca con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Banca con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca con giro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Banca con giro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Banca con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Banca en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca en Supinación Aislado con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Banca en Supinación Aislado con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Banca Neutro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Banca Neutro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Cerrado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Cerrado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Cerrado en Máquina Smith
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Cerrado en Máquina Smith' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Cerrado en Supinación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Cerrado en Supinación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Cerrado Neutro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Cerrado Neutro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Cubano Circular con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Cubano Circular con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Cubano con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Cubano con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Declinado Aislado con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Declinado Aislado con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Declinado Aislado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Declinado Aislado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Declinado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Declinado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Declinado con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Declinado con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Declinado Inverso con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Declinado Inverso con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Declinado Neutro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Declinado Neutro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés con Polea
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés Declinado Abierto con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés Declinado Abierto con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés Declinado Cerrado con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés Declinado Cerrado con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés Declinado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés Declinado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés Inclinado Alterno con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés Inclinado Alterno con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés Inclinado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés Inclinado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés Inverso con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés Inverso con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés Neutro con Polea
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés Neutro con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Francés tras nuca con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Francés tras nuca con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal a una mano en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal a una mano en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal Cerrado con Poleas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal Cerrado con Poleas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal Cerrado en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal Cerrado en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal con Poleas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal con Poleas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal en Pronación con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal en Pronación con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal Inclinado con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal Inclinado con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal Inferior en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal Inferior en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal Neutral con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal Neutral con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal Neutral con Polea
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal Neutral con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Frontal Superior en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Frontal Superior en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Horizontal con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Horizontal con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado Aislado con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Inclinado Aislado con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado Aislado con Polea
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Inclinado Aislado con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado Cerrado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Inclinado Cerrado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado Cerrado Neutro con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Inclinado Cerrado Neutro con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Inclinado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Inclinado en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado en Supinación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Tríceps' where nombre = 'Press Inclinado en Supinación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado en Supinación con giro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Inclinado en Supinación con giro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Inclinado en Supinación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Inclinado Inverso con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Inclinado Inverso con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Abierto con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Abierto con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Aislado con Banda
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Aislado con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Cerrado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Cerrado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Cerrado en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Cerrado en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv (alias): Press Militar con Barra (Overhead)
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar con Barra (Overhead)' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar con giro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar con giro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Declinado en Pronación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Declinado en Pronación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar en Pronación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar en Pronación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar en Pronación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar en Pronación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar en Supinación con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar en Supinación con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar en Supinación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar en Supinación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Inclinado en Pronación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Inclinado en Pronación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Inclinado Neutro en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Inclinado Neutro en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Libre
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Libre' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Libre entre Bancos
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Libre entre Bancos' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Mixto con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Mixto con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Neutro Alterno en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Neutro Alterno en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Neutro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Neutro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Neutro en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Neutro en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Trasero con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Trasero con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Militar Trasero con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Militar Trasero con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Scott con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Press Scott con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Press Svend
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Press Svend' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Puente Lateral
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Puente Lateral' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Puente Lateral con Abducción de Cadera
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Puente Lateral con Abducción de Cadera' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Puente Lateral con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Puente Lateral con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Puente Lateral Declinado
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Puente Lateral Declinado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Puente Lateral Declinado Aislada
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Puente Lateral Declinado Aislada' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pullover con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Pullover con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pullover con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Pullover con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pullover con cuerda en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Pullover con cuerda en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pullover con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Pullover con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pullover Declinado Cerrado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Pullover Declinado Cerrado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pullover Declinado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Pullover Declinado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pullover Extenso con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pecho' where nombre = 'Pullover Extenso con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Pulse Up
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Pulse Up' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Aislado con Barra
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Aislado con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Aislado con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Aislado con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Aislado en Pronación en Máquina Smith
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Aislado en Pronación en Máquina Smith' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Aislado en Punta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Aislado en Punta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Aislado Neutro en Máquina Smith
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Aislado Neutro en Máquina Smith' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo al mentón Cerrado con Barra Z
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo al mentón Cerrado con Barra Z' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo al mentón con Banda
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo al mentón con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo al mentón con Barra
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo al mentón con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo al mentón con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo al mentón con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo al mentón en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo al mentón en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo al mentón Horizontal en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo al mentón Horizontal en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Colgado en Pronación
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Colgado en Pronación' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Colgado en Supinación
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Colgado en Supinación' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo con giro Aislado en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo con giro Aislado en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Cruzado en Polea Alta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Cruzado en Polea Alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Declinado Abierto en Pronación en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Declinado Abierto en Pronación en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Declinado Alterno con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Declinado Alterno con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Declinado en Pronación en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Declinado en Pronación en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Declinado Neutro en Pronación en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Declinado Neutro en Pronación en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo en Barra T en Pronación
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo en Barra T en Pronación' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo en Barra T en Supinación
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo en Barra T en Supinación' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo en Pronación Abierto con Barra
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo en Pronación Abierto con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo en Pronación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo en Pronación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo en Pronación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo en Pronación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo en Punta
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo en Punta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo en Supinación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo en Supinación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo en Supinación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo en Supinación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo en Supinación en Máquina Smith
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo en Supinación en Máquina Smith' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal Abierto en Pronación en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal Abierto en Pronación en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal Aislado con Banda
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal Aislado con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal Aislado en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal Aislado en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal Cerrado en Pronación en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal Cerrado en Pronación en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal Cerrado Neutro Amplio en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal Cerrado Neutro Amplio en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal Cerrado Neutro en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal Cerrado Neutro en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal en Pronación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal en Pronación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal en Pronación en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal en Pronación en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal en Supinación en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal en Supinación en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal Neutro en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal Neutro en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal Neutro en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal Neutro en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Horizontal Superior con Cuerda en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Horizontal Superior con Cuerda en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Inclinado Alterno con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Inclinado Alterno con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Inclinado en Pronación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Inclinado en Pronación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Inclinado en Pronación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Inclinado en Pronación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Inclinado en Supinación con Barra
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Inclinado en Supinación con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Inclinado en Supinación con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Inclinado Neutro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Inclinado Neutro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Inferior Aislado con Banda
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Inferior Aislado con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Inferior Aislado en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Inferior Aislado en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Inferior en Pronación en Polea Baja
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Inferior en Pronación en Polea Baja' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Libre Declinado con Cuerdas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Libre Declinado con Cuerdas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Libre Horizontal Abierto con Cuerdas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Libre Horizontal Abierto con Cuerdas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Libre Horizontal Cerrado con Cuerda
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Libre Horizontal Cerrado con Cuerda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Libre Inclinado Abierto con Cuerda
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Libre Inclinado Abierto con Cuerda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Libre Inclinado Cerrado con Cuerda
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Libre Inclinado Cerrado con Cuerda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Neutro con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Neutro con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Superior Aislado con Banda
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Superior Aislado con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Superior Aislado con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo Superior Aislado con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Superior Aislado en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Superior Aislado en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Superior con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo Superior con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Superior con Cuerda en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Superior con Cuerda en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Superior en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo Superior en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Superior en Pronación en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Remo Superior en Pronación en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Remo Superior Trasero con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Remo Superior Trasero con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Retracción Escapular Colgado
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Retracción Escapular Colgado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Retracción Escapular entre Bancos
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Retracción Escapular entre Bancos' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rodilla al codo
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Rodilla al codo' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rodilla al codo con giro
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Rodilla al codo con giro' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rodilla al codo con sentadilla
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Rodilla al codo con sentadilla' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Roll Reverse Crunch
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Roll Reverse Crunch' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación Concentrada con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Rotación Concentrada con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación de Aductor Externa con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Rotación de Aductor Externa con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación de Aductor Interna con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Rotación de Aductor Interna con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación de Cadera Externa con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Rotación de Cadera Externa con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación de Cadera Interna con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Rotación de Cadera Interna con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación Externa Aislada con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Rotación Externa Aislada con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación Externa Aislada en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Rotación Externa Aislada en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación Externa Concentrada con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Rotación Externa Concentrada con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación Interna Aislada en Polea
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Rotación Interna Aislada en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación Vertical Aislada con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Hombro' where nombre = 'Rotación Vertical Aislada con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Rotación Vertical Aislada en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Rotación Vertical Aislada en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Russian Twist
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Russian Twist' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Russian Twist con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Russian Twist con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Russian Twist en Fitball con Polea
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Russian Twist en Fitball con Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Salto alterno en el sitio
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Salto alterno en el sitio' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Salto con Cuerda Alterno Alto
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Salto con Cuerda Alterno Alto' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Salto con Cuerda Alterno Normal
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Salto con Cuerda Alterno Normal' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Salto con Cuerda Alto
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Salto con Cuerda Alto' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Salto con Cuerda Lateral
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Salto con Cuerda Lateral' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Salto con Cuerda Normal
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Salto con Cuerda Normal' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Salto con desplazamiento lateral
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Salto con desplazamiento lateral' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Salto con desplazamiento lateral cruzado
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Salto con desplazamiento lateral cruzado' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Salto de esquí
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Salto de esquí' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Saltos rodillas en cuclillas con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Saltos rodillas en cuclillas con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla a una pierna con Banda Debajo
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla a una pierna con Banda Debajo' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla a una pierna con Banda Delante
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla a una pierna con Banda Delante' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla a una pierna con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla a una pierna con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla a una pierna con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla a una pierna con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla Abierta con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla Abierta con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla Aislada Asistida con Cuerda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla Aislada Asistida con Cuerda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla Asistida con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla Asistida con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla Cerrada Inclinada en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla Cerrada Inclinada en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla con Poleas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla con Poleas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla con salto con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla con salto con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla con salto con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla con salto con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla en Pared con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla en Pared con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla en Punta
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla en Punta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla en zancada con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla en zancada con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla en zancada inclinada con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla en zancada inclinada con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla en zancada inclinada con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla en zancada inclinada con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla Profunda con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla Profunda con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla Sumo con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla Sumo con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla Sumo con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla Sumo con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sentadilla Sumo Inclinada en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Sentadilla Sumo Inclinada en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Serratos Aislados en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Serratos Aislados en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Serratos con Cuerda en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Serratos con Cuerda en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Serratos con giro en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Serratos con giro en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Serratos Inclinados Cerrados con Barra en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Serratos Inclinados Cerrados con Barra en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Serratos Inclinados con Barra en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Serratos Inclinados con Barra en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Serratos Inferiores con Barra en Polea
update public.tipo_ejercicio set grupo_muscular = 'Espalda' where nombre = 'Serratos Inferiores con Barra en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sit Up con Bandas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Sit Up con Bandas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sit Up en Fitball
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Sit Up en Fitball' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sit Up en Máquina
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Sit Up en Máquina' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Skips
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Skips' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Split Jacks
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Split Jacks' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Sprints con rodilla alta
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Sprints con rodilla alta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Squat Tuck Jumps
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Squat Tuck Jumps' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Step Up
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Step Up' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Step Up con Banda
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Step Up con Banda' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Step Up con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Step Up con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Step Up con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Step Up con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Step Up Lateral
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Step Up Lateral' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Tuck Jumps
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Tuck Jumps' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Wheel Rollout de pie
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Wheel Rollout de pie' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Wheel Rollout de rodillas
update public.tipo_ejercicio set grupo_muscular = 'Abdomen' where nombre = 'Wheel Rollout de rodillas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Wrist Roller
update public.tipo_ejercicio set grupo_muscular = 'Antebrazo' where nombre = 'Wrist Roller' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada con salto
update public.tipo_ejercicio set grupo_muscular = 'Todos' where nombre = 'Zancada con salto' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Delantera con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Delantera con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Delantera en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Delantera en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Lateral con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Lateral con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Lateral con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Lateral con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Lateral Cruzada con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Lateral Cruzada con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Lateral Cruzada con Mancuerna
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Lateral Cruzada con Mancuerna' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Lateral en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Lateral en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Trasera con Barra
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Trasera con Barra' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Trasera con Mancuernas
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Trasera con Mancuernas' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Trasera en Polea
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Trasera en Polea' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancada Trasera en Punta
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancada Trasera en Punta' and (grupo_muscular is null or trim(grupo_muscular) = '');
-- csv: Zancadas con salto
update public.tipo_ejercicio set grupo_muscular = 'Pierna' where nombre = 'Zancadas con salto' and (grupo_muscular is null or trim(grupo_muscular) = '');
commit;
