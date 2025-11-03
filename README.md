# 服務聲 2025 電子期刊

一個創新的互動式數位期刊閱讀平台，專為服務科學研究所（ISS）社群打造。

## 專案簡介

「服務聲」（ISS Sounds Quarterly）是一個結合藝術設計與互動體驗的年度電子期刊，透過創新的網頁技術呈現多元化的內容章節。本專案以「延續你的想法，邀請你一起創作」為核心理念，提供讀者沉浸式的閱讀體驗。

## 主要特色

### 互動式封面
- **動態文字動畫**：文字間距隨滾動漸變，創造獨特的視覺效果
- **閃爍方塊元素**：具有毛玻璃效果的裝飾性區塊動畫
- **使用者參與**：支援讀者輸入文字，連接並延續想法
- **響應式設計**：適配各種螢幕尺寸

### 前言與目錄
- **前言頁面**：以「分號」為主題，闡述期刊的核心理念
- **編輯的話**：展示主編團隊的想法與期許
- **互動式目錄**：點擊章節可快速跳轉到對應內容
- **視覺一致性**：延續封面的設計語言與動畫效果

### 章節閱讀系統
- **無限滾動**：流暢的章節切換體驗
- **進度追蹤**：即時顯示閱讀進度
- **章節導航**：側邊進度導航列，快速跳轉至任意章節
- **內容預載**：智能預載相鄰章節，提升載入速度

### 視覺設計
- **主題切換**：支援淺色/深色主題
- **作者資訊**：每個章節顯示相關作者和編輯
- **現代化 UI**：採用 Tailwind CSS 和 shadcn/ui 組件庫

## 技術棧

### 核心框架
- **React 18** - 現代化的使用者介面框架
- **TypeScript** - 型別安全的 JavaScript 超集
- **Vite** - 快速的前端建置工具

### UI 與樣式
- **Tailwind CSS** - 實用優先的 CSS 框架
- **shadcn/ui** - 高品質的 React 組件庫
- **Lucide React** - 精美的圖示庫

### 3D 與動畫
- **Three.js** - 3D 圖形庫
- **@react-three/fiber** - React 的 Three.js 渲染器
- **@react-three/drei** - Three.js 的實用工具集

### 開發工具
- **ESLint** - 程式碼品質檢查
- **PostCSS** - CSS 後處理工具
- **Autoprefixer** - CSS 自動添加瀏覽器前綴

## 專案結構

```
ISS_Newsletter_2025/
├── public/
│   ├── assets/              # 靜態資源（圖片、SVG 等）
│   └── chapters/            # 章節 HTML 內容檔案
├── src/
│   ├── components/
│   │   ├── Cover/           # 封面組件
│   │   ├── Preface/         # 前言組件
│   │   ├── TableOfContents/ # 目錄組件
│   │   ├── ChapterReader/   # 章節閱讀器
│   │   ├── ProgressNav/     # 進度導航
│   │   └── ui/              # UI 組件庫
│   ├── hooks/
│   │   ├── useInfiniteScroll.ts      # 無限滾動 Hook
│   │   ├── useChapterProgress.ts     # 章節進度 Hook
│   │   └── useChapterPreload.ts      # 章節預載 Hook
│   ├── config/
│   │   └── chapters.json    # 章節配置檔案
│   ├── types/
│   │   └── index.ts         # TypeScript 型別定義
│   ├── utils/
│   │   └── cn.ts            # 工具函式
│   ├── styles/
│   │   └── index.css        # 全域樣式
│   ├── App.tsx              # 主應用程式組件
│   └── main.tsx             # 應用程式入口
├── index.html               # HTML 模板
├── package.json             # 專案依賴管理
├── tsconfig.json            # TypeScript 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── vite.config.ts           # Vite 配置
└── README.md                # 專案說明文件
```

## 安裝與執行

### 環境需求
- Node.js 18.0 或以上版本
- npm 或 yarn 套件管理工具

