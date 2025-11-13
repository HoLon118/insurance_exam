// --- 狀態變數 ---
let lawQuestionsCache = [];
let practiceQuestionsCache = [];
let marketQuestionsCache = []; // [NEW] 新增金融常識快取
let chapterMap = new Map();

// [NEW] 追蹤當前選中的科目 ('law', 'practice', 'market')
let currentSubject = ''; 

// --- 狀態變數 ---
// [FIX] 確保 LocalStorage 在每次啟動時正確加載
let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]')); 
let userExplanations = JSON.parse(localStorage.getItem('userExplanations') || '{}'); 

let allQuestions = [], questions = [], currentQuestionIndex = 0, score = 0, scoreData = {};
let browseQuestions = [], currentBrowseIndex = 0; 


// --- DOM 元素 ---
const mainTitle = document.querySelector('h1'); 
const loadingText = document.getElementById('loading-text');

// [MODIFIED] 主選單 (科目選擇) 按鈕 - 舊ID被移除，使用新的
const typeSelectionContainer = document.getElementById('type-selection-container');
const mainLawBtn = document.getElementById('main-law-btn'); // 新主選單按鈕
const mainPracticeBtn = document.getElementById('main-practice-btn'); // 新主選單按鈕
const mainMarketBtn = document.getElementById('main-market-btn'); // 新主選單按鈕

