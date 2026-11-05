fn main() {
    // Forcer la recompilation des ressources Windows si l'icône change
    println!("cargo:rerun-if-changed=icons/icon.ico");
    println!("cargo:rerun-if-changed=icons/icon.png");
    tauri_build::build()
}
