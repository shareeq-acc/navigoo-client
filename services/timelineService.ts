import { TimelineProps, SegmentProps, SuccessResponse, ErrorResponse } from '../types/timeline';
import { getDB, saveDB, delay } from './mockData';

export interface UserProps {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
}

const DEFAULT_USER: UserProps = {
  id: "usr-1",
  username: "totok_mike",
  name: "Totok Michael",
  email: "tmichael20@gmail.com",
  avatar: "https://picsum.photos/seed/totok/100/100"
};

// Authentication Service Helper
export const authService = {
  async getCurrentUser(): Promise<UserProps | null> {
    if (typeof window === 'undefined') return null;
    const userStr = window.localStorage.getItem("timeline_app_user");
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  },

  async login(email: string, password: string): Promise<SuccessResponse<UserProps>> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Login failed");
    }

    const { accessToken, user } = result.data;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem("timeline_app_token", accessToken);
    }

    const mappedUser: UserProps = {
      id: user.id,
      username: user.username,
      name: `${user.fname} ${user.lname}`,
      email: user.email,
      avatar: user.avatar || `https://picsum.photos/seed/${user.username}/100/100`
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem("timeline_app_user", JSON.stringify(mappedUser));
    }

    return {
      success: true,
      message: "Successfully logged in",
      data: mappedUser
    };
  },

  async register(username: string, email: string, password: string, fname: string, lname: string): Promise<SuccessResponse<UserProps>> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, fname, lname }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Registration failed");
    }

    // Automatically log in the user after successful registration
    return this.login(email, password);
  },

  async updateProfile(name: string, avatar?: string): Promise<SuccessResponse<UserProps>> {
    await delay(200);
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error("No active session found");
    }
    const updatedUser: UserProps = {
      ...currentUser,
      name,
      avatar: avatar !== undefined ? avatar : currentUser.avatar
    };
    if (typeof window !== 'undefined') {
      window.localStorage.setItem("timeline_app_user", JSON.stringify(updatedUser));
    }
    return {
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    };
  },

  async logout(): Promise<void> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem("timeline_app_token");
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (e) {
        console.warn("Logout request failed", e);
      }
      window.localStorage.removeItem("timeline_app_user");
      window.localStorage.removeItem("timeline_app_token");
    }
  }
};