// [NEW] 子選單 (操作選擇) DOM 元素
const subjectSelectionContainer = document.getElementById('subject-selection-container');
const subjectTitle = document.getElementById('subject-title');
const quizBtn = document.getElementById('quiz-btn');
const browseAllBtn = document.getElementById('browse-all-btn');
const notesBtn = document.getElementById('notes-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const backToSubjectMenuBtn = document.getElementById('back-to-subject-menu-btn'); // 回到第一層

const selectionContainer = document.getElementById('selection-container');
const quizContainer = document.getElementById('quiz-container');
const scoreContainer = document.getElementById('score-container');

const browseContainer = document.getElementById('browse-container');
const browseMeta = document.getElementById('browse-meta');
const browseQuestion = document.getElementById('browse-question');
const browseExplanation = document.getElementById('browse-explanation');
const browseNav = document.getElementById('browse-nav');
const browsePrevBtn = document.getElementById('browse-prev-btn');
const browseNextBtn = document.getElementById('browse-next-btn');
const browseJumpInput = document.getElementById('browse-jump-input');
const browseRestartBtn = document.getElementById('browse-restart-btn');


const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackText = document.getElementById('feedback-text');
const explanationText = document.getElementById('explanation-text');
const nextBtn = document.getElementById('next-btn');
const endQuizBtn = document.getElementById('end-quiz-btn');
const scoreText = document.getElementById('score-text');
const scoreAnalysis = document.getElementById('score-analysis');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn'); // 此按鈕現在回到 sub-menu

const questionCountInput = document.getElementById('question-count');
const totalQuestionsInfo = document.getElementById('total-questions-info');
const progressBar = document.getElementById('progress-bar');
const questionMeta = document.getElementById('question-meta');

const chapterButtonsContainer = document.getElementById('chapter-buttons-container');
const selectAllBtn = document.getElementById('select-all-btn');
const deselectAllBtn = document.getElementById('deselect-all-btn');

// [NEW/MODIFIED] 收藏/筆記相關 DOM 元素 - 作答區
const favoriteBtn = document.getElementById('favorite-btn');
const noteBtn = document.getElementById('note-btn');
const explanationEditor = document.getElementById('explanation-editor'); 
const editControlsDesktop = document.getElementById('edit-controls-desktop');
const saveExplanationDesktopBtn = document.getElementById('save-explanation-desktop-btn');
const cancelExplanationDesktopBtn = document.getElementById('cancel-explanation-desktop-btn');
const editControlsMobile = document.getElementById('edit-controls-mobile');
const saveExplanationMobileBtn = document.getElementById('save-explanation-mobile-btn');
const cancelExplanationBtn = document.getElementById('cancel-explanation-btn');

// [NEW] 收藏/筆記相關 DOM 元素 - 瀏覽區
const browseFavoriteBtn = document.getElementById('browse-favorite-btn');
const browseNoteBtn = document.getElementById('browse-note-btn');
const browseExplanationEditor = document.getElementById('browse-explanation-editor');
const browseEditControlsDesktop = document.getElementById('browse-edit-controls-desktop');
const browseSaveDesktopBtn = document.getElementById('browse-save-desktop-btn');
const browseCancelDesktopBtn = document.getElementById('browse-cancel-desktop-btn');
const browseEditControlsMobile = document.getElementById('browse-edit-controls-mobile');
const browseSaveMobileBtn = document.getElementById('browse-save-mobile-btn');
const browseCancelMobileBtn = document.getElementById('browse-cancel-mobile-btn');


// --- 輔助函數 ---

// [NEW] 獲取科目資訊
function getSubjectInfo(subject) {
    switch (subject) {
        case 'law': return { name: '保險法規', path: 'questions_law.json', cache: lawQuestionsCache, setCache: (data) => { lawQuestionsCache = data; } };
        case 'practice': return { name: '保險實務', path: 'questions_practices.json', cache: practiceQuestionsCache, setCache: (data) => { practiceQuestionsCache = data; } };
        case 'market': return { name: '金融常識', path: 'questions_market.json', cache: marketQuestionsCache, setCache: (data) => { marketQuestionsCache = data; } };
        default: return null;
    }
}

// [MODIFIED] 禁用按鈕列表
function setMenuButtonsDisabled(disabled) { 
    mainLawBtn.disabled = disabled;
    mainPracticeBtn.disabled = disabled;
    mainMarketBtn.disabled = disabled;
    
    // 子選單按鈕
    quizBtn.disabled = disabled;
    browseAllBtn.disabled = disabled;
    notesBtn.disabled = disabled;
    favoritesBtn.disabled = disabled;
    backToSubjectMenuBtn.disabled = disabled;
}

// [NEW] 處理第一層科目選擇
function handleSubjectSelect(e) {
    // [FIX] 使用 e.currentTarget 確保我們拿到的是綁定事件監聽器的按鈕元素
    const subject = e.currentTarget.dataset.subject;
    const info = getSubjectInfo(subject);

    if (!info) {
        return; 
    }

    currentSubject = subject;
    
    // 設置第二層選單標題
    subjectTitle.textContent = `【${info.name}】`;

    // 進行畫面切換
    typeSelectionContainer.classList.add('hidden');
    subjectSelectionContainer.classList.remove('hidden');
}

// [MODIFIED] 處理第二層操作選擇 (移除不必要的畫面隱藏)
async function handleActionSelect(e) {
    // 使用事件代理，確保點擊到按鈕
    const selectedButton = e.target.closest('button');
    if (!selectedButton) return;
    
    const actionType = selectedButton.dataset.type;
    const info = getSubjectInfo(currentSubject);

    if (!info || !actionType) {
        // 如果沒有 currentSubject 或 actionType，可能是點擊了 backToSubjectMenuBtn 或容器空白處
        return;
    }

    if (actionType === 'quiz') {
        // 測驗模式：載入問題並進入章節選擇畫面
        await loadQuestions(info.path);
        
        // 測驗載入成功後，直接進入 selection-container
        subjectSelectionContainer.classList.add('hidden');
        selectionContainer.classList.remove('hidden');

    } else {
        // 瀏覽模式：直接載入過濾後的題庫
        // loadFilteredBrowseQuestions 將處理所有畫面切換
        await loadFilteredBrowseQuestions(info.path, actionType);
    }
}

// [NEW] 回到第二層選單 (從章節選擇/測驗設定畫面返回)
function backToSubjectMenu() {
    selectionContainer.classList.add('hidden');
    subjectSelectionContainer.classList.remove('hidden');
    
    // 恢復主標題到科目操作選單的狀態
    const info = getSubjectInfo(currentSubject);
    if (info) {
        mainTitle.textContent = `保險與金融 問答 App`; 
    }
}


function getChapterValue(chapterName) {
    if (chapterName === '附錄') return 999;
    const match = chapterName.match(/第(.*)章/);
    if (!match || !match[1]) return 1000;
    const numeral = match[1];
    const chapterMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    return chapterMap[numeral] || 1001; 
}

function populateChapterSelectors(questionsData) {
    chapterMap.clear();
    chapterButtonsContainer.innerHTML = '';

    const isMarketQuiz = questionsData.some(q => !q.category || q.category.trim() === '');
    
    for (const q of questionsData) {
        const category = q.category && q.category.trim() !== '' ? q.category : '金融常識';
        chapterMap.set(category, (chapterMap.get(category) || 0) + 1);
    }

    const sortedChapters = [...chapterMap.keys()].sort(getChapterValue);

    for (const chapter of sortedChapters) {
        const count = chapterMap.get(chapter);
        const btn = document.createElement('button');
        btn.className = 'chapter-btn selected'; // 預設選取
        btn.dataset.category = chapter;
        btn.textContent = `${chapter} (${count}題)`;
        chapterButtonsContainer.appendChild(btn);
    }
    
    updateSelectedTotal();
}

function updateSelectedTotal() {
    let selectedCount = 0;
    const selectedCategories = new Set();
    
    document.querySelectorAll('.chapter-btn.selected').forEach(btn => {
        const category = btn.dataset.category;
        selectedCategories.add(category);
        selectedCount += chapterMap.get(category) || 0;
    });

    totalQuestionsInfo.textContent = `已選 ${selectedCount} 題 (題庫共 ${allQuestions.length} 題)`;
    questionCountInput.max = selectedCount;
    
    const currentVal = parseInt(questionCountInput.value);

    if (selectedCount === 0) {
        questionCountInput.value = '';
    } 
    else if (isNaN(currentVal) || currentVal > selectedCount || currentVal <= 0) {
        questionCountInput.value = Math.min(20, selectedCount);
    }
}

function handleChapterToggle(e) {
    if (e.target.classList.contains('chapter-btn')) {
        e.target.classList.toggle('selected');
        updateSelectedTotal();
    }
}

function handleSelectAll() {
    document.querySelectorAll('.chapter-btn').forEach(btn => btn.classList.add('selected'));
    updateSelectedTotal();
}

function handleDeselectAll() {
    document.querySelectorAll('.chapter-btn').forEach(btn => btn.classList.remove('selected'));
    updateSelectedTotal();
}

// [MODIFIED] loadQuestions 配合新流程
async function loadQuestions(jsonPath) {
    const info = getSubjectInfo(currentSubject);
    if (!info) return;

    try {
        if (info.cache.length > 0) {
            allQuestions = info.cache;
            populateChapterSelectors(allQuestions);
            mainTitle.textContent = `【${info.name}】測驗設定`; 
            return;
        }

        loadingText.classList.remove('hidden');
        setMenuButtonsDisabled(true); 
        
        const response = await fetch(jsonPath); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const processedData = data.map(q => ({
            ...q,
            category: (q.category && q.category.trim() !== '') ? q.category : '金融常識'
        }));
        
        info.setCache(processedData);
        allQuestions = processedData;
        
        mainTitle.textContent = `【${info.name}】測驗設定`; 
        populateChapterSelectors(allQuestions);

    } catch (error) {
        console.error(`無法載入題庫 ${jsonPath}:`, error);
        loadingText.textContent = `題庫 ${jsonPath} 載入失敗。`;
    } finally {
        loadingText.classList.add('hidden');
        setMenuButtonsDisabled(false);
    }
}

// [MODIFIED] loadFilteredBrowseQuestions 配合新流程 (修復無資料時畫面清空問題)
async function loadFilteredBrowseQuestions(jsonPath, mode = 'all') {
    let titlePrefix = '瀏覽';
    let filterFn = q => true; 

    if (mode === 'notes') {
        titlePrefix = '筆記查閱';
        filterFn = q => !!userExplanations[q.id.toString()];
    } else if (mode === 'favorites') {
        titlePrefix = '收藏查閱';
        filterFn = q => favorites.has(q.id.toString());
    }

    const info = getSubjectInfo(currentSubject);
    if (!info) return;

    try {
        let targetCache = info.cache;
        
        // 確保題庫已載入
        if (targetCache.length === 0) {
            loadingText.classList.remove('hidden');
            setMenuButtonsDisabled(true);
            
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            const processedData = data.map(q => ({
                ...q,
                category: (q.category && q.category.trim() !== '') ? q.category : '金融常識'
            }));
            info.setCache(processedData);
            targetCache = processedData; 
            setMenuButtonsDisabled(false);
        }

        browseQuestions = targetCache
            .filter(filterFn)
            .sort((a, b) => a.id - b.id);
        
        if (browseQuestions.length === 0) {
             alert(`查無相關題目！\n\n您尚未對 【${info.name}】 ${titlePrefix} 項目做任何標記或筆記。`);
             
             // [FIX] 無資料時，確保 subjectSelectionContainer 是可見的
             subjectSelectionContainer.classList.remove('hidden');
             return; 
        }

        currentBrowseIndex = 0;
        mainTitle.textContent = `${titlePrefix} 【${info.name}】`; 
        subjectSelectionContainer.classList.add('hidden');
        browseContainer.classList.remove('hidden');
        showBrowseQuestion();

    } catch (error) {
        console.error(`無法載入瀏覽題庫 ${jsonPath}:`, error);
        loadingText.textContent = `題庫 ${jsonPath} 載入失敗。`;
        // 如果載入失敗，也返回第二層選單
        subjectSelectionContainer.classList.remove('hidden');
    } finally {
        loadingText.classList.add('hidden');
        setMenuButtonsDisabled(false);
    }
}

// [MODIFIED] loadBrowseQuestions 配合新流程
async function loadBrowseQuestions(jsonPath) {
    // 這裡實際上已經不再使用，因為操作是透過 handleActionSelect 觸發 loadFilteredBrowseQuestions
    await loadFilteredBrowseQuestions(jsonPath, 'all'); 
}


// [FIX/MODIFIED] 閱覽頁面顯示使用者筆記，統一格式
function showBrowseQuestion() {
    if (browseQuestions.length === 0) return;
    const q = browseQuestions[currentBrowseIndex];
    const questionId = q.id.toString(); 
    
    // 重設編輯器狀態
    browseExplanationEditor.classList.add('hidden');
    browseEditControlsMobile.classList.add('hidden');
    browseEditControlsDesktop.classList.add('hidden');
    
    browseMeta.textContent = `題號: #${q.id} | 章節: ${q.category}`;
    browseQuestion.textContent = q.question;
    
    // [MODIFIED] 統一格式
    let explanationContent = `解答：${q.answer}`;
    
    explanationContent += `\n\n詳解：\n${(q.explanation && q.explanation.trim() !== '') ? q.explanation : '無'}`;
    
    explanationContent += `\n\n筆記：\n${(userExplanations[questionId] && userExplanations[questionId].trim() !== '') ? userExplanations[questionId] : '無'}`;
    
    browseExplanation.textContent = explanationContent;
    
    // 更新圖示狀態
    updateIconState(questionId);

    browsePrevBtn.disabled = (currentBrowseIndex === 0);
    browseNextBtn.disabled = (currentBrowseIndex === browseQuestions.length - 1);
}

function handleBrowsePrev() {
    if (currentBrowseIndex > 0) {
        // 確保編輯器已關閉
        if (!browseExplanationEditor.classList.contains('hidden')) {
            cancelBrowseExplanationEdit();
        }
        currentBrowseIndex--;
        showBrowseQuestion();
    }
}
function handleBrowseNext() {
    if (currentBrowseIndex < browseQuestions.length - 1) {
        // 確保編輯器已關閉
        if (!browseExplanationEditor.classList.contains('hidden')) {
            cancelBrowseExplanationEdit();
        }
        currentBrowseIndex++;
        showBrowseQuestion();
    }
}
function handleBrowseJump(e) {
     if (e.key !== 'Enter') return;
    const targetId = browseJumpInput.value;
    if (!targetId) return;
    const index = browseQuestions.findIndex(q => q.id.toString() === targetId);
    if (index !== -1) {
        currentBrowseIndex = index;
    } else {
        currentBrowseIndex = 0;
    }
    showBrowseQuestion();
    browseJumpInput.value = ''; 
}

function shuffleArray(array) {
    let shuffled = [...array]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function startQuiz() {
    const selectedCategories = new Set(
        Array.from(document.querySelectorAll('.chapter-btn.selected'))
             .map(btn => btn.dataset.category)
    );

    if (selectedCategories.size === 0) {
        alert('請至少選擇一個章節！');
        return;
    }

    // [MODIFIED] 確保沒有 category 的題目被歸類到 '金融常識'
    const availableQuestions = allQuestions.filter(q => {
        const category = q.category && q.category.trim() !== '' ? q.category : '金融常識';
        return selectedCategories.has(category);
    });
    
    const numQuestions = parseInt(questionCountInput.value);

    if (isNaN(numQuestions) || numQuestions <= 0 || numQuestions > availableQuestions.length) {
        alert(`請輸入有效的題目數量 (1 到 ${availableQuestions.length} 之間)。`);
        return;
    }

    const selectedQuestions = shuffleArray(availableQuestions).slice(0, numQuestions);
    questions = selectedQuestions.sort((a, b) => a.id - b.id);
    
    currentQuestionIndex = 0;
    score = 0;
    scoreData = {}; 
    
    selectionContainer.classList.add('hidden');
    scoreContainer.classList.add('hidden'); 
    quizContainer.classList.remove('hidden');
    
    showQuestion();
}

// [MODIFIED] 作答區顯示題目，統一格式
function showQuestion() {
    resetState(); // *** resetState 會顯示「提前結束」按鈕 ***
    if (currentQuestionIndex >= questions.length) {
        showScore(false); // *** 修改：傳入 false (正常結束) ***
        return;
    }
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    const currentQuestion = questions[currentQuestionIndex];
    
    const info = getSubjectInfo(currentSubject);
    // [MODIFIED] 確保主標題顯示當前科目和進度
    mainTitle.textContent = `${info ? info.name : '測驗中'} - 第 ${currentQuestionIndex + 1} 題`;

    // [MODIFIED] 調整 meta 顯示
    questionMeta.querySelector('.meta-text').textContent = `題號: #${currentQuestion.id} | 章節: ${currentQuestion.category}`;
    questionText.textContent = currentQuestion.question;
    
    // 更新圖示狀態
    const questionId = currentQuestion.id.toString();
    updateIconState(questionId);
    
    // 預設隱藏詳解編輯器和控制項
    explanationEditor.classList.add('hidden');
    explanationEditor.textContent = ''; 
    editControlsMobile.classList.add('hidden');
    editControlsDesktop.classList.add('hidden');
}

// [NEW] 統一更新收藏/筆記按鈕狀態的函數
function updateIconState(questionId) {
    // 檢查作答區按鈕是否存在
    if (favoriteBtn && noteBtn) {
        favoriteBtn.classList.toggle('selected', favorites.has(questionId));
        noteBtn.classList.toggle('selected', !!userExplanations[questionId]);
    }
    // 檢查瀏覽區按鈕是否存在
    if (browseFavoriteBtn && browseNoteBtn) {
        browseFavoriteBtn.classList.toggle('selected', favorites.has(questionId));
        browseNoteBtn.classList.toggle('selected', !!userExplanations[questionId]);
    }
}

function resetState() {
    nextBtn.classList.add('hidden'); 
    endQuizBtn.classList.remove('hidden'); // *** 修改：顯示「提前結束」按鈕 ***
    
    feedbackText.textContent = ''; 
    explanationText.textContent = ''; 
    explanationText.classList.add('hidden');
    
    // [NEW] 確保編輯器相關按鈕隱藏
    explanationEditor.classList.add('hidden');
    editControlsMobile.classList.add('hidden');
    editControlsDesktop.classList.add('hidden');
    noteBtn.classList.remove('hidden'); // 確保筆記按鈕可見
    
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');
    });
}

