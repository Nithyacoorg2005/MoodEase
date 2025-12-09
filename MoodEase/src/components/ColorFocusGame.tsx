import { useState, useEffect } from 'react';

const COLORS = [
  { name: 'Red', class: 'text-red-500', bg: 'bg-red-500' },
  { name: 'Blue', class: 'text-blue-500', bg: 'bg-blue-500' },
  { name: 'Green', class: 'text-green-500', bg: 'bg-green-500' },
  { name: 'Purple', class: 'text-purple-500', bg: 'bg-purple-500' },
];

export function ColorFocusGame({ onExit }: { onExit: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState(COLORS[0]);
  const [currentColor, setCurrentColor] = useState(COLORS[1]);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

  useEffect(() => {
    if (timeLeft > 0 && gameState === 'playing') {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameState('finished');
    }
  }, [timeLeft, gameState]);

  const generateRound = () => {
    const randomWord = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setCurrentWord(randomWord);
    setCurrentColor(randomColor);
  };

  const handleGuess = (selectedColorName: string) => {
    if (selectedColorName === currentColor.name) {
      setScore((s) => s + 1);
      generateRound();
    } else {
      setScore((s) => Math.max(0, s - 1)); // Penalty
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="flex justify-between w-full mb-6 items-center">
        <h3 className="text-2xl font-bold text-gray-800">Color Focus</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">Time</p>
          <p className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-gray-800'}`}>{timeLeft}s</p>
        </div>
      </div>

      {gameState === 'playing' ? (
        <>
          <div className="text-center mb-12">
            <p className="text-gray-500 mb-2">Tap the color of the text!</p>
            <h2 className={`text-6xl font-black ${currentColor.class}`}>
              {currentWord.name}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleGuess(color.name)}
                className={`${color.bg} text-white py-6 rounded-2xl text-xl font-bold hover:opacity-90 transition-opacity shadow-md active:scale-95`}
              >
                {color.name}
              </button>
            ))}
          </div>
          <p className="mt-8 text-2xl font-bold text-gray-300">Score: {score}</p>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Time's Up!</h2>
          <p className="text-2xl text-gray-600 mb-8">Final Score: {score}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setScore(0);
                setTimeLeft(30);
                setGameState('playing');
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600"
            >
              Play Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}