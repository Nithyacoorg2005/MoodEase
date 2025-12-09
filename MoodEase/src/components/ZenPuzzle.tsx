import { useState, useEffect } from 'react';

export function ZenPuzzle({ onExit }: { onExit: () => void }) {
  const [tiles, setTiles] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    shuffleTiles();
  }, []);

  const shuffleTiles = () => {
    // Simple shuffle for 3x3 grid (0 is empty space)
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    // Randomize
    arr.sort(() => Math.random() - 0.5);
    setTiles(arr);
    setIsSolved(false);
  };

  const moveTile = (index: number) => {
    if (isSolved) return;
    
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    // Check if adjacent (up, down, left, right)
    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      checkWin(newTiles);
    }
  };

  const checkWin = (currentTiles: number[]) => {
    const winState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    if (JSON.stringify(currentTiles) === JSON.stringify(winState)) {
      setIsSolved(true);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Zen Puzzle</h3>
        <button onClick={onExit} className="text-gray-500 hover:text-gray-800">Exit</button>
      </div>

      <div className="bg-amber-100 p-2 rounded-2xl shadow-inner mb-6">
        <div className="grid grid-cols-3 gap-2 w-64 h-64">
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => moveTile(index)}
              className={`rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                tile === 0
                  ? 'bg-transparent cursor-default'
                  : 'bg-white shadow-md text-amber-600 hover:bg-amber-50 active:scale-95'
              } ${isSolved ? 'bg-green-100 text-green-600' : ''}`}
            >
              {tile !== 0 ? tile : ''}
            </button>
          ))}
        </div>
      </div>

      {isSolved ? (
        <div className="text-center">
          <p className="text-green-600 font-bold text-xl mb-4">Puzzle Solved!</p>
          <button onClick={shuffleTiles} className="px-6 py-2 bg-amber-500 text-white rounded-xl">
            Play Again
          </button>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Order the tiles 1-8. Tap a tile to move it.</p>
      )}
    </div>
  );
}