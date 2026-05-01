# AeroTicket 機票訂購網站

純前端的機票訂購 Demo 系統，以系統分析與設計課程的 ER Model 為基礎實作。
**無後端、無 bundler**，直接用瀏覽器開啟 `index.html` 即可運行。

---

## 快速啟動

```bash
# 任何靜態 HTTP server 皆可，例如：
npx serve .
# 或 VS Code → Live Server → 右鍵 index.html → Open with Live Server
```

> 直接雙擊 `index.html`（`file://`）**不可行**，因為 Babel standalone 以 XHR 載入 `.jsx` 檔案，
> `file://` 協議會被 CORS 阻擋。必須透過 HTTP server。

---

## 技術棧

| 項目 | 說明 |
|------|------|
| React 18 | UMD 版本，從 unpkg CDN 載入，無 npm |
| Babel Standalone | 瀏覽器內即時編譯 JSX，無需 build step |
| localStorage | 所有資料持久化（模擬資料庫） |
| 純 CSS | `style.css`，無 CSS framework |

---

## 檔案結構

```
├── index.html                   # 入口頁面，定義 <script> 載入順序
├── style.css                    # 全域樣式（CSS variables + 所有元件樣式）
├── data.js                      # Mock 資料（航空公司、航班、座位），var 宣告 → window global
├── app.jsx                      # App 根元件 + ReactDOM.render（最精簡，約 25 行）
└── components/
    ├── AuthForm.jsx              # 登入 / 註冊表單
    ├── BookingConfirmation.jsx   # 付款成功確認 banner（read-only，無 hooks）
    ├── TripLegBuilder.jsx        # 4 步驟訂票精靈
    ├── FlightSearch.jsx          # 航班搜尋 + 結果卡片（含內部 FlightLeg 子元件）
    └── JourneyManager.jsx        # 主儀表板（最大檔案，含 3 分頁邏輯）
```

---

## 模組化機制（重要）

此專案**沒有 ES Module / bundler**，各 `.jsx` 檔案透過以下慣例共享元件：

1. **每個元件檔案結尾**都有一行 `window.ComponentName = ComponentName`，將元件掛到全域。
2. **JSX 中使用其他元件**（如 `<FlightSearch />`）時，Babel 編譯後變成 `React.createElement(FlightSearch, ...)`，在 runtime 從 `window.FlightSearch` 解析。
3. **`data.js` 使用 `var` 宣告**，`var` 在 regular `<script>` 頂層會自動成為 `window.companies` 等全域變數，讓所有元件可直接存取。

### 載入順序（index.html 中固定）

```
data.js → AuthForm → BookingConfirmation → TripLegBuilder → FlightSearch → JourneyManager → app.jsx
```

**載入順序等同於依賴順序**，不可隨意調換。若加入新元件，需在 `index.html` 中按依賴關係插入對應的 `<script type="text/babel">` 標籤。

### useState 命名慣例

由於多個 Babel script 各自在獨立 eval scope 執行，理論上 `const { useState } = React` 不會衝突，但各檔案為明確起見採用重新命名的解構：

| 檔案 | 別名 |
|------|------|
| `AuthForm.jsx` | `useStateAuth` |
| `TripLegBuilder.jsx` | `useStateTLB` |
| `FlightSearch.jsx` | `useStateFS` |
| `JourneyManager.jsx` | `useStateJM`、`useEffectJM` |
| `app.jsx` | `useState`、`useEffect`（標準名） |

---

## 資料模型（localStorage keys）

所有資料存於瀏覽器 localStorage，key 如下：

