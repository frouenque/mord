# Mord

Éditeur Markdown WYSIWYG open source, avec une interface proche de Word.

- Fichiers `.md` UTF-8 (sans BOM), compatibles édition brute / IA
- Ruban type Word (Fichier, Accueil, Insertion, Affichage)
- Plan de navigation par titres
- GFM : tableaux, listes de tâches, barré, etc.
- Images liées via dossier `{nom}.assets/` à côté du document
- Thème clair / sombre / système
- Windows, Linux, macOS (via Tauri 2)

## Prérequis

- [Node.js](https://nodejs.org/) LTS
- [Rust](https://rustup.rs/) (stable)
- Windows : Visual Studio Build Tools (MSVC) + WebView2

## Développement

```powershell
.\start.ps1
```

## Installateur Windows

```powershell
.\build_setup.ps1
```

L’installateur NSIS est généré dans `src-tauri/target/release/bundle/nsis/`.

## Licence

MIT
