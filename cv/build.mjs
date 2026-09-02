// Compile le CV Typst avec numéro de version :
//   public/CV_Tom_NGUYEN_v1.2.pdf  (lié depuis le site, nom versionné au téléchargement)
//   public/CV_Tom_NGUYEN.pdf       (copie stable, toujours la dernière version)
//   cv/releases/                   (archive de toutes les versions)
//   src/data/cv.json               (version courante, lue par Hero.astro)
//
//   npm run cv                      -> compile la version en tête de CHANGELOG.md
//   npm run cv:bump "ce qui change" -> ajoute une entrée (version +0.1, date du jour), puis compile
//
// La version et la date sont passées à Typst (--input) : pied de page + métadonnées PDF.
// Chaque version compilée est aussi archivée dans cv/releases/.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CHANGELOG = 'cv/CHANGELOG.md';
const SOURCE = 'cv/cv.typ';
const OUTPUT = 'public/CV_Tom_NGUYEN.pdf';
const RELEASES = 'cv/releases';
const HEADING = /^## v(\d+)\.(\d+) — (\d{4}-\d{2}-\d{2})$/m;

function findTypst() {
  const probe = spawnSync('typst', ['--version'], { shell: true, stdio: 'ignore' });
  if (probe.status === 0) return 'typst';
  const pkgs = join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages');
  if (existsSync(pkgs)) {
    for (const dir of readdirSync(pkgs).filter(d => d.startsWith('Typst.Typst'))) {
      for (const sub of readdirSync(join(pkgs, dir))) {
        const exe = join(pkgs, dir, sub, 'typst.exe');
        if (existsSync(exe)) return exe;
      }
    }
  }
  return null;
}

function currentVersion() {
  const m = readFileSync(CHANGELOG, 'utf8').match(HEADING);
  if (!m) throw new Error(`Aucune entrée "## vX.Y — AAAA-MM-JJ" dans ${CHANGELOG}`);
  return { major: +m[1], minor: +m[2], date: m[3] };
}

function bump(message) {
  const { major, minor } = currentVersion();
  const version = `${major}.${minor + 1}`;
  const date = new Date().toISOString().slice(0, 10);
  const bullets = message.split(/\s*;\s*/).map(l => `- ${l.trim()}`).join('\n');
  const entry = `## v${version} — ${date}\n${bullets}\n\n`;
  const text = readFileSync(CHANGELOG, 'utf8');
  const at = text.search(/^## v/m);
  writeFileSync(CHANGELOG, text.slice(0, at) + entry + text.slice(at));
  console.log(`CHANGELOG : nouvelle entrée v${version} (${date})`);
}

const args = process.argv.slice(2);
if (args[0] === '--bump') {
  const message = args.slice(1).join(' ').trim();
  if (!message) { console.error('Usage : npm run cv:bump "ce qui a changé ; autre changement"'); process.exit(1); }
  bump(message);
}

const typst = findTypst();
if (!typst) { console.error('typst introuvable. Installe-le avec : winget install Typst.Typst'); process.exit(1); }

const { major, minor, date } = currentVersion();
const version = `${major}.${minor}`;
const [y, mo, d] = date.split('-');
const r = spawnSync(typst, [
  'compile', '--input', `version=${version}`, '--input', `date=${d}/${mo}/${y}`, SOURCE, OUTPUT,
], { stdio: 'inherit', shell: typst === 'typst' });
if (r.status !== 0) process.exit(r.status ?? 1);

// Copie versionnée servie par le site (nom de fichier = version au téléchargement),
// les anciennes versions sont retirées de public/ mais gardées dans cv/releases/.
const versionedName = `CV_Tom_NGUYEN_v${version}.pdf`;
for (const f of readdirSync('public')) {
  if (/^CV_Tom_NGUYEN_v.*\.pdf$/.test(f) && f !== versionedName) unlinkSync(join('public', f));
}
copyFileSync(OUTPUT, join('public', versionedName));
copyFileSync(OUTPUT, join(RELEASES, versionedName));
writeFileSync('src/data/cv.json', JSON.stringify({ version, date, file: `/${versionedName}` }, null, 2) + '\n');
console.log(`CV v${version} (${date}) -> public/${versionedName} (+ copie stable ${OUTPUT}, archive ${RELEASES}/)`);
