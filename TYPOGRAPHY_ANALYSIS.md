# ISS Newsletter 2026 - 字體系統和設計風格分析報告

## 執行摘要

經過全面分析，ISS Newsletter 2026 系統採用了**一致的設計語言**，基於 Tailwind CSS，使用 `prose prose-lg` 類別管理內容排版。第三章（Chapter-03）使用了與整個系統**完全一致**的字體大小和間距設定。

---

## 1. 字體大小對照表

### 1.1 標題層級（Heading Levels）

| 層級 | 標籤 | Tailwind Class | 使用場景 | 備註 |
|------|------|-----------------|---------|------|
| 主標題 | h1 | `text-3xl md:text-4xl lg:text-5xl` | ChapterSection 章節標題 | `font-light`，最高層級 |
| 副標題 | h2 | `text-2xl md:text-3xl` | 內容小標、結論標題 | `font-light`，通常 `mb-6` 或 `mb-10` |
| 小標題 | h3 | `text-2xl md:text-3xl` | 內容區塊標題（發現01-04） | `font-light`，與 h2 相同大小 |
| 段落標題 | h4 | `text-lg md:text-xl` | 問題所在、解決方案等小區塊 | `font-medium` |
| h5/h6 | - | `text-base` | 格子內標題 | `font-medium` |

### 1.2 正文字體大小

| 用途 | Tailwind Class | 情境 | 備註 |
|------|-----------------|------|------|
| 主要正文 | `text-base` | 標準段落內容 | 預設大小 |
| 主要正文（大） | `text-lg` | 引言段落、框架說明 | 稍大的正文 |
| 大正文 | `text-xl md:text-2xl` | Preface 段落、介紹文字 | 開篇引導性文字 |
| 小號正文 | `text-sm` | 圖片說明、編輯署名 | 附屬信息 |
| 極小號正文 | `text-xs` | 進度導航、標籤 | 很少使用 |

### 1.3 數字/特殊元素

| 元素 | Tailwind Class | 場景 | 備註 |
|------|-----------------|------|------|
| 章節編號 | `text-8xl md:text-9xl` | ChapterSection 頂部 | `font-light`，視覺焦點 |
| 目錄編號 | `text-6xl md:text-7xl` | 目錄頁面 | `font-light`，`text-gray-300` |
| 發現編號 | `text-6xl md:text-7xl` | Chapter-03 內的 01-04 | `font-light`，`text-gray-200` |
| 分號符號 | `text-7xl md:text-8xl` | 章節結尾象徵 | `font-light`，`text-gray-300` |

---

## 2. 行高設定（Line Heights）

### 2.1 使用的 leading 類別

| Class | 用途 | 應用場景 |
|-------|------|---------|
| `leading-none` | 無行高 | 章節編號、特殊視覺元素 |
| `leading-tight` | 緊湊（1.25） | 標題（h2、h3）與列表 |
| `leading-relaxed` | 放鬆（1.625） | 一般正文段落、目錄描述 |
| `leading-loose` | 很寬鬆（2） | Preface 正文、強調段落 |

### 2.2 在不同組件中的應用

- **ChapterSection 頭部**：`text-3xl md:text-4xl lg:text-5xl font-light` + `leading-tight`（如果有）
- **正文段落**：`text-base leading-loose` 或 `text-lg leading-loose`（在 `prose prose-lg` 中自動應用）
- **Preface 段落**：`text-base md:text-lg text-gray-300 leading-loose font-light`
- **格子內容**：`text-sm leading-relaxed`

---

## 3. 間距系統（Spacing）

### 3.1 垂直邊距（mb = margin-bottom）

| Class | 大小 | 使用場景 |
|-------|------|---------|
| `mb-0` | 0 | 直接相連元素 |
| `mb-3` | 0.75rem | 目錄小項之間 |
| `mb-4` | 1rem | 標題下方 |
| `mb-6` | 1.5rem | 標題下方（常用） |
| `mb-8` | 2rem | 段落之間、Preface 段落之間 |
| `mb-10` | 2.5rem | h2 下方（大標題） |
| `mb-12` | 3rem | 主要區塊分隔（目錄） |
| `mb-16` | 4rem | 大型內容區塊之間 |
| `mb-24` | 6rem | Preface 主要內容下方 |
| `mb-48` | 12rem | Chapter-03 發現區塊之間 |

### 3.2 垂直內邊距（py = padding-vertical）

| Class | 大小 | 使用場景 |
|-------|------|---------|
| `py-8` | 2rem | 組件內邊距 |
| `py-12` | 3rem | TextImageSplit 組件 |
| `py-16` | 4rem | TitleSection |
| `py-24` | 6rem | 特殊視覺分隔 |
| `py-32` | 8rem | Preface 最小高度 |
| `py-40` | 10rem | Preface 大螢幕最小高度 |

