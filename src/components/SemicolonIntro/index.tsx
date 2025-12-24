import React, { useState, useEffect } from "react";
import { scenes } from "./data";
import { cn } from "../../utils/cn";
import { SemicolonLogo } from "../ui/SemicolonLogo";

interface SemicolonIntroProps {
  onComplete: () => void;
}

const MARQUEE_TICKS = 40;
const TRANSITION_TICKS = 40;
const TOTAL_TICKS = MARQUEE_TICKS + TRANSITION_TICKS;
const INTERVAL_MS = 60; // Slightly faster ticks for smoother animation feel

const SemicolonIntro: React.FC<SemicolonIntroProps> = ({ onComplete }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => {
        if (prev >= TOTAL_TICKS) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tick >= TOTAL_TICKS) {
      // Add a small delay before unmounting to ensure the "full white" or "transition" state is perceived
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [tick, onComplete]);

  // Determine current phase
  const isMarquee = tick < MARQUEE_TICKS;

  // Logic for Marquee Phase
  // Cycle through scenes based on tick
  // The user wants the marquee (switching) to continue even during the transition/zoom phase
  const sceneIndex = tick % scenes.length;
  const currentScene = scenes[sceneIndex];
  const isVertical = currentScene.type === "vertical";

  // Logic for Transition Phase
  const transitionProgress = isMarquee
    ? 0
    : Math.min(1, (tick - MARQUEE_TICKS) / TRANSITION_TICKS);

  // Easing function for smoother zoom
  const easeInExpo = (x: number): number => {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
  };

  const scale = 1 + easeInExpo(transitionProgress) * 2.3; // Scale from 1 to 3.3x to match cover size
  const opacity = 1 - Math.pow(transitionProgress, 3); // Fade out cubic

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center cursor-pointer overflow-hidden select-none"
      onClick={tick >= TOTAL_TICKS ? onComplete : undefined}
    >
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-75",
          isVertical ? "flex-col h-full py-20" : "flex-row w-full px-20"
        )}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Before Text */}
        <div
          className={cn(
            "flex-1 flex items-center min-w-0 overflow-hidden",
            currentScene.fontClass,
            isVertical ? "justify-end pb-2" : "justify-end pr-8 text-right"
          )}
          style={{
            writingMode: isVertical ? "vertical-rl" : undefined,
            opacity: opacity,
          }}
        >
          <span className="whitespace-nowrap">{currentScene.before}</span>
        </div>

        {/* The Centerpiece (Semicolon or Logo) */}
        <div
          className={cn(
            "flex-none flex items-center justify-center z-10 relative",
            currentScene.fontClass,
            isVertical ? "py-2" : "px-2"
          )}
          style={{
            writingMode: isVertical ? "vertical-rl" : undefined,
          }}
        >
          {/* 
              During marquee: Show text semicolon.
              During transition: Show Logo, overlaid or replaced.
           */}
          {isMarquee ? (
            <span className="leading-none">{currentScene.semicolon}</span>
          ) : (
            <SemicolonLogo
              className="h-[1em] w-auto" // Match font size roughly
            />
          )}
        </div>

        {/* After Text */}
        <div
          className={cn(
            "flex-1 flex items-center min-w-0 overflow-hidden",
            currentScene.fontClass,
            isVertical ? "justify-start pt-2" : "justify-start pl-8 text-left"
          )}
          style={{
            writingMode: isVertical ? "vertical-rl" : undefined,
            opacity: opacity,
          }}
        >
          <span className="whitespace-nowrap">{currentScene.after}</span>
        </div>
      </div>

      {/* Aesthetic Overlays - Fade out during transition */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-[10px] font-mono tracking-[0.2em] uppercase animate-pulse"
        style={{ opacity }}
      >
        Initializing...
      </div>
    </div>
  );
};

export default SemicolonIntro;