// [MODIFIED] 作答區選擇答案，統一格式
function selectAnswer(e) {
    const selectedButton = e.target;
    const selectedValue = selectedButton.dataset.value; 
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer; 
    const category = currentQuestion.category;
    const questionId = currentQuestion.id.toString(); // [NEW] 獲取題目 ID
    
    // [MODIFIED] 確保沒有 category 的題目被歸類到 '金融常識'
    const finalCategory = category && category.trim() !== '' ? category : '金融常識';
    
    if (!scoreData[finalCategory]) {
        scoreData[finalCategory] = { correct: 0, total: 0 };
    }
    scoreData[finalCategory].total++;
    
    if (selectedValue === correctAnswer) {
        selectedButton.classList.add('correct');
        feedbackText.textContent = '答對了！ 🎉';
        feedbackText.style.color = '#10B981';
        score++; 
        scoreData[finalCategory].correct++; 
    } else {
        selectedButton.classList.add('incorrect');
        feedbackText.textContent = `答錯了。`;
        feedbackText.style.color = '#EF4444';
    }
    
    // [MODIFIED] 處理詳解：統一格式
    let explanationContent = `解答：${currentQuestion.answer}`;
    
    explanationContent += `\n\n詳解：\n${(currentQuestion.explanation && currentQuestion.explanation.trim() !== '') ? currentQuestion.explanation : '無'}`;
    
    explanationContent += `\n\n筆記：\n${(userExplanations[questionId] && userExplanations[questionId].trim() !== '') ? userExplanations[questionId] : '無'}`;
    
    explanationText.textContent = explanationContent;

    explanationText.classList.remove('hidden');
    Array.from(optionsContainer.children).forEach(button => {
        if (button.dataset.value === correctAnswer) {
            button.classList.add('correct');
        }
        button.disabled = true; 
    });
    
    // [NEW] 確保點擊選項後，筆記按鈕可見，但編輯器和控制項隱藏
    explanationEditor.classList.add('hidden');
    editControlsMobile.classList.add('hidden');
    editControlsDesktop.classList.add('hidden');
    noteBtn.classList.remove('hidden');
    
    endQuizBtn.classList.add('hidden'); // *** 修改：隱藏「提前結束」按鈕 ***
    nextBtn.classList.remove('hidden'); // *** 修改：顯示「下一題」按鈕 ***
}