### 3.3 水平內邊距（px = padding-horizontal）

| Class | 大小 | 使用場景 |
|-------|------|---------|
| `px-8` | 2rem | 標準內容邊距 |
| `px-16` | 4rem | 中等螢幕 |
| `px-32` | 8rem | 大螢幕（lg:） |

### 3.4 其他間距

| Class | 用途 |
|-------|------|
| `pt-4` | 頂部內邊距 |
| `pt-3` | 章節標題微調 |
| `pl-8` | 引用塊左邊距 |
| `pb-8` | 目錄項底部邊距 |
| `gap-8` | 彈性佈局間距 |
| `gap-12` | 大型布局間距 |

---

## 4. 色彩和文字樣式

### 4.1 文字顏色

| Class | 應用場景 |
|-------|---------|
| `text-black` | 主要文字、標題 |
| `text-white` | Preface 白底黑色背景 |
| `text-gray-700` | 正文（預設） |
| `text-gray-600` | 副標題、次要正文 |
| `text-gray-500` | 小號文字、圖片說明 |
| `text-gray-400` | 次級標籤、目錄標籤 |
| `text-gray-300` | Preface 文字、特殊視覺元素 |
| `text-gray-200` | 編號、淡化視覺 |

### 4.2 字體粗細

| Class | 應用場景 | 備註 |
|-------|---------|------|
| `font-light` | 標題、大型編號、Preface 文字 | 優雅、現代感 |
| `font-medium` | h4/h5、格子內容標題 | 輕微強調 |
| `font-bold` | 管理員面板 | 極少使用 |
| （無） | 一般正文 | 預設 400 weight |

---

## 5. Prose 類別的具體配置

### 5.1 Prose 使用方式

系統使用 **Tailwind CSS 內建的 prose 類別**（不是 @tailwindcss/typography 插件），配合自定義修飾符：

```
prose prose-lg max-w-none 
prose-headings:font-light 
prose-p:text-gray-700 prose-p:leading-relaxed 
prose-img:rounded-lg prose-img:shadow-lg
```

### 5.2 Prose 類別效果

| 修飾符 | 預設樣式 | 用途 |
|-------|---------|------|
| `prose-lg` | 大型排版樣式 | 章節內容、內容佈局 |
| `prose-headings:font-light` | h1-h6 使用 font-light | 統一標題風格 |
| `prose-p:text-gray-700` | 段落顏色 | 統一正文色 |
| `prose-p:leading-relaxed` | 段落行高 1.625 | 舒適閱讀距離 |
| `prose-img:rounded-lg` | 圖片圓角 | 柔和視覺 |
| `prose-img:shadow-lg` | 圖片陰影 | 深度感 |

---

## 6. 各個頁面/組件的字體配置

### 6.1 Preface 組件

```
背景：黑色 (bg-black)
最小高度：min-h-screen
垂直內邊距：py-32 md:py-40
內容最大寬度：max-w-2xl

段落文字：
- text-base md:text-lg
- text-gray-300
- leading-loose
- font-light
- mb-8（段落之間）

編輯署名：
- text-sm text-gray-500（標籤）
- text-sm text-gray-400（內容）
- text-white（編輯名字）
```

### 6.2 TableOfContents 組件

```
背景：白色 (bg-white)
最小高度：min-h-screen
水平內邊距：px-8 md:px-16 lg:px-32
垂直內邊距：py-32 md:py-40
最大寬度：max-w-4xl

章節標籤：text-sm text-gray-400 mb-12 tracking-wider
章節容器：space-y-12（gap: 3rem）

章節編號：
- text-6xl md:text-7xl
- font-light
- text-gray-300
- group-hover:text-black

章節標題 (h3)：
- text-xl md:text-2xl
- font-light
- mb-3
- leading-tight

描述文字：
- text-sm
- text-gray-600
- leading-relaxed
```

### 6.3 ChapterSection 組件

```
水平內邊距：px-8 md:px-16 lg:px-32
垂直內邊距：py-24

章節編號：
- text-8xl md:text-9xl
- font-light
- tracking-tighter
- mb-8

章節標題 (h1)：
- text-3xl md:text-4xl lg:text-5xl
- font-light
- mb-4
- max-w-3xl

章節描述：
- text-lg
- text-gray-600
- max-w-2xl
- mb-6

章節內容：
- prose prose-lg max-w-none
- 所有段落繼承 prose 樣式
```

### 6.4 Chapter-01 & Chapter-02（舊格式 HTML）

