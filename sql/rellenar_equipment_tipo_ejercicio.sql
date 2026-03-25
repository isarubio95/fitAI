-- Rellenar equipment en tipo_ejercicio solo donde esté vacío
-- Ejecutar tras revisar. Fuente: sql/ejercicios.csv + inferencia por nombre.
begin;
-- csv: Abdominales en V con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Abdominales en V con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Aductor Externo Aislado en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Aductor Externo Aislado en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Aductor Externo en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Aductor Externo en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Aductor Externo en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Aductor Externo en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Aductor Interno Aislado en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Aductor Interno Aislado en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Aductor Interno en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Aductor Interno en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Aductor Interno en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Aductor Interno en Polea Baja' and (equipment is null or trim(equipment) = '');
-- inferido: Air Bike (Assault Bike)
update public.tipo_ejercicio set equipment = 'Cardio' where nombre = 'Air Bike (Assault Bike)' and (equipment is null or trim(equipment) = '');
-- csv: Apertura Aislada Declinada con Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Apertura Aislada Declinada con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Apertura Aislada en Punta
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Apertura Aislada en Punta' and (equipment is null or trim(equipment) = '');
-- csv: Aperturas con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Aperturas con Bandas' and (equipment is null or trim(equipment) = '');
-- inferido: Aperturas con Mancuernas (Flyes)
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Aperturas con Mancuernas (Flyes)' and (equipment is null or trim(equipment) = '');
-- csv: Aperturas Declinadas con giro con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Aperturas Declinadas con giro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Aperturas Declinadas con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Aperturas Declinadas con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Aperturas en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Aperturas en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Aperturas Extendidas en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Aperturas Extendidas en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Aperturas Inclinadas con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Aperturas Inclinadas con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Aperturas Traseras en Pronación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Aperturas Traseras en Pronación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Aperturas Traseras Neutras en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Aperturas Traseras Neutras en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Bicicleta Estática Deportiva
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Bicicleta Estática Deportiva' and (equipment is null or trim(equipment) = '');
-- csv: Bicicleta Estática Normal
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Bicicleta Estática Normal' and (equipment is null or trim(equipment) = '');
-- csv: Bicicleta Estática Reclinada
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Bicicleta Estática Reclinada' and (equipment is null or trim(equipment) = '');
-- csv: Brazada en Fitball
update public.tipo_ejercicio set equipment = 'Fitball' where nombre = 'Brazada en Fitball' and (equipment is null or trim(equipment) = '');
-- csv: Buenos días con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Buenos días con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Burpee
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Burpee' and (equipment is null or trim(equipment) = '');
-- csv: Burpee con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Burpee con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Burpee Jack
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Burpee Jack' and (equipment is null or trim(equipment) = '');
-- csv: Butt Kicks
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Butt Kicks' and (equipment is null or trim(equipment) = '');
-- csv: Caminar
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Caminar' and (equipment is null or trim(equipment) = '');
-- csv: Caminar a paso ligero
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Caminar a paso ligero' and (equipment is null or trim(equipment) = '');
-- csv: Caminar con peso
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Caminar con peso' and (equipment is null or trim(equipment) = '');
-- csv: Caminar con rodilla arriba
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Caminar con rodilla arriba' and (equipment is null or trim(equipment) = '');
-- csv: Caminar en cuclillas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Caminar en cuclillas' and (equipment is null or trim(equipment) = '');
-- csv: Carrera con salto
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Carrera con salto' and (equipment is null or trim(equipment) = '');
-- csv: Carrera continua
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Carrera continua' and (equipment is null or trim(equipment) = '');
-- csv: Carrera de pasos cortos
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Carrera de pasos cortos' and (equipment is null or trim(equipment) = '');
-- csv: Carrera de skater
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Carrera de skater' and (equipment is null or trim(equipment) = '');
-- csv: Carrera en Cinta
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Carrera en Cinta' and (equipment is null or trim(equipment) = '');
-- csv: Carrera en Cinta Inclinada
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Carrera en Cinta Inclinada' and (equipment is null or trim(equipment) = '');
-- csv: Carrera en zigzag
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Carrera en zigzag' and (equipment is null or trim(equipment) = '');
-- csv: Carrera hacia atrás
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Carrera hacia atrás' and (equipment is null or trim(equipment) = '');
-- csv: Carrera rápida en el sitio
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Carrera rápida en el sitio' and (equipment is null or trim(equipment) = '');
-- csv: Cocoons
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Cocoons' and (equipment is null or trim(equipment) = '');
-- csv: Cruce completo de Poleas
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Cruce completo de Poleas' and (equipment is null or trim(equipment) = '');
-- inferido: Cruce de Poleas (Alto a Bajo)
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Cruce de Poleas (Alto a Bajo)' and (equipment is null or trim(equipment) = '');
-- inferido: Cruce de Poleas (Bajo a Alto)
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Cruce de Poleas (Bajo a Alto)' and (equipment is null or trim(equipment) = '');
-- csv: Cruce inferior de Poleas
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Cruce inferior de Poleas' and (equipment is null or trim(equipment) = '');
-- csv: Cruce superior de Poleas
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Cruce superior de Poleas' and (equipment is null or trim(equipment) = '');
-- csv: Cruces en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Cruces en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Cruzado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Cruzado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Cruzado con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Crunch Cruzado con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Cruzado con piernas elevadas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Cruzado con piernas elevadas' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Cruzado estirado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Cruzado estirado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Diagonal de pie con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Crunch Diagonal de pie con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Diagonal de rodillas con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Crunch Diagonal de rodillas con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Diagonal en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Crunch Diagonal en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Doble Vertical en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Crunch Doble Vertical en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Crunch en Decúbito Lateral con curl de bíceps
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch en Decúbito Lateral con curl de bíceps' and (equipment is null or trim(equipment) = '');
-- csv: Crunch en Plancha Lateral
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch en Plancha Lateral' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Frog
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Frog' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Horizontal en Silla Romana
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Crunch Horizontal en Silla Romana' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior con flexión y extensión
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Inferior con flexión y extensión' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior con Rodillas Flexionadas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Inferior con Rodillas Flexionadas' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior Cruzado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Inferior Cruzado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior Cruzado Alterno
update public.tipo_ejercicio set equipment = 'Ninguno, Banco Plano' where nombre = 'Crunch Inferior Cruzado Alterno' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior en círculos
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Crunch Inferior en círculos' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior en Máquina Smith
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Crunch Inferior en Máquina Smith' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Crunch Inferior en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior Horizontal en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Crunch Inferior Horizontal en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior Inclinado con piernas estiradas
update public.tipo_ejercicio set equipment = 'Banco Inclinable' where nombre = 'Crunch Inferior Inclinado con piernas estiradas' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior sentado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Inferior sentado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Inferior sentado en banco
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Crunch Inferior sentado en banco' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Lateral con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Crunch Lateral con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Lateral con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Crunch Lateral con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Lateral de pie con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Crunch Lateral de pie con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Lateral de pie en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Crunch Lateral de pie en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Lateral de pie en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Crunch Lateral de pie en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Lateral en soporte
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Crunch Lateral en soporte' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Lateral Horizontal Alterno
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Lateral Horizontal Alterno' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Lateral Horizontal Concentrado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Lateral Horizontal Concentrado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Lateral Inclinado
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Crunch Lateral Inclinado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Superior' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior Concentrado Elevado
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Crunch Superior Concentrado Elevado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior Cruzado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Superior Cruzado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior Cruzado Concentrado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Superior Cruzado Concentrado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior Cruzado Concentrado Elevado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Crunch Superior Cruzado Concentrado Elevado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior Cruzado Declinado
update public.tipo_ejercicio set equipment = 'Banco Inclinable' where nombre = 'Crunch Superior Cruzado Declinado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior de pie con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Crunch Superior de pie con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior de pie con Polea delante
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Crunch Superior de pie con Polea delante' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior de rodillas con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Crunch Superior de rodillas con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior Declinado
update public.tipo_ejercicio set equipment = 'Banco Inclinable' where nombre = 'Crunch Superior Declinado' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior en Fitball
update public.tipo_ejercicio set equipment = 'Fitball' where nombre = 'Crunch Superior en Fitball' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior Horizontal en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Crunch Superior Horizontal en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior sentado con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Crunch Superior sentado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Crunch Superior Vertical Amplio en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Crunch Superior Vertical Amplio en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Cuarto de Sentadilla con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Cuarto de Sentadilla con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Cuarto de Sentadilla con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Cuarto de Sentadilla con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl a una mano en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl a una mano en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Curl Aislado con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl Aislado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Aislado en Pronación con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl Aislado en Pronación con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Aislado en Pronación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Aislado en Pronación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl Aislado en Supinación con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Aislado en Supinación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl Aislado hacia abajo con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl Aislado hacia abajo con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Aislado Largo en Supinación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Aislado Largo en Supinación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl Aislado Neutro con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl Aislado Neutro con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Alterno en Supinación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Curl Alterno en Supinación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Curl con giro Alterno con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl con giro Alterno con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl con peso libre
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Curl con peso libre' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado Cerrado con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl Concentrado Cerrado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado Cerrado con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Curl Concentrado Cerrado con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado Cerrado en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Concentrado Cerrado en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl Concentrado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado de Dedos con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl Concentrado de Dedos con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Curl Concentrado en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Pronación con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Curl Concentrado en Pronación con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Pronación con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl Concentrado en Pronación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Pronación con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl Concentrado en Pronación con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Pronación con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Concentrado en Pronación con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Supinación con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Curl Concentrado en Supinación con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Supinación con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl Concentrado en Supinación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Supinación con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl Concentrado en Supinación con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Supinación con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Concentrado en Supinación con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado en Supinación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Concentrado en Supinación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado Frontal Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Concentrado Frontal Aislado en Supinación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado Lateral Aislado en Supinación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Concentrado Lateral Aislado en Supinación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl Concentrado Neutral con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl Concentrado Neutral con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Banco Scott en Pronación Aislado con Polea
update public.tipo_ejercicio set equipment = 'Banco Scott, Polea' where nombre = 'Curl en Banco Scott en Pronación Aislado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Banco Scott en Pronación con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Scott, Mancuernas' where nombre = 'Curl en Banco Scott en Pronación con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Banco Scott en Pronación con Polea
update public.tipo_ejercicio set equipment = 'Banco Scott, Polea' where nombre = 'Curl en Banco Scott en Pronación con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Banco Scott en Supinación Aislado con Polea
update public.tipo_ejercicio set equipment = 'Banco Scott, Polea' where nombre = 'Curl en Banco Scott en Supinación Aislado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Banco Scott en Supinación con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Scott, Mancuernas' where nombre = 'Curl en Banco Scott en Supinación con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Banco Scott en Supinación con Polea
update public.tipo_ejercicio set equipment = 'Banco Scott, Polea' where nombre = 'Curl en Banco Scott en Supinación con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Banco Scott Neutro Aislado con Polea
update public.tipo_ejercicio set equipment = 'Banco Scott, Polea' where nombre = 'Curl en Banco Scott Neutro Aislado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Banco Scott Neutro con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Scott, Mancuernas' where nombre = 'Curl en Banco Scott Neutro con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Banco Scott Neutro con Polea
update public.tipo_ejercicio set equipment = 'Banco Scott, Polea' where nombre = 'Curl en Banco Scott Neutro con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl en caída con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Curl en caída con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Martillo Alterno con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl en Martillo Alterno con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Martillo con Barra
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Curl en Martillo con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Martillo Cruzado con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl en Martillo Cruzado con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Martillo en Máquina Scott
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Curl en Martillo en Máquina Scott' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Martillo en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl en Martillo en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Martillo en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl en Martillo en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Pronación Abierto con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl en Pronación Abierto con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Pronación con agarre Z en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl en Pronación con agarre Z en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Pronación con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl en Pronación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Pronación con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Curl en Pronación con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Pronación en banco Scott con Barra
update public.tipo_ejercicio set equipment = 'Banco Scott, Barra Larga' where nombre = 'Curl en Pronación en banco Scott con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Pronación en banco Scott con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Scott, Barra Z' where nombre = 'Curl en Pronación en banco Scott con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Pronación en Máquina Scott
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Curl en Pronación en Máquina Scott' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Abierto Con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl en Supinación Abierto Con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Abierto Con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Curl en Supinación Abierto Con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Abierto en banco Scott con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Scott, Barra Z' where nombre = 'Curl en Supinación Abierto en banco Scott con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Aislado con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Curl en Supinación Aislado con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Alterno con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Curl en Supinación Alterno con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Cerrado con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl en Supinación Cerrado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Cerrado Con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Curl en Supinación Cerrado Con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Cerrado en banco Scott con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Scott, Barra Z' where nombre = 'Curl en Supinación Cerrado en banco Scott con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Cerrado en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl en Supinación Cerrado en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación con agarre Z en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl en Supinación con agarre Z en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Curl en Supinación con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl en Supinación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Curl en Supinación con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Concentrado con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Curl en Supinación Concentrado con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Corto con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Curl en Supinación Corto con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación en banco Scott con Barra
update public.tipo_ejercicio set equipment = 'Banco Scott, Barra Larga' where nombre = 'Curl en Supinación en banco Scott con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación en Máquina Scott
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Curl en Supinación en Máquina Scott' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl en Supinación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl en Supinación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación hacia abajo con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Curl en Supinación hacia abajo con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación hacia abajo con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Scott, Barra Z' where nombre = 'Curl en Supinación hacia abajo con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Retraído con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl en Supinación Retraído con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl en Supinación Retraído en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl en Supinación Retraído en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl en V en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl en V en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl Femoral Aislado en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Curl Femoral Aislado en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Curl Femoral Horizontal en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Curl Femoral Horizontal en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Curl Femoral Libre
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Curl Femoral Libre' and (equipment is null or trim(equipment) = '');
-- csv: Curl Femoral Libre Asistido con Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Curl Femoral Libre Asistido con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl Femoral Vertical en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Curl Femoral Vertical en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Curl Femoral Vertical en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Femoral Vertical en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl Horizontal Cerrado en Supinación con Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Curl Horizontal Cerrado en Supinación con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl Horizontal con giro con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Curl Horizontal con giro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl Horizontal con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Curl Horizontal con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl Horizontal en Supinación con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Curl Horizontal en Supinación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl Horizontal en Supinación con Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Curl Horizontal en Supinación con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl Horizontal Inclinado con Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Curl Horizontal Inclinado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl Inclinado Alterno en Supinación con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Curl Inclinado Alterno en Supinación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl Inclinado con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Curl Inclinado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Inclinado con giro Alterno con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Curl Inclinado con giro Alterno con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl Inclinado Lateral con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Curl Inclinado Lateral con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl Inclinado Neutro Alterno con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Curl Inclinado Neutro Alterno con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl Lateral con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Curl Lateral con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Curl Lateral en Supinación Aislado con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Lateral en Supinación Aislado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl Lateral en Supinación con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Lateral en Supinación con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Curl Spider Aislado en Pronación con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Curl Spider Aislado en Pronación con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Spider Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Curl Spider Aislado en Supinación con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Spider Aislado Neutro con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Curl Spider Aislado Neutro con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Spider en Pronación con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Curl Spider en Pronación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Spider en Supinación con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Curl Spider en Supinación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Spider en Supinación con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Z' where nombre = 'Curl Spider en Supinación con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Curl Spider Neutro con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Curl Spider Neutro con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Curl Vertical de Dedos con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl Vertical de Dedos con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Vertical en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Curl Vertical en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Curl Vertical en Supinación con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Curl Vertical en Supinación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Curl Vertical en Supinación con Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Curl Vertical en Supinación con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Desplazamientos de Boxeo
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Desplazamientos de Boxeo' and (equipment is null or trim(equipment) = '');
-- csv: Dominada
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada' and (equipment is null or trim(equipment) = '');
-- csv: Dominada a una mano
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada a una mano' and (equipment is null or trim(equipment) = '');
-- csv: Dominada a una mano asistida
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada a una mano asistida' and (equipment is null or trim(equipment) = '');
-- csv: Dominada Abierta
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada Abierta' and (equipment is null or trim(equipment) = '');
-- csv: Dominada Cerrada
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada Cerrada' and (equipment is null or trim(equipment) = '');
-- csv: Dominada Cerrada Corta
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada Cerrada Corta' and (equipment is null or trim(equipment) = '');
-- csv: Dominada Cerrada en Martillo
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada Cerrada en Martillo' and (equipment is null or trim(equipment) = '');
-- csv: Dominada Circular en Supinación
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada Circular en Supinación' and (equipment is null or trim(equipment) = '');
-- csv: Dominada en Supinación
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada en Supinación' and (equipment is null or trim(equipment) = '');
-- csv: Dominada Invertida
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada Invertida' and (equipment is null or trim(equipment) = '');
-- csv: Dominada Lateral
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada Lateral' and (equipment is null or trim(equipment) = '');
-- csv: Dominada Mixta
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada Mixta' and (equipment is null or trim(equipment) = '');
-- csv: Dominada Trasera
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Dominada Trasera' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Completa con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Elevación Completa con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de Cadera con flexión de rodillas v1
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Elevación de Cadera con flexión de rodillas v1' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de Cadera con flexión de rodillas v2
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Elevación de Cadera con flexión de rodillas v2' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de Cadera con piernas estiradas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Elevación de Cadera con piernas estiradas' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de Cadera con piernas estiradas v2
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Elevación de Cadera con piernas estiradas v2' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de Cadera con piernas flexionadas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Elevación de Cadera con piernas flexionadas' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de piernas alternas Colgado
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Elevación de piernas alternas Colgado' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de piernas colgado con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Elevación de piernas colgado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de piernas con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Elevación de piernas con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de Piernas con torsión en soporte
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Elevación de Piernas con torsión en soporte' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de piernas en Fitball
update public.tipo_ejercicio set equipment = 'Fitball' where nombre = 'Elevación de piernas en Fitball' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de piernas estiradas Colgado
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Elevación de piernas estiradas Colgado' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de piernas estiradas en soporte
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Elevación de piernas estiradas en soporte' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de piernas flexionadas Colgado
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Elevación de piernas flexionadas Colgado' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de piernas flexionadas en soporte
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Elevación de piernas flexionadas en soporte' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de piernas laterales Colgado
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Elevación de piernas laterales Colgado' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de rodillas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Elevación de rodillas' and (equipment is null or trim(equipment) = '');
-- csv: Elevación de rodillas con apoyo
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Elevación de rodillas con apoyo' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal Aislada en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Elevación Frontal Aislada en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal Cerrada en Pronación con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Elevación Frontal Cerrada en Pronación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal con giros con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Elevación Frontal con giros con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevación Frontal con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal Declinada Abierta con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Z' where nombre = 'Elevación Frontal Declinada Abierta con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal Declinada con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevación Frontal Declinada con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal Declinada en Pronación con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Elevación Frontal Declinada en Pronación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Elevación Frontal en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal en Pronación con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Elevación Frontal en Pronación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal Horizontal en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Elevación Frontal Horizontal en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal Inclinada en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Elevación Frontal Inclinada en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Frontal Inclinada en Supinación con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Z' where nombre = 'Elevación Frontal Inclinada en Supinación con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Lateral Aislada con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Elevación Lateral Aislada con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Lateral Aislada en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Elevación Lateral Aislada en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Lateral Concentrada en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Elevación Lateral Concentrada en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Lateral en Punta
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Elevación Lateral en Punta' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Lateral Horizontal Aislada con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Elevación Lateral Horizontal Aislada con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Lateral Horizontal en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Elevación Lateral Horizontal en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Lateral Inclinada Aislada con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevación Lateral Inclinada Aislada con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Total Colgado
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Elevación Total Colgado' and (equipment is null or trim(equipment) = '');
-- csv: Elevación Trasera con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Elevación Trasera con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Circulares con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Circulares con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Completas con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Elevaciones Completas con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Completas con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Completas con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Frontales con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Elevaciones Frontales con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Frontales Declinadas en Pronación con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevaciones Frontales Declinadas en Pronación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Frontales Declinadas Neutras con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevaciones Frontales Declinadas Neutras con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Frontales en Pronación con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Frontales en Pronación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Frontales en Supinación con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Frontales en Supinación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Frontales Inclinadas con giro con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevaciones Frontales Inclinadas con giro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Frontales Inclinadas en Pronación con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevaciones Frontales Inclinadas en Pronación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Lateral - Frontal Alto con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Lateral - Frontal Alto con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Lateral - Frontal con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Lateral - Frontal con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Elevaciones Laterales con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales Declinadas con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevaciones Laterales Declinadas con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales Declinadas en Pronación con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevaciones Laterales Declinadas en Pronación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales Declinadas en Supinación con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevaciones Laterales Declinadas en Supinación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales Declinadas Neutras con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Elevaciones Laterales Declinadas Neutras con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales Delanteras con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Laterales Delanteras con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Elevaciones Laterales en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales en Supinación con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Laterales en Supinación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales Horizontales con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Laterales Horizontales con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Elevaciones Laterales Neutras con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Elevaciones Laterales Neutras con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Encogimiento Aislado con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Encogimiento Aislado con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Encogimientos con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Encogimientos con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos Concentrados en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Encogimientos Concentrados en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos Declinados con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Encogimientos Declinados con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos Delanteros con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Encogimientos Delanteros con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Encogimientos en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos en Paralelas
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Encogimientos en Paralelas' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Encogimientos en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos en Press Militar con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Encogimientos en Press Militar con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos Horizontales en Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Encogimientos Horizontales en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos Inclinados con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Encogimientos Inclinados con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos Laterales con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Encogimientos Laterales con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos Libres en Banco
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Encogimientos Libres en Banco' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos Sentado con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Encogimientos Sentado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Encogimientos Traseros con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Encogimientos Traseros con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Concentrada en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Concentrada en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Concentrada en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Concentrada en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Cuádriceps Aislada con Banda
update public.tipo_ejercicio set equipment = 'Banco Plano, Bandas' where nombre = 'Extensión de Cuádriceps Aislada con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Cuádriceps con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Extensión de Cuádriceps con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Cuádriceps en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión de Cuádriceps en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelo Aislado con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensión de Gemelo Aislado con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelo Aislado Delantero con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensión de Gemelo Aislado Delantero con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelo Aislado en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión de Gemelo Aislado en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelo Aislado sentado con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas, Otro' where nombre = 'Extensión de Gemelo Aislado sentado con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensión de Gemelos con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos Concentrada en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión de Gemelos Concentrada en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos de pie
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Extensión de Gemelos de pie' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos de pie con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga, Otro' where nombre = 'Extensión de Gemelos de pie con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos de pie con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas, Otro' where nombre = 'Extensión de Gemelos de pie con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos Declinada en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión de Gemelos Declinada en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos en Máquina con carga Inferior
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión de Gemelos en Máquina con carga Inferior' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos en Máquina con carga Superior
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión de Gemelos en Máquina con carga Superior' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos en Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Extensión de Gemelos en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos en Prensa
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión de Gemelos en Prensa' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos Inclinada en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión de Gemelos Inclinada en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos sentado con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Extensión de Gemelos sentado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos sentado con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas, Otro' where nombre = 'Extensión de Gemelos sentado con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Gemelos sentado en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión de Gemelos sentado en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensión de Glúteos en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión de Glúteos en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Declinada con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Extensión Declinada con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Delante-Detrás con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Extensión Delante-Detrás con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Diagonal en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Diagonal en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Extensión en caída con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensión en caída con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Frontal Aislada con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensión Frontal Aislada con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Frontal Aislada en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Frontal Aislada en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Frontal con Arnés
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Extensión Frontal con Arnés' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Frontal con Disco
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Extensión Frontal con Disco' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Frontal en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión Frontal en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Frontal en Polea
update public.tipo_ejercicio set equipment = 'Polea, Otro' where nombre = 'Extensión Frontal en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Extensión hacia abajo con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensión hacia abajo con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Horizontal con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Extensión Horizontal con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Horizontal con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Z' where nombre = 'Extensión Horizontal con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Horizontal Concentrada Interna con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Extensión Horizontal Concentrada Interna con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Horizontal Concentrada Superior con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Extensión Horizontal Concentrada Superior con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Horizontal en Martillo en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Horizontal en Martillo en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Inclinada con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Z' where nombre = 'Extensión Inclinada con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Lateral Aislada con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensión Lateral Aislada con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Lateral Aislada en Supinación en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Lateral Aislada en Supinación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Lateral con Arnés
update public.tipo_ejercicio set equipment = 'Banco Plano, Otro' where nombre = 'Extensión Lateral con Arnés' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Lateral en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión Lateral en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Trasera Aislada en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Trasera Aislada en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Trasera Aislada en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Trasera Aislada en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Trasera con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Extensión Trasera con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Trasera en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensión Trasera en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical Aislada con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Extensión Vertical Aislada con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical Aislada en Pronación en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Vertical Aislada en Pronación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical Aislada en Pronación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Vertical Aislada en Pronación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical Aislada en Supinación en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Vertical Aislada en Supinación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensión Vertical con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Extensión Vertical con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Extensión Vertical con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical en Pronación en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Vertical en Pronación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical en Pronación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Vertical en Pronación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical en Supinación en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Vertical en Supinación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical Neutra en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Vertical Neutra en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensión Vertical Neutra en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensión Vertical Neutra en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones Concentradas en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Extensiones Concentradas en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones Cruzadas en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensiones Cruzadas en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones Cruzadas en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Extensiones Cruzadas en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones en caída libre
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Extensiones en caída libre' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensiones en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones en Pronación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Extensiones en Pronación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones Horizontales Internas con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Extensiones Horizontales Internas con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones Inclinadas con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Extensiones Inclinadas con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones Laterales Amplias con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensiones Laterales Amplias con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Extensiones Laterales con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Extensiones Laterales con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Flexión Frontal con Disco
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Flexión Frontal con Disco' and (equipment is null or trim(equipment) = '');
-- csv: Flexión Frontal en Polea
update public.tipo_ejercicio set equipment = 'Polea, Otro' where nombre = 'Flexión Frontal en Polea' and (equipment is null or trim(equipment) = '');
-- inferido: Flexiones (Push-ups)
update public.tipo_ejercicio set equipment = 'Peso corporal' where nombre = 'Flexiones (Push-ups)' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones a una mano
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones a una mano' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones a una mano asistidas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones a una mano asistidas' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Abiertas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones Abiertas' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Archer
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones Archer' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Básicas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones Básicas' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Cerradas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones Cerradas' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones con codos
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones con codos' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones con Soportes
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Flexiones con Soportes' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Cruzadas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones Cruzadas' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Declinadas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones Declinadas' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Diamante
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones Diamante' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones en supinación
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones en supinación' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Pliométricas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones Pliométricas' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Pliométricas con Palmada
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Flexiones Pliométricas con Palmada' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Verticales con Banco
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Flexiones Verticales con Banco' and (equipment is null or trim(equipment) = '');
-- csv: Flexiones Verticales entre Bancos
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Flexiones Verticales entre Bancos' and (equipment is null or trim(equipment) = '');
-- csv: Fondos Cerrados en Paralelas
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Fondos Cerrados en Paralelas' and (equipment is null or trim(equipment) = '');
-- csv: Fondos Coreanos en Barra
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Fondos Coreanos en Barra' and (equipment is null or trim(equipment) = '');
-- csv: Fondos en banco
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Fondos en banco' and (equipment is null or trim(equipment) = '');
-- csv: Fondos en Barra
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Fondos en Barra' and (equipment is null or trim(equipment) = '');
-- csv: Fondos en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Fondos en Máquina' and (equipment is null or trim(equipment) = '');
-- inferido: Fondos en Paralelas (Dips)
update public.tipo_ejercicio set equipment = 'Peso corporal' where nombre = 'Fondos en Paralelas (Dips)' and (equipment is null or trim(equipment) = '');
-- csv: Fondos en Pronación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Fondos en Pronación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv (alias): Fondos entre Bancos
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Fondos entre Bancos' and (equipment is null or trim(equipment) = '');
-- csv: Fondos Imposibles
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Fondos Imposibles' and (equipment is null or trim(equipment) = '');
-- csv: Giros de cintura de pie con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Giros de cintura de pie con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Giros de cintura doblado con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Giros de cintura doblado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Giros de cintura sentado con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Giros de cintura sentado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Giros de cintura sentado con Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Giros de cintura sentado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Giros Inferiores de Oblicuos en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Giros Inferiores de Oblicuos en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Giros sentado en Fitball
update public.tipo_ejercicio set equipment = 'Fitball, Otro' where nombre = 'Giros sentado en Fitball' and (equipment is null or trim(equipment) = '');
-- csv: Giros Superiores de Oblicuos en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Giros Superiores de Oblicuos en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Giros Superiores Sentado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Giros Superiores Sentado' and (equipment is null or trim(equipment) = '');
-- csv: Giros Superiores Sentado con peso
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Giros Superiores Sentado con peso' and (equipment is null or trim(equipment) = '');
-- csv: Golpes alternos
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Golpes alternos' and (equipment is null or trim(equipment) = '');
-- csv: Half Wipers con piernas estiradas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Half Wipers con piernas estiradas' and (equipment is null or trim(equipment) = '');
-- csv: Half Wipers con piernas flexionadas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Half Wipers con piernas flexionadas' and (equipment is null or trim(equipment) = '');
-- csv: Hand Grip
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Hand Grip' and (equipment is null or trim(equipment) = '');
-- csv: Hip Thrust Aislado con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Hip Thrust Aislado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Hip Thrust con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Hip Thrust con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Hip Thrust con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Hip Thrust con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Hip Thrust con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Hip Thrust con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Hip Thrust Declinado con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Hip Thrust Declinado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Hip Thrust Inclinado con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Hip Thrust Inclinado con Barra' and (equipment is null or trim(equipment) = '');
-- csv (alias): Hiperextensiones (Lumbares)
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Hiperextensiones (Lumbares)' and (equipment is null or trim(equipment) = '');
-- csv: Hiperextensiones en Fitball
update public.tipo_ejercicio set equipment = 'Fitball' where nombre = 'Hiperextensiones en Fitball' and (equipment is null or trim(equipment) = '');
-- csv: Hiperextensiones en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Hiperextensiones en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Hiperextensiones Inclinadas
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Hiperextensiones Inclinadas' and (equipment is null or trim(equipment) = '');
-- csv: Hollow Hold
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Hollow Hold' and (equipment is null or trim(equipment) = '');
-- csv: Inclinación diagonal en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Inclinación diagonal en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Jackknife Sit-Up
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Jackknife Sit-Up' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Abierto Doble Neutro en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Jalón Abierto Doble Neutro en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Abierto en Pronación en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Abierto en Pronación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Abierto en Supinación en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Abierto en Supinación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Abierto Neutro en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Abierto Neutro en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Aislado en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Jalón Aislado en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Aislado Prono-Neutro en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Aislado Prono-Neutro en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Aislado Prono-Supino en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Aislado Prono-Supino en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Cerrado con Cuerda en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Cerrado con Cuerda en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Cerrado en Pronación en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Cerrado en Pronación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Cerrado Neutro con Inclinación en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Cerrado Neutro con Inclinación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Cerrado Neutro en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Cerrado Neutro en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón en Pronación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Jalón en Pronación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Jalón en Pronación en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón en Pronación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón en Supinación con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Jalón en Supinación con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Jalón en Supinación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Jalón en Supinación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Jalón en Supinación en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón en Supinación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Neutro con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Jalón Neutro con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Jalón Trasero Abierto en Pronación en Polea Alta
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Jalón Trasero Abierto en Pronación en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Janda Sit-up
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Janda Sit-up' and (equipment is null or trim(equipment) = '');
-- csv: Jumping Jacks
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Jumping Jacks' and (equipment is null or trim(equipment) = '');
-- csv: Krankcycle
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Krankcycle' and (equipment is null or trim(equipment) = '');
-- csv: Máquina de Remo
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Máquina de Remo' and (equipment is null or trim(equipment) = '');
-- csv: Máquina de Step
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Máquina de Step' and (equipment is null or trim(equipment) = '');
-- csv: Máquina Elíptica
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Máquina Elíptica' and (equipment is null or trim(equipment) = '');
-- csv: Máquina Escaladora
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Máquina Escaladora' and (equipment is null or trim(equipment) = '');
-- csv: Marcha Horizontal Aislada con pierna extendida
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Marcha Horizontal Aislada con pierna extendida' and (equipment is null or trim(equipment) = '');
-- csv: Marcha Horizontal Alterna
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Marcha Horizontal Alterna' and (equipment is null or trim(equipment) = '');
-- csv: Marcha Horizontal Alterna con palmada
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Marcha Horizontal Alterna con palmada' and (equipment is null or trim(equipment) = '');
-- csv: Media Sentadilla con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Media Sentadilla con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Media Sentadilla con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Media Sentadilla con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Mountain Climbers
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Mountain Climbers' and (equipment is null or trim(equipment) = '');
-- csv: Pájaros Aislados con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Pájaros Aislados con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Pájaros Aislados en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Pájaros Aislados en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Pájaros de pie con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Pájaros de pie con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Pájaros de pie con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Pájaros de pie con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Pájaros sentado con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Pájaros sentado con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Paso lateral con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Paso lateral con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Patadas altas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Patadas altas' and (equipment is null or trim(equipment) = '');
-- csv: Patadas Traseras Alternas con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Patadas Traseras Alternas con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Patadas Traseras con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Patadas Traseras con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Patadas Traseras en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Patadas Traseras en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto a una pierna con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Peso Muerto a una pierna con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto a una pierna con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Peso Muerto a una pierna con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto Abierto con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Peso Muerto Abierto con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto Asistido con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga, Otro' where nombre = 'Peso Muerto Asistido con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Peso Muerto con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Peso Muerto con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Peso Muerto con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Peso Muerto con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Peso Muerto en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto en Punta
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Peso Muerto en Punta' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto Rígido con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Peso Muerto Rígido con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto Rumano con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Peso Muerto Rumano con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto Rumano con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Peso Muerto Rumano con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Peso Muerto Sumo con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Peso Muerto Sumo con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Pies rápidos agachado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Pies rápidos agachado' and (equipment is null or trim(equipment) = '');
-- csv: Pies rápidos de pie
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Pies rápidos de pie' and (equipment is null or trim(equipment) = '');
-- csv: Plancha
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Plancha' and (equipment is null or trim(equipment) = '');
-- csv: Plancha con rodillas
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Plancha con rodillas' and (equipment is null or trim(equipment) = '');
-- csv: Plancha Lateral
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Plancha Lateral' and (equipment is null or trim(equipment) = '');
-- csv: Plancha Lateral Inclinada
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Plancha Lateral Inclinada' and (equipment is null or trim(equipment) = '');
-- csv: Pliegue completo con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Pliegue completo con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Pliegue completo entre Poleas
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Pliegue completo entre Poleas' and (equipment is null or trim(equipment) = '');
-- csv: Plyo Jacks
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Plyo Jacks' and (equipment is null or trim(equipment) = '');
-- csv: Post-Workout
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Post-Workout' and (equipment is null or trim(equipment) = '');
-- csv: Pre-Workout
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Pre-Workout' and (equipment is null or trim(equipment) = '');
-- csv: Prensa Inclinada
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Prensa Inclinada' and (equipment is null or trim(equipment) = '');
-- csv: Prensa Inclinada Cerrada
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Prensa Inclinada Cerrada' and (equipment is null or trim(equipment) = '');
-- csv: Press a una mano con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Press a una mano con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Abierto Neutro con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Abierto Neutro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Aislado en Punta
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Aislado en Punta' and (equipment is null or trim(equipment) = '');
-- csv: Press Aislado en Supinación con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Aislado en Supinación con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Press Arnold Abierto con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Press Arnold Abierto con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Arnold con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Arnold con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca Abierto con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Press Banca Abierto con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca Abierto Inverso con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Press Banca Abierto Inverso con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca Aislado con Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Press Banca Aislado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca Alterno con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Banca Alterno con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca Cerrado con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Z' where nombre = 'Press Banca Cerrado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca con Bandas
update public.tipo_ejercicio set equipment = 'Banco Plano, Bandas' where nombre = 'Press Banca con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Press Banca con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca con giro con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Banca con giro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Banca con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Banca en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca en Supinación Aislado con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Banca en Supinación Aislado con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Press Banca Neutro con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Banca Neutro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Cerrado con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Press Cerrado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Cerrado en Máquina Smith
update public.tipo_ejercicio set equipment = 'Banco Plano, Máquina' where nombre = 'Press Cerrado en Máquina Smith' and (equipment is null or trim(equipment) = '');
-- csv: Press Cerrado en Supinación con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Press Cerrado en Supinación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Cerrado Neutro con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Cerrado Neutro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Cubano Circular con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Press Cubano Circular con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Cubano con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Press Cubano con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Declinado Aislado con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Declinado Aislado con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Press Declinado Aislado con Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Press Declinado Aislado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Declinado con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Press Declinado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Declinado con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Declinado con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Declinado Inverso con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Press Declinado Inverso con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Declinado Neutro con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Declinado Neutro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés con Bandas
update public.tipo_ejercicio set equipment = 'Banco Plano, Bandas' where nombre = 'Press Francés con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Press Francés con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Z' where nombre = 'Press Francés con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Francés con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Press Francés con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés Declinado Abierto con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Z' where nombre = 'Press Francés Declinado Abierto con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés Declinado Cerrado con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Z' where nombre = 'Press Francés Declinado Cerrado con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés Declinado con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Press Francés Declinado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés Inclinado Alterno con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Francés Inclinado Alterno con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés Inclinado con Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Press Francés Inclinado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés Inverso con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Press Francés Inverso con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés Neutro con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Press Francés Neutro con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Francés tras nuca con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Press Francés tras nuca con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal a una mano en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Press Frontal a una mano en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal Cerrado con Poleas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Press Frontal Cerrado con Poleas' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal Cerrado en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Frontal Cerrado en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal con Poleas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Press Frontal con Poleas' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Frontal en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal en Pronación con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Press Frontal en Pronación con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal Inclinado con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Press Frontal Inclinado con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal Inferior en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Frontal Inferior en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal Neutral con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Press Frontal Neutral con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal Neutral con Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Press Frontal Neutral con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Frontal Superior en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Frontal Superior en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Horizontal con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Press Horizontal con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado Aislado con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Inclinado Aislado con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado Aislado con Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Press Inclinado Aislado con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado Cerrado con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Press Inclinado Cerrado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado Cerrado Neutro con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Inclinado Cerrado Neutro con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Press Inclinado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Inclinado en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado en Supinación con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Press Inclinado en Supinación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado en Supinación con giro con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Inclinado en Supinación con giro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Inclinado en Supinación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Inclinado Inverso con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Press Inclinado Inverso con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Abierto con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Press Militar Abierto con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Aislado con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Press Militar Aislado con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Cerrado con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Press Militar Cerrado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Cerrado en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Press Militar Cerrado en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Press Militar con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Press Militar con Barra' and (equipment is null or trim(equipment) = '');
-- inferido: Press Militar con Barra (Overhead)
update public.tipo_ejercicio set equipment = 'Barra' where nombre = 'Press Militar con Barra (Overhead)' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar con giro con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Press Militar con giro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Declinado en Pronación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Militar Declinado en Pronación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Press Militar en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar en Pronación con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Press Militar en Pronación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar en Pronación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Militar en Pronación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar en Supinación con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Press Militar en Supinación con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar en Supinación con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Press Militar en Supinación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Inclinado en Pronación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Militar Inclinado en Pronación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Inclinado Neutro en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Militar Inclinado Neutro en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Libre
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Press Militar Libre' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Libre entre Bancos
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Press Militar Libre entre Bancos' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Mixto con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Press Militar Mixto con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Neutro Alterno en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Press Militar Neutro Alterno en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Neutro con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Press Militar Neutro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Neutro en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Press Militar Neutro en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Trasero con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Press Militar Trasero con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Press Militar Trasero con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Press Militar Trasero con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Press Scott con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Press Scott con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Press Svend
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Press Svend' and (equipment is null or trim(equipment) = '');
-- csv: Puente Lateral
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Puente Lateral' and (equipment is null or trim(equipment) = '');
-- csv: Puente Lateral con Abducción de Cadera
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Puente Lateral con Abducción de Cadera' and (equipment is null or trim(equipment) = '');
-- csv: Puente Lateral con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Puente Lateral con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Puente Lateral Declinado
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Puente Lateral Declinado' and (equipment is null or trim(equipment) = '');
-- csv: Puente Lateral Declinado Aislada
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Puente Lateral Declinado Aislada' and (equipment is null or trim(equipment) = '');
-- csv: Pullover con Barra
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Larga' where nombre = 'Pullover con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Pullover con Barra Z
update public.tipo_ejercicio set equipment = 'Banco Plano, Barra Z' where nombre = 'Pullover con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Pullover con cuerda en Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Pullover con cuerda en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Pullover con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Pullover con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Pullover Declinado Cerrado con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Pullover Declinado Cerrado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Pullover Declinado con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Pullover Declinado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Pullover Extenso con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Pullover Extenso con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Pulse Up
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Pulse Up' and (equipment is null or trim(equipment) = '');
-- csv: Remo Aislado con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Remo Aislado con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Remo Aislado con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Remo Aislado con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Remo Aislado en Pronación en Máquina Smith
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo Aislado en Pronación en Máquina Smith' and (equipment is null or trim(equipment) = '');
-- csv: Remo Aislado en Punta
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo Aislado en Punta' and (equipment is null or trim(equipment) = '');
-- csv: Remo Aislado Neutro en Máquina Smith
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo Aislado Neutro en Máquina Smith' and (equipment is null or trim(equipment) = '');
-- csv: Remo al mentón Cerrado con Barra Z
update public.tipo_ejercicio set equipment = 'Barra Z' where nombre = 'Remo al mentón Cerrado con Barra Z' and (equipment is null or trim(equipment) = '');
-- csv: Remo al mentón con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo al mentón con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Remo al mentón con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Remo al mentón con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Remo al mentón con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Remo al mentón con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Remo al mentón en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo al mentón en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo al mentón Horizontal en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo al mentón Horizontal en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Colgado en Pronación
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Remo Colgado en Pronación' and (equipment is null or trim(equipment) = '');
-- csv: Remo Colgado en Supinación
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Remo Colgado en Supinación' and (equipment is null or trim(equipment) = '');
-- csv: Remo con giro Aislado en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo con giro Aislado en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Remo Cruzado en Polea Alta
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Cruzado en Polea Alta' and (equipment is null or trim(equipment) = '');
-- csv: Remo Declinado Abierto en Pronación en Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Remo Declinado Abierto en Pronación en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Declinado Alterno con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Declinado Alterno con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Declinado en Pronación en Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Remo Declinado en Pronación en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Declinado Neutro en Pronación en Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Remo Declinado Neutro en Pronación en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo en Barra T en Pronación
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo en Barra T en Pronación' and (equipment is null or trim(equipment) = '');
-- csv: Remo en Barra T en Supinación
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo en Barra T en Supinación' and (equipment is null or trim(equipment) = '');
-- csv: Remo en Pronación Abierto con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Remo en Pronación Abierto con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Remo en Pronación con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Remo en Pronación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Remo en Pronación con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Remo en Pronación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Remo en Punta
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo en Punta' and (equipment is null or trim(equipment) = '');
-- csv: Remo en Supinación con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Remo en Supinación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Remo en Supinación con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Remo en Supinación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Remo en Supinación en Máquina Smith
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo en Supinación en Máquina Smith' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal Abierto en Pronación en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Horizontal Abierto en Pronación en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal Aislado con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Horizontal Aislado con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal Aislado en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Horizontal Aislado en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal Cerrado en Pronación en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Horizontal Cerrado en Pronación en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal Cerrado Neutro Amplio en Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Remo Horizontal Cerrado Neutro Amplio en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal Cerrado Neutro en Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Remo Horizontal Cerrado Neutro en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Horizontal con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal en Pronación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo Horizontal en Pronación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal en Pronación en Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Remo Horizontal en Pronación en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal en Supinación en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo Horizontal en Supinación en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal Neutro en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Remo Horizontal Neutro en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal Neutro en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Horizontal Neutro en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Horizontal Superior con Cuerda en Polea
update public.tipo_ejercicio set equipment = 'Banco Plano, Polea' where nombre = 'Remo Horizontal Superior con Cuerda en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Inclinado Alterno con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Inclinado Alterno con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Inclinado en Pronación con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Remo Inclinado en Pronación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Remo Inclinado en Pronación con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Remo Inclinado en Pronación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Inclinado en Supinación con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Remo Inclinado en Supinación con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Remo Inclinado en Supinación con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Remo Inclinado en Supinación con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Inclinado Neutro con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Remo Inclinado Neutro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Inferior Aislado con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Inferior Aislado con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Remo Inferior Aislado en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Inferior Aislado en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Remo Inferior en Pronación en Polea Baja
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Inferior en Pronación en Polea Baja' and (equipment is null or trim(equipment) = '');
-- csv: Remo Libre Declinado con Cuerdas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Libre Declinado con Cuerdas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Libre Horizontal Abierto con Cuerdas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Libre Horizontal Abierto con Cuerdas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Libre Horizontal Cerrado con Cuerda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Libre Horizontal Cerrado con Cuerda' and (equipment is null or trim(equipment) = '');
-- csv: Remo Libre Inclinado Abierto con Cuerda
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Remo Libre Inclinado Abierto con Cuerda' and (equipment is null or trim(equipment) = '');
-- csv: Remo Libre Inclinado Cerrado con Cuerda
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Remo Libre Inclinado Cerrado con Cuerda' and (equipment is null or trim(equipment) = '');
-- csv: Remo Neutro con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Remo Neutro con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Superior Aislado con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Superior Aislado con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Remo Superior Aislado con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Plano, Mancuernas' where nombre = 'Remo Superior Aislado con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Remo Superior Aislado en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Superior Aislado en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Superior con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Remo Superior con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Remo Superior con Cuerda en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Superior con Cuerda en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Superior en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Superior en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Superior en Pronación en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Remo Superior en Pronación en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Remo Superior Trasero con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Remo Superior Trasero con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Retracción Escapular Colgado
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Retracción Escapular Colgado' and (equipment is null or trim(equipment) = '');
-- csv: Retracción Escapular entre Bancos
update public.tipo_ejercicio set equipment = 'Banco Plano' where nombre = 'Retracción Escapular entre Bancos' and (equipment is null or trim(equipment) = '');
-- csv: Rodilla al codo
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Rodilla al codo' and (equipment is null or trim(equipment) = '');
-- csv: Rodilla al codo con giro
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Rodilla al codo con giro' and (equipment is null or trim(equipment) = '');
-- csv: Rodilla al codo con sentadilla
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Rodilla al codo con sentadilla' and (equipment is null or trim(equipment) = '');
-- csv: Roll Reverse Crunch
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Roll Reverse Crunch' and (equipment is null or trim(equipment) = '');
-- csv: Rotación Concentrada con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Rotación Concentrada con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Rotación de Aductor Externa con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Rotación de Aductor Externa con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Rotación de Aductor Interna con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Rotación de Aductor Interna con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Rotación de Cadera Externa con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Rotación de Cadera Externa con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Rotación de Cadera Interna con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Rotación de Cadera Interna con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Rotación Externa Aislada con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Rotación Externa Aislada con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Rotación Externa Aislada en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Rotación Externa Aislada en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Rotación Externa Concentrada con Mancuerna
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Rotación Externa Concentrada con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Rotación Interna Aislada en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Rotación Interna Aislada en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Rotación Vertical Aislada con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Rotación Vertical Aislada con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Rotación Vertical Aislada en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Rotación Vertical Aislada en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Russian Twist
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Russian Twist' and (equipment is null or trim(equipment) = '');
-- csv: Russian Twist con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Russian Twist con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Russian Twist en Fitball con Polea
update public.tipo_ejercicio set equipment = 'Fitball, Polea' where nombre = 'Russian Twist en Fitball con Polea' and (equipment is null or trim(equipment) = '');
-- csv: Salto alterno en el sitio
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Salto alterno en el sitio' and (equipment is null or trim(equipment) = '');
-- csv: Salto con Cuerda Alterno Alto
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Salto con Cuerda Alterno Alto' and (equipment is null or trim(equipment) = '');
-- csv: Salto con Cuerda Alterno Normal
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Salto con Cuerda Alterno Normal' and (equipment is null or trim(equipment) = '');
-- csv: Salto con Cuerda Alto
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Salto con Cuerda Alto' and (equipment is null or trim(equipment) = '');
-- csv: Salto con Cuerda Lateral
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Salto con Cuerda Lateral' and (equipment is null or trim(equipment) = '');
-- csv: Salto con Cuerda Normal
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Salto con Cuerda Normal' and (equipment is null or trim(equipment) = '');
-- csv: Salto con desplazamiento lateral
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Salto con desplazamiento lateral' and (equipment is null or trim(equipment) = '');
-- csv: Salto con desplazamiento lateral cruzado
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Salto con desplazamiento lateral cruzado' and (equipment is null or trim(equipment) = '');
-- csv: Salto de esquí
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Salto de esquí' and (equipment is null or trim(equipment) = '');
-- csv: Saltos rodillas en cuclillas con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Saltos rodillas en cuclillas con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla a una pierna con Banda Debajo
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Sentadilla a una pierna con Banda Debajo' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla a una pierna con Banda Delante
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Sentadilla a una pierna con Banda Delante' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla a una pierna con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Sentadilla a una pierna con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla a una pierna con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Sentadilla a una pierna con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla Abierta con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Sentadilla Abierta con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla Aislada Asistida con Cuerda
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Sentadilla Aislada Asistida con Cuerda' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla Asistida con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas, Otro' where nombre = 'Sentadilla Asistida con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla Cerrada Inclinada en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Sentadilla Cerrada Inclinada en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Sentadilla con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Sentadilla con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Sentadilla con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla con Poleas
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Sentadilla con Poleas' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla con salto con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Sentadilla con salto con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla con salto con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Sentadilla con salto con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Sentadilla en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla en Pared con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Sentadilla en Pared con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla en Punta
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Sentadilla en Punta' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla en zancada con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Sentadilla en zancada con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla en zancada inclinada con Barra
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Barra Larga' where nombre = 'Sentadilla en zancada inclinada con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla en zancada inclinada con Mancuernas
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Mancuernas' where nombre = 'Sentadilla en zancada inclinada con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla Profunda con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Sentadilla Profunda con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla Sumo con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Sentadilla Sumo con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla Sumo con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Sentadilla Sumo con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Sentadilla Sumo Inclinada en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Sentadilla Sumo Inclinada en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Serratos Aislados en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Serratos Aislados en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Serratos con Cuerda en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Serratos con Cuerda en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Serratos con giro en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Serratos con giro en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Serratos Inclinados Cerrados con Barra en Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Serratos Inclinados Cerrados con Barra en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Serratos Inclinados con Barra en Polea
update public.tipo_ejercicio set equipment = 'Banco Inclinable, Polea' where nombre = 'Serratos Inclinados con Barra en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Serratos Inferiores con Barra en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Serratos Inferiores con Barra en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Sit Up con Bandas
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Sit Up con Bandas' and (equipment is null or trim(equipment) = '');
-- csv: Sit Up en Fitball
update public.tipo_ejercicio set equipment = 'Fitball' where nombre = 'Sit Up en Fitball' and (equipment is null or trim(equipment) = '');
-- csv: Sit Up en Máquina
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Sit Up en Máquina' and (equipment is null or trim(equipment) = '');
-- csv: Skips
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Skips' and (equipment is null or trim(equipment) = '');
-- csv: Split Jacks
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Split Jacks' and (equipment is null or trim(equipment) = '');
-- csv: Sprints con rodilla alta
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Sprints con rodilla alta' and (equipment is null or trim(equipment) = '');
-- csv: Squat Tuck Jumps
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Squat Tuck Jumps' and (equipment is null or trim(equipment) = '');
-- csv: Step Up
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Step Up' and (equipment is null or trim(equipment) = '');
-- csv: Step Up con Banda
update public.tipo_ejercicio set equipment = 'Bandas' where nombre = 'Step Up con Banda' and (equipment is null or trim(equipment) = '');
-- csv: Step Up con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga, Otro' where nombre = 'Step Up con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Step Up con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas, Otro' where nombre = 'Step Up con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Step Up Lateral
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Step Up Lateral' and (equipment is null or trim(equipment) = '');
-- csv: Tuck Jumps
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Tuck Jumps' and (equipment is null or trim(equipment) = '');
-- csv: Wheel Rollout de pie
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Wheel Rollout de pie' and (equipment is null or trim(equipment) = '');
-- csv: Wheel Rollout de rodillas
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Wheel Rollout de rodillas' and (equipment is null or trim(equipment) = '');
-- csv: Wrist Roller
update public.tipo_ejercicio set equipment = 'Otro' where nombre = 'Wrist Roller' and (equipment is null or trim(equipment) = '');
-- csv: Zancada con salto
update public.tipo_ejercicio set equipment = 'Ninguno' where nombre = 'Zancada con salto' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Delantera con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Zancada Delantera con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Delantera en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Zancada Delantera en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Lateral con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Zancada Lateral con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Lateral con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Zancada Lateral con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Lateral Cruzada con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Zancada Lateral Cruzada con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Lateral Cruzada con Mancuerna
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Zancada Lateral Cruzada con Mancuerna' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Lateral en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Zancada Lateral en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Trasera con Barra
update public.tipo_ejercicio set equipment = 'Barra Larga' where nombre = 'Zancada Trasera con Barra' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Trasera con Mancuernas
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Zancada Trasera con Mancuernas' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Trasera en Polea
update public.tipo_ejercicio set equipment = 'Polea' where nombre = 'Zancada Trasera en Polea' and (equipment is null or trim(equipment) = '');
-- csv: Zancada Trasera en Punta
update public.tipo_ejercicio set equipment = 'Máquina' where nombre = 'Zancada Trasera en Punta' and (equipment is null or trim(equipment) = '');
-- csv: Zancadas con salto
update public.tipo_ejercicio set equipment = 'Mancuernas' where nombre = 'Zancadas con salto' and (equipment is null or trim(equipment) = '');
commit;
