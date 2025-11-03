# Firebase 設置指南

## 步驟 1：創建 Firebase 項目

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」
3. 輸入專案名稱（例如：ISS Newsletter 2025）
4. 選擇是否啟用 Google Analytics（可選）
5. 點擊「建立專案」

## 步驟 2：添加 Web 應用

1. 在 Firebase 專案頁面，點擊「Web」圖標 `</>`
2. 輸入應用暱稱（例如：ISS Newsletter Web）
3. 點擊「註冊應用程式」
4. 複製 Firebase 配置代碼

## 步驟 3：設置 Firestore 數據庫

1. 在左側選單點擊「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇「以測試模式啟動」（開發階段使用）
4. 選擇數據庫位置（建議選擇 `asia-east1` 台灣）
5. 點擊「啟用」

## 步驟 4：配置安全規則（重要！）

在 Firestore 的「規則」頁面，使用以下規則：

### 基本規則（僅允許讀取和創建）

如果不需要管理功能，使用以下規則：

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coverSentences/{document=**} {
      // 允許所有人讀取
      allow read: if true;
      // 允許所有人創建新句子，但有長度限制
      allow create: if request.resource.data.text.size() <= 200;
      // 不允許更新或刪除
      allow update, delete: if false;
    }
  }
}
\`\`\`

### 進階規則（啟用管理功能）

如果需要使用管理頁面 (`/admin`) 來編輯和刪除內容，使用以下規則：

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coverSentences/{document=**} {
      // 允許所有人讀取
      allow read: if true;
      // 允許所有人創建新句子，但有長度限制
      allow create: if request.resource.data.text.size() <= 200
                    && request.resource.data.text.size() >= 1;
      // 允許更新和刪除（由管理頁面的密碼保護）
      allow update: if request.resource.data.text.size() <= 200
                    && request.resource.data.text.size() >= 1;
      allow delete: if true;
    }
  }
}
\`\`\`

**注意**：管理頁面使用前端密碼保護（密碼：713580），但 Firestore 規則本身允許所有更新和刪除操作。這是一個簡化的安全模型，適合內部使用。如需更高安全性，建議使用 Firebase Authentication。

## 步驟 5：配置環境變數

1. 複製 `.env.example` 為 `.env`：
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. 將 Firebase 配置填入 `.env` 文件：
   \`\`\`
   VITE_FIREBASE_API_KEY=你的_api_key
   VITE_FIREBASE_AUTH_DOMAIN=你的_auth_domain
   VITE_FIREBASE_PROJECT_ID=你的_project_id
   VITE_FIREBASE_STORAGE_BUCKET=你的_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=你的_messaging_sender_id
   VITE_FIREBASE_APP_ID=你的_app_id
   \`\`\`

3. 重新啟動開發伺服器：
   \`\`\`bash
   npm run dev
   \`\`\`

## 步驟 6：測試功能

1. 打開應用的首頁
2. 在底部輸入框輸入一段文字
3. 提交後，文字應該會出現在背景中
4. 打開另一個瀏覽器或無痕模式，應該能看到相同的內容
5. 實時更新：在一個視窗輸入，另一個視窗應該即時顯示

## 安全性建議

### 生產環境設置

當準備部署到生產環境時，請更新 Firestore 安全規則：

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coverSentences/{document=**} {
      allow read: if true;
      allow create: if request.resource.data.text.size() <= 200
                    && request.resource.data.text.size() >= 1;
      allow update, delete: if false;
    }
  }
}
\`\`\`

### 配額管理

免費方案包含：
- 每天 50,000 次讀取
- 每天 20,000 次寫入
- 1 GB 儲存空間

如果流量較大，可以考慮：
1. 設置讀取緩存
2. 限制寫入頻率（目前未實作）
3. 升級到付費方案

## 故障排除

### 錯誤：Permission denied

- 檢查 Firestore 安全規則是否正確設置
- 確認已啟用 Firestore 數據庫

### 錯誤：Firebase not initialized

- 檢查 `.env` 文件是否存在且配置正確
- 確認環境變數以 `VITE_` 開頭
- 重新啟動開發伺服器

### 句子沒有顯示

- 打開瀏覽器開發者工具，檢查 Console 是否有錯誤
- 確認 Firebase 配置正確
- 檢查網路連接

## 數據管理

### 查看數據

在 Firebase Console 的 Firestore Database 頁面可以：
- 查看所有已提交的句子
- 手動刪除不適當的內容
- 查看創建時間

### 清理數據

如需清理所有數據，可以在 Firestore 中手動刪除 `coverSentences` collection。

### 備份數據

建議定期備份 Firestore 數據：
1. 前往 Firebase Console
2. 選擇 Firestore Database
3. 點擊「匯出」

## 管理頁面使用

### 訪問管理頁面

1. 在瀏覽器中訪問 `http://localhost:5173/admin`（開發環境）
2. 或訪問 `https://your-domain.com/admin`（生產環境）
3. 輸入密碼：`713580`
4. 點擊「登入」

### 管理功能

管理頁面提供以下功能：

1. **查看所有內容**
   - 顯示所有用戶提交的句子
   - 按創建時間升序排列
   - 顯示創建時間戳

2. **編輯內容**
   - 點擊任一內容的「編輯」按鈕
   - 修改文字內容
   - 點擊「儲存」保存更改，或「取消」放棄修改
   - 實時同步到所有查看頁面的用戶

3. **刪除內容**
   - 點擊任一內容的「刪除」按鈕
   - 確認刪除操作
   - 刪除後所有用戶立即看到更新

### 重要提醒

- 管理頁面需要配置「進階規則」才能正常工作
- 密碼僅在前端驗證，請妥善保管
- 編輯和刪除操作會立即影響所有用戶
- 刪除操作無法撤銷，請謹慎操作
