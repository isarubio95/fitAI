import os
import time
import requests
from supabase import create_client, Client

# --- CONFIGURACIÓN (Rellena esto) ---
SUPABASE_URL = "https://ugbhwarfkaeobaycxlwp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYmh3YXJma2Flb2JheWN4bHdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc0MjE2NSwiZXhwIjoyMDg2MzE4MTY1fQ.EJwya0gHBQqNo3w4vqTty-3c2YdOyosCJH7-NJyojW8" # Usa la Service Role, no la Anon
RAPIDAPI_KEY = "bcf47583eemsha69ad94623da598p1bd4f0jsn436b7c9f6541"

# --- DICCIONARIO DE TRADUCCIÓN (Español -> Search Term API) ---
# La API está en inglés. Si buscamos "Sentadilla" no encontrará nada.
# Este diccionario mapea palabras clave de tus ejercicios a términos de búsqueda.
TRANSLATION_MAP = {
    "press banca": "bench press",
    "press de banca": "bench press",
    "sentadilla": "squat",
    "peso muerto": "deadlift",
    "dominadas": "pull up",
    "flexiones": "push up",
    "fondos": "dips",
    
    # Tren Superior
    "jalon": "lat pulldown",
    "jalón": "lat pulldown",
    "remo": "row",
    "biceps": "bicep curl",
    "bíceps": "bicep curl",
    "triceps": "tricep",
    "tríceps": "tricep",
    "martillo": "hammer curl",
    "militar": "overhead press",
    "hombro": "shoulder press",
    "lateral": "lateral raise",
    "pajaros": "deltoid fly",
    "pájaros": "deltoid fly",
    "pecho": "chest",
    
    # Tren Inferior
    "prensa": "leg press",
    "zancada": "lunge",
    "bulgara": "bulgarian split squat",
    "búlgara": "bulgarian split squat",
    "femoral": "leg curl",
    "cuadriceps": "quadriceps",
    "cuádriceps": "quadriceps",
    "extension": "leg extension",
    "gemelo": "calf raise",
    "hip thrust": "hip thrust",
    "gluteo": "glute",
    "glúteo": "glute",
    "abduct": "abductor",
    "adduct": "adductor",

    # Core / Otros
    "plancha": "plank",
    "abdominal": "crunch",
    "rueda": "roller",
    "burpee": "burpee"
}

def main():
    # 1. Conectar a Supabase
    print("🔌 Conectando a Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 2. Obtener ejercicios sin GIF
    # Seleccionamos solo los que tienen gif_url a NULL para no machacar los que ya tengas
    response = supabase.table('tipo_ejercicio').select('*').is_('gif_url', 'null').execute()
    exercises = response.data

    print(f"📋 Encontrados {len(exercises)} ejercicios sin GIF. Empezando proceso...")

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
    }

    count_success = 0
    count_fail = 0

    for i, exercise in enumerate(exercises):
        original_name = exercise['nombre']
        search_term = original_name.lower() # Por defecto buscamos el nombre tal cual
        
        # Intentamos traducir usando el diccionario
        translated = False
        for es_key, en_val in TRANSLATION_MAP.items():
            if es_key in search_term:
                search_term = en_val
                translated = True
                break
        
        print(f"\n[{i+1}/{len(exercises)}] Procesando: '{original_name}'")
        if translated:
            print(f"   ↳ Traducido a búsqueda: '{search_term}'")
        
        # 3. Llamar a la API
        try:
            url = f"https://exercisedb.p.rapidapi.com/exercises/name/{search_term}"
            api_response = requests.get(url, headers=headers)
            
            if api_response.status_code == 200:
                results = api_response.json()
                
                if results and len(results) > 0:
                    # Cogemos el primer resultado
                    gif_url = results[0]['gifUrl']
                    
                    # 4. Actualizar Supabase
                    supabase.table('tipo_ejercicio').update({'gif_url': gif_url}).eq('id', exercise['id']).execute()
                    
                    print(f"   ✅ GIF encontrado y guardado: {gif_url}")
                    count_success += 1
                else:
                    print("   ❌ No se encontraron resultados en la API.")
                    count_fail += 1
            elif api_response.status_code == 429:
                print("   ⚠️ Límite de API excedido. Esperando un poco más...")
                time.sleep(2)
            else:
                print(f"   ❌ Error API: {api_response.status_code}")
                count_fail += 1

        except Exception as e:
            print(f"   💥 Error inesperado: {e}")
            count_fail += 1
        
        # Pequeña pausa para no saturar la API (Rate Limiting)
        time.sleep(0.5)

    print("\n" + "="*30)
    print(f"🏁 PROCESO TERMINADO")
    print(f"✅ Actualizados: {count_success}")
    print(f"❌ Fallidos/No encontrados: {count_fail}")
    print("="*30)

if __name__ == "__main__":
    main()