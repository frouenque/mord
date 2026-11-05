use crate::error::{AppError, AppResult};
use crate::md::{assets_dir_for, strip_utf8_bom};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentPayload {
    pub path: String,
    pub content: String,
    pub assets_dir: String,
}

/// Lit un fichier Markdown en UTF-8 (BOM retiré).
#[tauri::command]
pub fn read_markdown_file(path: String) -> AppResult<DocumentPayload> {
    let path_buf = PathBuf::from(&path);
    if !path_buf.exists() {
        return Err(AppError::Message(format!(
            "Fichier introuvable : {path}"
        )));
    }

    let bytes = fs::read(&path_buf)?;
    let content = String::from_utf8(bytes)
        .map_err(|_| AppError::Message("Le fichier n'est pas encodé en UTF-8.".into()))?;
    let content = strip_utf8_bom(&content).to_string();
    let assets = assets_dir_for(&path_buf);

    Ok(DocumentPayload {
        path,
        content,
        assets_dir: assets.to_string_lossy().into_owned(),
    })
}

/// Écrit un fichier Markdown en UTF-8 sans BOM.
#[tauri::command]
pub fn write_markdown_file(path: String, content: String) -> AppResult<DocumentPayload> {
    let path_buf = PathBuf::from(&path);
    if let Some(parent) = path_buf.parent() {
        fs::create_dir_all(parent)?;
    }

    // UTF-8 sans BOM — compatible édition brute / IA
    fs::write(&path_buf, content.as_bytes())?;

    let assets = assets_dir_for(&path_buf);
    Ok(DocumentPayload {
        path,
        content,
        assets_dir: assets.to_string_lossy().into_owned(),
    })
}

/// Crée le dossier d'assets à côté du document si besoin.
#[tauri::command]
pub fn ensure_assets_dir(md_path: String) -> AppResult<String> {
    let path_buf = PathBuf::from(&md_path);
    let assets = assets_dir_for(&path_buf);
    fs::create_dir_all(&assets)?;
    Ok(assets.to_string_lossy().into_owned())
}

/// Copie une image dans `{stem}.assets/` et renvoie le chemin relatif Markdown.
#[tauri::command]
pub fn import_image(md_path: String, image_path: String) -> AppResult<String> {
    let md = PathBuf::from(&md_path);
    let source = PathBuf::from(&image_path);
    if !source.exists() {
        return Err(AppError::Message(format!(
            "Image introuvable : {image_path}"
        )));
    }

    let assets = assets_dir_for(&md);
    fs::create_dir_all(&assets)?;

    let file_name = source
        .file_name()
        .and_then(|s| s.to_str())
        .ok_or_else(|| AppError::Message("Nom de fichier image invalide.".into()))?;

    let dest = assets.join(file_name);
    fs::copy(&source, &dest)?;

    let stem = md
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("document");
    Ok(format!("{stem}.assets/{file_name}"))
}
