let questions = [];
let answers = {};
let current = 0;

// Your backend API (Render)
const API = "https://mcq-backend-ygix.onrender.com/questions";

// Test ID (change per class/test)
let testId = "heat-01";

function startTest() {
  const name = document.getElementById("name").value;

  if (!name) {
    alert("Please enter your name");
    return;
  }

  fetch(API + "?testId=" + testId)
    .then(res => res.json())
    .then(data => {
      questions = data;
      answers = {};
      current = 0;
      showQuestion();
    });
}

function showQuestion() {
  const q = questions[current];
  if (!q) return;

  document.getElementById("progress").innerText =
    `Question ${current + 1} / ${questions.length}`;

  let html = `<h3>${q.question}</h3>`;

  q.options.forEach(opt => {
    let selected = answers[current] === opt ? "selected" : "";

    html += `
      <div class="option ${selected}" onclick="selectAnswer('${opt}')">
        ${opt}
      </div>
    `;
  });

  document.getElementById("quiz").innerHTML = html;
}

function selectAnswer(opt) {
  answers[current] = opt;
  showQuestion();
}

function nextQ() {
  if (current < questions.length - 1) {
    current++;
    showQuestion();
  }
}

function prevQ() {
  if (current > 0) {
    current--;
    showQuestion();
  }
}

function submitTest() {
  let score = 0;
  let resultHTML = "";

  questions.forEach((q, i) => {
    if (answers[i] === q.answer) score++;

    resultHTML += `
      <div style="margin-bottom:10px;">
        <b>Q${i + 1}:</b> ${q.question}<br>
        Your Answer: ${answers[i] || "Not answered"}<br>
        Correct Answer: ${q.answer}<br>
        Explanation: ${q.explanation || "No explanation"}
      </div>
      <hr>
    `;
  });

  document.getElementById("result").innerHTML =
    `<h2>Score: ${score} / ${questions.length}</h2>` + resultHTML;

  // send result to backend
  fetch("https://mcq-backend-5zf2.onrender.com/result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      studentName: document.getElementById("name").value,
      testId,
      score,
      total: questions.length
    })
  });
}
