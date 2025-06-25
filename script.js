const screen = document.getElementById('screen');
const expression = document.getElementById('expression');
const preview = document.getElementById('preview');
const historyContainer = document.getElementById('history');
const buttons = document.querySelectorAll('.btn');
const calculator = document.querySelector('.calculator');
const toggle = document.getElementById('themeToggle');

let current = '';
let history = [];
let errorState = false;

function updateDisplay() {
  expression.textContent = current;
  screen.value = current || '0';
  updatePreview();
}

function updatePreview() {
  if (!current) {
    preview.textContent = '';
    return;
  }
  try {
    let evalResult = math.evaluate(current);
    if (typeof evalResult === 'number') {
      evalResult = Number(evalResult.toFixed(12)); // limit decimals
    }
    preview.textContent = evalResult;
  } catch {
    preview.textContent = '';
  }
}

function addToHistory(expression, result) {
  if (history.length >= 10) history.shift();
  history.push({ expression, result });
  renderHistory();
}

function renderHistory() {
  historyContainer.innerHTML = '';
  history.forEach(({ expression, result }, index) => {
    const div = document.createElement('div');
    div.classList.add('history-item');
    div.textContent = `${expression} = ${result}`;
    div.title = "Click to recall";
    div.addEventListener('click', () => {
      current = expression;
      errorState = false;
      updateDisplay();
    });
    historyContainer.appendChild(div);
  });
}

function clear() {
  current = '';
  errorState = false;
  updateDisplay();
}

function del() {
  if (errorState) {
    clear();
    return;
  }
  current = current.slice(0, -1);
  updateDisplay();
}

function appendInput(input, isFunc = false) {
  if (errorState) {
    clear();
  }

  // Avoid multiple operators in a row (except minus can be unary)
  const operators = ['+', '-', '*', '/', '^', '%'];
  const lastChar = current.slice(-1);
  if (
    !isFunc &&
    operators.includes(input) &&
    (current === '' || operators.includes(lastChar))
  ) {
    // Reject invalid multiple operators (except minus)
    if (!(input === '-' && lastChar !== '-')) {
      return;
    }
  }

  // Append function with '(' automatically
  if (isFunc) {
    current += input + '(';
  } else {
    current += input;
  }
  updateDisplay();
}

function calculate() {
  if (!current) return;
  try {
    let result = math.evaluate(current);
    if (typeof result === 'number') {
      result = Number(result.toFixed(12));
    }
    addToHistory(current, result);
    current = result.toString();
    errorState = false;
  } catch (e) {
    current = 'Error';
    errorState = true;
  }
  updateDisplay();
}

buttons.forEach(btn => {
  const num = btn.dataset.number;
  const action = btn.dataset.action;
  const func = btn.dataset.func;

  if (num !== undefined) {
    btn.addEventListener('click', () => appendInput(num));
  } else if (action === 'clear') {
    btn.addEventListener('click', clear);
  } else if (action === 'delete') {
    btn.addEventListener('click', del);
  } else if (action === 'operator') {
    btn.addEventListener('click', () => appendInput(btn.textContent));
  } else if (action === 'equals') {
    btn.addEventListener('click', calculate);
  } else if (action === 'open') {
    btn.addEventListener('click', () => appendInput('('));
  } else if (action === 'close') {
    btn.addEventListener('click', () => appendInput(')'));
  } else if (func) {
    btn.addEventListener('click', () => appendInput(func, true));
  }
});

// Theme toggle
toggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  toggle.textContent = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
});

// Keyboard Support
calculator.addEventListener('keydown', e => {
  const key = e.key;

  // Allow digits and dot
  if (!isNaN(key) || key === '.') {
    appendInput(key);
  } 
  // Operators
  else if (['+', '-', '*', '/', '^', '%'].includes(key)) {
    appendInput(key);
  } 
  else if (key === '(' || key === ')') {
    appendInput(key);
  } 
  else if (key === 'Enter' || key === '=') {
    calculate();
  } 
  else if (key === 'Backspace') {
    del();
  } 
  else if (key.toLowerCase() === 'c') {
    clear();
  }
  e.preventDefault();
});

// Initialize
clear();
renderHistory();
