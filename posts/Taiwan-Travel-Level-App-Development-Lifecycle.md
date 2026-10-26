---
publishedDate: "2018-06-24"
---

# 爆紅應用的生命週期

剛剛好一週，你做了個好夢嗎？

![](/images/taiwan-app-lifecycle-intro.png)
距離上次寫[翡翠週刊產生器](https://emerald.tonypai.com.tw/)也差不多一年了，這次很剛好的搭上[制縣等級](https://zhung.com.tw/japanex/)的話題熱潮，就順勢寫了[制縣等級台灣版](https://travel.tonypai.com.tw/)。

---

同樣的，在這過程當中有些事情想記錄下來，包括事前規劃、開發過程以及分享一些數據。

### 事前規劃

這次制縣等級台灣版的提案是由設計師所提出，單純只是想參考日本版刻一個出來玩，但是圖片以及顏色的設計部分則是由設計師自行動手製作。

首先分析了一下日本版的做法，島嶼圖是用 SVG 製作，而且每個都道府縣的polygon 跟 rect 標籤都給了 id，藉由 click event 顯示選單，再根據選項賦予顏色和加總分數。

大概知道做法之後，首先需要一張台灣島嶼圖，一開始是從[維基百科的免費圖庫](https://commons.wikimedia.org/wiki/Category:SVG_maps_of_Taiwan)中找，但是一用發現圖檔邊角太多過於細緻，檔案大小也須列入考量，最後由設計師接手重繪，比較圖如下所示。

![左圖來源為維基百科免費圖庫，右圖為設計師自行手繪。](/images/taiwan-app-design-comparison.png)
*左圖來源為維基百科免費圖庫，右圖為設計師自行手繪。*

之所以和日本版不同走適應手機這條路，也是因為大家都知道的手機佔有率已經遠遠超過桌機筆電，加上剛好台灣是狹長形的做手機版比較方便（喂

於是島嶼圖的部分就定案了，接下來等級的部分，因為台灣小小的，像是日本版中的換車或路過這兩個選項就不適用了，很容易搭個高鐵或環個島就解了一堆之類的，雖然對台灣人來說，全台灣縣市都旅遊過也不算什麼就是了 。因此才調整為大家現在所看到的旅遊、短居（一個月以上）、居住（一年以上）、久居（超過三年）這樣的選項。另外，色票和背景色的部分設計師也重新設計過，換了相對較柔和的顏色。

- 海：#B4DEF7
- 紅：#FF7A7A
- 橘：#F5A623
- 綠：#88B14B
- 藍：#27BBEE

### 開發過程

jQuery。

近幾年我跟 jQuery 很不熟，頂多也就用用 selector、.css() 和 .click() 這幾樣，很快的 [I think I might not need jQuery](https://github.com/tpai/taiwan-travel-level/commit/7da7e05cf65a0848e62e5bbc53bede892ff37444)，全部改寫成 Vanilla JS。

Browser Compatibility 也踩了不少坑：

- 直接把 [spread operator](http://kangax.github.io/compat-table/es6/#test-spread_%28...%29_operator) 寫進去，然後 Safari 11 就爆炸了。（syntax sugar 成癮症）
- [SVG 在 IE 9–11 和 Edge 所有版本都會有 scaling 的問題](https://caniuse.com/#feat=svg)。
- 用於圖片下載的 canvas.toBlob 在 IE Edge 也需要 polyfill。

除了上述問題外還有一個大卡關，就是將非 SVG 的 element 和 SVG 本身同時輸出到 canvas 中而且要保持排版不變，因為一開始只有島嶼圖是 SVG 檔，其他標示等級的部分都是用 HTML 刻的，後來發現無論是使用 html2canvas 還是 canvg 都得兜圈子才能解決，才決定採用日本版的方式，所有元件都出在一張 SVG 解決掉。

部署方面採用 S3 的 Static Website Hosting，CDN 和 HTTPS 則交給 CloudFlare。

### 數據分享

跟翡翠周刊產生器那次不同的是，這次的開發著重於手機版的優化和多瀏覽器的支援，就結果來看，確實有反映在數據上。

#### 不重複瀏覽量

![Image](/images/taiwan-app-analytics-overview.png)
- 6/2 傍晚 6 點發佈第一個版本，晚上 11 點加入基隆市，並上了 [UDN 新聞](https://udn.com/news/story/7266/3176919)。
- 6/3 收到[瀏覽器支援的 issue](https://github.com/tpai/taiwan-travel-level/issues/7)，於中午 12 點修復，陸續上了[三立](https://www.setn.com/News.aspx?NewsID=387619)、[TVBS](https://news.tvbs.com.tw/life/931505) 和[自由](http://news.ltn.com.tw/news/life/breakingnews/2446538)等新聞，同時 Youtube 也出現了[三立](https://www.youtube.com/watch?v=DDLxOWY6fdw)、[TVBS](https://www.youtube.com/watch?v=tdaW5_-I-XA) 和[中天](https://www.youtube.com/watch?v=XpEwCrSDb7Y)的影片，當日達到流量最高峰**三十萬個不重複瀏覽量**。
- 6/4 瀏覽量下降到十九萬左右，陸續還是有部落格和轉貼，同時這個 repo 的 Github Star 數超越我之前所有 repo 的總和。

#### 裝置

![手機正如所料佔了多數，七成七的使用者，有兩成是桌機，剩下是平板電腦。](/images/taiwan-app-device-stats.png)
*手機正如所料佔了多數，七成七的使用者，有兩成是桌機，剩下是平板電腦。*

![iPhone 佔了將近六成，Android 吃掉剩下四成。（Windows Phone：？](/images/taiwan-app-os-distribution.png)
*iPhone 佔了將近六成，Android 吃掉剩下四成。（Windows Phone：？*

#### 瀏覽器

![看來無論是 iPhone 還是 Android 的預設瀏覽器都被 Chrome 分掉好大一塊](/images/taiwan-app-browser-stats.png)
*看來無論是 iPhone 還是 Android 的預設瀏覽器都被 Chrome 分掉好大一塊*

#### 社群流量

![驚人的九成五！所有流量幾乎都是來自於 Facebook 轉貼。](/images/taiwan-app-social-traffic.png)
*驚人的九成五！所有流量幾乎都是來自於 Facebook 轉貼。*

#### 效能測試

![老牌的 Webpagetest](/images/taiwan-app-webpagetest.png)
*老牌的 Webpagetest*

Cache Static Content 是 GA 的 analytics.js 影響，而 First Byte Time [CloudFlare 有提出解釋](https://blog.cloudflare.com/ttfb-time-to-first-byte-considered-meaningles/)。

![Google 的 Test Mobile Speed](/images/taiwan-app-google-mobile-speed.png)
*Google 的 Test Mobile Speed*

在 3G 的速度下，Google 測出 2 秒的 load time，而在 4G 速度下（現今多數使用者為 4G 行動上網），GA 統計出來的數值是 1.54 秒。

#### 支出費用

![CloudFlare 請求數](/images/taiwan-app-cloudflare-requests.png)
*CloudFlare 請求數*

由於使用 CloudFlare，Edge Server 有效地吃下了六成的請求，剩下的才打去 S3。

直接對 S3 的請求數：1,061,663每 10,000 次請求 0.004 美元：1,061,663/10,000*0.004=$0.42

![CloudFlare 流量](/images/taiwan-app-cloudflare-traffic.png)
*CloudFlare 流量*

對 S3 的耗費頻寬：5.14GB每 1GB 流量 0.12 美元：5.14*0.12=$0.61

七天將近七十萬的瀏覽量總共花費 1.03 美元。

### 結語

每次都是想簡單的做完，但是到最後搞出一堆事情來做，不過還是有從中學到不少東西，尤其是這次針對行動裝置的策略、瀏覽器支援度和數據的蒐集，多虧有大家的支持與推廣才能有現在的制縣等級台灣版，也感謝來 Github 提 issue 和協助測試的開發者朋友們。最後，希望下次可以弄點別的，不然有些朋友都開始叫我產生器大師了 XDD

[tpai/taiwan-travel-leveltaiwan-travel-level - How many place you live since you are kid? Show me your taiwan travel level!github.com](https://github.com/tpai/taiwan-travel-level)