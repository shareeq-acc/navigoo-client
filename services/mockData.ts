import { TimelineProps, SegmentProps, SuccessResponse, ErrorResponse } from '../types/timeline';

// Simple delay helper to simulate network latency
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_TIMELINES: TimelineProps[] = [
  {
    id: "tl-1",
    typeId: "with_time_unit",
    timeUnitId: "weekly",
    duration: 6,
    title: "Q3 Frontend Revamp",
    description: "Redesigning legacy components, styling beautiful dashboards, and migrating smoothly to Next.js App Router.",
    author: { id: "usr-1", username: "developer" },
    isGenerated: false,
    isPublic: true,
    enableScheduling: true,
    version: "1.0",
    createdAt: "2026-06-16T12:00:00Z",
    updatedAt: "2026-06-16T12:00:00Z"
  },
  {
    id: "tl-2",
    typeId: "with_time_unit",
    timeUnitId: "monthly",
    duration: 4,
    title: "Machine Learning Curriculum",
    description: "A comprehensive self-study curriculum for mastering modern mathematical modeling, neural networks, and generative models.",
    author: { id: "usr-9", username: "instructor_ai" },
    isGenerated: true,
    isPublic: true,
    enableScheduling: false,
    version: "1.0",
    createdAt: "2026-06-15T08:00:00Z",
    updatedAt: "2026-06-15T08:00:00Z"
  },
  {
    id: "tl-3",
    typeId: "without_time_unit",
    duration: 5,
    title: "Donezo Website Redesign",
    description: "Creating a beautiful, modern off-white and dark-emerald web presence with interactive widgets and clean visual rhythms.",
    author: { id: "usr-1", username: "developer" },
    isGenerated: false,
    isPublic: false,
    enableScheduling: true,
    version: "1.0",
    createdAt: "2026-06-14T10:00:00Z",
    updatedAt: "2026-06-17T06:30:00Z"
  }
];

