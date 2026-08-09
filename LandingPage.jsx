import React from 'react';
import { useInterview } from '../context/InterviewContext';
import {
  Sparkles, Play, ShieldCheck, ArrowRight, CheckCircle, ChevronRight, User, BookOpen, Clock, Zap, Target, Layers
} from 'lucide-react';

export const LandingPage = ({ onOpenCandidateModal }) => {
  const { selectedCandidate, startNewInterview, isSubmitting } = useInterview();

  const curriculumModules = [
    { n: 1, days: "Days 1-3", title: "Environment & Tooling", desc: "VS Code environment, Ollama local LLMs (Qwen2.5-Coder), GitHub Copilot/Cline, FastAPI + React Vite.", color: "from-slate-900 to-slate-950 border-slate-800 text-sky-400" },
    { n: 2, days: "Days 4-6", title: "Data Foundations", desc: "Structured data pipelines (Pandas/SQLite), unstructured document parsing (PDF, OCR), metadata chunking.", color: "from-slate-900 to-slate-950 border-slate-800 text-indigo-400" },
    { n: 3, days: "Days 7-10", title: "Embeddings & Vector Search", desc: "Dense sentence transformers, PCA clustering, ChromaDB vs Pinecone, hybrid BM25 + vector search.", color: "from-slate-900 to-slate-950 border-slate-800 text-violet-400" },
    { n: 4, days: "Days 11-15", title: "LLM Core & Fine-Tuning", desc: "End-to-end RAG architecture, Chain-of-Thought prompting, Pydantic schemas, LoRA/QLoRA PEFT fine-tuning.", color: "from-slate-900 to-slate-950 border-slate-800 text-purple-400" },
    { n: 5, days: "Days 16-20", title: "Chatbot Application Build", desc: "FastAPI /chat endpoints, React frontend, SSE streaming responses, Markdown cards, conversation state.", color: "from-slate-900 to-slate-950 border-slate-800 text-pink-400" },
    { n: 6, days: "Days 21-24", title: "Agentic AI & MCP", desc: "ReAct reasoning loops, LangChain/CrewAI multi-agent state orchestration, Model Context Protocol (MCP).", color: "from-slate-900 to-slate-950 border-slate-800 text-rose-400" },
    { n: 7, days: "Days 25-28", title: "Evaluation & Security", desc: "Ragas benchmark scoring, token cost optimization, prompt injection defense, Docker & Kubernetes deployment.", color: "from-slate-900 to-slate-950 border-slate-800 text-amber-400" },
    { n: 8, days: "Days 29-31", title: "Production & Capstone", desc: "Prometheus & Grafana observability, end-to-end resilience testing, enterprise capstone evaluation.", color: "from-slate-900 to-slate-950 border-slate-800 text-emerald-400" }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-fade-in">

      {/* HERO SECTION */}
      <div className="relative studio-panel rounded-3xl p-8 sm:p-12 border border-slate-800/90 shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Soft Ambient Background Highlights */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Heading & Action CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">

            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium shadow-sm">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Technical Interview Studio</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Conduct Authentic <span className="gradient-text">Technical Assessments</span> for AI Engineers
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed font-sans font-normal">
              Execute multi-turn technical interviews grounded in the <strong className="text-indigo-300 font-semibold">31-day AI Engineering Cohort curriculum</strong>. Evaluate candidates across RAG systems, Vector Databases, Prompt Engineering, Agentic AI, MCP, and Model Fine-Tuning.
            </p>

            {/* Main Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => startNewInterview(selectedCandidate?.candidateId || selectedCandidate?.member?.id)}
                disabled={isSubmitting}
                className="shimmer-button group relative inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 transition transform hover:-translate-y-0.5 disabled:opacity-50 border border-indigo-400/30"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                <span>{isSubmitting ? "Initializing Session..." : `Start Interview for ${selectedCandidate?.name || "Candidate"}`}</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenCandidateModal}
                className="px-6 py-3.5 rounded-xl studio-card-interactive text-slate-200 hover:text-white border-slate-700 text-sm font-semibold transition flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span>Select Candidate Profile</span>
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80 font-mono">
              <span className="flex items-center text-slate-300"><ShieldCheck className="w-4 h-4 text-indigo-400 mr-1.5" /> Adaptive Multi-Turn</span>
              <span className="flex items-center text-slate-300"><Clock className="w-4 h-4 text-sky-400 mr-1.5" /> 90s Response Window</span>
              <span className="flex items-center text-slate-300"><CheckCircle className="w-4 h-4 text-emerald-400 mr-1.5" /> Cohort-Grounded</span>
              <span className="flex items-center text-slate-300"><Sparkles className="w-4 h-4 text-purple-400 mr-1.5" /> Real-time Synthesis</span>
            </div>

          </div>

          {/* Right Column: Selected Candidate Profile Card */}
          <div className="lg:col-span-5">
            {selectedCandidate && (
              <div className="studio-card rounded-2xl p-6 border border-slate-800 space-y-4 relative group hover:border-slate-700 transition shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Selected Candidate
                  </span>
                  <button
                    onClick={onOpenCandidateModal}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-medium hover:underline"
                  >
                    Change Candidate
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <img
                    src={selectedCandidate.avatarUrl}
                    alt={selectedCandidate.name}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-500/40 shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base tracking-tight">{selectedCandidate.name}</h3>
                    <p className="text-xs text-indigo-300 font-mono">{selectedCandidate.targetRole}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedCandidate.experienceLevel}</p>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Curriculum Progress:</span>
                    <span className="text-indigo-400 font-bold">{selectedCandidate.learningJourney?.overallProgressPct || 85}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedCandidate.learningJourney?.overallProgressPct || 85}%` }}
                    />
                  </div>
                </div>

                {/* Completed Topics */}
                <div className="pt-2 text-xs font-mono">
                  <span className="text-slate-400 block mb-1.5">Strong Competencies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedCandidate.completedTopics || []).slice(0, 3).map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[10px]">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* CURRICULUM MODULES GRID */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span>31-Day AI Engineering Cohort Curriculum</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Interview questions are dynamically synthesized and evaluated against these 8 core engineering domains.
            </p>
          </div>

          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-medium">
            8 Grounded Domains
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {curriculumModules.map((m) => (
            <div 
              key={m.n}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 studio-card-interactive flex flex-col justify-between space-y-3 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className={`font-semibold ${m.color.split(' ').pop()}`}>Module {m.n}</span>
                  <span className="text-slate-400 text-[11px]">{m.days}</span>
                </div>

                <h3 className="font-bold text-white text-base tracking-tight leading-snug">{m.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">{m.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-indigo-400 font-medium">
                <span>Cohort Grounded</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

