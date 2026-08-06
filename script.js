/* ═══════════════════════════════════════════
   NAV
═══════════════════════════════════════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('on', window.scrollY > 20), {passive:true});

document.getElementById('burger').addEventListener('click', () => {
  document.querySelector('.n-links').classList.toggle('open');
});
document.querySelectorAll('.n-links a').forEach(a =>
  a.addEventListener('click', () => document.querySelector('.n-links').classList.remove('open'))
);

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
const els = document.querySelectorAll(
  '.sk-card,.p-card,.edu-row,.exp-content,.stat-item,.about-text,.sec-top,.h-eyebrow,.h1,.h-strip,.h-sub,.h-cta,.h-soc,.contact-big'
);
els.forEach(el => el.classList.add('appear'));
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }});
}, { threshold: 0.08 });
els.forEach(el => io.observe(el));

/* ACTIVE NAV */
const secs = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.n-links a:not(.n-hire)');
const sio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => a.style.color = '');
      const a = document.querySelector(`.n-links a[href="#${e.target.id}"]`);
      if (a) a.style.color = '#fff';
    }
  });
}, { threshold: 0.4 });
secs.forEach(s => sio.observe(s));

/* ═══════════════════════════════════════════
   VOICE ENGINE
═══════════════════════════════════════════ */
const synth = window.speechSynthesis;
let currentUtter = null;
let voiceEnabled = true;

// Pick the best English voice available
function getBestVoice() {
  const voices = synth.getVoices();
  const preferred = [
    'Google US English', 'Microsoft David Desktop',
    'Microsoft Mark - English (United States)',
    'Alex', 'Samantha', 'Google UK English Male',
    'Microsoft Zira Desktop'
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
}

function speak(text) {
  if (!voiceEnabled || !synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = getBestVoice();
  utter.rate  = 0.95;
  utter.pitch = 1.0;
  utter.volume = 1.0;
  currentUtter = utter;

  // Show toast
  showToast(text);

  // Highlight the element while speaking
  utter.onend = () => { hideToast(); };
  synth.speak(utter);
}

// Load voices (some browsers load asynchronously)
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = () => {};
}

/* ═══════════════════════════════════════════
   VOICE TOAST UI
═══════════════════════════════════════════ */
const toast = document.createElement('div');
toast.id = 'voice-toast';
toast.innerHTML = `
  <div class="vt-icon"><i class="fas fa-volume-up"></i></div>
  <div class="vt-text"></div>
  <button class="vt-stop" title="Stop"><i class="fas fa-stop"></i></button>
`;
document.body.appendChild(toast);

// Toast styles
const toastStyle = document.createElement('style');
toastStyle.textContent = `
#voice-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(120%);
  background: #111;
  border: 1px solid #ff3c00;
  border-radius: 8px;
  padding: .75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: .85rem;
  min-width: 280px;
  max-width: 520px;
  z-index: 9999;
  box-shadow: 0 8px 40px rgba(255,60,0,.25);
  transition: transform .35s cubic-bezier(.34,1.56,.64,1), opacity .3s;
  opacity: 0;
}
#voice-toast.visible {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
.vt-icon {
  color: #ff3c00;
  font-size: 1rem;
  animation: iconPulse 1s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes iconPulse {
  0%,100% { transform: scale(1); opacity:1; }
  50% { transform: scale(1.3); opacity:.7; }
}
.vt-text {
  font-family: 'Outfit', sans-serif;
  font-size: .78rem;
  color: #ccc;
  line-height: 1.45;
  flex: 1;
}
.vt-stop {
  background: rgba(255,60,0,.12);
  border: 1px solid rgba(255,60,0,.3);
  color: #ff3c00;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .75rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background .2s;
}
.vt-stop:hover { background: rgba(255,60,0,.25); }

/* Voice toggle button */
#voice-toggle {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: #111;
  border: 1px solid #222;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9998;
  color: #888;
  font-size: 1rem;
  transition: border-color .2s, color .2s;
}
#voice-toggle.active { border-color: #ff3c00; color: #ff3c00; }
#voice-toggle:hover { border-color: #ff3c00; color: #ff3c00; }

/* click ripple on voiced elements */
.voice-el {
  cursor: pointer;
  position: relative;
}
.voice-el::after {
  content: '🔊';
  position: absolute;
  top: .5rem;
  right: .6rem;
  font-size: .65rem;
  opacity: 0;
  transition: opacity .2s;
  pointer-events: none;
}
.voice-el:hover::after { opacity: .5; }
.voice-el.speaking::after { opacity: 1; animation: iconPulse 1s infinite; }
`;
document.head.appendChild(toastStyle);

function showToast(text) {
  toast.querySelector('.vt-text').textContent = text;
  toast.classList.add('visible');
}
function hideToast() {
  toast.classList.remove('visible');
  document.querySelectorAll('.voice-el.speaking').forEach(el => el.classList.remove('speaking'));
}

toast.querySelector('.vt-stop').addEventListener('click', () => {
  synth.cancel();
  hideToast();
});

/* ═══════════════════════════════════════════
   VOICE TOGGLE BUTTON
═══════════════════════════════════════════ */
const vtBtn = document.createElement('button');
vtBtn.id = 'voice-toggle';
vtBtn.title = 'Toggle voice narration';
vtBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
vtBtn.classList.add('active');
document.body.appendChild(vtBtn);

vtBtn.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  vtBtn.classList.toggle('active', voiceEnabled);
  vtBtn.innerHTML = voiceEnabled
    ? '<i class="fas fa-volume-up"></i>'
    : '<i class="fas fa-volume-mute"></i>';
  if (!voiceEnabled) { synth.cancel(); hideToast(); }
  speak(voiceEnabled ? 'Voice narration enabled. Click any card to hear details.' : '');
});

