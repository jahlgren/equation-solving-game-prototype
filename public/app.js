import { createFraction, fractionToHTML } from './fraction.js';
import { displayMeme } from './meme-display.js';
import { createCoefficient, createTerm, createVariable } from './term.js';
import { createXpBar } from './xp-bar.js';



// Globals
// ------------------------------------------------------------------

const equationContainer = document.querySelector('#equation');
const buttonsContainer = document.querySelector('#buttons');

const buttonConfig = [
  [
    [
      { level: 0, operation: '+', value: '1', element: undefined, onClick: () => add(1, 1) },
      { level: 1, operation: '+', value: 'x', element: undefined, onClick: () => add(1, 'x') },
    ],
    [
      { level: 0, operation: '-', value: '1', element: undefined, onClick: () => add(-1, 1) },
      { level: 1, operation: '-', value: 'x', element: undefined, onClick: () => add(-1, 'x') },
    ]
  ],
  [
    [
      { level: 2, operation: '⋅', value: '2', element: undefined, onClick: () => multiply(2) },
      { level: 3, operation: '⋅', value: '3', element: undefined, onClick: () => multiply(3) },
      { level: 4, operation: '⋅', value: '5', element: undefined, onClick: () => multiply(5) },
      { level: 4, operation: '⋅', value: '7', element: undefined, onClick: () => multiply(7) }
    ],
    [
      { level: 2, operation: '÷', value: '2', element: undefined, onClick: () => divide(2) },
      { level: 3, operation: '÷', value: '3', element: undefined, onClick: () => divide(3) },
      { level: 4, operation: '÷', value: '5', element: undefined, onClick: () => divide(5) },
      { level: 4, operation: '÷', value: '7', element: undefined, onClick: () => divide(7) }
    ]
  ],
  [
    [
      { level: 5, operation: '⋅', value: 'x', element: undefined, onClick: () => multiply('x') }
    ],
    [
      { level: 5, operation: '÷', value: 'x', element: undefined, onClick: () => divide('x') }
    ]
  ]
];



// Gameplay globals
// ------------------------------------------------------------------

const left = [];
const right = [];
const equation = [left, right];

let level = 0;
let xpBar = undefined;
let buttons = undefined;
let isStarting = false;
let paused = false;

// START THE GAME
start();



// Gameplay functions
// ------------------------------------------------------------------

function isLeftOnlyX() {
  for(let i = 0; i < right.length; i++) {
    const numeratorX = right[i].numerator.variables.find(v => v.getIdentifier() === 'x');
    const denominatorX = right[i].denominator.variables.find(v => v.getIdentifier() === 'x');
    if(numeratorX || denominatorX) {
      return false;
    }
  }
  return (left.length === 1 
    && left[0].denominator.coefficient.getValue() === 1
    && left[0].denominator.variables.length === 0
    && left[0].numerator.coefficient.getValue() === 1 
    && left[0].numerator.variables.length === 1
    && left[0].numerator.variables[0].getIdentifier() === 'x'
    && left[0].numerator.variables[0].getPower() === 1);
}

function handleSolvedEquation() {
  if(isStarting || !isLeftOnlyX()) {
    return;
  }

  xpBar.addXp();
  if(xpBar.isCompleted()) {
    xpBar.highlight();
  }

  paused = true;
  setTimeout(() => {
    paused = false;
    if(xpBar.isCompleted()) {
      displayMeme(() => {
        level++;
        start();
      });
    }
    else {
      while(right.length > 0)
        right.pop();
      right.push(getInitialFraction());
      isStarting = true;
      randomizeEquation();
      isStarting = false;
      updateView();
    }
  }, 1000);
}

function start() {
  isStarting = true;
  reset();

  left.push(createFraction(createTerm(createCoefficient(1), [createVariable('x')])));
  right.push(getInitialFraction());
  
  xpBar = createXpBar(level + 1, 4, document.querySelector('#top-container'));
  buttons = createButtons();

  randomizeEquation();
  updateView();
  isStarting = false;
}

function reset() {
  if(xpBar)
    xpBar.remove();

  if(buttons)
    buttons.remove();

  while(left.length > 0)
    left.pop();
  while(right.length > 0)
    right.pop();
}

function getInitialFraction() {
  let numeratorValue = 0;
  while(numeratorValue === 0)
    numeratorValue = Math.round(20 * Math.random()) - 10;

  let fraction = undefined;

  if(level < 3)
    fraction = createFraction(createTerm(createCoefficient(numeratorValue)));
  else
    fraction = createFraction(
      createTerm(createCoefficient(numeratorValue)),
      createTerm(createCoefficient(1 + Math.floor(9 * Math.random())))
    );

  fraction.simplify();
  return fraction;
}

