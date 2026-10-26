// Splices the rendered zh-TW resume into index.html so the page can switch
// languages (T key) without a reload. Runs after both md2resume builds.
const fs = require('fs');

const ZH_HTML = 'resume.zh-TW.html';
const PLACEHOLDER = '<!-- resume:zh-TW -->';

const zh = fs.readFileSync(ZH_HTML, 'utf8');
const body = zh.match(/<!-- resume:start -->([\s\S]*?)<!-- resume:end -->/);
if (!body) throw new Error(`resume markers not found in ${ZH_HTML}`);

const index = fs.readFileSync('index.html', 'utf8');
if (!index.includes(PLACEHOLDER)) throw new Error(`${PLACEHOLDER} not found in index.html`);

fs.writeFileSync('index.html', index.replace(PLACEHOLDER, () => body[1].trim()));
fs.unlinkSync(ZH_HTML);
console.log(`Embedded ${ZH_HTML} into index.html`);
