---
publishedDate: "2017-07-25"
---

# 翡翠週刊產生器開發日誌

說不定哪天會有產生產生器的產生器

![翡翠週刊產生結果示例圖](/images/emerald-weekly-example.jpeg)

某次在朋友的轉貼下看到[這篇貼文](https://www.facebook.com/kyanos.sky/posts/10155549152803839)，77 年次的我還真不知道翡翠週刊是什麼囧，只是這種設計排版可說是完全跟正夯的[台灣街景](http://twstreet.spotlights.news/)走反方向，這種惡搞的感覺讓我懷念起多年前製作的[三熊圖產生器](http://tonypai.droppages.com/bearx3)… Alright, that's do it!

```bash
git init -q && npm init -y
```

### TLDR;

翡翠週刊產生器使用 Cash、Dropzone、Croppie 以及 Filesaver 開發，透過 Babel 編譯 Webpack 打包 JS，Mustache 依不同環境生成 HTML，架構在 AWS S3 的靜態網站服務 (Static Website Hosting)，並搭配 AWS Cloudfront 對資源做 CDN。

- [Cash](https://github.com/kenwheeler/cash)
- [Dropzone](http://www.dropzonejs.com/)
- [Croppie](https://foliotek.github.io/Croppie/)
- [FileSaver](https://github.com/eligrey/FileSaver.js/)
- [Mustache](https://mustache.github.io/)
- [AWS S3](https://aws.amazon.com/tw/s3)
- [AWS Cloudfront](https://aws.amazon.com/tw/cloudfront)
- [Babel](http://babeljs.io)

### 需求確認

在講求快速產出 MVP (Minimum Viable Product) 的開發，首先是列出 User Story。

> 我需要上傳圖片，這樣能夠產出更多類型的圖片。

> 我需要拖曳縮放圖片，這樣能夠更精準的擷取圖片。

> 我需要下載圖片，這樣能夠保存也能分享到社群。

再來是挑選合適的工具，使用了 jQuery 操作 DOM，檔案上傳部分選了 Dropzone，拖曳縮放 Croppie，檔案下載則是 FileSaver。

最後是架構開發環境，這邊使用了 Zeit Team 釋出的 [Serve](https://github.com/zeit/serve) 作為本地開發用伺服器，Babel 編譯 ES6 JS，Webpack 做 [Code Split](https://webpack.js.org/plugins/commons-chunk-plugin/#explicit-vendor-chunk) 和 [Extract CSS Text](https://webpack.js.org/plugins/extract-text-webpack-plugin/#usage)。

### 套件出錯

對於開發者來說最大的坑就是使用的套件本身有 bug，結果這次正好就遇到… Orz

Croppie 在二次上傳圖片後裁切會出現輸出結果不同的問題，這部分已經提 [issue](https://github.com/Foliotek/Croppie/issues/352) 給作者，而作者也回覆會進一步追這個 bug，目前則採用 destroy instance 後重新 initial 的方式暫時解決。

![圖左為第一次上傳裁切，圖右為第二次動作](/images/croppie-comparison.png)

### 圖片模糊

這在初期不是個很大的問題，所以留到後面才解決。

當初採用為求快速以及符合手機使用，刻意把底圖和擷取出來的圖寬度固定為 400px，在 canvas drawImage 出來的結果明顯差強人意（如圖左）。後來採用兩倍輸出 800px，直至下載時再做縮圖，最後清晰度有了明顯提升（如圖右）。

![](/images/image-blur.png)

### 效能優化

效能優化其實很容易做過頭，有個說法我個人還蠻喜歡的，就是當你自己都不能接受這效能的時候就是該優化了。而就在某天晚上，隨手打開了頁面，發現 JS 光讀取竟然花了近八秒（畫面不可考），而當時線上人數也沒有很多，嚇得我立即著手進行優化。

![未優化](/images/performance-before.png)

除了基本的 JS CSS Minify 和 [tinyPNG](https://tinypng.com/) 之外，更用了 Webpack Code Split 切出 vendor，重構時也把 jQuery 替換成相對輕量的 [cash-dom](https://www.npmjs.com/package/cash-dom)，最後透過 AWS Cloudfront 做 CDN，gzip 後整體大小減少了 100KB，讀取速度大概快了一倍。

![已優化](/images/performance-after.png)

### 結語

其實一開始本來想簡單做完這個 Side Project 而已，沒想到後續卻一直修修改改，是說也剛好利用這個機會重溫 Hackathon 模式的開發啦。

最後，也歡迎各路開發者提 PR 或 fork 回家自行修改成其他產生器。

[emerald-generator - 翡翠週刊合成圖產生器](https://github.com/tpai/emerald-generator)