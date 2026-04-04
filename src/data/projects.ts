export interface Project {
  title: string;
  date: string; // "YYYY-MM"
  ongoing?: boolean;
  tags: { label: string; icon?: string }[];
  description: string;
  link?: string;
  collaborators?: { name: string; url?: string }[];
}

export const PROJECTS: Project[] = [
  {
    title: 'Stop Doomscrolling',
    date: '2026-04',
    tags: [
      { label: 'JavaScript', icon: 'images/js.png' },
      { label: 'HTML/CSS', icon: 'images/html.png' },
      { label: 'WebExtensions API' },
    ],
    description:
      "Extension navigateur (Edge / Chrome) qui regarde l'URL actuelle, et selon les paramètres, ferme ou redirige l'onglet ouvert après une limite de temps configurable. Dispose d'un mode Focus qui bloque instantanément tous les sites définis, d'un dark mode et d'une interface FR/EN.",
    link: 'https://github.com/tom2824/stop-doomscrolling',
  },
  {
    title: 'Deal Express',
    date: '2026-03',
    tags: [
      { label: 'Java', icon: 'images/java.png' },
      { label: 'Spring' },
      { label: 'React', icon: 'images/react.svg' },
      { label: 'Tailwind', icon: 'images/tailwind.svg' },
    ],
    description:
      "Deal Express est un projet réalisé en 1 semaine par 5 étudiants de BUT3. C'est un jeu qui consiste à avancer dans une histoire ensemble et à faire des choix pour explorer les différentes fins possibles. L'intérêt de ce jeu est de découvrir les différents modes de décisions possibles, et dans quelles situations chaque mode est le plus adapté.",
    link: 'https://dealexpress.betteragile.fr/',
  },
  {
    title: 'Jeu en JavaScript',
    date: '2025-01',
    tags: [
      { label: 'JavaScript', icon: 'images/js.png' },
      { label: 'HTML/CSS', icon: 'images/html.png' },
      { label: 'Babel', icon: 'images/babel.png' },
      { label: 'Webpack', icon: 'images/webpack.png' },
    ],
    description:
      "Jeu original développé en équipe de 3 dans le cadre d'un projet universitaire. Sujet respecté en intégralité avec un résultat fonctionnel malgré des délais courts. Utilisation efficace des issues Git pour la gestion du projet.",
    link: 'https://gitlab.univ-lille.fr/jsae/projets-2024-2025/groupe-g/equipe-6',
    collaborators: [
      { name: 'Gabriel R.I.', url: 'https://goniix.github.io/' },
      { name: 'Julien D.' },
    ],
  },
  {
    title: 'Application de messagerie',
    date: '2025-01',
    tags: [
      { label: 'Java', icon: 'images/java.png' },
      { label: 'Jakarta/JEE' },
      { label: 'PostgreSQL', icon: 'images/psql.png' },
      { label: 'JavaScript', icon: 'images/js.png' },
      { label: 'Maven' },
    ],
    description:
      "Application client/serveur de messagerie. Architecture complète avec backend Java, base de données PostgreSQL et frontend web. J'ai principalement géré la partie BDD et backend. Ce projet universitaire nous a permis d'appliquer le pattern MVC dans un projet concret.",
    link: 'https://gitlab.univ-lille.fr/gabriel.redouin-innecco.etu/Matterlast',
    collaborators: [
      { name: 'Gabriel R.I.', url: 'https://goniix.github.io/' },
    ],
  },
  {
    title: 'Application de classification',
    date: '2025-01',
    tags: [
      { label: 'Java', icon: 'images/java.png' },
      { label: 'JavaFX' },
      { label: 'SceneBuilder', icon: 'images/sb.png' },
      { label: 'CSS', icon: 'images/css.png' },
    ],
    description:
      "Application de classification de données développée en équipe de 4. Ce projet universitaire nous a permis de pratiquer le clean code et la gestion de Git en conditions réelles.",
    link: 'https://gitlab.univ-lille.fr/sae302/2024/G3_SAE3.3',
    collaborators: [
      { name: 'Gaspard C.', url: 'https://gaspard4i.github.io/' },
      { name: 'Gabriel R.I.', url: 'https://goniix.github.io/' },
      { name: 'Cyprien F.' },
    ],
  },
  {
    title: 'Ce portfolio',
    date: '2024-01',
    ongoing: true,
    tags: [
      { label: 'HTML', icon: 'images/html.png' },
      { label: 'CSS', icon: 'images/css.png' },
      { label: 'JavaScript', icon: 'images/js.png' },
      { label: 'Astro' },
    ],
    description:
      "Mon portfolio est pour moi une petite opportunité de m'exercer aux technos webs. C'est l'un des premiers projets concrets que j'ai réalisé, en constante évolution. Il a beaucoup changé au fil du temps, il a eu plusieurs refontes et je continue de le maintenir activement pour le mettre à jour en ajoutant tous mes nouveaux projets.",
  },
];
