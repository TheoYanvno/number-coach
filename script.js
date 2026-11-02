// Everything the game remembers, in one object. newGame() replaces it to start over.
let game;

function newGame() {
  game = {
    secret: Math.floor(Math.random() * 100) + 1,
    low: 1,           // the smallest number it could still be
    high: 100,        // the largest number it could still be
    moves: [],        // every guess, with the coach's grade
    over: false,
  };
}

// 2. Evaluate: what's the best move, and how close was the player's?
function bestGuess(low, high) {
  return Math.floor((low + high) / 2);
}

// Grade a guess against the range BEFORE the move. Returns { grade, note }.
function rateGuess(n, low, high) {
  const size = high - low + 1;
  const best = bestGuess(low, high);
  if (n < low || n > high) {
    return { grade: 'wasted', note: `Already ruled out: it had to be ${low}–${high}. Try ${best}.` };
  }
  if (size <= 2 || Math.abs(n - best) <= 1) {
    return { grade: 'best', note: `The middle of ${low}–${high}: whatever the answer, half the numbers are gone.` };
  }
  // Worst case: the bigger side that could still be left after this guess.
  const worstLeft = Math.max(n - low, high - n);
  const ruledOut = size - worstLeft;
  if (ruledOut >= size / 3) {
    return { grade: 'good', note: `Rules out at least ${ruledOut} of ${size}. ${best} would rule out half.` };
  }
  return { grade: 'risky', note: `Near the edge: it might only rule out ${ruledOut} of ${size}. The middle, ${best}, is safer.` };
}

// The coach's summary of the whole game, built from the saved moves.
function summary(moves) {
  const target = Math.ceil(Math.log2(100));
  const count = (g) => moves.filter((m) => m.grade === g).length;
  const accuracy = Math.round((100 * (count('best') + count('good'))) / moves.length);
  let tip = 'Perfect strategy: you split the range every time.';
  if (count('wasted')) tip = 'Watch the range: some guesses were already ruled out.';
  else if (count('risky')) tip = 'Aim for the middle of the range: it always rules out half.';
  return { guesses: moves.length, target, accuracy, tip };
}

const rangeBar = document.getElementById('range');
const rangeText = document.getElementById('rangeText');
const movesList = document.getElementById('moves');
const report = document.getElementById('report');
const LABELS = { best: 'Best', good: 'Good', risky: 'Risky', wasted: 'Wasted' };

// 3. Respond: draw the page from the game state.
function render() {
  const span = document.createElement('span');
  span.style.left = `${game.low - 1}%`;
  span.style.width = `${game.high - game.low + 1}%`;
  rangeBar.replaceChildren(span);
  rangeText.textContent = game.over ? '' : `Still possible: ${game.low}–${game.high}`;

  movesList.replaceChildren(...game.moves.map((m) => {
    const li = document.createElement('li');
    const head = document.createElement('strong');
    head.textContent = `${m.guess}: ${m.result}`;
    const badge = document.createElement('span');
    badge.className = `grade ${m.grade}`;
    badge.textContent = LABELS[m.grade];
    const note = document.createElement('div');
    note.className = 'muted small';
    note.textContent = m.note;
    li.append(head, badge, note);
    return li;
  }));

  report.hidden = !game.over;
  if (game.over) showReport();
}

function showReport() {
  const s = summary(game.moves);
  const title = document.createElement('h2');
  title.textContent = s.guesses <= s.target && s.accuracy >= 60 ? 'Coach\'s report: nicely done' : 'Coach\'s report';
  const facts = document.createElement('p');
  facts.textContent = `${s.guesses} guesses (a perfect strategy needs at most ${s.target}). Accuracy: ${s.accuracy}% of moves were Best or Good.`;
  const tip = document.createElement('p');
  tip.textContent = `Tip: ${s.tip}`;
  const again = document.createElement('button');
  again.type = 'button';
  again.textContent = 'Play again';
  again.addEventListener('click', () => {
    newGame();
    render();
    answer.textContent = '';
    input.focus();
  });
  report.replaceChildren(title, facts, tip, again);
}

const form = document.getElementById('guessForm');
const input = document.getElementById('guess');
const answer = document.getElementById('answer');

// 2. Evaluate: grade the guess, then apply it to the game state.
function makeMove(n) {
  const rating = rateGuess(n, game.low, game.high);
  let result;
  if (n < game.secret) {
    result = 'too low';
    game.low = Math.max(game.low, n + 1);
  } else if (n > game.secret) {
    result = 'too high';
    game.high = Math.min(game.high, n - 1);
  } else {
    result = 'correct!';
    game.low = game.high = n;
    game.over = true;
  }
  game.moves.push({ guess: n, result, ...rating });
  return result;
}

// 1. Input: read the guess, check it, then make the move.
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (game.over) return;
  const n = Number(input.value);
  if (input.value === '' || !Number.isInteger(n) || n < 1 || n > 100) {
    answer.textContent = 'Type a whole number from 1 to 100.';
    return;
  }
  const result = makeMove(n);
  answer.textContent = result === 'correct!' ? `🎉 ${n} is right!`
    : `${n} is ${result}. Go ${result === 'too low' ? 'higher' : 'lower'}.`;
  input.value = '';
  input.focus();
  render();
});

newGame();
render();