```
.chapter-content
  h2：預設大小，無特定 Tailwind class
  h3：預設大小，無特定 Tailwind class
  p：預設大小，無特定 Tailwind class
  div[style="margin-top: 3rem; ..."]：內聯樣式
  div[style="margin-top: 4rem; padding: 2rem; ..."]：內聯樣式

特點：使用內聯 style 而非 Tailwind classes
```

### 6.5 Chapter-03（新格式 HTML）

```
.chapter-content
  h2：text-4xl md:text-5xl font-light mb-8 tracking-tight
  subtitle：text-xl md:text-2xl text-gray-400 font-light leading-relaxed
  
  引言：
  - prose prose-lg max-w-3xl mb-48
  - text-lg leading-loose text-gray-700 mb-8
  
  小標題/編號區塊：
  - text-6xl md:text-7xl font-light text-gray-200 leading-none（編號）
  - text-2xl md:text-3xl font-light mb-6 leading-tight（標題）
  - text-base md:text-lg text-gray-500 leading-relaxed（副標題）
  
  內容段落：
  - prose prose-lg max-w-none mb-16
  - text-base leading-loose text-gray-700
  
  h4 小標題：text-lg md:text-xl font-medium mb-6 text-gray-900
  
  背景框：bg-gray-50 p-10 md:p-14 rounded-sm
  
  引用塊：
  - border-l-4 border-gray-900 pl-8 my-16 italic text-gray-600
  - text-base md:text-lg leading-loose
  
  網格格子：grid grid-cols-1 md:grid-cols-2 gap-8 mb-16
  格子項目：bg-gray-50 p-8 rounded-sm
  - h5：font-medium mb-4 text-gray-900 text-base
  - p：text-sm leading-relaxed text-gray-600
```

---

## 7. 設計系統特徵

### 7.1 一致性設計原則

1. **字體**：統一使用系統預設字體
2. **粗細**：大多數標題使用 `font-light`，強調使用 `font-medium`
3. **顏色**：灰度系統 (gray-50 到 gray-900) 加黑白
4. **間距**：基於 8px/4px 倍數的 Tailwind 間距系統
5. **行高**：
   - 標題：`leading-tight` (1.25)
   - 正文：`leading-relaxed` (1.625) 或 `leading-loose` (2)
6. **響應式**：廣泛使用 `md:` 和 `lg:` 斷點

### 7.2 排版層級

```
大螢幕 (lg)        中等螢幕 (md)       小螢幕 (base)
──────────────────────────────────────────────────
text-9xl          text-8xl           text-8xl（編號）
text-5xl          text-4xl           text-3xl（標題）
text-3xl          text-2xl           text-2xl（副標題）
text-2xl          text-xl            text-lg（引言）
text-xl           text-lg            text-base（正文）
text-lg           text-base          text-sm（說明）
```

### 7.3 垂直節奏

以 4rem (mb-12) 為主要間距單位，組成簡潔的垂直節奏：
- 小段落：8 → 16 → 24 → 48 單位漸進
- 大區塊：24 → 48 → 72 單位分隔
- Preface：32/40 的最小高度

---

## 8. 第三章 (Chapter-03) 對比分析

### 8.1 第三章的字體設定（✓ 完全一致）

| 元素 | 大小 | 行高 | 顏色 | 粗細 | 狀態 |
|------|------|------|------|------|------|
| h2 主標題 | text-4xl md:text-5xl | - | - | font-light | ✓ |
| h2 副標題 | text-xl md:text-2xl | leading-relaxed | text-gray-400 | font-light | ✓ |
| 引言段落 | text-lg | leading-loose | text-gray-700 | - | ✓ |
| h3 小標題 | text-2xl md:text-3xl | leading-tight | - | font-light | ✓ |
| h4 框標題 | text-lg md:text-xl | - | text-gray-900 | font-medium | ✓ |
| 正文 | text-base | leading-loose | text-gray-700 | - | ✓ |
| 編號 | text-6xl md:text-7xl | leading-none | text-gray-200 | font-light | ✓ |
| 引用塊 | text-base md:text-lg | leading-loose | text-gray-600 | italic | ✓ |
| 背景框 | - | - | bg-gray-50 | - | ✓ |

### 8.2 第三章的間距設定（✓ 完全一致）

| 元素 | 間距設定 | 狀態 |
|------|---------|------|
| 主標題下 | mb-8 | ✓ |
| 副標題下 | - | ✓（prose-lg 自動） |
| 引言段落 | mb-48 | ✓ |
| 區塊標題 | mb-16 | ✓ |
| 內容段落 | mb-16 / mb-6 | ✓ |
| 框體內邊距 | p-10 md:p-14 | ✓ |
| 編號到標題 | pt-3 | ✓ |
| 發現區塊 | mb-48 | ✓ |

