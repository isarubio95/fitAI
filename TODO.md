[] Gamificar con nombres para cada 10 niveles:
    export const LEVEL_TIERS = [
        "Turista del Gym",       // Niveles 1-10: Acaba de llegar, a ver si dura.
        "Forjador de Hábitos",   // Niveles 11-20: Ya no es casualidad, hay disciplina.
        "Guerrero del Hierro",   // Niveles 21-30: Empieza a levantar pesos serios.
        "Gladiador",             // Niveles 31-40: Se deja la piel en la arena (el gym).
        "Máquina",               // Niveles 41-50: Entrena con precisión y constancia suiza.
        "Mutante",               // Niveles 51-60: Los cambios físicos ya son evidentes y bestiales.
        "Coloso",                // Niveles 61-70: Tamaño y fuerza imponentes.
        "Titán",                 // Niveles 71-80: Entrando en terreno mitológico.
        "Semidiós",              // Niveles 81-90: La élite del gimnasio.
        "Leyenda del Olimpo"     // Niveles 91-100+: El jefe final de la aplicación.
    ];

# UX / Catálogo
[X] Implementar filtros avanzados en la biblioteca (por grupo_muscular, tipo, equipment, dificultad).

[X] Añadir diseño con chips para los filtros y un botón de "limpiar filtros".

[X] Desarrollar búsqueda inteligente que normalice acentos y permita la búsqueda por sinónimos (ej. "dominada supina" → "chin up") y equipo.

[ ] Crear un toggle para alternar entre vista compacta (mayor densidad) y vista detallada (más metadatos).

[ ] Diseñar un indicador (badge) de calidad de datos para identificar ejercicios sin gif_url o instructions.

[ ] Añadir un botón de "reportar/arreglar" en la interfaz para los registros incompletos.

# Rutinas / Planificación
[ ] Configurar lógica de auto-sugerencias al crear rutinas, proponiendo ejercicios del catálogo según el grupo_muscular objetivo.

[ ] Crear plantillas base predefinidas por objetivo ("Full body 3 días", "Push/Pull/Legs", "Upper/Lower").

[ ] Añadir validaciones en la UI/backend para avisar sobre rutinas sin ejercicios o rutinas descompensadas (ej. 5 ejercicios seguidos del mismo grupo muscular).

# Entrenamiento (Logger) / Progresión
[ ] Programar sistema de progresión automática que sugiera subir peso o repeticiones al completar una sesión, basándose en el RIR objetivo y el rango de repeticiones.

[ ] Construir la vista de histórico por ejercicio para mostrar PRs (1RM estimado), mejores series y tendencias semanales/mensuales.

[ ] Implementar lógica de descanso inteligente que ajuste los tiempos recomendados según la dificultad, tipo y si es un ejercicio compuesto o de aislamiento.

# Datos / Consistencia
[ ] Escribir y programar un job de auditoría SQL para limpiar los datos directamente, detectando URLs locales inexistentes, instrucciones vacías y nombres duplicados.

[ ] Diseñar y poblar una tabla exercise_alias para unificar la lógica de normalización a nivel de arquitectura y evitar duplicidades entre el cliente y los scripts.

# Comunidad
[ ] Habilitar la función de compartir rutinas mediante enlace público, añadiendo soporte para exportar/importar en JSON con los IDs correspondientes.

[ ] Desarrollar el sistema de gamificación para rankings y retos (streaks de entrenamiento, volumen semanal por grupo, logros).