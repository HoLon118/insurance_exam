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