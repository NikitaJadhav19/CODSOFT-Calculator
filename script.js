const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttonsEl = document.querySelector('.buttons');

let currentInput = '0';
let operator = null; // '+', '-', '*', '/'
let previousValue = null; // number
let justEvaluated = false;

function formatNumber(n){
  // Keep it simple but avoid long floats.
  if (!Number.isFinite(n)) return 'Error';
  const s = n.toString();
  if (s.length > 12) return Number(n).toPrecision(10).replace(/\.0+$/,'');
  return s;
}

function updateUI(){
  expressionEl.textContent = operator && previousValue !== null
    ? `${formatNumber(previousValue)} ${operator}`
    : '';
  resultEl.textContent = currentInput;
}

function appendDigit(d){
  if (justEvaluated) {
    // Start fresh after '='
    currentInput = d;
    operator = null;
    previousValue = null;
    justEvaluated = false;
    updateUI();
    return;
  }

  if (currentInput === '0') currentInput = d;
  else currentInput += d;
  updateUI();
}

function appendDot(){
  if (justEvaluated) {
    currentInput = '0.';
    operator = null;
    previousValue = null;
    justEvaluated = false;
    updateUI();
    return;
  }

  if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateUI();
}

function backspace(){
  if (justEvaluated) {
    // If just evaluated, treat backspace as clear.
    clearAll();
    return;
  }

  if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateUI();
}

function clearAll(){
  currentInput = '0';
  operator = null;
  previousValue = null;
  justEvaluated = false;
  expressionEl.textContent = '';
  resultEl.textContent = '0';
}

function compute(a, op, b){
  // Using if-else as requested.
  let out;
  if (op === '+') out = a + b;
  else if (op === '-') out = a - b;
  else if (op === '*') out = a * b;
  else if (op === '/') out = a / b;
  else out = NaN;

  if (!Number.isFinite(out)) return 'Error';
  return formatNumber(out);
}

function chooseOperator(nextOp){
  const inputValue = Number(currentInput);

  if (operator && previousValue !== null && !justEvaluated) {
    // Chain operations: evaluate first.
    const computed = compute(previousValue, operator, inputValue);
    if (computed === 'Error') {
      currentInput = 'Error';
      previousValue = null;
      operator = null;
      justEvaluated = true;
      updateUI();
      return;
    }

    previousValue = Number(computed);
    currentInput = computed;
  } else if (previousValue === null) {
    previousValue = inputValue;
    currentInput = formatNumber(previousValue);
  }

  operator = nextOp;
  justEvaluated = false;
  updateUI();
}

function equals(){
  if (!operator || previousValue === null) return;
  const inputValue = Number(currentInput);

  const computed = compute(previousValue, operator, inputValue);
  currentInput = computed;
  previousValue = null;
  operator = null;
  justEvaluated = true;
  updateUI();
}

buttonsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === 'clear') {
    clearAll();
  } else if (action === 'back') {
    backspace();
  } else if (action === 'digit') {
    appendDigit(value);
  } else if (action === 'dot') {
    appendDot();
  } else if (action === 'operator') {
    // If result is Error, ignore operator until user clears.
    if (currentInput === 'Error') return;
    chooseOperator(value);
  } else if (action === 'equals') {
    if (currentInput === 'Error') return;
    equals();
  }
});

// Optional: keyboard support
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if (key >= '0' && key <= '9') appendDigit(key);
  else if (key === '.') appendDot();
  else if (key === 'Backspace') backspace();
  else if (key === 'Escape') clearAll();
  else if (key === '+' || key === '-' || key === '*' || key === '/') {
    if (currentInput === 'Error') return;
    chooseOperator(key);
  } else if (key === 'Enter' || key === '=') {
    if (currentInput === 'Error') return;
    equals();
  }
});

updateUI();

