-- Rellenar tipo (text) en tipo_ejercicio solo donde esté vacío
-- Fuente: sql/ejercicios.csv columna tipo_ejercicio
-- Condición: tipo NULL o cadena vacía (tras trim)
begin;
-- csv: Abdominales en V con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Abdominales en V con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Aductor Externo Aislado en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aductor Externo Aislado en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Aductor Externo en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aductor Externo en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Aductor Externo en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aductor Externo en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Aductor Interno Aislado en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aductor Interno Aislado en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Aductor Interno en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aductor Interno en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Aductor Interno en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aductor Interno en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv (alias): Air Bike (Assault Bike)
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Air Bike (Assault Bike)' and (tipo is null or trim(tipo) = '');
-- csv: Apertura Aislada Declinada con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Apertura Aislada Declinada con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Apertura Aislada en Punta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Apertura Aislada en Punta' and (tipo is null or trim(tipo) = '');
-- csv: Aperturas con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aperturas con Bandas' and (tipo is null or trim(tipo) = '');
-- csv (alias): Aperturas con Mancuernas (Flyes)
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aperturas con Mancuernas (Flyes)' and (tipo is null or trim(tipo) = '');
-- csv: Aperturas Declinadas con giro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aperturas Declinadas con giro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Aperturas Declinadas con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aperturas Declinadas con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Aperturas en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aperturas en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Aperturas Extendidas en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aperturas Extendidas en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Aperturas Inclinadas con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aperturas Inclinadas con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Aperturas Traseras en Pronación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aperturas Traseras en Pronación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Aperturas Traseras Neutras en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Aperturas Traseras Neutras en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Bicicleta Estática Deportiva
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Bicicleta Estática Deportiva' and (tipo is null or trim(tipo) = '');
-- csv: Bicicleta Estática Normal
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Bicicleta Estática Normal' and (tipo is null or trim(tipo) = '');
-- csv: Bicicleta Estática Reclinada
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Bicicleta Estática Reclinada' and (tipo is null or trim(tipo) = '');
-- csv: Brazada en Fitball
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Brazada en Fitball' and (tipo is null or trim(tipo) = '');
-- csv: Buenos días con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Buenos días con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Burpee
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Burpee' and (tipo is null or trim(tipo) = '');
-- csv: Burpee con Mancuernas
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Burpee con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Burpee Jack
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Burpee Jack' and (tipo is null or trim(tipo) = '');
-- csv: Butt Kicks
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Butt Kicks' and (tipo is null or trim(tipo) = '');
-- csv: Caminar
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Caminar' and (tipo is null or trim(tipo) = '');
-- csv: Caminar a paso ligero
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Caminar a paso ligero' and (tipo is null or trim(tipo) = '');
-- csv: Caminar con peso
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Caminar con peso' and (tipo is null or trim(tipo) = '');
-- csv: Caminar con rodilla arriba
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Caminar con rodilla arriba' and (tipo is null or trim(tipo) = '');
-- csv: Caminar en cuclillas
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Caminar en cuclillas' and (tipo is null or trim(tipo) = '');
-- csv: Carrera con salto
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Carrera con salto' and (tipo is null or trim(tipo) = '');
-- csv: Carrera continua
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Carrera continua' and (tipo is null or trim(tipo) = '');
-- csv: Carrera de pasos cortos
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Carrera de pasos cortos' and (tipo is null or trim(tipo) = '');
-- csv: Carrera de skater
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Carrera de skater' and (tipo is null or trim(tipo) = '');
-- csv: Carrera en Cinta
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Carrera en Cinta' and (tipo is null or trim(tipo) = '');
-- csv: Carrera en Cinta Inclinada
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Carrera en Cinta Inclinada' and (tipo is null or trim(tipo) = '');
-- csv: Carrera en zigzag
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Carrera en zigzag' and (tipo is null or trim(tipo) = '');
-- csv: Carrera hacia atrás
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Carrera hacia atrás' and (tipo is null or trim(tipo) = '');
-- csv: Carrera rápida en el sitio
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Carrera rápida en el sitio' and (tipo is null or trim(tipo) = '');
-- csv: Cocoons
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Cocoons' and (tipo is null or trim(tipo) = '');
-- csv: Cruce completo de Poleas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Cruce completo de Poleas' and (tipo is null or trim(tipo) = '');
-- csv (alias): Cruce de Poleas (Alto a Bajo)
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Cruce de Poleas (Alto a Bajo)' and (tipo is null or trim(tipo) = '');
-- csv (alias): Cruce de Poleas (Bajo a Alto)
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Cruce de Poleas (Bajo a Alto)' and (tipo is null or trim(tipo) = '');
-- csv: Cruce inferior de Poleas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Cruce inferior de Poleas' and (tipo is null or trim(tipo) = '');
-- csv: Cruce superior de Poleas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Cruce superior de Poleas' and (tipo is null or trim(tipo) = '');
-- csv: Cruces en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Cruces en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Cruzado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Cruzado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Cruzado con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Cruzado con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Cruzado con piernas elevadas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Cruzado con piernas elevadas' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Cruzado estirado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Cruzado estirado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Diagonal de pie con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Diagonal de pie con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Diagonal de rodillas con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Diagonal de rodillas con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Diagonal en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Diagonal en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Doble Vertical en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Doble Vertical en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Crunch en Decúbito Lateral con curl de bíceps
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch en Decúbito Lateral con curl de bíceps' and (tipo is null or trim(tipo) = '');
-- csv: Crunch en Plancha Lateral
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch en Plancha Lateral' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Frog
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Frog' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Horizontal en Silla Romana
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Horizontal en Silla Romana' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior con flexión y extensión
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior con flexión y extensión' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior con Rodillas Flexionadas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior con Rodillas Flexionadas' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior Cruzado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior Cruzado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior Cruzado Alterno
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior Cruzado Alterno' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior en círculos
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior en círculos' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior en Máquina Smith
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior en Máquina Smith' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior Horizontal en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior Horizontal en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior Inclinado con piernas estiradas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior Inclinado con piernas estiradas' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior sentado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior sentado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Inferior sentado en banco
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Inferior sentado en banco' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Lateral con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Lateral con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Lateral con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Lateral con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Lateral de pie con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Lateral de pie con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Lateral de pie en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Lateral de pie en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Lateral de pie en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Lateral de pie en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Lateral en soporte
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Lateral en soporte' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Lateral Horizontal Alterno
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Lateral Horizontal Alterno' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Lateral Horizontal Concentrado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Lateral Horizontal Concentrado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Lateral Inclinado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Lateral Inclinado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior Concentrado Elevado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior Concentrado Elevado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior Cruzado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior Cruzado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior Cruzado Concentrado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior Cruzado Concentrado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior Cruzado Concentrado Elevado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior Cruzado Concentrado Elevado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior Cruzado Declinado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior Cruzado Declinado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior de pie con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior de pie con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior de pie con Polea delante
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior de pie con Polea delante' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior de rodillas con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior de rodillas con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior Declinado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior Declinado' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior en Fitball
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior en Fitball' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior Horizontal en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior Horizontal en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior sentado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior sentado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Crunch Superior Vertical Amplio en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Crunch Superior Vertical Amplio en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Cuarto de Sentadilla con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Cuarto de Sentadilla con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Cuarto de Sentadilla con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Cuarto de Sentadilla con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl a una mano en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl a una mano en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Curl Aislado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Aislado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Aislado en Pronación con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Aislado en Pronación con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Aislado en Pronación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Aislado en Pronación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Aislado en Supinación con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Aislado en Supinación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl Aislado hacia abajo con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Aislado hacia abajo con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Aislado Largo en Supinación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Aislado Largo en Supinación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl Aislado Neutro con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Aislado Neutro con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Alterno en Supinación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Alterno en Supinación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Curl con giro Alterno con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl con giro Alterno con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl con peso libre
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl con peso libre' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado Cerrado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado Cerrado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado Cerrado con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado Cerrado con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado Cerrado en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado Cerrado en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado de Dedos con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado de Dedos con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Pronación con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Pronación con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Pronación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Pronación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Pronación con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Pronación con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Pronación con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Pronación con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Supinación con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Supinación con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Supinación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Supinación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Supinación con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Supinación con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Supinación con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Supinación con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado en Supinación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado en Supinación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado Frontal Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado Frontal Aislado en Supinación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado Lateral Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado Lateral Aislado en Supinación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl Concentrado Neutral con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Concentrado Neutral con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Banco Scott en Pronación Aislado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Banco Scott en Pronación Aislado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Banco Scott en Pronación con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Banco Scott en Pronación con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Banco Scott en Pronación con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Banco Scott en Pronación con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Banco Scott en Supinación Aislado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Banco Scott en Supinación Aislado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Banco Scott en Supinación con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Banco Scott en Supinación con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Banco Scott en Supinación con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Banco Scott en Supinación con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Banco Scott Neutro Aislado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Banco Scott Neutro Aislado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Banco Scott Neutro con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Banco Scott Neutro con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Banco Scott Neutro con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Banco Scott Neutro con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl en caída con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en caída con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Martillo Alterno con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Martillo Alterno con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Martillo con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Martillo con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Martillo Cruzado con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Martillo Cruzado con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Martillo en Máquina Scott
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Martillo en Máquina Scott' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Martillo en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Martillo en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Martillo en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Martillo en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Pronación Abierto con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Pronación Abierto con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Pronación con agarre Z en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Pronación con agarre Z en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Pronación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Pronación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Pronación con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Pronación con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Pronación en banco Scott con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Pronación en banco Scott con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Pronación en banco Scott con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Pronación en banco Scott con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Pronación en Máquina Scott
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Pronación en Máquina Scott' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Abierto Con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Abierto Con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Abierto Con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Abierto Con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Abierto en banco Scott con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Abierto en banco Scott con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Aislado con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Aislado con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Alterno con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Alterno con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Cerrado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Cerrado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Cerrado Con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Cerrado Con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Cerrado en banco Scott con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Cerrado en banco Scott con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Cerrado en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Cerrado en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación con agarre Z en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación con agarre Z en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Concentrado con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Concentrado con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Corto con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Corto con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación en banco Scott con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación en banco Scott con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación en Máquina Scott
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación en Máquina Scott' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación hacia abajo con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación hacia abajo con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación hacia abajo con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación hacia abajo con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Retraído con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Retraído con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl en Supinación Retraído en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en Supinación Retraído en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl en V en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl en V en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl Femoral Aislado en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Femoral Aislado en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Curl Femoral Horizontal en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Femoral Horizontal en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Curl Femoral Libre
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Femoral Libre' and (tipo is null or trim(tipo) = '');
-- csv: Curl Femoral Libre Asistido con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Femoral Libre Asistido con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl Femoral Vertical en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Femoral Vertical en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Curl Femoral Vertical en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Femoral Vertical en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl Horizontal Cerrado en Supinación con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Horizontal Cerrado en Supinación con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl Horizontal con giro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Horizontal con giro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl Horizontal con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Horizontal con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl Horizontal en Supinación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Horizontal en Supinación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl Horizontal en Supinación con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Horizontal en Supinación con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl Horizontal Inclinado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Horizontal Inclinado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl Inclinado Alterno en Supinación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Inclinado Alterno en Supinación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl Inclinado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Inclinado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Inclinado con giro Alterno con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Inclinado con giro Alterno con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl Inclinado Lateral con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Inclinado Lateral con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl Inclinado Neutro Alterno con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Inclinado Neutro Alterno con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl Lateral con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Lateral con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Curl Lateral en Supinación Aislado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Lateral en Supinación Aislado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl Lateral en Supinación con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Lateral en Supinación con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Curl Spider Aislado en Pronación con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Spider Aislado en Pronación con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Spider Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Spider Aislado en Supinación con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Spider Aislado Neutro con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Spider Aislado Neutro con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Spider en Pronación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Spider en Pronación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Spider en Supinación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Spider en Supinación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Spider en Supinación con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Spider en Supinación con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Curl Spider Neutro con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Spider Neutro con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Curl Vertical de Dedos con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Vertical de Dedos con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Vertical en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Vertical en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Curl Vertical en Supinación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Vertical en Supinación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Curl Vertical en Supinación con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Curl Vertical en Supinación con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Desplazamientos de Boxeo
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Desplazamientos de Boxeo' and (tipo is null or trim(tipo) = '');
-- csv: Dominada
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada' and (tipo is null or trim(tipo) = '');
-- csv: Dominada a una mano
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada a una mano' and (tipo is null or trim(tipo) = '');
-- csv: Dominada a una mano asistida
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada a una mano asistida' and (tipo is null or trim(tipo) = '');
-- csv: Dominada Abierta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada Abierta' and (tipo is null or trim(tipo) = '');
-- csv: Dominada Cerrada
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada Cerrada' and (tipo is null or trim(tipo) = '');
-- csv: Dominada Cerrada Corta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada Cerrada Corta' and (tipo is null or trim(tipo) = '');
-- csv: Dominada Cerrada en Martillo
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada Cerrada en Martillo' and (tipo is null or trim(tipo) = '');
-- csv: Dominada Circular en Supinación
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada Circular en Supinación' and (tipo is null or trim(tipo) = '');
-- csv: Dominada en Supinación
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada en Supinación' and (tipo is null or trim(tipo) = '');
-- csv: Dominada Invertida
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada Invertida' and (tipo is null or trim(tipo) = '');
-- csv: Dominada Lateral
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada Lateral' and (tipo is null or trim(tipo) = '');
-- csv: Dominada Mixta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada Mixta' and (tipo is null or trim(tipo) = '');
-- csv: Dominada Trasera
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Dominada Trasera' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Completa con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Completa con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de Cadera con flexión de rodillas v1
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de Cadera con flexión de rodillas v1' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de Cadera con flexión de rodillas v2
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de Cadera con flexión de rodillas v2' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de Cadera con piernas estiradas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de Cadera con piernas estiradas' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de Cadera con piernas estiradas v2
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de Cadera con piernas estiradas v2' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de Cadera con piernas flexionadas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de Cadera con piernas flexionadas' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de piernas alternas Colgado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de piernas alternas Colgado' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de piernas colgado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de piernas colgado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de piernas con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de piernas con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de Piernas con torsión en soporte
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de Piernas con torsión en soporte' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de piernas en Fitball
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de piernas en Fitball' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de piernas estiradas Colgado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de piernas estiradas Colgado' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de piernas estiradas en soporte
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de piernas estiradas en soporte' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de piernas flexionadas Colgado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de piernas flexionadas Colgado' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de piernas flexionadas en soporte
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de piernas flexionadas en soporte' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de piernas laterales Colgado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación de piernas laterales Colgado' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de rodillas
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Elevación de rodillas' and (tipo is null or trim(tipo) = '');
-- csv: Elevación de rodillas con apoyo
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Elevación de rodillas con apoyo' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal Aislada en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal Aislada en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal Cerrada en Pronación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal Cerrada en Pronación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal con giros con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal con giros con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal Declinada Abierta con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal Declinada Abierta con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal Declinada con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal Declinada con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal Declinada en Pronación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal Declinada en Pronación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal en Pronación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal en Pronación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal Horizontal en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal Horizontal en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal Inclinada en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal Inclinada en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Frontal Inclinada en Supinación con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Frontal Inclinada en Supinación con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Lateral Aislada con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Lateral Aislada con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Lateral Aislada en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Lateral Aislada en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Lateral Concentrada en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Lateral Concentrada en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Lateral en Punta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Lateral en Punta' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Lateral Horizontal Aislada con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Lateral Horizontal Aislada con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Lateral Horizontal en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Lateral Horizontal en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Lateral Inclinada Aislada con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Lateral Inclinada Aislada con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Total Colgado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Total Colgado' and (tipo is null or trim(tipo) = '');
-- csv: Elevación Trasera con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevación Trasera con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Circulares con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Circulares con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Completas con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Completas con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Completas con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Completas con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Frontales con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Frontales con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Frontales Declinadas en Pronación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Frontales Declinadas en Pronación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Frontales Declinadas Neutras con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Frontales Declinadas Neutras con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Frontales en Pronación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Frontales en Pronación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Frontales en Supinación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Frontales en Supinación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Frontales Inclinadas con giro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Frontales Inclinadas con giro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Frontales Inclinadas en Pronación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Frontales Inclinadas en Pronación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Lateral - Frontal Alto con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Lateral - Frontal Alto con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Lateral - Frontal con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Lateral - Frontal con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales Declinadas con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales Declinadas con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales Declinadas en Pronación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales Declinadas en Pronación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales Declinadas en Supinación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales Declinadas en Supinación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales Declinadas Neutras con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales Declinadas Neutras con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales Delanteras con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales Delanteras con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales en Supinación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales en Supinación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales Horizontales con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales Horizontales con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Elevaciones Laterales Neutras con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Elevaciones Laterales Neutras con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Encogimiento Aislado con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimiento Aislado con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos Concentrados en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos Concentrados en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos Declinados con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos Declinados con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos Delanteros con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos Delanteros con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos en Paralelas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos en Paralelas' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos en Press Militar con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos en Press Militar con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos Horizontales en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos Horizontales en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos Inclinados con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos Inclinados con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos Laterales con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos Laterales con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos Libres en Banco
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos Libres en Banco' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos Sentado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos Sentado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Encogimientos Traseros con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Encogimientos Traseros con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Concentrada en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Concentrada en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Concentrada en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Concentrada en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Cuádriceps Aislada con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Cuádriceps Aislada con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Cuádriceps con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Cuádriceps con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Cuádriceps en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Cuádriceps en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelo Aislado con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelo Aislado con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelo Aislado Delantero con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelo Aislado Delantero con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelo Aislado en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelo Aislado en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelo Aislado sentado con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelo Aislado sentado con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos Concentrada en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos Concentrada en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos de pie
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos de pie' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos de pie con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos de pie con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos de pie con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos de pie con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos Declinada en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos Declinada en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos en Máquina con carga Inferior
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos en Máquina con carga Inferior' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos en Máquina con carga Superior
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos en Máquina con carga Superior' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos en Prensa
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos en Prensa' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos Inclinada en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos Inclinada en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos sentado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos sentado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos sentado con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos sentado con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Gemelos sentado en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Gemelos sentado en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensión de Glúteos en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión de Glúteos en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Declinada con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Declinada con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Delante-Detrás con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Delante-Detrás con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Diagonal en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Diagonal en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Extensión en caída con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión en caída con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Frontal Aislada con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Frontal Aislada con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Frontal Aislada en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Frontal Aislada en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Frontal con Arnés
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Frontal con Arnés' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Frontal con Disco
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Frontal con Disco' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Frontal en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Frontal en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Frontal en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Frontal en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Extensión hacia abajo con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión hacia abajo con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Horizontal con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Horizontal con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Horizontal con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Horizontal con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Horizontal Concentrada Interna con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Horizontal Concentrada Interna con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Horizontal Concentrada Superior con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Horizontal Concentrada Superior con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Horizontal en Martillo en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Horizontal en Martillo en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Inclinada con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Inclinada con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Lateral Aislada con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Lateral Aislada con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Lateral Aislada en Supinación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Lateral Aislada en Supinación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Lateral con Arnés
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Lateral con Arnés' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Lateral en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Lateral en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Trasera Aislada en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Trasera Aislada en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Trasera Aislada en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Trasera Aislada en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Trasera con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Trasera con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Trasera en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Trasera en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical Aislada con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical Aislada con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical Aislada en Pronación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical Aislada en Pronación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical Aislada en Pronación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical Aislada en Pronación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical Aislada en Supinación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical Aislada en Supinación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical en Pronación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical en Pronación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical en Pronación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical en Pronación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical en Supinación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical en Supinación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical Neutra en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical Neutra en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensión Vertical Neutra en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensión Vertical Neutra en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones Concentradas en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones Concentradas en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones Cruzadas en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones Cruzadas en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones Cruzadas en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones Cruzadas en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones en caída libre
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones en caída libre' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones en Pronación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones en Pronación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones Horizontales Internas con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones Horizontales Internas con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones Inclinadas con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones Inclinadas con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones Laterales Amplias con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones Laterales Amplias con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Extensiones Laterales con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Extensiones Laterales con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Flexión Frontal con Disco
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexión Frontal con Disco' and (tipo is null or trim(tipo) = '');
-- csv: Flexión Frontal en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexión Frontal en Polea' and (tipo is null or trim(tipo) = '');
-- csv (alias): Flexiones (Push-ups)
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones (Push-ups)' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones a una mano
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones a una mano' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones a una mano asistidas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones a una mano asistidas' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Abiertas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Abiertas' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Archer
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Archer' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Básicas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Básicas' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Cerradas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Cerradas' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones con codos
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones con codos' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones con Soportes
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones con Soportes' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Cruzadas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Cruzadas' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Declinadas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Declinadas' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Diamante
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Diamante' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones en supinación
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones en supinación' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Pliométricas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Pliométricas' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Pliométricas con Palmada
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Pliométricas con Palmada' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Verticales con Banco
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Verticales con Banco' and (tipo is null or trim(tipo) = '');
-- csv: Flexiones Verticales entre Bancos
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Flexiones Verticales entre Bancos' and (tipo is null or trim(tipo) = '');
-- csv: Fondos Cerrados en Paralelas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Fondos Cerrados en Paralelas' and (tipo is null or trim(tipo) = '');
-- csv: Fondos Coreanos en Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Fondos Coreanos en Barra' and (tipo is null or trim(tipo) = '');
-- csv: Fondos en banco
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Fondos en banco' and (tipo is null or trim(tipo) = '');
-- csv: Fondos en Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Fondos en Barra' and (tipo is null or trim(tipo) = '');
-- csv: Fondos en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Fondos en Máquina' and (tipo is null or trim(tipo) = '');
-- csv (alias): Fondos en Paralelas (Dips)
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Fondos en Paralelas (Dips)' and (tipo is null or trim(tipo) = '');
-- csv: Fondos en Pronación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Fondos en Pronación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv (alias): Fondos entre Bancos
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Fondos entre Bancos' and (tipo is null or trim(tipo) = '');
-- csv: Fondos Imposibles
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Fondos Imposibles' and (tipo is null or trim(tipo) = '');
-- csv: Giros de cintura de pie con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Giros de cintura de pie con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Giros de cintura doblado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Giros de cintura doblado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Giros de cintura sentado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Giros de cintura sentado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Giros de cintura sentado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Giros de cintura sentado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Giros Inferiores de Oblicuos en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Giros Inferiores de Oblicuos en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Giros sentado en Fitball
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Giros sentado en Fitball' and (tipo is null or trim(tipo) = '');
-- csv: Giros Superiores de Oblicuos en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Giros Superiores de Oblicuos en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Giros Superiores Sentado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Giros Superiores Sentado' and (tipo is null or trim(tipo) = '');
-- csv: Giros Superiores Sentado con peso
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Giros Superiores Sentado con peso' and (tipo is null or trim(tipo) = '');
-- csv: Golpes alternos
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Golpes alternos' and (tipo is null or trim(tipo) = '');
-- csv: Half Wipers con piernas estiradas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Half Wipers con piernas estiradas' and (tipo is null or trim(tipo) = '');
-- csv: Half Wipers con piernas flexionadas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Half Wipers con piernas flexionadas' and (tipo is null or trim(tipo) = '');
-- csv: Hand Grip
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hand Grip' and (tipo is null or trim(tipo) = '');
-- csv: Hip Thrust Aislado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hip Thrust Aislado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Hip Thrust con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hip Thrust con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Hip Thrust con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hip Thrust con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Hip Thrust con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hip Thrust con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Hip Thrust Declinado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hip Thrust Declinado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Hip Thrust Inclinado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hip Thrust Inclinado con Barra' and (tipo is null or trim(tipo) = '');
-- csv (alias): Hiperextensiones (Lumbares)
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hiperextensiones (Lumbares)' and (tipo is null or trim(tipo) = '');
-- csv: Hiperextensiones en Fitball
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hiperextensiones en Fitball' and (tipo is null or trim(tipo) = '');
-- csv: Hiperextensiones en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hiperextensiones en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Hiperextensiones Inclinadas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hiperextensiones Inclinadas' and (tipo is null or trim(tipo) = '');
-- csv: Hollow Hold
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Hollow Hold' and (tipo is null or trim(tipo) = '');
-- csv: Inclinación diagonal en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Inclinación diagonal en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Jackknife Sit-Up
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jackknife Sit-Up' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Abierto Doble Neutro en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Abierto Doble Neutro en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Abierto en Pronación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Abierto en Pronación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Abierto en Supinación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Abierto en Supinación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Abierto Neutro en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Abierto Neutro en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Aislado en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Aislado en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Aislado Prono-Neutro en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Aislado Prono-Neutro en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Aislado Prono-Supino en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Aislado Prono-Supino en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Cerrado con Cuerda en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Cerrado con Cuerda en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Cerrado en Pronación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Cerrado en Pronación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Cerrado Neutro con Inclinación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Cerrado Neutro con Inclinación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Cerrado Neutro en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Cerrado Neutro en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón en Pronación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón en Pronación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Jalón en Pronación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón en Pronación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón en Supinación con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón en Supinación con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Jalón en Supinación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón en Supinación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Jalón en Supinación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón en Supinación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Neutro con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Neutro con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Jalón Trasero Abierto en Pronación en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Jalón Trasero Abierto en Pronación en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Janda Sit-up
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Janda Sit-up' and (tipo is null or trim(tipo) = '');
-- csv: Jumping Jacks
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Jumping Jacks' and (tipo is null or trim(tipo) = '');
-- csv: Krankcycle
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Krankcycle' and (tipo is null or trim(tipo) = '');
-- csv: Máquina de Remo
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Máquina de Remo' and (tipo is null or trim(tipo) = '');
-- csv: Máquina de Step
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Máquina de Step' and (tipo is null or trim(tipo) = '');
-- csv: Máquina Elíptica
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Máquina Elíptica' and (tipo is null or trim(tipo) = '');
-- csv: Máquina Escaladora
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Máquina Escaladora' and (tipo is null or trim(tipo) = '');
-- csv: Marcha Horizontal Aislada con pierna extendida
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Marcha Horizontal Aislada con pierna extendida' and (tipo is null or trim(tipo) = '');
-- csv: Marcha Horizontal Alterna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Marcha Horizontal Alterna' and (tipo is null or trim(tipo) = '');
-- csv: Marcha Horizontal Alterna con palmada
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Marcha Horizontal Alterna con palmada' and (tipo is null or trim(tipo) = '');
-- csv: Media Sentadilla con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Media Sentadilla con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Media Sentadilla con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Media Sentadilla con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Mountain Climbers
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Mountain Climbers' and (tipo is null or trim(tipo) = '');
-- csv: Pájaros Aislados con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pájaros Aislados con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Pájaros Aislados en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pájaros Aislados en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Pájaros de pie con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pájaros de pie con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Pájaros de pie con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pájaros de pie con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Pájaros sentado con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pájaros sentado con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Paso lateral con Banda
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Paso lateral con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Patadas altas
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Patadas altas' and (tipo is null or trim(tipo) = '');
-- csv: Patadas Traseras Alternas con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Patadas Traseras Alternas con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Patadas Traseras con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Patadas Traseras con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Patadas Traseras en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Patadas Traseras en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto a una pierna con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto a una pierna con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto a una pierna con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto a una pierna con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto Abierto con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto Abierto con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto Asistido con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto Asistido con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto en Punta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto en Punta' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto Rígido con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto Rígido con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto Rumano con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto Rumano con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto Rumano con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto Rumano con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Peso Muerto Sumo con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Peso Muerto Sumo con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Pies rápidos agachado
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Pies rápidos agachado' and (tipo is null or trim(tipo) = '');
-- csv: Pies rápidos de pie
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Pies rápidos de pie' and (tipo is null or trim(tipo) = '');
-- csv: Plancha
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Plancha' and (tipo is null or trim(tipo) = '');
-- csv: Plancha con rodillas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Plancha con rodillas' and (tipo is null or trim(tipo) = '');
-- csv: Plancha Lateral
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Plancha Lateral' and (tipo is null or trim(tipo) = '');
-- csv: Plancha Lateral Inclinada
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Plancha Lateral Inclinada' and (tipo is null or trim(tipo) = '');
-- csv: Pliegue completo con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pliegue completo con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Pliegue completo entre Poleas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pliegue completo entre Poleas' and (tipo is null or trim(tipo) = '');
-- csv: Plyo Jacks
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Plyo Jacks' and (tipo is null or trim(tipo) = '');
-- csv: Post-Workout
update public.tipo_ejercicio set tipo = 'Estiramiento' where nombre = 'Post-Workout' and (tipo is null or trim(tipo) = '');
-- csv: Pre-Workout
update public.tipo_ejercicio set tipo = 'Estiramiento' where nombre = 'Pre-Workout' and (tipo is null or trim(tipo) = '');
-- csv: Prensa Inclinada
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Prensa Inclinada' and (tipo is null or trim(tipo) = '');
-- csv: Prensa Inclinada Cerrada
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Prensa Inclinada Cerrada' and (tipo is null or trim(tipo) = '');
-- csv: Press a una mano con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press a una mano con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Abierto Neutro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Abierto Neutro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Aislado en Punta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Aislado en Punta' and (tipo is null or trim(tipo) = '');
-- csv: Press Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Aislado en Supinación con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Press Arnold Abierto con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Arnold Abierto con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Arnold con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Arnold con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca Abierto con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca Abierto con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca Abierto Inverso con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca Abierto Inverso con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca Aislado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca Aislado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca Alterno con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca Alterno con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca Cerrado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca Cerrado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca con giro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca con giro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca en Supinación Aislado con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca en Supinación Aislado con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Press Banca Neutro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Banca Neutro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Cerrado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Cerrado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Cerrado en Máquina Smith
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Cerrado en Máquina Smith' and (tipo is null or trim(tipo) = '');
-- csv: Press Cerrado en Supinación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Cerrado en Supinación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Cerrado Neutro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Cerrado Neutro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Cubano Circular con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Cubano Circular con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Cubano con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Cubano con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Declinado Aislado con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Declinado Aislado con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Press Declinado Aislado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Declinado Aislado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Declinado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Declinado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Declinado con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Declinado con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Declinado Inverso con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Declinado Inverso con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Declinado Neutro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Declinado Neutro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés Declinado Abierto con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés Declinado Abierto con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés Declinado Cerrado con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés Declinado Cerrado con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés Declinado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés Declinado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés Inclinado Alterno con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés Inclinado Alterno con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés Inclinado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés Inclinado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés Inverso con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés Inverso con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés Neutro con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés Neutro con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Francés tras nuca con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Francés tras nuca con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal a una mano en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal a una mano en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal Cerrado con Poleas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal Cerrado con Poleas' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal Cerrado en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal Cerrado en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal con Poleas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal con Poleas' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal en Pronación con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal en Pronación con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal Inclinado con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal Inclinado con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal Inferior en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal Inferior en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal Neutral con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal Neutral con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal Neutral con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal Neutral con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Frontal Superior en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Frontal Superior en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Horizontal con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Horizontal con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado Aislado con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado Aislado con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado Aislado con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado Aislado con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado Cerrado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado Cerrado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado Cerrado Neutro con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado Cerrado Neutro con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado en Supinación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado en Supinación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado en Supinación con giro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado en Supinación con giro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado en Supinación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Inclinado Inverso con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Inclinado Inverso con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Abierto con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Abierto con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Aislado con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Aislado con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Cerrado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Cerrado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Cerrado en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Cerrado en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar con Barra' and (tipo is null or trim(tipo) = '');
-- csv (alias): Press Militar con Barra (Overhead)
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar con Barra (Overhead)' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar con giro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar con giro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Declinado en Pronación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Declinado en Pronación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar en Pronación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar en Pronación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar en Pronación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar en Pronación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar en Supinación con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar en Supinación con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar en Supinación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar en Supinación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Inclinado en Pronación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Inclinado en Pronación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Inclinado Neutro en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Inclinado Neutro en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Libre
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Libre' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Libre entre Bancos
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Libre entre Bancos' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Mixto con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Mixto con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Neutro Alterno en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Neutro Alterno en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Neutro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Neutro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Neutro en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Neutro en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Trasero con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Trasero con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Press Militar Trasero con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Militar Trasero con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Press Scott con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Scott con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Press Svend
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Press Svend' and (tipo is null or trim(tipo) = '');
-- csv: Puente Lateral
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Puente Lateral' and (tipo is null or trim(tipo) = '');
-- csv: Puente Lateral con Abducción de Cadera
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Puente Lateral con Abducción de Cadera' and (tipo is null or trim(tipo) = '');
-- csv: Puente Lateral con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Puente Lateral con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Puente Lateral Declinado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Puente Lateral Declinado' and (tipo is null or trim(tipo) = '');
-- csv: Puente Lateral Declinado Aislada
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Puente Lateral Declinado Aislada' and (tipo is null or trim(tipo) = '');
-- csv: Pullover con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pullover con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Pullover con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pullover con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Pullover con cuerda en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pullover con cuerda en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Pullover con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pullover con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Pullover Declinado Cerrado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pullover Declinado Cerrado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Pullover Declinado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pullover Declinado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Pullover Extenso con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pullover Extenso con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Pulse Up
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Pulse Up' and (tipo is null or trim(tipo) = '');
-- csv: Remo Aislado con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Aislado con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Remo Aislado con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Aislado con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Remo Aislado en Pronación en Máquina Smith
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Aislado en Pronación en Máquina Smith' and (tipo is null or trim(tipo) = '');
-- csv: Remo Aislado en Punta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Aislado en Punta' and (tipo is null or trim(tipo) = '');
-- csv: Remo Aislado Neutro en Máquina Smith
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Aislado Neutro en Máquina Smith' and (tipo is null or trim(tipo) = '');
-- csv: Remo al mentón Cerrado con Barra Z
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo al mentón Cerrado con Barra Z' and (tipo is null or trim(tipo) = '');
-- csv: Remo al mentón con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo al mentón con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Remo al mentón con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo al mentón con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Remo al mentón con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo al mentón con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Remo al mentón en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo al mentón en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo al mentón Horizontal en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo al mentón Horizontal en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Colgado en Pronación
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Colgado en Pronación' and (tipo is null or trim(tipo) = '');
-- csv: Remo Colgado en Supinación
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Colgado en Supinación' and (tipo is null or trim(tipo) = '');
-- csv: Remo con giro Aislado en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo con giro Aislado en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Remo Cruzado en Polea Alta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Cruzado en Polea Alta' and (tipo is null or trim(tipo) = '');
-- csv: Remo Declinado Abierto en Pronación en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Declinado Abierto en Pronación en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Declinado Alterno con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Declinado Alterno con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Declinado en Pronación en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Declinado en Pronación en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Declinado Neutro en Pronación en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Declinado Neutro en Pronación en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo en Barra T en Pronación
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo en Barra T en Pronación' and (tipo is null or trim(tipo) = '');
-- csv: Remo en Barra T en Supinación
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo en Barra T en Supinación' and (tipo is null or trim(tipo) = '');
-- csv: Remo en Pronación Abierto con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo en Pronación Abierto con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Remo en Pronación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo en Pronación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Remo en Pronación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo en Pronación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Remo en Punta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo en Punta' and (tipo is null or trim(tipo) = '');
-- csv: Remo en Supinación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo en Supinación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Remo en Supinación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo en Supinación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Remo en Supinación en Máquina Smith
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo en Supinación en Máquina Smith' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal Abierto en Pronación en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal Abierto en Pronación en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal Aislado con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal Aislado con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal Aislado en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal Aislado en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal Cerrado en Pronación en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal Cerrado en Pronación en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal Cerrado Neutro Amplio en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal Cerrado Neutro Amplio en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal Cerrado Neutro en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal Cerrado Neutro en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal en Pronación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal en Pronación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal en Pronación en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal en Pronación en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal en Supinación en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal en Supinación en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal Neutro en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal Neutro en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal Neutro en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal Neutro en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Horizontal Superior con Cuerda en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Horizontal Superior con Cuerda en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Inclinado Alterno con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Inclinado Alterno con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Inclinado en Pronación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Inclinado en Pronación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Remo Inclinado en Pronación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Inclinado en Pronación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Inclinado en Supinación con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Inclinado en Supinación con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Remo Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Inclinado en Supinación con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Inclinado Neutro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Inclinado Neutro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Inferior Aislado con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Inferior Aislado con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Remo Inferior Aislado en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Inferior Aislado en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Remo Inferior en Pronación en Polea Baja
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Inferior en Pronación en Polea Baja' and (tipo is null or trim(tipo) = '');
-- csv: Remo Libre Declinado con Cuerdas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Libre Declinado con Cuerdas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Libre Horizontal Abierto con Cuerdas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Libre Horizontal Abierto con Cuerdas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Libre Horizontal Cerrado con Cuerda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Libre Horizontal Cerrado con Cuerda' and (tipo is null or trim(tipo) = '');
-- csv: Remo Libre Inclinado Abierto con Cuerda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Libre Inclinado Abierto con Cuerda' and (tipo is null or trim(tipo) = '');
-- csv: Remo Libre Inclinado Cerrado con Cuerda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Libre Inclinado Cerrado con Cuerda' and (tipo is null or trim(tipo) = '');
-- csv: Remo Neutro con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Neutro con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Superior Aislado con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Superior Aislado con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Remo Superior Aislado con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Superior Aislado con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Remo Superior Aislado en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Superior Aislado en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Superior con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Superior con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Remo Superior con Cuerda en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Superior con Cuerda en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Superior en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Superior en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Superior en Pronación en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Superior en Pronación en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Remo Superior Trasero con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Remo Superior Trasero con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Retracción Escapular Colgado
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Retracción Escapular Colgado' and (tipo is null or trim(tipo) = '');
-- csv: Retracción Escapular entre Bancos
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Retracción Escapular entre Bancos' and (tipo is null or trim(tipo) = '');
-- csv: Rodilla al codo
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Rodilla al codo' and (tipo is null or trim(tipo) = '');
-- csv: Rodilla al codo con giro
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Rodilla al codo con giro' and (tipo is null or trim(tipo) = '');
-- csv: Rodilla al codo con sentadilla
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Rodilla al codo con sentadilla' and (tipo is null or trim(tipo) = '');
-- csv: Roll Reverse Crunch
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Roll Reverse Crunch' and (tipo is null or trim(tipo) = '');
-- csv: Rotación Concentrada con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación Concentrada con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Rotación de Aductor Externa con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación de Aductor Externa con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Rotación de Aductor Interna con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación de Aductor Interna con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Rotación de Cadera Externa con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación de Cadera Externa con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Rotación de Cadera Interna con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación de Cadera Interna con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Rotación Externa Aislada con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación Externa Aislada con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Rotación Externa Aislada en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación Externa Aislada en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Rotación Externa Concentrada con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación Externa Concentrada con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Rotación Interna Aislada en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación Interna Aislada en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Rotación Vertical Aislada con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación Vertical Aislada con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Rotación Vertical Aislada en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Rotación Vertical Aislada en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Russian Twist
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Russian Twist' and (tipo is null or trim(tipo) = '');
-- csv: Russian Twist con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Russian Twist con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Russian Twist en Fitball con Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Russian Twist en Fitball con Polea' and (tipo is null or trim(tipo) = '');
-- csv: Salto alterno en el sitio
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Salto alterno en el sitio' and (tipo is null or trim(tipo) = '');
-- csv: Salto con Cuerda Alterno Alto
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Salto con Cuerda Alterno Alto' and (tipo is null or trim(tipo) = '');
-- csv: Salto con Cuerda Alterno Normal
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Salto con Cuerda Alterno Normal' and (tipo is null or trim(tipo) = '');
-- csv: Salto con Cuerda Alto
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Salto con Cuerda Alto' and (tipo is null or trim(tipo) = '');
-- csv: Salto con Cuerda Lateral
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Salto con Cuerda Lateral' and (tipo is null or trim(tipo) = '');
-- csv: Salto con Cuerda Normal
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Salto con Cuerda Normal' and (tipo is null or trim(tipo) = '');
-- csv: Salto con desplazamiento lateral
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Salto con desplazamiento lateral' and (tipo is null or trim(tipo) = '');
-- csv: Salto con desplazamiento lateral cruzado
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Salto con desplazamiento lateral cruzado' and (tipo is null or trim(tipo) = '');
-- csv: Salto de esquí
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Salto de esquí' and (tipo is null or trim(tipo) = '');
-- csv: Saltos rodillas en cuclillas con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Saltos rodillas en cuclillas con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla a una pierna con Banda Debajo
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla a una pierna con Banda Debajo' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla a una pierna con Banda Delante
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla a una pierna con Banda Delante' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla a una pierna con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla a una pierna con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla a una pierna con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla a una pierna con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla Abierta con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla Abierta con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla Aislada Asistida con Cuerda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla Aislada Asistida con Cuerda' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla Asistida con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla Asistida con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla Cerrada Inclinada en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla Cerrada Inclinada en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla con Poleas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla con Poleas' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla con salto con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla con salto con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla con salto con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla con salto con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla en Pared con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla en Pared con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla en Punta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla en Punta' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla en zancada con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla en zancada con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla en zancada inclinada con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla en zancada inclinada con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla en zancada inclinada con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla en zancada inclinada con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla Profunda con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla Profunda con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla Sumo con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla Sumo con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla Sumo con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla Sumo con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Sentadilla Sumo Inclinada en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sentadilla Sumo Inclinada en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Serratos Aislados en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Serratos Aislados en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Serratos con Cuerda en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Serratos con Cuerda en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Serratos con giro en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Serratos con giro en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Serratos Inclinados Cerrados con Barra en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Serratos Inclinados Cerrados con Barra en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Serratos Inclinados con Barra en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Serratos Inclinados con Barra en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Serratos Inferiores con Barra en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Serratos Inferiores con Barra en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Sit Up con Bandas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sit Up con Bandas' and (tipo is null or trim(tipo) = '');
-- csv: Sit Up en Fitball
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sit Up en Fitball' and (tipo is null or trim(tipo) = '');
-- csv: Sit Up en Máquina
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Sit Up en Máquina' and (tipo is null or trim(tipo) = '');
-- csv: Skips
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Skips' and (tipo is null or trim(tipo) = '');
-- csv: Split Jacks
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Split Jacks' and (tipo is null or trim(tipo) = '');
-- csv: Sprints con rodilla alta
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Sprints con rodilla alta' and (tipo is null or trim(tipo) = '');
-- csv: Squat Tuck Jumps
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Squat Tuck Jumps' and (tipo is null or trim(tipo) = '');
-- csv: Step Up
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Step Up' and (tipo is null or trim(tipo) = '');
-- csv: Step Up con Banda
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Step Up con Banda' and (tipo is null or trim(tipo) = '');
-- csv: Step Up con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Step Up con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Step Up con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Step Up con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Step Up Lateral
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Step Up Lateral' and (tipo is null or trim(tipo) = '');
-- csv: Tuck Jumps
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Tuck Jumps' and (tipo is null or trim(tipo) = '');
-- csv: Wheel Rollout de pie
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Wheel Rollout de pie' and (tipo is null or trim(tipo) = '');
-- csv: Wheel Rollout de rodillas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Wheel Rollout de rodillas' and (tipo is null or trim(tipo) = '');
-- csv: Wrist Roller
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Wrist Roller' and (tipo is null or trim(tipo) = '');
-- csv: Zancada con salto
update public.tipo_ejercicio set tipo = 'Cardio' where nombre = 'Zancada con salto' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Delantera con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Delantera con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Delantera en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Delantera en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Lateral con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Lateral con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Lateral con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Lateral con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Lateral Cruzada con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Lateral Cruzada con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Lateral Cruzada con Mancuerna
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Lateral Cruzada con Mancuerna' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Lateral en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Lateral en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Trasera con Barra
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Trasera con Barra' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Trasera con Mancuernas
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Trasera con Mancuernas' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Trasera en Polea
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Trasera en Polea' and (tipo is null or trim(tipo) = '');
-- csv: Zancada Trasera en Punta
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancada Trasera en Punta' and (tipo is null or trim(tipo) = '');
-- csv: Zancadas con salto
update public.tipo_ejercicio set tipo = 'Fuerza' where nombre = 'Zancadas con salto' and (tipo is null or trim(tipo) = '');
commit;
