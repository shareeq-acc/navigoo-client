import { TimelineProps, SegmentProps, SuccessResponse, ErrorResponse } from '../types/timeline';
import { getDB, saveDB, delay } from './mockData';

export interface UserProps {
  id: string;
  username: string;
  name: string;
  email: string;
  aiUsage: number;
  avatar?: string;
}

const DEFAULT_USER: UserProps = {
  id: "usr-1",
  username: "totok_mike",
  name: "Totok Michael",
  email: "tmichael20@gmail.com",
  aiUsage: 0,
  avatar: "https://picsum.photos/seed/totok/100/100"
};

let isRefreshing = false;
let refreshSubscribers: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

function subscribeTokenRefresh(resolve: (token: string) => void, reject: (err: any) => void) {
  refreshSubscribers.push({ resolve, reject });
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((sub) => sub.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(err: any) {
  refreshSubscribers.forEach((sub) => sub.reject(err));
  refreshSubscribers = [];
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const headers = new Headers(options.headers || {});
  const token = typeof window !== 'undefined' ? window.localStorage.getItem("timeline_app_token") : null;
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(url, config);

  if (response.status === 401 && !url.includes('/api/auth/refresh') && !url.includes('/api/auth/login') && !url.includes('/api/auth/register')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        const refreshResult = await refreshRes.json();
        
        if (refreshRes.ok && refreshResult.success && refreshResult.data?.accessToken) {
          const newToken = refreshResult.data.accessToken;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem("timeline_app_token", newToken);
          }
          isRefreshing = false;
          onRefreshed(newToken);
          
          // Retry the initiating request immediately
          const retryHeaders = new Headers(config.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          return fetch(url, { ...config, headers: retryHeaders });
        } else {
          isRefreshing = false;
          const sessionErr = new Error("Session expired");
          onRefreshFailed(sessionErr);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem("timeline_app_token");
            window.localStorage.removeItem("timeline_app_user");
          }
          throw sessionErr;
        }
      } catch (err) {
        isRefreshing = false;
        onRefreshFailed(err);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem("timeline_app_token");
          window.localStorage.removeItem("timeline_app_user");
        }
        throw err;
      }
    } else {
      // Concurrent requests wait for active refresh
      return new Promise<Response>((resolve, reject) => {
        subscribeTokenRefresh(
          (newToken) => {
            const newHeaders = new Headers(config.headers || {});
            newHeaders.set('Authorization', `Bearer ${newToken}`);
            resolve(fetch(url, { ...config, headers: newHeaders }));
          },
          (err) => {
            reject(err);
          }
        );
      });
    }
  }

  return response;
}

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

  async getMe(): Promise<UserProps | null> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = typeof window !== 'undefined' ? window.localStorage.getItem("timeline_app_token") : null;
    if (!token) return null;

    try {
      const response = await fetchWithAuth(`${API_URL}/api/auth/me`);
      const result = await response.json();
      if (response.ok && result.success) {
        const u = result.data;
        const mappedUser: UserProps = {
          id: u.id,
          username: u.username,
          name: `${u.fname} ${u.lname}`,
          email: u.email,
          aiUsage: u.aiUsage || 0,
          avatar: u.avatar || `https://picsum.photos/seed/${u.username}/100/100`
        };
        if (typeof window !== 'undefined') {
          window.localStorage.setItem("timeline_app_user", JSON.stringify(mappedUser));
        }
        return mappedUser;
      }
    } catch (err) {
      console.error("Failed to fetch user context from /me", err);
    }
    
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem("timeline_app_token");
      window.localStorage.removeItem("timeline_app_user");
    }
    return null;
  },

  async login(email: string, password: string): Promise<SuccessResponse<UserProps>> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetchWithAuth(`${API_URL}/api/auth/login`, {
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
      aiUsage: user.aiUsage || 0,
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetchWithAuth(`${API_URL}/api/auth/register`, {
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

  async updateProfile(name: string): Promise<SuccessResponse<UserProps>> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error("No active session found");
    }

    const response = await fetchWithAuth(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to update profile");
    }

    const u = result.data;
    const updatedUser: UserProps = {
      id: u.id,
      username: u.username,
      name: `${u.fname} ${u.lname}`,
      email: currentUser.email,
      aiUsage: u.aiUsage || 0,
      avatar: u.avatar || `https://picsum.photos/seed/${u.username}/100/100`
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

  async uploadProfilePicture(file: File): Promise<SuccessResponse<UserProps>> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error("No active session found");
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetchWithAuth(`${API_URL}/api/users/profile-picture`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to upload profile picture");
    }

    const u = result.data;
    const updatedUser: UserProps = {
      id: u.id,
      username: u.username,
      name: `${u.fname} ${u.lname}`,
      email: currentUser.email,
      aiUsage: u.aiUsage || 0,
      avatar: u.avatar || `https://picsum.photos/seed/${u.username}/100/100`
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem("timeline_app_user", JSON.stringify(updatedUser));
    }

    return {
      success: true,
      message: "Profile picture uploaded successfully",
      data: updatedUser
    };
  },

  async getProfilePictures(): Promise<any[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetchWithAuth(`${API_URL}/api/users/profile-pictures`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch profile pictures history");
    }
    return result.data;
  },

  async selectProfilePicture(pictureId: string): Promise<SuccessResponse<UserProps>> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error("No active session found");
    }

    const response = await fetchWithAuth(`${API_URL}/api/users/profile-pictures/${pictureId}/select`, {
      method: 'PUT',
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to select profile picture");
    }

    const u = result.data;
    const updatedUser: UserProps = {
      id: u.id,
      username: u.username,
      name: `${u.fname} ${u.lname}`,
      email: currentUser.email,
      aiUsage: u.aiUsage || 0,
      avatar: u.avatar || `https://picsum.photos/seed/${u.username}/100/100`
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem("timeline_app_user", JSON.stringify(updatedUser));
    }

    return {
      success: true,
      message: "Profile picture selected successfully",
      data: updatedUser
    };
  },

  async logout(): Promise<void> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      await fetchWithAuth(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      console.warn("Logout request failed", e);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem("timeline_app_user");
      window.localStorage.removeItem("timeline_app_token");
    }
  }
};

