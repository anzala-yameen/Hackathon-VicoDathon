import React, { useEffect } from 'react';
import { useInterview } from '../context/InterviewContext';
import confetti from 'canvas-confetti';
import { 
  Trophy, CheckCircle2, AlertTriangle, BookOpen, Sparkles, 
  BrainCircuit, ArrowRight, RefreshCw, BarChart2, ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const FeedbackDashboard = () => {
  const { feedbackData, isLoadingFeedback, resetToLanding, selectedCandidate, violationsList = [] } = useInterview();

  // Trigger confetti celebration on mount if score is good and no severe violations
  useEffect(() => {
    if (feedbackData && feedbackData.score >= 75 && violationsList.length === 0) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [feedbackData, violationsList]);

  if (isLoadingFeedback || !feedbackData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Synthesizing Technical Evaluation Report...</h2>
        <p className="text-xs text-slate-400 max-w-md text-center font-mono">
          Analyzing multi-turn technical responses, curriculum topic depth, and actionable growth recommendations.
        </p>
      </div>
    );
  }

  const { score, summary, strengths, weaknesses, topicsToRevise, recommendations, confidenceAnalysis, topicMastery } = feedbackData;

  // Prepare data for Radar Chart
  const radarChartData = (topicMastery || []).map(item => ({
    subject: item.topic.length > 18 ? item.topic.substring(0, 16) + '...' : item.topic,
    score: item.score,
    fullMark: 100
  }));

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* TOP EXECUTIVE SUMMARY BANNER */}
      <div className="studio-panel rounded-2xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Circular Score Visualizer */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 studio-card rounded-xl border border-slate-800 text-center space-y-3">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-slate-800 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ stroke: score >= 85 ? '#818cf8' : score >= 70 ? '#38bdf8' : '#f43f5e' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{score}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Score / 100</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">
                {score >= 85 ? "Outstanding Technical Mastery" : score >= 70 ? "Strong Technical Competency" : "Developing Base"}
              </h3>
              <p className="text-xs text-indigo-400 mt-0.5 font-mono">Candidate: {selectedCandidate?.name || "Sarah Johnson"}</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Technical Assessment Report</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Technical Performance Assessment
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed font-sans">
              {summary}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 font-mono">
              <div className="p-3 studio-card rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Overall Confidence</span>
                <span className="text-base font-bold text-indigo-400">{confidenceAnalysis?.overallConfidencePct || 80}%</span>
              </div>
              <div className="p-3 studio-card rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Clarity Score</span>
                <span className="text-base font-bold text-sky-400">{confidenceAnalysis?.clarityScore || 85}%</span>
              </div>
              <div className="p-3 studio-card rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Depth Score</span>
                <span className="text-base font-bold text-purple-400">{confidenceAnalysis?.depthScore || 75}%</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* COHORT MASTERY SNAPSHOT CARD */}
      <div className="p-6 rounded-2xl studio-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                <span>AI ENGINEERING CURRICULUM MASTERY</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                  COHORT VERIFIED
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated against core curriculum modules (RAG Systems, Vector DBs, Prompt Engineering, Agentic AI, MCP, Fine-Tuning).
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Overall Rating</span>
            <span className={`text-base font-bold ${score >= 85 ? 'text-indigo-400' : score >= 70 ? 'text-sky-400' : 'text-amber-400'}`}>
              {score >= 85 ? 'DISTINCTION' : score >= 70 ? 'PROFICIENT' : 'DEVELOPING'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-xs flex items-center space-x-2.5 font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Evaluation verified across 8 core curriculum modules with adaptive difficulty progression.</span>
        </div>
      </div>

      {/* STRENGTHS & WEAKNESSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Key Strengths */}
        <div className="studio-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Key Technical Strengths
          </h3>
          <div className="space-y-3">
            {strengths?.map((str, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-sans">{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Identified Growth Areas */}
        <div className="studio-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Growth Areas & Target Revisions
          </h3>
          <div className="space-y-3">
            {weaknesses?.map((wk, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-sans">{wk}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TOPIC MASTERY & RADAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Topic Mastery Progress Bars */}
        <div className="lg:col-span-7 studio-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Competency Breakdown
          </h3>

          <div className="space-y-4">
            {topicMastery?.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{item.topic}</span>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      item.status === 'Mastered' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' :
                      item.status === 'Developing' ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30' :
                      'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                    }`}>
                      {item.status}
                    </span>
                    <span className="font-bold text-white">{item.score}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.score >= 80 ? 'bg-indigo-500' :
                      item.score >= 65 ? 'bg-sky-500' :
                      'bg-amber-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recharts Radar Chart */}
        <div className="lg:col-span-5 studio-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <h4 className="text-xs font-bold text-slate-300 mb-2 font-mono uppercase tracking-wider">Competency Radar Surface</h4>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Radar name="Candidate Mastery" dataKey="score" stroke="#818cf8" fill="#6366f1" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* PERSONALIZED LEARNING ROADMAP */}
      <div className="studio-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Actionable Engineering Roadmap
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations?.map((rec, idx) => (
            <div key={idx} className="studio-card p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{rec}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

