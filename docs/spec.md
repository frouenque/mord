# Spec technique — Mord

Document de référence produit + technique.  
À maintenir à jour avec le code (voir règle Cursor `spec-sync`).

**Version documentée :** 0.1.0  
**Licence :** MIT (open source)

---

## 1. Vision produit

| Élément | Décision |
|--------|----------|
| Nom | **Mord** — éditeur Markdown avec UX type Microsoft Word |
| Promesse | Faire adopter le Markdown par des utilisateurs habitués à Word, sans les désorienter |
| Différenciateur | Licence **open source** (vs outils proches type Antalogy) |
| Inspiration UI | Word / Antalogy (références visuelles dans le dépôt) |
| Cible utilisateurs | Surtout **non-tech**, aussi tech ; pas de « vault » type Obsidian |
| Plateformes | **Windows** (priorité), Linux, macOS — **pas** iOS / mobile pour l’instant |

---

## 2. Principes d’édition

- **WYSIWYG uniquement** : l’utilisateur ne voit pas la syntaxe Markdown à l’écran
- Sous le capot : fichier **`.md` propre**, UTF-8 **sans BOM**, éditable en brut (Cursor, éditeurs, IA externes)
- **Pas** de HTML dans le document (pas de souligné / couleurs / alignement via balises)
- Dialecte : **GFM** (et extensions utiles aux IA) — tableaux, task lists, barré côté format si présent ; l’UI n’expose que ce qui reste pertinent
- Workflow cible : une IA génère / édite le `.md` → Mord permet de le lire et modifier graphiquement
- **Pas d’IA intégrée** dans Mord
- **1 fichier = 1 document** (comme Word) ; multi-docs = plusieurs instances de l’app
- **Pas** de conversion `.docx` / PDF / HTML

---

## 3. Fichiers & assets

| Sujet | Spec |
|------|------|
| Ouverture / création / enregistrement | `.md` (et `.markdown` à l’ouverture) |
| Encodage | UTF-8 sans BOM |
| Images | Fichiers à côté du document, dossier `{stem}.assets/` ; lien relatif dans le MD |
| Import image | Copie dans `{stem}.assets/` puis insertion `![alt](stem.assets/fichier)` |
| Autosave | Optionnel (case titlebar) ; ~2 s si le fichier a déjà un chemin et est modifié |

---

## 4. Interface (chrome Word, thème rouge)

Couleur dominante : **rouge** (alignée sur l’icône), pas le bleu Word.

### 4.1 Barre de titre (sans décorations OS)

- Enregistrement automatique (toggle)
- Raccourcis rapides : Enregistrer, Annuler
- Titre du document centré + marque **M**
- Boutons fenêtre : réduire / agrandir / fermer
- **Exclu** (croix Word) : barre Rechercher centrale, profil utilisateur

### 4.2 Ruban

Onglets : **Fichier** | **Accueil** | **Insertion** | **Affichage**

**Fichier :** Nouveau, Ouvrir, Enregistrer, Enregistrer sous  

**Accueil** (tri croix Word + pertinence MD) :

- Presse-papiers : Coller, Copier — **pas** Couper ni pinceau de format
- Police : Gras, Italique, Code inline — **pas** souligné, barré UI, couleur, taille, indices…
- Styles : galerie Normal, Titre 1–3
- **Pas** de groupe Édition / Compléments / Partager sur Accueil

**Insertion :** listes (puces, numérotées, tâches), citation, tableaux, lien, image, bloc de code, ligne horizontale  

**Affichage :** volet Navigation, Rechercher, thème (clair / sombre / système)

Les boutons du ruban doivent préserver la sélection éditeur (`mousedown` → `preventDefault`).

### 4.3 Zone document

- Page **A4 portrait** (210 × 297 mm), fond gris autour
- Règles H/V graduées en **cm**, calées sur la page A4
- Marges ~25 mm ; zone de sélection de ligne (du panneau latéral jusqu’au début du texte) avec le **pointeur Windows inversé / gaucher** (`.cur` natif dérivé de `aero_arrow`, pas un PNG), comme Word
- Volet **Navigation** (plan des titres) — obligatoire, affichable/masquable ; mis à jour à chaque modification du document

### 4.4 Barre d’état

- Nom fichier + indicateur modifié `*`
- Compteur de mots
- Langue affichée : Français (France)
- Zoom 50–200 % (slider)
- **Exclu** : icônes accessibilité / correcteur type Word

### 4.5 Orthographe

Dictionnaire / correcteur : **oui** (via `spellcheck` navigateur / WebView pour l’instant ; FR ciblé)

---

## 5. Raccourcis

| Raccourci | Action |
|-----------|--------|
| Ctrl+N | Nouveau |
| Ctrl+O | Ouvrir |
| Ctrl+S | Enregistrer |
| Ctrl+Shift+S | Enregistrer sous |
| Ctrl+F | Rechercher |
| Ctrl+B / Ctrl+I | Gras / Italique (éditeur) |

---

## 6. Architecture technique

### 6.1 Stack

| Couche | Techno |
|--------|--------|
| Shell desktop | Tauri **2** |
| Backend | Rust (`src-tauri/`) |
| Frontend | React 19 + TypeScript + Vite |
| Éditeur WYSIWYG | TipTap + `tiptap-markdown` (GFM) |
| Dialogues fichiers | `@tauri-apps/plugin-dialog` |

### 6.2 Backend Rust (modules)

```
src-tauri/src/
  main.rs / lib.rs
  commands/file.rs   # read / write MD, ensure_assets_dir, import_image
  md/mod.rs          # chemins assets, strip BOM
  error.rs
```

Commandes Tauri : `read_markdown_file`, `write_markdown_file`, `ensure_assets_dir`, `import_image`.

### 6.3 Frontend (modules)

```
src/
  components/titlebar|ribbon|editor|outline|statusbar/
  lib/documentApi.ts, theme.ts
  styles/app.css
```

Fenêtre : `decorations: false` ; permissions window minimize/maximize/close/drag/set-title.

### 6.4 Build & scripts

| Script | Rôle |
|--------|------|
| `start.ps1` | Dev / debug (`tauri dev`) |
| `build_setup.ps1` | Release + installateur Windows **NSIS** |
| `scripts/generate_icons.py` | Génération icônes (layout type Word, rouge + M) |

Identifiant app : `com.mord.desktop`  
Bundle Windows : NSIS, `currentUser`, langues FR/EN.

### 6.5 Icône

Fidèle au **layout Fluent Word** (document à dégradé + badge lettre à gauche qui chevauche), en **rouge**, lettre **M**.  
Fichier critique Windows : `src-tauri/icons/icon.ico` multi-tailles (16…256) — embarqué dans le `.exe` / barre des tâches. Régénérer via `scripts/generate_icons.py` (ne pas écraser l’ICO avec un export Pillow mono-taille).

---

## 7. Hors scope (V1 / explicite)

- iOS / Android
- IA locale ou cloud intégrée
- Import / export `.docx`, PDF, HTML
- Multi-onglets documents dans une seule fenêtre
- Vue code Markdown
- Souligné, couleurs, alignement paragraphe, bordures (non MD)
- Cloud / sync / comptes utilisateurs

---

## 8. Documentation associée

| Fichier | Rôle |
|---------|------|
| `docs/spec.md` | **Ce fichier** — spec produit + technique |
| `README.md` | Présentation **utilisateur** / démarrage rapide |
| `.cursor/rules/spec-sync.mdc` | Maintenir `docs/spec.md` à jour |
| `.cursor/rules/readme-sync.mdc` | Maintenir `README.md` à jour |
