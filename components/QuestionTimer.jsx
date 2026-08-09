import React, { useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const QuestionTimer = ({
  secondsLeft = 90,
  totalSeconds = 90,
  onTimeExpired
}) => {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const pct = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));

  const isWarning = secondsLeft <= 45 && secondsLeft > 15;
  const isCritical = secondsLeft <= 15;

  return (
    <div className={`flex items-center space-x-3 px-4 py-2 rounded-2xl border transition-all ${
      isCritical
        ? 'bg-rose-950/60 border-rose-500/80 text-rose-300 cyber-glow-rose animate-pulse'
        : isWarning
        ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
        : 'bg-slate-900/90 border-cyan-500/40 text-cyan-300'
    }`}>
      {/* Radial Circle Timer Gauge */}
      <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={isCritical ? "#f43f5e" : isWarning ? "#f59e0b" : "#38bdf8"}
            strokeWidth="3.5"
            strokeDasharray={`${pct}, 100`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute text-[10px] font-mono font-bold">
          {secondsLeft}s
        </span>
      </div>

      {/* Digital Clock Display */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1 text-[10px] uppercase font-mono tracking-wider opacity-80">
          {isCritical ? (
            <AlertTriangle className="w-3 h-3 text-rose-400 animate-bounce" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          <span>{isCritical ? 'TIME CRITICAL' : 'Q TIMER'}</span>
        </div>
        <span className="text-base font-mono font-extrabold tracking-widest">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
