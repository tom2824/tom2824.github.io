// CV de Tom NGUYEN — source Typst
// Compilation (depuis la racine du repo) : npm run cv
// Objectif : PDF texte, une colonne, lisible par les ATS et les IA.

#let accent = rgb("#8b5e3c")
#let muted = rgb("#5a5048")

#set page(paper: "a4", margin: (x: 1.4cm, top: 1.0cm, bottom: 0.9cm))
#set text(font: ("Lato", "Carlito", "DejaVu Sans"), size: 9.2pt, lang: "fr", hyphenate: false)
#set par(leading: 0.5em, justify: false)
#show link: it => text(fill: accent, it)
#set list(indent: 0.6em, body-indent: 0.5em, marker: text(fill: accent)[•])

#let section(title) = {
  v(5pt)
  block(breakable: false)[
    #text(size: 11pt, weight: "bold", fill: accent, tracking: 0.06em, upper(title))
    #v(-5pt)
    #line(length: 100%, stroke: 0.7pt + accent)
  ]
  v(1pt)
}

#let entry(title, org, date, body) = block(breakable: false, above: 7pt, below: 4pt)[
  #grid(columns: (1fr, auto), column-gutter: 8pt,
    [#text(weight: "bold")[#title] #h(3pt) #text(fill: muted)[— #org]],
    text(size: 8.8pt, fill: muted, style: "italic")[#date],
  )
  #v(-3pt)
  #body
]

#let skill(label, items) = grid(
  columns: (3.3cm, 1fr), column-gutter: 6pt, row-gutter: 3pt,
  text(weight: "bold", fill: muted)[#label], items,
)

// ================= EN-TÊTE =================
#grid(
  columns: (1fr, 2.6cm), column-gutter: 14pt, align: (left + horizon, right + top),
  [
    #text(size: 24pt, weight: "bold", tracking: 0.02em)[Tom NGUYEN]
    #v(-6pt)
    #text(size: 12pt, fill: accent, weight: "semibold")[Développeur junior · Diplômé BUT Informatique]
    #v(-3pt)
    #text(fill: muted)[22 ans · Lille]
    #v(2pt)
    #text(size: 9pt)[
      Email : #link("mailto:nguyen.tom.2824@gmail.com")[nguyen.tom.2824\@gmail.com] \
      Portfolio : #link("https://tom2824.github.io")[tom2824.github.io] #h(8pt)
      GitHub : #link("https://github.com/tom2824")[github.com/tom2824] #h(8pt)
      LinkedIn : #link("https://www.linkedin.com/in/tom2824/")[linkedin.com/in/tom2824]
    ]
  ],
  box(clip: true, radius: 50%, width: 2.6cm, height: 2.6cm, stroke: 1pt + accent,
    image("photo.jpg", width: 2.6cm, height: 2.6cm, fit: "cover")),
)

// ================= PROFIL =================
#section("Profil")
Diplômé du BUT Informatique (IUT de Lille, 2026) après un an d'alternance dans l'équipe Pricing de Norauto International : pipelines de web scraping en C\#, traitement de données sur SQL Server et Snowflake, automatisation de la collecte.
Je recherche un premier poste de *développeur back-end, full-stack ou data* sur la métropole lilloise, en CDI ou CDD, pour continuer à apprendre au sein d'une équipe et gagner en expérience sur des projets concrets. *Disponible immédiatement.*

// ================= EXPÉRIENCE =================
#section("Expérience professionnelle")

#entry("Développeur alternant, équipe Pricing", "Norauto International", "Sept. 2025 – Août 2026")[
  Équipe de 7 personnes en charge de la veille tarifaire concurrentielle pour les business units France, Espagne, Italie et Portugal.
  - Conception et maintenance de pipelines de web scraping pour le monitoring des prix concurrents (C\#, XML, XPath, JavaScript, TypeScript)
  - Nettoyage et traitement des données via procédures stockées SQL Server : détection de deltas et d'anomalies, analyse temporelle
  - Migration progressive des flux de données vers Snowflake (DBT) ; fiabilisation de la collecte via un parc de proxies et VPN (Bash, crontab)
  - Gestion autonome du run quotidien avec livraison journalière ; échanges directs avec les business units via tickets
]

#entry("Stagiaire, équipe Pricing", "Norauto International", "Avril – Mai 2025")[
  - Maintenance des scripts de web scraping et de l'infrastructure de proxies au sein d'une équipe data
]

#entry("Prestataire informatique (auto-entrepreneur)", "Norauto International", "Oct. 2024 – Sept. 2025")[
  - Maintenance du système de collecte et des proxies, contrôle d'intégrité des données et suivi des traitements
]

#entry("Emplois saisonniers", "CHU de Lille (Salengro, Huriez)", "Étés 2023 et 2024")[
  - Agent des services hospitaliers puis agent d'entretien qualifié en stérilisation : travail en équipe, rigueur des procédures
]

// ================= PROJETS =================
#section("Projets")

#entry("Focus Up!", "extension navigateur, projet personnel", "2026")[
  - Extension Edge / Chrome (JavaScript, WebExtensions API) limitant le temps passé sur des sites configurés, mode Focus, interface FR/EN — #link("https://github.com/tom2824/stop-doomscrolling")[github.com/tom2824/stop-doomscrolling]
]

#entry("Deal Express", "projet universitaire, équipe de 5", "2026")[
  - Jeu narratif à choix multiples réalisé en une semaine (Java, Spring, React, Tailwind CSS) — #link("https://dealexpress.betteragile.fr/")[dealexpress.betteragile.fr]
]

#entry("Application de messagerie client / serveur", "projet universitaire", "2025")[
  - Backend Java (Jakarta EE, Maven) et base PostgreSQL en architecture MVC ; en charge de la base de données et du backend
]


// ================= COMPÉTENCES =================
#section("Compétences techniques")
#skill("Langages", [C\#, Java, Python, JavaScript / TypeScript, Kotlin, SQL, Bash])
#skill("Web & back-end", [Spring Boot, Jakarta EE, React, React Native / Expo, Astro, Tailwind CSS, HTML / CSS, JavaFX])
#skill("Données", [SQL Server, PostgreSQL, Snowflake, DBT, MongoDB, Redis, Pandas, NumPy, scikit-learn])
#skill("DevOps & outils", [Git, pipelines CI/CD (GitHub Actions, GitLab CI), Docker, Podman, Terraform, Maven, Gradle, Jira])
#skill("Méthodes", [POO, TDD, Clean Code, Scrum, Kanban, Gantt])

// ================= FORMATION =================
#section("Formation")

#entry("BUT Informatique, parcours réalisation d'applications", "IUT de Lille – Université de Lille", "2023 – 2026")[
  Conception, développement et maintenance de logiciels. Troisième année en alternance chez Norauto International.
]
#entry("BUT GEII, première année validée puis réorientation vers l'informatique", "IUT de Lille", "2022 – 2023")[]
#entry("Baccalauréat général, mention Très Bien, spécialités NSI et Mathématiques", "Lycée Faidherbe, Lille", "2019 – 2022")[]

// ================= LANGUES & INTÉRÊTS =================
#section("Langues et centres d'intérêt")
#skill("Langues", [Français (langue maternelle), Anglais C1 (certification Cambridge), Espagnol A2])
#skill("Centres d'intérêt", [Musculation, jeux vidéo, jeu de rôle, philosophie])