### 安裝步驟

1. **複製專案**
```bash
git clone <repository-url>
cd ISS_Newsletter_2025
```

2. **安裝依賴**
```bash
npm install
```

3. **啟動開發伺服器**
```bash
npm run dev
```

開發伺服器將在 `http://localhost:5173` 啟動

### 可用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建置生產版本 |
| `npm run preview` | 預覽建置後的網站 |
| `npm run lint` | 執行程式碼檢查 |

## 開發指南

### 新增章節

1. 在 `public/chapters/` 目錄下建立新的 HTML 檔案（例如：`chapter-09.html`）

2. 編輯 `src/config/chapters.json`，新增章節配置：

```json
{
  "id": "chapter-09",
  "order": 9,
  "title": "章節標題",
  "description": "章節描述",
  "htmlFile": "/chapters/chapter-09.html",
  "authors": ["作者名稱 / 角色"],
  "theme": "light"
}
```

### 自訂封面內容

編輯 `src/components/Cover/index.tsx` 中的 `sentences` 陣列來修改封面顯示的文字：

```typescript
const [sentences, setSentences] = useState<string[]>([
  '你的第一句話',
  '你的第二句話',
  // ...
])
```

### 調整視覺樣式

- **顏色主題**：修改 `tailwind.config.js`
- **動畫效果**：調整 `src/styles/index.css` 中的 CSS 動畫
- **組件樣式**：直接在組件中使用 Tailwind CSS 類別

## 配置說明

### 章節配置 (chapters.json)

```typescript
{
  "title": "期刊標題",
  "year": 2025,
  "chapters": [
    {
      "id": "chapter-01",           // 唯一識別碼
      "order": 1,                    // 排序順序
      "title": "章節標題",           // 章節名稱
      "description": "章節簡述",     // 章節描述
      "htmlFile": "/chapters/chapter-01.html",  // HTML 檔案路徑
      "authors": ["作者 / 角色"],    // 作者列表（可選）
      "theme": "light"               // 主題：light 或 dark
    }
  ]
}
```

### Vite 配置

專案使用 Vite 作為建置工具，配置檔案位於 `vite.config.ts`。如需調整建置選項，請參考 [Vite 官方文件](https://vitejs.dev/config/)。

## 建置與部署

### 建置生產版本

```bash
npm run build
```

建置完成後，產出檔案將位於 `dist/` 目錄。

### 部署至靜態主機

建置後的 `dist/` 目錄可直接部署至任何靜態網站主機服務：

- **Vercel**：連接 Git 儲存庫，自動部署
- **Netlify**：拖放 `dist` 資料夾或連接 Git
- **GitHub Pages**：上傳至 `gh-pages` 分支
- **自架伺服器**：將 `dist` 內容複製至網頁伺服器目錄

### 部署注意事項

1. 確保所有靜態資源路徑正確
2. 如部署至子路徑，需調整 `vite.config.ts` 中的 `base` 選項
3. 章節 HTML 檔案需放置在正確的 `chapters/` 目錄下

## 瀏覽器支援

- Chrome（最新版本）
- Firefox（最新版本）
- Safari（最新版本）
- Edge（最新版本）

建議使用現代瀏覽器以獲得最佳體驗。

## 專案背景

服務科學研究所（Institute of Service Science, ISS）自 2008 年起採用獨特的教育實踐，將人文關懷融入學習環境，連結產業與教育情境，並以理論方法產出領域相關的研究成果。

「服務聲」作為社群期刊，旨在延續學習者的想法，邀請社群成員共同創作，分享研究成果、學習經驗與反思。

## 授權

本專案為服務科學研究所社群所有。

## 聯絡方式

如有任何問題或建議，歡迎聯繫服務科學研究所。

---

**服務聲既是一個社群；也是一份期刊。服務聲延續你的想法；邀請你一起創作。**
