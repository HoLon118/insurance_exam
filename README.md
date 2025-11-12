# URL
https://quiz-app-dbace.web.app/

# What is this?
這是一個小型的模擬試題系統，內容包含:

1. 讀取題庫  
2. 選擇想要測驗的科目  
3. 選取章節(可選)  
4. 選擇練習的題目數量(預設20題)  
5. 作答/顯示詳解/提前結束  
6. 計算分數  

# How to Deploy It in Your Own PC
1. 確保喜統已安裝Node.js或Python

2. 開啟終端機，進入到public資料夾中  
  cd .../public

3. 啟動server

    - 使用npm/npx  

      npx http-server

    - 使用python  

      python -m http.server

4. 打開瀏覽器，在網址列輸入:

    localhost:8000  

    或者  

    127.0.0.1:8000  

    p.s. 具體使用 "8000" or "8080" 等... 視伺服器實際建置的port而定

5. 成功開啟網頁之後，就可以開始練習題目了

## License and Attribution (授權與歸屬)

本專案採用雙重授權模式：程式碼與內容分開授權。

### Code & Design License (程式碼與設計授權)

本專案的程式碼和介面設計部分，採用 **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** 授權。

這意味著：您可以自由地分享、修改本程式碼，**但僅限於非商業用途**，且必須註明作者 (Holon118)。

* **Code & Design Copyright © 2025 Holon118. Licensed under CC BY-NC 4.0.**

### Content & Questions Copyright (內容與題目版權)

本系統內部的考題和資料內容（Content/Data）並非本專案作者原創。所有內容版權歸原始提供者所有，並保留所有權利。使用者在使用內容時需遵守其原始版權規範。

* **Content Copyright © 2016 中華民國人壽保險管理學會. All rights reserved.**

