# Migration Astro — Design Spec
_Date : 2026-04-04_

## Contexte

Le portfolio `tom2824.github.io` est actuellement un site HTML/CSS/JS vanilla avec toutes les données projets hardcodées dans `index.html`. L'objectif est de migrer vers Astro pour :

- Séparer les données du rendu (plus de contenu hardcodé dans le HTML)
- Automatiser le badge "Projet récent" et le style featured selon la date
- Permettre le tri de la liste des projets côté client
- Conserver le même rendu visuel et les mêmes performances

---

## Structure du projet

```
src/
├── data/
│   └── projects.ts          ← données de tous les projets
├── components/
│   ├── ProjectCard.astro     ← carte individuelle
│   ├── ProjectsSection.astro ← section projets + tri
│   ├── Navbar.astro
│   ├── Hero.astro
│   ├── About.astro
│   ├── Skills.astro
│   ├── Experience.astro
│   ├── Education.astro
│   └── Contact.astro
├── layouts/
│   └── Layout.astro          ← <head>, fonts Google, meta
└── pages/
    └── index.astro            ← assemble tous les composants
public/
└── images/                   ← inchangé (copié tel quel)
```

---

## Couche de données

### Interface TypeScript

```ts
export interface Project {
  title: string;
  date: string;          // format "YYYY-MM", ex: "2026-04"
  ongoing?: boolean;     // true = afficher "YYYY — présent" au lieu de "Mois YYYY"
  tags: { label: string; icon?: string }[];
  description: string;
  link?: string;
  collaborators?: { name: string; url?: string }[];
}
```

### Logique automatique (calculée à partir de `date`)

- **Badge "Projet récent"** : affiché si `date` est dans les 12 derniers mois
- **Style featured** : la première carte dans l'ordre de tri courant est toujours full-width (via CSS `:first-child`)
- **Affichage de la date** : formaté en français ("Avr. 2026", "Mars 2026", "2025", "2024 — présent")

### Projets initiaux (ordre chronologique décroissant)

| Titre | Date | Ongoing |
|---|---|---|
| Stop Doomscrolling | 2026-04 | — |
| Deal Express | 2026-03 | — |
| Jeu en JavaScript | 2025 (à préciser) | — |
| Application de messagerie | 2025 (à préciser) | — |
| Application de classification | 2025 (à préciser) | — |
| Ce portfolio | 2024-01 | true |

---

## Composants

### `ProjectCard.astro`
Reçoit un objet `Project` en prop. Calcule en interne :
- Si le badge doit être affiché (`date` < 1 an)
- Le texte de date formaté (mois + année, ou "YYYY — présent")

Ajoute `data-date` et `data-title` sur l'élément racine pour que le JS de tri puisse lire ces valeurs.

### `ProjectsSection.astro`
- Trie `PROJECTS` par date décroissante au build (ordre initial)
- Rend les 4 boutons de tri dans le header de section
- Inclut un `<script>` vanilla JS pour le tri client-side

### `Layout.astro`
Reprend le `<head>` actuel : charset, viewport, title, Google Fonts, lien CSS.

---

## Tri client-side

**UI** : 4 boutons dans le header de la section "Projets"

```
Projets  ────────────  [Récent ✓] [Ancien] [A→Z] [Z→A]
```

- Bouton actif : couleur accent (même teinte que les badges)
- Tri par défaut : Récent (date décroissante)
- Critères : date décroissante, date croissante, titre A→Z, titre Z→A

**Mécanique** : le script JS lit `data-date` / `data-title` sur chaque `.project-card`, trie le tableau de nœuds DOM, et les réinsère dans le conteneur avec `appendChild`. Le CSS `:first-child` sur `.projects-container > .project-card` applique automatiquement le style full-width au premier élément après chaque tri.

---

## CSS

- La distinction featured/grille actuelle (carte séparée au-dessus + `.projects-grid`) est remplacée par un seul conteneur `.projects-container`
- `.projects-container > .project-card:first-child` → `grid-column: 1 / -1` + styles featured
- Les styles visuels existants sont conservés à l'identique

---

## Déploiement

- **Build** : `npm run build` génère `dist/`
- **GitHub Actions** : workflow `deploy.yml` utilisant `withastro/action`
  - Déclenché sur push `main`
  - Build + déploiement sur GitHub Pages
- **GitHub Pages** : configurer la source sur "GitHub Actions" (pas la branche `main`)
- **Domaine** : `tom2824.github.io` inchangé

---

## Ce qui ne change pas

- Rendu visuel identique à l'actuel
- Animations scroll reveal (IntersectionObserver) → script client dans `Layout.astro`
- Calcul de l'âge dynamique → script client
- Navbar active state au scroll → script client
- Icônes dans les tags (`data-icon`) → géré dans `ProjectCard.astro` directement en Astro (pas besoin de JS)
- Dossier `public/images/` copié tel quel
