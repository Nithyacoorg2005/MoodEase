import { useState } from 'react';
import { Shuffle, Check } from 'lucide-react';

const WORDS = [
  'PEACE', 'CALM', 'JOY', 'HOPE', 'LOVE', 'FOCUS', 'BREATHE', 'SMILE', 'GROWTH'
];

export function WordScramble({ onExit }: { onExit: () => void }) {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  // Start game on mount
  useState(() => {
    nextWord();
  });

  function nextWord() {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setScrambled(word.split('').sort(() => Math.random() - 0.5).join(''));
    setInput('');
    setMessage('');
  }

  const checkAnswer = () => {
    if (input.toUpperCase() === currentWord) {
      setMessage('Correct! 🎉');
      setTimeout(nextWord, 1500);
    } else {
      setMessage('Try again!');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="flex justify-between w-full mb-8">
        <h3 className="text-2xl font-bold text-gray-800">Word Scramble</h3>
        <button onClick={onExit} className="text-gray-500 hover:text-gray-800">Exit</button>
      </div>

      <div className="bg-orange-100 p-8 rounded-3xl mb-8 w-full text-center">
        <p className="text-sm text-orange-600 font-bold tracking-widest mb-2">UNSCRAMBLE</p>
        <h2 className="text-4xl font-mono font-bold text-gray-800 tracking-[0.5em]">
          {scrambled}
        </h2>
      </div>

      <div className="relative w-full mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          className="w-full p-4 text-center text-2xl font-bold border-2 border-orange-200 rounded-2xl focus:border-orange-500 outline-none uppercase"
          placeholder="Type here..."
        />
      </div>

      <button
        onClick={checkAnswer}
        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
      >
        <Check size={20} /> Check Answer
      </button>

      {message && (
        <p className={`mt-4 font-bold ${message.includes('Correct') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
      
      <button onClick={nextWord} className="mt-8 text-gray-400 hover:text-gray-600 flex items-center gap-2 text-sm">
        <Shuffle size={14} /> Skip Word
      </button>
    </div>
  );
}