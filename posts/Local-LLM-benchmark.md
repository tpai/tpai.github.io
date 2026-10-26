---
publishedDate: "2025-05-22"
---

# 本地模型的 Coding 能力測試

![](/images/rotating-hexagon.jpeg)

前陣子買了 Mac mini（14CPU/20GPU/48GB RAM），迫不及待的在本地 host 了 [DeepCoder 14B](https://ollama.com/mychen76/deepcoder_cline_rootcode) 和 [Qwen3 30B](https://ollama.com/mychen76/qwen3_cline_roocode)，並且結合了 [VS Code Insider](https://code.visualstudio.com/insiders/) & [Cline](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) 來嘗試 Vibe Coding。

這次進行了三項測試：撒花按鈕、八皇后、彈力球與六角形。

# 撒花按鈕
測試網頁建置和引用外部資源的能力。
提示詞：
```text
A single button in the center middle of the page and display confetti and a sound effect when click it.
```

測試結果：

* [DeepCoder 14B](https://codepen.io/tpai/pen/zxxgpNP) — ✅
* [Qwen3 30B ](https://codepen.io/tpai/pen/pvvMpeN)— ✅

# 八皇后
測試演算法和邏輯能力。
提示詞：
```md
- create a chess board with 8 queens
- no queens should threaten each other
- those positions must not hardcoded
- regenerate new positions when click a button
- randomize the regeneration every time to have different 8 queens answers
```

測試結果：

* [DeepCoder 14B](https://codepen.io/tpai/pen/xbbvpgW)— 👎 在初始化時就進入無限迴圈，網頁無法正確呈現。
* [Qwen3 30B](https://codepen.io/tpai/pen/EaaqoWQ) — ✅
# 彈力球與六角形
測試圖形渲染和物理引擎撰寫能力。
提示詞：
```md
- Create a rotating hexagon that continuously spins around its center
- Create a ball affected by gravity, making it drop realistically
- Proper collision detection with the hexagon’s walls
- Realistic bouncing physics, including energy loss due to friction
- The ball should be generated inside the hexagon
```

測試結果：

* [DeepCoder 14B](https://codepen.io/tpai/pen/pvvMpRN) — 👎 彈力球直接穿越了六角形，兩者沒有發生碰撞，但彈力球是有對地板產生碰撞且六角形有持續旋轉。
* [Qwen3 30B](https://codepen.io/tpai/pen/OPPKzpL) — ✅ 算半對，彈力球和六角形間的物理碰撞不太符合現實。

# 結論

Qwen3 30B 是有能力在本地提供基礎 Agent 需求的，但因為我是用 Mac，所以 tok/s 差強人意，如果想要更好的效能，就找黃總買張卡吧。

之所以會想嘗試 DeepCoder 14B 也是因為它在前陣子有點聲量，但可能因為參數數量太少加上測試案例不多，所以表現較差。