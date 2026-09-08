pluginManagement {
    // build-logic es un build incluido, no un módulo: se compila antes que el resto
    // y aporta los convention plugins que aplican todos los demás.
    includeBuild("build-logic")
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "track-gym-native"

enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

include(":app")

// core:domain es Kotlin/JVM puro a propósito — ver docs/ARCHITECTURE.md
include(":core:domain")
include(":core:data")
include(":core:designsystem")
include(":core:ui")
include(":core:testing")

include(":service:live")
include(":service:sensors")

include(":feature:auth")
include(":feature:dashboard")
include(":feature:workout")
include(":feature:cardio")
include(":feature:library")
include(":feature:community")
include(":feature:evolution")
include(":feature:gyms")
include(":feature:profile")
include(":feature:health")
