# 內容排版組件使用指南

本目錄包含多種內容排版組件，用於創建不同風格的章節內容。

## 組件列表

### 1. FullWidthImage - 滿版圖片

適合展示重要視覺內容或作為章節分隔。

```tsx
import { FullWidthImage } from '@/components/ContentLayouts'

<FullWidthImage
  src="/path/to/image.jpg"
  alt="圖片描述"
  caption="可選的圖片說明文字"
/>
```

**Props:**
- `src` (string, 必填): 圖片路徑
- `alt` (string, 可選): 圖片替代文字
- `caption` (string, 可選): 圖片說明

---

### 2. TextImageSplit - 圖文並排

左文右圖或右文左圖的排版，支持章節標題、編號和作者資訊。

```tsx
import { TextImageSplit } from '@/components/ContentLayouts'

<TextImageSplit
  chapterNumber="01"
  title="章節標題"
  subtitle="副標題或簡介"
  authors={["作者 / 角色", "作者 / 角色"]}
  imageSrc="/path/to/image.jpg"
  imageAlt="圖片描述"
  imagePosition="right" // 或 "left"
>
  <p>內容段落...</p>
  <p>更多內容...</p>
</TextImageSplit>
```

**Props:**
- `children` (ReactNode, 必填): 文字內容
- `imageSrc` (string, 可選): 圖片路徑（不提供則顯示為全寬文字）
- `imageAlt` (string, 可選): 圖片替代文字
- `imagePosition` ('left' | 'right', 可選, 預設 'right'): 圖片位置
- `chapterNumber` (string, 可選): 章節編號
- `title` (string, 可選): 章節標題
- `subtitle` (string, 可選): 副標題
- `authors` (string[], 可選): 作者列表

**使用場景:**
- 左文右圖：`imagePosition="right"`
- 右文左圖：`imagePosition="left"`
- 純文字（無圖片）：不提供 `imageSrc`

---

### 3. TitleSection - 標題欄

大型標題區塊，適合章節開頭或重要段落標題。

```tsx
import { TitleSection } from '@/components/ContentLayouts'

<TitleSection
  title="主標題"
  subtitle="副標題或說明文字"
  centered={true}
/>
```

**Props:**
- `title` (string, 必填): 主標題
- `subtitle` (string, 可選): 副標題
- `centered` (boolean, 可選, 預設 false): 是否置中

---

### 4. Quote - 名言欄

引用或金句展示，適合強調重點內容。

```tsx
import { Quote } from '@/components/ContentLayouts'

<Quote
  text="引用的文字內容"
  author="作者名稱"
  centered={true}
/>
```

**Props:**
- `text` (string, 必填): 引用文字
- `author` (string, 可選): 作者或出處
- `centered` (boolean, 可選, 預設 true): 是否置中

---

## 組合使用示例

你可以自由組合這些組件來創建豐富的內容排版：

```tsx
export default function ChapterContent() {
  return (
    <div>
      {/* 滿版圖片作為章節開頭 */}
      <FullWidthImage
        src="/chapter-hero.jpg"
        alt="Chapter Hero"
      />

      {/* 章節標題 */}
      <TitleSection
        title="第一章：開始"
        subtitle="一段新的旅程"
        centered
      />

      {/* 左文右圖 */}
      <TextImageSplit
        chapterNumber="01"
        title="段落標題"
        imageSrc="/image1.jpg"
        imagePosition="right"
      >
        <p>文字內容...</p>
      </TextImageSplit>

      {/* 引用 */}
      <Quote text="一句重要的話" />

      {/* 右文左圖 */}
      <TextImageSplit
        imageSrc="/image2.jpg"
        imagePosition="left"
      >
        <p>另一段內容...</p>
      </TextImageSplit>

      {/* 純文字段落 */}
      <TextImageSplit>
        <p>沒有圖片的文字段落...</p>
      </TextImageSplit>
    </div>
  )
}
```

## 查看示例

訪問 `/layouts-demo` 路由可以查看所有組件的實際效果和使用示例。

```bash
npm run dev
# 瀏覽器打開 http://localhost:5173/layouts-demo
```
