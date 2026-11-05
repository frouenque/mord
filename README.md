# Mord

**Mord** est un éditeur de fichiers Markdown qui ressemble à Word.

L’idée est simple : garder le confort d’une interface familière (ruban, styles, page, navigation), tout en travaillant sur de vrais fichiers `.md` — lisibles partout, y compris par une IA ou un éditeur de code.

Open source · Licence MIT · Windows (priorité), aussi Linux et macOS

---

## Pourquoi Mord ?

- Vous connaissez déjà Word → vous n’avez pas à réapprendre une autre logique
- Vos documents restent du **Markdown standard** (pas un format propriétaire)
- Idéal pour relire et peaufiner un texte généré ou modifié ailleurs (Cursor, etc.)
- 100 % local : pas de compte, pas de cloud obligatoire

---

## Ce que vous pouvez faire

- Créer, ouvrir et enregistrer des fichiers `.md`
- Mettre en forme avec le ruban : gras, italique, titres, listes, tableaux, liens, images…
- Naviguer dans le document via le plan des titres
- Zoomer, passer en thème clair ou sombre
- Activer l’enregistrement automatique

Les images sont rangées à côté du fichier, dans un dossier `nom.assets/`.

---

## Installation (Windows)

1. Téléchargez l’installateur `Mord_*-setup.exe` (build NSIS), **ou** compilez-le localement :

```powershell
.\build_setup.ps1
```

2. Lancez l’installateur, puis ouvrez **Mord** depuis le menu Démarrer.

> L’installateur généré localement se trouve dans  
> `src-tauri\target\release\bundle\nsis\`.

---

## Premiers pas

1. **Fichier → Nouveau** (ou Ctrl+N) pour commencer un document  
2. Écrivez comme dans Word ; utilisez **Accueil** pour gras / titres, **Insertion** pour listes et tableaux  
3. **Enregistrer** (Ctrl+S) — choisissez un fichier `.md`  
4. Rouvrez ce fichier dans Mord, ou dans n’importe quel outil qui lit le Markdown  

Astuce : activez **Enregistrement automatique** dans la barre de titre une fois le fichier nommé.

---

## Raccourcis utiles

| Raccourci | Action |
|-----------|--------|
| Ctrl+N | Nouveau |
| Ctrl+O | Ouvrir |
| Ctrl+S | Enregistrer |
| Ctrl+Shift+S | Enregistrer sous |
| Ctrl+F | Rechercher |
| Ctrl+B / Ctrl+I | Gras / Italique |

---

## Pour les contributeurs

Les détails techniques (architecture, stack, décisions produit) sont dans **[docs/spec.md](docs/spec.md)**.

Développement local :

```powershell
.\start.ps1
```

Prérequis : Node.js LTS, Rust stable, et sous Windows les outils MSVC + WebView2.

---

## Licence

[MIT](LICENSE) — libre d’utiliser, modifier et redistribuer.