// *** 修改：整個 showScore 函數 ***
function showScore(isEarlyExit = false) {
    quizContainer.classList.add('hidden');
    scoreContainer.classList.remove('hidden');
    endQuizBtn.classList.add('hidden'); // 確保按鈕在計分板上是隱藏的

    // 根據是否提前結束，決定總題數
    // currentQuestionIndex 是「已完成」的題數 (因為它是從 0 開始的索引)
    const totalQuestions = isEarlyExit ? currentQuestionIndex : questions.length;

    // 處理 0 題的特殊情況
    if (totalQuestions === 0) {
        scoreText.textContent = "您尚未回答任何題目。";
    } else {
        // 顯示分數
        scoreText.textContent = `你答對了 ${score} / ${totalQuestions} 題`;
    }

    // 清空舊的分析
    while (scoreAnalysis.children.length > 1) { 
        scoreAnalysis.removeChild(scoreAnalysis.lastChild);
    }
    
    // 排序章節
    const categories = Object.keys(scoreData).sort((a, b) => {
        // [MODIFIED] 處理金融常識題目沒有章節的情況
        return getChapterValue(a) - getChapterValue(b);
    });
    
    // 顯示各章節分析
    if (categories.length === 0) {
         const div = document.createElement('div');
         div.textContent = "沒有作答紀錄。";
         scoreAnalysis.appendChild(div);
    } else {
        categories.forEach(category => {
            const data = scoreData[category];
            const accuracy = (data.correct / data.total) * 100;
            const div = document.createElement('div');
            div.innerHTML = `<strong>${category}:</strong> ${data.correct} / ${data.total} <span class="font-medium">(${accuracy.toFixed(0)}%)</span>`;
            scoreAnalysis.appendChild(div);
        });
    }
}
// *** 修改結束 ***


