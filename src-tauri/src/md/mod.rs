//! Helpers Markdown côté backend (chemins assets, normalisation UTF-8).

use std::path::{Path, PathBuf};

/// Dossier d'assets associé à un fichier `.md` : `nom.assets` à côté du document.
pub fn assets_dir_for(md_path: &Path) -> PathBuf {
    let stem = md_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("document");
    md_path
        .parent()
        .unwrap_or_else(|| Path::new("."))
        .join(format!("{stem}.assets"))
}

/// Garantit que le contenu texte est du UTF-8 sans BOM.
pub fn strip_utf8_bom(content: &str) -> &str {
    content.strip_prefix('\u{FEFF}').unwrap_or(content)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn assets_dir_uses_stem() {
        let path = Path::new(r"C:\docs\notes.md");
        assert_eq!(
            assets_dir_for(path),
            PathBuf::from(r"C:\docs\notes.assets")
        );
    }

    #[test]
    fn strips_bom() {
        assert_eq!(strip_utf8_bom("\u{FEFF}# Hello"), "# Hello");
        assert_eq!(strip_utf8_bom("# Hello"), "# Hello");
    }
}
