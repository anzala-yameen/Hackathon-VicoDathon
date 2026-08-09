import React, { useState, useEffect, useRef } from 'react';
import { useInterview } from '../context/InterviewContext';
import { RobotAvatar } from './RobotAvatar';
import { QuestionTimer } from './QuestionTimer';
import { 
  User, Send, Clock, Sparkles, Flame, Layers, CheckCircle2,
  ArrowRight, Loader2, Lightbulb, Terminal, Zap, MessageSquare
} from 'lucide-react';

export const InterviewRoom = () => {
  const { 
    selectedCandidate, 
    sessionId, 
    questionNumber, 
    totalQuestions, 
    currentTopic, 
    currentDifficulty, 
    chatMessages, 
    isSubmitting, 
    submitAnswer,
    error
  } = useInterview();

  const [inputAnswer, setInputAnswer] = useState('');
  const [typedQuestionText, setTypedQuestionText] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(90); // 1:30 mins = 90 secs per question

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Get current active interviewer question
  const latestInterviewerMsg = [...chatMessages].reverse().find(m => m.sender === 'interviewer');
  const fullQuestionText = latestInterviewerMsg ? latestInterviewerMsg.text : '';

  // PER-QUESTION COUNTDOWN TIMER EFFECT (90 Seconds = 1:30 mins)
  useEffect(() => {
    setSecondsLeft(90);
  }, [questionNumber, latestInterviewerMsg?.id]);

  useEffect(() => {
    if (isSubmitting || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isSubmitting]);

  // Handle auto-submit when 1:30 timer expires
  const handleTimeExpired = () => {
    if (isSubmitting) return;
    const finalAnswer = inputAnswer.trim() || `[Time expired] Candidate was unable to submit response within the 1:30 time limit for Question ${questionNumber}.`;
    setInputAnswer('');
    submitAnswer(finalAnswer);
  };

  // TYPEWRITER ANIMATION EFFECT FOR QUESTION
  useEffect(() => {
    if (!fullQuestionText) return;

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    
    setTypedQuestionText('');
    let charIndex = 0;
    
    typingTimerRef.current = setInterval(() => {
      if (charIndex < fullQuestionText.length) {
        setTypedQuestionText(fullQuestionText.slice(0, charIndex + 2));
        charIndex += 2;
      } else {
        setTypedQuestionText(fullQuestionText);
        clearInterval(typingTimerRef.current);
      }
    }, 12);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [fullQuestionText]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSubmitting, typedQuestionText]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputAnswer.trim() || isSubmitting) return;

    const textToSubmit = inputAnswer;
    setInputAnswer('');
    submitAnswer(textToSubmit);
  };

  const insertQuickAnswer = (sampleText) => {
    setInputAnswer(sampleText);
  };

  const progressPct = Math.round((questionNumber / totalQuestions) * 100);

  // Status message text for interviewer card
  const robotStatusText = isSubmitting 
    ? 'EVALUATING RESPONSE...' 
    : 'AWAITING CANDIDATE ANSWER (90s MAX)';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in space-y-6">
      
      {/* ASSESSMENT WORKSPACE HEADER */}
      <div className="studio-panel rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Candidate Info */}
        <div className="flex items-center space-x-3.5 w-full md:w-auto">
          <div className="relative">
            <img
              src={selectedCandidate?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt="Candidate"
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/30 shadow-md"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-white text-base tracking-tight">{selectedCandidate?.name || "Candidate"}</h2>
              <span className="text-[11px] text-indigo-300 font-mono px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30">
                {selectedCandidate?.targetRole || "AI Engineer"}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Domain: <strong className="text-indigo-300 font-mono">{currentTopic}</strong></span>
            </div>
          </div>
        </div>

        {/* Status Indicators: Difficulty, 1:30 Timer, Question Counter */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          
          {/* Difficulty Gauge Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <Flame className={`w-3.5 h-3.5 ${
              currentDifficulty === 'Advanced' ? 'text-rose-400' :
              currentDifficulty === 'Intermediate' ? 'text-amber-400' : 'text-emerald-400'
            }`} />
            <span className="text-slate-400 font-mono">Difficulty:</span>
            <span className={`font-semibold font-mono ${
              currentDifficulty === 'Advanced' ? 'text-rose-400' :
              currentDifficulty === 'Intermediate' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {currentDifficulty}
            </span>
          </div>

          {/* PER-QUESTION COUNTDOWN TIMER */}
          <QuestionTimer secondsLeft={secondsLeft} isSubmitting={isSubmitting} />

          {/* Question Counter Pill */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono font-bold text-xs shadow-sm">
            Question {questionNumber} of {totalQuestions}
          </div>
        </div>

      </div>

      {/* OVERALL PROGRESS BAR */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden p-0 border border-slate-800/80">
        <div 
          className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* STAGE 1: INTERVIEWER CONSOLE & ACTIVE QUESTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: INTERVIEWER AVATAR PANEL */}
        <div className="lg:col-span-5 flex flex-col">
          <RobotAvatar
            isThinking={isSubmitting}
            statusText={robotStatusText}
          />
        </div>

        {/* RIGHT: CURRENT QUESTION ASSESSMENT CONSOLE */}
        <div className="lg:col-span-7 studio-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between shadow-xl relative min-h-[300px]">
          {/* Header Bar */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400">
                <MessageSquare className="w-4 h-4 text-indigo-300" />
                <span className="font-semibold uppercase tracking-wider">Evaluation Question #{questionNumber}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                  {currentTopic}
                </span>
              </div>
            </div>

            {/* Question Text with Typewriter Animation Effect */}
            <div className="space-y-3 pt-1">
              <div className="text-slate-100 text-base sm:text-lg leading-relaxed font-sans font-medium min-h-[100px] border-l-2 border-indigo-500/80 pl-4 py-1">
                {typedQuestionText || fullQuestionText || (
                  <span className="text-slate-500 italic">Synthesizing technical question...</span>
                )}
                {typedQuestionText.length < fullQuestionText.length && (
                  <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-300" /> Grounded Evaluation
            </span>
            <span>Target Role: {selectedCandidate?.targetRole || "AI Engineer"}</span>
          </div>
        </div>

      </div>

      {/* STAGE 2: CANDIDATE TECHNICAL RESPONSE CONSOLE */}
      <div className="studio-panel rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
        
        {/* Answer Console Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <label htmlFor="answerConsole" className="font-semibold text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Candidate Technical Response Console
            </label>
            <span className="text-slate-500 text-[11px]">90s timer per question</span>
          </div>

          <div className="relative">
            <textarea
              id="answerConsole"
              rows={4}
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              disabled={isSubmitting}
              placeholder="Formulate your technical response here... Detail system architecture, trade-offs, vector search mechanics, or implementation logic..."
              className="w-full p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans text-sm leading-relaxed shadow-inner disabled:opacity-50 transition resize-y"
            />
          </div>

          {/* Quick Demo Assist Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 text-[11px] font-mono flex items-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 mr-1" /> Quick Shortcuts:
              </span>
              <button
                type="button"
                onClick={() => insertQuickAnswer("I use HNSW vector indexing for log(N) nearest-neighbor search, while IVF-PQ compresses vector memory embeddings using inverted files.")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-mono transition"
              >
                HNSW vs IVF-PQ
              </button>
              <button
                type="button"
                onClick={() => insertQuickAnswer("To prevent prompt injection, I isolate user input within delimiters, validate Pydantic output schemas, and use system prompt guardrails.")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-mono transition"
              >
                Prompt Guardrails
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputAnswer.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs font-mono shadow-md disabled:opacity-50 transition flex items-center space-x-2 shrink-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* TRANSCRIPT HISTORY FEED */}
        {chatMessages.length > 1 && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
              Assessment Transcript Feed ({chatMessages.length} Messages)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {chatMessages.map((msg, index) => (
                <div 
                  key={msg.id || index}
                  className={`p-3.5 rounded-xl text-xs space-y-1 transition border ${
                    msg.sender === 'interviewer'
                      ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                      : 'bg-indigo-950/30 border-indigo-500/20 text-indigo-200 ml-4 sm:ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="font-semibold flex items-center gap-1">
                      {msg.sender === 'interviewer' ? (
                        <span className="text-indigo-400 flex items-center gap-1">Alex Morgan (Interviewer)</span>
                      ) : (
                        <span className="text-sky-400 flex items-center gap-1">Candidate Response</span>
                      )}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed font-sans">{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

