'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTimelineStore } from '../hooks/TimelineContext';
import {
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Compass,
  ArrowRightLeft,
  ListTodo,
  Bookmark,
  Share2,
  Trash2,
  Plus,
  ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser } = useTimelineStore();

  // Web Audio retro mechanical click synthesizer
  const playToggleSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // AudioContext compatibility fallback
    }
  };

  // State for SIMPLIFIED PROCESS
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // States for FEATURE SPOTLIGHT
  // 1. Checklist State
  const [featureCheckboxes, setFeatureCheckboxes] = useState<boolean[]>([true, false, false]);
  const toggleFeatureCheckbox = (index: number) => {
    const updated = [...featureCheckboxes];
    updated[index] = !updated[index];
    setFeatureCheckboxes(updated);
    playToggleSound();
  };
  const checklistPercent = Math.round(
    (featureCheckboxes.filter(Boolean).length / featureCheckboxes.length) * 100
  );

  // 2. Resource List State
  const [featureResources, setFeatureResources] = useState<string[]>([
    'https://mit-curriculum.edu/deep-learning',
    'https://nextjs.org/docs/app-router'
  ]);
  const [newResourceInput, setNewResourceInput] = useState<string>('');
  const addFeatureResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceInput.trim()) return;
    setFeatureResources([...featureResources, newResourceInput.trim()]);
    setNewResourceInput('');
    playToggleSound();
  };
  const removeFeatureResource = (index: number) => {
    const updated = featureResources.filter((_, i) => i !== index);
    setFeatureResources(updated);
    playToggleSound();
  };

  // 3. Fork Simulation State
  const [isForked, setIsForked] = useState<boolean>(false);
  const triggerForkSimulation = () => {
    setIsForked(true);
    playToggleSound();
    setTimeout(() => {
      setIsForked(false);
    }, 4000);
  };

  // 4. Accent Theme Spot State
  const [spotlightTheme, setSpotlightTheme] = useState<'emerald' | 'slate' | 'royal'>('emerald');
  const changeSpotlightTheme = (theme: 'emerald' | 'slate' | 'royal') => {
    setSpotlightTheme(theme);
    playToggleSound();
  };

  const stepsDetails = [
    {
      title: "Define Objectives",
      badge: "Step 01",
      desc: "Give your custom roadmap a distinct, clean title and choose your preferred schedule format.",
    },
    {
      title: "Draft Structure",
      badge: "Step 02",
      desc: "Synthesize complete multi-week curricular blocks instantly using built-in AI assistant generators.",
    },
    {
      title: "Adapt & Personalize",
      badge: "Step 03",
      desc: "Add customized reference resources, interactive note-taking cards, and reorder items seamlessly.",
    },
    {
      title: "Track Progress",
      badge: "Step 04",
      desc: "Tick checkboxes, update status values, and track your visual percent accomplishments dynamically.",
    }
  ];

  return (
    <div id="landing-page" className="w-full min-h-screen bg-[#FDFDFD] text-zinc-900 overflow-x-hidden font-sans select-none">

      {/* Brand Navigation Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between border-b border-zinc-100 gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-zinc-900 text-sm sm:text-lg">
            NAVIGOO<span className="text-zinc-400 font-normal font-sans">.app</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {currentUser ? (
            <>
              <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
                Logged as <strong className="text-zinc-800 font-semibold">@{currentUser.username}</strong>
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 active:scale-98 cursor-pointer shadow-sm"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login?mode=login')}
                className="text-[10px] sm:text-xs font-bold text-zinc-500 hover:text-zinc-900 cursor-pointer px-2 sm:px-3 py-1.5 sm:py-2 uppercase tracking-wider shrink-0 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/login?mode=signup')}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3 sm:px-4.5 py-2 sm:py-2.5 rounded-lg transition-all active:scale-98 cursor-pointer shadow-xs shrink-0"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Visual Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 sm:pt-24 pb-16 text-center flex flex-col items-center">
        {/* Badge status */}
        {/* <div className="inline-flex items-center gap-1.5 bg-zinc-100/80 border border-zinc-200/50 rounded-full px-3.5 py-1.5 mb-8 animate-fade-in">
          <Sparkles className="w-3 h-3 text-zinc-700 animate-pulse" />
          <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-zinc-700">
            Visual Timeline Planner & Organizer
          </span>
        </div> */}

        <h1 className="text-4xl sm:text-6xl font-serif italic font-semibold text-zinc-900 tracking-tight leading-[1.1] max-w-4xl mb-6">
          Curate beautiful learning paths. <br className="hidden sm:inline" />Track milestones, accomplish goals.
        </h1>

        <p className="text-zinc-500 text-sm sm:text-base max-w-2xl leading-relaxed mb-10 font-medium">
          A minimalist planner to design custom paths, track milestones, and keep your schedules simple. Use built-in AI generators to draft learning syllabi and steps instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
          {currentUser ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push('/login?mode=signup')}
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Start Visualizing For Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/login?mode=login')}
                className="w-full sm:w-auto border border-zinc-250 hover:bg-zinc-50 text-zinc-700 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all cursor-pointer bg-white"
              >
                Login to Profile
              </button>
            </>
          )}
        </div>
      </section>

      {/* Visual Workspace Mockup */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-zinc-900" />

          {/* Responsive Header Address Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-zinc-100 pb-4 mb-6 gap-3 sm:gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="w-full sm:w-auto text-center bg-zinc-100 text-zinc-500 text-[11px] px-8 py-1.5 rounded-lg font-mono select-none border border-zinc-200/50">
              navigoo-workspace-preview.run
            </div>
            <div className="hidden sm:block w-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mock Timeline 1 */}
            <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/20 text-left">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono uppercase">
                  With Time Unit
                </span>
                <span className="text-[9px] font-mono text-zinc-400">Public</span>
              </div>
              <h3 className="font-bold text-zinc-850 font-serif italic text-sm">Web Development Essentials</h3>
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">Learn responsive HTML/CSS structures, JavaScript fundamentals, and UI design patterns.</p>
              <div className="pt-4 border-t border-zinc-150 mt-4 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                <span>Duration: 12 Weeks</span>
                <span className="bg-emerald-50 text-[#0e623f] px-2 py-0.5 rounded-full font-bold">85% Done</span>
              </div>
            </div>

            {/* Mock Timeline 2 */}
            <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/20 text-left">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono uppercase">
                  Without Time Unit
                </span>
                <span className="text-[9px] font-mono text-zinc-650">Private</span>
              </div>
              <h3 className="font-bold text-zinc-850 font-serif italic text-sm">Product Launch Milestones</h3>
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">Task guidelines and phases for content preparation, social launch, and user testing audits.</p>
              <div className="pt-4 border-t border-zinc-150 mt-4 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                <span>Duration: 5 Phases</span>
                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">2/5 Done</span>
              </div>
            </div>

            {/* Mock Timeline 3 */}
            <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/20 text-left">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold bg-emerald-50 text-[#0e623f] px-2 py-0.5 rounded font-mono uppercase">
                  With Time Unit
                </span>
                <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Public</span>
              </div>
              <h3 className="font-bold text-zinc-850 font-serif italic text-sm">UI/UX Design Course</h3>
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">Learn clear typography hierarchies, visual pacing, color balance, wireframes, and design elements.</p>
              <div className="pt-4 border-t border-zinc-150 mt-4 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                <span>Duration: 8 Weeks</span>
                <span className="bg-emerald-50 text-[#0e623f] px-2 py-0.5 rounded-full font-bold">50% Done</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Core Pillars - Now with Premium Design */}
      <section className="bg-zinc-50/50 border-y border-zinc-100 py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">

          <div className="group bg-white border border-zinc-150 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-zinc-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-200 group-hover:bg-zinc-900 transition-all duration-300" />
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-250 flex items-center justify-center text-zinc-900 mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-zinc-800" />
            </div>
            <h4 className="font-bold text-zinc-900 font-serif italic text-base mb-2">Adaptive Formats</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Select between structured <strong>Weeks</strong> (weekly, daily, or monthly intervals) or <strong>independent milestones</strong> depending on your tasks.
            </p>
          </div>

          <div className="group bg-white border border-zinc-150 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-zinc-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-200 group-hover:bg-zinc-900 transition-all duration-300" />
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-250 flex items-center justify-center text-zinc-900 mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-zinc-800" />
            </div>
            <h4 className="font-bold text-zinc-900 font-serif italic text-base mb-2">AI-Powered Blueprints</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Propose your main learning title or goal, and our built-in AI will draft a complete roadmap with details and reference link suggestions in seconds.
            </p>
          </div>

          <div className="group bg-white border border-zinc-150 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-zinc-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-200 group-hover:bg-zinc-900 transition-all duration-300" />
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-250 flex items-center justify-center text-zinc-900 mb-4 group-hover:scale-110 transition-transform">
              <Bookmark className="w-5 h-5 text-zinc-800" />
            </div>
            <h4 className="font-bold text-zinc-900 font-serif italic text-base mb-2">Milestone Resource Hub</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Pair external documentation links, tutorial articles, or cheat sheets directly alongside each milestone to build an all-in-one visual study directory.
            </p>
          </div>

        </div>
      </section>

      {/* INTERACTIVE SECTION: Simplified Process & Dynamic Live Workspace Simulator */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-left">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md">
            Interactive Experience
          </span>
          <h2 className="text-3xl font-serif italic font-bold tracking-tight text-zinc-900 mt-3">
            Simple Steps to Your Path
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
            Click on any phase below to trigger the live mockup simulator on the right and preview the workflow interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Left: Step selectors */}
          <div className="md:col-span-6 flex flex-col gap-4">
            {stepsDetails.map((step, idx) => {
              const worksActive = activeStepIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveStepIndex(idx);
                    playToggleSound();
                  }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative outline-none cursor-pointer flex gap-4 items-start ${worksActive
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg translate-x-1'
                    : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50'
                    }`}
                >
                  <div className={`px-2 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${worksActive ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                    {step.badge}
                  </div>
                  <div>
                    <h3 className={`font-bold font-serif italic text-base mb-1 ${worksActive ? 'text-white' : 'text-zinc-900'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${worksActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {step.desc}
                    </p>
                  </div>
                  {/* Removed absolute right bullet dot */}
                </button>
              );
            })}
          </div>

          {/* Right: Live Interactive Simulator Screen */}
          <div className="md:col-span-6 bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[350px]">
            {/* Top screen decor background glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-zinc-900" />
            <div className="absolute top-4 right-4 bg-zinc-100 text-zinc-400 text-[8px] font-mono px-3 py-0.5 rounded-full select-none uppercase tracking-widest">
              Preview
            </div>

            <div className="flex-1 flex flex-col justify-center py-4">
              {activeStepIndex === 0 && (
                <div className="space-y-4 animate-fade-in pl-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 mb-1">
                    Step 01 / Setup Goal
                  </div>
                  <h4 className="text-sm font-serif italic font-bold text-zinc-900">Name Your Learning Goal</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-zinc-400 font-mono mb-1">Timeline Title</label>
                      <input
                        type="text"
                        readOnly
                        value="Python Programming for Beginners"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 font-medium focus:outline-none font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-zinc-900 text-white rounded-lg px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Weekly Schedule</span>
                      </div>
                      <div className="bg-zinc-100 text-zinc-600 rounded-lg px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold border border-zinc-200/50 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-zinc-400" />
                        <span>12 Weeks Total</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStepIndex === 1 && (
                <div className="space-y-3 animate-fade-in pl-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> Step 02 / AI Generation
                  </div>
                  <h4 className="text-sm font-serif italic font-bold text-zinc-900">Generate Your Course Milestones</h4>

                  <div className="border border-zinc-150 rounded-xl bg-zinc-50/50 p-3 space-y-2 text-left">
                    <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 border-b border-zinc-100/60 pb-1.5">
                      <span>AUTOMATED ROADMAP DRAFT</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GENERATED
                      </span>
                    </div>
                    <div className="space-y-1.5 pt-1 max-h-[160px] overflow-y-auto">
                      <div className="bg-white border border-zinc-100 shadow-2xs rounded px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 flex items-center gap-2">
                        <span className="text-[#0e623f] font-mono text-[9px] font-extrabold uppercase shrink-0">Week 01</span> Python Environment and Basic Syntax Setup
                      </div>
                      <div className="bg-white border border-zinc-100 shadow-2xs rounded px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 flex items-center gap-2">
                        <span className="text-[#0e623f] font-mono text-[9px] font-extrabold uppercase shrink-0">Week 02</span> Control Flow, Logic, and Conditional Loops
                      </div>
                      <div className="bg-white border border-zinc-100 shadow-2xs rounded px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 flex items-center gap-2">
                        <span className="text-[#0e623f] font-mono text-[9px] font-extrabold uppercase shrink-0">Week 03</span> Defining Custom Functions and Reusable Modules
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStepIndex === 2 && (
                <div className="space-y-3 animate-fade-in pl-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 mb-1">
                    Step 03 / Edit & Customize
                  </div>
                  <h4 className="text-sm font-serif italic font-bold text-zinc-900">Add Notes and Link Resources</h4>

                  <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/20 space-y-3">
                    <div className="text-[11px] font-serif italic text-zinc-850 font-bold border-b border-zinc-150 pb-1.5 flex items-center gap-2">
                      <Bookmark className="w-3.5 h-3.5 text-zinc-700" />
                      <span>Editing: Week 02 Control Flow</span>
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-mono text-zinc-400 block mb-1 font-semibold">Custom Guidelines</label>
                      <p className="bg-white border border-zinc-150 rounded px-2 py-1.5 text-[10px] text-zinc-650 leading-relaxed font-sans font-medium">
                        Practice Python loop concepts by writing a mini program to filter active arrays automatically.
                      </p>
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-mono text-zinc-400 block mb-1 font-semibold">Reference Document URL</label>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-605 bg-white px-3 py-2 rounded-xl border border-zinc-150 max-w-full">
                        <Compass className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate font-mono text-zinc-500">https://docs.python.org/3/tutorial/controlflow</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStepIndex === 3 && (
                <div className="space-y-3 animate-fade-in pl-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 mb-1">
                    Step 04 / Track Progress
                  </div>
                  <h4 className="text-sm font-serif italic font-bold text-zinc-900">Check Milestones and Accomplish Goals</h4>

                  <div className="bg-zinc-50/50 border border-zinc-150 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono font-semibold">
                      <span className="text-zinc-500">ROADMAP PROGRESS</span>
                      <span className="text-[#0e623f] font-bold">66% COMPLETED</span>
                    </div>

                    {/* Progress bar simulation */}
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0e623f] h-full rounded-full transition-all duration-700" style={{ width: '66%' }} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 line-through font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Week 01: Setup Python Environment and Syntax</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 line-through font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Week 02: Practice Control Flow and Loops</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-800 font-semibold bg-white px-2.5 py-1.5 rounded-lg border border-zinc-150 shadow-3xs">
                        <div className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center shrink-0 animate-pulse" />
                        <span>Week 03: Create Functions and Modules</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated actions bar helper */}
            <div className="border-t border-zinc-100 pt-3 flex items-center justify-between text-[9px] text-[#27272a] font-mono">
              <span>Interactive Dashboard Preview</span>
              <span>Workspace: Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action panel */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center">
        <h2 className="text-3xl font-serif italic font-semibold tracking-tight text-zinc-900 mb-4">
          Ready to plan your next milestone?
        </h2>
        <p className="text-zinc-400 text-xs uppercase font-mono tracking-wider mb-8">
          Create, fork, and manage beautiful timelines right in your browser.
        </p>
        <button
          onClick={currentUser ? () => router.push('/dashboard') : () => router.push('/login?mode=signup')}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer"
        >
          {currentUser ? 'Enter App Workspace' : 'Create Free Account'}
        </button>
      </section>

      {/* Footer copyright */}
      <footer className="border-t border-zinc-100 py-8 px-6 text-center text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
        <span>© 2026 Navigoo.app. Navigate your learning and milestones to achieve goals.</span>
      </footer>

    </div>
  );
}