| Key | 說明 | 主要欄位 |
|-----|------|----------|
| `aeroTicketUsers` | 會員帳號 | `memberID`, `memberMail`, `memberName`, `memberPassword` |
| `currentUser` | 目前登入的會員（session） | 同上 |
| `aeroTicketInfos` | 旅程資訊（Info） | `infoID`, `memberID`, `departure`, `destination` |
| `aeroTicketPassengers` | 乘客資料 | `passengerID`, `lastName`, `firstName`, `gender`, `birthDate`, `nationality` |
| `aeroTicketTripLegs` | 旅程分段（TripLeg） | `tripLegID`, `infoID`, `itineraryID`, `peopleNum`, `departureDate` |
| `aeroTicketPassengerTripLegs` | 乘客 ↔ TripLeg 關聯表 | `passengerID`, `tripLegID` |
| `aeroTicketTickets` | 機票 | `ticketID`, `infoID`, `itineraryID`, `passengerID`, `transactionID`, `cabin`, `ticketTotalPrice`, `status` |
| `aeroTicketTransactions` | 交易紀錄 | `transactionID`, `memberID`, `payment`, `transtime`, `totalAmount`, `cardDetails` |

### Ticket `status` 的狀態轉移

```
填寫乘客資料完成
        │
        ▼
    [Unpaid]  ←─ 在機票紀錄頁補付款
        │              │
  付款確認             │
        │              │
        ▼              ▼
    [Valid] ──申請退票──► [Refunded]
```

---

## 主要元件說明

### `JourneyManager` — 主儀表板

最複雜的元件，包含三個分頁：

| 分頁 | activeTab 值 | 內容 |
|------|-------------|------|
| 會員專區 | `'profile'` | 會員資料、旅程資訊（出發地/目的地）、航班搜尋入口 |
| 機票紀錄 | `'tickets'` | 所有機票列表、待付款 banner、修改艙等、申請退票 |
| 交易紀錄 | `'transactions'` | 已完成的交易（唯讀，不可修改） |

航班搜尋時 `isSearchResultView = true`，tab bar 隱藏，全版面顯示搜尋結果。

### `TripLegBuilder` — 訂票精靈（4 步驟）

| 步驟 | 說明 | 儲存時機 |
|------|------|---------|
| Step 1 | 各航段搭乘人數 | 暫存 state |
| Step 2 | 各乘客基本資料 | 暫存 state |
| Step 3 | 各乘客選擇艙等 | **提交時寫入 localStorage**（status: `Unpaid`） |
| Step 4 | 信用卡付款（可略過） | 付款 → 建立 Transaction，更新 tickets 為 `Valid`；略過 → 維持 `Unpaid` |

Step 3 提交後資料即持久化，Step 4 只決定是否立即付款。

### `FlightSearch`

- 將使用者輸入的城市名稱（台北、紐約…）轉換為 IATA 代碼（TPE、JFK…）
- 紐約視為 JFK / EWR 兩機場皆可
- 搜尋結果分為**直飛**與**一停轉機**兩種，點選後進入 `TripLegBuilder`
- 訂票完成後呼叫 `onBookingComplete(transactionID | null)` 回報 `JourneyManager`

### `BookingConfirmation`

純展示元件，無 hooks，直接從 localStorage 讀取資料並渲染。不接受任何會修改資料的操作。

---

## Mock 資料說明（`data.js`）

目前提供 4 條航線（均以 TPE 出發）：

| 航班 | 航線 | 類型 |
|------|------|------|
| BR032 | TPE → JFK | 直飛 |
| CI012 | TPE → JFK | 直飛 |
| JL802 + JL004 | TPE → NRT → JFK | 轉機（搜尋 TPE→JFK 時出現） |
| CI004 + UA884 | TPE → SFO → EWR | 轉機（搜尋 TPE→NYC 時出現） |

要新增航線：在 `data.js` 的 `itineraries` 和 `dailyItineraries` 兩個陣列中同步新增即可。

---

## 升級至有 bundler 的環境

若日後要遷移到 Vite / webpack：

1. `window.X = X` → `export default X`
2. `var companies = ...`（data.js）→ `export const companies = ...`
3. 各元件加上對應的 `import` 語句
4. 移除 index.html 中的 Babel standalone `<script>` 與各 `text/babel` 標籤
5. 改用 `npm install react react-dom` + 標準 JSX transform

元件本身的邏輯**不需要修改**。
