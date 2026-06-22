'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTimelineStore } from '../../hooks/TimelineContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading, enableTransitions } = useTimelineStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // redirect is in progress
  }

  return (
    <div className="w-full h-screen flex bg-slate-50 overflow-hidden font-sans select-none relative">
      
      {/* Mobile Drawer Trigger Menu */}
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="fixed bottom-6 right-6 md:hidden z-50 p-4 bg-zinc-900 text-white rounded-full shadow-lg active:scale-95 cursor-pointer flex items-center justify-center border border-zinc-700 hover:bg-zinc-805"
        title="Toggle Menu"
      >
        {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Navigation Left Panel */}
      <div className={`fixed inset-y-0 left-0 z-45 md:relative md:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-out shrink-0`}>
        <Sidebar />
      </div>

      {/* Screen Backdrop for Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Main Core Window Panel */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={enableTransitions ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={enableTransitions ? { opacity: 0, y: -8 } : { opacity: 1 }}
              transition={{ duration: enableTransitions ? 0.18 : 0, ease: "easeOut" }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
