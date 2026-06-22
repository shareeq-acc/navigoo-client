'use client';

import React, { useState } from 'react';
import { Search, Bell, Shield, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTimelineStore } from '../hooks/TimelineContext';

export default function Header() {
  const { currentUser, searchQuery, setSearchQuery, logout } = useTimelineStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <header className="w-full h-18 bg-white border-b border-zinc-200 px-4 md:px-8 flex items-center justify-between shrink-0 font-sans sticky top-0 z-40 select-none">

        {/* Search Bar section */}
        <div className="relative flex-1 max-w-[245px] xs:max-w-[290px] sm:max-w-sm md:w-96 md:max-w-none md:flex-none">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search timelines / projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg pl-10 pr-12 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5 pointer-events-none text-[9px] text-zinc-400 font-mono flex items-center gap-0.5 hidden xs:flex">
            <span>⌘</span>
            <span>F</span>
          </div>
        </div>

        {/* Utilities & User widgets */}
        <div className="flex items-center gap-1.5 xs:gap-3 md:gap-5">

          {/* Notifications */}
          <button className="p-2 text-zinc-500 hover:bg-zinc-100/60 hover:text-zinc-950 rounded-lg transition-colors relative shrink-0">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-zinc-950 text-[8px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-white">
              3
            </span>
          </button>

          <div className="hidden sm:block h-6 w-[1px] bg-zinc-200 shrink-0" />

          {/* User profile dropdown triggers */}
          <div className="relative shrink-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 xs:gap-3 py-1 px-1.5 xs:px-2 rounded-lg hover:bg-zinc-50 transition-all text-left shrink-0"
            >
              <div className="relative shrink-0 w-8 h-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser?.avatar || "https://picsum.photos/seed/totok/100/100"}
                  alt={currentUser?.username || "Guest User"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-100 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-zinc-950 border-2 border-white rounded-full shrink-0" />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-zinc-800 leading-tight">
                  {currentUser?.name || "Totok Michael"}
                </span>
                <span className="text-[10px] text-zinc-400 leading-normal font-medium max-w-[140px] truncate font-mono">
                  {currentUser?.username ? `@${currentUser.username}` : "@totok_mike"}
                </span>
              </div>
            </button>

            {/* Dropdown element */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-60 bg-white border border-zinc-200 rounded-xl shadow-md py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                  <span className="text-[9px] uppercase font-bold tracking-[0.18em] text-zinc-400 block">User Space</span>
                  <div className="mt-0.5 font-bold text-zinc-805 text-xs font-serif italic">Logged as @{currentUser?.username || "Guest"}</div>
                </div>                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push('/user/account');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>Account</span>
                </button>

                <button
                  onClick={async () => {
                    setDropdownOpen(false);
                    await logout();
                    router.push('/');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Logout</span>
                </button>

                <div className="border-t border-zinc-100 my-1" />

                {/* <div className="px-4 py-1.5 text-[9px] text-zinc-450 font-medium tracking-wide">
                  CONNECTION SECURITY
                  <div className="flex items-center gap-1.5 mt-0.5 text-zinc-800 font-mono text-[10px]">
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Mock-TLS Active (SSL)</span>
                  </div>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
