import { createCoefficient, createTerm, isTerm, termToHTML } from './term.js';

// Types
// ------------------------------------------------------------------

/**
 * @typedef {import('./term.js').Term} Term
 */

/**
 * @typedef {{
 *  numerator: Term,
 *  denominator: Term,
 *  copy: () => Fraction,
 *  sign: () => number,
 *  isSimilar: (other: Fraction) => boolean,
 *  simplify: () => void,
 *  add: (other: Fraction) => void,
 *  multiply: (other: Fraction) => void,
 *  divide: (other: Fraction) => void
 * }} Fraction
 */



// Functions
// ------------------------------------------------------------------

/**
 * @param {Term|undefined} initialNumerator 
 * @param {Term|undefined} initialDenominator
 * @returns {Fraction}
 */
export function createFraction(initialNumerator, initialDenominator) {
  const numerator = isTerm(initialNumerator) ? initialNumerator.copy() : createTerm(createCoefficient(1));
  const denominator = isTerm(initialDenominator) ? initialDenominator.copy() : createTerm(createCoefficient(1));

  const copy = () => createFraction(numerator, denominator);
  const sign = () => numerator.sign() * denominator.sign();

  const isSimilar = other => numerator.isSimilar(other.numerator) && denominator.isSimilar(other.denominator);

  const simplify = () => {
    const findGcd = (a, b) => b === 0 ? a : findGcd(b, a % b);
    const gcd = Math.abs(findGcd(numerator.coefficient.getValue(), denominator.coefficient.getValue()));
    numerator.coefficient.setValue(numerator.coefficient.getValue() / gcd);
    denominator.coefficient.setValue(denominator.coefficient.getValue() / gcd);

    for(let i = 0; i < denominator.variables.length; i++) {
      const variable = denominator.variables[i];
      const numeratorVariable = numerator.variables.find(v => v.getIdentifier() === variable.getIdentifier());
      if(!numeratorVariable)
        continue;
      const min = Math.min(variable.getPower(), numeratorVariable.getPower());
      variable.setPower(variable.getPower() - min);
      numeratorVariable.setPower(numeratorVariable.getPower() - min);
    }

    numerator.clean();
    denominator.clean();
  }

  const add = other => {
    if(!isSimilar(other))
      throw new Error('Only similar fractions can be added.');

    const otherNumerator = other.numerator.copy();
    const otherDenominator = other.denominator.copy();

    otherNumerator.multiply(denominator);

    numerator.multiply(otherDenominator);
    denominator.multiply(otherDenominator);

    numerator.add(otherNumerator);
  }

  const multiply = other => {
    numerator.multiply(other.numerator);
    denominator.multiply(other.denominator);
    simplify();
  }

  const divide = other => {
    numerator.multiply(other.denominator);
    denominator.multiply(other.numerator);
    simplify();
  }

  return {numerator, denominator, copy, sign, isSimilar, simplify, add, multiply, divide};
}

/**
 * @param {Fraction} fraction
 * @param {boolean|undefined} asAbsolute
 * @returns string
 */
export function fractionToHTML(fraction, asAbsolute) {
  if(fraction.denominator.coefficient.getValue() === 1 && fraction.denominator.variables.length === 0) {
    return termToHTML(fraction.numerator, asAbsolute);
  }
  return `
    <div class="pt-2 flex flex-col gap-2 items-center">
      <div class="px-1">${termToHTML(fraction.numerator, asAbsolute)}</div>
      <hr class="block w-full h-1 border-none bg-white">
      <div class="px-1">${termToHTML(fraction.denominator, asAbsolute)}</div>
    </div>
  `;
}
