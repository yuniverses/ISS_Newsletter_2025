# ISS Newsletter 2026 - 字體系統文檔索引

## 快速導航

你對字體系統的不同需求，請參考以下文檔：

### 1. 想快速查詢字體大小和間距？
👉 **VISUAL_SUMMARY.txt** (16KB, 195 行)
- 視覺化的速查表格
- ASCII 盒子圖表清晰易讀
- 適合快速查閱

### 2. 需要新增內容或複製代碼模式？
👉 **QUICK_REFERENCE.md** (4.1KB, 159 行)
- 7 個常見模式的完整代碼
- 快速複製粘貼
- 適合日常開發

### 3. 想了解如何升級舊章節？
👉 **CHAPTER_COMPARISON.md** (6.6KB, 238 行)
- 舊格式 vs 新格式的詳細對比
- 逐步升級指南
- 升級檢查清單

### 4. 需要完整深度分析？
👉 **TYPOGRAPHY_ANALYSIS.md** (15KB, 503 行)
- 10 個詳細章節的完整分析
- 涵蓋系統的每個方面
- 最佳實踐和禁止事項

---

## 按用途快速選擇

| 我想... | 參考文檔 | 位置 |
|--------|--------|------|
| 查詢字體大小 | VISUAL_SUMMARY.txt | 【字體大小速查表】 |
| 查詢間距規則 | QUICK_REFERENCE.md | 【間距速查表】 |
| 查詢色彩規範 | VISUAL_SUMMARY.txt | 【色彩規範】 |
| 複製代碼模式 | QUICK_REFERENCE.md | 【常見模式快速複製】 |
| 升級舊內容 | CHAPTER_COMPARISON.md | 【遷移指南】 |
| 理解設計系統 | TYPOGRAPHY_ANALYSIS.md | 【設計系統特徵】 |
| 看禁止事項 | VISUAL_SUMMARY.txt | 【禁止事項清單】 |
| 了解組件樣式 | TYPOGRAPHY_ANALYSIS.md | 【各個頁面/組件的字體配置】 |

---

## 三個核心規則 (必記!)

1️⃣ **所有標題** → `font-light`
2️⃣ **所有正文** → `prose prose-lg` 或 `text-base/lg leading-loose`
3️⃣ **所有間距** → `mb-*` `py-*` `px-*` (不用 `style=`)

---

## 快速檢查清單

新增內容時：
- [ ] 標題使用 `font-light`?
- [ ] 正文在 `prose prose-lg` 容器內或有 `text-*` + `leading-*`?
- [ ] 間距使用 Tailwind classes?
- [ ] 添加了 `md:` 響應式版本?
- [ ] 色彩使用 `gray-*` 系列?

升級舊內容時：
- [ ] 移除所有 `style="..."` 屬性?
- [ ] 添加 Tailwind classes?
- [ ] 轉換為 gray 色彩系統?
- [ ] 添加響應式斷點?
- [ ] 參考 CHAPTER_COMPARISON.md 的映射表?

---

## 常用模式速查

| 模式 | 文檔位置 |
|------|--------|
| 主標題 + 副標題 | QUICK_REFERENCE.md【模式1】|
| 編號 + 標題 + 說明 | QUICK_REFERENCE.md【模式3】|
| 灰色背景框 | QUICK_REFERENCE.md【模式5】|
| 引用塊 | QUICK_REFERENCE.md【模式6】|
| 兩欄網格 | QUICK_REFERENCE.md【模式7】|
| 使用 Prose | QUICK_REFERENCE.md【使用 Prose 容器】|

---

## 組件配置速查

| 組件 | 分析位置 |
|------|---------|
| Preface | TYPOGRAPHY_ANALYSIS.md 6.1 |
| TableOfContents | TYPOGRAPHY_ANALYSIS.md 6.2 |
| ChapterSection | TYPOGRAPHY_ANALYSIS.md 6.3 |
| Chapter-03 | TYPOGRAPHY_ANALYSIS.md 6.5 |

---

## 響應式設計

所有內容都應該支持以下斷點：

```
base (手機)     →  預設大小
md: (平板)     →  768px 以上
lg: (桌面)     →  1024px 以上
```

範例：
```html
<h2 class="text-4xl md:text-5xl lg:text-6xl">標題</h2>
```

---

## 常見問題 FAQ

**Q: 我應該使用 style 屬性嗎？**
A: 不！永遠使用 Tailwind classes。參考 VISUAL_SUMMARY.txt【禁止事項清單】

**Q: 標題應該用什麼粗細？**
A: 使用 `font-light`。只有 h4 和 h5 使用 `font-medium`

**Q: 如何設置段落間距？**
A: 使用 `mb-8` (段落之間) 或 `mb-16` (大區塊分隔)。參考 QUICK_REFERENCE.md【間距速查表】

**Q: 我可以用自定義色值嗎？**
A: 不！使用 gray-50 到 gray-900 的灰度系統

**Q: Chapter-01/02 為什麼看起來不同？**
A: 它們使用舊格式 (內聯 style)。計劃升級它們。參考 CHAPTER_COMPARISON.md

**Q: 我應該創建新的 CSS class 嗎？**
A: 不需要，使用 Tailwind utilities 就足夠了

---

## 文檔大小和內容量

| 文檔 | 大小 | 行數 | 用途 |
|------|------|------|------|
| TYPOGRAPHY_ANALYSIS.md | 15KB | 503 | 完整深度分析 |
| QUICK_REFERENCE.md | 4.1KB | 159 | 日常快速參考 |
| CHAPTER_COMPARISON.md | 6.6KB | 238 | 升級指南對比 |
| VISUAL_SUMMARY.txt | 16KB | 195 | 視覺化速查表 |

---

## 建議閱讀順序

1️⃣ **第一次接觸字體系統** → VISUAL_SUMMARY.txt (快速了解全貌)
2️⃣ **開始開發新內容** → QUICK_REFERENCE.md (複製模式開發)
3️⃣ **遇到問題或需要深度理解** → TYPOGRAPHY_ANALYSIS.md
4️⃣ **升級舊章節** → CHAPTER_COMPARISON.md

---

## 保存位置

所有文檔都保存在項目根目錄：

```
/Users/chenguanyu/ISS_Newsletter_2026/
├── TYPOGRAPHY_ANALYSIS.md       (詳細分析)
├── QUICK_REFERENCE.md           (快速參考)
├── CHAPTER_COMPARISON.md        (對比分析)
├── VISUAL_SUMMARY.txt           (視覺化總結)
└── TYPOGRAPHY_INDEX.md          (本檔案 - 導航索引)
```

---

## 更新歷史

- 2026-11-04：初始分析完成，生成 4 份完整文檔

---

## 需要幫助？

- 快速查詢 → VISUAL_SUMMARY.txt
- 複製代碼 → QUICK_REFERENCE.md  
- 深度分析 → TYPOGRAPHY_ANALYSIS.md
- 升級指南 → CHAPTER_COMPARISON.md

祝你開發順利！
