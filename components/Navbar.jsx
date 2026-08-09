import React from 'react';
import { useInterview } from '../context/InterviewContext';
import { Sparkles, User, ArrowLeft, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export const Navbar = ({ onOpenCandidateModal }) => {
  const { 
    currentScreen, 
    selectedCandidate, 
    resetToLanding 
  } = useInterview();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={resetToLanding}>
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">TalentEval <span className="text-indigo-400 font-mono text-sm">AI</span></span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">AI Engineering Technical Assessment</p>
          </div>
        </div>

        {/* Candidate Switcher & Navigation */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Candidate Profile Button */}
          {selectedCandidate && (
            <button
              onClick={onOpenCandidateModal}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-xs sm:text-sm text-slate-300 transition-all hover:border-slate-700 shadow-sm"
              title="Click to switch candidate profile"
            >
              <img
                src={selectedCandidate.avatarUrl}
                alt={selectedCandidate.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
              />
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-100 text-xs leading-none">{selectedCandidate.name}</div>
                <div className="text-[10px] text-indigo-400 leading-none mt-1 font-mono">{selectedCandidate.targetRole}</div>
              </div>
              <span className="text-xs text-indigo-400 font-medium font-mono pl-1 border-l border-slate-800">Switch</span>
            </button>
          )}

          {/* Screen Navigation Links */}
          {currentScreen === 'interview' && (
            <button
              onClick={resetToLanding}
              className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-900 border border-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Session</span>
            </button>
          )}

          {currentScreen === 'feedback' && (
            <button
              onClick={resetToLanding}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs font-mono transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};

