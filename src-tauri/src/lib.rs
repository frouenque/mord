mod commands;
mod error;
mod md;

use commands::{
    ensure_assets_dir, import_image, read_markdown_file, write_markdown_file,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_markdown_file,
            write_markdown_file,
            ensure_assets_dir,
            import_image
        ])
        .run(tauri::generate_context!())
        .expect("erreur au démarrage de Mord");
}
