import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const LAST_UPDATED = "18 de agosto de 2026";

export default function PrivacyPolicy() {
  const { user } = useAuth();
  const backHref = user ? "/" : "/auth";
  const backLabel = user ? "Volver al inicio" : "Volver al registro";

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2 gap-2" asChild>
          <Link to={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Política de Privacidad</CardTitle>
            <p className="text-sm text-muted-foreground">Última actualización: {LAST_UPDATED}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Responsable del tratamiento</h2>
              <p>
                Track Gym es una aplicación de seguimiento de entrenamiento. El responsable del tratamiento de
                tus datos personales es el titular del servicio Track Gym (en adelante, «nosotros» o «la
                aplicación»).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">2. Datos que recogemos</h2>
              <p>Podemos tratar las siguientes categorías de datos:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-foreground">Datos de cuenta:</strong> dirección de correo
                  electrónico, contraseña (almacenada de forma cifrada) e identificadores de autenticación
                  si usas Google u otros proveedores.
                </li>
                <li>
                  <strong className="text-foreground">Datos de perfil:</strong> nombre de usuario, avatar y
                  preferencias de la aplicación (tema, etc.) y, por cada entrenamiento, si decides
                  publicarlo en la comunidad.
                </li>
                <li>
                  <strong className="text-foreground">Datos de entrenamiento:</strong> rutinas, ejercicios,
                  series, pesos, repeticiones, duraciones, historial de entrenos, métricas de progreso y, si
                  lo indicas, el gimnasio donde entrenaste (nombre y ubicación del centro).
                </li>
                <li>
                  <strong className="text-foreground">Importación desde Lyfta:</strong> si pegas tu API key
                  de Lyfta en Ajustes, usamos esa clave solo en esa petición para leer tu historial y/o
                  rutinas y copiarlos a tu cuenta. No almacenamos la API key.
                </li>
                <li>
                  <strong className="text-foreground">Datos de cardio y ubicación:</strong> si utilizas
                  funciones de cardio en vivo, podemos registrar rutas GPS, distancia, ritmo y duración de la
                  sesión. Si conectas un sensor de frecuencia cardíaca por Bluetooth, podemos registrar tu FC
                  durante el entrenamiento y asociarla a esa sesión. Al buscar gimnasios cercanos usamos tu
                  ubicación puntual; no se guarda un track GPS de esa búsqueda.
                </li>
                <li>
                  <strong className="text-foreground">Datos de uso:</strong> información técnica básica sobre
                  el uso de la aplicación (por ejemplo, páginas visitadas o eventos de rendimiento) mediante
                  herramientas de analítica.
                </li>
                <li>
                  <strong className="text-foreground">Datos de comunidad:</strong> publicaciones, actividad
                  compartida, seguidores y notificaciones, cuando actives funciones sociales.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">3. Finalidad del tratamiento</h2>
              <p>Utilizamos tus datos para:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Crear y gestionar tu cuenta de usuario.</li>
                <li>Permitir el registro, planificación y seguimiento de tus entrenamientos.</li>
                <li>Mostrar estadísticas, evolución y recomendaciones personalizadas.</li>
                <li>Ofrecer funciones de comunidad cuando las habilites.</li>
                <li>
                  Mostrar el gimnasio asociado a un entrenamiento publicado en el feed de quienes te
                  siguen, si decides publicarlo.
                </li>
                <li>Mejorar la seguridad, el rendimiento y la experiencia de la aplicación.</li>
                <li>Atender consultas o incidencias relacionadas con el servicio.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">4. Base legal</h2>
              <p>
                El tratamiento se basa en la ejecución del contrato de uso de la aplicación, tu consentimiento
                (por ejemplo, al registrarte o activar funciones opcionales) y, en su caso, nuestro interés
                legítimo en mantener un servicio seguro y funcional.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5. Cesiones y encargados</h2>
              <p>
                Para prestar el servicio utilizamos proveedores tecnológicos que pueden tratar datos en nuestro
                nombre, entre ellos:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-foreground">Supabase:</strong> autenticación, base de datos y
                  almacenamiento de la información de la aplicación. También actúa de puente puntual para
                  leer tu historial de Lyfta cuando importas datos (la API key no se guarda).
                </li>
                <li>
                  <strong className="text-foreground">Google:</strong> inicio de sesión con cuenta de Google,
                  si eliges esta opción.
                </li>
                <li>
                  <strong className="text-foreground">Vercel:</strong> alojamiento y analítica básica de uso.
                </li>
              </ul>
              <p>
                Estos proveedores solo acceden a los datos necesarios para prestar sus servicios y están
                sujetos a obligaciones de confidencialidad y seguridad.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">6. Conservación</h2>
              <p>
                Conservamos tus datos mientras mantengas una cuenta activa y durante el tiempo necesario para
                cumplir obligaciones legales o resolver reclamaciones. Puedes eliminar tu cuenta en cualquier
                momento desde la{" "}
                <Link to="/eliminar-cuenta" className="font-medium text-primary underline underline-offset-2">
                  página de eliminación de cuenta
                </Link>{" "}
                o desde Ajustes dentro de la app.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">7. Tus derechos</h2>
              <p>
                De acuerdo con la normativa aplicable (incluido el RGPD), puedes ejercer los derechos de
                acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de tus
                datos, así como retirar tu consentimiento en cualquier momento.
              </p>
              <p>
                Para ejercer estos derechos, escríbenos a través de los canales de contacto disponibles en la
                aplicación o en la tienda de aplicaciones donde descargaste Track Gym.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">8. Seguridad</h2>
              <p>
                Aplicamos medidas técnicas y organizativas razonables para proteger tus datos frente a accesos
                no autorizados, pérdida o alteración. No obstante, ningún sistema es completamente infalible.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">9. Menores de edad</h2>
              <p>
                Track Gym no está dirigida a menores de 14 años. Si eres padre, madre o tutor y crees que un
                menor nos ha facilitado datos personales, contacta con nosotros para solicitar su eliminación.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">10. Cambios en esta política</h2>
              <p>
                Podemos actualizar esta política para reflejar cambios legales o en el funcionamiento de la
                aplicación. Publicaremos la versión revisada en esta página e indicaremos la fecha de la última
                actualización.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">11. Contacto</h2>
              <p>
                Si tienes preguntas sobre esta política o sobre el tratamiento de tus datos, puedes contactar
                con nosotros a través de los medios indicados en la ficha de la aplicación en Google Play o en
                la información de contacto del desarrollador.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
