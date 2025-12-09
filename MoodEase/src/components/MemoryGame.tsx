import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check } from 'lucide-react';

const EMOJIS = ['🌸', '🌊', '☀️', '🍃', '🦋', '🎵', '⭐', '🌈'];

export function MemoryGame({ onExit }: { onExit: () => void }) {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
    setCards(shuffled);
    setFlippedCards([]);
    setMatches(0);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setMatches((m) => m + 1);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="flex justify-between w-full mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Memory Match</h3>
        <button onClick={onExit} className="text-gray-500 hover:text-gray-800">Exit</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleCardClick(index)}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-xl text-3xl flex items-center justify-center transition-all duration-300 ${
              card.flipped || card.matched
                ? 'bg-white shadow-inner rotate-0'
                : 'bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg rotate-180 text-transparent'
            }`}
          >
            {(card.flipped || card.matched) && card.emoji}
          </motion.button>
        ))}
      </div>

      {matches === EMOJIS.length && (
        <div className="text-center animate-bounce">
          <p className="text-xl font-bold text-green-600 mb-2">Wonderful!</p>
          <button
            onClick={shuffleCards}
            className="px-6 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}