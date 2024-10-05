import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { PartyPopper } from 'lucide-react';

// Mock data for participants
const mockData = [
  { name: "Player 1", deposit: 0.02, color: "#FF69B4" }, // Pink
  { name: "Player 2", deposit: 0.015, color: "#9370DB" }, // Purple
  { name: "Player 3", deposit: 0.02, color: "#40E0D0" }, // Turquoise
  { name: "Player 4", deposit: 0.015, color: "#FFFF00" }, // Yellow
];

// Calculate total and percentages
const total = mockData.reduce((sum, item) => sum + item.deposit, 0);
const data = total !== 0 ? mockData.map(item => ({
  ...item,
  value: (item.deposit / total) * 100,
})) : [];

const SpinnerWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    let timer;
    if (!isSpinning) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            selectWinner();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSpinning]);

  const selectWinner = () => {
    setIsSpinning(true);
    setWinner(null);
    setShowCelebration(false);
    
    const newRotation = rotation + 1440 + Math.random() * 360;
    setRotation(newRotation);
    
    setTimeout(() => {
      const finalPosition = newRotation % 360;
      let currentAngle = 0;
      
      const winner = data.find((segment) => {
        currentAngle += segment.value * 3.6;
        return finalPosition < currentAngle || finalPosition === 360;
      });
      
      setWinner(winner);
      setShowCelebration(true);
      setIsSpinning(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      {/* Countdown Display */}
      <div className="text-4xl font-bold text-white mb-4">
        {!isSpinning && countdown}
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="animate-bounce">
            <PartyPopper className="w-16 h-16 text-yellow-400" />
          </div>
        </div>
      )}

      <div className="relative w-64 h-64 mb-8">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-white">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-white transform rotate-45" />
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full"
             style={{
               transform: `rotate(${rotation}deg)`,
               transition: 'transform 5s cubic-bezier(0.4, 0, 0.2, 1)',
               transformOrigin: 'center'
             }}>
          <PieChart width={256} height={256}>
            <Pie
              data={data}
              cx={128}
              cy={128}
              innerRadius={60}
              outerRadius={120}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="#1a1a1a" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-full p-4 w-32 h-32 flex flex-col items-center justify-center border border-gray-800">
          <div className="flex items-center gap-1 mb-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L1.5 12L12 22L22.5 12L12 2Z" fill="#fff"/>
            </svg>
            <span className="text-white font-mono">{total.toFixed(2)}</span>
          </div>
          <span className={`text-sm font-mono ${showCelebration ? 'text-yellow-400 animate-pulse' : 'text-lime-400'}`}>
            {isSpinning ? 'Drawing Winner...' : winner ? `${winner.name} Wins!` : 'Ready'}
          </span>
        </div>
      </div>

      <div className="w-full max-w-md bg-gray-800 rounded-lg p-4">
        <div className="space-y-2">
          {data.map((player) => (
            <div key={player.name} 
                 className={`flex justify-between items-center p-2 rounded ${
                   winner?.name === player.name ? 'bg-gray-700' : ''
                 }`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                <span className="text-white">{player.name}</span>
              </div>
              <span className="text-gray-400">
                {player.deposit} ETH ({player.value.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={selectWinner}
        disabled={isSpinning}
        className={`mt-6 px-6 py-2 rounded-lg font-medium ${
          isSpinning 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isSpinning ? 'Spinning...' : 'Spin Now'}
      </button>
    </div>
  );
};

export default SpinnerWheel;