function handleNextButton() {
    currentQuestionIndex++; 
    showQuestion(); 
}

// [MODIFIED] 重新開始 (回到主選單)
function handleRestart() {
    scoreContainer.classList.add('hidden');
    quizContainer.classList.add('hidden'); 
    selectionContainer.classList.add('hidden');
    browseContainer.classList.add('hidden'); 
    subjectSelectionContainer.classList.add('hidden'); // 隱藏第二層
    
    typeSelectionContainer.classList.remove('hidden'); // 顯示第一層
    
    mainTitle.textContent = '保險與金融 問答 App'; // [MODIFIED] 配合新的應用程式名稱
    currentSubject = '';
    
    questionCountInput.value = ''; 
    
    chapterMap.clear();
    chapterButtonsContainer.innerHTML = '';
}

// [NEW] 收藏功能 - 通用邏輯
function toggleFavoriteGeneric(isBrowseMode) {
    const questionsList = isBrowseMode ? browseQuestions : questions;
    const currentIndex = isBrowseMode ? currentBrowseIndex : currentQuestionIndex;
    
    if (questionsList.length === 0) return;
    const questionId = questionsList[currentIndex].id.toString();
    
    if (favorites.has(questionId)) {
        favorites.delete(questionId);
    } else {
        favorites.add(questionId);
    }
    
    // 確保資料被儲存
    localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
    
    // 更新所有相關按鈕的狀態
    updateIconState(questionId);
}

