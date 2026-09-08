import com.trackgym.buildlogic.configureKotlinJvm
import com.trackgym.buildlogic.libs
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.tasks.testing.Test
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.withType

/**
 * Módulo Kotlin/JVM puro, sin Android.
 *
 * Es lo que hace viable la Fase 1: `core:domain` contiene los ~2.500 líneas de
 * algoritmo portado desde `src/lib/` y sus tests corren con JUnit5 en
 * milisegundos, sin Robolectric ni emulador. Con las ~30 suites de vitest a
 * portar, la diferencia frente a un módulo Android es un ciclo de 3 s en vez de
 * uno de 90 s.
 */
class JvmLibraryConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        pluginManager.apply("org.jetbrains.kotlin.jvm")

        configureKotlinJvm()

        tasks.withType<Test>().configureEach {
            useJUnitPlatform()
        }

        dependencies {
            add("implementation", libs.findLibrary("kotlinx-coroutines-core").get())
            add("implementation", libs.findLibrary("kotlinx-datetime").get())
            add("testImplementation", libs.findLibrary("junit-jupiter").get())
            add("testImplementation", libs.findLibrary("kotlin-test").get())
            add("testImplementation", libs.findLibrary("kotlinx-coroutines-test").get())
            add("testRuntimeOnly", libs.findLibrary("junit-platform-launcher").get())
        }
    }
}
