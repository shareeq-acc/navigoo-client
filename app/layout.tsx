import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { TimelineProvider } from '../hooks/TimelineContext';

export const metadata: Metadata = {
  title: 'Navigoo | Navigate & Achieve Goals',
  description: 'An interactive, clean, and minimalist goal navigation and timeline planner.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <TimelineProvider>
          {children}
        </TimelineProvider>
      </body>
    </html>
  );
}
