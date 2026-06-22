'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  Settings, 
  LogOut, 
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useTimelineStore } from '../hooks/TimelineContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { timelines, activeTimelineId, setActiveTimelineId, logout, currentUser, accentColor } = useTimelineStore();

  const themes = {
    emerald: {
      bgActive: 'bg-[#0e623f] text-white shadow-sm',
      borderLeft: 'border-[#0e623f]',
      bgActiveBadge: 'bg-[#08422a]',
      bgActiveLabel: 'bg-[#0e623f]',
      textActive: 'text-[#0e623f]',
    },
    slate: {
      bgActive: 'bg-slate-900 text-white shadow-sm',
      borderLeft: 'border-slate-900',
      bgActiveBadge: 'bg-slate-800',
      bgActiveLabel: 'bg-slate-900',
      textActive: 'text-slate-900',
    },
    indigo: {
      bgActive: 'bg-indigo-600 text-white shadow-sm',
      borderLeft: 'border-indigo-600',
      bgActiveBadge: 'bg-indigo-750',
      bgActiveLabel: 'bg-indigo-600',
      textActive: 'text-indigo-600',
    },
  };

  const activeTheme = themes[accentColor] || themes.emerald;

  const isOnDashboard = pathname === '/dashboard' || pathname?.startsWith('/dashboard/timeline');
  const isOnExplore = pathname === '/explore';
  const isOnSettings = pathname === '/settings';
  const isOnTimeline = pathname?.startsWith('/dashboard/timeline');

  const handleLogoutClick = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="w-64 bg-white border-r border-zinc-200 h-screen flex flex-col justify-between py-6 px-4 shrink-0 font-sans select-none">
      {/* Brand & Navigation */}
      <div className="flex flex-col gap-6">
        {/* Brand Logotype */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold tracking-tighter text-zinc-900 font-sans">
            NAVIGOO<span className="text-zinc-400 font-light font-sans">.app</span>
          </div>
        </div>

        {/* Menu Title */}
        <div className="mt-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-2 block mb-2">Menu</span>
          <nav className="mt-2 flex flex-col gap-1">
            <button
              onClick={() => { setActiveTimelineId(null); router.push('/dashboard'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-[11px] uppercase tracking-wider transition-all duration-200 ${
                isOnDashboard && !isOnTimeline
                  ? `${activeTheme.bgActive}`
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 ${isOnDashboard && !isOnTimeline ? 'text-white' : 'text-zinc-400'}`} />
                <span>Dashboard</span>
              </div>
              {timelines.length > 0 && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isOnDashboard && !isOnTimeline ? `${activeTheme.bgActiveBadge} text-white` : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {timelines.length}
                </span>
              )}
            </button>

            {isOnTimeline && (
              <button
                onClick={() => router.push('/dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-semibold text-[11px] uppercase tracking-wider bg-zinc-100 text-zinc-900 transition-all duration-200 border-l-2 ${activeTheme.borderLeft}`}
              >
                <Layers className={`w-4 h-4 ${activeTheme.textActive}`} />
                <span className="truncate pr-1 text-left">Active Tracker</span>
                <span className={`text-[8px] uppercase font-bold tracking-widest ml-auto text-white px-1.5 py-0.5 rounded ${activeTheme.bgActiveLabel}`}>Active</span>
              </button>
            )}

            <button
              onClick={() => router.push('/explore')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-semibold text-[11px] uppercase tracking-wider transition-all duration-200 ${
                isOnExplore
                  ? `${activeTheme.bgActive}`
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Map className={`w-4 h-4 ${isOnExplore ? 'text-white' : 'text-zinc-400'}`} />
              <span>Explore</span>
            </button>
          </nav>
        </div>

        {/* General Options */}
        <div className="mt-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-2 block mb-2">General</span>
          <nav className="mt-2 flex flex-col gap-1">
            <button
              onClick={() => router.push('/settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-semibold text-[11px] uppercase tracking-wider transition-all duration-200 ${
                isOnSettings
                  ? `${activeTheme.bgActive}`
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Settings className={`w-4 h-4 ${isOnSettings ? 'text-white' : 'text-zinc-400'}`} />
              <span>Settings</span>
            </button>
            
            {currentUser && (
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-semibold text-[11px] uppercase tracking-wider text-red-650 hover:bg-red-50/60 transition-all duration-200 mt-2"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Logout</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