// Timeline Operations Service Client
export const timelineService = {
  async getTimelines(): Promise<TimelineProps[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const user = await authService.getCurrentUser();
    if (!user) return [];

    try {
      const response = await fetchWithAuth(`${API_URL}/api/timelines/user/${user.id}`);
      const result = await response.json();
      if (response.ok && result.success) {
        return result.data.timelines.map((t: any) => ({
          id: t.id,
          typeId: t.type.type === 'ROADMAP' ? 'with_time_unit' : 'without_time_unit',
          timeUnitId: t.timeUnit ? (t.timeUnit.code.toLowerCase() === 'week' ? 'weekly' : t.timeUnit.code.toLowerCase() as any) : undefined,
          duration: t.duration || 5,
          title: t.title,
          description: t.description,
          author: {
            id: t.author.id,
            username: t.author.username
          },
          isGenerated: t.isGenerated,
          isPublic: t.isPublic,
          enableScheduling: t.enableScheduling,
          version: t.version,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        }));
      }
    } catch (err) {
      console.error("Failed to fetch timelines from backend", err);
    }

    const { timelines } = getDB();
    return timelines.filter(t => t.author.id === user.id);
  },

  async getTimelineById(id: string): Promise<TimelineProps | null> {
    await delay(150);
    const { timelines } = getDB();
    const t = timelines.find(item => item.id === id);
    return t || null;
  },

  async getExploreTimelines(searchQuery = "", typeFilter = "", timeUnitFilter = ""): Promise<TimelineProps[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const response = await fetchWithAuth(`${API_URL}/api/timelines/explore`);
      const result = await response.json();
      if (response.ok && result.success) {
        const allTimelines: TimelineProps[] = [];
        Object.keys(result.data).forEach(key => {
          const typeGroup = result.data[key];
          if (typeGroup && Array.isArray(typeGroup.timelines)) {
            typeGroup.timelines.forEach((t: any) => {
              allTimelines.push({
                id: t.id,
                typeId: t.type.type === 'ROADMAP' ? 'with_time_unit' : 'without_time_unit',
                timeUnitId: t.timeUnit ? (t.timeUnit.code.toLowerCase() === 'week' ? 'weekly' : t.timeUnit.code.toLowerCase() as any) : undefined,
                duration: t.duration || 5,
                title: t.title,
                description: t.description,
                author: {
                  id: t.author.id,
                  username: t.author.username
                },
                isGenerated: t.isGenerated,
                isPublic: t.isPublic,
                enableScheduling: t.enableScheduling,
                version: t.version,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt
              });
            });
          }
        });

        return allTimelines.filter(t => {
          const matchesSearch = searchQuery === "" ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesType = typeFilter === "" || t.typeId === typeFilter;
          const matchesTimeUnit = timeUnitFilter === "" || t.timeUnitId === timeUnitFilter;

          return matchesSearch && matchesType && matchesTimeUnit;
        });
      }
    } catch (err) {
      console.error("Failed to fetch explore timelines from backend", err);
    }

    const { timelines } = getDB();
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const bodyData = {
      title: data.title,
      description: data.description,
      typeId: data.typeId,
      timeUnitId: data.typeId === 'with_time_unit' ? data.timeUnitId : undefined,
      duration: data.typeId === 'with_time_unit' ? Number(data.duration) : undefined,
      isPublic: data.isPublic,
      enableScheduling: data.typeId === 'with_time_unit' ? data.enableScheduling : false
    };

    const response = await fetchWithAuth(`${API_URL}/api/timelines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to create timeline");
    }

    const t = result.data;
    const mappedTimeline: TimelineProps = {
      id: t.id,
      typeId: t.type.type === 'ROADMAP' ? 'with_time_unit' : 'without_time_unit',
      timeUnitId: t.timeUnit ? (t.timeUnit.code.toLowerCase() === 'week' ? 'weekly' : t.timeUnit.code.toLowerCase() as any) : undefined,
      duration: t.duration || 5,
      title: t.title,
      description: t.description,
      author: {
        id: t.author.id,
        username: t.author.username
      },
      isGenerated: t.isGenerated,
      isPublic: t.isPublic,
      enableScheduling: t.enableScheduling,
      version: t.version,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };

    try {
      const { timelines, segments } = getDB();
      timelines.unshift(mappedTimeline);
      saveDB(timelines, segments);
    } catch (e) {}

    return mappedTimeline;
  },

  async deleteTimeline(id: string): Promise<void> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetchWithAuth(`${API_URL}/api/timelines/${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to delete timeline");
    }

    try {
      const { timelines, segments } = getDB();
      const filteredTimelines = timelines.filter(t => t.id !== id);
      const filteredSegments = segments.filter(s => s.timelineId !== id);
      saveDB(filteredTimelines, filteredSegments);
    } catch (e) {}
  },

  async updateTimeline(id: string, data: { title?: string; description?: string; isPublic?: boolean }): Promise<TimelineProps> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetchWithAuth(`${API_URL}/api/timelines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to update timeline");
    }

    const t = result.data;
    const mappedTimeline: TimelineProps = {
      id: t.id,
      typeId: t.type.type === 'ROADMAP' ? 'with_time_unit' : 'without_time_unit',
      timeUnitId: t.timeUnit ? (t.timeUnit.code.toLowerCase() === 'week' ? 'weekly' : t.timeUnit.code.toLowerCase() as any) : undefined,
      duration: t.duration || 5,
      title: t.title,
      description: t.description,
      author: {
        id: t.author.id,
        username: t.author.username
      },
      isGenerated: t.isGenerated,
      isPublic: t.isPublic,
      enableScheduling: t.enableScheduling,
      version: t.version,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };

    try {
      const { timelines, segments } = getDB();
      const existingIdx = timelines.findIndex(x => x.id === id);
      if (existingIdx > -1) {
        timelines[existingIdx] = mappedTimeline;
      } else {
        timelines.unshift(mappedTimeline);
      }
      saveDB(timelines, segments);
    } catch (e) {}

    return mappedTimeline;
  },

  async forkTimeline(timelineId: string): Promise<TimelineProps> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetchWithAuth(`${API_URL}/api/timelines/fork/${timelineId}`, {
      method: 'POST'
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fork timeline");
    }

    const t = result.data;
    const mappedTimeline: TimelineProps = {
      id: t.id,
      typeId: t.type.type === 'ROADMAP' ? 'with_time_unit' : 'without_time_unit',
      timeUnitId: t.timeUnit ? (t.timeUnit.code.toLowerCase() === 'week' ? 'weekly' : t.timeUnit.code.toLowerCase() as any) : undefined,
      duration: t.duration || 5,
      title: t.title,
      description: t.description,
      author: {
        id: t.author.id,
        username: t.author.username
      },
      isGenerated: t.isGenerated,
      isPublic: t.isPublic,
      enableScheduling: t.enableScheduling,
      version: t.version,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };

    try {
      const { timelines, segments } = getDB();
      timelines.unshift(mappedTimeline);
      saveDB(timelines, segments);
    } catch (e) {}

    return mappedTimeline;
  },

  async generateTimelineWithAI(data: {
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
  }): Promise<TimelineProps> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const bodyData = {
      title: data.title,
      description: data.description,
      typeId: data.typeId,
      timeUnitId: data.typeId === 'with_time_unit' ? data.timeUnitId : undefined,
      duration: data.typeId === 'with_time_unit' ? Number(data.duration) : undefined,
      aiDomain: data.aiDomain,
      aiLevel: data.aiLevel,
      aiAudience: data.aiAudience,
      isPublic: data.isPublic,
      enableScheduling: data.typeId === 'with_time_unit' ? data.enableScheduling : false
    };

    const response = await fetchWithAuth(`${API_URL}/api/timelines/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to generate timeline with AI");
    }

    const t = result.data;
    const mappedTimeline: TimelineProps = {
      id: t.id,
      typeId: t.type.type === 'ROADMAP' ? 'with_time_unit' : 'without_time_unit',
      timeUnitId: t.timeUnit ? (t.timeUnit.code.toLowerCase() === 'week' ? 'weekly' : t.timeUnit.code.toLowerCase() as any) : undefined,
      duration: t.duration || 5,
      title: t.title,
      description: t.description,
      author: {
        id: t.author.id,
        username: t.author.username
      },
      isGenerated: t.isGenerated,
      isPublic: t.isPublic,
      enableScheduling: t.enableScheduling,
      version: t.version,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };

    try {
      const { timelines, segments } = getDB();
      timelines.unshift(mappedTimeline);
      saveDB(timelines, segments);
    } catch (e) {}

    return mappedTimeline;
  }
};