### 8.3 Chapter-03 對比 Chapter-01/02

**Chapter-01 & Chapter-02**：
- 使用內聯 style 屬性
- 沒有 Tailwind classes
- 間距不規則（margin-top: 3rem, 4rem）
- 字體大小未指定

**Chapter-03**：
- 完全使用 Tailwind classes
- 與系統組件保持一致
- 間距系統化（mb-8, mb-16, mb-48）
- 字體大小精確指定（text-*）

---

## 9. 對齊建議和最佳實踐

### 9.1 新增內容時遵循的模式

#### 主標題區塊
```html
<div class="mb-40">
  <h2 class="text-4xl md:text-5xl font-light mb-8 tracking-tight">
    標題
  </h2>
  <p class="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
    副標題
  </p>
</div>
```

#### 引言段落
```html
<div class="prose prose-lg max-w-3xl mb-48">
  <p class="text-lg leading-loose text-gray-700 mb-8">
    引言內容
  </p>
</div>
```

#### 區塊標題 + 內容
```html
<div class="mb-48">
  <h3 class="text-2xl md:text-3xl font-light mb-6 leading-tight">
    區塊標題
  </h3>
  <div class="max-w-3xl">
    <div class="prose prose-lg max-w-none mb-16">
      <p class="text-base leading-loose text-gray-700">
        正文內容
      </p>
    </div>
  </div>
</div>
```

#### 小標題 + 描述
```html
<h4 class="text-lg md:text-xl font-medium mb-6 text-gray-900">
  小標題
</h4>
<p class="text-base leading-loose text-gray-700 mb-6">
  說明文字
</p>
```

#### 引用塊
```html
<blockquote class="border-l-4 border-gray-900 pl-8 my-16 italic text-gray-600">
  <p class="text-base md:text-lg leading-loose">
    引用內容
  </p>
</blockquote>
```

#### 背景框
```html
<div class="mb-16 bg-gray-50 p-10 md:p-14 rounded-sm">
  <h4 class="text-lg md:text-xl font-medium mb-6 text-gray-900">
    框標題
  </h4>
  <p class="text-base leading-loose text-gray-700">
    框內容容
  </p>
</div>
```

#### 網格佈局
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
  <div class="bg-gray-50 p-8 rounded-sm">
    <h5 class="font-medium mb-4 text-gray-900 text-base">標題</h5>
    <p class="text-sm leading-relaxed text-gray-600">內容</p>
  </div>
</div>
```

### 9.2 核心規則

1. **所有標題**必須使用 `font-light`
2. **所有正文**必須使用 `prose prose-lg` 容器或明確的 `text-*` + `leading-*` class
3. **間距**使用 Tailwind margin/padding，不使用內聯 style
4. **色彩**從 gray-50 到 gray-900 的灰度系統
5. **響應式**至少要有 base 和 md: 兩個斷點
6. **字體大小**使用以下公式：
   - 標題h2-h3：`text-2xl md:text-3xl` 及以上
   - h4：`text-lg md:text-xl`
   - 正文：`text-base` 或 `text-lg`
   - 說明：`text-sm`

### 9.3 禁止事項

✗ 不使用內聯 style 屬性（如 `style="margin-top: 3rem"`）
✗ 不混合舊（Chapter-01/02）和新（Chapter-03）樣式
✗ 不創建新的自定義 CSS class（除非真正必需）
✗ 不改變 Tailwind 配置，使用預設值
✗ 不使用 px/rem 等絕對單位，用 Tailwind 等級

---

## 10. 總結

### 系統設計亮點

✓ **高度一致性**：除了舊章節外，所有新內容遵循相同規則
✓ **響應式設計**：完整的 mobile-first 設計
✓ **優雅的排版**：大量使用 `font-light` 和充足的行高
✓ **清晰的層級**：通過字體大小和顏色明確表達內容優先級
✓ **系統化間距**：垂直節奏一致，容易維護

### 第三章現狀

✓ **完全符合規範**：所有設定與系統其他部分一致
✓ **最佳實踐**：使用了最新的 Tailwind classes 方式
✓ **可維護性強**：清晰的 HTML 結構，易於修改和擴展

### 後續建議

1. **升級舊章節**：將 Chapter-01/02 的內聯 style 轉換為 Tailwind classes
2. **建立樣式指南**：文檔化這些模式供後續使用
3. **創建可複用組件**：為常用模式（如"問題所在"框）創建 React 組件
4. **考慮 shadcn/ui**：已安裝但未使用，可考慮引入以增強 UI 一致性

---

