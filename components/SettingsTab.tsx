'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles } from 'lucide-react';
import { useTimelineStore } from '../hooks/TimelineContext';

export default function SettingsTab() {
  const { 
    currentUser, 
    accentColor, 
    enableTransitions, 
    enableSound, 
    setAccentColor, 
    setEnableTransitions, 
    setEnableSound,
  } = useTimelineStore();

  const [resetTimer, setResetTimer] = useState<{ dateString: string; timeRemaining: string }>({ dateString: '', timeRemaining: '' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const currentDay = now.getDay();
      
      const target = new Date(now);
      const daysToAdd = currentDay === 0 ? 1 : 8 - currentDay;
      target.setDate(now.getDate() + daysToAdd);
      target.setHours(0, 0, 0, 0);

      const diffMs = target.getTime() - now.getTime();
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      const formattedResetDate = target.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      
      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);

      setResetTimer({
        dateString: formattedResetDate,
        timeRemaining: parts.join(' ')
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const themeColors = {
    emerald: {
      accentHex: '#0e623f',
      accentText: 'text-[#0e623f]',
      bgAccent: 'bg-[#0e623f]',
      borderColor: 'border-[#0e623f]',
      lightBg: 'bg-emerald-50/50',
      badgeClass: 'bg-emerald-50 text-[#0e623f] border-emerald-150',
      avatarRing: 'ring-emerald-500/10',
      accentSelector: 'accent-[#0e623f]'
    },
    slate: {
      accentHex: '#0f172a',
      accentText: 'text-slate-900',
      bgAccent: 'bg-slate-900',
      borderColor: 'border-slate-900',
      lightBg: 'bg-slate-50',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
      avatarRing: 'ring-slate-900/10',
      accentSelector: 'accent-slate-900'
    },
    indigo: {
      accentHex: '#4f46e5',
      accentText: 'text-indigo-600',
      bgAccent: 'bg-indigo-600',
      borderColor: 'border-indigo-600',
      lightBg: 'bg-indigo-50/50',
      badgeClass: 'bg-indigo-50 text-indigo-600 border-indigo-150',
      avatarRing: 'ring-indigo-500/10',
      accentSelector: 'accent-indigo-600'
    }
  };

  const activeTheme = themeColors[accentColor] || themeColors.emerald;
  const aiPercent = currentUser?.aiUsage || 0;

  return (
    <div className="flex-1 bg-[#fcfcfd] p-8 overflow-y-auto font-sans">
      
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Configure workspace rules, system animations, status guidelines, and backup settings.</p>
      </div>

      <div className="max-w-2xl flex flex-col gap-6">
        
        {/* Workspace Account summary block */}
        <div className="bg-white border border-[#eaecf0] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser?.avatar || "https://picsum.photos/seed/totok/100/100"}
              alt={currentUser?.username || "User"}
              className={`w-12 h-12 rounded-full object-cover ring-4 ${activeTheme.avatarRing}`}
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <h4 className="font-bold text-slate-800 text-sm leading-tight">{currentUser?.username || "User"}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Theme customization */}
        <div className="bg-white border border-[#eaecf0] rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Workspace Appearance</span>
          </h3>

          <div className="flex flex-col gap-4 text-xs font-semibold">
            {/* Color accent picks */}
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Theme Color</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                {[
                  { id: 'emerald', label: 'Emerald Green', fill: 'bg-[#0e623f]', border: 'border-[#0e623f]' },
                  { id: 'slate', label: 'Dark Slate', fill: 'bg-slate-900', border: 'border-slate-900' },
                  { id: 'indigo', label: 'Royal Indigo', fill: 'bg-indigo-600', border: 'border-indigo-600' }
                ].map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setAccentColor(color.id as any)}
                    className={`px-3 py-2 border rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors w-full ${
                      accentColor === color.id 
                        ? `${color.border} ${color.id === 'slate' ? 'bg-slate-50' : color.id === 'indigo' ? 'bg-indigo-50/20' : 'bg-emerald-50/10'} text-slate-800` 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${color.fill}`} />
                    <span className="truncate">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#f2f4f7] my-2" />

            {/* Switchers */}
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700">Page Animations</span>
                <p className="text-[10px] text-slate-400 font-normal">Enable smooth transition animations between tabs and workspaces.</p>
              </div>
              <input
                type="checkbox"
                checked={enableTransitions}
                onChange={() => setEnableTransitions(!enableTransitions)}
                className={`w-4 h-4 cursor-pointer ${activeTheme.accentSelector}`}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700">Sound Effects</span>
                <p className="text-[10px] text-slate-400 font-normal">Play responsive sound feedback on completing or updating tasks.</p>
              </div>
              <input
                type="checkbox"
                checked={enableSound}
                onChange={() => setEnableSound(!enableSound)}
                className={`w-4 h-4 cursor-pointer ${activeTheme.accentSelector}`}
              />
            </div>
          </div>
        </div>

        {/* AI Limit Indicator Summary Widget */}
        <div className="bg-white border border-[#eaecf0] rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <span>AI Feature Limits</span>
          </h3>

          <div className="flex flex-col gap-4 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700">Weekly AI Usage</span>
                <p className="text-[10px] text-slate-400 font-normal">Remaining quota for auto-generating timeline milestones.</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-extrabold ${activeTheme.accentText}`}>{currentUser?.aiUsage || 0}%</span>
              </div>
            </div>

            {/* Quota bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-350 ${activeTheme.bgAccent}`}
                style={{ width: `${aiPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed font-normal mt-1">
              Your weekly limit automatically resets. If you require more generation capacity, feel free to contact workspace support.
            </p>

            <div className="mt-3 bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Next Reset Date</span>
                <span className="text-slate-700 font-semibold">{resetTimer.dateString || "Monday at midnight"}</span>
              </div>
              <div className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wide shrink-0 ${activeTheme.bgAccent} text-white`}>
                Time Remaining: {resetTimer.timeRemaining || "..."}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
