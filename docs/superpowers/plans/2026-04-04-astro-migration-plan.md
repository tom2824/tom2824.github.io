# Plan d'implémentation — Migration Astro
_Basé sur le design spec : `docs/superpowers/specs/2026-04-04-astro-migration-design.md`_

## Vue d'ensemble

Migration du portfolio HTML/CSS/JS vanilla vers Astro, dans le même dépôt.
Les anciens fichiers (`index.html`, `css/`, `js/`) sont conservés comme référence jusqu'à la fin, puis supprimés.
Le déploiement GitHub Pages passe de "push direct sur main" à "GitHub Actions → build Astro → deploy dist/".

---

## Étape 1 — Setup Astro

**Objectif** : installer Astro dans le dépôt existant sans casser le site actuel.

1. Dans le dossier du projet, initialiser npm si ce n'est pas déjà fait :
   ```bash
   npm init -y
   ```
2. Installer Astro :
   ```bash
   npm install astro
   ```
3. Ajouter les scripts dans `package.json` :
   ```json
   "scripts": {
     "dev": "astro dev",
     "build": "astro build",
     "preview": "astro preview"
   }
   ```
4. Créer `astro.config.mjs` à la racine :
   ```js
   import { defineConfig } from 'astro/config';

   export default defineConfig({
     site: 'https://tom2824.github.io',
   });
   ```
5. Créer `tsconfig.json` à la racine :
   ```json
   {
     "extends": "astro/tsconfigs/base"
   }
   ```
6. Ajouter `node_modules/` et `dist/` au `.gitignore` (créer le fichier s'il n'existe pas).

**Vérification** : `npm run dev` lance le serveur sans erreur (page vide attendue à ce stade).

---

## Étape 2 — Assets

**Objectif** : rendre les images et le CSS disponibles dans Astro.

1. Les images dans `images/` → copier dans `public/images/` (Astro sert `public/` statiquement).
2. Le CSS dans `css/style.css` → copier dans `src/styles/global.css`.
3. La photo de profil et les autres images sont déjà au bon endroit si on les met dans `public/`.

**Vérification** : une image est accessible à `http://localhost:4321/images/pp_pro2.jpg`.

---

## Étape 3 — Layout

**Objectif** : créer le template de base HTML de la page.

Créer `src/layouts/Layout.astro` :
- Reprendre le `<head>` de `index.html` : charset, viewport, title, Google Fonts
- Importer `../styles/global.css`
- Slot pour le contenu

