import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Sector } from 'recharts';
import { PartyPopper } from 'lucide-react';

const mockData = [
  { name: "Mr 1", deposit: 0.02, color: "#FF69B4" },
  { name: "Mr 2", deposit: 0.015, color: "#9370DB" },
  { name: "Mr 3", deposit: 0.02, color: "#40E0D0" },
  { name: "Mr 4", deposit: 0.015, color: "#FFFF00" },
];

const total = mockData.reduce((sum, item) => sum + item.deposit, 0);
const data = total !== 0 ? mockData.map(item => ({
  ...item,
  value: (item.deposit / total) * 100,
})) : [];

const CustomTooltip = ({ active, payload, position }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div 
        className="absolute bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 shadow-lg z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(10px, 10px)',
        }}
      >
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-gray-300">{data.deposit} ETH</p>
          <p className="text-gray-400">{data.value.toFixed(1)}%</p>
        </div>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
};

const SpinnerWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const selectWinner = useCallback(() => {
    setIsSpinning(true);
    setWinner(null);
    setShowCelebration(false);
    setActiveIndex(null);
    
    const spins = 10 + Math.random() * 5;
    const newRotation = rotation + (spins * 360) + Math.random() * 360;
    setRotation(newRotation);
    
    setTimeout(() => {
      const finalPosition = newRotation % 360;
      let currentAngle = 0;
      
      const winner = data.find((segment) => {
        const nextAngle = currentAngle + segment.value * 3.6;
        const isWinner = finalPosition >= currentAngle && finalPosition < nextAngle;
        currentAngle = nextAngle;
        return isWinner;
      });
      
      setWinner(winner);
      setShowCelebration(true);
      setIsSpinning(false);
      
      // Start loading for next round after a short delay
      setTimeout(() => {
        setIsLoading(true);
      }, 3000); // 3 seconds delay to show the winner before loading starts
    }, 5000); // 5 seconds for the wheel to spin
  }, [rotation]);

  useEffect(() => {
    let loadingTimer;
    if (isLoading) {
      loadingTimer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(loadingTimer);
            setIsLoading(false);
            setLoadingProgress(0);
            setShowCelebration(false);
            selectWinner(); // 
            return 0;
          }
          return prev + 1;
        });
      }, 50); // 50ms * 100 = 5000ms (5 seconds)
    }
    return () => clearInterval(loadingTimer);
  }, [isLoading, selectWinner]);

  const handleMouseEnter = (_, index) => {
    if (!isSpinning) {
      setActiveIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (!isSpinning) {
      setActiveIndex(null);
    }
  };

  const handleMouseMove = (event) => {
    if (!isSpinning) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ 
        x: event.clientX - rect.left, 
        y: event.clientY - rect.top 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="animate-bounce">
            <PartyPopper className="w-16 h-16 text-yellow-400" />
          </div>
        </div>
      )}

      <div className="relative w-96 h-96 mb-8">
        {/* Pointer Triangle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <div className="w-4 h-4 bg-white transform rotate-45" />
        </div>
        
        {/* Spinning Wheel Container */}
        <div className="absolute inset-0"
             style={{
               transform: `rotate(${rotation}deg)`,
               transition: isSpinning ? 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
               transformOrigin: 'center',
             }}
             onMouseMove={handleMouseMove}>
          <PieChart width={384} height={384}>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx={192}
              cy={192}
              innerRadius={90}
              outerRadius={180}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={450}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {data.map((entry) => (
                <Cell 
                  key={entry.name} 
                  fill={entry.color}
                />
              ))}
            </Pie>
          </PieChart>
        </div>

        {/* Loading Animation */}
        {isLoading && (
          <div className="absolute inset-0 z-30">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeDasharray="301.59"
                strokeDashoffset={301.59 - (301.59 * loadingProgress) / 100}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        )}

        {/* Center Display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-full p-4 w-40 h-40 flex flex-col items-center justify-center border border-gray-800 z-20">
          <div className="flex items-center gap-1 mb-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L1.5 12L12 22L22.5 12L12 2Z" fill="#fff"/>
            </svg>
            <span className="text-white font-mono">{total.toFixed(2)}</span>
          </div>
          <span className={`text-sm font-mono ${showCelebration ? 'text-yellow-400 animate-pulse' : 'text-lime-400'}`}>
            {isSpinning ? 'Drawing Winner...' : 
             showCelebration ? `${winner.name} Wins!` :
             isLoading ? 'Preparing Next Draw' : 
             'Ready'}
          </span>
        </div>

        {/* Tooltip */}
        {activeIndex !== null && (
          <CustomTooltip 
            active={true} 
            payload={[{ payload: data[activeIndex] }]}
            position={tooltipPosition}
          />
        )}
      </div>

    </div>
  );
};

export default SpinnerWheel;