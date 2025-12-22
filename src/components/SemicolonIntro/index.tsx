import React, { useState, useEffect } from 'react';
import { scenes } from './data';
import { cn } from '../../utils/cn';

interface SemicolonIntroProps {
  onComplete: () => void;
}

const SemicolonIntro: React.FC<SemicolonIntroProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % scenes.length);
    }, 80); // Ultra fast switching

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentScene = scenes[currentIndex];
  const isVertical = currentScene.type === 'vertical';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center cursor-pointer overflow-hidden select-none font-light"
      onClick={onComplete}
    >
      {/* 
          Main Layout Container
          Horizontal: flex-row (Left - Center - Right)
          Vertical: flex-col (Top - Center - Bottom)
      */}
      <div className={cn(
        "relative flex items-center justify-center transition-all duration-75",
        isVertical ? "flex-col h-full py-20" : "flex-row w-full px-20"
      )}>
        
        {/* Before Text (Top in Vertical, Left in Horizontal) */}
        <div 
          className={cn(
            "flex-1 flex items-center",
            currentScene.fontClass,
            isVertical 
              ? "justify-end pb-2" // In flex-col, justify-end pushes to bottom (near semicolon)
              : "justify-end pr-4 text-right" // In flex-row, justify-end pushes to right (near semicolon)
          )}
          style={isVertical ? { writingMode: 'vertical-rl' } : undefined}
        >
          <span className="whitespace-nowrap">{currentScene.before}</span>
        </div>

        {/* The Semicolon (Center Anchor) */}
        <div 
          className={cn(
            "flex-none flex items-center justify-center z-10",
            currentScene.fontClass,
            isVertical ? "py-2" : "px-2"
          )}
          style={isVertical ? { writingMode: 'vertical-rl' } : undefined}
        >
          {currentScene.semicolon}
        </div>

        {/* After Text (Bottom in Vertical, Right in Horizontal) */}
        <div 
          className={cn(
            "flex-1 flex items-center",
            currentScene.fontClass,
            isVertical 
              ? "justify-start pt-2" // In flex-col, justify-start pushes to top (near semicolon)
              : "justify-start pl-4 text-left" // In flex-row, justify-start pushes to left (near semicolon)
          )}
          style={isVertical ? { writingMode: 'vertical-rl' } : undefined}
        >
          <span className="whitespace-nowrap">{currentScene.after}</span>
        </div>

      </div>

      {/* Aesthetic Overlays */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-[10px] font-mono tracking-[0.2em] uppercase animate-pulse">
        Click to initialize
      </div>
      
      <div className="absolute top-10 right-10 text-white/20 font-mono text-[10px] uppercase hidden md:block">
        {currentScene.lang} :: {currentScene.type}
      </div>
    </div>
  );
};

export default SemicolonIntro;