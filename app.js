// Storage configuration keys and tracking state initialization
const STORAGE_KEYS = { progress: 'nadiaProgress', essay: 'nadiaEssay' };
const defaultProgress = { English: 0, CRE: 0, SocialStudies: 0, CreativeArts: 0 };
let currentSubject = '';
let activeQuestionsCache = [];
let studyProgress = { ...defaultProgress };

/**
 * Safely parse incoming localStorage strings into operational JSON structures
 * @param {string} key - Local storage identity reference 
 * @param {object} fallback - Default object context structure
 */
function safeLoadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return (raw && JSON.parse(raw)) || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Sync active student scores tracking with cached local engine states
 */
function reloadProgress() {
  const saved = safeLoadJson(STORAGE_KEYS.progress, defaultProgress);
  studyProgress = { ...defaultProgress, ...saved };
}

/**
 * Regularizes raw textual answers to discard external spaces or capitalization offsets
 * @param {string} value - Text input string value
 */
function normalizeAnswer(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Deep grades responses relative to comprehensive list configurations
 * @param {string} studentAnswer - Evaluated student text string inputs
 * @param {string} correctAnswer - System master key data reference strings
 */
function answerIsCorrect(studentAnswer, correctAnswer) {
  const student = normalizeAnswer(studentAnswer);
  const expected = normalizeAnswer(correctAnswer);

  if (!student || !expected) return false;

  const choices = expected.split('/').map(choice => normalizeAnswer(choice));
  return choices.some(choice => choice === student || student.includes(choice) || choice.includes(student));
}

// Remote server file path designations for dynamic visual assets
const imageBase = {
  kenya: 'https://githubusercontent.com',
  pala: 'https://githubusercontent.com',
  rider: 'https://githubusercontent.com',
  kivoi: 'https://githubusercontent.com'
};
// Comprehensive subject evaluation repositories
const generatorBank = {
  English: () => [
    { q: 'During the cleaning activity, the pupils collected __________', a: 'dry leaves, plastic bottles, and papers / dry leaves / plastic bottles' },
    { q: 'Why did Moraa empty the old tin?', a: 'because stagnant water could attract mosquitoes / to prevent mosquitoes' },
    { q: 'What is likely to happen if the pupils continue keeping the school clean?', a: 'the compound will always remain clean / it will stay clean' },
    { q: 'The word "stagnant" means:', a: 'standing still / not flowing / motionless' },
    { q: 'Where did Lekupe spend his school holiday?', a: 'in the countryside / at his grandmother\'s home' },
    { q: 'What can we learn about Lekupe?', a: 'he is responsible / hardworking / helpful' },
    { q: 'What would happen if Lekupe had not watered the vegetables?', a: 'the vegetables would have dried up / they would die' },
    { q: 'The word "immediately" means:', a: 'quickly / at once / right away' },
    { q: 'Why did Naisula call the number on the puppy\'s collar?', a: 'to find the owner / to contact the owner' },
    { q: 'What would happen if the puppy had no collar?', a: 'the owner would not be found / it would remain lost' },
    { q: 'Which sentence is true about Naisula?', a: 'she took the puppy to the owner / she was kind' },
    { q: 'What lesson do we learn from Naisula?', a: 'kindness to animals / being helpful / caring' },
    { q: `<img class="question-image" src="${imageBase.kivoi}" alt="Kivoi wa Mwendwa portrait"><br><b>Q13.</b> Which quality is being shown?`, a: 'wisdom / respect / leadership / knowledge / courage / honesty' },
    { q: 'Why did Mukami suggest a watering timetable?', a: 'so trees would stay healthy / to care for the trees' },
    { q: 'What happens if learners continue caring for trees?', a: 'the school will have shade / the place will be shaded' },
    { q: '"Seedlings" refers to:', a: 'young trees / small plants / young plants' },
    { q: 'Why warn learners not to step on young plants?', a: 'to prevent them from breaking / to protect them' },
    { q: 'The children stayed indoors _________ it was raining.', a: 'because / for / as' },
    { q: 'Mary wanted to play, _________ her mother asked her to finish homework.', a: 'but / however' },
    { q: 'There were _________ pupils waiting outside.', a: 'a lot of / many' },
    { q: 'Please add _________ salt to the soup.', a: 'a little / little' },
    { q: 'This is the _________ exciting book I have read.', a: 'most / the most' },
    { q: 'A car is usually _________ expensive than a bicycle.', a: 'more / much more' },
    { q: 'We saw a _________ of birds flying.', a: 'flock / group' },
    { q: 'The farmer saw a _________ of cattle.', a: 'herd / group' },
    { q: 'Jane introduced _________', a: 'herself / herself to the class' },
    { q: 'The pupils cleaned the classroom by _________', a: 'themselves' },
    { q: 'This pencil is _________ pencil.', a: 'my / my pencil' },
    { q: 'Peter hurt _________ hand.', a: 'his / his hand' },
    { q: 'The children _________ reading when the teacher entered.', a: 'were / were reading' },
    { q: 'Every morning, our class _________ the day with prayer.', a: 'begins / starts' }
  ],

  CRE: () => [
    { q: 'Who built an ark by God\'s command?', a: 'Noah' },
    { q: 'List one fruit of the Holy Spirit (Galatians 5:22-23).', a: 'love / joy / peace / patience / kindness / goodness / faithfulness / gentleness / self-control' },
    { q: 'Name the mountain where Moses received the Ten Commandments.', a: 'Mount Sinai' },
    { q: 'Which Christian value means being truthful and sincere?', a: 'Honesty' },
    { q: 'What was the name of Abraham\'s wife?', a: 'Sarah' },
    { q: 'Where was Jesus Christ born?', a: 'Bethlehem' },
    { q: 'Who was the first king of Israel?', a: 'Saul' },
    { q: 'How many disciples did Jesus choose?', a: '12' },
    { q: 'What is the first book of the Old Testament?', a: 'Genesis' },
    { q: 'Which miracle did Jesus perform at Cana of Galilee?', a: 'turning water into wine / water into wine' }
  ],

  SocialStudies: () => [
    { q: `<img class="question-image" src="${imageBase.pala}" alt="Pala Area Map"><br><b>Q1</b> List one natural resource found in the Pala area.`, a: 'rivers / forests / soil / water / minerals' },
    { q: `<img class="question-image" src="${imageBase.pala}" alt="Pala Area Map"><br><b>Q2</b> State one use of the river in the area.`, a: 'watering crops / fishing / transport / drinking water' },
    { q: `<img class="question-image" src="${imageBase.pala}" alt="Pala Area Map"><br><b>Q3</b> Give one reason why people settle near a river.`, a: 'easy water supply / farming / transport / fertile soil' },
    { q: '<b>Q4</b> Rain received is below 250 mm yearly. What type of climate is this?', a: 'hot and dry / desert / arid / semi-arid' },
    { q: '<b>Q5</b> State one major effect of high population density in Kenya.', a: 'pressure on resources / overcrowding / unemployment / poor housing' },
    { q: '<b>Q6</b> Give one method of instruction in African traditional education.', a: 'apprenticeship / storytelling / demonstration / oral teaching / observation' },
    { q: `<img class="question-image" src="${imageBase.kenya}" alt="Kenya Map"><br><b>Q8</b> Which country borders Kenya to the north?`, a: 'Ethiopia / ethiopia' },
    { q: `<img class="question-image" src="${imageBase.kenya}" alt="Kenya Map"><br><b>Q9</b> Which country is found to the south of Kenya?`, a: 'Tanzania / tanzania' },
    { q: `<img class="question-image" src="${imageBase.kenya}" alt="Kenya Map"><br><b>Q10</b> Which ocean borders the east of Kenya?`, a: 'Indian Ocean / indian ocean' },
    { q: `<img class="question-image" src="${imageBase.rider}" alt="Motorcycle rider"><br><b>Q12</b> Apart from helmets, what other safety precaution should riders take?`, a: 'observe traffic rules / follow road signs / drive carefully / use lights' },
    { q: `<img class="question-image" src="${imageBase.kivoi}" alt="Kivoi wa Mwendwa portrait"><br><b>Q13</b> What quality of a traditional leader does this portrait show?`, a: 'wisdom / leadership / respect / knowledge / courage / honesty' },
    { q: '<b>Q14</b> State one function of the council of elders (Njuri Ncheke).', a: 'settling disputes / making laws / advising leaders / protecting community' },
    { q: '<b>Q15</b> What other factor promotes national unity besides celebrations?', a: 'national language / education system / sports / common citizenship' },
    { q: '<b>Q16</b> List one basic human right guaranteed to children in Kenya.', a: 'right to education / healthcare / protection / food / shelter' }
  ],

  CreativeArts: () => [
    { q: 'How do performance costumes improve community folk dances?', a: 'show cultural identity / identify performers role' },
    { q: 'Name one type of kick suitable for taking a penalty kick during a football match.', a: 'instep kick / inside of foot kick' },
    { q: 'Which ball-stopping technique is most suitable for handling fast ground balls rolling on field turf?', a: 'sole trap / inside of foot trap' },
    { q: 'Name the function of the handle part (labelled A) on a standard Rounders hitting bat.', a: 'gripping / holding the bat safely' },
    { q: 'Name the specific type of baton exchange sequence utilized by team relay sprinters shown running.', a: 'non-visual baton exchange / non visual' },
    { q: 'What specific fluid color brush technique is used to paint transparent artwork layers over paper surfaces?', a: 'wash technique / transparent wash' }
  ]
};
function refreshDashboardUI() {
  Object.keys(defaultProgress).forEach(subject => {
    const element = document.getElementById(`prog-${subject}`);
    if (!element) return;
    const totalQuestions = generatorBank[subject] ? generatorBank[subject]().length : 0;
    const score = studyProgress[subject];
    element.textContent = `${score} / ${totalQuestions}`;
    element.style.color = (score >= totalQuestions && totalQuestions > 0) ? 'var(--success)' : 'var(--primary)';
  });
}

function startQuizAnimation(subject) {
  currentSubject = subject;
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('quizContainer').style.display = 'block';
  document.getElementById('scoreCard').classList.remove('show');
  document.getElementById('quizContent').style.display = 'block';
  
  const quizTitle = document.getElementById('quizTitle');
  quizTitle.textContent = `Loading ${subject}...`;
  
  setTimeout(() => {
    quizTitle.textContent = subject;
    generateNewSet();
  }, 500);
}

function closeQuiz() {
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('quizContainer').style.display = 'none';
}

function generateNewSet() {
  const wrapper = document.getElementById('questionsWrapper');
  wrapper.innerHTML = '';
  document.getElementById('masterSubmitBtn').style.display = 'block';
  if (!currentSubject || !generatorBank[currentSubject]) return;
  
  activeQuestionsCache = generatorBank[currentSubject]();
  activeQuestionsCache.forEach((item, index) => {
    const box = document.createElement('div');
    box.className = 'question-box';
    box.id = `q-box-${index}`;
    box.innerHTML = `
      <div class="question-text">Q${index + 1}. ${item.q}</div>
      <input type="text" class="answer-input" id="input-${index}" placeholder="Type your answer here..." autocomplete="off">
      <div class="feedback-box" id="feedback-${index}"></div>
    `;
    wrapper.appendChild(box);
  });
}

function gradeCurrentQuiz() {
  let correctCount = 0;
  const totalQuestions = activeQuestionsCache.length;
  
  activeQuestionsCache.forEach((item, index) => {
    const inputEl = document.getElementById(`input-${index}`);
    const feedbackEl = document.getElementById(`feedback-${index}`);
    if (!inputEl || !feedbackEl) return;
    
    const studentAnswer = inputEl.value.trim();
    const correctAnswer = String(item.a || '').trim();
    const isCorrect = answerIsCorrect(studentAnswer, correctAnswer);
    
    inputEl.disabled = true;
    feedbackEl.style.display = 'block';
    
    if (isCorrect) {
      correctCount++;
      feedbackEl.className = 'feedback-box feedback-correct';
      feedbackEl.innerHTML = '✓ Correct!';
    } else {
      feedbackEl.className = 'feedback-box feedback-incorrect';
      feedbackEl.innerHTML = `✗ Incorrect. Correct: <b>${item.a}</b>`;
    }
  });
  
  if (currentSubject && Object.prototype.hasOwnProperty.call(studyProgress, currentSubject)) {
    studyProgress[currentSubject] = correctCount;
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(studyProgress));
    refreshDashboardUI();
  }
  showScoreCard(correctCount, totalQuestions);
}

