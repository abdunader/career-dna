"use strict";

/* =========================================================
   DATA
   Each option: [text, frontEndPoints, backEndPoints]
   ========================================================= */
const QUESTIONS = [
  {
    q: "When you try a new app, what do you notice first?",
    options: [
      ["How it looks: the colors, layout and details", 3, 0],
      ["How easy it is to find your way around", 2, 1],
      ["How quickly it gives you the information you need", 1, 2],
      ["Whether it feels reliable and keeps information safe", 0, 3],
    ],
  },
  {
    q: "Which kind of project sounds most satisfying?",
    options: [
      ["Creating a welcoming page people enjoy looking at", 3, 0],
      ["Making an experience people can explore and interact with", 2, 1],
      ["Organizing information so people can find what they need", 0, 3],
      ["Making sure a service works reliably behind the scenes", 0, 3],
    ],
  },
  {
    q: "What kind of progress feels most rewarding to you?",
    options: [
      ["Seeing the appearance take shape as I work", 3, 0],
      ["Trying it out and making the experience smoother", 2, 1],
      ["Knowing the information is organized correctly", 0, 3],
      ["Knowing everything works reliably, even if it is not visible", 0, 3],
    ],
  },
  {
    q: "Which kind of problem would you most enjoy solving?",
    options: [
      ["A page that looks messy on a phone", 3, 0],
      ["A feature that is confusing or difficult to use", 2, 1],
      ["Information that is hard to find or sort through", 0, 3],
      ["A service that stops working when many people use it", 0, 3],
    ],
  },
  {
    q: "Which activity sounds most like you?",
    options: [
      ["Choosing colors and arranging things to look just right", 3, 0],
      ["Finding ways to make an activity easier for people", 2, 1],
      ["Sorting information into a clear, useful system", 0, 3],
      ["Working through a tricky puzzle to understand how it works", 1, 2],
    ],
  },
  {
    q: "Which part of a group project would you enjoy most?",
    options: [
      ["Choosing how the finished project should look", 3, 0],
      ["Listening to people and improving their experience", 2, 1],
      ["Organizing the information the project needs", 0, 3],
      ["Figuring out how all the parts should work together", 1, 2],
    ],
  },
  {
    q: "You notice a small detail looks out of place. What do you do?",
    options: [
      ["I can't ignore it; I want to make it look right", 3, 0],
      ["I'd check whether it makes the experience less clear", 2, 1],
      ["If it works well, I would probably move on", 0, 2],
      ["I'd rather focus on whether everything works properly", 0, 3],
    ],
  },
  {
    q: "How do you feel about puzzles and figuring out how things work?",
    options: [
      ["I love them", 0, 3],
      ["I enjoy them when there is a clear goal", 1, 2],
      ["I prefer creative, visual challenges", 3, 0],
      ["It depends on the problem", 1, 1],
    ],
  },
  {
    q: "What would make you proudest?",
    options: [
      ["People saying, \"That looks great!\"", 3, 0],
      ["People saying the experience was easy and enjoyable", 2, 1],
      ["Helping lots of people use a service without problems", 0, 3],
      ["Making sure people's information is accurate and safe", 0, 3],
    ],
  },
  {
    q: "Which topic would you be most curious to learn about?",
    options: [
      ["How colors, images and layouts shape a page", 3, 0],
      ["How to make a page easier and more enjoyable to use", 2, 1],
      ["How information can be organized and found", 0, 3],
      ["How online services stay dependable and protect information", 1, 2],
    ],
  },
  {
    q: "What kind of feedback do you enjoy most?",
    options: [
      ["Seeing the finished result look the way I imagined", 3, 0],
      ["Hearing that people found it easy to use", 2, 1],
      ["Knowing the information is correct and easy to find", 0, 3],
      ["Knowing everything works as it should", 1, 2],
    ],
  },
  {
    // Final "forced choice" question. Also used as the tie-breaker.
    q: "If you had to choose, which part would you rather help create?",
    options: [
      ["The part people see and interact with", 3, 0],
      ["The systems and processes that make it work", 0, 3],
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
  themeToggle: $("theme-toggle"),
};

const THEME_STORAGE_KEY = "career-dna-theme";

function getThemeToggleText(theme) {
  return theme === "light" ? "Dark" : "Light";
}

function applyTheme(theme) {
  const normalizedTheme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = normalizedTheme;

  if (!el.themeToggle) return;

  const themeLabel = el.themeToggle.querySelector(".theme-toggle__label");
  const themeIcon = el.themeToggle.querySelector(".theme-toggle__icon");

  if (themeLabel) themeLabel.textContent = getThemeToggleText(normalizedTheme);
  if (themeIcon) themeIcon.textContent = normalizedTheme === "light" ? "☀️" : "🌙";
  el.themeToggle.setAttribute("aria-label", `Switch to ${getThemeToggleText(normalizedTheme)} mode`);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  } catch (error) {
    // Ignore localStorage issues in restricted browser contexts.
  }
}

function initializeTheme() {
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    savedTheme = null;
  }

  const prefersLightMode =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;

  const initialTheme =
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : prefersLightMode
        ? "light"
        : "dark";

  applyTheme(initialTheme);
}

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

if (el.themeToggle) {
  el.themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.dataset.theme === "light" ? "light" : "dark";
    applyTheme(currentTheme === "light" ? "dark" : "light");
  });
}

initializeTheme();
