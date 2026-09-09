export interface Project {
  title: string;
  date: string; // "YYYY-MM"
  ongoing?: boolean;
  tags: { label: string; icon?: string }[];
  /** Description dans chaque langue du site. */
  description: { fr: string; en: string };
  link?: string;
  /** Page interne de démonstration (ex. /pricing-intel), sans préfixe de langue : affichée en action principale. */
  demo?: string;
  collaborators?: { name: string; url?: string }[];
}

export const PROJECTS: Project[] = [
  {
    title: 'Pricing Intel',
    date: '2026-09',
    ongoing: true,
    tags: [
      { label: 'Java 21', icon: 'images/java.png' },
      { label: 'Spring Boot', icon: 'images/spring.svg' },
      { label: 'PostgreSQL', icon: 'images/psql.png' },
      { label: 'Maven', icon: 'images/maven.svg' },
      { label: 'GitHub Actions' },
      { label: 'Supabase', icon: 'images/supabase.svg' },
    ],
    description: {
      fr: "Outil de veille tarifaire et d'aide au pricing sur des composants PC. Un batch Java relève chaque matin les prix d'une quinzaine de produits chez six enseignes, met en quarantaine les relevés douteux, puis un moteur de stratégies propose un prix expliqué règle par règle. Monolithe modulaire en architecture hexagonale, chaque décision documentée dans un ADR. Les résultats se consultent en direct dans la démo.",
      en: 'A price intelligence and pricing support tool for PC components. Every morning a Java batch collects the prices of about fifteen products from six retailers, quarantines doubtful readings, then a strategy engine proposes a price explained rule by rule. A modular monolith in hexagonal architecture, every decision documented in an ADR. Results can be explored live in the demo.',
    },
    link: 'https://github.com/tom2824/pricing-intel',
    demo: '/pricing-intel',
  },
  {
    title: 'Focus Up!',
    date: '2026-04',
    tags: [
      { label: 'JavaScript', icon: 'images/js.png' },
      { label: 'HTML/CSS', icon: 'images/html.png' },
      { label: 'WebExtensions API' },
    ],
    description: {
      fr: "Extension navigateur (Edge / Chrome) qui regarde l'URL actuelle, et selon les paramètres, ferme ou redirige l'onglet ouvert après une limite de temps configurable. Dispose d'un mode Focus qui bloque instantanément tous les sites définis, d'un dark mode et d'une interface FR/EN.",
      en: 'A browser extension (Edge / Chrome) that watches the current URL and, depending on your settings, closes or redirects the tab after a configurable time limit. Comes with a Focus mode that instantly blocks every listed site, a dark mode and a French/English interface.',
    },
    link: 'https://github.com/tom2824/stop-doomscrolling',
  },
  {
    title: 'Deal Express',
    date: '2026-03',
    tags: [
      { label: 'Java', icon: 'images/java.png' },
      { label: 'Spring', icon: 'images/spring.svg' },
      { label: 'React', icon: 'images/react.svg' },
      { label: 'Tailwind', icon: 'images/tailwind.svg' },
    ],
    description: {
      fr: "Deal Express est un projet réalisé en 1 semaine par 5 étudiants de BUT3. C'est un jeu qui consiste à avancer dans une histoire ensemble et à faire des choix pour explorer les différentes fins possibles. L'intérêt de ce jeu est de découvrir les différents modes de décisions possibles, et dans quelles situations chaque mode est le plus adapté.",
      en: 'Deal Express was built in one week by five third-year students. It is a game where you move through a story together and make choices to explore the different possible endings. The point of the game is to discover the different decision-making modes and the situations where each one fits best.',
    },
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
    description: {
      fr: "Jeu original développé en équipe de 3 dans le cadre d'un projet universitaire. Sujet respecté en intégralité avec un résultat fonctionnel malgré des délais courts. Utilisation efficace des issues Git pour la gestion du projet.",
      en: 'An original game developed by a team of three as a university project. The brief was met in full with a working result despite a short deadline. Git issues were used effectively to manage the project.',
    },
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
      { label: 'Maven', icon: 'images/maven.svg' },
    ],
    description: {
      fr: "Application client/serveur de messagerie. Architecture complète avec backend Java, base de données PostgreSQL et frontend web. J'ai principalement géré la partie BDD et backend. Ce projet universitaire nous a permis d'appliquer le pattern MVC dans un projet concret.",
      en: 'A client/server messaging application. Full architecture with a Java back end, a PostgreSQL database and a web front end. I mainly handled the database and back-end parts. This university project let us apply the MVC pattern to a real project.',
    },
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
    description: {
      fr: "Application de classification de données développée en équipe de 4. Ce projet universitaire nous a permis de pratiquer le clean code et la gestion de Git en conditions réelles.",
      en: 'A data classification application developed by a team of four. This university project let us practise clean code and Git workflows in real conditions.',
    },
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
      { label: 'Astro', icon: 'images/astro.svg' },
    ],
    description: {
      fr: "Mon portfolio est pour moi une petite opportunité de m'exercer aux technos webs. C'est l'un des premiers projets concrets que j'ai réalisé, en constante évolution. Il a beaucoup changé au fil du temps, il a eu plusieurs refontes et je continue de le maintenir activement pour le mettre à jour en ajoutant tous mes nouveaux projets.",
      en: 'My portfolio is a small opportunity to practise web technologies. It is one of the first concrete projects I built and it keeps evolving. It has changed a lot over time, been redesigned several times, and I still maintain it actively, adding every new project.',
    },
  },
];
