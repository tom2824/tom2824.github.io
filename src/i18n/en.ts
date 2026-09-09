import type { Dictionary } from './fr';

/** English version of the site. Same shape as the French dictionary, which is the reference. */
export const en: Dictionary = {
  lang: 'en',
  layout: {
    title: 'Tom NGUYEN — Portfolio',
    cvTitle: 'Tom NGUYEN — Resume',
    pricingTitle: 'Tom NGUYEN — Pricing Intel',
    description:
      'Tom Nguyen, junior developer with a French computer science degree (BUT Informatique, IUT de Lille) and one year as a work-study developer at Norauto International. Looking for a first back-end, full-stack or data developer position in Lille, France.',
  },
  nav: {
    about: 'About',
    skills: 'Skills',
    projects: 'Projects',
    experience: 'Experience',
    reflexive: 'Reflection',
    education: 'Education',
    contact: 'Contact',
    demo: 'Pricing Intel demo',
    cv: 'Resume',
    switch: 'FR',
    switchTitle: 'Lire ce site en français',
    menu: 'Menu',
  },
  hero: {
    greeting: "Hi! I'm",
    subtitle: 'years old · Junior developer · Computer science graduate (BUT)',
    status: 'Available now',
    description:
      'A computer science graduate (BUT Informatique) with one year as a work-study developer in the Pricing team at Norauto International, I am looking for a first developer position where I can keep learning alongside a team and build experience on real projects. Drawn to data and automation, I am equally at ease on the back end (C#, Java, SQL) and in data processing (SQL Server, Snowflake).',
    projects: 'See my projects',
    contact: 'Get in touch',
    cv: 'See my resume',
    cvTitle: (version: string, date: string) => `Resume version ${version}, ${date}`,
  },
  about: {
    title: 'About',
    text1:
      'I graduated in 2026 with a BUT Informatique, a three-year computer science degree from the IUT de Lille, and spent my final year as a work-study developer in the Pricing team at Norauto International, working on large-scale data collection and processing. I now want to join a company as a developer to learn from experienced professionals, grow my skills on real projects and build genuine hands-on experience. I am convinced that software is a field where you never stop learning, and that is exactly what motivates me.',
    seekingTitle: 'What I am looking for',
    seeking: [
      { label: 'Role', value: 'Junior developer — back-end, full-stack or data' },
      { label: 'Contract', value: 'Permanent or fixed-term' },
      { label: 'Location', value: 'Lille and its metropolitan area, France' },
      { label: 'Availability', value: 'Immediate' },
    ],
    text2:
      'Outside of code, weight training taught me discipline and consistency, video games feed my creativity and competitive spirit, and philosophy gives me perspective and sharpens my critical thinking.',
    interestsTitle: 'Interests',
    interests: ['Video games', 'Tabletop role-playing', 'Weight training', 'Philosophy', 'Software development', 'Hardware', 'Data science', 'Artificial intelligence'],
    imageAlt: 'My custom-built PC',
  },
  skills: {
    title: 'Skills',
    techLabel: 'Technical skills',
    categories: {
      oop: 'OOP & Functional programming',
      ui: 'User interfaces',
      sql: 'SQL',
      nosql: 'NoSQL',
      data: 'Data science',
      web: 'Web development',
      mobile: 'Mobile',
      devops: 'DevOps',
      agile: 'Project management & Agile',
    },
    tags: { cicd: 'CI/CD pipelines' },
    softLabel: 'Soft skills',
    softBlocks: [
      {
        title: 'How I work',
        cards: [
          {
            title: 'Adaptability & prioritisation',
            text: 'At Norauto, the websites we collected from changed constantly: new page structures, new anti-bot measures, captchas we had never seen. Any morning could bring its share of broken scrapers to fix urgently, because we delivered daily. I learned to prioritise critical tasks quickly and to make decisions under time pressure without being overwhelmed.',
          },
          {
            title: 'Composure & rigour',
            text: 'I am calm by nature and do not panic when things go wrong. I take the time to step back, analyse the situation and make the right call rather than rushing. Knowing that I can be absent-minded, I set up a systematic note-taking habit for everything I do, which keeps me organised and stops anything from slipping through.',
          },
          {
            title: 'Autonomy & self-confidence',
            text: 'During my work-study year I managed my own priorities every day: keeping production running first, new developments second. I reported progress to my manager in regular check-ins, but the organisation of my work was mine. That responsibility taught me that I am more capable than I thought, as long as I trust myself and use common sense.',
          },
        ],
      },
      {
        title: 'How I communicate',
        cards: [
          {
            title: 'Understanding needs & listening',
            text: 'When setting up new scrapers, I had to understand exactly what the business units needed: which products to target, which attributes to collect to enable competitor comparison. My manager, as Product Owner, acted as the go-between, but I could also talk directly with the business units, mostly through tickets. I made a point of restating the need in my own words to avoid misunderstandings.',
          },
          {
            title: 'Knowing when to ask for help',
            text: 'When in doubt, I go to the right people without hesitation. At Norauto: my tech lead for technical questions, my manager (PO) for business expectations, or my senior colleague for anything about the solution itself. I learned that asking questions is not a weakness but an essential skill for moving forward efficiently.',
          },
        ],
      },
      {
        title: 'How I work with others',
        cards: [
          {
            title: 'Teamwork & collaboration',
            text: 'Although I worked autonomously, setting up new scrapers required close collaboration. I relied on everyone\'s expertise: my tech lead for product specifics, my senior colleague for deep knowledge of the solution, and the colleagues in direct contact with the French, Belgian, Spanish, Italian and Portuguese business units for information on production pipelines. Before starting a new development, I checked with the team what already existed so as to build on it.',
          },
        ],
      },
    ],
    languagesLabel: 'Languages',
    languages: ['English — C1 (Cambridge certificate)', 'Spanish — A2', 'French — native'],
    languagesDetail:
      'Cambridge C1 certificate, built over years of speaking English online and a European section in English at high school.',
  },
  projects: {
    title: 'Projects',
    sort: { recent: 'Newest', oldest: 'Oldest', az: 'A→Z', za: 'Z→A' },
    recent: 'Recent project',
    present: 'present',
    months: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
    view: 'View project',
    demo: 'Open the demo',
    code: 'Source code',
    with: 'With',
    and: ' and ',
  },
  experience: {
    title: 'Experience',
    autonomyLabel: 'Autonomy:',
    entries: [
      {
        badge: 'Work-study',
        title: 'Work-study developer, Pricing team — Norauto International',
        date: 'September 2025 — August 2026',
        tags: ['C#', 'MSSQL', 'JavaScript', 'XML', 'Bash', 'Snowflake'],
        context:
          'A team of 7 running competitive price intelligence for several international business units (France, Belgium, Spain, Italy, Portugal). The team provides the data behind pricing decisions on products and services.',
        missions: [
          'Design and maintenance of web scraping pipelines for competitor price monitoring (C#, XML, XPath)',
          'Cleaning and processing of collected data through SQL Server stored procedures (delta detection)',
          'Progressive migration of data flows to Snowflake, time-series analysis and anomaly detection',
          'Automation and hardening of the collection: VPN/proxy management scripts and browser automation',
        ],
        autonomy:
          'I managed my own priorities day to day, keeping production running before starting new developments. Regular check-ins with my manager, who acted as Product Owner. Direct exchanges with the business units, mostly through tickets.',
      },
      {
        badge: 'Internship',
        title: 'Intern, Pricing team — Norauto International',
        date: 'April — May 2025',
        tags: ['C#', 'MSSQL', 'JavaScript', 'XML', 'Bash'],
        context: 'A team of 3 within the Pricing department. First immersion in a professional data environment.',
        missions: [
          'Maintenance of the existing web data collection system',
          'Development and maintenance of proxies',
          'Discovering how a corporate data team works',
        ],
      },
      {
        badge: 'Freelance',
        title: 'IT contractor — Norauto International',
        date: 'October 2024 — September 2025',
        tags: ['C#', 'MSSQL', 'JavaScript', 'XML', 'Bash'],
        missions: [
          'Maintenance of the data collection system and proxies',
          'Data integrity checks and monitoring of processing runs',
        ],
      },
      {
        badge: 'Seasonal job',
        title: 'Qualified maintenance worker — Lille University Hospital (Salengro)',
        date: 'August 2024',
        text: 'Sterilisation department. A formative experience in team cohesion and working with new people.',
      },
      {
        badge: 'Seasonal job',
        title: 'Hospital services worker — Lille University Hospital (Huriez)',
        date: 'August 2023',
        text: 'First professional experience. Learning to communicate within a team and to settle in step by step.',
      },
    ],
  },
  reflexive: {
    title: 'Reflection',
    intro: 'What my work-study year and my professional experiences taught me about myself, my strengths and where I still need to grow.',
    discovered: {
      title: 'What I discovered about myself',
      text: 'Before working in a company, autonomy scared me. I doubted my ability to handle real responsibilities on my own. In practice, I discovered that when I trust myself and use common sense, I am perfectly capable of being autonomous. The turning point was understanding that you just need to not be afraid of asking questions when you need help: autonomy does not mean doing everything alone.',
    },
    strengths: {
      title: 'My identified strengths',
      items: [
        { label: 'Composure:', text: 'calm by nature, I never panic when things go wrong. I take the time to think before acting, which leads to better decisions.' },
        { label: 'Compensating rigour:', text: 'aware that I can be absent-minded, I turned that weakness into a strength by systematically writing down everything I do. The result is a solid, reliable organisation.' },
        { label: 'Perfectionism under control:', text: 'I am naturally a perfectionist, which makes my work rigorous. The workplace taught me to compromise when deadlines demand it, and to move on when "perfect" is not an option.' },
      ],
    },
    growth: {
      title: 'My main area for growth',
      text1a: 'My biggest area for improvement is ',
      text1b: 'proactive curiosity',
      text1c: ' and communication in the broad sense. I tend to stay focused on what I am asked to do and to live in my bubble, without trying to understand the wider context around me.',
      text2: 'Yet knowing my environment better, the processes, everyone\'s role, how the other teams work, would make me more effective and let me know immediately who to turn to when needed. It is something I am actively working on.',
    },
    needs: {
      title: 'What I need in order to grow',
      items: [
        'Keep developing my curiosity by taking more interest in the jobs and processes around me',
        'Take the initiative to talk with colleagues more often, beyond what is strictly necessary',
        'Join a development team to learn from experienced people and keep training on the job, especially in data',
        'Expose myself to varied contexts to keep building my self-confidence',
      ],
    },
  },
  education: {
    title: 'Education',
    entries: [
      {
        badge: 'Graduated 2026',
        title: 'BUT Informatique (three-year computer science degree) — IUT de Lille',
        date: '2023 — 2026',
        text: 'Application development track: software design, development, validation and maintenance. Third year as a work-study developer at Norauto International.',
      },
      { badge: 'Completed', title: 'BUT GEII (electrical engineering) — IUT de Lille', date: '2022 — 2023', text: 'First year completed, then switched to computer science.' },
      { badge: 'Highest honours', title: 'French Baccalauréat — Lycée Faidherbe', date: '2019 — 2022', text: 'Computer science and mathematics majors. European section in English.' },
    ],
  },
  contact: { title: 'Contact' },
  footer: { copyright: '© 2026 Tom NGUYEN' },
  cv: {
    title: 'My resume',
    version: (version: string, date: string) => `Version ${version} · updated ${date} · one page, PDF`,
    download: 'Download the PDF',
    open: 'Open in a new tab',
    fallback: 'The preview does not display in this browser.',
    fallbackLink: 'Download the PDF',
    fallbackEnd: ' to read it.',
    previewAlt: "Preview of Tom NGUYEN's resume",
    otherLanguage: 'French version:',
    otherLanguageLink: 'download the resume in French',
  },
  pricing: {
    intro:
      'Price intelligence on PC components. Every morning, a Java batch collects the price of about fifteen products from six French and European retailers, discards doubtful readings, then a strategy engine proposes a price and explains it rule by rule. This page reads the project database live.',
    links: { code: 'Source code', adr: 'Architecture decision records (ADR)', philosophy: 'Project philosophy' },
    disclaimer:
      'A personal, educational project: "our price" and the purchase price are fictitious values, updated daily by the engine itself, and the strategies are textbook pricing strategies. The prices shown are those publicly listed on the retailers\' websites on the indicated date.',
    loading: 'Loading data…',
    tabs: { matrix: 'Product × retailer matrix', summary: 'Summary and recommended price', how: 'How it works' },
    matrix: {
      rows: 'Rows',
      strict: 'One product per row',
      segment: 'One segment per row: equivalent products grouped',
      hideMarketplace: 'Hide third-party seller offers (marketplaces)',
    },
    summary: {
      rules: 'Pricing rules',
      market: 'Observed market',
      strict: 'Strict: this product\'s listings only',
      segment: 'Segment: equivalent products too',
      hint: 'A row expands to show how the recommended price was built.',
    },
    dialog: { title: 'History', close: 'Close' },
    how: {
      diagramTitle: 'Pricing Intel flow: retailers, collection, database, pricing engine, portfolio',
      retailers: { title: 'Retailers', l1: 'LDLC · TopAchat', l2: 'Materiel.net · Cybertek', l3: '1fodiscount · Alternate', note: 'public product pages' },
      collect: { title: 'Collection', l1: 'Java batch, every morning', l2: 'run by GitHub Actions', n1: 'robots.txt, pacing, User-Agent', n2: 'JSON-LD → embedded JSON → CSS', n3: 'one reading per listing per day' },
      store: { title: 'Database', l1: 'PostgreSQL on Supabase (Paris)', n1: 'catalogue and listings', n2: 'readings, failures, quarantine', n3: 'explained recommendations', n4: 'read views (api schema)' },
      front: { title: 'This page', l1: 'Astro, static site', l2: 'GitHub Pages', note: 'no application server' },
      engine: { title: 'Pricing engine', l1: 'same batch, right after collection', n1: 'market rules → strategy → guardrails', n2: 'a recommended price, explained step by step' },
      edges: { http: 'HTTP', snapshots: 'readings', api: 'REST API', readOnly: 'read only', recommendations: 'recommendations', market: 'today\'s market' },
      steps: [
        { title: 'An explicit catalogue.', text: 'Every tracked product is described by its family and attributes, with its identifiers (GTIN, manufacturer part number) and the matching listing at each retailer. Products in the same segment, for instance the 12 GB RTX 5070 cards, are declared equivalent.' },
        { title: 'Polite, robust collection.', text: 'A Java batch runs every morning on GitHub Actions. It honours robots.txt, spaces out its requests and identifies itself with a recognisable User-Agent. The price is read first from the page\'s structured data (JSON-LD), then from embedded JSON, then from the HTML: three extractors in cascade, to survive website redesigns.' },
        { title: 'Data you can trust.', text: 'One reading per listing per day, collection failures stored, and a price that jumps abruptly is quarantined until confirmed the next day. A day without a reading stays a visible gap, never filled in.' },
        { title: 'A recommended price that explains itself.', text: 'The engine has no server of its own: it is a module of the same batch, run right after collection on the day\'s market. It first builds that market: fresh, in-stock, new, non-quarantined offers. A strategy proposes a price (index on the median, alignment, undercut, target margin), then guardrails correct it: margin floor, ceiling, maximum daily move, rounding. Every step is stored and readable in the summary. Seven rule profiles are computed on each run, and the summary selector picks among them. The index next to each price relates it to the market median: 100 is the median; 95 is 5% below. And every morning, a rule drawn at random among the seven becomes "our price" for the day, so that the demo stays alive and our price has a history against the market.' },
        { title: 'No server to maintain.', text: 'The batch runs on GitHub Actions, the database and its REST API are hosted by Supabase in the Paris region, and this site is served by GitHub Pages. Results are precomputed and exposed read-only on a dedicated schema of views, with a public key: this page reads them straight from the browser. Nothing is hosted by hand, and everything fits within free tiers. The same code, packaged with Spring, can be deployed as a permanent service the day a professional use calls for it.' },
      ],
      archA: 'The code is a modular monolith in hexagonal architecture: a pure domain, ports, swappable adapters (HTTP, scraping, files, PostgreSQL), and every structural decision recorded in an ',
      archLink: 'ADR',
      archB: '. Choices, trade-offs and mistakes are written down at the moment they are made.',
    },
  },
};