function randomizeEquation(stepCount = 5) {
  const functions = [];
  for(let i = 0; i < buttonConfig.length; i++) {
    for(let j = 0; j < buttonConfig[i].length; j++) {
      for(let k = 0; k < buttonConfig[i][j].length; k++) {
        if(buttonConfig[i][j][k].level > level)
          continue;
        functions.push(buttonConfig[i][j][k].onClick);
      }
    }
  }

  for(let i = 0; i < stepCount; i++) {
    const f = functions[Math.floor(functions.length * Math.random())];
    f();
  }

  if(isLeftOnlyX()) {
    randomizeEquation(stepCount);
  }
}

function removeZeroes() {
  for(let i = 0; i < equation.length; i++) {
    for(let j = equation[i].length - 1; j >= 0; j--) {
      if(equation[i][j].numerator.coefficient.getValue() === 0)
        equation[i].splice(j, 1);
    }
    if(equation[i].length === 0)
      equation[i].push(createFraction(createTerm(createCoefficient(0))));
  }
}

function add(sign, value) {
  if(paused)
    return;

  let other = undefined;
  if(typeof value === 'number')
    other = createFraction(createTerm(createCoefficient(sign * value)));
  else 
    other = createFraction(createTerm(createCoefficient(sign), [createVariable(value)]));

  for(let i = 0; i < equation.length; i++) {
    let handled = false;
    for(let j = 0; j < equation[i].length; j++) {
      if(equation[i][j].isSimilar(other)) {
        equation[i][j].add(other);
        handled = true;
        break;
      }
    }
    if(!handled)
      equation[i].push(other.copy());
  }
  
  removeZeroes();
  updateView();
  handleSolvedEquation();
}

function multiply(value) {
  if(paused)
    return;

  let other;

  if(typeof value === 'number')
    other = createFraction(createTerm(createCoefficient(value)));
  else
    other = createFraction(createTerm(createCoefficient(1), [createVariable(value)]));

  for(let i = 0; i < equation.length; i++) {
    for(let j = 0; j < equation[i].length; j++) {
      equation[i][j].multiply(other);
    }
  }

  updateView();
  handleSolvedEquation();
}

function divide(value) {
  if(paused)
    return;

  let other;

  if(typeof value === 'number')
    other = createFraction(createTerm(createCoefficient(value)));
  else
    other = createFraction(createTerm(createCoefficient(1), [createVariable(value)]));

  for(let i = 0; i < equation.length; i++) {
    for(let j = 0; j < equation[i].length; j++) {
      equation[i][j].divide(other);
    }
  }

  updateView();
  handleSolvedEquation();
}



// Helper functions
// ------------------------------------------------------------------

function updateView() {
  equationContainer.innerHTML = equationToHTML(left, right);
}

function equationToHTML(left, right) {
  const f = (term, i) => {
    const sign = term.sign();
    return (i > 0 ? `<span>${sign >= 0 ? '+' : '-'}</span>` : '') + fractionToHTML(term, i > 0);
  }
  return `
    <div class="flex items-center gap-4">
      ${left.map((v, i) => f(v,i)).join('')}
      <span>=</span>
      ${right.map((v, i) => f(v,i)).join('')}
    </div>
  `;
}

function createButtons() {
  const container = document.createElement('div');  
  container.className = 'flex items-center gap-4';

  for(let i = 0; i < buttonConfig.length; i++) {
    const group = document.createElement('div');
    group.className = 'flex flex-col gap-4';

    for(let j = 0; j < buttonConfig[i].length; j++) {
      const row = document.createElement('div');
      row.className = 'flex gap-4';

      for(let k = 0; k < buttonConfig[i][j].length; k++) {
        if(buttonConfig[i][j][k].level > level)
          continue;

        const button = document.createElement('button');
        button.textContent = buttonConfig[i][j][k].operation + ' ' + buttonConfig[i][j][k].value;
        button.className = 'flex justify-center items-center w-16 h-12 rounded border border-white text-2xl font-mono font-bold hover:bg-white/10 active:translate-y-px';
        button.addEventListener('click', buttonConfig[i][j][k].onClick)
        buttonConfig[i][j][k].element = button;
        row.append(button);
      }
      
      if(row.children.length > 0)
        group.append(row);
    }

    if(group.children.length > 0) {
      if(i > 0) {
        const divisor = document.createElement('div');
        divisor.className = 'w-px h-full mx-4 bg-white/50';
        container.append(divisor);
      }
      container.append(group);
    }
  }

  buttonsContainer.append(container);

  const remove = () => {
    for(let i = 0; i < buttonConfig.length; i++) {
      for(let j = 0; j < buttonConfig[i].length; j++) {
        for(let k = 0; k < buttonConfig[i][j].length; k++) {
          if(buttonConfig[i][j][k].element) {
            buttonConfig[i][j][k].element.remove();
            buttonConfig[i][j][k].element = undefined;
          }
        }
      }
    }
    container.remove();
  }

  return {remove};
}