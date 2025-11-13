# 📝 保險與金融問答 App (Insurance & Finance Quiz App)

**線上預覽網址 (URL):** [https://quiz-app-dbace.web.app/](https://quiz-app-dbace.web.app/)

## 🌟 專案概述 (Overview)

這是一個小型的、專門為保險法規、保險實務與金融常識考試設計的模擬試題系統. 本系統採用清晰的兩層菜單結構，旨在提供高效、專注的題目練習體驗.

## ✨ 主要功能 (Features)

本系統提供以下核心功能:

* **分科目測驗：** 選擇想要測驗的科目 (保險法規、保險實務、金融常識).
* **多層次選單：** 清晰劃分科目選擇與操作模式 (測驗/瀏覽).
* **靈活出題：** 可選取特定章節進行練習 (可選), 並選擇練習的題目數量 (預設20題).
* **學習工具：** * 作答後可即時顯示詳解.
    * 支援使用者自訂**筆記 (Note)**，並透過「查閱筆記」模式集中複習所有已備註的題目.
    * 支援題目**收藏 (Bookmark)** 功能，並透過「已標記的題目」模式集中複習.
* **快速查閱模式：** 支援直接瀏覽整個題庫、查閱所有筆記或篩選已收藏的題目.
* **結果統計：** 測驗結束後計算總分數，並提供分章節的答題分析.
* **操作控制：** 支援隨時提前結束測驗.

## 🚀 本地部署指南 (How to Deploy It in Your Own PC)

若您想在本地電腦上運行此模擬試題系統，請依照以下步驟操作：

1.  **環境要求：** 確保您的系統已安裝 **Node.js** 或 **Python**.

2.  **進入專案目錄：** 開啟終端機 (Terminal/Command Prompt)，進入到 `public` 資料夾中:
    ```bash
    cd ...(你的路徑)/public
    ```

3.  **啟動本地伺服器 (Start the Server):**
    您可以選擇使用 `npm/npx` 或 `python` 來啟動一個簡易的本地伺服器:

    * **使用 npm/npx:**
        ```bash
        npx http-server
        ```

    * **使用 Python:**
        ```bash
        python -m http.server
        ```

4.  **開啟網頁：** 打開您的瀏覽器，在網址列輸入:
    ```
    localhost:8000
    ```
    或者
    ```
    127.0.0.1:8000
    ```
    > **備註:** 具體使用的 Port (例如 `8000` 或 `8080`) 視伺服器實際建置的 Port 而定.

5.  **開始練習：** 成功開啟網頁後，即可開始使用系統進行題目練習.

## 📜 授權與歸屬 (License and Attribution)

本專案採用**雙重授權模式**，程式碼與內容分開授權。

### 程式碼與設計授權 (Code & Design License)

本專案的程式碼和介面設計部分，採用 **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** 授權.

您可以自由地分享、修改本程式碼，但 **僅限於非商業用途**，且必須註明作者 (Holon118).

**Code & Design Copyright © 2025 Holon118. Licensed under CC BY-NC 4.0.**

### 內容與題目版權 (Content & Questions Copyright)

本系統內部的考題和資料內容（Content/Data）並非本專案作者原創. 所有內容版權歸原始提供者所有，並保留所有權利. 使用者在使用內容時需遵守其原始版權規範.

**Content Copyright © 2016 中華民國人壽保險管理學會. All rights reserved.**