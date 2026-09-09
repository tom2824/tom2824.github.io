// Tom NGUYEN's resume, English version — Typst source
// Compilation (from the repo root): npm run cv   (builds both the French and the English PDF)
// Goal: text PDF, one column, readable by ATS and AI screeners. Content mirrors cv.typ (French).

#let accent = rgb("#8b5e3c")
#let muted = rgb("#5a5048")

// Version and date injected by cv/build.mjs (--input), see cv/CHANGELOG.md
#let version = sys.inputs.at("version", default: "dev")
#let vdate = sys.inputs.at("date", default: "")

#set document(
  title: "Resume Tom NGUYEN — v" + version,
  author: "Tom NGUYEN",
  keywords: ("resume", "CV", "developer", "Lille", "France", "version " + version, vdate),
)
#set page(
  paper: "a4",
  margin: (x: 1.4cm, top: 0.9cm, bottom: 0.75cm),
  footer: align(right, text(size: 6.5pt, fill: muted.lighten(35%))[
    Resume v#version #if vdate != "" [· #vdate] · tom2824.github.io/en
  ]),
)
#set text(font: ("Lato", "Carlito", "DejaVu Sans"), size: 9.0pt, lang: "en", hyphenate: false)
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

// ================= HEADER =================
#grid(
  columns: (1fr, 2.6cm), column-gutter: 14pt, align: (left + horizon, right + top),
  [
    #text(size: 24pt, weight: "bold", tracking: 0.02em)[Tom NGUYEN]
    #v(-6pt)
    #text(size: 12pt, fill: accent, weight: "semibold")[Junior developer · Computer science graduate (BUT Informatique)]
    #v(-3pt)
    #text(fill: muted)[22 years old · Ronchin, Lille metropolitan area, France]
    #v(2pt)
    #text(size: 9pt)[
      Email: #link("mailto:nguyen.tom.2824@gmail.com")[nguyen.tom.2824\@gmail.com] \
      Portfolio: #link("https://tom2824.github.io/en")[tom2824.github.io/en] #h(8pt)
      GitHub: #link("https://github.com/tom2824")[github.com/tom2824] #h(8pt)
      LinkedIn: #link("https://www.linkedin.com/in/tom2824/")[linkedin.com/in/tom2824]
    ]
  ],
  box(clip: true, radius: 50%, width: 2.6cm, height: 2.6cm, stroke: 1pt + accent,
    image("photo.jpg", width: 2.6cm, height: 2.6cm, fit: "cover")),
)

// ================= PROFILE =================
#section("Profile")
Computer science graduate (BUT Informatique, a three-year degree from the IUT de Lille, 2026) after one year as a work-study developer in the Pricing team at Norauto International: web scraping pipelines in C\#, data processing on SQL Server and Snowflake, collection automation.
Looking for a first *back-end, full-stack or data developer* position in the Lille area (France), permanent or fixed-term, to keep learning within a team and gain experience on real projects. *Available immediately.*

// ================= EXPERIENCE =================
#section("Professional experience")

#entry("Work-study developer, Pricing team", "Norauto International", "Sept. 2025 – Aug. 2026")[
  Competitive price intelligence for the French, Belgian, Spanish, Italian and Portuguese business units (team of 7).
  - Design and maintenance of web scraping pipelines for competitor price monitoring (C\#, XML, XPath, JavaScript, TypeScript)
  - Data cleaning and processing through SQL Server stored procedures: delta and anomaly detection, time-series analysis
  - Progressive migration of data flows to Snowflake (DBT); hardening of the collection with a proxy and VPN fleet (Bash, crontab)
  - Autonomous ownership of the daily run with daily delivery; direct exchanges with the business units through tickets
]

#entry("Intern, Pricing team", "Norauto International", "April – May 2025")[
  - Maintenance of the web scraping scripts and the proxy infrastructure within a data team
]

#entry("IT contractor (freelance)", "Norauto International", "Oct. 2024 – Sept. 2025")[
  - Maintenance of the collection system and proxies, data integrity checks and monitoring of processing runs
]

#entry("Seasonal jobs", "Lille University Hospital (Salengro, Huriez)", "Summers 2023 and 2024")[
  - Hospital services worker, then qualified maintenance worker in sterilisation: teamwork, strict procedures
]

// ================= PROJECTS =================
#section("Projects")

#entry("Pricing Intel", "personal project, in progress", "2026")[
  - Price intelligence on PC components: daily Java collection, PostgreSQL, explained strategy engine, live demo (Spring Boot, hexagonal, ADRs) — #link("https://github.com/tom2824/pricing-intel")[github.com/tom2824/pricing-intel]
]

#entry("Focus Up!", "browser extension, personal project", "2026")[
  - Edge / Chrome extension (JavaScript, WebExtensions API) limiting time spent on configured websites, Focus mode, FR/EN interface — #link("https://github.com/tom2824/stop-doomscrolling")[github.com/tom2824/stop-doomscrolling]
]

#entry("Deal Express", "university project, team of 5", "2026")[
  - Multiple-choice narrative game built in one week (Java, Spring, React, Tailwind CSS) — #link("https://dealexpress.betteragile.fr/")[dealexpress.betteragile.fr]
]


// ================= SKILLS =================
#section("Technical skills")
#skill("Languages", [C\#, Java, Python, JavaScript / TypeScript, Kotlin, SQL, Bash])
#skill("Web & back end", [Spring Boot, Jakarta EE, React, React Native / Expo, Astro, Tailwind CSS, HTML / CSS, JavaFX])
#skill("Data", [SQL Server, PostgreSQL, Snowflake, DBT, MongoDB, Redis, Pandas, NumPy, scikit-learn])
#skill("DevOps & tools", [Git, CI/CD pipelines (GitHub Actions, GitLab CI), Docker, Podman, Terraform, Maven, Gradle, Jira])
#skill("Methods", [OOP, TDD, Clean Code, Scrum, Kanban, Gantt])

// ================= EDUCATION =================
#section("Education")

#entry("BUT Informatique, application development track (3-year computer science degree)", "IUT de Lille – Université de Lille", "2023 – 2026")[
  Software design, development and maintenance. Third year as a work-study developer at Norauto International.
]
#entry("BUT GEII (electrical engineering), first year completed, then switch to computer science", "IUT de Lille", "2022 – 2023")[]
#entry("French Baccalauréat with highest honours, computer science and mathematics majors, European section in English", "Lycée Faidherbe, Lille", "2019 – 2022")[]

// ================= LANGUAGES & INTERESTS =================
#section("Languages and interests")
#skill("Languages", [French (native), English C1 (Cambridge certificate), Spanish A2])
#skill("Interests", [Weight training, video games, tabletop role-playing, philosophy])
