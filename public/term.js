// Types
// ------------------------------------------------------------------

/**
 * @typedef {{
 *  copy: () => Coefficient,
 *  sign: () => number,
 *  getValue: () => number,
 *  setValue: (newValue: number) => void
 * }} Coefficient
 */

/**
 * @typedef {{
 *  copy: () => Variable,
 *  compare: (other: Variable) => boolean,
 *  getIdentifier: () => string,
 *  setIdentifier: (newIdentifier: string) => void,
 *  getPower: () => number,
 *  setPower: (newPower: number) => void
 * }} Variable
 */

/**
 * @typedef {{
 *  coefficient: Coefficient,
 *  variables: Array<Variable>,
 *  copy: () => Term,
 *  clean: () => void,
 *  isSimilar (other: Term) => boolean,
 *  sign: () => number,
 *  add: (other: Term) => void,
 *  multiply: (other: Term) => void,
 *  divide: (other: Term) => void
 * }} Term
 */



// Functions
// ------------------------------------------------------------------

/**
 * @param {Term} term
 * @returns {boolean} 
 */
export function isTerm(term) {
  return term && ('coefficient' in term && 'variables' in term && 'copy' in term);
}

/**
 * @param {number|undefined} initialValue 
 * @returns {Coefficient}
 */
export function createCoefficient(initialValue) {
  let value = typeof initialValue === 'number' ? initialValue : 0;

  const copy = () => createCoefficient(value);
  const sign = () => Math.sign(value);

  const getValue = () => value;
  const setValue = newValue => value = newValue;
  
  return {copy, sign, getValue, setValue};
}

/**
 * @param {string|undefined} initialIdentifier 
 * @param {number|undefined} initialPower 
 * @returns {Variable}
 */
export function createVariable(initialIdentifier, initialPower) {
  let identifier = typeof initialIdentifier === 'string' ? initialIdentifier : 'x';
  let power = typeof initialPower === 'number' ? initialPower : 1;

  const copy = () => createVariable(identifier, power);
  const compare = other => other.getIdentifier() === identifier && other.getPower() === power;
  
  const getIdentifier = () => identifier;
  const setIdentifier = newIdentifier => identifier = newIdentifier;

  const getPower = () => power;
  const setPower = newPower => power = newPower;

  return {copy, compare, getIdentifier, setIdentifier, getPower, setPower}
}

/**
 * @param {Coefficient|undefined} initialCoefficient 
 * @param {Array<Variable>|undefined} initialVariables 
 * @returns {Term}
 */
export function createTerm(initialCoefficient, initialVariables)
{
  const coefficient = ('getValue' in initialCoefficient && 'copy' in initialCoefficient) 
    ? initialCoefficient.copy() : createCoefficient(1);
  const variables = [];

  if(Array.isArray(initialVariables)) {
    for(let i = 0; i < initialVariables.length; i++) {
      variables.push(initialVariables[i].copy());
    }
  }

  const sortVariables = () => {
    variables.sort((a, b) => (
      a.power === b.power ? (a.identifier < b.identifier ? -1 : 1)
      : a.power > b.power ? -1 : 1
    ));
  }
  
  const clean = () => {
    for(let i = variables.length - 1; i >= 0; i--)
      if(variables[i].getPower() === 0)
        variables.splice(i, 1);
  }

  const copy = () => createTerm(coefficient, variables);

  const isSimilar = other => {
    if(variables.length !== other.variables.length)
      return false;
    for(let i = 0; i < variables.length; i++) 
      if(!variables[i].compare(other.variables[i]))
        return false;
    return true;
  }

  const sign = () => coefficient.sign();

  const add = other => {
    if(!isSimilar(other))
      throw new Error('Only similar terms can be added.');
    coefficient.setValue(coefficient.getValue() + other.coefficient.getValue());
  }

  const multiply = other => {
    coefficient.setValue(coefficient.getValue() * other.coefficient.getValue());
    for(let i = 0; i < other.variables.length; i++) {
      const myVariable = variables.find(v => v.getIdentifier() === other.variables[i].getIdentifier());
      if(myVariable) {
        myVariable.setPower(myVariable.getPower() + other.variables[i].getPower());
      }
      else {
        variables.push(other.variables[i].copy());
      }
    }
    clean();
    sortVariables();
  }

  const divide = other => {
    coefficient.setValue(coefficient.getValue() / other.coefficient.getValue());
    for(let i = 0; i < other.variables.length; i++) {
      const myVariable = variables.find(v => v.getIdentifier() === other.variables[i].getIdentifier());
      if(myVariable) {
        myVariable.setPower(myVariable.getPower() - other.variables[i].getPower());
      }
      else {
        variables.push(other.variables[i].copy());
      }
    }
    clean();
    sortVariables();
  }

  sortVariables();
  return {coefficient, variables, copy, clean, isSimilar, sign, add, multiply, divide}
}

/**
 * @param {Term} term 
 * @param {boolean|undefined} asAbsolute
 * @returns {string}
 */
export function termToHTML(term, asAbsolute) {
  const renderCoefficient = term.variables.length === 0 || Math.abs(term.coefficient.getValue()) !== 1;
  const renderOnlyNegativeSign = !asAbsolute && !renderCoefficient && term.sign() < 0;
  const renderVariables = term.variables.length;
  return `
    <div class="flex">
      ${renderOnlyNegativeSign ? '<span>-</span>' : ''}
      ${renderCoefficient ? `
        <span>${asAbsolute ? Math.abs(term.coefficient.getValue()) : term.coefficient.getValue()}</span>
      ` : ''}
      ${renderVariables ? term.variables.map(v => `
        <span>${v.getIdentifier()}${v.getPower() !== 1 ? `<sup>${v.getPower()}</sup>`: ''}</span>
      `).join('') : ''}
    </div>
  `;
}