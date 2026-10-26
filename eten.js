// Keyboard shortcuts for the ETen-style resume:
//   C  copy the resume as Markdown        (resume only)
//   D  download the resume as a .docx file (resume only)
//   B  list blog posts from github.com/tpai/blog
//   ?  back to the resume
// Esc steps back (post -> list -> resume); in the list, 1-9 / arrows / Enter pick a post.
(() => {
  'use strict';

  const BLOG_REPO = 'tpai/blog';
  const BLOG_EXCLUDE = ['Local-LLM-benchmark.md'];
  const DOCX_NAME = 'Tony-Pai-Resume.docx';
  const LIBS = {
    marked: 'https://cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js',
    purify: 'https://cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.min.js',
    docx: 'https://cdn.jsdelivr.net/npm/docx@9.5.1/dist/index.iife.js',
  };

  const $ = (id) => document.getElementById(id);
  const resumeView = $('resume');
  const blogView = $('blog');
  const command = $('command');
  const mode = $('mode');
  const msg = $('msg');
  const resumeTitle = document.title;

  let currentPost = null;
  let routeToken = 0;
  let msgTimer;

  // ---------- small helpers ----------

  function say(text, persist) {
    clearTimeout(msgTimer);
    msg.textContent = text;
    if (!persist) msgTimer = setTimeout(() => { msg.textContent = ''; }, 4000);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  const loaded = {};
  function loadScript(src) {
    if (!loaded[src]) {
      loaded[src] = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => {
          delete loaded[src];
          reject(new Error('could not load ' + src.split('/npm/')[1]));
        };
        document.head.appendChild(s);
      });
    }
    return loaded[src];
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (!ok) throw new Error('the browser blocked clipboard access');
    }
  }

  // ---------- resume DOM -> block model ----------
  // The rendered resume is the single source for both Markdown and .docx.

  function collect(node, fmt, lines) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        lines[lines.length - 1].push({ ...fmt, text: child.nodeValue });
      } else if (child.nodeName === 'BR') {
        lines.push([]);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const f = { ...fmt };
        if (child.nodeName === 'B' || child.nodeName === 'STRONG') f.b = true;
        if (child.nodeName === 'EM' || child.nodeName === 'I') f.i = true;
        if (child.nodeName === 'A') f.href = child.href;
        collect(child, f, lines);
      }
    });
  }

  function linesOf(node) {
    const lines = [[]];
    collect(node, {}, lines);
    return lines
      .map((runs) => {
        runs = runs.map((r) => ({ ...r, text: r.text.replace(/\s+/g, ' ') }));
        if (runs.length) {
          runs[0].text = runs[0].text.trimStart();
          runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd();
        }
        return runs.filter((r) => r.text);
      })
      .filter((runs) => runs.length);
  }

  const textOf = (runs) => runs.map((r) => r.text).join('');

  function classify(runs, index) {
    if (index === 0 && runs.some((r) => r.b)) return { kind: 'title', runs };
    if (textOf(runs).startsWith('・')) {
      const rest = runs.map((r) => ({ ...r }));
      rest[0].text = rest[0].text.replace(/^・\s*/, '');
      return { kind: 'bullet', runs: rest.filter((r) => r.text) };
    }
    if (runs.every((r) => r.b)) return { kind: 'label', runs };
    return { kind: 'text', runs };
  }

  function resumeBlocks() {
    const blocks = [];
    for (const node of document.querySelector('.resume').children) {
      switch (node.nodeName) {
        case 'H1': blocks.push({ type: 'name', text: node.textContent.trim() }); break;
        case 'H2': blocks.push({ type: 'role', text: node.textContent.trim() }); break;
        case 'H3': blocks.push({ type: 'heading', text: node.textContent.trim() }); break;
        case 'BLOCKQUOTE': blocks.push({ type: 'contact', lines: linesOf(node) }); break;
        case 'P': blocks.push({ type: 'entry', lines: linesOf(node).map(classify) }); break;
        case 'UL':
          node.querySelectorAll(':scope > li').forEach((li) => {
            blocks.push({ type: 'item', lines: linesOf(li) });
          });
          break;
      }
    }
    return blocks;
  }

  // ---------- Markdown ----------

  function mdRuns(runs) {
    return runs.map((r) => {
      const [, lead, core, trail] = r.text.match(/^(\s*)(.*?)(\s*)$/);
      if (!core) return r.text;
      let out = r.href ? `[${core}](${r.href})` : core;
      if (r.i) out = `*${out}*`;
      else if (r.b) out = `**${out}**`;
      return lead + out + trail;
    }).join('');
  }

  function resumeMarkdown() {
    const out = [];
    let lastType = null;
    for (const block of resumeBlocks()) {
      switch (block.type) {
        case 'name': out.push('# ' + block.text); break;
        case 'role': out.push('## ' + block.text); break;
        case 'heading': out.push('### ' + block.text); break;
        case 'contact': out.push(block.lines.map(mdRuns).join(' | ')); break;
        case 'entry': {
          let para = [];
          let list = [];
          const flushPara = () => { if (para.length) out.push(para.join('  \n')); para = []; };
          const flushList = () => { if (list.length) out.push(list.join('\n')); list = []; };
          for (const line of block.lines) {
            if (line.kind === 'bullet') {
              flushPara();
              list.push('- ' + mdRuns(line.runs));
            } else {
              flushList();
              para.push(mdRuns(line.runs));
            }
          }
          flushPara();
          flushList();
          break;
        }
        case 'item': {
          const item = '- ' + block.lines.map(mdRuns).join('  \n  ');
          if (lastType === 'item') out[out.length - 1] += '\n' + item;
          else out.push(item);
          break;
        }
      }
      lastType = block.type;
    }
    return out.join('\n\n') + '\n';
  }

  // ---------- .docx ----------

  async function resumeDocx() {
    await loadScript(LIBS.docx);
    const D = window.docx;

    const runs = (list, bold) => list.map((r) => {
      if (r.href) {
        return new D.ExternalHyperlink({
          link: r.href,
          children: [new D.TextRun({ text: r.text, style: 'Hyperlink', bold: bold || r.b })],
        });
      }
      return new D.TextRun({ text: r.text, bold: bold || r.b, italics: r.i });
    });

    const children = [];
    for (const block of resumeBlocks()) {
      switch (block.type) {
        case 'name':
          children.push(new D.Paragraph({ heading: D.HeadingLevel.TITLE, children: [new D.TextRun(block.text)] }));
          break;
        case 'role':
          children.push(new D.Paragraph({
            spacing: { after: 120 },
            children: [new D.TextRun({ text: block.text, size: 28, color: '444444' })],
          }));
          break;
        case 'contact': {
          const parts = [];
          block.lines.forEach((line, i) => {
            if (i) parts.push(new D.TextRun({ text: '  |  ', color: '888888' }));
            parts.push(...runs(line));
          });
          children.push(new D.Paragraph({ spacing: { after: 240 }, children: parts }));
          break;
        }
        case 'heading':
          children.push(new D.Paragraph({
            heading: D.HeadingLevel.HEADING_1,
            spacing: { before: 360, after: 120 },
            children: [new D.TextRun(block.text)],
          }));
          break;
        case 'entry':
          block.lines.forEach((line, i) => {
            const last = i === block.lines.length - 1;
            const spacing = { after: last ? 200 : 40 };
            if (line.kind === 'title') {
              const name = line.runs.filter((r) => !r.i);
              const date = textOf(line.runs.filter((r) => r.i)).trim();
              children.push(new D.Paragraph({
                spacing: { before: 120, after: 40 },
                keepNext: true,
                tabStops: [{ type: D.TabStopType.RIGHT, position: D.TabStopPosition.MAX }],
                children: [
                  ...runs(name.map((r) => ({ ...r, text: r.text.trimEnd() })), true),
                  ...(date ? [new D.TextRun({ children: [new D.Tab(), date], color: '555555' })] : []),
                ],
              }));
            } else if (line.kind === 'bullet') {
              children.push(new D.Paragraph({ bullet: { level: 0 }, spacing, children: runs(line.runs) }));
            } else if (line.kind === 'label') {
              children.push(new D.Paragraph({ spacing: { before: 80, after: 40 }, keepNext: true, children: runs(line.runs, true) }));
            } else {
              children.push(new D.Paragraph({ spacing, children: runs(line.runs) }));
            }
          });
          break;
        case 'item':
          block.lines.forEach((line, i) => {
            children.push(new D.Paragraph({
              spacing: { after: i === block.lines.length - 1 ? 160 : 20 },
              keepNext: i < block.lines.length - 1,
              children: runs(line, i === 0),
            }));
          });
          break;
      }
    }

    const doc = new D.Document({
      creator: 'Tony Pai',
      title: resumeTitle,
      styles: { default: { document: { run: { font: 'Calibri', size: 21 } } } },
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
        children,
      }],
    });
    return D.Packer.toBlob(doc);
  }

  // ---------- blog ----------

  let postsPromise = null;
  function fetchPosts() {
    if (!postsPromise) {
      postsPromise = loadPosts().catch((err) => {
        postsPromise = null;
        throw err;
      });
    }
    return postsPromise;
  }

  async function listPostFiles() {
    try {
      const res = await fetch(`https://api.github.com/repos/${BLOG_REPO}/contents/posts`);
      if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
      return (await res.json())
        .filter((f) => f.type === 'file')
        .map((f) => ({ name: f.name, url: f.download_url }));
    } catch (err) {
      // GitHub's API allows 60 requests an hour per IP; jsDelivr mirrors the repo.
      const res = await fetch(`https://data.jsdelivr.com/v1/packages/gh/${BLOG_REPO}@main?structure=flat`);
      if (!res.ok) throw new Error(`GitHub and jsDelivr both failed (${res.status})`);
      return (await res.json()).files
        .filter((f) => /^\/posts\/[^/]+$/.test(f.name))
        .map((f) => ({
          name: f.name.slice('/posts/'.length),
          url: `https://cdn.jsdelivr.net/gh/${BLOG_REPO}@main${f.name}`,
        }));
    }
  }

  async function loadPosts() {
    const files = (await listPostFiles())
      .filter((f) => /\.md$/i.test(f.name) && !BLOG_EXCLUDE.includes(f.name));
    const posts = await Promise.all(files.map(async (f) => {
      const res = await fetch(f.url);
      if (!res.ok) throw new Error(`${f.name} returned ${res.status}`);
      return parsePost(f.name, await res.text());
    }));
    return posts.sort((a, b) => b.date.localeCompare(a.date));
  }

  function parsePost(name, text) {
    let body = text.replace(/\r\n/g, '\n');
    let date = '';
    const front = body.match(/^---\n([\s\S]*?)\n---\n?/);
    if (front) {
      body = body.slice(front[0].length);
      const d = front[1].match(/^publishedDate:\s*["']?([^"'\n]+)/m);
      if (d) date = d[1].trim();
    }
    const slug = name.replace(/\.md$/i, '');
    const heading = body.match(/^#\s+(.+)$/m);
    return {
      slug,
      date,
      title: heading ? heading[1].trim() : slug.replace(/-/g, ' '),
      body: body.trim() + '\n',
    };
  }

  function renderList(posts) {
    const list = el('ol', 'dir');
    posts.forEach((post, i) => {
      const a = el('a');
      a.href = '#blog/' + encodeURIComponent(post.slug);
      a.append(el('span', 'n', i < 9 ? `${i + 1}.` : ''), el('span', 't', post.title), el('span', 'd', post.date));
      const li = el('li');
      li.append(a);
      list.append(li);
    });
    const keys = posts.length > 1 ? `1-${Math.min(9, posts.length)}` : '1';
    blogView.replaceChildren(
      list,
      el('p', 'dim', `${posts.length} posts. Press ${keys} or Enter to read one, Esc to go back.`),
    );
  }

  function renderPost(post) {
    const article = el('article', 'post');
    article.innerHTML = window.DOMPurify.sanitize(window.marked.parse(post.body));
    article.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('/')) img.src = `https://raw.githubusercontent.com/${BLOG_REPO}/main${src}`;
      img.loading = 'lazy';
    });
    article.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
    blogView.replaceChildren(article, el('p', 'dim', 'Esc back to the list.'));
    currentPost = post;
    document.title = `${post.title} | Tony Pai`;
  }

  // ---------- routing: #blog, #blog/<slug>, anything else is the resume ----------

  async function route(moveFocus) {
    const token = ++routeToken;
    const hash = decodeURIComponent(location.hash.slice(1));
    currentPost = null;
    document.title = resumeTitle;

    const blog = hash === 'blog' || hash.startsWith('blog/');
    document.querySelectorAll('[data-key="c"], [data-key="d"]').forEach((button) => {
      button.hidden = blog;
    });

    if (!blog) {
      resumeView.hidden = false;
      blogView.hidden = true;
      mode.textContent = '【履歷】';
      command.textContent = 'C:\\> TYPE RESUME.TXT';
      if (moveFocus) settle(resumeView);
      return;
    }

    const slug = hash.slice('blog/'.length);
    resumeView.hidden = true;
    blogView.hidden = false;
    mode.textContent = '【文章】';
    command.textContent = slug ? `C:\\> TYPE BLOG\\${slug}.md` : 'C:\\> DIR BLOG';
    blogView.replaceChildren(el('p', null, 'Reading C:\\BLOG ...'));
    if (moveFocus) settle(blogView);

    try {
      const [posts] = await Promise.all([
        fetchPosts(),
        slug ? Promise.all([loadScript(LIBS.marked), loadScript(LIBS.purify)]) : null,
      ]);
      if (token !== routeToken) return;
      if (!slug) {
        renderList(posts);
        if (moveFocus) blogView.querySelector('.dir a')?.focus({ preventScroll: true });
        return;
      }
      const post = posts.find((p) => p.slug === slug);
      if (post) {
        renderPost(post);
      } else {
        blogView.replaceChildren(el('p', null, `File not found: BLOG\\${slug}.md`), el('p', 'dim', 'Press B to list the posts.'));
      }
    } catch (err) {
      if (token !== routeToken) return;
      blogView.replaceChildren(el('p', null, `Couldn't read the blog: ${err.message}.`), el('p', 'dim', 'Press B to try again.'));
    }
  }

  function settle(view) {
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }

  function go(hash) {
    const target = hash ? '#' + hash : '';
    if (location.hash === target) {
      route(true);
    } else if (hash) {
      location.hash = hash;
    } else {
      history.pushState(null, '', location.pathname + location.search);
      route(true);
    }
  }

  window.addEventListener('hashchange', () => route(true));
  window.addEventListener('popstate', () => route(true));

  // ---------- actions ----------

  const inBlog = () => !blogView.hidden;

  async function run(key) {
    switch (key) {
      case 'c':
        if (inBlog()) break;
        try {
          await copyText(resumeMarkdown());
          say('Copied resume as Markdown');
        } catch (err) {
          say(`Couldn't copy: ${err.message}`);
        }
        break;
      case 'd':
        if (inBlog()) break;
        say(`Building ${DOCX_NAME} ...`, true);
        try {
          const blob = await resumeDocx();
          const url = URL.createObjectURL(blob);
          const a = el('a');
          a.href = url;
          a.download = DOCX_NAME;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          say(`Downloaded ${DOCX_NAME}`);
        } catch (err) {
          say(`Couldn't build the .docx: ${err.message}`);
        }
        break;
      case 'b':
        go('blog');
        break;
      case '?':
        go('');
        break;
    }
  }

  document.querySelector('.eten-bar').addEventListener('click', (e) => {
    const button = e.target.closest('button[data-key]');
    if (button) run(button.dataset.key);
  });

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    if (key === 'c' || key === 'd' || key === 'b' || key === '?') {
      e.preventDefault();
      run(key);
      return;
    }

    if (key === 'Escape' && inBlog()) {
      e.preventDefault();
      go(currentPost || location.hash.startsWith('#blog/') ? 'blog' : '');
      return;
    }

    const links = inBlog() ? [...blogView.querySelectorAll('.dir a')] : [];
    if (!links.length) return;

    if (/^[1-9]$/.test(key) && links[key - 1]) {
      e.preventDefault();
      links[key - 1].click();
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      e.preventDefault();
      const at = links.indexOf(document.activeElement);
      const next = key === 'ArrowDown' ? Math.min(at + 1, links.length - 1) : Math.max(at - 1, 0);
      links[next].focus();
    }
  });

  route(false);
})();
