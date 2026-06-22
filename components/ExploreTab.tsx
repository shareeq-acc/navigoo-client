'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  GitFork, 
  User, 
  Calendar, 
  ArrowRight, 
  Sparkles,
  Info
} from 'lucide-react';
import { useTimelineStore } from '../hooks/TimelineContext';
import { timelineService } from '../services/timelineService';
import { TimelineProps } from '../types/timeline';
import { useRouter } from 'next/navigation';

export default function ExploreTab() {
  const router = useRouter();
  const { forkTimeline, currentUser, setActiveTimelineId } = useTimelineStore();
  const [publicTimelines, setPublicTimelines] = useState<TimelineProps[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [forkingId, setForkingId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    let active = true;
    const fetchItemsAsync = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      try {
        const list = await timelineService.getExploreTimelines(search, typeFilter, timeFilter);
        if (!active) return;
        setPublicTimelines(list);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchItemsAsync();
    return () => {
      active = false;
    };
  }, [search, typeFilter, timeFilter]);

  const totalPages = Math.ceil(publicTimelines.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedPublicTimelines = publicTimelines.slice(startIndex, startIndex + itemsPerPage);

  const handleFork = async (id: string, title: string) => {
    setForkingId(id);
    try {
      await forkTimeline(id);
      alert(`Successfully cloned: "${title}" into your custom dashboard panels (v1.0-forked).`);
    } catch (e) {
      alert("Fork failed.");
    } finally {
      setForkingId(null);
    }
  };

  return (
    <div className="flex-1 bg-zinc-50/40 p-4 sm:p-8 overflow-y-auto font-sans">
      
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-zinc-900 font-serif italic tracking-tight">Explore</h2>
        <p className="text-zinc-500 text-xs mt-1">
          Browse top educational paths, structural curricula, and project schedules curated by the open-source community.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
        {/* Local Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search public curricula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 font-medium px-4 py-2 rounded-lg focus:outline-none animate-in fade-in"
          >
            <option value="">All Types</option>
            <option value="with_time_unit">With Time Unit</option>
            <option value="without_time_unit">Without Time Unit</option>
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 font-medium px-4 py-2 rounded-lg focus:outline-none animate-in fade-in"
          >
            <option value="">All Durations</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Explore Grid display */}
      {loading ? (
        <div className="flex justify-center items-center h-60 animate-fade-in">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
        </div>
      ) : publicTimelines.length === 0 ? (
        <div className="p-16 border border-dashed border-zinc-200 bg-white rounded-xl text-center flex flex-col items-center justify-center text-zinc-400">
          <Filter className="w-10 h-10 text-zinc-300 mb-3" />
          <h4 className="font-bold text-zinc-700 text-xs font-serif italic">No Public Roadmaps Match Your Filters</h4>
          <p className="text-[10px] max-w-sm mt-1 mb-4 text-zinc-400 font-mono uppercase tracking-wider">Try adjusting filters or typing different keywords into the search box.</p>
          <button 
            onClick={() => { setSearch(""); setTypeFilter(""); setTimeFilter(""); }}
            className="text-white bg-zinc-900 hover:bg-zinc-800 text-[10px] tracking-wider uppercase font-extrabold px-4 py-2 rounded-lg font-mono cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPublicTimelines.map((timeline) => (
            <div
              key={timeline.id}
              onClick={() => router.push(`/dashboard/timeline/${timeline.id}`)}
              className="group border border-zinc-200 p-5 rounded-xl hover:border-zinc-900 hover:shadow-xs transition-all cursor-pointer relative bg-zinc-50/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      timeline.typeId === 'with_time_unit' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {timeline.typeId === 'with_time_unit' ? 'With Time Unit' : 'Without Time Unit'}
                    </span>
                    {timeline.typeId === 'with_time_unit' && timeline.timeUnitId && (
                      <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 uppercase px-2 py-0.5 rounded-md">
                        {timeline.timeUnitId}
                      </span>
                    )}
                  </div>

                  {timeline.isGenerated && (
                    <span className="flex items-center gap-1 bg-zinc-100 text-zinc-805 border border-zinc-200 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider font-mono">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>AI Curated</span>
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-zinc-900 mt-3 group-hover:text-zinc-950 group-hover:underline transition-all font-serif italic mb-2">
                  {timeline.title}
                </h4>
                <p className="text-xs text-zinc-550 line-clamp-2 leading-relaxed">
                  {timeline.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-4.5 pt-4 border-t border-zinc-150">
                <div className="flex items-center justify-between text-[9.5px] text-zinc-400 font-semibold font-mono uppercase tracking-wide leading-none">
                  <span>Duration: {timeline.duration} {timeline.typeId === 'with_time_unit' ? `${timeline.timeUnitId}s` : 'Phases'}</span>
                  <span className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-1.5 py-0.5 rounded">v{timeline.version || "1.0"}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold font-mono">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>By @{timeline.author.username}</span>
                  </div>

                  <button
                    disabled={forkingId === timeline.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFork(timeline.id, timeline.title);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-850 text-white text-[10px] h-8 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 font-mono font-bold uppercase tracking-wide group-hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>{forkingId === timeline.id ? "Forking..." : "Fork"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explore Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-zinc-200 bg-white p-4.5 rounded-xl border border-zinc-200/80 gap-4">
          <span className="text-[11px] text-zinc-500 font-medium">
            Showing <strong className="text-zinc-850">{startIndex + 1}</strong>–<strong className="text-zinc-850">{Math.min(startIndex + itemsPerPage, publicTimelines.length)}</strong> of <strong className="text-zinc-850">{publicTimelines.length}</strong> public projects
          </span>
          <div className="flex gap-2">
            <button
              disabled={activePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3.5 py-1.8 border border-zinc-200 text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-white"
            >
              Previous
            </button>
            <div className="flex items-center px-3 text-[10.5px] font-mono font-semibold text-zinc-500 bg-zinc-50 border border-zinc-150 rounded-lg">
              Page {activePage} of {totalPages}
            </div>
            <button
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3.5 py-1.8 border border-zinc-200 text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Community Curating tip block */}
      <div className="mt-8 bg-[#FAF9F5] border border-zinc-200 p-4.5 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 text-xs text-zinc-800">
          <h4 className="font-bold font-serif italic mb-1 text-zinc-900">Did you know?</h4>
          <p className="leading-relaxed text-zinc-650 font-medium">
            Forking allows you to copy any public syllabus into your private workspace dashboard. Once copied, you can fully modify milestones, check off complete modules, and schedule date markers using the timeline detail page!
          </p>
        </div>
      </div>
    </div>
  );
}
