This repo forked from David Hamp-Gonsalves [Resume][https://github.com/davidhampgonsalves/resume]。

## Prerequisites

1. Install dependencies:
   `npm install`
2. Copy CSS in this folder to `node_modules/markdown-resume/assets/css`:
   `cp *.css node_modules/markdown-resume/assets/css`

## Output

```shell
node node_modules/markdown-resume/bin/md2resume resume.md       # Generate HTML
node node_modules/markdown-resume/bin/md2resume --pdf resume.md # Generate PDF
```