// [NEW] 筆記功能 (切換編輯/顯示狀態) - 作答區
function toggleExplanationEdit() {
    toggleExplanationEditGeneric(false);
}

// [NEW] 筆記功能 (切換編輯/顯示狀態) - 瀏覽區
function toggleBrowseExplanationEdit() {
    toggleExplanationEditGeneric(true);
}

// [NEW] 筆記功能 (切換編輯/顯示狀態) - 通用邏輯
function toggleExplanationEditGeneric(isBrowseMode) {
    const questionsList = isBrowseMode ? browseQuestions : questions;
    const currentIndex = isBrowseMode ? currentBrowseIndex : currentQuestionIndex;
    
    const editor = isBrowseMode ? browseExplanationEditor : explanationEditor;
    const displayElement = isBrowseMode ? browseExplanation : explanationText;
    const noteBtnElement = isBrowseMode ? browseNoteBtn : noteBtn;
    const desktopControls = isBrowseMode ? browseEditControlsDesktop : editControlsDesktop;
    const mobileControls = isBrowseMode ? browseEditControlsMobile : editControlsMobile;

    if (questionsList.length === 0) return;
    const questionId = questionsList[currentIndex].id.toString();

    // 進入編輯狀態
    if (editor.classList.contains('hidden')) {
        editor.textContent = userExplanations[questionId] || ''; 
        
        // 處理 Placeholder 模擬
        if (editor.textContent.trim() === '') {
            editor.classList.add('placeholder-visible');
        } else {
            editor.classList.remove('placeholder-visible');
        }

        editor.classList.remove('hidden');
        displayElement.classList.add('hidden');
        noteBtnElement.classList.add('hidden'); // 編輯時隱藏筆記按鈕
        
        // 根據螢幕大小顯示對應的控制項 (使用 JS 檢查 window.innerWidth)
        if (window.innerWidth >= 640) { // sm 斷點
            desktopControls.classList.remove('hidden');
            mobileControls.classList.add('hidden');
        } else {
            mobileControls.classList.remove('hidden');
            desktopControls.classList.add('hidden');
        }
        
        editor.focus();
    } 
    // 取消編輯狀態 (通過 Save/Cancel 按鈕或通用取消函數處理)
}


// [NEW] 筆記功能 (儲存) - 作答區
function saveExplanationEdit() {
    saveExplanationEditGeneric(false);
}

// [NEW] 筆記功能 (儲存) - 瀏覽區
function saveBrowseExplanationEdit() {
    saveExplanationEditGeneric(true);
}