// Segment Node CRUD & AI Logic Operations
export const segmentService = {
  async getSegmentsByTimelineId(timelineId: string): Promise<SegmentProps[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const response = await fetchWithAuth(`${API_URL}/api/segments/timeline/${timelineId}`);
      const result = await response.json();
      if (response.ok && result.success) {
        return result.data.segments.map((s: any) => ({
          id: s.id,
          timelineId: s.timelineId,
          unitNumber: s.unitNumber,
          title: s.title,
          milestone: s.milestone,
          isForkModified: s.isForkModified || false,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          goals: s.goals || [],
          references: s.references || [],
          schedule: s.scheduling ? {
            id: `sch-${s.id}`,
            segmentId: s.id,
            scheduleDate: s.scheduling.scheduleDate,
            completedAt: s.scheduling.completedAt
          } : null
        })).sort((a: any, b: any) => a.unitNumber - b.unitNumber);
      }
    } catch (err) {
      console.error("Failed to fetch segments from backend", err);
    }

    const { segments } = getDB();
    const timelineSegments = segments.filter(s => s.timelineId === timelineId);
    return timelineSegments.sort((a, b) => a.unitNumber - b.unitNumber);
  },

  async saveSegment(segmentData: Partial<SegmentProps> & { timelineId: string; unitNumber: number }): Promise<SegmentProps> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const isEdit = !!segmentData.id;

    if (isEdit) {
      const bodyData = {
        timelineId: segmentData.timelineId,
        unitNumber: segmentData.unitNumber,
        title: segmentData.title,
        milestone: segmentData.milestone,
        goals: segmentData.goals ? segmentData.goals.map(g => ({ id: g.id, goal: g.goal })) : [],
        references: segmentData.references ? segmentData.references.map(r => ({ id: r.id, reference: r.reference, label: r.label })) : [],
        scheduleDate: segmentData.schedule?.scheduleDate || undefined
      };

      const response = await fetchWithAuth(`${API_URL}/api/segments/${segmentData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update segment");
      }

      const s = result.data;
      const mappedSegment: SegmentProps = {
        id: s.id,
        timelineId: s.timelineId,
        unitNumber: s.unitNumber,
        title: s.title,
        milestone: s.milestone,
        isForkModified: s.isForkModified || false,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        goals: s.goals || [],
        references: s.references || [],
        schedule: s.scheduling ? {
          id: `sch-${s.id}`,
          segmentId: s.id,
          scheduleDate: s.scheduling.scheduleDate,
          completedAt: s.scheduling.completedAt
        } : null
      };

      try {
        const { timelines, segments } = getDB();
        const existingIdx = segments.findIndex(x => x.id === mappedSegment.id);
        if (existingIdx > -1) {
          segments[existingIdx] = mappedSegment;
        } else {
          segments.push(mappedSegment);
        }
        saveDB(timelines, segments);
      } catch (e) {}

      return mappedSegment;

    } else {
      const bodyData = {
        timelineId: segmentData.timelineId,
        unitNumber: segmentData.unitNumber,
        title: segmentData.title,
        milestone: segmentData.milestone,
        goals: segmentData.goals ? segmentData.goals.map(g => g.goal) : [],
        references: segmentData.references ? segmentData.references.map(r => r.reference) : [],
        scheduleDate: segmentData.schedule?.scheduleDate || undefined
      };

      const response = await fetchWithAuth(`${API_URL}/api/segments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create segment");
      }

      const s = result.data;
      const mappedSegment: SegmentProps = {
        id: s.id,
        timelineId: s.timelineId,
        unitNumber: s.unitNumber,
        title: s.title,
        milestone: s.milestone,
        isForkModified: s.isForkModified || false,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        goals: s.goals || [],
        references: s.references || [],
        schedule: s.scheduling ? {
          id: `sch-${s.id}`,
          segmentId: s.id,
          scheduleDate: s.scheduling.scheduleDate,
          completedAt: s.scheduling.completedAt
        } : null
      };

      try {
        const { timelines, segments } = getDB();
        const existingIdx = segments.findIndex(x => x.timelineId === mappedSegment.timelineId && x.unitNumber === mappedSegment.unitNumber);
        if (existingIdx > -1) {
          segments[existingIdx] = mappedSegment;
        } else {
          segments.push(mappedSegment);
        }
        saveDB(timelines, segments);
      } catch (e) {}

      return mappedSegment;
    }
  },

  async deleteSegment(timelineId: string, unitNumber: number): Promise<void> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = typeof window !== 'undefined' ? window.localStorage.getItem("timeline_app_token") : null;

    if (token) {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/segments/timeline/${timelineId}`);
        const result = await response.json();
        if (response.ok && result.success) {
          const target = result.data.segments.find((s: any) => s.unitNumber === unitNumber);
          if (target) {
            const delRes = await fetchWithAuth(`${API_URL}/api/segments/${target.id}`, {
              method: 'DELETE'
            });
            const delResult = await delRes.json();
            if (!delRes.ok || !delResult.success) {
              throw new Error(delResult.message || "Failed to delete segment from backend");
            }
          }
        }
      } catch (err) {
        console.error("Failed to delete segment from backend:", err);
        throw err;
      }
    }

    const { timelines, segments } = getDB();
    const index = segments.findIndex(s => s.timelineId === timelineId && s.unitNumber === unitNumber);
    if (index > -1) {
      segments.splice(index, 1);
      
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = typeof window !== 'undefined' ? window.localStorage.getItem("timeline_app_token") : null;

    if (token) {
      const response = await fetchWithAuth(`${API_URL}/api/segments/${segmentId}/complete`, {
        method: 'PUT'
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to toggle segment completion");
      }

      const s = result.data;
      const mappedSegment: SegmentProps = {
        id: s.id,
        timelineId: s.timelineId,
        unitNumber: s.unitNumber,
        title: s.title,
        milestone: s.milestone,
        isForkModified: s.isForkModified || false,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        goals: s.goals || [],
        references: s.references || [],
        schedule: s.scheduling ? {
          id: `sch-${s.id}`,
          segmentId: s.id,
          scheduleDate: s.scheduling.scheduleDate,
          completedAt: s.scheduling.completedAt
        } : null
      };

      try {
        const { timelines, segments } = getDB();
        const existingIdx = segments.findIndex(x => x.id === mappedSegment.id);
        if (existingIdx > -1) {
          segments[existingIdx] = mappedSegment;
        } else {
          segments.push(mappedSegment);
        }
        
        const timelineIdx = timelines.findIndex(t => t.id === mappedSegment.timelineId);
        if (timelineIdx > -1) {
          const currentVer = parseFloat(timelines[timelineIdx].version) || 1.0;
          timelines[timelineIdx].version = (currentVer + 0.1).toFixed(1);
          timelines[timelineIdx].updatedAt = new Date().toISOString();
        }
        
        saveDB(timelines, segments);
      } catch (e) {}

      return mappedSegment;
    } else {
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

      const timelineIdx = timelines.findIndex(t => t.id === currentSeg.timelineId);
      if (timelineIdx > -1) {
        const currentVer = parseFloat(timelines[timelineIdx].version) || 1.0;
        timelines[timelineIdx].version = (currentVer + 0.1).toFixed(1);
        timelines[timelineIdx].updatedAt = new Date().toISOString();
      }

      saveDB(timelines, segments);
      return updatedSeg;
    }
  },

  async scheduleSegment(segmentId: string, scheduleDate: string | null): Promise<SegmentProps> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = typeof window !== 'undefined' ? window.localStorage.getItem("timeline_app_token") : null;

    if (token) {
      const response = await fetchWithAuth(`${API_URL}/api/segments/${segmentId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scheduleDate })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to schedule segment");
      }

      const s = result.data;
      const mappedSegment: SegmentProps = {
        id: s.id,
        timelineId: s.timelineId,
        unitNumber: s.unitNumber,
        title: s.title,
        milestone: s.milestone,
        isForkModified: s.isForkModified || false,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        goals: s.goals || [],
        references: s.references || [],
        schedule: s.scheduling ? {
          id: `sch-${s.id}`,
          segmentId: s.id,
          scheduleDate: s.scheduling.scheduleDate,
          completedAt: s.scheduling.completedAt
        } : null
      };

      try {
        const { timelines, segments } = getDB();
        const existingIdx = segments.findIndex(x => x.id === mappedSegment.id);
        if (existingIdx > -1) {
          segments[existingIdx] = mappedSegment;
        } else {
          segments.push(mappedSegment);
        }
        
        const timelineIdx = timelines.findIndex(t => t.id === mappedSegment.timelineId);
        if (timelineIdx > -1) {
          const currentVer = parseFloat(timelines[timelineIdx].version) || 1.0;
          timelines[timelineIdx].version = (currentVer + 0.1).toFixed(1);
          timelines[timelineIdx].updatedAt = new Date().toISOString();
        }
        
        saveDB(timelines, segments);
      } catch (e) {}

      return mappedSegment;
    } else {
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

      const timelineIdx = timelines.findIndex(t => t.id === currentSeg.timelineId);
      if (timelineIdx > -1) {
        const currentVer = parseFloat(timelines[timelineIdx].version) || 1.0;
        timelines[timelineIdx].version = (currentVer + 0.1).toFixed(1);
        timelines[timelineIdx].updatedAt = new Date().toISOString();
      }

      saveDB(timelines, segments);
      return updatedSeg;
    }
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
