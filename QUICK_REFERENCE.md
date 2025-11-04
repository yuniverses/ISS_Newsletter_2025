# ISS Newsletter 2025 - 快速字體參考指南

## 核心字體規範

### 標題
```
h2 主標題     → text-4xl md:text-5xl font-light mb-8
h3 小標題     → text-2xl md:text-3xl font-light mb-6
h4 框標題     → text-lg md:text-xl font-medium mb-6
編號 (01-04)  → text-6xl md:text-7xl font-light text-gray-200
```

### 正文
```
引言文字      → text-lg leading-loose text-gray-700
一般正文      → text-base leading-loose text-gray-700
說明文字      → text-sm leading-relaxed text-gray-600
```

### 使用 Prose 容器（推薦）
```html
<div class="prose prose-lg max-w-none mb-16">
  <p>所有段落和標題都會自動應用正確的樣式</p>
</div>
```

## 間距速查表

### 常用的 margin-bottom (mb)
```
標題後        mb-6 或 mb-8
段落之間      mb-8
大區塊分隔    mb-16 或 mb-48
```

### 常用的 padding
```
內容框體      p-10 md:p-14
網格項目      p-8
頂部間隔      pt-3 或 pt-4
```

## 色彩速查

```
主要文字      text-black（白底）/ text-white（黑底）
正文          text-gray-700
副文本        text-gray-600
淡化文本      text-gray-400 / text-gray-500
淡化編號      text-gray-200 / text-gray-300
背景框        bg-gray-50
```

## Chapter-03 常見模式快速複製

### 模式1：主標題 + 副標題
```html
<div class="mb-40">
  <h2 class="text-4xl md:text-5xl font-light mb-8 tracking-tight">
    主標題
  </h2>
  <p class="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
    副標題/說明
  </p>
</div>
```

### 模式2：大區塊標題 + 內容
```html
<div class="mb-48">
  <h3 class="text-2xl md:text-3xl font-light mb-6 leading-tight">
    區塊標題
  </h3>
  <div class="max-w-3xl ml-0 md:ml-28">
    <div class="prose prose-lg max-w-none mb-16">
      <p class="text-base leading-loose text-gray-700">
        正文內容
      </p>
    </div>
  </div>
</div>
```

### 模式3：編號 + 標題 + 描述
```html
<div class="flex items-start gap-8 md:gap-12 mb-16">
  <div class="text-6xl md:text-7xl font-light text-gray-200 leading-none">01</div>
  <div class="flex-1 pt-3">
    <h3 class="text-2xl md:text-3xl font-light mb-6 leading-tight">
      標題
    </h3>
    <p class="text-base md:text-lg text-gray-500 leading-relaxed">
      副標題/說明
    </p>
  </div>
</div>
```

### 模式4：小標題 + 說明 (h4)
```html
<h4 class="text-lg md:text-xl font-medium mb-6 text-gray-900">小標題</h4>
<p class="text-base leading-loose text-gray-700 mb-6">說明文字</p>
```

### 模式5：灰色背景框
```html
<div class="mb-16 bg-gray-50 p-10 md:p-14 rounded-sm">
  <h4 class="text-lg md:text-xl font-medium mb-6 text-gray-900">框標題</h4>
  <p class="text-base leading-loose text-gray-700">
    框內容
  </p>
</div>
```

### 模式6：引用塊
```html
<blockquote class="border-l-4 border-gray-900 pl-8 my-16 italic text-gray-600">
  <p class="text-base md:text-lg leading-loose">
    引用內容
  </p>
</blockquote>
```

### 模式7：兩欄網格
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
  <div class="bg-gray-50 p-8 rounded-sm">
    <h5 class="font-medium mb-4 text-gray-900 text-base">標題</h5>
    <p class="text-sm leading-relaxed text-gray-600">內容</p>
  </div>
  <!-- 重複更多項目 -->
</div>
```

## 響應式斷點速查

```
小螢幕(base)   md:(中等768px)    lg:(大1024px)
───────────────────────────────────────────
text-4xl  →    md:text-5xl       (最常用)
text-3xl  →    md:text-4xl       (標題)
text-lg   →    md:text-xl        (框標題)
px-8      →    md:px-16  →   lg:px-32
```

## 禁止事項速查表

✗ `style="margin-top: 3rem"` → 改用 `mb-12` 或 `mt-12`
✗ `font-bold` (標題) → 改用 `font-light`
✗ 沒有響應式 class → 要加 `md:` 和 `lg:`
✗ 混合舊舊樣式 → 統一用 Tailwind class
✗ 自定義 CSS class → 用 Tailwind utilities

## 三個核心規則 (記住這個！)

1️⃣  所有標題 = `font-light`
2️⃣  所有正文 = `prose prose-lg` 或 `text-base/lg leading-loose`
3️⃣  所有間距 = `mb-*` `p-*` `py-*` (不用 style)

