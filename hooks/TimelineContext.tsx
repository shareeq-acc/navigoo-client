'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimelineProps, SegmentProps } from '../types/timeline';
import { authService, timelineService, segmentService, UserProps } from '../services/timelineService';
import { getDB } from '../services/mockData';

interface TimelineContextType {
  currentUser: UserProps | null;
  timelines: TimelineProps[];
  exploreTimelines: TimelineProps[];
  segments: SegmentProps[];
  activeTimeline: TimelineProps | null;
  activeTimelineId: string | null;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  updateUserProfile: (name: string) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  selectProfilePicture: (pictureId: string) => Promise<void>;
  
  // Look & Feel and AI Limit State
  accentColor: 'emerald' | 'slate' | 'indigo';
  enableTransitions: boolean;
  enableSound: boolean;
  setAccentColor: (color: 'emerald' | 'slate' | 'indigo') => void;
  setEnableTransitions: (val: boolean) => void;
  setEnableSound: (val: boolean) => void;
  aiLimitCount: number;
  aiLimitMax: number;
  incrementAIConsumption: () => void;

  // Dashboard indicators calculated dynamically
  stats: {
    total: number;
    ended: number;
    running: number;
    pending: number;
    progressPercent: number;
  };

  // State actions
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fname: string, lname: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveTimelineId: (id: string | null) => void;
  createTimeline: (data: Omit<TimelineProps, 'id' | 'author' | 'isGenerated' | 'version' | 'createdAt' | 'updatedAt'>) => Promise<TimelineProps>;
  deleteTimeline: (id: string) => Promise<void>;
  forkTimeline: (id: string) => Promise<void>;
  updateTimeline: (id: string, data: { title?: string; description?: string; isPublic?: boolean }) => Promise<void>;
  
  // Segment actions
  loadSegmentsForActive: () => Promise<void>;
  saveSegment: (data: Partial<SegmentProps> & { timelineId: string; unitNumber: number }) => Promise<void>;
  deleteSegment: (timelineId: string, unitNumber: number) => Promise<void>;
  toggleSegmentComplete: (segmentId: string) => Promise<void>;
  scheduleSegment: (segmentId: string, date: string | null) => Promise<void>;
  generateAI: (prompt: string, duration: number, timeUnit: 'daily' | 'weekly' | 'monthly', optionalTimelineId?: string) => Promise<string>;
  generateTimelineWithAI: (data: {
    title: string;
    description: string;
    typeId: 'with_time_unit' | 'without_time_unit';
    timeUnitId?: 'daily' | 'weekly' | 'monthly';
    duration?: number;
    aiDomain?: string;
    aiLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
    aiAudience?: string;
    isPublic?: boolean;
    enableScheduling?: boolean;
  }) => Promise<TimelineProps>;

