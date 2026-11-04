"use strict";

/* =========================================================
   DATA
   Each option: [text, frontEndPoints, backEndPoints]
   ========================================================= */
const QUESTIONS = [
  {
    q: "When you use an app, what do you notice first?",
    options: [
      ["The layout, colors and animations", 3, 0],
      ["How smooth and responsive it feels", 2, 1],
      ["How fast data loads and saves", 1, 2],
      ["How well it handles errors and security", 0, 3],
    ],
  },
  {
    q: "Which project sounds the most exciting?",
    options: [
      ["A beautiful landing page or dashboard", 3, 0],
      ["An interactive game or animated interface", 2, 1],
      ["A REST API with a well-designed database", 0, 3],
      ["A system that processes data in the background", 0, 3],
    ],
  },
  {
    q: "How important is it for you to see your work instantly on screen?",
    options: [
      ["Very. I want to see every change right away", 3, 0],
      ["It's nice, but not essential", 1, 1],
      ["Not really. Logs and test results are enough for me", 0, 3],
      ["Depends on the task", 1, 1],
    ],
  },
  {
    q: "Which bug would you rather hunt?",
    options: [
      ["A layout that breaks on small screens", 3, 0],
      ["A button that doesn't respond when clicked", 2, 1],
      ["A query that is slow on a huge table", 0, 3],
      ["A server that crashes under heavy load", 0, 3],
    ],
  },
  {
    q: "In your free time, you'd most likely…",
    options: [
      ["Tweak a design with CSS or Figma", 3, 0],
      ["Try a new JavaScript framework", 2, 1],
      ["Read about how databases and servers work", 0, 3],
      ["Solve algorithm puzzles", 1, 2],
    ],
  },
  {
    q: "Who would you enjoy working with the most?",
    options: [
      ["Designers", 3, 0],
      ["Users, turning their feedback into improvements", 2, 1],
      ["Other developers connecting APIs and services", 0, 3],
      ["Nobody. I enjoy solving deep problems alone", 1, 2],
    ],
  },
  {
    q: "A button is 2px out of alignment. How do you feel?",
    options: [
      ["I can't unsee it. I have to fix it", 3, 0],
      ["I'd probably notice and fix it", 2, 1],
      ["It works, so I'd move on", 0, 2],
      ["I'd rather spend that time on the data and logic", 0, 3],
    ],
  },
  {
    q: "How do you feel about complex logic, data structures and algorithms?",
    options: [
      ["I love them", 0, 3],
      ["Fine when I need them", 1, 2],
      ["I prefer visual problems", 3, 0],
      ["Neutral", 1, 1],
    ],
  },
  {
    q: "What would make you proudest?",
    options: [
      ["Someone saying \"wow, this looks amazing!\"", 3, 0],
      ["Users saying the app is a joy to use", 2, 1],
      ["A system serving thousands of users without failing", 0, 3],
      ["Keeping data safe, consistent and secure", 0, 3],
    ],
  },
  {
    q: "Which topic sounds the most fun to learn?",
    options: [
      ["CSS animations and accessibility", 3, 0],
      ["State management and browser APIs", 2, 1],
      ["Authentication, caching and databases", 0, 3],
      ["Docker, cloud and deployment", 1, 2],
    ],
  },
  {
    q: "What kind of feedback do you enjoy most?",
    options: [
      ["Visual. I change code and see the result instantly", 3, 0],
      ["User comments about how easy the app is to use", 2, 1],
      ["Metrics like response time and error rates", 0, 3],
      ["Seeing all my tests pass", 1, 2],
    ],
  },
  {
    // Final "forced choice" question. Also used as the tie-breaker.
    q: "If you had to choose right now, which would you build?",
    options: [
      ["What users see and touch", 3, 0],
      ["The engine working behind the scenes", 0, 3],
    ],
  },
];