// Timeline Operations Service Client
export const timelineService = {
  async getTimelines(): Promise<TimelineProps[]> {
    await delay(200);
    const { timelines } = getDB();
    const user = await authService.getCurrentUser();
    
    // Return timelines authored by the current user
    if (!user) return timelines;
    return timelines.filter(t => t.author.id === user.id);
  },

  async getTimelineById(id: string): Promise<TimelineProps | null> {
    await delay(150);
    const { timelines } = getDB();
    const t = timelines.find(item => item.id === id);
    return t || null;
  },

  async getExploreTimelines(searchQuery = "", typeFilter = "", timeUnitFilter = ""): Promise<TimelineProps[]> {
    await delay(200);
    const { timelines } = getDB();
    
    // Explore displays public timelines plus timelines authored by current user (for simple sandbox testing)
    return timelines.filter(t => {
      const matchesSearch = searchQuery === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "" || t.typeId === typeFilter;
      const matchesTimeUnit = timeUnitFilter === "" || t.timeUnitId === timeUnitFilter;

      return t.isPublic && matchesSearch && matchesType && matchesTimeUnit;
    });
  },

  async createTimeline(data: Omit<TimelineProps, 'id' | 'author' | 'isGenerated' | 'version' | 'createdAt' | 'updatedAt'>): Promise<TimelineProps> {
    await delay(300);
    const { timelines, segments } = getDB();
    const currentUser = await authService.getCurrentUser() || DEFAULT_USER;

    const newTimeline: TimelineProps = {
      ...data,
      id: `tl-${Math.random().toString(36).substr(2, 6)}`,
      author: {
        id: currentUser.id,
        username: currentUser.username
      },
      isGenerated: false,
      version: "1.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    timelines.unshift(newTimeline);
    saveDB(timelines, segments);
    return newTimeline;
  },

  async deleteTimeline(id: string): Promise<void> {
    await delay(200);
    const { timelines, segments } = getDB();
    const filteredTimelines = timelines.filter(t => t.id !== id);
    const filteredSegments = segments.filter(s => s.timelineId !== id);
    saveDB(filteredTimelines, filteredSegments);
  },

  async forkTimeline(timelineId: string): Promise<TimelineProps> {
    await delay(400);
    const { timelines, segments } = getDB();
    const sourceTimeline = timelines.find(t => t.id === timelineId);
    if (!sourceTimeline) {
      throw new Error("Source timeline not found");
    }

    const currentUser = await authService.getCurrentUser() || DEFAULT_USER;
    const forkedId = `tl-forked-${Math.random().toString(36).substr(2, 6)}`;

    const forkedTimeline: TimelineProps = {
      ...sourceTimeline,
      id: forkedId,
      title: `${sourceTimeline.title} (Forked)`,
      description: `Forked from @${sourceTimeline.author.username}. ${sourceTimeline.description}`,
      author: {
        id: currentUser.id,
        username: currentUser.username
      },
      version: "1.0",
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Duplicate segments
    const sourceSegments = segments.filter(s => s.timelineId === timelineId);
    const duplicatedSegments = sourceSegments.map(sourceSeg => {
      const segId = `seg-forked-${forkedId}-${sourceSeg.unitNumber}-${Math.random().toString(36).substr(2, 4)}`;
      return {
        ...sourceSeg,
        id: segId,
        timelineId: forkedId,
        isForkModified: true,
        goals: sourceSeg.goals.map((g, idx) => ({
          id: `g-forked-${segId}-${idx}`,
          segmentId: segId,
          goal: g.goal
        })),
        references: sourceSeg.references.map((r, idx) => ({
          id: `r-forked-${segId}-${idx}`,
          segmentId: segId,
          reference: r.reference
        })),
        schedule: sourceSeg.schedule ? {
          ...sourceSeg.schedule,
          id: `sch-forked-${segId}`,
          segmentId: segId,
          completedAt: null // reset completions on fork
        } : {
          id: `sch-forked-${segId}`,
          segmentId: segId,
          scheduleDate: null,
          completedAt: null
        }
      };
    });

    timelines.unshift(forkedTimeline);
    saveDB(timelines, [...segments, ...duplicatedSegments]);
    return forkedTimeline;
  }
};

// Segment Node CRUD & AI Logic Operations
export const segmentService = {
  async getSegmentsByTimelineId(timelineId: string): Promise<SegmentProps[]> {
    await delay(100);
    const { segments } = getDB();
    const timelineSegments = segments.filter(s => s.timelineId === timelineId);
    return timelineSegments.sort((a, b) => a.unitNumber - b.unitNumber);
  },

  async saveSegment(segmentData: Partial<SegmentProps> & { timelineId: string; unitNumber: number }): Promise<SegmentProps> {
    await delay(250);
    const { timelines, segments } = getDB();
    
    // Check if segment already exists for this unit number
    const existingIndex = segments.findIndex(s => s.timelineId === segmentData.timelineId && s.unitNumber === segmentData.unitNumber);

    const segmentId = segmentData.id || `seg-${segmentData.timelineId}-${segmentData.unitNumber}-${Math.random().toString(36).substr(2, 4)}`;

    const newSegment: SegmentProps = {
      id: segmentId,
      timelineId: segmentData.timelineId,
      unitNumber: segmentData.unitNumber,
      title: segmentData.title || `Interval ${segmentData.unitNumber} Objective`,
      milestone: segmentData.milestone || `Phase ${Math.ceil(segmentData.unitNumber / 3)}`,
      isForkModified: segmentData.isForkModified || false,
      createdAt: segmentData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      goals: segmentData.goals || [],
      references: segmentData.references || [],
      schedule: segmentData.schedule || {
        id: `sch-${segmentId}`,
        segmentId: segmentId,
        scheduleDate: null,
        completedAt: null
      }
    };

    if (existingIndex > -1) {
      segments[existingIndex] = newSegment;
    } else {
      segments.push(newSegment);
    }

    // Increment associated timeline's version
    const timelineIdx = timelines.findIndex(t => t.id === segmentData.timelineId);
    if (timelineIdx > -1) {
      const currentVer = parseFloat(timelines[timelineIdx].version) || 1.0;
      timelines[timelineIdx].version = (currentVer + 0.1).toFixed(1);
      timelines[timelineIdx].updatedAt = new Date().toISOString();
    }

    saveDB(timelines, segments);
    return newSegment;
  },

  async deleteSegment(timelineId: string, unitNumber: number): Promise<void> {
    await delay(150);
    const { timelines, segments } = getDB();
    const index = segments.findIndex(s => s.timelineId === timelineId && s.unitNumber === unitNumber);
    if (index > -1) {
      segments.splice(index, 1);
      
      // Increment associated timeline's version
      const timelineIdx = timelines.findIndex(t => t.id === timelineId);
      if (timelineIdx > -1) {
        const currentVer = parseFloat(timelines[timelineIdx].version) || 1.0;
        timelines[timelineIdx].version = (currentVer + 0.1).toFixed(1);
        timelines[timelineIdx].updatedAt = new Date().toISOString();
      }

      saveDB(timelines, segments);
    }
  },

  async toggleSegmentComplete(segmentId: string): Promise<SegmentProps> {
    await delay(100);
    const { timelines, segments } = getDB();
    const index = segments.findIndex(s => s.id === segmentId);
    if (index === -1) {
      throw new Error("Segment not found");
    }

    const currentSeg = segments[index];
    const prevSchedule = currentSeg.schedule || { id: `sch-${segmentId}`, segmentId, scheduleDate: null, completedAt: null };
    
    const updatedSeg: SegmentProps = {
      ...currentSeg,
      schedule: {
        ...prevSchedule,
        completedAt: prevSchedule.completedAt ? null : new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    segments[index] = updatedSeg;

    // Increment associated timeline's version
    const timelineIdx = timelines.findIndex(t => t.id === currentSeg.timelineId);
    if (timelineIdx > -1) {
      const currentVer = parseFloat(timelines[timelineIdx].version) || 1.0;
      timelines[timelineIdx].version = (currentVer + 0.1).toFixed(1);
      timelines[timelineIdx].updatedAt = new Date().toISOString();
    }

    saveDB(timelines, segments);
    return updatedSeg;
  },

  async scheduleSegment(segmentId: string, scheduleDate: string | null): Promise<SegmentProps> {
    await delay(100);
    const { timelines, segments } = getDB();
    const index = segments.findIndex(s => s.id === segmentId);
    if (index === -1) {
      throw new Error("Segment not found");
    }

    const currentSeg = segments[index];
    const prevSchedule = currentSeg.schedule || { id: `sch-${segmentId}`, segmentId, scheduleDate: null, completedAt: null };

    const updatedSeg: SegmentProps = {
      ...currentSeg,
      schedule: {
        ...prevSchedule,
        scheduleDate
      },
      updatedAt: new Date().toISOString()
    };

    segments[index] = updatedSeg;

    // Increment associated timeline's version
    const timelineIdx = timelines.findIndex(t => t.id === currentSeg.timelineId);
    if (timelineIdx > -1) {
      const currentVer = parseFloat(timelines[timelineIdx].version) || 1.0;
      timelines[timelineIdx].version = (currentVer + 0.1).toFixed(1);
      timelines[timelineIdx].updatedAt = new Date().toISOString();
    }

    saveDB(timelines, segments);
    return updatedSeg;
  },

  async generateWithAI(timelineId: string, prompt: string, duration: number, timeUnitId: 'daily' | 'weekly' | 'monthly'): Promise<{ segments: SegmentProps[]; message: string }> {
    const response = await fetch("/api/segments/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        timelineId,
        duration,
        timeUnitId
      })
    });

    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.message || "Failed to generate with AI client");
    }

    const generatedSegments: SegmentProps[] = body.data;

    // Clear any preceding static intervals and write generated arrays
    const { timelines, segments } = getDB();
    const cleanSegments = segments.filter(s => s.timelineId !== timelineId);
    
    // Add generated ones
    const finalSegments = [...cleanSegments, ...generatedSegments];
    
    // Mark timeline as AI generated & increment version
    const timelineIdx = timelines.findIndex(t => t.id === timelineId);
    if (timelineIdx > -1) {
      timelines[timelineIdx].isGenerated = true;
      const currentVer = parseFloat(timelines[timelineIdx].version) || 1.0;
      timelines[timelineIdx].version = (currentVer + 0.1).toFixed(1);
      timelines[timelineIdx].updatedAt = new Date().toISOString();
    }

    saveDB(timelines, finalSegments);
    return { segments: generatedSegments, message: body.message };
  }
};
