// Explicit files only: deployment never includes tests or repository metadata.
import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const files = ['index.html', 'styles.css', 'src/app.js', 'src/models.js', 'assets/favicon.svg'];
for (const file of files) {
  const source = new URL('../' + file, import.meta.url);
  const target = new URL('../dist/' + file, import.meta.url);
  await mkdir(fileURLToPath(new URL('.', target)), { recursive: true });
  await copyFile(source, target);
}
console.log('Built ' + files.length + ' static files in dist/. No dependencies required.');
