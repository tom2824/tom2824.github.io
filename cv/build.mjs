// Compile le CV Typst vers public/CV_Tom_NGUYEN.pdf.
// Cherche `typst` dans le PATH, sinon dans le dossier d'installation winget.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = ['compile', 'cv/cv.typ', 'public/CV_Tom_NGUYEN.pdf'];

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

const typst = findTypst();
if (!typst) {
  console.error('typst introuvable. Installe-le avec : winget install Typst.Typst');
  process.exit(1);
}
const r = spawnSync(typst, args, { stdio: 'inherit', shell: typst === 'typst' });
process.exit(r.status ?? 1);