const INITIAL_SEGMENTS: SegmentProps[] = [
  // tl-1: Q3 Frontend Revamp
  {
    id: "seg-101",
    timelineId: "tl-1",
    unitNumber: 1,
    title: "Tailwind Integration & Style Guide",
    milestone: "Setup",
    isForkModified: false,
    createdAt: "2026-06-16T12:05:00Z",
    updatedAt: "2026-06-16T12:05:00Z",
    goals: [
      { id: "g-1", segmentId: "seg-101", goal: "Install Tailwind CSS and configure post-css variables" },
      { id: "g-2", segmentId: "seg-101", goal: "Draft responsive typography scales and spacing units" },
      { id: "g-3", segmentId: "seg-101", goal: "Enforce uniform high-contrast color pairings" }
    ],
    references: [
      { id: "r-1", segmentId: "seg-101", reference: "https://tailwindcss.com" },
      { id: "r-2", segmentId: "seg-101", reference: "https://lucide.dev/icons" }
    ],
    schedule: {
      id: "sch-101",
      segmentId: "seg-101",
      scheduleDate: "2026-06-20",
      completedAt: "2026-06-17T05:00:00Z"
    }
  },
  {
    id: "seg-102",
    timelineId: "tl-1",
    unitNumber: 2,
    title: "Global Contexts & State Hookups",
    milestone: "Architecture",
    isForkModified: false,
    createdAt: "2026-06-16T12:10:00Z",
    updatedAt: "2026-06-16T12:10:00Z",
    goals: [
      { id: "g-4", segmentId: "seg-102", goal: "Build clean, reusable layout wrappers" },
      { id: "g-5", segmentId: "seg-102", goal: "Implement authenticated route guard mockups" },
      { id: "g-6", segmentId: "seg-102", goal: "Manage local timeline database syncing flawlessly" }
    ],
    references: [
      { id: "r-3", segmentId: "seg-102", reference: "https://react.dev/reference/react" }
    ],
    schedule: {
      id: "sch-102",
      segmentId: "seg-102",
      scheduleDate: "2026-06-27",
      completedAt: "2026-06-17T06:15:00Z"
    }
  },
  {
    id: "seg-103",
    timelineId: "tl-1",
    unitNumber: 3,
    title: "Dashboard Workspace Workspace Screen",
    milestone: "Views",
    isForkModified: false,
    createdAt: "2026-06-16T12:15:00Z",
    updatedAt: "2026-06-16T12:15:00Z",
    goals: [
      { id: "g-7", segmentId: "seg-103", goal: "Render Donezo-inspired key metrics and summary widgets" },
      { id: "g-8", segmentId: "seg-103", goal: "Create fluid grids displaying personalized user boards" },
      { id: "g-9", segmentId: "seg-103", goal: "Enable quick-add interactive dialog controllers" }
    ],
    references: [],
    schedule: {
      id: "sch-103",
      segmentId: "seg-103",
      scheduleDate: "2026-07-04",
      completedAt: null
    }
  },
  {
    id: "seg-104",
    timelineId: "tl-1",
    unitNumber: 4,
    title: "Timeline Detailed Tracks & Graph Flowcharts",
    milestone: "Core UI",
    isForkModified: false,
    createdAt: "2026-06-16T12:20:00Z",
    updatedAt: "2026-06-16T12:20:00Z",
    goals: [
      { id: "g-10", segmentId: "seg-104", goal: "Render horizontal scheduling blocks representing progress segments" },
      { id: "g-11", segmentId: "seg-104", goal: "Structure connected nodes visually inside interactive SVG layouts" },
      { id: "g-12", segmentId: "seg-104", goal: "Configure double-clicks to activate detail summary drawbars" }
    ],
    references: [
      { id: "r-4", segmentId: "seg-104", reference: "https://roadmap.sh" }
    ],
    schedule: {
      id: "sch-104",
      segmentId: "seg-104",
      scheduleDate: "2026-07-11",
      completedAt: null
    }
  },

  // tl-2: ML Curriculum
  {
    id: "seg-201",
    timelineId: "tl-2",
    unitNumber: 1,
    title: "Linear Algebra & Calculus Essentials",
    milestone: "Math Foundation",
    isForkModified: false,
    createdAt: "2026-06-15T08:05:00Z",
    updatedAt: "2026-06-15T08:05:00Z",
    goals: [
      { id: "g-201", segmentId: "seg-201", goal: "Understand vector spaces, eigenvalues, and SVD matrices" },
      { id: "g-202", segmentId: "seg-201", goal: "Compute partial derivatives and multi-dimensional gradients" }
    ],
    references: [
      { id: "r-201", segmentId: "seg-201", reference: "https://numpy.org" }
    ],
    schedule: {
      id: "sch-201",
      segmentId: "seg-201",
      scheduleDate: "2026-07-01",
      completedAt: "2026-06-16T10:00:00Z"
    }
  },
  {
    id: "seg-202",
    timelineId: "tl-2",
    unitNumber: 2,
    title: "Classical Supervised Algorithms",
    milestone: "Core ML",
    isForkModified: false,
    createdAt: "2026-06-15T08:10:00Z",
    updatedAt: "2026-06-15T08:10:00Z",
    goals: [
      { id: "g-203", segmentId: "seg-202", goal: "Implement regularized Linear & Logistic Regression models" },
      { id: "g-204", segmentId: "seg-202", goal: "Deconstruct tree-based ensembles (Random Forest, XGBoost)" }
    ],
    references: [
      { id: "r-202", segmentId: "seg-202", reference: "https://scikit-learn.org" }
    ],
    schedule: {
      id: "sch-202",
      segmentId: "seg-202",
      scheduleDate: "2026-08-01",
      completedAt: null
    }
  },

  // tl-3: Donezo Website Redesign
  {
    id: "seg-301",
    timelineId: "tl-3",
    unitNumber: 1,
    title: "User Persona & Wireframes",
    milestone: "Design",
    isForkModified: false,
    createdAt: "2026-06-14T10:05:00Z",
    updatedAt: "2026-06-14T10:05:00Z",
    goals: [
      { id: "g-301", segmentId: "seg-301", goal: "Identify product audience constraints and primary dashboard pathways" },
      { id: "g-302", segmentId: "seg-301", goal: "Brainstorm minimalist grid combinations" }
    ],
    references: [],
    schedule: {
      id: "sch-301",
      segmentId: "seg-301",
      scheduleDate: "2026-06-15",
      completedAt: "2026-06-15T18:00:00Z"
    }
  },
  {
    id: "seg-302",
    timelineId: "tl-3",
    unitNumber: 2,
    title: "Figma Hi-Fi Layout Mockups",
    milestone: "Design",
    isForkModified: false,
    createdAt: "2026-06-14T10:10:00Z",
    updatedAt: "2026-06-14T10:10:00Z",
    goals: [
      { id: "g-303", segmentId: "seg-302", goal: "Perfect forest green and cool slate color scales" },
      { id: "g-304", segmentId: "seg-302", goal: "Construct detailed interactive states (hover overlays, dialog transitions)" }
    ],
    references: [],
    schedule: {
      id: "sch-302",
      segmentId: "seg-302",
      scheduleDate: "2026-06-16",
      completedAt: "2026-06-16T19:30:00Z"
    }
  },
  {
    id: "seg-303",
    timelineId: "tl-3",
    unitNumber: 3,
    title: "Responsive UI Scaffolding & Cards",
    milestone: "Implementation",
    isForkModified: false,
    createdAt: "2026-06-14T10:15:00Z",
    updatedAt: "2026-06-14T10:15:00Z",
    goals: [
      { id: "g-305", segmentId: "seg-303", goal: "Code responsive grid assemblies matching the Donezo desktop display spec" },
      { id: "g-306", segmentId: "seg-303", goal: "Deploy beautiful SVG-vector and crisp Lucide icons" }
    ],
    references: [],
    schedule: {
      id: "sch-303",
      segmentId: "seg-303",
      scheduleDate: "2026-06-17",
      completedAt: null
    }
  }
];

export const loadState = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn("Storage reading error:", e);
    return fallback;
  }
};

export const saveState = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Storage writing error:", e);
  }
};

export const getDB = () => {
  let timelines = loadState<TimelineProps[]>("timeline_app_timelines", INITIAL_TIMELINES);
  const segments = loadState<SegmentProps[]>("timeline_app_segments", INITIAL_SEGMENTS);
  
  let migrated = false;
  timelines = timelines.map(t => {
    let tCopy = { ...t };
    if (tCopy.typeId as any === 'roadmap' || tCopy.typeId as any === 'project') {
      tCopy.typeId = tCopy.typeId as any === 'roadmap' ? 'with_time_unit' : 'without_time_unit';
      migrated = true;
    }
    if (!tCopy.version || tCopy.version.includes("-") || tCopy.version.includes("fork") || tCopy.version.split('.').length > 2) {
      tCopy.version = "1.0";
      migrated = true;
    }
    return tCopy;
  });

  if (migrated && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem("timeline_app_timelines", JSON.stringify(timelines));
    } catch(e) {}
  }

  return { timelines, segments };
};

export const saveDB = (timelines: TimelineProps[], segments: SegmentProps[]) => {
  saveState("timeline_app_timelines", timelines);
  saveState("timeline_app_segments", segments);
};