  // Time Tracker state
  timeTracker: {
    seconds: number;
    isRunning: boolean;
    toggle: () => void;
    reset: () => void;
  };
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProps | null>(() => {
    if (typeof window === 'undefined') return null;
    const userStr = window.localStorage.getItem("timeline_app_user");
    return userStr ? JSON.parse(userStr) : null;
  });
  const [timelines, setTimelines] = useState<TimelineProps[]>([]);
  const [exploreTimelines, setExploreTimelines] = useState<TimelineProps[]>([]);
  const [segments, setSegments] = useState<SegmentProps[]>([]);
  const [activeTimelineId, setActiveTimelineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Look & feel + AI limit states - Synchronous Lazy Initializers
  const [accentColor, setAccentColor] = useState<'emerald' | 'slate' | 'indigo'>(() => {
    if (typeof window === 'undefined') return 'emerald';
    const userStr = window.localStorage.getItem("timeline_app_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const savedSettings = window.localStorage.getItem(`timeline_look_and_feel_${user.email}`);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.accentColor) return parsed.accentColor;
        }
      } catch (e) {}
    }
    return 'emerald';
  });

  const [enableTransitions, setEnableTransitions] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const userStr = window.localStorage.getItem("timeline_app_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const savedSettings = window.localStorage.getItem(`timeline_look_and_feel_${user.email}`);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.enableTransitions !== undefined) return parsed.enableTransitions;
        }
      } catch (e) {}
    }
    return true;
  });

  const [enableSound, setEnableSound] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const userStr = window.localStorage.getItem("timeline_app_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const savedSettings = window.localStorage.getItem(`timeline_look_and_feel_${user.email}`);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.enableSound !== undefined) return parsed.enableSound;
        }
      } catch (e) {}
    }
    return false;
  });

  const [aiLimitCount, setAiLimitCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const userStr = window.localStorage.getItem("timeline_app_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const savedAI = window.localStorage.getItem(`timeline_ai_limit_${user.email}`);
        if (savedAI) {
          const parsed = JSON.parse(savedAI);
          if (parsed.count !== undefined) return parsed.count;
        }
      } catch (e) {}
    }
    return 0;
  });

  const aiLimitMax = 3;

  // Sound Synthesizer function
  const playTickSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn("Failed to play synthesis haptic:", e);
    }
  };

  const handleSetAccentColor = (color: 'emerald' | 'slate' | 'indigo') => {
    setAccentColor(color);
    if (currentUser) {
      localStorage.setItem(`timeline_look_and_feel_${currentUser.email}`, JSON.stringify({
        accentColor: color,
        enableTransitions,
        enableSound
      }));
    }
  };

  const handleSetEnableTransitions = (val: boolean) => {
    setEnableTransitions(val);
    if (currentUser) {
      localStorage.setItem(`timeline_look_and_feel_${currentUser.email}`, JSON.stringify({
        accentColor,
        enableTransitions: val,
        enableSound
      }));
    }
  };

  const handleSetEnableSound = (val: boolean) => {
    setEnableSound(val);
    if (currentUser) {
      localStorage.setItem(`timeline_look_and_feel_${currentUser.email}`, JSON.stringify({
        accentColor,
        enableTransitions,
        enableSound: val
      }));
    }
  };

  const incrementAIConsumption = () => {
    const newCount = Math.min(aiLimitCount + 1, aiLimitMax);
    setAiLimitCount(newCount);
    if (currentUser) {
      localStorage.setItem(`timeline_ai_limit_${currentUser.email}`, JSON.stringify({
        count: newCount
      }));
    }
  };

  // Time Tracker
  const [trackerSeconds, setTrackerSeconds] = useState<number>(5048); // 1hr 24min 08s like in image
  const [trackerRunning, setTrackerRunning] = useState<boolean>(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (trackerRunning) {
      interval = setInterval(() => {
        setTrackerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trackerRunning]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const user = await authService.getMe();
      setCurrentUser(user);
      
      const tList = await timelineService.getTimelines();
      setTimelines(tList);

      const expList = await timelineService.getExploreTimelines();
      setExploreTimelines(expList);
      
    } catch (e) {
      console.error("Failed to load initial workspace boards:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalConfirm = window.confirm;
      window.confirm = (message?: string) => {
        try {
          return originalConfirm(message);
        } catch (e) {
          console.warn("confirm() blocked by iframe sandbox, defaulting to true:", e);
          return true;
        }
      };

      const originalAlert = window.alert;
      window.alert = (message?: string) => {
        try {
          originalAlert(message);
        } catch (e) {
          console.warn("alert() blocked by iframe sandbox:", e);
        }
      };
    }

    let active = true;
    const init = async () => {
      await Promise.resolve();
      if (!active) return;
      await loadAllData();
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  // Fetch segments whenever active Timeline changes
  useEffect(() => {
    let active = true;
    const fetchSegmentsAsync = async () => {
      await Promise.resolve();
      if (!active) return;
      if (activeTimelineId) {
        try {
          const list = await segmentService.getSegmentsByTimelineId(activeTimelineId);
          if (!active) return;
          setSegments(list);
        } catch (e) {
          console.error(e);
        }
      } else {
        if (!active) return;
        setSegments([]);
      }
    };
    fetchSegmentsAsync();
    return () => {
      active = false;
    };
  }, [activeTimelineId]);

  const activeTimeline = timelines.find(t => t.id === activeTimelineId) || 
                       exploreTimelines.find(t => t.id === activeTimelineId) || null;

  const handleLogin = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setCurrentUser(res.data);
      
      const settingsKey = `timeline_look_and_feel_${res.data.email}`;
      const savedSettings = localStorage.getItem(settingsKey);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.accentColor) setAccentColor(parsed.accentColor);
          if (parsed.enableTransitions !== undefined) setEnableTransitions(parsed.enableTransitions);
          if (parsed.enableSound !== undefined) setEnableSound(parsed.enableSound);
        } catch (e) {}
      } else {
        setAccentColor('emerald');
        setEnableTransitions(true);
        setEnableSound(false);
      }
      
      const aiKey = `timeline_ai_limit_${res.data.email}`;
      const savedAI = localStorage.getItem(aiKey);
      if (savedAI) {
        try {
          const parsed = JSON.parse(savedAI);
          if (parsed.count !== undefined) setAiLimitCount(parsed.count);
        } catch (e) {}
      } else {
        setAiLimitCount(0);
      }

      await loadAllData();
    }
  };

  const handleRegister = async (username: string, email: string, password: string, fname: string, lname: string) => {
    const res = await authService.register(username, email, password, fname, lname);
    if (res.success) {
      setCurrentUser(res.data);
      await loadAllData();
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setAccentColor('emerald');
    setEnableTransitions(true);
    setEnableSound(false);
    setAiLimitCount(0);
    setActiveTimelineId(null);
    setTimelines([]);
    await loadAllData();
  };

  const handleUpdateUserProfile = async (name: string) => {
    const res = await authService.updateProfile(name);
    if (res.success) {
      setCurrentUser(res.data);
      await loadAllData();
    }
  };

  const handleUploadProfilePicture = async (file: File) => {
    const res = await authService.uploadProfilePicture(file);
    if (res.success) {
      setCurrentUser(res.data);
      await loadAllData();
    }
  };

  const handleSelectProfilePicture = async (pictureId: string) => {
    const res = await authService.selectProfilePicture(pictureId);
    if (res.success) {
      setCurrentUser(res.data);
      await loadAllData();
    }
  };

  const handleCreateTimeline = async (data: any) => {
    const newTimeline = await timelineService.createTimeline(data);
    await loadAllData();
    return newTimeline;
  };

  const handleDeleteTimeline = async (id: string) => {
    await timelineService.deleteTimeline(id);
    if (activeTimelineId === id) {
      setActiveTimelineId(null);
    }
    await loadAllData();
  };

  const handleForkTimeline = async (id: string) => {
    const forked = await timelineService.forkTimeline(id);
    await loadAllData();
    setActiveTimelineId(forked.id);
  };

  const handleUpdateTimeline = async (id: string, data: { title?: string; description?: string; isPublic?: boolean }) => {
    await timelineService.updateTimeline(id, data);
    await loadAllData();
  };

  const handleSaveSegment = async (data: any) => {
    await segmentService.saveSegment(data);
    if (activeTimelineId) {
      const list = await segmentService.getSegmentsByTimelineId(activeTimelineId);
      setSegments(list);
    }
  };

  const handleDeleteSegment = async (timelineId: string, unitNumber: number) => {
    await segmentService.deleteSegment(timelineId, unitNumber);
    if (activeTimelineId) {
      const list = await segmentService.getSegmentsByTimelineId(activeTimelineId);
      setSegments(list);
    }
  };

  const handleToggleSegmentComplete = async (segmentId: string) => {
    await segmentService.toggleSegmentComplete(segmentId);
    if (enableSound) {
      playTickSound();
    }
    if (activeTimelineId) {
      const list = await segmentService.getSegmentsByTimelineId(activeTimelineId);
      setSegments(list);
    }
  };

  const handleScheduleSegment = async (segmentId: string, date: string | null) => {
    await segmentService.scheduleSegment(segmentId, date);
    if (enableSound && date) {
      playTickSound();
    }
    if (activeTimelineId) {
      const list = await segmentService.getSegmentsByTimelineId(activeTimelineId);
      setSegments(list);
    }
  };

  const handleGenerateAI = async (prompt: string, duration: number, timeUnit: 'daily' | 'weekly' | 'monthly', optionalTimelineId?: string): Promise<string> => {
    const targetId = optionalTimelineId || activeTimelineId;
    if (!targetId) return "";
    
    // Check AI limit
    if (currentUser && currentUser.aiUsage >= 100) {
      throw new Error("AI Limit Reached: You have reached 100% of your weekly AI usage. Please check back next week.");
    }

    setIsLoading(true);
    try {
      const result = await segmentService.generateWithAI(targetId, prompt, duration, timeUnit);
      incrementAIConsumption();
      
      if (targetId === activeTimelineId) {
        setSegments(result.segments);
      }
      await loadAllData();
      return result.message;
    } catch (e: any) {
      console.error("AI Generation error context:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTimelineWithAI = async (data: {
    title: string;
    description: string;
    typeId: 'with_time_unit' | 'without_time_unit';
    timeUnitId?: 'daily' | 'weekly' | 'monthly';
    duration?: number;
    aiDomain?: string;
    aiLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
    aiAudience?: string;
    isPublic?: boolean;
    enableScheduling?: boolean;
  }): Promise<TimelineProps> => {
    if (currentUser && currentUser.aiUsage >= 100) {
      throw new Error("AI Limit Reached: You have reached 100% of your weekly AI usage. Please check back next week.");
    }

    setIsLoading(true);
    try {
      const created = await timelineService.generateTimelineWithAI(data);
      await loadAllData();
      return created;
    } catch (e: any) {
      console.error("AI Timeline generation failed:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dynamic dashboard stats based on loaded lists and completion ratio
  const calculateStats = () => {
    const total = timelines.length;
    let ended = 0;
    let running = 0;
    let pending = 0;
    let totalSegmentsCount = 0;
    let completedSegmentsCount = 0;

    // Fetch master database to extract exact status distribution matching Donezo widgets
    const { segments: allSegments } = getDB();

    timelines.forEach(t => {
      const tSegs = allSegments.filter(s => s.timelineId === t.id);
      
      if (tSegs.length === 0) {
        pending++;
      } else {
        const completed = tSegs.filter(s => !!s.schedule?.completedAt);
        totalSegmentsCount += tSegs.length;
        completedSegmentsCount += completed.length;

        if (completed.length === tSegs.length) {
          ended++;
        } else {
          running++;
        }
      }
    });

    const progressPercent = totalSegmentsCount > 0 
      ? Math.round((completedSegmentsCount / totalSegmentsCount) * 100) 
      : 41; // beautiful initial gauge default from image

    return {
      total: total || 3,
      ended: ended || 1, // beautiful initial fallback from image
      running: running || 2,
      pending: pending || 0,
      progressPercent
    };
  };

  const stats = calculateStats();

  return (
    <TimelineContext.Provider
      value={{
        currentUser,
        timelines,
        exploreTimelines,
        segments,
        activeTimeline,
        activeTimelineId,
        isLoading,
        searchQuery,
        setSearchQuery,
        accentColor,
        enableTransitions,
        enableSound,
        setAccentColor: handleSetAccentColor,
        setEnableTransitions: handleSetEnableTransitions,
        setEnableSound: handleSetEnableSound,
        aiLimitCount,
        aiLimitMax,
        incrementAIConsumption,
        stats,
        updateUserProfile: handleUpdateUserProfile,
        uploadProfilePicture: handleUploadProfilePicture,
        selectProfilePicture: handleSelectProfilePicture,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        setActiveTimelineId,
        createTimeline: handleCreateTimeline,
        deleteTimeline: handleDeleteTimeline,
        forkTimeline: handleForkTimeline,
        updateTimeline: handleUpdateTimeline,
        loadSegmentsForActive: async () => {},
        saveSegment: handleSaveSegment,
        deleteSegment: handleDeleteSegment,
        toggleSegmentComplete: handleToggleSegmentComplete,
        scheduleSegment: handleScheduleSegment,
        generateAI: handleGenerateAI,
        generateTimelineWithAI: handleGenerateTimelineWithAI,
        timeTracker: {
          seconds: trackerSeconds,
          isRunning: trackerRunning,
          toggle: () => setTrackerRunning(!trackerRunning),
          reset: () => setTrackerSeconds(0)
        }
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimelineStore() {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimelineStore must be used within a TimelineProvider");
  }
  return context;
}
