import React, { useState } from 'react';
import { InterviewProvider, useInterview } from './context/InterviewContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { InterviewRoom } from './components/InterviewRoom';
import { FeedbackDashboard } from './components/FeedbackDashboard';
import { CandidateModal } from './components/CandidateModal';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainContent = () => {
  const { currentScreen } = useInterview();
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenCandidateModal={() => setIsCandidateModalOpen(true)} />
      
      <main className="flex-1">
        {currentScreen === 'landing' && (
          <LandingPage onOpenCandidateModal={() => setIsCandidateModalOpen(true)} />
        )}
        {currentScreen === 'interview' && (
          <InterviewRoom />
        )}
        {currentScreen === 'feedback' && (
          <FeedbackDashboard />
        )}
      </main>

      <CandidateModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
      />

      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500 font-mono">
        TalentEval AI • Technical Interview Studio for AI Engineers • Grounded Cohort Assessment Engine
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <InterviewProvider>
        <MainContent />
      </InterviewProvider>
    </ErrorBoundary>
  );
}
