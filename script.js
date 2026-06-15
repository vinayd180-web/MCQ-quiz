// Get testId from URL (?testId=xxx)
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get('testId') || 'english-grammar-01';

let fullData = null;     // will hold { tests: {...}, questions: [...] }
let currentQuestions = [];
let userAnswers = [];
let currentIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('questions.json?nocache=' + Date.now());
        fullData = await res.json();

        // Check if we have the new format with "tests" object
        let questionsArray, passwordRequired;
        if (fullData.tests && fullData.questions) {
            passwordRequired = fullData.tests[testId];
            questionsArray = fullData.questions;
        } else {
            // Old format: no passwords, assume public
            questionsArray = fullData;
            passwordRequired = null;
        }

        // If a password is set for this test, ask for it
        if (passwordRequired) {
            const entered = prompt(`🔐 Enter password for test "${testId}":`);
            if (entered !== passwordRequired) {
                document.getElementById('quiz').innerHTML = '<div class="result-card" style="color:red;"><h3>⛔ Access denied.</h3><p>Incorrect password.</p></div>';
                return;
            }
        }

        // Filter questions belonging to this testId
        const questions = questionsArray.filter(q => q.testId === testId);
        if (questions.length === 0) {
            document.getElementById('quiz').innerHTML = `<div class="result-card"><h3>❌ No questions found for test "${testId}".</h3><p>Please contact your teacher.</p></div>`;
            return;
        }

        startQuiz(questions);
    } catch (err) {
        document.getElementById('quiz').innerHTML = '<div class="result-card"><h3>⚠️ Error loading quiz.</h3><p>Try again later.</p></div>';
        console.error(err);
    }
});

function startQuiz(questions) {
    currentQuestions = questions;
    userAnswers = new Array(questions.length).fill(null);
    showQuestion();
}

function showQuestion() {
    const q = currentQuestions[currentIndex];
    let html = `<div class="question-text">${currentIndex+1}. ${q.question}</div>`;
    html += `<div class="options-list">`;
    q.options.forEach(opt => {
        const checked = userAnswers[currentIndex] === opt ? 'checked' : '';
        const safeId = `opt_${currentIndex}_${opt.replace(/\s/g, '').slice(0, 10)}`;
        html += `
            <div class="option" onclick="document.getElementById('${safeId}').click()">
                <input type="radio" name="option" value="${opt.replace(/"/g, '&quot;')}" ${checked} id="${safeId}">
                <label for="${safeId}">${opt}</label>
            </div>
        `;
    });
    html += `</div><div class="nav-buttons">`;
    if (currentIndex > 0) html += `<button class="nav-btn prev" onclick="prevQuestion()">← Previous</button>`;
    html += `<button class="nav-btn" onclick="nextQuestion()">${currentIndex === currentQuestions.length-1 ? '✅ Submit' : 'Next →'}</button>`;
    html += `</div>`;
    document.getElementById('quiz').innerHTML = html;
}

function nextQuestion() {
    const selected = document.querySelector('input[name="option"]:checked');
    if (selected) userAnswers[currentIndex] = selected.value;
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        showQuestion();
    } else {
        submitQuiz();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        showQuestion();
    }
}

function submitQuiz() {
    score = 0;
    let resultHtml = `<div class="result-card"><h2>🎯 Your Score</h2>`;
    currentQuestions.forEach((q, i) => {
        const isCorrect = userAnswers[i] === q.correct;
        if (isCorrect) score++;
        resultHtml += `
            <div class="result-item ${isCorrect ? 'correct' : 'wrong'}">
                <p><strong>Q${i+1}:</strong> ${q.question}</p>
                <p>📌 Your answer: ${userAnswers[i] || 'Not answered'}</p>
                <p>✅ Correct: ${q.correct}</p>
                <p>💡 Explanation: ${q.explanation || '—'}</p>
            </div>
        `;
    });
    resultHtml = `<div class="result-card"><h2>🎯 Score: ${score}/${currentQuestions.length}</h2>` + resultHtml.slice(resultHtml.indexOf('<div class="result-item')) + `</div>`;
    document.getElementById('quiz').innerHTML = resultHtml;
}