import fs from 'node:fs';
// Vite rewrites img sources but not image links: keep zoom targets aligned.
for (const file of fs.readdirSync('dist').filter((name) => name.endsWith('.html'))) {
  const path = 'dist/' + file;
  const html = fs.readFileSync(path, 'utf8').replace(/(<a\b[^>]*href=")(assets\/images\/[^"]+)("[^>]*>)([\s\S]*?)(<\/a>)/g,
    (all, start, old, end, content, close) => {
      const image = content.match(/<img\b[^>]*src="([^"]+)"/);
      return image ? start + image[1] + end + content + close : all;
    });
  fs.writeFileSync(path, html);
}
const base = process.env.SITE_BASE_PATH || '/b2b_company_demo/';
const page = fs.readFileSync('dist/error-404.html', 'utf8').replace('<head>', `<head><base href="${base}">`);
fs.writeFileSync('dist/404.html', page);
fs.writeFileSync('dist/.nojekyll', '');
