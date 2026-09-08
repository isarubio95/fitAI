import com.android.build.api.dsl.CommonExtension
import com.android.build.gradle.LibraryExtension
import com.android.build.gradle.internal.dsl.BaseAppModuleExtension
import com.trackgym.buildlogic.libs
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.getByType

class AndroidComposeConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        // Desde Kotlin 2.0 el compilador de Compose viene del plugin de Kotlin,
        // no de una versión de compilador aparte.
        pluginManager.apply("org.jetbrains.kotlin.plugin.compose")

        val extension: CommonExtension<*, *, *, *, *, *> =
            when {
                pluginManager.hasPlugin("com.android.application") ->
                    extensions.getByType<BaseAppModuleExtension>()
                else -> extensions.getByType<LibraryExtension>()
            }
        extension.buildFeatures.compose = true

        val bom = libs.findLibrary("compose-bom").get()
        dependencies {
            add("implementation", platform(bom))
            add("androidTestImplementation", platform(bom))
            add("implementation", libs.findLibrary("compose-ui").get())
            add("implementation", libs.findLibrary("compose-ui-graphics").get())
            add("implementation", libs.findLibrary("compose-foundation").get())
            add("implementation", libs.findLibrary("compose-material3").get())
            add("implementation", libs.findLibrary("compose-ui-tooling-preview").get())
            add("debugImplementation", libs.findLibrary("compose-ui-tooling").get())
        }
    }
}