// [NEW] 筆記功能 (儲存) - 通用邏輯
function saveExplanationEditGeneric(isBrowseMode) {
    const questionsList = isBrowseMode ? browseQuestions : questions;
    const currentIndex = isBrowseMode ? currentBrowseIndex : currentQuestionIndex;
    
    const editor = isBrowseMode ? browseExplanationEditor : explanationEditor;
    const desktopControls = isBrowseMode ? browseEditControlsDesktop : editControlsDesktop;
    // [FIX] 修正 mobileControls 變數名稱錯誤
    const mobileControls = isBrowseMode ? browseEditControlsMobile : editControlsMobile; 
    const displayElement = isBrowseMode ? browseExplanation : explanationText; // [NEW] 取得顯示元素
    
    if (questionsList.length === 0) return;
    const questionId = questionsList[currentIndex].id.toString();
    
    // 確保從 contenteditable 獲取內容後，清理 HTML 標籤 (例如 <br>)
    const newExplanation = editor.textContent.trim(); 
    
    if (newExplanation === '') {
        delete userExplanations[questionId];
    } else {
        userExplanations[questionId] = newExplanation;
    }
    
    // 確保資料被儲存
    localStorage.setItem('userExplanations', JSON.stringify(userExplanations));
    
    // 退出編輯模式
    editor.classList.add('hidden');
    // [FIX] 正確使用 mobileControls 隱藏按鈕
    mobileControls.classList.add('hidden');
    desktopControls.classList.add('hidden');

    // [FIX/MODIFIED]: 更新顯示和圖示狀態，不再模擬點擊選項 (解決誤觸答案 1 的問題)
    const currentQuestion = questionsList[currentIndex];
    let explanationContent = `解答：${currentQuestion.answer}`;
    
    explanationContent += `\n\n詳解：\n${(currentQuestion.explanation && currentQuestion.explanation.trim() !== '') ? currentQuestion.explanation : '無'}`;
    
    explanationContent += `\n\n筆記：\n${(userExplanations[questionId] && userExplanations[questionId].trim() !== '') ? userExplanations[questionId] : '無'}`;
    
    displayElement.textContent = explanationContent;
    displayElement.classList.remove('hidden');

    // 更新圖示狀態 (解決按鈕顏色未變動的問題)
    updateIconState(questionId);
    
    // 瀏覽模式不需要其他處理
    if (!isBrowseMode) {
        // 作答模式：確保筆記按鈕再次出現
        noteBtn.classList.remove('hidden');
    }
}

// [NEW] 筆記功能 (取消) - 作答區
function cancelExplanationEdit() {
    cancelExplanationEditGeneric(false);
}

// [NEW] 筆記功能 (取消) - 瀏覽區
function cancelBrowseExplanationEdit() {
    cancelExplanationEditGeneric(true);
}

// [NEW] 筆記功能 (取消) - 通用邏輯
function cancelExplanationEditGeneric(isBrowseMode) {
    const editor = isBrowseMode ? browseExplanationEditor : explanationEditor;
    const displayElement = isBrowseMode ? browseExplanation : explanationText;
    const noteBtnElement = isBrowseMode ? browseNoteBtn : noteBtn;
    const desktopControls = isBrowseMode ? browseEditControlsDesktop : editControlsDesktop;
    const mobileControls = isBrowseMode ? browseEditControlsMobile : editControlsMobile;
    
    // 退出編輯模式
    editor.classList.add('hidden');
    mobileControls.classList.add('hidden');
    desktopControls.classList.add('hidden');
    
    // 顯示原始的顯示區
    displayElement.classList.remove('hidden');
    noteBtnElement.classList.remove('hidden'); // 顯示筆記按鈕
}


// [MODIFIED] handleKeydown 函式 - 增加數字、字母鍵答題和 B/N 收藏/筆記快捷鍵
function handleKeydown(e) {
    // 1. 處理瀏覽畫面 (Browse Container)
    if (!browseContainer.classList.contains('hidden')) {
        if (document.activeElement === browseJumpInput) return;
        
        // 瀏覽模式: 收藏/筆記快捷鍵 (B/N)
        // [MODIFIED] 收藏快捷鍵改為 'b'
        if (e.key.toLowerCase() === 'b') { 
            e.preventDefault(); 
            browseFavoriteBtn.click();
            return;
        } else if (e.key.toLowerCase() === 'n') {
            e.preventDefault();
            browseNoteBtn.click();
            return;
        }

        // 瀏覽模式: 換題快捷鍵 (K/J/Arrows/Space)
        if (e.key.toLowerCase() === 'k' || e.key === 'ArrowRight' || e.key === ' ') { 
            e.preventDefault(); 
            handleBrowseNext();
        } else if (e.key.toLowerCase() === 'j' || e.key === 'ArrowLeft') { 
            e.preventDefault(); 
            handleBrowsePrev();
        }
        return; 
    }

    // 2. 處理測驗畫面 (Quiz Container)
    if (!quizContainer.classList.contains('hidden')) {
        
        // 如果筆記編輯器獲取焦點，則允許預設行為 (例如 Enter 換行)
        if (explanationEditor === document.activeElement) {
             return;
        }

        // 處理 "下一題" (Enter 鍵 或 空白鍵) - 僅在答案選定後 (即 nextBtn 可見)
        if ((e.key === 'Enter' || e.key === ' ') && !nextBtn.classList.contains('hidden')) { 
            e.preventDefault(); 
            nextBtn.click();
            return;
        }
        
        // 映射按鍵到選項 (僅在未答題且非編輯模式時觸發)
        // 判斷條件 !nextBtn.classList.contains('hidden') === false 表示 nextBtn 尚未顯示 (即還未答題)
        if(explanationEditor.classList.contains('hidden') && !nextBtn.classList.contains('hidden') === false) {
            let targetValue;
            switch (e.key.toLowerCase()) { 
                case '1':
                case 'j':
                    targetValue = '1';
                    break;
                case '2':
                case 'k':
                    targetValue = '2';
                    break;
                case '3':
                case 'l':
                    targetValue = '3';
                    break;
                case '4':
                case ';':
                    targetValue = '4';
                    break;
                case 'b': // [MODIFIED] 收藏 (Book-mark)
                    e.preventDefault();
                    favoriteBtn.click();
                    return;
                case 'n': // 筆記 (Note)
                    e.preventDefault();
                    noteBtn.click();
                    return;
                default:
                    return; 
            }

            const targetButton = optionsContainer.querySelector(`.option-btn[data-value="${targetValue}"]`);

            if (targetButton && !targetButton.disabled) {
                targetButton.click();
            }
        }
    }
}
// [END OF MISSING FUNCTION DEFINITION]