const RESULTS = {
  frontend: {
    icon: "🎨",
    title: "You're a Front-End Developer",
    desc: "You think visually, care about details and love seeing your work come alive in the browser. Users will thank you for it.",
    traits: [
      "You notice design and usability details",
      "You enjoy instant, visual feedback",
      "You like working close to users and designers",
    ],
    stack: [
      "HTML, CSS and modern JavaScript",
      "TypeScript and React (or Vue)",
      "Tailwind CSS and responsive design",
      "Accessibility and web performance",
    ],
  },
  backend: {
    icon: "⚙️",
    title: "You're a Back-End Developer",
    desc: "You enjoy logic, data and systems that quietly power everything. You like making things reliable, fast and secure.",
    traits: [
      "You love logic, data and problem solving",
      "You care about performance and security",
      "You're happy building what users never see",
    ],
    stack: [
      "A language like Java, C#, Python or Node.js",
      "Spring Boot, .NET Core or Express",
      "SQL, database design and REST APIs",
      "Authentication, caching and Docker",
    ],
  },
};

const LOADING_MESSAGES = [
  "Reading your answers…",
  "Mapping your thinking style…",
  "Comparing with developer profiles…",
  "Calculating your Career DNA…",
  "Almost there…",
];

const LOADING_TIME = 4500; // ms

/* =========================================================
   STATE
   ========================================================= */
const total = QUESTIONS.length;
let current = 0;
let answers = new Array(total).fill(null); // selected option index per question
let isSubmitting = false;
let loadingTimers = [];

/* =========================================================
   ELEMENTS
   ========================================================= */
const $ = (id) => document.getElementById(id);

const screens = {
  intro: $("screen-intro"),
  quiz: $("screen-quiz"),
  loading: $("screen-loading"),
  result: $("screen-result"),
};

const el = {
  start: $("btn-start"),
  back: $("btn-back"),
  next: $("btn-next"),
  submit: $("btn-submit"),
  retake: $("btn-retake"),
  questionBox: $("question-box"),
  questionText: $("question-text"),
  options: $("options"),
  progressLabel: $("progress-label"),
  progressPercent: $("progress-percent"),
  progressBar: $("progress-bar"),
  progressFill: $("progress-fill"),
  loadingMessage: $("loading-message"),
  loadingFill: $("loading-fill"),
};

/* =========================================================
   HELPERS
   ========================================================= */
