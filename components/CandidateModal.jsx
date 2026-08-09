import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import { X, CheckCircle2, XCircle, AlertTriangle, BookOpen, Search, User } from 'lucide-react';

export const CandidateModal = ({ isOpen, onClose }) => {
  const { candidates, selectedCandidate, setSelectedCandidate, startNewInterview } = useInterview();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.targetRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.candidateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl studio-panel rounded-2xl border border-slate-800 p-6 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white font-sans">
                Candidate Directory ({candidates.length} Profiles)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Select a candidate profile with verified cohort learning signals to launch a tailored technical assessment.
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredCandidates.map((cand) => {
            const isSelected = selectedCandidate?.candidateId === cand.candidateId;
            return (
              <div
                key={cand.candidateId}
                onClick={() => setSelectedCandidate(cand)}
                className={`cursor-pointer rounded-xl p-4 transition-all border ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={cand.avatarUrl}
                    alt={cand.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-700 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-white text-sm">{cand.name}</h3>
                      <span className="text-[10px] font-mono text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30">
                        {cand.candidateId}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-300 font-mono mt-0.5">{cand.targetRole}</p>
                    <span className="text-[10px] text-slate-400 block">{cand.experienceLevel}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Missions Completed</span>
                    <span className="text-indigo-400 font-bold">{cand.learningJourney?.missionsCompleted || 28}/31</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden p-0 border border-slate-800">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${cand.learningJourney?.overallProgressPct || 85}%` }}
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                    <span className="flex items-center text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> {cand.completedTopics?.length || 0} Strong
                    </span>
                    <span className="flex items-center text-amber-400">
                      <AlertTriangle className="w-3 h-3 mr-1" /> {cand.weakTopics?.length || 0} Probing Focus
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Candidate Detailed Inspection */}
        {selectedCandidate && (
          <div className="studio-card rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Candidate Overview: {selectedCandidate.name} ({selectedCandidate.candidateId})
              </h4>
              <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 font-mono">
                {selectedCandidate.learningJourney?.cohortBatch || "31-Day AI Cohort"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              
              {/* Completed Topics */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
                <div className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strong Topics ({selectedCandidate.completedTopics?.length})
                </div>
                <ul className="space-y-1 text-slate-300 font-sans">
                  {selectedCandidate.completedTopics?.slice(0, 3).map((t, idx) => (
                    <li key={idx} className="truncate">• {t}</li>
                  ))}
                </ul>
              </div>

              {/* Weak Topics */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
                <div className="font-semibold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Assessment Focus ({selectedCandidate.weakTopics?.length})
                </div>
                <ul className="space-y-1 text-slate-300 font-sans">
                  {selectedCandidate.weakTopics?.map((t, idx) => (
                    <li key={idx} className="truncate">• {t}</li>
                  ))}
                </ul>
              </div>

              {/* Skipped Topics */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
                <div className="font-semibold text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Pending Modules ({selectedCandidate.skippedTopics?.length})
                </div>
                <ul className="space-y-1 text-slate-300 font-sans">
                  {selectedCandidate.skippedTopics?.length > 0 ? (
                    selectedCandidate.skippedTopics?.map((t, idx) => (
                      <li key={idx} className="truncate">• {t}</li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic">Completed all modules</li>
                  )}
                </ul>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-semibold hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  startNewInterview(selectedCandidate.candidateId);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold font-mono shadow-md transition"
              >
                Start Assessment for {selectedCandidate.name}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