/* ═══════════════════════════════════════════
   VOICE SCRIPTS — what to say for each element
═══════════════════════════════════════════ */
const voiceMap = {
  // SKILL CARDS
  'sk-0': 'Programming Skills. Venkatesh is proficient in Python and SQL — the two core languages powering all his data science and machine learning projects.',
  'sk-1': 'Machine Learning. He applies a wide range of supervised and unsupervised algorithms including Regression, Classification, Random Forest, Support Vector Machines, K-Nearest Neighbors, XGBoost, and Decision Trees.',
  'sk-2': 'Artificial Intelligence and Deep Learning. Venkatesh builds neural networks including Convolutional Neural Networks for image tasks, Recurrent Neural Networks and LSTM for sequences, Natural Language Processing, Computer Vision, Transfer Learning, and Model Fine-tuning using OpenCV and NLTK.',
  'sk-3': 'MLOps and CI/CD. He automates the full machine learning lifecycle using GitHub Actions, CML Workspaces, continuous integration and deployment pipelines, model versioning, REST API endpoints, and cloud model serving.',
  'sk-4': 'Libraries and Frameworks. His toolkit includes Pandas and NumPy for data manipulation, Scikit-learn for classical ML, TensorFlow and Keras for deep learning, Flask for backend APIs, and Matplotlib and Seaborn for data visualization.',
  'sk-5': 'Data Analysis. Venkatesh performs thorough exploratory data analysis, feature engineering, data cleaning, preprocessing pipelines, SMOTE for class imbalance, and outlier detection and handling.',
  'sk-6': 'Tools and Platforms. He works daily with Jupyter Notebook, Google Colab, Git and GitHub for version control, and Visual Studio Code as his primary editor.',
  'sk-7': 'Data Structures and Algorithms. Strong fundamentals in Arrays, Trees, Graphs, Dynamic Programming, and graph traversal algorithms like Breadth-First Search and Depth-First Search.',

  // PROJECT CARDS
  'p-0': 'Project one — Stock Market Prediction. An AI-based system using Random Forest Regressor to forecast closing prices for Microsoft, Apple, IBM, and the S&P 500. The model uses Open, High, Low, and Volume as input features and is deployed via a Flask REST API with an interactive web interface.',
  'p-1': 'Project two — Instagram Usage Predictor. A Flask web application that predicts a user\'s daily Instagram usage time in minutes based on nine behavioural features. Trained on ten thousand user records, it achieves an R-squared score of zero point eight six and a mean absolute error of seventeen minutes.',
  'p-2': 'Project three — Handwritten Character Recognition. A full-stack deep learning application using a Convolutional Neural Network trained on the EMNIST dataset with over eight hundred thousand samples. It recognises sixty-two character classes with approximately ninety-two percent accuracy and less than one hundred milliseconds inference time. The frontend uses an HTML5 Canvas for drawing.',
  'p-3': 'Project four — Smart Career Counsellor. A machine learning recommendation system trained on fifty thousand synthetic student profiles. It uses Random Forest Classification to map scores in Math, Programming, Creativity, Communication, and Science to the best career path — achieving eighty-five to ninety-five percent accuracy.',
  'p-4': 'Project five — Floods and Landslides Prediction. An SVM-based web application that predicts flood risk from four input features: rainfall in millimetres, river water level, soil moisture percentage, and terrain slope. Trained on twenty thousand records, it includes user authentication, prediction history, and visual analysis charts.',
  'p-5': 'Project six — Credit Card Fraud Detection. A real-time fraud classification system using Random Forest with Standard Scaler preprocessing. The full-stack application features a Flask backend and a JavaScript frontend that provides live fraud alerts for incoming transactions.',
  'p-6': 'Project seven — AI Company Intelligence Agent. An AI-powered agent built with Python and a JavaScript web interface that researches and analyses companies. It aggregates business intelligence data to surface actionable insights about any organisation.',
  'p-7': 'Project eight — AI Interview Assistant. An intelligent interview preparation tool that uses AI to generate relevant questions, provide real-time feedback, and offer personalised coaching for both technical and behavioural interview rounds — helping candidates perform at their best.',

  // EDUCATION
  'edu-0': 'Bachelor of Technology in Computer Science and Engineering from Holy Mary Institute of Technology and Science, graduating in May 2026 with a score of seventy-five point nine percent.',
  'edu-1': 'Intermediate education — Mathematics, Physics, Chemistry stream from TMRJC Sathupally, scoring eighty-four point nine percent.',
  'edu-2': 'Secondary School Certificate from Saint Ann\'s High School, Venkatapuram. A perfect score — one hundred percent! An outstanding academic achievement.',

  // EXPERIENCE
  'exp': 'Work Experience — Data Science Intern at Evoastra Ventures. Venkatesh worked on real-world data science projects involving data analysis and machine learning. He performed data preprocessing, cleaning, and exploratory data analysis to identify patterns and insights. He built and evaluated machine learning models using Random Forest, K-Nearest Neighbors, and other classification techniques — applying Python libraries including NumPy, Pandas, Matplotlib, and Scikit-learn throughout.',

  // STATS
  'stat-0': 'Eight or more completed projects, spanning stock market prediction, fraud detection, character recognition, career recommendation, flood prediction, usage forecasting, AI company intelligence, and an AI interview assistant.',
  'stat-1': 'One internship completed — Data Science Intern at Evoastra Ventures, gaining hands-on industry experience with real-world datasets and machine learning pipelines.',
  'stat-2': 'A perfect hundred percent score in SSC — the highest possible achievement in secondary school education.',
  'stat-3': 'Proficient in more than ten technologies including Python, TensorFlow, Scikit-learn, Flask, GitHub Actions, and more.',
  'stat-4': 'Class of 2026 — graduating from Holy Mary Institute of Technology and Science with a B.Tech in Computer Science and Engineering.',
};

