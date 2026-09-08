package com.trackgym.buildlogic

import com.android.build.api.dsl.CommonExtension
import org.gradle.api.Project
import org.gradle.api.artifacts.VersionCatalog
import org.gradle.api.artifacts.VersionCatalogsExtension
import org.gradle.api.plugins.JavaPluginExtension
import org.gradle.jvm.toolchain.JavaLanguageVersion
import org.gradle.kotlin.dsl.getByType
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinAndroidProjectExtension
import org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension

internal val Project.libs: VersionCatalog
    get() = extensions.getByType<VersionCatalogsExtension>().named("libs")

internal fun VersionCatalog.version(alias: String): String =
    findVersion(alias).get().requiredVersion

internal fun VersionCatalog.versionInt(alias: String): Int = version(alias).toInt()

/**
 * Configuración común de todo módulo Android (app o librería).
 *
 * `strictNullChecks: false` del proyecto TypeScript original no tiene equivalente
 * aquí: Kotlin es null-safe por defecto. Además tratamos los warnings de opt-in
 * como explícitos para que no se cuelen APIs experimentales sin querer.
 */
internal fun Project.configureKotlinAndroid(extension: CommonExtension<*, *, *, *, *, *>) {
    extension.apply {
        compileSdk = libs.versionInt("compileSdk")

        defaultConfig {
            minSdk = libs.versionInt("minSdk")
        }

        compileOptions {
            sourceCompatibility = org.gradle.api.JavaVersion.VERSION_21
            targetCompatibility = org.gradle.api.JavaVersion.VERSION_21
        }
    }

    extensions.getByType<KotlinAndroidProjectExtension>().compilerOptions {
        jvmTarget.set(JvmTarget.JVM_21)
        freeCompilerArgs.addAll(COMMON_COMPILER_ARGS)
    }
}

internal fun Project.configureKotlinJvm() {
    extensions.getByType<JavaPluginExtension>().toolchain {
        languageVersion.set(JavaLanguageVersion.of(libs.version("jvmTarget")))
    }
    extensions.getByType<KotlinJvmProjectExtension>().compilerOptions {
        jvmTarget.set(JvmTarget.JVM_21)
        freeCompilerArgs.addAll(COMMON_COMPILER_ARGS)
    }
}

private val COMMON_COMPILER_ARGS = listOf(
    "-opt-in=kotlin.RequiresOptIn",
    // Los warnings de un port son ruido durante meses; que no se conviertan en
    // errores hasta que haya paridad. Revisar esta decisión en la Fase 7.
    "-Xconsistent-data-class-copy-visibility",
)