```astro
---
interface Props { title?: string; }
const { title = 'Tom NGUYEN — Portfolio' } = Astro.props;
---
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="stylesheet" href="/styles/global.css" />
    <!-- Google Fonts -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Vérification** : `npm run build` sans erreur.

---

## Étape 4 — Données projets

**Objectif** : extraire toutes les données projets du HTML vers un fichier TypeScript.

Créer `src/data/projects.ts` avec l'interface `Project` et le tableau `PROJECTS` :

```ts
export interface Project {
  title: string;
  date: string;        // "YYYY-MM"
  ongoing?: boolean;
  tags: { label: string; icon?: string }[];
  description: string;
  link?: string;
  collaborators?: { name: string; url?: string }[];
}
```

Projets à saisir (du plus récent au plus ancien) :
- Stop Doomscrolling (`2026-04`)
- Deal Express (`2026-03`)
- Jeu en JavaScript (`2025-??` — à préciser)
- Application de messagerie (`2025-??` — à préciser)
- Application de classification (`2025-??` — à préciser)
- Ce portfolio (`2024-01`, `ongoing: true`)

**Vérification** : TypeScript ne remonte aucune erreur de type.

---

## Étape 5 — Composant ProjectCard

**Objectif** : composant qui reçoit un `Project` et calcule le badge/date automatiquement.

Créer `src/components/ProjectCard.astro` :

- Prop : `project: Project`
- Calculer `isRecent` : si `date` est dans les 12 derniers mois (comparaison `YYYY-MM` avec la date du build)
- Calculer `displayDate` : formater en français ("Avr. 2026", "2025", "2024 — présent" si `ongoing`)
- Rendre le badge "Projet récent" si `isRecent`
- Ajouter `data-date={project.date}` et `data-title={project.title}` sur l'élément racine pour le tri JS
- Gérer les icônes des tags directement en Astro (pas besoin de JS pour ça)

---

## Étape 6 — Composant ProjectsSection

**Objectif** : section "Projets" avec tri client-side.

Créer `src/components/ProjectsSection.astro` :

1. Importer `PROJECTS` depuis `../data/projects.ts`
2. Trier par date décroissante au build (ordre initial)
3. Rendre le header avec les 4 boutons de tri : Récent · Ancien · A→Z · Z→A
4. Rendre toutes les cartes dans un seul `.projects-container`
5. Ajouter un `<script>` vanilla JS qui :
   - Écoute les clics sur les boutons de tri
   - Lit `data-date` / `data-title` sur chaque `.project-card`
   - Trie le tableau de nœuds et réinsère avec `appendChild`
   - Met à jour la classe active sur le bouton cliqué

**CSS à ajouter dans `global.css`** :
```css
.projects-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.projects-container > .project-card:first-child {
  grid-column: 1 / -1;
  /* styles featured existants */
}
```

**Vérification** : les 4 boutons trient correctement, le premier élément est toujours full-width.

---

## Étape 7 — Autres composants

**Objectif** : migrer les autres sections du HTML vers des composants Astro.

Créer dans `src/components/` (contenu statique, copie directe depuis `index.html`) :
- `Navbar.astro`
- `Hero.astro`
- `About.astro`
- `Skills.astro`
- `Experience.astro`
- `Education.astro`
- `Contact.astro`
- `Footer.astro`

Chaque fichier reprend le HTML correspondant de `index.html`. Les icônes `data-icon` dans Skills et Experience sont gérées soit inline en Astro, soit via un script client (même logique que l'actuel).

---

## Étape 8 — Scripts client

**Objectif** : migrer les scripts JS qui nécessitent le DOM.

Dans `src/layouts/Layout.astro`, avant `</body>`, ajouter un `<script>` (ou plusieurs inline) pour :
- **Calcul de l'âge** : même logique, cibler `#age`
- **Scroll reveal** : IntersectionObserver sur `.reveal`
- **Navbar scroll effect** : toggle `.scrolled` sur `#navbar`
- **Navbar active link** : même logique au scroll
- **Mobile nav toggle** : même logique

Ces scripts sont copiés quasi à l'identique depuis `js/main.js`.

Les icônes `data-icon` (dans les tags) peuvent être gérées directement dans les composants Astro en ajoutant `<img>` à côté du texte, sans JS.

---

## Étape 9 — Page index

**Objectif** : assembler tous les composants dans la page principale.

Créer `src/pages/index.astro` :

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Hero from '../components/Hero.astro';
import About from '../components/About.astro';
import Skills from '../components/Skills.astro';
import ProjectsSection from '../components/ProjectsSection.astro';
import Experience from '../components/Experience.astro';
import Education from '../components/Education.astro';
import Contact from '../components/Contact.astro';
import Footer from '../components/Footer.astro';
---
<Layout>
  <Navbar />
  <Hero />
  <About />
  <Skills />
  <ProjectsSection />
  <Experience />
  <Education />
  <Contact />
  <Footer />
</Layout>
```

**Vérification** : `npm run dev` affiche le portfolio complet, visuellement identique à l'actuel.

---

## Étape 10 — GitHub Actions

**Objectif** : déploiement automatique via CI/CD.

1. Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

2. Sur GitHub : Settings → Pages → Source → **GitHub Actions**

**Vérification** : push sur `main` → Actions passe au vert → site en ligne à `tom2824.github.io`.

---

## Étape 11 — Nettoyage

**Objectif** : supprimer les anciens fichiers devenus inutiles.

Supprimer :
- `index.html`
- `css/` (le style est dans `src/styles/`)
- `js/` (les scripts sont dans les composants Astro)

Garder :
- `public/images/` (inchangé)
- `docs/` (specs et plans)
- `.github/` (workflow)
- `src/` (Astro)
- `package.json`, `astro.config.mjs`, `tsconfig.json`

**Vérification finale** : `npm run build && npm run preview` → site complet, aucune ressource manquante.
