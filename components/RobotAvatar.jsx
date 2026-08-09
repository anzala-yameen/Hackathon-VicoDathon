import React from 'react';
import { Volume2, Sparkles, Mic, Radio, CheckCircle, Brain, ShieldCheck } from 'lucide-react';

export const RobotAvatar = ({
  isSpeaking = false,
  isThinking = false,
  statusText = 'READY'
}) => {
  return (
    <div className="relative flex flex-col items-center justify-between p-6 rounded-2xl studio-card border border-slate-800/90 overflow-hidden shadow-xl transition-all h-full min-h-[300px]">
      
      {/* Background Soft Accent Gradient */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-sky-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* TOP HEADER BADGE */}
      <div className="w-full flex items-center justify-between z-10 text-xs">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-[11px]">AI TECHNICAL ASSESSOR</span>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px]">
          <span className={`w-2 h-2 rounded-full ${
            isSpeaking ? 'bg-sky-400 animate-ping' : isThinking ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'
          }`} />
          <span className="capitalize">{isSpeaking ? 'Speaking' : isThinking ? 'Evaluating' : 'Active'}</span>
        </div>
      </div>

      {/* INTERVIEWER PROFILE AVATAR & VOICE STAGE */}
      <div className="relative flex flex-col items-center justify-center my-4 z-10 space-y-4">
        
        {/* Profile Avatar Frame with Active Pulsing Ring */}
        <div className="relative flex items-center justify-center">
          <div className={`absolute -inset-2 rounded-2xl opacity-75 blur-md transition-all duration-500 ${
            isSpeaking 
              ? 'bg-gradient-to-r from-sky-500 to-indigo-500 opacity-80 animate-pulse' 
              : isThinking 
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 opacity-60 animate-pulse' 
              : 'bg-slate-800 opacity-20'
          }`} />

          <div className="relative w-24 h-24 rounded-2xl bg-slate-900 border-2 border-slate-700/80 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Elegant AI Interviewer Photo Avatar */}
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
              alt="Alex Morgan - AI Technical Assessor"
              className="w-full h-full object-cover"
            />

            {/* Overlaid Audio Mic Icon Badge */}
            <div className={`absolute bottom-1 right-1 p-1.5 rounded-lg border text-white shadow-md transition ${
              isSpeaking ? 'bg-sky-600 border-sky-400' : isThinking ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-950/80 border-slate-700'
            }`}>
              <Mic className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="text-center space-y-1">
          <h3 className="font-bold text-white text-base tracking-tight">Alex Morgan</h3>
          <p className="text-xs text-indigo-300 font-mono">Senior AI Technical Interviewer</p>
        </div>
      </div>

      {/* LIVE AUDIO WAVEFORM VISUALIZER */}
      <div className="w-full flex flex-col items-center justify-center space-y-3 z-10">
        <div className="h-7 flex items-end justify-center space-x-1 w-full max-w-[180px] px-4 py-1 rounded-xl bg-slate-950/60 border border-slate-800">
          {isSpeaking ? (
            <>
              <span className="w-1 bg-sky-400 rounded-full animate-wave-1" />
              <span className="w-1 bg-indigo-400 rounded-full animate-wave-2" />
              <span className="w-1 bg-sky-400 rounded-full animate-wave-3" />
              <span className="w-1 bg-indigo-400 rounded-full animate-wave-4" />
              <span className="w-1 bg-purple-400 rounded-full animate-wave-5" />
              <span className="w-1 bg-indigo-400 rounded-full animate-wave-2" />
              <span className="w-1 bg-sky-400 rounded-full animate-wave-1" />
            </>
          ) : isThinking ? (
            <div className="flex items-center space-x-2 text-xs text-indigo-300 font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span className="text-[11px]">Evaluating response context...</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400" /> Voice Stream Ready
            </span>
          )}
        </div>

        {/* STATUS BADGE */}
        <div className={`w-full text-center px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition ${
          isSpeaking
            ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
            : isThinking
            ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
            : 'bg-slate-900/80 text-slate-300 border-slate-800'
        }`}>
          <span>{statusText}</span>
        </div>
      </div>

    </div>
  );
};

