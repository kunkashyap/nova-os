import React, { useState } from 'react';
import { clsx } from 'clsx';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [newNumber, setNewNumber] = useState(true);

  const handleNum = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOp = (op: string) => {
    if (op === '=' || op === 'Enter') {
      try {
        // Safe evaluation (in a real app, use a proper parser or Math.js to avoid eval risks)
        // Since we control the input strictly through buttons/filtered keyboard, it's safer.
        // Replacing visual operators with JS operators
        const evalStr = (equation + display).replace(/×/g, '*').replace(/÷/g, '/');
        // eslint-disable-next-line no-new-func
        const result = new Function('return ' + evalStr)();
        setDisplay(String(Number(result.toFixed(8)))); // handle float precision
        setEquation('');
      } catch (e) {
        setDisplay('Error');
      }
      setNewNumber(true);
    } else if (op === 'C') {
      setDisplay('0');
      setEquation('');
      setNewNumber(true);
    } else if (op === 'CE') {
      setDisplay('0');
      setNewNumber(true);
    } else if (op === '⌫' || op === 'Backspace') {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
    } else {
      // Basic operators (+, -, *, /)
      let symbol = op;
      if (op === '*') symbol = '×';
      if (op === '/') symbol = '÷';
      
      setEquation(equation + display + ' ' + symbol + ' ');
      setNewNumber(true);
    }
  };

  const btnClass = "h-14 rounded-lg text-lg font-medium transition-colors hover:bg-white/10 active:bg-white/20 active:scale-[0.98] flex items-center justify-center select-none bg-nova-surface-3 border border-nova-border";
  const opClass = "h-14 rounded-lg text-lg font-medium transition-colors hover:bg-accent-light active:bg-accent active:scale-[0.98] flex items-center justify-center select-none bg-accent/80 text-white border border-accent";

  return (
    <div 
      className="flex flex-col w-full h-full bg-nova-surface p-4 pt-6"
      tabIndex={0}
      onKeyDown={(e) => {
        if (/[0-9.]/.test(e.key)) handleNum(e.key);
        else if (['+', '-', '*', '/', 'Enter', 'Backspace', '='].includes(e.key)) {
          e.preventDefault();
          handleOp(e.key);
        } else if (e.key === 'Escape') handleOp('C');
      }}
    >
      <div className="flex-1 flex flex-col justify-end items-end p-4 rounded-xl bg-nova-surface-2 border border-nova-border mb-4">
        <div className="text-nova-text-dim text-sm h-5 overflow-hidden w-full text-right">{equation}</div>
        <div className="text-4xl font-light text-white overflow-hidden w-full text-right truncate tracking-tight">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button className={btnClass} onClick={() => handleOp('CE')}>CE</button>
        <button className={btnClass} onClick={() => handleOp('C')}>C</button>
        <button className={btnClass} onClick={() => handleOp('⌫')}>⌫</button>
        <button className={opClass} onClick={() => handleOp('/')}>÷</button>

        <button className={btnClass} onClick={() => handleNum('7')}>7</button>
        <button className={btnClass} onClick={() => handleNum('8')}>8</button>
        <button className={btnClass} onClick={() => handleNum('9')}>9</button>
        <button className={opClass} onClick={() => handleOp('*')}>×</button>

        <button className={btnClass} onClick={() => handleNum('4')}>4</button>
        <button className={btnClass} onClick={() => handleNum('5')}>5</button>
        <button className={btnClass} onClick={() => handleNum('6')}>6</button>
        <button className={opClass} onClick={() => handleOp('-')}>−</button>

        <button className={btnClass} onClick={() => handleNum('1')}>1</button>
        <button className={btnClass} onClick={() => handleNum('2')}>2</button>
        <button className={btnClass} onClick={() => handleNum('3')}>3</button>
        <button className={opClass} onClick={() => handleOp('+')}>+</button>

        <button className={clsx(btnClass, "col-span-2")} onClick={() => handleNum('0')}>0</button>
        <button className={btnClass} onClick={() => handleNum('.')}>.</button>
        <button className={opClass} onClick={() => handleOp('=')}>=</button>
      </div>
    </div>
  );
};
