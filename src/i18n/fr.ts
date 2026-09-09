/** Textes du site en français : la référence. Le dictionnaire anglais doit avoir exactement la même forme. */
export const fr = {
  lang: 'fr',
  layout: {
    title: 'Tom NGUYEN — Portfolio',
    cvTitle: 'Tom NGUYEN — CV',
    pricingTitle: 'Tom NGUYEN — Pricing Intel',
    description:
      "Tom Nguyen, développeur junior diplômé du BUT Informatique (IUT de Lille), un an d'alternance chez Norauto International. En recherche d'un premier poste de développeur back-end, full-stack ou data sur Lille.",
  },
  nav: {
    about: 'À propos',
    skills: 'Compétences',
    projects: 'Projets',
    experience: 'Expérience',
    reflexive: 'Réflexion',
    education: 'Formation',
    contact: 'Réseaux',
    demo: 'Démo Pricing Intel',
    cv: 'CV',
    switch: 'EN',
    switchTitle: 'Read this site in English',
    menu: 'Menu',
  },
  hero: {
    greeting: "Salut ! Moi c'est",
    subtitle: 'ans · Développeur junior · Diplômé BUT Informatique',
    status: 'Disponible immédiatement',
    description:
      "Diplômé du BUT Informatique et fort d'un an d'alternance dans l'équipe Pricing de Norauto International, je cherche aujourd'hui un premier poste de développeur pour continuer à apprendre au contact d'une équipe et gagner en expérience sur des projets concrets. Attiré par la data et l'automatisation, je suis à l'aise aussi bien sur le back-end (C#, Java, SQL) que sur le traitement de données (SQL Server, Snowflake).",
    projects: 'Voir mes projets',
    contact: 'Me contacter',
    cv: 'Voir mon CV',
    cvTitle: (version: string, date: string) => `CV version ${version} du ${date}`,
  },
  about: {
    title: 'À propos',
    text1:
      "Diplômé du BUT Informatique de l'IUT de Lille en 2026, j'ai effectué ma dernière année en alternance au sein de l'équipe Pricing de Norauto International, où j'ai travaillé sur la collecte et le traitement de données à grande échelle. Aujourd'hui, je souhaite rejoindre une entreprise en tant que développeur pour me former au contact de professionnels expérimentés, monter en compétences sur des projets réels et construire une vraie expérience terrain. Je suis convaincu que l'informatique est un domaine où l'on ne cesse jamais d'apprendre — et c'est ce qui me motive.",
    seekingTitle: 'Ce que je recherche',
    seeking: [
      { label: 'Poste', value: 'Développeur junior — back-end, full-stack ou data' },
      { label: 'Contrat', value: 'CDI ou CDD' },
      { label: 'Lieu', value: 'Lille et sa métropole' },
      { label: 'Disponibilité', value: 'Immédiate' },
    ],
    text2:
      "En dehors du code, la musculation m'a enseigné la discipline et la régularité, les jeux vidéo nourrissent ma créativité et mon esprit compétitif, et la philosophie m'apporte du recul et nourrit mon esprit critique.",
    interestsTitle: "Centres d'intérêt",
    interests: ['Jeux vidéo', 'Jeu de rôle', 'Musculation', 'Philosophie', 'Développement / Programmation', 'Hardware', 'Data Science', 'Intelligence Artificielle'],
    imageAlt: 'Mon PC custom build',
  },
  skills: {
    title: 'Compétences',
    techLabel: 'Compétences techniques',
    categories: {
      oop: 'POO & Programmation Fonctionnelle',
      ui: 'IHM',
      sql: 'SQL',
      nosql: 'NoSQL',
      data: 'Data Science',
      web: 'Dev Web',
      mobile: 'Mobile',
      devops: 'DevOps',
      agile: 'Gestion de projets & Agilité',
    },
    tags: { cicd: 'Pipelines CI/CD' },
    softLabel: 'Compétences comportementales',
    softBlocks: [
      {
        title: "Manière d'être",
        cards: [
          {
            title: 'Adaptabilité & gestion des priorités',
            text: "Chez Norauto, les sites que nous collections évoluaient en permanence : changements de structure, nouvelles mesures anti-bots, captchas inédits. Chaque matin pouvait apporter son lot d'aspirations bloquées à corriger en urgence, car nous livrions quotidiennement. J'ai appris à prioriser rapidement les tâches critiques et à prendre des décisions sous contrainte de temps, sans me laisser déborder.",
          },
          {
            title: 'Sang-froid & rigueur',
            text: "De nature calme, je ne panique pas face aux imprévus. Je prends le temps de me poser, d'analyser la situation et de prendre la bonne décision plutôt que de me précipiter. Étant conscient de ma tendance à être tête en l'air, j'ai mis en place un système de notes systématique pour tout ce que je fais, ce qui me permet de rester organisé et de ne rien laisser passer.",
          },
          {
            title: 'Autonomie & confiance en soi',
            text: "En alternance, je gérais mes priorités de manière autonome au quotidien : le maintien opérationnel d'abord, les nouveaux développements ensuite. Je faisais des points réguliers avec ma manager pour rendre compte de mon avancement, mais l'organisation de mon travail m'appartenait. Cette responsabilité m'a appris que je suis plus capable que ce que je pensais, à condition de me faire confiance et d'utiliser mon bon sens.",
          },
        ],
      },
      {
        title: 'Manière de communiquer',
        cards: [
          {
            title: 'Compréhension du besoin & écoute',
            text: "Lors de la mise en place de nouvelles aspirations, je devais comprendre précisément le besoin des business units : quels produits cibler, quelles caractéristiques aspirer pour permettre la comparaison concurrentielle. Ma manager, en tant que Product Owner, servait d'intermédiaire, mais je pouvais aussi échanger directement avec les BU, notamment via des tickets. Je m'assurais de bien reformuler le besoin pour éviter les malentendus.",
          },
          {
            title: "Savoir demander de l'aide",
            text: "Quand j'ai des doutes, je n'hésite pas à solliciter les bonnes personnes. Chez Norauto : mon tech lead pour les questions techniques, ma manager (PO) pour les attentes métier, ou mon collègue senior pour les aspects liés à la solution. J'ai compris que poser des questions n'est pas un signe de faiblesse mais une compétence essentielle pour avancer efficacement.",
          },
        ],
      },
      {
        title: 'Manière de travailler avec les autres',
        cards: [
          {
            title: 'Travail en équipe & collaboration',
            text: "Bien que j'aie été autonome dans mon travail, la mise en place de nouvelles aspirations nécessitait une forte collaboration. Je m'appuyais sur les expertises de chacun : mon tech lead pour les spécificités produit, mon collègue senior pour la connaissance approfondie de la solution, et mes collègues en contact direct avec les BU France, Belgique, Espagne, Italie et Portugal pour les informations sur les chaînes de production. Avant de démarrer un nouveau développement, je prenais connaissance de l'existant auprès de l'équipe pour capitaliser sur ce qui avait déjà été fait.",
          },
        ],
      },
    ],
    languagesLabel: 'Langues',
    languages: ['Anglais — Niveau C1 (Cambridge)', 'Espagnol — Niveau A2'],
    languagesDetail:
      "Certification Cambridge niveau C1, forgée par des années d'échanges en anglais en ligne et une section Anglais Euro au Lycée.",
  },
  projects: {
    title: 'Projets',
    sort: { recent: 'Récent', oldest: 'Ancien', az: 'A→Z', za: 'Z→A' },
    recent: 'Projet récent',
    present: 'présent',
    months: ['Jan.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sep.', 'Oct.', 'Nov.', 'Déc.'],
    view: 'Voir le projet',
    demo: 'Voir la démo',
    code: 'Code source',
    with: 'Avec',
    and: ' et ',
  },
  experience: {
    title: 'Expérience',
    autonomyLabel: 'Autonomie :',
    entries: [
      {
        badge: 'Alternance',
        title: 'Alternant Équipe Pricing — Norauto International',
        date: 'Septembre 2025 — Août 2026',
        tags: ['C#', 'MSSQL', 'JavaScript', 'XML', 'Bash', 'Snowflake'],
        context:
          "Équipe de 7 personnes réalisant de la veille concurrentielle pour plusieurs business units internationales (France, Belgique, Espagne, Italie, Portugal). L'équipe fournit les données nécessaires à la prise de décision tarifaire sur les produits et prestations.",
        missions: [
          'Conception et maintenance de pipelines de web scraping pour le monitoring de prix concurrentiels (C#, XML, XPath)',
          'Nettoyage et traitement des données collectées via procédures stockées SQL Server (détection de deltas)',
          'Migration progressive des flux de données vers Snowflake et analyse temporelle / détection d\'anomalies',
          'Automatisation et fiabilisation de la collecte : scripts de gestion VPN/proxies et automatisation navigateur',
        ],
        autonomy:
          'gestion autonome de mes priorités au quotidien, avec un focus sur le maintien opérationnel (run) avant les nouveaux développements. Points réguliers avec ma manager, qui jouait le rôle de Product Owner. Échanges directs avec les business units, notamment sous forme de tickets.',
      },
      {
        badge: 'Stage',
        title: 'Stagiaire Équipe Pricing — Norauto International',
        date: 'Avril — Mai 2025',
        tags: ['C#', 'MSSQL', 'JavaScript', 'XML', 'Bash'],
        context: 'Équipe de 3 personnes au sein du pôle Pricing. Première immersion en environnement professionnel dans le domaine de la data.',
        missions: [
          'Maintenance du système de collecte de données web existant',
          'Développement et maintenance de proxys',
          "Découverte du fonctionnement d'une équipe data en entreprise",
        ],
      },
      {
        badge: 'Auto-entrepreneur',
        title: 'Prestataire Informatique — Norauto International',
        date: 'Octobre 2024 — Septembre 2025',
        tags: ['C#', 'MSSQL', 'JavaScript', 'XML', 'Bash'],
        missions: [
          'Maintenance du système de collecte de données et des proxys',
          "Vérification de l'intégrité des données et suivi du bon déroulement des processus",
        ],
      },
      {
        badge: 'Emploi saisonnier',
        title: "Agent d'Entretien Qualifié — CHU de Lille (Salengro)",
        date: 'Août 2024',
        text: "Service de stérilisation. Expérience formatrice sur la cohésion d'équipe et le travail avec de nouvelles personnes.",
      },
      {
        badge: 'Emploi saisonnier',
        title: 'Agent des Services Hospitaliers — CHU de Lille (Huriez)',
        date: 'Août 2023',
        text: "Première expérience professionnelle. Apprentissage de la communication en équipe et de l'intégration progressive.",
      },
    ],
  },
  reflexive: {
    title: 'Analyse réflexive',
    intro: "Ce que mon année d'alternance et mes expériences professionnelles m'ont appris sur moi-même, mes forces et mes axes de progression.",
    discovered: {
      title: "Ce que j'ai découvert sur moi",
      text: "Avant mon expérience en entreprise, l'autonomie me faisait peur. Je doutais de ma capacité à gérer seul des responsabilités concrètes. En réalité, j'ai découvert que lorsque je me fais confiance et que j'utilise mon bon sens, je suis parfaitement capable d'être autonome. Le déclic a été de comprendre qu'il suffit de ne pas avoir peur de poser des questions quand on a besoin d'aide — l'autonomie ne signifie pas tout faire seul.",
    },
    strengths: {
      title: 'Mes points forts identifiés',
      items: [
        { label: 'Sang-froid :', text: "de nature calme, je ne panique jamais face aux imprévus. Je prends le temps de réfléchir avant d'agir, ce qui me permet de prendre de meilleures décisions." },
        { label: 'Rigueur compensatoire :', text: "conscient de ma tendance à être tête en l'air, j'ai transformé cette faiblesse en force en notant systématiquement tout ce que je fais. Résultat : une organisation solide et fiable." },
        { label: 'Perfectionnisme maîtrisé :', text: 'je suis naturellement perfectionniste, ce qui rend mon travail rigoureux. Le monde du travail m\'a appris à faire des compromis quand les délais l\'exigent — savoir passer à la suite quand le "parfait" n\'est pas possible.' },
      ],
    },
    growth: {
      title: 'Mon axe de progression principal',
      text1a: 'Mon plus gros axe de progrès est la ',
      text1b: 'curiosité proactive',
      text1c: " et la communication au sens large. J'ai tendance à rester concentré sur ce qu'on me demande et à évoluer dans ma bulle, sans chercher à comprendre le contexte plus large autour de moi.",
      text2: "Or, mieux connaître mon environnement — les processus, les rôles de chacun, le fonctionnement des autres équipes — me permettrait d'être plus efficace dans mon travail et de savoir immédiatement à qui m'adresser en cas de besoin. C'est un point sur lequel je travaille activement.",
    },
    needs: {
      title: "Ce dont j'ai besoin pour évoluer",
      items: [
        "Continuer à développer ma curiosité en m'intéressant davantage aux métiers et aux processus autour de moi",
        "Prendre l'initiative d'échanger plus souvent avec mes collègues en dehors du cadre strictement nécessaire",
        'Intégrer une équipe de développement pour apprendre au contact de profils expérimentés et continuer à me former sur le terrain, notamment dans le domaine de la data',
        "M'exposer à des contextes variés pour continuer à renforcer ma confiance en moi",
      ],
    },
  },
  education: {
    title: 'Formation',
    entries: [
      {
        badge: 'Diplômé 2026',
        title: 'BUT Informatique — IUT de Lille',
        date: '2023 — 2026',
        text: "Parcours réalisation d'applications : conception, développement, validation et maintenance de logiciels. Troisième année effectuée en alternance chez Norauto International.",
      },
      { badge: 'Validé', title: 'BUT GEII — IUT de Lille', date: '2022 — 2023', text: "Année validée, puis réorientation vers l'informatique." },
      { badge: 'Mention Très Bien', title: 'BAC Général — Lycée Faidherbe', date: '2019 — 2022', text: 'Spécialités NSI + Maths. Section Anglais Euro.' },
    ],
  },
  contact: { title: 'Réseaux & Contact' },
  footer: { copyright: '© 2026 Tom NGUYEN' },
  cv: {
    title: 'Mon CV',
    version: (version: string, date: string) => `Version ${version} · mise à jour le ${date} · une page, format PDF`,
    download: 'Télécharger le PDF',
    open: 'Ouvrir dans un onglet',
    fallback: "L'aperçu ne s'affiche pas sur ce navigateur.",
    fallbackLink: 'Téléchargez le PDF',
    fallbackEnd: ' pour le consulter.',
    previewAlt: 'Aperçu du CV de Tom NGUYEN',
    otherLanguage: 'Version anglaise :',
    otherLanguageLink: 'télécharger le CV en anglais',
  },
  pricing: {
    intro:
      "Veille tarifaire sur des composants PC. Chaque matin, un batch Java relève le prix d'une quinzaine de produits chez six enseignes françaises et européennes, écarte les relevés douteux, puis un moteur de stratégies propose un prix et l'explique règle par règle. Cette page lit la base du projet en direct.",
    links: { code: 'Code source', adr: "Décisions d'architecture (ADR)", philosophy: 'Philosophie du projet' },
    disclaimer:
      "Projet personnel à but pédagogique : « notre prix » et le prix d'achat sont des valeurs fictives, mises à jour chaque jour par le moteur lui-même, et les stratégies sont celles des manuels de pricing. Les prix affichés sont ceux relevés publiquement sur les sites des enseignes, à la date indiquée.",
    loading: 'Chargement des données…',
    tabs: { matrix: 'Matrice produit × enseigne', summary: 'Synthèse et prix conseillé', how: 'Comment ça marche' },
    matrix: {
      rows: 'Lignes',
      strict: 'Un produit par ligne',
      segment: 'Un segment par ligne : les produits équivalents regroupés',
      hideMarketplace: 'Masquer les offres de vendeurs tiers (marketplaces)',
    },
    summary: {
      rules: 'Règles de gestion',
      market: 'Marché observé',
      strict: 'Strict : les annonces de ce produit',
      segment: 'Segment : les produits équivalents aussi',
      hint: 'Une ligne se déplie pour montrer comment le prix conseillé a été construit.',
    },
    dialog: { title: 'Historique', close: 'Fermer' },
    how: {
      diagramTitle: 'Flux de Pricing Intel : enseignes, collecte, base de données, moteur de prix, portfolio',
      retailers: { title: 'Enseignes', l1: 'LDLC · TopAchat', l2: 'Materiel.net · Cybertek', l3: '1fodiscount · Alternate', note: 'fiches produit publiques' },
      collect: { title: 'Collecte', l1: 'batch Java, chaque matin', l2: 'exécuté par GitHub Actions', n1: 'robots.txt, cadence, User-Agent', n2: 'JSON-LD → JSON embarqué → CSS', n3: 'un relevé par annonce et par jour' },
      store: { title: 'Base de données', l1: 'PostgreSQL sur Supabase (Paris)', n1: 'catalogue et annonces', n2: 'relevés, échecs, quarantaine', n3: 'recommandations expliquées', n4: 'vues de lecture (schéma api)' },
      front: { title: 'Cette page', l1: 'Astro, site statique', l2: 'GitHub Pages', note: 'aucun serveur applicatif' },
      engine: { title: 'Moteur de prix', l1: 'même batch, juste après la collecte', n1: 'règles du marché → stratégie → garde-fous', n2: 'un prix conseillé, expliqué étape par étape' },
      edges: { http: 'HTTP', snapshots: 'relevés', api: 'API REST', readOnly: 'lecture seule', recommendations: 'recommandations', market: 'marché du jour' },
      steps: [
        { title: 'Un catalogue explicite.', text: "Chaque produit suivi est décrit par sa famille et ses caractéristiques, avec ses identifiants (GTIN, référence fabricant) et l'annonce qui lui correspond chez chaque enseigne. Les produits d'un même segment, par exemple les RTX 5070 12 Go, sont déclarés équivalents." },
        { title: 'Une collecte polie et robuste.', text: "Un batch Java tourne chaque matin sur GitHub Actions. Il respecte robots.txt, espace ses requêtes et s'annonce avec un User-Agent identifiable. Le prix est lu d'abord dans les données structurées de la page (JSON-LD), puis dans le JSON embarqué, puis dans le HTML : trois extracteurs en cascade, pour résister aux refontes de sites." },
        { title: "Des données qu'on peut croire.", text: 'Un relevé par annonce et par jour, les échecs de collecte stockés, et un prix qui bouge brutalement est mis en quarantaine jusqu\'à confirmation le lendemain. Un jour sans relevé reste un trou visible, jamais comblé.' },
        { title: "Un prix conseillé qui s'explique.", text: "Le moteur n'a pas de serveur à lui : c'est un module du même batch, lancé juste après la collecte, sur le marché du jour. Il construit d'abord ce marché : offres fraîches, en stock, neuves, hors quarantaine. Une stratégie propose un prix (index sur la médiane, alignement, undercut, marge cible), puis des garde-fous le corrigent : marge plancher, plafond, variation maximale par jour, arrondi. Chaque étape est conservée en base et lisible dans la synthèse. Sept profils de règles sont calculés à chaque passage, c'est parmi eux que choisit le sélecteur de la synthèse. L'index qui accompagne les prix rapporte un prix à la médiane du marché : 100, c'est la médiane ; 95, c'est 5 % en dessous. Et chaque matin, une règle tirée au sort parmi les sept devient « notre prix » du jour, pour que la démo vive et que notre prix ait une histoire face au marché." },
        { title: 'Aucun serveur à maintenir.', text: "Le batch tourne sur GitHub Actions, la base et son API REST sont hébergées par Supabase dans la région de Paris, ce site est servi par GitHub Pages. Les résultats sont précalculés et exposés en lecture seule sur un schéma de vues dédié, avec une clé publique : cette page les lit directement dans le navigateur. Rien n'est hébergé à la main, et l'ensemble tient dans les offres gratuites. Le même code, empaqueté avec Spring, peut être déployé comme service permanent le jour où un usage professionnel le demande." },
      ],
      archA: 'Le code est un monolithe modulaire en architecture hexagonale : domaine pur, ports, adaptateurs interchangeables (HTTP, scraping, fichiers, PostgreSQL), et chaque décision structurante consignée dans un ',
      archLink: 'ADR',
      archB: '. Les choix, les renoncements et les erreurs y sont écrits au moment où ils sont pris.',
    },
  },
};

export type Dictionary = typeof fr;
