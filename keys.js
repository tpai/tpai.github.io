// Keyboard shortcuts for the DOS-style resume:
//   C  copy the resume as Markdown        (resume only)
//   D  download the resume as a .docx file (resume only)
//   B  list blog posts from posts/ in this repo
//   W  list my works (WORKS below, screenshots in images/works/)
//   R  back to the resume
//   T  toggle 繁體中文 (default) / English  (resume only)
// Esc steps back (post -> list -> resume, works -> resume);
// in the blog list 1-9 / arrows / Enter pick a post, in works arrows / Enter open one.
(() => {
  'use strict';

  const BLOG_REPO = 'tpai/tpai.github.io';
  const BLOG_BRANCH = 'master';
  const BLOG_EXCLUDE = ['Local-LLM-benchmark.md'];
  const DOCX_NAME = { 'zh-TW': 'Tony-Pai-Resume-zh-TW.docx', en: 'Tony-Pai-Resume.docx' };
  const LIBS = {
    marked: 'https://cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js',
    purify: 'https://cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.min.js',
    docx: 'https://cdn.jsdelivr.net/npm/docx@9.5.1/dist/index.iife.js',
  };

  // Shown by W, in this order; screenshots live at images/works/<slug>.jpg (640x400).
  const WORKS = [
    {
      slug: 'games',
      url: 'https://tonypa.in/games/',
      title: { 'zh-TW': '我玩過的遊戲', en: 'Games I played' },
      desc: {
        'zh-TW': '我玩過的遊戲紀錄，橫跨 Steam、Switch、PlayStation 與 Quest，可依完成狀態、平台、類型與工作室篩選。',
        en: 'My record of the games I have played on Steam, Switch, PlayStation and Quest, filterable by completion, platform, genre and studio.',
      },
    },
    {
      slug: 'itch',
      url: 'https://tonypai.itch.io/',
      title: { 'zh-TW': '我做的遊戲', en: 'Games I made' },
      desc: {
        'zh-TW': '我在 itch.io 上的遊戲，多是 Game Jam 作品，例如 Ludum Dare 31 的 Mobile Life、Global Game Jam 的 Choose，以及 Reverse Tetris，大多能直接在瀏覽器遊玩。',
        en: 'My games on itch.io, mostly game jam entries such as Mobile Life (Ludum Dare 31), Choose (Global Game Jam) and Reverse Tetris. Most of them play in the browser.',
      },
    },
    {
      slug: 'dogedeck',
      url: 'https://www.tonypa.in/dogedeck/',
      title: { 'zh-TW': 'Doge Deck', en: 'Doge Deck' },
      desc: {
        'zh-TW': '蒐集迷因圖的小工具，圖片皆為遊戲王卡片風格並充滿柴犬，讓喜愛迷因的人更方便搜尋與投稿。上線一週即爆紅，累計吸引 13 萬名不重複訪客。',
        en: 'Doge memes as Yu-Gi-Oh! cards, searchable by card type, with a way for fans to submit their own. It went viral within a week and drew 130,000 unique visitors.',
      },
    },
    {
      slug: 'idiomthon',
      url: 'https://idiomthon.tonypa.in',
      title: { 'zh-TW': 'Idiomthon', en: 'Idiomthon' },
      desc: {
        'zh-TW': '多人即時搶答的成語填空遊戲：每個成語缺一個字，最先答對的人得分並登上排行榜。',
        en: 'A real-time multiplayer idiom quiz: each Chinese idiom is missing a character, and the fastest correct answer scores and climbs the leaderboard.',
      },
    },
    {
      slug: 'turtle-soup',
      url: 'https://turtle-soup.tonypa.in',
      title: { 'zh-TW': '大家來喝海龜湯', en: 'Turtle Soup' },
      desc: {
        'zh-TW': '靈感源自 PTT Turtlesoup 版的網頁版海龜湯：湯主出題，玩家在聊天室以是非題推理出完整故事，電腦與手機都能玩。',
        en: 'Lateral-thinking "turtle soup" puzzles online, inspired by PTT\'s Turtlesoup board: the host sets a riddle and players ask yes-or-no questions in a chat room until they piece the story together.',
      },
    },
    {
      slug: 'throw-and-hit',
      url: 'https://throw-and-hit.tonypa.in',
      title: { 'zh-TW': 'Throw and Hit', en: 'Throw and Hit' },
      desc: {
        'zh-TW': '用 Node.js 做的雙人連線棒球對決：一人投球、一人打擊，出手時機決定是好球、安打還是全壘打。',
        en: 'A two-player online baseball duel built with Node.js: one pitches, one bats, and timing decides between a strike, a base hit and a home run.',
      },
    },
    {
      slug: 'travel',
      url: 'https://travel.tonypa.in/',
      title: { 'zh-TW': '制縣等級台灣版', en: 'Taiwan Travel Level' },
      desc: {
        'zh-TW': '日本知名工具 KKN 的台灣版：標記你在各縣市居住、短居或旅遊過，產生地圖與分數。以原生 JS 製作，兩週內爆紅，吸引 70 萬名不重複訪客。',
        en: 'A Taiwan take on the Japanese KKN tool: mark where you have lived, stayed or travelled to get a map and a score. Built with vanilla JS, it drew 700,000 unique visitors in two weeks.',
      },
    },
    {
      slug: 'keyboard-generator',
      url: 'https://keyboard-generator.tonypa.in/',
      title: { 'zh-TW': '鍵盤發電機', en: 'Keyboard Generator' },
      desc: {
        'zh-TW': '與 steveice、vansteki 在百度黑客松做的無用發明：連打方向鍵或點擊燈泡就能「發電」，提醒大家電力得來不易。',
        en: 'A useless invention from a Baidu hackathon with steveice and vansteki: mash the arrow keys or click the bulb to "generate power", a reminder that electricity is not free.',
      },
    },
    {
      slug: 'a-wei',
      url: 'https://a-wei.tonypa.in/',
      title: { 'zh-TW': '如果早知道，男生也會被登大人之平行宇宙', en: '如果早知道，男生也會被登大人之平行宇宙' },
      desc: {
        'zh-TW': '用 Twine 做的互動選擇故事：如果你是阿偉，你會怎麼選擇？每個選項都通往平行宇宙裡不同的結局。',
        en: 'A branching Twine story: you are A-Wei of Taiwanese meme fame, and every choice leads to a different ending in a parallel universe.',
      },
    },
    {
      slug: 'inukshuk',
      url: 'https://tonypa.in/inukshuk/',
      title: { 'zh-TW': 'Inukshuk', en: 'Inukshuk' },
      desc: {
        'zh-TW': '一顆一顆疊出獨一無二的石堆人，讓它佇立在你所在地的季節裡，隨時間風化並引來動物。',
        en: 'Stack unique stones into an inukshuk and let it stand through the seasons where you are, weathering and gathering animals over time.',
      },
    },
    {
      slug: 'mirror-dimension',
      url: 'https://tonypa.in/claude-build-day/',
      title: { 'zh-TW': '鏡像維度', en: 'Mirror Dimension' },
      desc: {
        'zh-TW': '奇異博士風格的城市模擬器：以 OpenStreetMap 真實建築與空拍影像，用 Three.js 把台北、東京、紐約、巴黎與香港折成不停旋轉的鏡像隧道，整個作品是一個離線 HTML 檔。',
        en: 'A Doctor Strange-style city simulator: real OpenStreetMap buildings and aerial imagery of Taipei, Tokyo, New York, Paris and Hong Kong, folded into an endlessly turning mirror tunnel with Three.js, all in one offline HTML file.',
      },
    },
  ];

  const $ = (id) => document.getElementById(id);
  const resumeView = $('resume');
  const blogView = $('blog');
  const worksView = $('works');
  const command = $('command');
  const mode = $('mode');
  const msg = $('msg');
  const STRINGS = {
    'zh-TW': {
      htmlLang: 'zh-Hant-TW',
      copy: '複製', copyLong: ' Markdown', downloadLong: '下載 ', blog: '文章', works: '作品', resume: '履歷', toggle: 'English',
      bar: '快速鍵',
      switched: '已切換為繁體中文',
      copied: '已將履歷複製為 Markdown',
      copyFailed: (m) => `無法複製：${m}`,
      building: (f) => `正在產生 ${f} ...`,
      downloaded: (f) => `已下載 ${f}`,
      docxFailed: (m) => `無法產生 .docx：${m}`,
      reading: '讀取 C:\\BLOG 中 ...',
      listHint: (n, keys) => `共 ${n} 篇文章。按 ${keys} 或 Enter 閱讀，Esc 返回履歷。`,
      postHint: '按 Esc 返回文章列表。',
      notFound: (slug) => `找不到檔案：BLOG\\${slug}.md`,
      notFoundHint: '按 B 列出所有文章。',
      blogFailed: (m) => `無法讀取文章：${m}。`,
      retry: '按 B 重試。',
      worksHint: (n) => `共 ${n} 項作品。按 ↑↓ 選擇、Enter 開啟，Esc 返回履歷。`,
    },
    en: {
      htmlLang: 'en',
      copy: 'Copy', copyLong: ' Markdown', downloadLong: 'Download ', blog: 'Blog', works: 'Works', resume: 'Resume', toggle: '中文',
      bar: 'Keyboard shortcuts',
      switched: 'Switched to English',
      copied: 'Copied resume as Markdown',
      copyFailed: (m) => `Couldn't copy: ${m}`,
      building: (f) => `Building ${f} ...`,
      downloaded: (f) => `Downloaded ${f}`,
      docxFailed: (m) => `Couldn't build the .docx: ${m}`,
      reading: 'Reading C:\\BLOG ...',
      listHint: (n, keys) => `${n} posts. Press ${keys} or Enter to read one, Esc to go back.`,
      postHint: 'Esc back to the list.',
      notFound: (slug) => `File not found: BLOG\\${slug}.md`,
      notFoundHint: 'Press B to list the posts.',
      blogFailed: (m) => `Couldn't read the blog: ${m}.`,
      retry: 'Press B to try again.',
      worksHint: (n) => `${n} works. Press ↑↓ to pick one, Enter to open it, Esc to go back.`,
    },
  };

  let lang = document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'zh-TW';
  const t = () => STRINGS[lang];

  let currentPost = null;
  let routeToken = 0;
  let msgTimer;
  // Re-renders the language-dependent text of the current blog view after T.
  let localizeView = () => {};

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

  // ---------- language ----------

  const activeResume = () => document.querySelector(`.resume[lang="${t().htmlLang}"]`);

  function resumeTitle() {
    const resume = activeResume();
    return `${resume.querySelector('h1').textContent.trim()} | ${resume.querySelector('h2').textContent.trim()}`;
  }

  function applyLang() {
    const root = document.documentElement;
    root.lang = t().htmlLang;
    if (lang === 'en') root.setAttribute('data-lang', 'en');
    else root.removeAttribute('data-lang');
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t()[node.dataset.i18n];
    });
    document.querySelector('.key-bar').setAttribute('aria-label', t().bar);
    document.title = currentPost ? `${currentPost.title} | Tony Pai` : resumeTitle();
    localizeView();
  }

  function toggleLang() {
    lang = lang === 'en' ? 'zh-TW' : 'en';
    try {
      localStorage.setItem('lang', lang);
    } catch (err) {
      // Private mode or blocked storage: the toggle still works for this visit.
    }
    applyLang();
    say(t().switched);
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
    for (const node of activeResume().children) {
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
      title: resumeTitle(),
      styles: {
        default: {
          document: {
            run: { font: { ascii: 'Calibri', hAnsi: 'Calibri', cs: 'Calibri', eastAsia: 'Microsoft JhengHei' }, size: 21 },
          },
        },
      },
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
      const res = await fetch(`https://data.jsdelivr.com/v1/packages/gh/${BLOG_REPO}@${BLOG_BRANCH}?structure=flat`);
      if (!res.ok) throw new Error(`GitHub and jsDelivr both failed (${res.status})`);
      return (await res.json()).files
        .filter((f) => /^\/posts\/[^/]+$/.test(f.name))
        .map((f) => ({
          name: f.name.slice('/posts/'.length),
          url: `https://cdn.jsdelivr.net/gh/${BLOG_REPO}@${BLOG_BRANCH}${f.name}`,
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
    const hint = el('p', 'dim');
    localizeView = () => { hint.textContent = t().listHint(posts.length, keys); };
    localizeView();
    blogView.replaceChildren(list, hint);
  }

  function renderPost(post) {
    const article = el('article', 'post');
    article.innerHTML = window.DOMPurify.sanitize(window.marked.parse(post.body));
    article.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('/')) img.src = `https://raw.githubusercontent.com/${BLOG_REPO}/${BLOG_BRANCH}${src}`;
      img.loading = 'lazy';
    });
    article.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
    const hint = el('p', 'dim');
    localizeView = () => { hint.textContent = t().postHint; };
    localizeView();
    blogView.replaceChildren(article, hint);
    currentPost = post;
    document.title = `${post.title} | Tony Pai`;
  }

  // ---------- works: a TREE of links, each with a screenshot ----------

  function renderWorks() {
    const tree = el('ul', 'tree');
    WORKS.forEach((work) => {
      const title = el('a', 'title');
      title.href = work.url;
      title.target = '_blank';
      title.rel = 'noopener';
      const host = work.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      title.append(el('span', 't', work.title[lang]), el('span', 'host', host));

      // The title link is the one to tab to; the screenshot is a bigger click target.
      const shotLink = el('a', 'shot');
      shotLink.href = work.url;
      shotLink.target = '_blank';
      shotLink.rel = 'noopener';
      shotLink.tabIndex = -1;
      shotLink.setAttribute('aria-hidden', 'true');
      const img = el('img');
      img.src = `images/works/${work.slug}.jpg`;
      img.alt = '';
      img.width = 640;
      img.height = 400;
      img.loading = 'lazy';
      shotLink.append(img);

      const body = el('div', 'body');
      body.append(shotLink, el('p', null, work.desc[lang]));
      const li = el('li', 'work');
      li.append(title, body);
      tree.append(li);
    });
    worksView.replaceChildren(tree, el('p', 'dim', t().worksHint(WORKS.length)));
  }

  // ---------- routing: #blog, #blog/<slug>, #works, anything else is the resume ----------

  async function route(moveFocus) {
    const token = ++routeToken;
    const hash = decodeURIComponent(location.hash.slice(1));
    currentPost = null;
    localizeView = () => {};
    document.title = resumeTitle();

    const view = hash === 'blog' || hash.startsWith('blog/') ? 'blog' : hash === 'works' ? 'works' : 'resume';
    document.documentElement.dataset.view = view;
    document.querySelectorAll('[data-key="t"], [data-key="c"], [data-key="d"]').forEach((button) => {
      button.hidden = view !== 'resume';
    });
    resumeView.hidden = view !== 'resume';
    blogView.hidden = view !== 'blog';
    worksView.hidden = view !== 'works';

    if (view === 'resume') {
      mode.textContent = '【履歷】';
      command.textContent = 'C:\\> TYPE RESUME.TXT';
      if (moveFocus) settle(resumeView);
      return;
    }

    if (view === 'works') {
      mode.textContent = '【作品】';
      command.textContent = 'C:\\> TREE WORKS';
      renderWorks();
      if (moveFocus) {
        settle(worksView);
        worksView.querySelector('.title').focus({ preventScroll: true });
      }
      return;
    }

    const slug = hash.slice('blog/'.length);
    mode.textContent = '【文章】';
    command.textContent = slug ? `C:\\> TYPE BLOG\\${slug}.md` : 'C:\\> DIR BLOG';
    const loading = el('p');
    localizeView = () => { loading.textContent = t().reading; };
    localizeView();
    blogView.replaceChildren(loading);
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
        showError(() => t().notFound(slug), () => t().notFoundHint);
      }
    } catch (err) {
      if (token !== routeToken) return;
      showError(() => t().blogFailed(err.message), () => t().retry);
    }
  }

  function showError(message, hint) {
    const line = el('p');
    const help = el('p', 'dim');
    localizeView = () => {
      line.textContent = message();
      help.textContent = hint();
    };
    localizeView();
    blogView.replaceChildren(line, help);
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
  const inResume = () => !resumeView.hidden;

  async function run(key) {
    switch (key) {
      case 'c':
        if (!inResume()) break;
        try {
          await copyText(resumeMarkdown());
          say(t().copied);
        } catch (err) {
          say(t().copyFailed(err.message));
        }
        break;
      case 'd': {
        if (!inResume()) break;
        const name = DOCX_NAME[lang];
        say(t().building(name), true);
        try {
          const blob = await resumeDocx();
          const url = URL.createObjectURL(blob);
          const a = el('a');
          a.href = url;
          a.download = name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          say(t().downloaded(name));
        } catch (err) {
          say(t().docxFailed(err.message));
        }
        break;
      }
      case 't':
        if (!inResume()) break;
        toggleLang();
        break;
      case 'b':
        go('blog');
        break;
      case 'w':
        go('works');
        break;
      case 'r':
        go('');
        break;
    }
  }

  document.querySelector('.key-bar').addEventListener('click', (e) => {
    const button = e.target.closest('button[data-key]');
    if (button) run(button.dataset.key);
  });

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    if (['c', 'd', 'b', 'w', 'r', 't'].includes(key)) {
      e.preventDefault();
      run(key);
      return;
    }

    if (key === 'Escape' && !inResume()) {
      e.preventDefault();
      go(currentPost || location.hash.startsWith('#blog/') ? 'blog' : '');
      return;
    }

    const links = inBlog() ? [...blogView.querySelectorAll('.dir a')]
      : worksView.hidden ? [] : [...worksView.querySelectorAll('.work .title')];
    if (!links.length) return;

    if (/^[1-9]$/.test(key) && inBlog() && links[key - 1]) {
      e.preventDefault();
      links[key - 1].click();
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      e.preventDefault();
      const at = links.indexOf(document.activeElement);
      const next = key === 'ArrowDown' ? Math.min(at + 1, links.length - 1) : Math.max(at - 1, 0);
      links[next].focus();
    }
  });

  applyLang();
  route(false);
})();
