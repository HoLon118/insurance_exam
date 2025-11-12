/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: [
    // "./*.{html,js}"  假設您的 HTML/JS 檔案在根目錄
    // "./*.{html,js}",
    // 如果在 src 資料夾，就用 "./src/**/*.{html,js}"
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./public/**/*.{html,js}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}