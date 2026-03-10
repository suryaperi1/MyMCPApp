const path = require('path');
const fs = require('fs');
const express = require('express');
const MarkdownIt = require('markdown-it');
const morgan = require('morgan');

const app = express();
const md = new MarkdownIt();
const port = process.env.PORT || 3000;
const postsDir = path.join(__dirname, 'posts');

// Ensure posts folder exists
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function listPosts() {
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const fullPath = path.join(postsDir, filename);
      const stat = fs.statSync(fullPath);
      const title = filename.replace(/\.md$/, '').replace(/-/g, ' ');
      return {
        filename,
        slug: filename.replace(/\.md$/, ''),
        title: title.charAt(0).toUpperCase() + title.slice(1),
        mtime: stat.mtime.getTime(),
      };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function postTemplate(content, title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <main>
    <a href="/">← Back to posts</a>
    <article>${content}</article>
  </main>
</body>
</html>`;
}

app.get('/', (req, res) => {
  const posts = listPosts();
  const listItems = posts
    .map((p) => `<li><a href="/post/${encodeURIComponent(p.slug)}">${p.title}</a></li>`)
    .join('\n');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Markdown Blog</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <main>
    <h1>Markdown Blog</h1>
    <p><a href="/new">Create new post</a></p>
    <ul>${listItems || '<li>No posts yet.</li>'}</ul>
  </main>
</body>
</html>`);
});

app.get('/post/:slug', (req, res) => {
  const slug = req.params.slug;
  const filePath = path.join(postsDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Post not found');
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const html = md.render(raw);
  res.send(postTemplate(html, slug));
});

app.get('/new', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Write New Post</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <main>
    <h1>Write a New Markdown Post</h1>
    <form method="POST" action="/new">
      <label>
        Title<br/>
        <input type="text" name="title" required style="width:100%;" />
      </label>
      <br /><br />
      <label>
        Body (Markdown)<br/>
        <textarea name="body" rows="12" required style="width:100%;"></textarea>
      </label>
      <br /><br />
      <button type="submit">Create Post</button>
    </form>
    <p><a href="/">← Back to posts</a></p>
  </main>
</body>
</html>`);
});

app.post('/new', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).send('Title and body are required.');
  }

  const slug = slugify(title);
  if (!slug) {
    return res.status(400).send('Unable to generate a valid slug from title.');
  }

  const filePath = path.join(postsDir, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    return res.status(409).send('Post already exists. Choose a different title.');
  }

  const content = `# ${title}\n\n${body.trim()}\n`;
  fs.writeFileSync(filePath, content, 'utf-8');

  res.redirect(`/post/${encodeURIComponent(slug)}`);
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`Markdown blog running at http://localhost:${port}`);
});