function showScreen(name) {
  Object.keys(screens).forEach((key) => {
    screens[key].hidden = key !== name;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   QUIZ RENDERING
   ========================================================= */
function renderQuestion() {
  const item = QUESTIONS[current];

  el.questionText.textContent = item.q;
  el.options.innerHTML = "";

  item.options.forEach((opt, index) => {
    const label = document.createElement("label");
    label.className = "option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = String(index);
    input.checked = answers[current] === index;
    input.addEventListener("change", () => {
      answers[current] = index;
      updateButtons();
    });

    const text = document.createElement("span");
    text.textContent = opt[0];

    label.appendChild(input);
    label.appendChild(text);
    el.options.appendChild(label);
  });

  // Progress (based on questions completed before this one)
  const percent = Math.round((current / total) * 100);
  el.progressLabel.textContent = "Question " + (current + 1) + " of " + total;
  el.progressPercent.textContent = percent + "%";
  el.progressFill.style.width = percent + "%";
  el.progressBar.setAttribute("aria-valuenow", String(percent));

  // Small fade animation on each question change
  el.questionBox.classList.remove("fade");
  void el.questionBox.offsetWidth; // restart animation
  el.questionBox.classList.add("fade");

  updateButtons();
}

function updateButtons() {
  const answered = answers[current] !== null;
  const isLast = current === total - 1;

  el.back.classList.toggle("invisible", current === 0);
  el.back.disabled = current === 0;

  el.next.hidden = isLast;
  el.next.disabled = !answered;

  el.submit.hidden = !isLast;
  el.submit.disabled = !answered || isSubmitting;
}

/* =========================================================
   NAVIGATION
   ========================================================= */
function goNext() {
  if (answers[current] === null || current >= total - 1) return;
  current++;
  renderQuestion();
}

function goBack() {
  if (current === 0) return;
  current--;
  renderQuestion();
}

/* =========================================================
   SCORING
   ========================================================= */
function calculateResult() {
  let fe = 0;
  let be = 0;

  answers.forEach((choice, qIndex) => {
    const option = QUESTIONS[qIndex].options[choice];
    fe += option[1];
    be += option[2];
  });

  const sum = fe + be;
  const fePercent = Math.round((fe / sum) * 100);
  const bePercent = 100 - fePercent;

  let winner;
  if (fe > be) {
    winner = "frontend";
  } else if (be > fe) {
    winner = "backend";
  } else {
    // Tie: the last "forced choice" question decides
    const lastOption = QUESTIONS[total - 1].options[answers[total - 1]];
    winner = lastOption[1] > lastOption[2] ? "frontend" : "backend";
  }

  return { fe, be, fePercent, bePercent, winner };
}

function getLevel(winnerPercent) {
  if (winnerPercent >= 70) return "Very strong match";
  if (winnerPercent >= 58) return "Good match";
  return "Slight lean";
}

/* =========================================================
   LOADING (fake AI analysis)
   ========================================================= */
function clearLoadingTimers() {
  loadingTimers.forEach((t) => clearTimeout(t));
  loadingTimers = [];
}

function submitQuiz() {
  if (isSubmitting) return;
  if (answers.some((a) => a === null)) return; // safety check

  isSubmitting = true;
  el.submit.disabled = true;

  showScreen("loading");
  el.loadingFill.style.transition = "none";
  el.loadingFill.style.width = "0%";
  el.loadingMessage.textContent = LOADING_MESSAGES[0];

  // Start the loading bar animation on the next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.loadingFill.style.transition = "width " + LOADING_TIME + "ms linear";
      el.loadingFill.style.width = "100%";
    });
  });

  // Rotate messages
  const step = LOADING_TIME / LOADING_MESSAGES.length;
  LOADING_MESSAGES.forEach((msg, i) => {
    loadingTimers.push(
      setTimeout(() => {
        el.loadingMessage.textContent = msg;
      }, i * step)
    );
  });

  // Show result
  loadingTimers.push(
    setTimeout(() => {
      showResult(calculateResult());
      isSubmitting = false;
    }, LOADING_TIME)
  );
}

/* =========================================================
   RESULT
   ========================================================= */
function fillList(id, items) {
  const ul = $(id);
  ul.innerHTML = "";
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  });
}

function showResult(result) {
  const data = RESULTS[result.winner];
  const winnerPercent = result.winner === "frontend" ? result.fePercent : result.bePercent;

  $("result-icon").textContent = data.icon;
  $("result-title").textContent = data.title;
  $("result-level").textContent = getLevel(winnerPercent) + " · " + winnerPercent + "%";
  $("result-desc").textContent = data.desc;
  fillList("result-traits", data.traits);
  fillList("result-stack", data.stack);

  // Reset bars, show screen, then animate
  $("fe-fill").style.width = "0%";
  $("be-fill").style.width = "0%";
  $("fe-percent").textContent = result.fePercent + "%";
  $("be-percent").textContent = result.bePercent + "%";

  showScreen("result");

  setTimeout(() => {
    $("fe-fill").style.width = result.fePercent + "%";
    $("be-fill").style.width = result.bePercent + "%";
  }, 150);
}

/* =========================================================
   RESTART
   ========================================================= */
function restart() {
  clearLoadingTimers();
  isSubmitting = false;
  current = 0;
  answers = new Array(total).fill(null);
  showScreen("quiz");
  renderQuestion();
}

/* =========================================================
   EVENTS
   ========================================================= */
el.start.addEventListener("click", () => {
  showScreen("quiz");
  renderQuestion();
});
el.next.addEventListener("click", goNext);
el.back.addEventListener("click", goBack);
el.submit.addEventListener("click", submitQuiz);
el.retake.addEventListener("click", restart);