/* ═══════════════════════════════════════════
   ATTACH VOICE TO ELEMENTS
═══════════════════════════════════════════ */
function attachVoice(selector, key) {
  document.querySelectorAll(selector).forEach((el, i) => {
    const mapKey = typeof key === 'function' ? key(i) : key;
    if (!voiceMap[mapKey]) return;
    el.classList.add('voice-el');
    el.setAttribute('title', 'Click to hear details 🔊');
    el.addEventListener('click', (e) => {
      // Don't intercept link clicks on project cards
      if (e.target.closest('a') && e.target.closest('a').classList.contains('p-link')) return;
      document.querySelectorAll('.voice-el.speaking').forEach(el => el.classList.remove('speaking'));
      el.classList.add('speaking');
      speak(voiceMap[mapKey]);
    });
  });
}

// Wait for DOM + voices to be ready
window.addEventListener('load', () => {
  // Small delay so voices load in Chrome
  setTimeout(() => {
    attachVoice('.sk-card', i => `sk-${i}`);
    attachVoice('.p-card',  i => `p-${i}`);
    attachVoice('.edu-row', i => `edu-${i}`);
    attachVoice('.exp-content', () => 'exp');
    attachVoice('.stat-item', i => `stat-${i}`);

    // Greet on load
    speak('Welcome to Venkatesh Mallarapu\'s portfolio. I am a Data Scientist and AI Engineer. Click on any card, project, or section to hear more details.');
  }, 800);
});
