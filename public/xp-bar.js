
/**
 * @param {number} currentLevel 
 * @param {number} xpPerLevel 
 * @param {HTMLElement} parentElement 
 */
export function createXpBar(currentLevel, xpPerLevel, parentElement) {
  let xp = 0;

  const container = document.createElement('div');
  container.className = 'flex relative w-2/3';

  const label = document.createElement('div');
  label.className = 'absolute ml-0 font-bold translate-y-[-1.75rem]'
  label.textContent = 'Level: ' + currentLevel;
  container.append(label);

  const bars = [];
  for(let i = 0; i < xpPerLevel; i++) {
    const bar = document.createElement('div');
    bar.className = `w-full h-6 border border-white ${
      i > 0 ? 'border-l-0 ' : ''
    }${
      i === 0 ? 'rounded-l-[99px] ' : ''
    }${
      i === xpPerLevel-1 ? 'rounded-r-[99px] ' : ''
    }`
    bars.push(bar);
    container.append(bar);
  }

  const surpriseBoxContainer = document.createElement('div');
  surpriseBoxContainer.className = 'absolute right-[-5rem] top-[-0.75rem] animate-bounce';
  const surpriseBox = document.createElement('div');
  surpriseBox.className = 'flex justify-center items-center shrink-0 w-16 h-16 rounded border border-2 border-white text-4xl font-bold animate-bounce animate-wiggle'
  surpriseBox.textContent = '?'
  surpriseBoxContainer.append(surpriseBox);
  container.append(surpriseBoxContainer);

  parentElement.append(container);

  const remove = () => {
    container.remove();
  }

  const addXp = () => {
    bars[xp].className += ' bg-white/75';
    xp++;
  }

  const highlight = () => {
    label.className += ' text-amber-300'
    for(let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      bar.className = `w-full h-6 border border-amber-300 bg-amber-300 ${
        i > 0 ? 'border-l-0 ' : ''
      }${
        i === 0 ? 'rounded-l-[99px] ' : ''
      }${
        i === xpPerLevel-1 ? 'rounded-r-[99px] ' : ''
      }`
    }
    surpriseBoxContainer.remove();
  }

  const isCompleted = () => {
    return xp >= bars.length;
  }

  return {remove, addXp, highlight, isCompleted}
}
