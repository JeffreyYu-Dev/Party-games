plugins {
    id("java")
}



group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:6.0.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // Minestom
    implementation("net.minestom:minestom:2026.04.13-1.21.11")

    // Redis
    compileOnly("io.lettuce:lettuce-core:6.7.1.RELEASE")

    // Logger
    implementation("org.slf4j:slf4j-simple:2.0.17")
}

tasks.test {
    useJUnitPlatform()
}

