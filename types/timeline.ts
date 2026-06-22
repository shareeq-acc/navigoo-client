export interface TimelineProps {
  id: string;
  typeId: 'with_time_unit' | 'without_time_unit';
  timeUnitId?: 'daily' | 'weekly' | 'monthly';
  duration: number; // e.g., 12 (meaning 12 weeks/days/months/phases)
  title: string;
  description: string;
  author: {
    id: string;
    username: string;
  };
  isGenerated: boolean;
  isPublic: boolean;
  enableScheduling: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentGoalProps {
  id: string;
  segmentId: string;
  goal: string;
}

export interface SegmentReferenceProps {
  id: string;
  segmentId: string;
  reference: string; // URL
  label?: string; // Display placeholder / name
}

export interface SegmentSchedulingProps {
  id: string;
  segmentId: string;
  scheduleDate?: string | null;
  completedAt?: string | null;
}

export interface SegmentProps {
  id: string;
  timelineId: string;
  unitNumber: number; // The index of the time unit (1-indexed)
  title: string;
  milestone?: string;
  isForkModified: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Embedded fields
  goals: SegmentGoalProps[];
  references: SegmentReferenceProps[];
  schedule?: SegmentSchedulingProps | null;
}

export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface ValidationErrorDetails {
  [field: string]: string;
}

export interface ErrorObject {
  code: string;
  message: string;
  details?: ValidationErrorDetails;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: ErrorObject;
}
