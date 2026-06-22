'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Trash2,
  GitFork,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Edit3,
  X
} from 'lucide-react';
import { useTimelineStore } from '../hooks/TimelineContext';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function DashboardTab() {
  const router = useRouter();
  const { 
    timelines, 
    setActiveTimelineId, 
    createTimeline, 
    deleteTimeline, 
    forkTimeline,
    updateTimeline,
    searchQuery,
    generateAI,
    generateTimelineWithAI,
    currentUser,
    accentColor
  } = useTimelineStore();

  const themes = {
    emerald: {
      accentText: 'text-[#0e623f]',
      bgAccent: 'bg-[#0e623f]',
      borderColor: 'border-[#0e623f]',
      focusRing: 'focus:ring-[#0e623f]/10 focus:border-[#0e623f]',
      textHover: 'hover:text-[#0e623f]',
      badgeClass: 'bg-emerald-50 text-[#0e623f] border-emerald-150',
      hoverBorder: 'hover:border-[#0e623f]',
      bgAccentHover: 'hover:bg-[#08422a]',
      ringClass: 'ring-[#0e623f]/5',
      accentHex: '#0e623f',
    },
    slate: {
      accentText: 'text-slate-900',
      bgAccent: 'bg-slate-900',
      borderColor: 'border-slate-900',
      focusRing: 'focus:ring-slate-900/10 focus:border-slate-900',
      textHover: 'hover:text-slate-900',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
      hoverBorder: 'hover:border-slate-950',
      bgAccentHover: 'hover:bg-slate-850',
      ringClass: 'ring-slate-900/5',
      accentHex: '#0f172a',
    },
    indigo: {
      accentText: 'text-indigo-600',
      bgAccent: 'bg-indigo-600',
      borderColor: 'border-indigo-600',
      focusRing: 'focus:ring-indigo-600/10 focus:border-indigo-600',
      textHover: 'hover:text-indigo-600',
      badgeClass: 'bg-indigo-50 text-indigo-600 border-indigo-150',
      hoverBorder: 'hover:border-indigo-600',
      bgAccentHover: 'hover:bg-indigo-700',
      ringClass: 'ring-indigo-600/5',
      accentHex: '#4f46e5',
    }
  };

  const activeTheme = themes[accentColor] || themes.emerald;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [timelineToDelete, setTimelineToDelete] = useState<any | null>(null);
  
  // Edit Timeline Form state
  const [editingTimeline, setEditingTimeline] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);

  const handleSaveTimelineEdit = async () => {
    if (!editingTimeline) return;
    try {
      await updateTimeline(editingTimeline.id, {
        title: editTitle,
        description: editDesc,
        isPublic: editIsPublic
      });
      setEditingTimeline(null);
    } catch (err: any) {
      alert(err.message || "Failed to update timeline");
    }
  };
  
  // Create Timeline Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<'with_time_unit' | 'without_time_unit'>('with_time_unit');
  const [newTimeUnit, setNewTimeUnit] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [newDuration, setNewDuration] = useState(6);
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [newEnableScheduling, setNewEnableScheduling] = useState(true);

  // AI-Specific Configuration state
  const [buildMode, setBuildMode] = useState<'manual' | 'ai'>('manual');
  const [aiDomain, setAiDomain] = useState("Web Development");
  const [aiLevel, setAiLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [aiAudience, setAiAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setErrorMsg("");

    if (buildMode === "ai") {
      // Validate Limit
      if (currentUser && currentUser.aiUsage >= 100) {
        setErrorMsg("AI Limit Reached: You have reached 100% of your weekly AI usage. Please check back next week.");
        return;
      }

      setIsGenerating(true);
      try {
        const created = await generateTimelineWithAI({
          title: newTitle,
          description: newDesc,
          typeId: newType,
          timeUnitId: newType === 'with_time_unit' ? newTimeUnit : undefined,
          duration: newType === 'with_time_unit' ? Number(newDuration) : 5,
          aiDomain,
          aiLevel,
          aiAudience: aiAudience || "General Learners",
          isPublic: newIsPublic,
          enableScheduling: newType === 'with_time_unit' ? newEnableScheduling : false
        });

        // Reset and redirect
        setNewTitle("");
        setNewDesc("");
        setAiDomain("Web Development");
        setAiLevel("Beginner");
        setAiAudience("");
        setCreateModalOpen(false);
        router.push(`/dashboard/timeline/${created.id}`);
      } catch (err: any) {
        console.error("AI Generation failed:", err);
        setErrorMsg(err.message || "Failed to generate structured roadmap with AI. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Manual creation flow
      const created = await createTimeline({
        title: newTitle,
        description: newDesc,
        typeId: newType,
        timeUnitId: newType === 'with_time_unit' ? newTimeUnit : undefined,
        duration: newType === 'with_time_unit' ? Number(newDuration) : 5,
        isPublic: newIsPublic,
        enableScheduling: newType === 'with_time_unit' ? newEnableScheduling : false
      });

      // Reset and redirect
      setNewTitle("");
      setNewDesc("");
      setCreateModalOpen(false);
      router.push(`/dashboard/timeline/${created.id}`);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const itemsPerPage = 4; // number of items fetched per logical page
  const carouselRef = React.useRef<HTMLDivElement>(null);

  // Filter local timelines with search query
  const filteredTimelines = timelines.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTimelines.length / itemsPerPage);

  const [prevSearch, setPrevSearch] = useState(searchQuery);
  const [prevLength, setPrevLength] = useState(timelines.length);

  if (searchQuery !== prevSearch || timelines.length !== prevLength) {
    setPrevSearch(searchQuery);
    setPrevLength(timelines.length);
    setCurrentPage(1);
    setIsFetchingNext(false);
  }

  const visibleTimelinesCount = Math.min(currentPage * itemsPerPage, filteredTimelines.length);
  const visibleTimelines = filteredTimelines.slice(0, visibleTimelinesCount);

  // Scroll handler to detect when reaching the last element of the current page
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    
    // If we've scrolled near the end (within 100px) of current content
    if (scrollWidth - (scrollLeft + clientWidth) < 100) {
      if (currentPage < totalPages && !isFetchingNext) {
        setIsFetchingNext(true);
        // Simulate premium network request delay
        setTimeout(() => {
          setCurrentPage(prev => prev + 1);
          setIsFetchingNext(false);
        }, 500);
      }
    }
  };

  const slideLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const slideRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  if (createModalOpen) {
    return (
      <div className="flex-1 bg-[#F9F9F8] p-4 sm:p-8 overflow-y-auto font-sans relative">
        <button
          onClick={() => setCreateModalOpen(false)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-950 font-semibold text-[10px] uppercase font-mono tracking-wider mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white border border-zinc-200 p-6 sm:p-8 rounded-2xl shadow-xs max-w-2xl mx-auto relative overflow-hidden">
          {/* Generating Lock Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-white/95 z-50 flex flex-col justify-center items-center p-8 text-center rounded-2xl">
              <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin mb-4" />
              <h4 className="font-bold text-zinc-900 font-serif italic text-base">Preparing Your Timeline...</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed animate-pulse">
                Please wait, we are generating the structured items for your roadmap milestones...
              </p>
            </div>
          )}

          <h3 className="text-xl font-bold text-zinc-900 font-serif italic tracking-tight">Create Timeline</h3>
          <p className="text-xs text-zinc-500 mt-1">Specify your goals, visibility preferences, and timelines to construct a structured workspace.</p>

          {/* Manual vs AI generation switcher */}
          <div className="flex bg-zinc-100 rounded-lg p-1 mt-6 mb-6">
            <button
              type="button"
              onClick={() => {
                setBuildMode('manual');
                setErrorMsg("");
              }}
              className={`flex-1 py-1.5 text-[10.5px] font-bold uppercase font-mono rounded-md transition-all cursor-pointer ${
                buildMode === 'manual' 
                  ? 'bg-white text-zinc-900 shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => {
                setBuildMode('ai');
                setErrorMsg("");
                if (!newTitle) setNewTitle("Learn Web Development");
                if (!newDesc) setNewDesc("A comprehensive path to learning HTML, CSS, JavaScript, and React framework fundamentals.");
              }}
              className={`flex-1 py-1.5 text-[10.5px] font-bold uppercase font-mono rounded-md transition-all cursor-pointer flex items-center justify-center ${
                buildMode === 'ai' 
                  ? `${activeTheme.bgAccent} text-white shadow-xs` 
                  : 'text-zinc-500 hover:text-zinc-850'
              }`}
            >
              <span>AI Generator</span>
            </button>
          </div>

          {/* Error notifications */}
          {errorMsg && (
            <div className="bg-red-50 text-red-700 border border-red-150 rounded-xl px-4 py-3 text-xs font-semibold leading-relaxed mb-4">
              {errorMsg}
            </div>
          )}

          {/* AI Usage Quota Header */}
          {buildMode === 'ai' && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-amber-800 flex justify-between items-center text-xs mb-4 animate-in fade-in">
              <span className="font-semibold text-[10px] uppercase font-mono tracking-wide">Usage this week:</span>
              <span className="font-extrabold">{currentUser?.aiUsage || 0}%</span>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                {buildMode === 'ai' ? 'Timeline Goal or Title' : 'Project Title'}
              </label>
              <input
                type="text"
                required
                placeholder={buildMode === 'ai' ? 'e.g. Master CSS Layouts' : 'e.g. Q4 Website Relaunch'}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-250/70 rounded-lg px-3.5 py-2 text-xs text-[#222222] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                {buildMode === 'ai' ? 'Goal Description & Target Scope' : 'Goal Description'}
              </label>
              <textarea
                placeholder={buildMode === 'ai' ? 'e.g. Briefly describe the project you want to build...' : 'Briefly summarize milestones...'}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                required={buildMode === 'ai'}
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-250/70 rounded-lg px-3.5 py-2 text-xs text-[#222222] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-medium"
              />
            </div>

            {/* AI Setup Parameters Panel */}
            {buildMode === 'ai' && (
              <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3.5 flex flex-col gap-3 animate-in fade-in">
                <span className="text-[10px] font-bold text-zinc-650 uppercase font-mono tracking-wide mb-0.5">Topic & Setup details</span>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1 font-mono">Subject / Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Web Dev, Marketing, Design"
                      value={aiDomain}
                      onChange={(e) => setAiDomain(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-805 placeholder-zinc-350 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1 font-mono">Skill Level</label>
                    <select
                      value={aiLevel}
                      onChange={(e) => setAiLevel(e.target.value as any)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 px-1.5 text-xs text-zinc-805 focus:outline-none font-semibold"
                    >
                      <option value="Beginner">Beginner Level</option>
                      <option value="Intermediate">Intermediate Level</option>
                      <option value="Advanced">Advanced Level</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1 font-mono">Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. Self-learners, Kids, Entrepreneurs"
                    value={aiAudience}
                    onChange={(e) => setAiAudience(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-805 placeholder-zinc-350 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-semibold"
                  />
                </div>
              </div>
            )}

            <div className={newType === 'with_time_unit' ? "grid grid-cols-1 sm:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">Structure Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-250/70 rounded-lg px-3 py-2 text-xs text-zinc-805 focus:outline-none font-medium"
                >
                  <option value="with_time_unit">With Time Unit</option>
                  <option value="without_time_unit">Without Time Unit</option>
                </select>
              </div>

              {newType === 'with_time_unit' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-505 uppercase tracking-wider mb-1.5 font-mono">Time Unit</label>
                    <select
                      value={newTimeUnit}
                      onChange={(e) => setNewTimeUnit(e.target.value as any)}
                      className="w-full bg-zinc-50 border border-zinc-250/70 rounded-lg px-3 py-2 text-xs text-zinc-805 focus:outline-none font-medium"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-505 uppercase tracking-wider mb-1.5 font-mono">Duration</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full bg-[#FCFBFA] border border-[#d4d4d8] rounded-lg px-3 py-2 text-xs text-zinc-850 focus:outline-none font-medium"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-5 mt-2 py-3 border-y border-zinc-150">
              {/* Public / Private Toggle Section */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 font-mono">Timeline Visibility</label>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setNewIsPublic(true)}
                    className={`p-3 border rounded-xl flex items-center justify-center text-center transition-all cursor-pointer ${
                       newIsPublic 
                         ? `${activeTheme.borderColor} bg-zinc-50/50 ring-2 ${activeTheme.ringClass}` 
                         : 'border-zinc-200 bg-white hover:bg-zinc-50/20'
                    }`}
                  >
                    <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-805 font-mono">Public Timeline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewIsPublic(false)}
                    className={`p-3 border rounded-xl flex items-center justify-center text-center transition-all cursor-pointer ${
                       !newIsPublic 
                         ? `${activeTheme.borderColor} bg-[#fcfcfc] ring-2 ${activeTheme.ringClass}` 
                         : 'border-zinc-200 bg-white hover:bg-zinc-50/20'
                    }`}
                  >
                    <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-850 font-mono">Private Timeline</span>
                  </button>
                </div>
                <div className="mt-3 text-[10.5px] text-zinc-550 leading-relaxed font-sans font-medium transition-all duration-200">
                  {newIsPublic ? (
                    <span>Anyone can discover, view, and fork/copy this timeline into their custom workspace from the Explore feed.</span>
                  ) : (
                    <span>Only you can see and manage this timeline inside your personal dashboard. It will never show in search.</span>
                  )}
                </div>
              </div>

              {/* Dates & Scheduling Checkbox shown conditionally */}
              {newType === 'with_time_unit' && (
                <label className="flex items-center gap-3.5 cursor-pointer select-none bg-zinc-50/30 p-2.5 rounded-xl border border-zinc-150">
                  <input
                    type="checkbox"
                    checked={newEnableScheduling}
                    onChange={() => setNewEnableScheduling(!newEnableScheduling)}
                    className="w-4.5 h-4.5 cursor-pointer rounded"
                    style={{ accentColor: activeTheme.accentHex }}
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-bold text-zinc-850">Enable Dates & Scheduling</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5">Activate real calendar date-selection controls inside timeline milestones.</span>
                  </div>
                </label>
              )}
            </div>

            <div className="flex gap-2.5 mt-3 justify-end">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-500 transition-all font-mono uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 ${activeTheme.bgAccent} ${activeTheme.bgAccentHover} text-white rounded-lg text-xs font-bold transition-all shadow-sm font-mono uppercase tracking-wider cursor-pointer flex items-center justify-center`}
              >
                <span>{buildMode === 'ai' ? 'Generate Roadmap' : 'Create Timeline'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F9F9F8] p-4 sm:p-8 overflow-y-auto font-sans">
      
      {/* Title & Top Bar actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif italic font-semibold text-zinc-900 tracking-tight">Dashboard</h2>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.12em] font-mono mt-1">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className={`${activeTheme.bgAccent} ${activeTheme.bgAccentHover} text-white font-bold text-[11px] uppercase tracking-wider py-2.5 px-4.5 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Timeline</span>
          </button>
        </div>
      </div>

      {/* User projects timeline table display card */}
      <div className="bg-white border border-zinc-200 p-4 sm:p-6 rounded-xl mt-8 shadow-xs max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xs font-bold tracking-[0.16em] uppercase text-zinc-400 font-mono mb-1">Your Active Timelines & Roadmaps</h3>
            <span className="text-[11px] text-zinc-500 font-medium">Click a timeline card to open its milestones workspace.</span>
          </div>

          {filteredTimelines.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mr-2 bg-zinc-50 px-2.5 py-1 border border-zinc-150 rounded-md">
                Page {currentPage}/{totalPages || 1} ({visibleTimelinesCount} of {filteredTimelines.length})
              </span>
              <button
                onClick={slideLeft}
                className="p-1.5 border border-zinc-200 hover:border-zinc-400 text-zinc-600 bg-white hover:bg-zinc-50 hover:text-zinc-900 rounded-lg shadow-2xs transition-all active:scale-95"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={slideRight}
                className="p-1.5 border border-zinc-200 hover:border-zinc-400 text-zinc-600 bg-white hover:bg-zinc-50 hover:text-zinc-900 rounded-lg shadow-2xs transition-all active:scale-95"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {filteredTimelines.length === 0 ? (
          <div className="p-10 border border-dashed border-zinc-200 rounded-lg text-center flex flex-col items-center justify-center text-zinc-400">
            <Clock className="w-8 h-8 text-zinc-300 mb-2" />
            <h4 className="text-xs font-bold text-zinc-700 font-serif italic">No Timelines Found</h4>
            <p className="text-[10px] mt-1">Search or click &quot;Add Timeline&quot; to instantiate a brand new planning segment.</p>
          </div>
        ) : (
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex flex-row overflow-x-auto gap-5 pb-2 pt-1.5 scroll-smooth snap-x snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
          >
            {visibleTimelines.map((timeline, index) => {
              const isLastOfPage = (index + 1) % itemsPerPage === 0 && index + 1 < filteredTimelines.length;
              return (
                <div 
                  key={timeline.id}
                  onClick={() => router.push(`/dashboard/timeline/${timeline.id}`)}
                  className={`group border border-zinc-200 p-5 rounded-xl hover:shadow-xs transition-all cursor-pointer relative bg-zinc-50/20 w-[275px] xs:w-[315px] sm:w-[340px] min-w-[275px] xs:min-w-[315px] sm:min-w-[340px] snap-start shrink-0 flex flex-col justify-between h-[210px] hover:${activeTheme.borderColor} ${
                    isLastOfPage ? 'ring-2 ring-indigo-500/15' : ''
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                          timeline.typeId === 'with_time_unit' ? `${activeTheme.badgeClass}` : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {timeline.typeId === 'with_time_unit' ? 'With Time Unit' : 'Without Time Unit'}
                        </span>
                        {timeline.typeId === 'with_time_unit' && timeline.timeUnitId && (
                          <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 uppercase px-2 py-0.5 rounded-md border border-slate-150">
                            {timeline.timeUnitId}
                          </span>
                        )}

                      </div>
                      
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTimeline(timeline);
                            setEditTitle(timeline.title);
                            setEditDesc(timeline.description || "");
                            setEditIsPublic(timeline.isPublic !== undefined ? timeline.isPublic : true);
                          }}
                          className={`p-1.5 text-slate-400 hover:${activeTheme.accentText} hover:bg-slate-50 rounded`}
                          title="Edit Timeline"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTimelineToDelete(timeline);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-900 mt-3 group-hover:text-zinc-950 group-hover:underline transition-all font-serif italic">
                      {timeline.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {timeline.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4.5 pt-3.5 border-t border-zinc-150 text-[9.5px] text-zinc-400 font-semibold font-mono uppercase tracking-wide">
                    <span>Duration: {timeline.duration} {timeline.typeId === 'with_time_unit' ? `${timeline.timeUnitId}s` : 'Phases'}</span>
                    <span className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-1.5 py-0.5 rounded">v{timeline.version || "1.0"}</span>
                  </div>
                </div>
              );
            })}

            {isFetchingNext && (
              <div className="w-[275px] xs:w-[315px] sm:w-[340px] min-w-[275px] xs:min-w-[315px] sm:min-w-[340px] border border-dashed border-zinc-200 p-5 rounded-xl flex flex-col justify-center items-center h-[210px] bg-zinc-50/50 animate-pulse shrink-0 snap-start">
                <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mb-2" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-400">Loading next page...</span>
              </div>
            )}
          </div>
        )}

        {/* Carousel Status Indicators */}
        {filteredTimelines.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-3 pt-4 border-t border-zinc-100 gap-3">
            <span className="text-[11px] text-zinc-500 font-medium">
              Showing <strong className="text-zinc-800">{visibleTimelinesCount}</strong> of <strong className="text-zinc-800">{filteredTimelines.length}</strong> total active roadmaps
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 <= currentPage ? `w-5 ${activeTheme.bgAccent}` : 'w-1.5 bg-zinc-200'
                  }`}
                  title={`Page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      {timelineToDelete && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 font-serif italic tracking-tight">Delete Timeline</h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <strong className="text-zinc-800">&quot;{timelineToDelete.title}&quot;</strong> forever? This will permanently erase all associated segments, checklists, milestones, and track boards.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={() => setTimelineToDelete(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTimeline(timelineToDelete.id);
                  setTimelineToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-xs border border-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TIMELINE DETAILS DRAWER */}
      <AnimatePresence>
        {editingTimeline && (
          <>
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTimeline(null)}
              className="fixed inset-0 bg-slate-900 z-45"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col border-l border-zinc-200 select-none h-screen overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none font-mono">
                    Configure settings
                  </span>
                  <span className="text-sm font-bold text-zinc-905 mt-1 flex items-center gap-1.5 capitalize font-serif italic">
                    Edit Timeline Details
                  </span>
                </div>
                
                <button
                  onClick={() => setEditingTimeline(null)}
                  className="p-2 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-white">
                {/* Title input */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">Timeline Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Learn Fullstack Development"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                {/* Description input */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide a detailed roadmap plan summary..."
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-500 font-mono resize-none leading-relaxed"
                  />
                </div>

                {/* Visibility input */}
                <div className="flex items-center justify-between py-2 border-t border-zinc-100 mt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Public Visibility</span>
                    <p className="text-[10px] text-zinc-450 font-normal font-sans">Publish this timeline so others can view and fork it in the explore tab.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className={`w-4 h-4 cursor-pointer accent-zinc-900`}
                  />
                </div>
              </div>

              {/* Drawer footer controls */}
              <div className="p-6 border-t border-[#eaecf0] bg-zinc-50 flex justify-end items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTimeline(null)}
                  className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 transition bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTimelineEdit}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold shadow-sm transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
