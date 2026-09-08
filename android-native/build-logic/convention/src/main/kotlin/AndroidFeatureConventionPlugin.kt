import com.trackgym.buildlogic.libs
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.artifacts.ProjectDependency
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.project

/**
 * Módulo de feature: una zona de la app con sus pantallas y ViewModels.
 *
 * La regla que impone este plugin — **un feature no puede depender de otro** — es
 * deliberada. En la app React, `src/hooks/useWorkouts.ts` importa `supabase`
 * directamente e invalida 13 claves de query de dominios ajenos; `useDeleteWorkout`
 * tiene que saber que existen el dashboard, la evolución y el historial. Si
 * `feature:workout` no puede ver `feature:evolution`, ese acoplamiento no se puede
 * reproducir: la comunicación pasa por `core:data`, y los `Flow` de Room hacen que
 * las demás pantallas se actualicen solas.
 */
class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        pluginManager.apply("trackgym.android.library")
        pluginManager.apply("trackgym.android.compose")
        pluginManager.apply("trackgym.android.hilt")

        dependencies {
            add("implementation", project(":core:domain"))
            add("implementation", project(":core:data"))
            add("implementation", project(":core:designsystem"))
            add("implementation", project(":core:ui"))

            add("implementation", libs.findLibrary("androidx-lifecycle-runtime-compose").get())
            add("implementation", libs.findLibrary("androidx-lifecycle-viewmodel-compose").get())
            add("implementation", libs.findLibrary("androidx-navigation-compose").get())
            add("implementation", libs.findLibrary("hilt-navigation-compose").get())
            add("implementation", libs.findLibrary("kotlinx-serialization-json").get())

            add("testImplementation", project(":core:testing"))
        }

        enforceFeatureIsolation()
    }
}

private fun Project.enforceFeatureIsolation() {
    afterEvaluate {
        configurations.configureEach {
            val offenders = dependencies
                .filterIsInstance<ProjectDependency>()
                .map { it.path }
                .filter { it.startsWith(":feature:") && it != path }
            check(offenders.isEmpty()) {
                """
                |$path depende de otro módulo de feature: ${offenders.joinToString()}
                |
                |Los features están aislados a propósito. Si necesitas datos de otro
                |dominio, expón un repositorio en :core:data; si necesitas navegar a
                |él, hazlo con una ruta de :app. Ver docs/ARCHITECTURE.md.
                """.trimMargin()
            }
        }
    }
}
