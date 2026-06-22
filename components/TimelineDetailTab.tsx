'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  MapPin, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Trash2, 
  X, 
  Check, 
  Edit3, 
  Sliders, 
  Info,
  Layers,
  Activity,
  Heart,
  ExternalLink,
  ChevronLeft,
  GitFork
} from 'lucide-react';
import { useTimelineStore } from '../hooks/TimelineContext';
import { SegmentProps, SegmentGoalProps, SegmentReferenceProps } from '../types/timeline';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanDateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = parseInt(month, 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${months[monthIdx]} ${parseInt(day, 10)}, ${year}`;
    }
  }
  return cleanDateStr;
};

export default function TimelineDetailTab() {
  const router = useRouter();
  const { 
    activeTimeline, 
    setActiveTimelineId, 
    segments, 
    saveSegment, 
    deleteSegment, 
    toggleSegmentComplete, 
    scheduleSegment, 
    generateAI, 
    stats,
    currentUser,
    forkTimeline,
    updateTimeline,
    accentColor
  } = useTimelineStore();

  const themes = {
    emerald: {
      accentText: 'text-[#0e623f]',
      bgAccent: 'bg-[#0e623f]',
      borderColor: 'border-[#0e623f]',
      focusRing: 'focus:ring-[#0e623f]/10 focus:border-[#0e623f]',
      bgAccentHover: 'hover:bg-[#08422a]',
      ringClass: 'ring-[#0e623f]/15',
      lightBg: 'bg-emerald-50/50',
      badgeClass: 'bg-emerald-50 text-[#0e623f] border-emerald-150',
    },
    slate: {
      accentText: 'text-slate-900',
      bgAccent: 'bg-slate-900',
      borderColor: 'border-slate-900',
      focusRing: 'focus:ring-slate-900/10 focus:border-slate-900',
      bgAccentHover: 'hover:bg-slate-850',
      ringClass: 'ring-slate-900/15',
      lightBg: 'bg-slate-50',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    indigo: {
      accentText: 'text-indigo-600',
      bgAccent: 'bg-indigo-600',
      borderColor: 'border-indigo-600',
      focusRing: 'focus:ring-indigo-600/10 focus:border-indigo-600',
      bgAccentHover: 'hover:bg-indigo-700',
      ringClass: 'ring-indigo-600/15',
      lightBg: 'bg-indigo-50/50',
      badgeClass: 'bg-indigo-50 text-indigo-600 border-indigo-150',
    }
  };

  const activeTheme = themes[accentColor] || themes.emerald;

  const [activeView, setActiveView] = useState<'track' | 'roadmap'>('track');
  const [selectedSegUnit, setSelectedSegUnit] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);

  // AI Prompt details
  const [aiPrompt, setAiPrompt] = useState(activeTimeline?.description || "");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Fork state
  const [isForking, setIsForking] = useState(false);

  // Selected Segment Form state (inside Drawer)
  const [editingTitle, setEditingTitle] = useState("");
  const [editingMilestone, setEditingMilestone] = useState("");
  const [editingGoals, setEditingGoals] = useState<string[]>([]);
  const [newGoalInput, setNewGoalInput] = useState("");
  const [editingRefs, setEditingRefs] = useState<{label: string; url: string}[]>([]);
  const [newRefLabel, setNewRefLabel] = useState("");
  const [newRefUrl, setNewRefUrl] = useState("");
  const [editingScheduleDate, setEditingScheduleDate] = useState("");

  // Timeline Edit state
  const [isEditingTimeline, setIsEditingTimeline] = useState(false);
  const [editingTimelineTitle, setEditingTimelineTitle] = useState("");
  const [editingTimelineDesc, setEditingTimelineDesc] = useState("");
  const [editingTimelineIsPublic, setEditingTimelineIsPublic] = useState(true);

  const handleOpenEditTimeline = () => {
    setEditingTimelineTitle(activeTimeline?.title || "");
    setEditingTimelineDesc(activeTimeline?.description || "");
    setEditingTimelineIsPublic(activeTimeline?.isPublic !== undefined ? activeTimeline.isPublic : true);
    setIsEditingTimeline(true);
  };

  const handleSaveTimelineEdit = async () => {
    if (!activeTimeline) return;
    try {
      await updateTimeline(activeTimeline.id, {
        title: editingTimelineTitle,
        description: editingTimelineDesc,
        isPublic: editingTimelineIsPublic
      });
      setIsEditingTimeline(false);
    } catch (err: any) {
      alert(err.message || "Failed to update timeline");
    }
  };

  if (!activeTimeline) return null;

  const isOwnedByMe = !!currentUser && activeTimeline.author.id === currentUser.id;

  const handleForkInline = async () => {
    setIsForking(true);
    try {
      await forkTimeline(activeTimeline.id);
      alert(`Success! "${activeTimeline.title}" has been successfully copied into your custom roadmap projects. You can now configure metrics seamlessly!`);
      setDrawerOpen(false);
    } catch (e) {
      alert("Fork failed.");
    } finally {
      setIsForking(false);
    }
  };

  // Find segment for given unit number block (all 1-indexed)
  const getSegmentForUnit = (unitNum: number) => {
    return segments.find(s => s.unitNumber === unitNum);
  };

  const handleOpenDrawer = (unitNum: number) => {
    const seg = getSegmentForUnit(unitNum);
    setSelectedSegUnit(unitNum);
    
    if (seg) {
      setEditingTitle(seg.title);
      setEditingMilestone(seg.milestone || "");
      setEditingGoals(seg.goals.map(g => g.goal));
      setEditingRefs(seg.references.map(r => ({ label: r.label || "", url: r.reference })));
      const rawDate = seg.schedule?.scheduleDate || "";
      const cleanDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
      setEditingScheduleDate(cleanDate);
    } else {
      setEditingTitle(`Milestone ${unitNum} Objective`);
      setEditingMilestone(`Phase ${Math.ceil(unitNum / 2)}`);
      setEditingGoals([]);
      setEditingRefs([]);
      setEditingScheduleDate("");
    }
    
    setDrawerOpen(true);
  };

  const handleSaveSegmentForm = async () => {
    if (!selectedSegUnit) return;
    if (!isOwnedByMe) {
      alert("Please fork this roadmap to save custom changes!");
      return;
    }
    
    const existingSeg = getSegmentForUnit(selectedSegUnit);

    const formattedGoals = editingGoals.map((gText, index) => ({
      id: existingSeg?.goals[index]?.id || `g-form-${Date.now()}-${index}`,
      segmentId: existingSeg?.id || "",
      goal: gText
    }));

    const formattedRefs = editingRefs.map((ref, index) => ({
      id: existingSeg?.references[index]?.id || `r-form-${Date.now()}-${index}`,
      segmentId: existingSeg?.id || "",
      reference: ref.url,
      label: ref.label
    }));

    await saveSegment({
      id: existingSeg?.id,
      timelineId: activeTimeline.id,
      unitNumber: selectedSegUnit,
      title: editingTitle || `Module ${selectedSegUnit} Objective`,
      milestone: editingMilestone || "Core Stage",
      goals: formattedGoals as SegmentGoalProps[],
      references: formattedRefs as SegmentReferenceProps[],
      schedule: {
        id: existingSeg?.schedule?.id || `sch-${Date.now()}`,
        segmentId: existingSeg?.id || "",
        scheduleDate: editingScheduleDate || null,
        completedAt: existingSeg?.schedule?.completedAt || null
      }
    });

    setDrawerOpen(false);
  };

  const handleDeleteSegmentClick = async () => {
    if (!selectedSegUnit) return;
    if (!isOwnedByMe) return;
    if (confirm(`Do you want to delete this segment module outline entirely?`)) {
      await deleteSegment(activeTimeline.id, selectedSegUnit);
      setDrawerOpen(false);
    }
  };

  const handleInvokeAiGenerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setAiGenerating(true);
    try {
      const msg = await generateAI(aiPrompt, activeTimeline.duration, activeTimeline.timeUnitId || 'weekly');
      setAiGeneratorOpen(false);
      alert(msg || `AI modeling complete! Automatically generated ${activeTimeline.duration} detailed milestones.`);
    } catch (err: any) {
      alert(`Generation failed: ${err.message || 'Error communicating with Google AI servers.'}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAddGoal = () => {
    if (newGoalInput.trim()) {
      setEditingGoals([...editingGoals, newGoalInput.trim()]);
      setNewGoalInput("");
    }
  };

  const handleRemoveGoal = (idx: number) => {
    setEditingGoals(editingGoals.filter((_, i) => i !== idx));
  };

  const handleAddRef = () => {
    if (newRefUrl.trim()) {
      setEditingRefs([...editingRefs, { label: newRefLabel.trim(), url: newRefUrl.trim() }]);
      setNewRefLabel("");
      setNewRefUrl("");
    }
  };

  const handleRemoveRef = (idx: number) => {
    setEditingRefs(editingRefs.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex-1 bg-zinc-50/40 flex relative overflow-hidden h-screen font-sans">
      
      {/* Primary Detail Column */}
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto h-full flex flex-col pb-24">
        
        {/* Back Link & Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-805 rounded-lg transition-all cursor-pointer bg-white shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-white border border-zinc-200 px-3 py-1 rounded-lg font-mono">
            {activeTimeline.typeId === 'with_time_unit' ? 'Time-based' : 'Milestone-based'} Board
          </span>
        </div>

        {/* Read-only preview notice banner */}
        {!isOwnedByMe && (
          <div className="bg-[#FAF9F5] border border-zinc-250 p-4.5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs text-zinc-650 mb-6 shadow-sm animate-in fade-in">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-zinc-805 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 font-medium leading-relaxed">
                <span className="font-bold text-zinc-909 font-serif italic text-sm">Read-only Roadmap Preview</span>
                <span>You are exploring a public community roadmap. Fork/clone this roadmap to start customizing its milestones, editing checklist goals, scheduling dates, and tracking your active progress!</span>
              </div>
            </div>
            <button
              disabled={isForking}
              onClick={handleForkInline}
              className={`${activeTheme.bgAccent} ${activeTheme.bgAccentHover} text-white text-[10px] h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 font-mono font-bold uppercase tracking-wider self-start sm:self-center shrink-0 shadow-xs cursor-pointer`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>{isForking ? "Forking Path..." : "Fork & Customize"}</span>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 pb-6 border-b border-zinc-200 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight font-serif italic mb-1">{activeTimeline.title}</h1>
            <p className="text-zinc-550 text-xs max-w-2xl">{activeTimeline.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
            {/* View switcher */}
            <div className="bg-zinc-100 p-1 rounded-lg flex items-center border border-zinc-200 w-full sm:w-auto">
              <button
                onClick={() => setActiveView('track')}
                className={`flex-1 sm:flex-initial text-center justify-center px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition-all cursor-pointer flex items-center ${
                  activeView === 'track' ? `${activeTheme.bgAccent} text-white shadow-sm` : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <span>Track Board</span>
              </button>
              <button
                onClick={() => setActiveView('roadmap')}
                className={`flex-1 sm:flex-initial text-center justify-center px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition-all cursor-pointer flex items-center ${
                  activeView === 'roadmap' ? `${activeTheme.bgAccent} text-white shadow-sm` : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <span>Roadmap View</span>
              </button>
            </div>

            {/* Edit / Fork action */}
            {isOwnedByMe ? (
              <button
                onClick={handleOpenEditTimeline}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white border border-transparent rounded-lg font-bold text-[10px] uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm w-full sm:w-auto text-center animate-in fade-in"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Roadmap</span>
              </button>
            ) : (
              <button
                disabled={isForking}
                onClick={handleForkInline}
                className={`${activeTheme.bgAccent} ${activeTheme.bgAccentHover} text-white border border-transparent px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50 animate-in fade-in w-full sm:w-auto text-center`}
              >
                <GitFork className="w-4 h-4" />
                <span>{isForking ? "Forking..." : "Fork Roadmap"}</span>
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: FULL TRACK TRACKER */}
        {activeView === 'track' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            {/* Intro metadata block */}
            <div className="bg-[#FAF9F5] border border-zinc-200 p-4.5 rounded-xl flex gap-3 text-xs text-zinc-650">
              <Info className="w-4.5 h-4.5 text-zinc-800 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 font-medium leading-relaxed">
                <span className="font-bold text-zinc-900 font-serif italic text-sm">Horizontal track view helper</span>
                <span>Each column block represents a successive time interval {`(${activeTimeline.timeUnitId || 'Milestone'})`}. Click on any card block or &quot;+ Create Objectives&quot; to customize descriptions, reference resources, sub-goals, calendar dates, or toggle complete checkers!</span>
              </div>
            </div>

            {/* Steps Container Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: activeTimeline.duration }).map((_, index) => {
                const unitNum = index + 1;
                const seg = getSegmentForUnit(unitNum);
                const isCompleted = !!seg?.schedule?.completedAt;

                return (
                  <div 
                    key={unitNum}
                    className={`border rounded-xl transition-all duration-300 relative flex flex-col justify-between p-5 min-h-52 select-none ${
                      isCompleted 
                        ? 'border-zinc-300 bg-zinc-50 shadow-xs' 
                        : seg 
                          ? 'border-zinc-200 bg-white hover:border-zinc-900 shadow-xs'
                          : 'border-dashed border-zinc-250 bg-[#fafafa]/80 hover:bg-[#FAF9F5]/40 hover:border-zinc-405'
                    }`}
                  >
                    {/* Block Number & Status */}
                    <div className="flex justify-between items-center mb-4 text-[9px] font-bold text-zinc-455 font-mono uppercase tracking-wider">
                      <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                        {activeTimeline.timeUnitId || 'Milestone'} {unitNum}
                      </span>
                      {seg ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOwnedByMe) {
                              alert("Please fork/clone this roadmap to your private workspace first to track your progress!");
                              return;
                            }
                            toggleSegmentComplete(seg.id);
                          }}
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                            isCompleted 
                              ? 'bg-zinc-900 border-zinc-950 text-white' 
                              : 'border-zinc-300 hover:border-zinc-900 bg-white'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : null}
                        </button>
                      ) : (
                        <span className="text-zinc-400 tracking-wide">Not Set</span>
                      )}
                    </div>

                    {/* Core description details */}
                    {seg ? (
                      <div 
                        onClick={() => handleOpenDrawer(unitNum)}
                        className="flex-1 flex flex-col cursor-pointer pb-2 group"
                      >
                        <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1 line-clamp-1 font-mono">
                          {seg.milestone || `Phase ${Math.ceil(unitNum / 2)}`}
                        </span>
                        <h3 className="font-bold text-zinc-900 text-sm group-hover:text-zinc-950 group-hover:underline transition-all line-clamp-2 font-serif italic">
                          {seg.title}
                        </h3>
                        
                        {/* Short goals items indicators */}
                        {seg.goals.length > 0 && (
                          <div className="mt-3 flex flex-col gap-1">
                            {seg.goals.slice(0, 2).map((goal, gIdx) => (
                              <div key={gIdx} className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium truncate font-mono">
                                <span className={`w-1.5 h-1.5 rounded ${isCompleted ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
                                <span className={isCompleted ? 'line-through text-zinc-400' : 'text-zinc-650'}>{goal.goal}</span>
                              </div>
                            ))}
                            {seg.goals.length > 2 && (
                              <span className="text-[9px] text-zinc-400 font-bold ml-3.5 flex items-center gap-0.5 font-mono uppercase tracking-wide">
                                + {seg.goals.length - 2} more goals
                              </span>
                            )}
                          </div>
                        )}

                        {/* References */}
                        {seg.references.length > 0 && (
                          <div className="mt-auto pt-3 flex gap-1.5 items-center text-[9px] text-zinc-400 font-bold font-mono uppercase tracking-wider">
                            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{seg.references.length} link resources</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleOpenDrawer(unitNum)}
                        className="flex-1 flex flex-col justify-center items-center py-6 cursor-pointer group text-zinc-400"
                      >
                        <Plus className="w-5 h-5 text-zinc-400 group-hover:scale-110 group-hover:text-zinc-900 transition-all mb-2" />
                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-900 uppercase tracking-widest font-mono">Create objectives</span>
                        <span className="text-[9.5px] text-zinc-350 mt-0.5 font-mono">Double-click or click to design module</span>
                      </div>
                    )}

                    {/* Bottom target scheduler dates wrapper */}
                    {seg && (
                      <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-[10px] text-zinc-400 font-semibold leading-none">
                        {seg.schedule?.scheduleDate ? (
                          <div className="flex items-center gap-1.5 text-zinc-500 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{formatDate(seg.schedule.scheduleDate)}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-300 font-normal font-mono text-[9px] uppercase tracking-wider">No scheduled target</span>
                        )}

                        <button 
                          onClick={() => handleOpenDrawer(unitNum)}
                          className="text-zinc-800 hover:underline hover:text-zinc-900 font-mono text-[9px] uppercase tracking-wider font-extrabold cursor-pointer animate-in fade-in"
                        >
                          {isOwnedByMe ? 'Configure Settings' : 'View Deliverables'}
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* VIEW 2: ABSTRACT ROADMAP VIEW (ROADMAP.SH FLOW) */}
        {activeView === 'roadmap' && (
          <div className="flex-1 p-4 flex flex-col gap-6 animate-in fade-in duration-300 justify-center items-center">
            
            <div className="bg-[#FAF9F5] border border-zinc-200 p-4.5 rounded-xl w-full text-xs text-zinc-650 mb-2">
              <div className="flex gap-3">
                <Activity className="w-5 h-5 text-zinc-800 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 font-medium leading-relaxed">
                  <span className="font-bold text-zinc-900 font-serif italic text-sm">Interactive connected node path view</span>
                  <span>Displays goals as a continuous visual flow structure from top to bottom. Active or completed nodes glow in custom borders. Clicking on any connected block opens segment editors instantly!</span>
                </div>
              </div>
            </div>

            {/* Beautiful Connected Tree Node layout */}
            <div className="w-full max-w-4xl relative min-h-96 flex flex-col items-center justify-center py-10 bg-white border border-zinc-200 rounded-xl p-8 overflow-hidden">
              
              {/* Dynamic canvas mapping connected routes */}
              <div className="flex flex-col relative z-10 w-full max-w-lg gap-10">
                {Array.from({ length: activeTimeline.duration }).map((_, index) => {
                  const unitNum = index + 1;
                  const seg = getSegmentForUnit(unitNum);
                  const isCompleted = !!seg?.schedule?.completedAt;

                  return (
                    <div key={unitNum} className="flex items-center gap-6 relative w-full group select-none">
                      {/* Connecting vertical branch lines (except last item) */}
                      {index < activeTimeline.duration - 1 && (
                        <div className="absolute left-6 top-12 bottom-[-40px] w-[2px] bg-zinc-200 pointer-events-none z-0">
                          <div className={`w-full h-full bg-zinc-900 origin-top transition-transform duration-500 scale-y-0 ${isCompleted ? 'scale-y-100' : ''}`} />
                        </div>
                      )}

                      {/* Left circular target checkpoint node */}
                      <button 
                        onClick={() => handleOpenDrawer(unitNum)}
                        className={`w-12 h-12 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 z-10 transition-all font-mono tracking-wider ${
                          isCompleted 
                            ? 'bg-zinc-900 border-zinc-950 text-white ring-4 ring-zinc-900/10' 
                            : seg 
                              ? 'bg-zinc-50 border-zinc-400 text-zinc-900 ring-4 ring-zinc-50'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-450 hover:bg-zinc-50'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : <span>{unitNum}</span>}
                      </button>

                      {/* Right Detail Content Box card */}
                      <div 
                        onClick={() => handleOpenDrawer(unitNum)}
                        className={`flex-1 border p-4 rounded-xl hover:shadow-xs transition-all cursor-pointer relative bg-white flex justify-between items-center ${
                          isCompleted 
                            ? 'border-zinc-300 bg-zinc-50/50' 
                            : seg 
                              ? 'border-zinc-200 hover:border-zinc-900'
                              : 'border-dashed border-zinc-200'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 truncate pr-2 text-left">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider font-mono">
                            {seg?.milestone || `Phase ${Math.ceil(unitNum / 2)}`}
                          </span>
                          <h4 className="font-bold text-zinc-900 text-xs truncate max-w-[200px] sm:max-w-xs xl:max-w-md font-serif italic">
                            {seg ? seg.title : "Not Configured Milestone"}
                          </h4>
                          <span className="text-[9.5px] text-zinc-400 font-mono uppercase tracking-wider font-bold">
                            {seg ? `${seg.goals.length} checklist items` : "+ Add objectives outline"}
                          </span>
                        </div>

                        <ChevronRight className="w-4.5 h-4.5 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-1.5 transition-all shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ACTIVE SIDEBAR OBJECTIVES CONFIGURATION DRAWER */}
      <AnimatePresence>
        {drawerOpen && selectedSegUnit !== null && (
          <>
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
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
                    Configure Area block
                  </span>
                  <span className="text-sm font-bold text-zinc-905 mt-1 flex items-center gap-1.5 capitalize font-serif italic">
                    {activeTimeline.timeUnitId || 'Milestone'} {selectedSegUnit} Objective Setting
                  </span>
                </div>
                
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-white">
                {/* Milestone label */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">Milestone Stage / Phase Name</label>
                  <input
                    type="text"
                    disabled={!isOwnedByMe}
                    placeholder="e.g. Fundamental Setup"
                    value={editingMilestone}
                    onChange={(e) => setEditingMilestone(e.target.value)}
                    className={`w-full bg-zinc-50 border border-zinc-250/70 rounded-lg px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-medium ${!isOwnedByMe ? 'opacity-80 cursor-not-allowed bg-zinc-100/60' : ''}`}
                  />
                </div>

                {/* Objective Title */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">Module Title</label>
                  <input
                    type="text"
                    disabled={!isOwnedByMe}
                    placeholder="Provide a clear goal title..."
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className={`w-full bg-zinc-50 border border-zinc-250/70 rounded-lg px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-medium ${!isOwnedByMe ? 'opacity-80 cursor-not-allowed bg-zinc-100/60' : ''}`}
                  />
                </div>

                {/* Sub-Goals Checklist items block */}
                <div className="py-2 border-t border-zinc-100">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 font-mono">Checklist Deliverables / Goals</label>
                  
                  {/* Addition Form */}
                  {isOwnedByMe && (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="e.g. Setup repo, configure PostCSS rules"
                        value={newGoalInput}
                        onChange={(e) => setNewGoalInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                        className="flex-1 bg-zinc-50 border border-zinc-250/70 rounded-lg px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddGoal}
                        className="bg-zinc-900 hover:bg-zinc-850 text-white font-bold px-4 py-2 rounded-lg text-[10px] uppercase font-mono tracking-wider transition-all"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {/* List */}
                  {editingGoals.length === 0 ? (
                    <span className="text-[10px] text-zinc-400 block mt-1 font-mono uppercase tracking-wide">No deliverables configured yet.</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {editingGoals.map((goal, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg text-xs text-zinc-700">
                          <div className="flex items-center gap-2 pr-2.5 truncate font-medium">
                            <span className="w-1.5 h-1.5 bg-zinc-900 rounded shrink-0" />
                            <span className="truncate">{goal}</span>
                          </div>
                          {isOwnedByMe && (
                            <button
                              type="button"
                              onClick={() => handleRemoveGoal(idx)}
                              className="p-1 hover:bg-neutral-100 text-zinc-405 hover:text-zinc-905 rounded transition animate-in fade-in"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* References Resources */}
                <div className="py-2 border-t border-zinc-100">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 font-mono">Reference Study Resources / URLs</label>
                  
                  {/* Addition Form */}
                  {isOwnedByMe && (
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Label / Name (e.g. React Docs)"
                          value={newRefLabel}
                          onChange={(e) => setNewRefLabel(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddRef()}
                          className="flex-1 bg-zinc-50 border border-zinc-250/70 rounded-lg px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="URL (e.g. https://react.dev/reference)"
                          value={newRefUrl}
                          onChange={(e) => setNewRefUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddRef()}
                          className="flex-1 bg-zinc-50 border border-zinc-250/70 rounded-lg px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                        />
                        <button
                          type="button"
                          onClick={handleAddRef}
                          className="bg-zinc-100 hover:bg-zinc-205 text-zinc-700 border border-zinc-200 font-bold px-4 py-2 rounded-lg text-[10px] uppercase font-mono tracking-wider transition-all shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List */}
                  {editingRefs.length === 0 ? (
                    <span className="text-[10px] text-zinc-400 block mt-1 font-mono uppercase tracking-wide animate-in fade-in">No references saved in this milestone.</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {editingRefs.map((ref, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg text-xs">
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-2">
                            {ref.label && (
                              <span className="font-semibold text-zinc-800 text-[11px] truncate">{ref.label}</span>
                            )}
                            <span className="truncate font-mono text-[10px] text-zinc-450 flex-1">{ref.url}</span>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <a
                              href={ref.url.startsWith('http') ? ref.url : `https://${ref.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 rounded transition"
                              title="Open study resources link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            {isOwnedByMe && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRef(idx)}
                                className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Scheduling section */}
                {activeTimeline.enableScheduling && (
                  <div className="py-4 border-t border-zinc-100 mt-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 font-mono">Milestone Target Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        disabled={!isOwnedByMe}
                        value={editingScheduleDate}
                        onChange={(e) => setEditingScheduleDate(e.target.value)}
                        className={`w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-800 focus:outline-none font-mono ${!isOwnedByMe ? 'opacity-80 cursor-not-allowed bg-zinc-100/60' : ''}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer footer controls */}
              <div className="p-6 border-t border-zinc-200 bg-zinc-50 flex justify-between items-center gap-3 shrink-0">
                {isOwnedByMe ? (
                  <>
                    <button
                      type="button"
                      onClick={handleDeleteSegmentClick}
                      className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Milestone</span>
                    </button>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDrawerOpen(false)}
                        className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 transition bg-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSegmentForm}
                        className="px-5 py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold shadow-sm transition cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider font-mono">
                      Read-only preview
                    </span>
                    <div className="flex gap-2.5">
                      <button
                        disabled={isForking}
                        onClick={handleForkInline}
                        className="bg-zinc-900 hover:bg-zinc-850 text-white px-4 py-2 rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <GitFork className="w-3.5 h-3.5" />
                        <span>Fork to Custom</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerOpen(false)}
                        className="px-5 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-700 transition bg-white cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EDIT TIMELINE DETAILS DRAWER */}
      <AnimatePresence>
        {isEditingTimeline && (
          <>
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingTimeline(false)}
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
                    Edit Roadmap Details
                  </span>
                </div>
                
                <button
                  onClick={() => setIsEditingTimeline(false)}
                  className="p-2 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-white">
                {/* Title input */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">Roadmap Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Learn Fullstack Development"
                    value={editingTimelineTitle}
                    onChange={(e) => setEditingTimelineTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                {/* Description input */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide a detailed roadmap plan summary..."
                    value={editingTimelineDesc}
                    onChange={(e) => setEditingTimelineDesc(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-500 font-mono resize-none leading-relaxed"
                  />
                </div>

                {/* Visibility input */}
                <div className="flex items-center justify-between py-2 border-t border-zinc-100 mt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Public Visibility</span>
                    <p className="text-[10px] text-zinc-450 font-normal font-sans">Publish this roadmap so others can view and fork it in the explore tab.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingTimelineIsPublic}
                    onChange={(e) => setEditingTimelineIsPublic(e.target.checked)}
                    className={`w-4 h-4 cursor-pointer accent-zinc-900`}
                  />
                </div>
              </div>

              {/* Drawer footer controls */}
              <div className="p-6 border-t border-[#eaecf0] bg-zinc-50 flex justify-end items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingTimeline(false)}
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

      {/* AI ROADMAP GENERATOR BACKDROP AND PANEL MODAL */}
      <AnimatePresence>
        {aiGeneratorOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 border border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-150 relative overflow-hidden">
              <div className="absolute right-[-40px] top-[-40px] w-32 h-32 bg-zinc-50 rounded-full -z-10 blur-xl opacity-80" />
              <div className="flex gap-2.5 items-center mb-3">
                <Sparkles className="w-5.5 h-5.5 text-zinc-900 fill-zinc-100" />
                <h3 className="text-base font-bold text-zinc-900 font-serif italic tracking-tight">AI Curriculum Generator</h3>
              </div>
              <p className="text-xs text-zinc-500">Specify what you want to learn or organize. The AI will build a detailed structured curriculum layout with matching sub-goals and URLs covering all {activeTimeline.duration} intervals.</p>
              
              <form onSubmit={handleInvokeAiGenerator} className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">Explain learning curriculum or project targets</label>
                  <textarea
                    required
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Master React and TypeScript from complete scratch, including hooks, context API, and clean state routing..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-905/10 focus:border-zinc-905"
                  />
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg text-[10px] text-zinc-650 font-mono uppercase tracking-wider flex items-start gap-2.5 leading-relaxed">
                  <Activity className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                  <span>
                    The model generates structured curricula of exactly <strong className="font-extrabold text-zinc-900">{activeTimeline.duration} {activeTimeline.timeUnitId || 'milestone'}s</strong> matching this timeline&apos;s configuration. Overwrites any existing static tracks!
                  </span>
                </div>

                <div className="flex justify-end gap-2.5 mt-2">
                  <button
                    disabled={aiGenerating}
                    type="button"
                    onClick={() => setAiGeneratorOpen(false)}
                    className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={aiGenerating}
                    type="submit"
                    className="px-5 py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating Roadmap...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Create AI Modules</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
