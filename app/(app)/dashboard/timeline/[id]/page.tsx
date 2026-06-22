'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTimelineStore } from '../../../../../hooks/TimelineContext';
import TimelineDetailTab from '../../../../../components/TimelineDetailTab';

export default function TimelineDetailRoute() {
  const { id } = useParams() as { id: string };
  const { setActiveTimelineId } = useTimelineStore();

  useEffect(() => {
    if (id) {
      setActiveTimelineId(id);
    }
    return () => {
      setActiveTimelineId(null);
    };
  }, [id, setActiveTimelineId]);

  return <TimelineDetailTab />;
}
