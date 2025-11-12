// --- 狀態變數 ---
let lawQuestionsCache = [];
let practiceQuestionsCache = [];
let marketQuestionsCache = []; // [NEW] 新增金融常識快取
let chapterMap = new Map();

// --- 狀態變數 ---
let allQuestions = [], questions = [], currentQuestionIndex = 0, score = 0, scoreData = {};
let browseQuestions = [], currentBrowseIndex = 0; 

// --- DOM 元素 ---
const mainTitle = document.querySelector('h1'); 
const typeSelectionContainer = document.getElementById('type-selection-container');
const lawBtn = document.getElementById('law-btn');
const practiceBtn = document.getElementById('practice-btn');
const marketBtn = document.getElementById('market-btn'); // [NEW] 金融常識測驗按鈕
const loadingText = document.getElementById('loading-text');

const browseLawBtn = document.getElementById('browse-law-btn');
const browsePracticeBtn = document.getElementById('browse-practice-btn');
const browseMarketBtn = document.getElementById('browse-market-btn'); // [NEW] 金融常識瀏覽按鈕

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
const backToMenuBtn = document.getElementById('back-to-menu-btn');

const questionCountInput = document.getElementById('question-count');
const totalQuestionsInfo = document.getElementById('total-questions-info');
const progressBar = document.getElementById('progress-bar');
const questionMeta = document.getElementById('question-meta');

const chapterButtonsContainer = document.getElementById('chapter-buttons-container');
const selectAllBtn = document.getElementById('select-all-btn');
const deselectAllBtn = document.getElementById('deselect-all-btn');