function showScoreCard(score, total) {
  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('scoreCard').classList.add('show');
  document.getElementById('scoreValue').textContent = `${score}/${total}`;
  document.getElementById('scoreText').textContent = `You scored ${score} out of ${total}`;
  
  const percentage = Math.round((score / total) * 100);
  let message = '';
  
  if (percentage === 100) {
    message = '🏆 Perfect! You are a star student!';
  } else if (percentage >= 80) {
    message = '⭐ Excellent work! Keep it up!';
  } else if (percentage >= 60) {
    message = '👍 Good effort! Review the weak areas.';
  } else if (percentage >= 40) {
    message = '📚 Need more practice. Keep learning!';
  } else {
    message = "💪 Don't give up! Try again and learn more.";
  }
  document.getElementById('performanceMsg').textContent = message;
}

function retryQuiz() {
  document.getElementById('scoreCard').classList.remove('show');
  document.getElementById('quizContent').style.display = 'block';
  generateNewSet();
}

// Event Listeners Configuration
document.querySelectorAll('.start-btn').forEach(button => {
  button.addEventListener('click', (event) => {
    startQuizAnimation(event.target.dataset.subject);
  });
});

document.getElementById('saveEssayBtn').addEventListener('click', () => {
  const essayText = document.getElementById('nadiaComposition').value || '';
  localStorage.setItem(STORAGE_KEYS.essay, essayText);
  alert('✓ Story essay saved safely!');
});

document.getElementById('closeQuizBtn').addEventListener('click', closeQuiz);
document.getElementById('reloadBtn').addEventListener('click', generateNewSet);
document.getElementById('masterSubmitBtn').addEventListener('click', gradeCurrentQuiz);
document.getElementById('retryBtn').addEventListener('click', retryQuiz);
document.getElementById('backMenuBtn').addEventListener('click', closeQuiz);

window.addEventListener('load', () => {
  reloadProgress();
  refreshDashboardUI();
  const essayBox = document.getElementById('nadiaComposition');
  if (essayBox) {
    essayBox.value = localStorage.getItem(STORAGE_KEYS.essay) || '';
  }
});
