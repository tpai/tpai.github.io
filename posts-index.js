// Lists posts/*.md into posts/index.json for the blog (B key in keys.js),
// since GitHub Pages can't list a directory. Run by `yarn start`; rerun after adding a post.
const fs = require('fs');

const files = fs.readdirSync('posts').filter((f) => /\.md$/i.test(f)).sort();
fs.writeFileSync('posts/index.json', JSON.stringify(files, null, 2) + '\n');
console.log(`Listed ${files.length} posts in posts/index.json`);