// --- 函數 ---
function setMenuButtonsDisabled(disabled) { 
    lawBtn.disabled = disabled;
    practiceBtn.disabled = disabled;
    marketBtn.disabled = disabled; // [NEW]
    browseLawBtn.disabled = disabled;
    browsePracticeBtn.disabled = disabled;
    browseMarketBtn.disabled = disabled; // [NEW]
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

    // [MODIFIED] 金融常識的題目沒有 category，統一設為 '金融常識'
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


async function loadQuestions(jsonPath) {
    let newTitle = ''; 
    try {
        let targetCache, setTargetCache;
        if (jsonPath === 'questions_law.json') {
            targetCache = lawQuestionsCache;
            setTargetCache = (data) => { lawQuestionsCache = data; };
            newTitle = '保險法規 測驗'; 
        } else if (jsonPath === 'questions_practices.json') { // [MODIFIED]
            targetCache = practiceQuestionsCache;
            setTargetCache = (data) => { practiceQuestionsCache = data; };
            newTitle = '保險實務 測驗'; 
        } else if (jsonPath === 'questions_market.json') { // [NEW]
            targetCache = marketQuestionsCache;
            setTargetCache = (data) => { marketQuestionsCache = data; };
            newTitle = '金融常識 測驗'; 
        } else {
             return; 
        }

        if (targetCache.length > 0) {
            allQuestions = targetCache;
            populateChapterSelectors(allQuestions);
            mainTitle.textContent = newTitle; 
            typeSelectionContainer.classList.add('hidden');
            selectionContainer.classList.remove('hidden');
            return;
        }

        loadingText.classList.remove('hidden');
        setMenuButtonsDisabled(true); 
        
        const response = await fetch(jsonPath); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // [MODIFIED] 處理金融常識沒有 category 的情況
        const processedData = data.map(q => ({
            ...q,
            category: (q.category && q.category.trim() !== '') ? q.category : '金融常識'
        }));
        
        setTargetCache(processedData);
        allQuestions = processedData;
        
        mainTitle.textContent = newTitle; 
        populateChapterSelectors(allQuestions);
        
        typeSelectionContainer.classList.add('hidden');
        selectionContainer.classList.remove('hidden');

    } catch (error) {
        console.error(`無法載入題庫 ${jsonPath}:`, error);
        loadingText.textContent = `題庫 ${jsonPath} 載入失敗。`;
    } finally {
        loadingText.classList.add('hidden');
        setMenuButtonsDisabled(false);
    }
}

async function loadBrowseQuestions(jsonPath) {
    let newTitle = ''; 
    try {
        let targetCache, setTargetCache;
        if (jsonPath === 'questions_law.json') {
            targetCache = lawQuestionsCache;
            setTargetCache = (data) => { lawQuestionsCache = data; };
            newTitle = '瀏覽 保險法規'; 
        } else if (jsonPath === 'questions_practices.json') { // [MODIFIED]
            targetCache = practiceQuestionsCache;
            setTargetCache = (data) => { practiceQuestionsCache = data; };
            newTitle = '瀏覽 保險實務'; 
        } else if (jsonPath === 'questions_market.json') { // [NEW]
            targetCache = marketQuestionsCache;
            setTargetCache = (data) => { marketQuestionsCache = data; };
            newTitle = '瀏覽 金融常識'; 
        } else {
             return;
        }

        if (targetCache.length > 0) {
            browseQuestions = [...targetCache].sort((a, b) => a.id - b.id); 
            currentBrowseIndex = 0;
            mainTitle.textContent = newTitle; 
            typeSelectionContainer.classList.add('hidden');
            browseContainer.classList.remove('hidden');
            showBrowseQuestion();
            return; 
        }

        loadingText.classList.remove('hidden');
        setMenuButtonsDisabled(true);

        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // [MODIFIED] 處理金融常識沒有 category 的情況
        const processedData = data.map(q => ({
            ...q,
            category: (q.category && q.category.trim() !== '') ? q.category : '金融常識'
        }));
        
        setTargetCache(processedData);
        
        mainTitle.textContent = newTitle; 
        browseQuestions = [...processedData].sort((a, b) => a.id - b.id);
        currentBrowseIndex = 0;
        
        typeSelectionContainer.classList.add('hidden');
        browseContainer.classList.remove('hidden');
        showBrowseQuestion();

    } catch (error) {
        console.error(`無法載入瀏覽題庫 ${jsonPath}:`, error);
        loadingText.textContent = `題庫 ${jsonPath} 載入失敗。`;
    } finally {
        loadingText.classList.add('hidden');
        setMenuButtonsDisabled(false);
    }
}

function showBrowseQuestion() {
    if (browseQuestions.length === 0) return;
    const q = browseQuestions[currentBrowseIndex];
    browseMeta.textContent = `題號: #${q.id} | 章節: ${q.category}`;
    browseQuestion.textContent = q.question;
    
    // [MODIFIED] 處理沒有詳解的情況
    let explanationContent = `答案：${q.answer}`;
    if (q.explanation && q.explanation.trim() !== '') {
        explanationContent += `\n詳解：\n${q.explanation}`;
    } else {
        explanationContent += `\n詳解：\n無`;
    }
    browseExplanation.textContent = explanationContent;
    
    browsePrevBtn.disabled = (currentBrowseIndex === 0);
    browseNextBtn.disabled = (currentBrowseIndex === browseQuestions.length - 1);
}
function handleBrowsePrev() {
    if (currentBrowseIndex > 0) {
        currentBrowseIndex--;
        showBrowseQuestion();
    }
}
function handleBrowseNext() {
    if (currentBrowseIndex < browseQuestions.length - 1) {
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

function showQuestion() {
    resetState(); // *** resetState 會顯示「提前結束」按鈕 ***
    if (currentQuestionIndex >= questions.length) {
        showScore(false); // *** 修改：傳入 false (正常結束) ***
        return;
    }
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    const currentQuestion = questions[currentQuestionIndex];
    questionMeta.textContent = `題號: #${currentQuestion.id} | 章節: ${currentQuestion.category}`;
    questionText.textContent = currentQuestion.question;
}

function resetState() {
    nextBtn.classList.add('hidden'); 
    endQuizBtn.classList.remove('hidden'); // *** 修改：顯示「提前結束」按鈕 ***
    
    feedbackText.textContent = ''; 
    explanationText.textContent = ''; 
    explanationText.classList.add('hidden');
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');
    });
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const selectedValue = selectedButton.dataset.value; 
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer; 
    const category = currentQuestion.category;
    
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
    
    // [MODIFIED] 處理沒有詳解的情況
    let explanationContent = `答案：${currentQuestion.answer}`;
    if (currentQuestion.explanation && currentQuestion.explanation.trim() !== '') {
        explanationContent += `\n詳解：\n${currentQuestion.explanation}`;
    } else {
        explanationContent += `\n詳解：\n無`;
    }
    explanationText.textContent = explanationContent;

    explanationText.classList.remove('hidden');
    Array.from(optionsContainer.children).forEach(button => {
        if (button.dataset.value === correctAnswer) {
            button.classList.add('correct');
        }
        button.disabled = true; 
    });
    
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

function handleRestart() {
    scoreContainer.classList.add('hidden');
    quizContainer.classList.add('hidden'); 
    selectionContainer.classList.add('hidden');
    browseContainer.classList.add('hidden'); 
    
    typeSelectionContainer.classList.remove('hidden'); 
    
    mainTitle.textContent = '保險法規與實務 測驗'; 
    
    questionCountInput.value = ''; 
    
    chapterMap.clear();
    chapterButtonsContainer.innerHTML = '';
}

function handleKeydown(e) {
    // 1. 處理瀏覽畫面 (Browse Container)
    if (!browseContainer.classList.contains('hidden')) {
        if (document.activeElement === browseJumpInput) return;
        
        if (e.key === 'k' || e.key === 'ArrowRight' || e.key === ' ') { 
            e.preventDefault(); 
            handleBrowseNext();
        } else if (e.key === 'j' || e.key === 'ArrowLeft') { 
            e.preventDefault(); 
            handleBrowsePrev();
        }
        return; 
    }

    // 2. 處理測驗畫面 (Quiz Container)
    if (!quizContainer.classList.contains('hidden')) {
        // 處理 "下一題" (Enter 鍵 或 空白鍵)
        if ((e.key === 'Enter' || e.key === ' ') && !nextBtn.classList.contains('hidden')) { 
            e.preventDefault(); 
            nextBtn.click();
            return;
        }
        
        // 映射按鍵到選項
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
            default:
                return; 
        }

        const targetButton = optionsContainer.querySelector(`.option-btn[data-value="${targetValue}"]`);

        if (targetButton && !targetButton.disabled) {
            targetButton.click();
        }
    }
}

// --- 事件監聽器 ---
lawBtn.addEventListener('click', () => loadQuestions('questions_law.json'));
practiceBtn.addEventListener('click', () => loadQuestions('questions_practices.json'));
marketBtn.addEventListener('click', () => loadQuestions('questions_market.json')); // [NEW]
browseLawBtn.addEventListener('click', () => loadBrowseQuestions('questions_law.json'));
browsePracticeBtn.addEventListener('click', () => loadBrowseQuestions('questions_practices.json'));
browseMarketBtn.addEventListener('click', () => loadBrowseQuestions('questions_market.json')); // [NEW]

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', handleNextButton);

// *** 新增：提前結束測驗的監聽器 ***
endQuizBtn.addEventListener('click', () => {
    // 彈出確認視窗
    if (confirm('您確定要提前結束測驗嗎？\n\n將會結算您目前已回答的題目。')) {
        showScore(true); // 傳入 true (代表提前結束)
    }
});

optionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn') && !e.target.disabled) {
        selectAnswer(e);
    }
});
restartBtn.addEventListener('click', handleRestart);
browseRestartBtn.addEventListener('click', handleRestart); 
backToMenuBtn.addEventListener('click', handleRestart);

browsePrevBtn.addEventListener('click', handleBrowsePrev);
browseNextBtn.addEventListener('click', handleBrowseNext);
browseJumpInput.addEventListener('keydown', handleBrowseJump);

chapterButtonsContainer.addEventListener('click', handleChapterToggle);
selectAllBtn.addEventListener('click', handleSelectAll);
deselectAllBtn.addEventListener('click', handleDeselectAll);

document.addEventListener('keydown', handleKeydown);