// --- 事件監聽器 ---

// [FIX] 第一層選單：為三個主要科目按鈕添加事件監聽器
mainLawBtn.addEventListener('click', handleSubjectSelect);
mainPracticeBtn.addEventListener('click', handleSubjectSelect);
mainMarketBtn.addEventListener('click', handleSubjectSelect);

// [NEW] 第二層選單 (通用事件代理)
subjectSelectionContainer.addEventListener('click', handleActionSelect);
// [MODIFIED] 回到主選單 (第一層)
backToSubjectMenuBtn.addEventListener('click', handleRestart); 
// [MODIFIED] 回到科目選擇 (第二層) - 從章節選擇/測驗畫面返回
backToMenuBtn.addEventListener('click', backToSubjectMenu); 

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', handleNextButton);

endQuizBtn.addEventListener('click', () => {
    if (confirm('您確定要提前結束測驗嗎？\n\n將會結算您目前已回答的題目。')) {
        showScore(true);
    }
});

optionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn') && !e.target.disabled) {
        selectAnswer(e);
    }
});
restartBtn.addEventListener('click', handleRestart);
browseRestartBtn.addEventListener('click', handleRestart); 

browsePrevBtn.addEventListener('click', handleBrowsePrev);
browseNextBtn.addEventListener('click', handleBrowseNext);
browseJumpInput.addEventListener('keydown', handleBrowseJump);

chapterButtonsContainer.addEventListener('click', handleChapterToggle);
selectAllBtn.addEventListener('click', handleSelectAll);
deselectAllBtn.addEventListener('click', handleDeselectAll);

favoriteBtn.addEventListener('click', () => toggleFavoriteGeneric(false));
noteBtn.addEventListener('click', toggleExplanationEdit);
saveExplanationMobileBtn.addEventListener('click', saveExplanationEdit);
cancelExplanationBtn.addEventListener('click', cancelExplanationEdit);
saveExplanationDesktopBtn.addEventListener('click', saveExplanationEdit);
cancelExplanationDesktopBtn.addEventListener('click', cancelExplanationEdit);

browseFavoriteBtn.addEventListener('click', () => toggleFavoriteGeneric(true));
browseNoteBtn.addEventListener('click', toggleBrowseExplanationEdit);
browseSaveMobileBtn.addEventListener('click', saveBrowseExplanationEdit);
browseCancelMobileBtn.addEventListener('click', cancelBrowseExplanationEdit);
browseSaveDesktopBtn.addEventListener('click', saveBrowseExplanationEdit);
browseCancelDesktopBtn.addEventListener('click', cancelBrowseExplanationEdit);

window.addEventListener('resize', () => {
    if (!explanationEditor.classList.contains('hidden')) {
        if (window.innerWidth >= 640) {
            editControlsDesktop.classList.remove('hidden');
            editControlsMobile.classList.add('hidden');
        } else {
            editControlsMobile.classList.remove('hidden');
            editControlsDesktop.classList.add('hidden');
        }
    }
    if (!browseExplanationEditor.classList.contains('hidden')) {
        if (window.innerWidth >= 640) {
            browseEditControlsDesktop.classList.remove('hidden');
            browseEditControlsMobile.classList.add('hidden');
        } else {
            browseEditControlsMobile.classList.remove('hidden');
            browseEditControlsDesktop.classList.add('hidden');
        }
    }
});

document.addEventListener('keydown', handleKeydown);