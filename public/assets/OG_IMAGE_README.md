# OG 圖片設置說明

## 📸 需要創建的文件

`public/assets/og-image.jpg` (1200x630px)

## 方法一：使用 OG 圖片生成器（推薦）

1. 在瀏覽器中打開項目根目錄的 `og-image-generator.html`
2. 使用截圖工具框選整個黑色卡片區域（1200x630px）
3. 將截圖保存為 `og-image.jpg`
4. 移動文件到 `public/assets/og-image.jpg`

**Mac 截圖快捷鍵**: `Cmd + Shift + 4`
**Windows 截圖工具**: `Win + Shift + S`

## 方法二：使用設計工具

在 Figma、Photoshop 或 Canva 中創建：

- **尺寸**: 1200 x 630 px
- **格式**: JPG 或 PNG
- **建議內容**:
  - 品牌標題：「服務聲 2026」
  - 副標題：「ISS Sounds Quarterly」
  - 分號符號「;」作為視覺元素
  - 深色背景 (#0A0A0A)
  - 漸變或裝飾元素

## 方法三：臨時使用 SVG

如果暫時沒有 JPG，可以修改代碼使用 SVG：

```javascript
// scripts/generate-static.cjs (line 28)
const image = 'https://iss-newsletter-2026.web.app/assets/og-image.svg';

// src/pages/Home.tsx (line 80)
const ogImage = '/assets/og-image.svg'
```

**注意**: 部分社交平台（如 Twitter）可能不支持 SVG 預覽圖。

## 驗證 OG 圖片

部署後使用以下工具測試：

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## 當前狀態

✅ `og-image.svg` - 已創建（SVG 佔位圖）
⚠️ `og-image.jpg` - **需要創建**（推薦）
📄 `og-image-generator.html` - 已創建（生成工具）
