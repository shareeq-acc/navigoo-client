# Navigoo | Navigate & Achieve Goals (Client)

Navigoo is an interactive, clean, and minimalist goal navigation and timeline planner. It enables users to design visual learning paths, track milestones, schedule deadlines, and manage tasks seamlessly in a beautiful interface.

## Features

- **Page-Based Routing (Next.js App Router)**: Fully shareable, REST-style URLs for all workspace areas:
  - `/` - Dynamic public landing page.
  - `/login` - Auth gateway page (supports email login/signup modes).
  - `/dashboard` - Personal user workspace displaying all active timelines.
  - `/dashboard/timeline/[id]` - Milestones tracking board and chronological roadmaps.
  - `/explore` - Discovery hub to browse and fork community-curated learning roadmaps.
  - `/settings` - Custom look-and-feel configuration (Emerald, Indigo, Slate themes).
  - `/user/account` - User profile, history avatar uploads, and account details.
- **AI-Powered Generation**: Leverage Gemini to instantly draft complete curricular paths based on title and description.
- **Standalone Production Compilation**: Fully configured Next.js `standalone` trace output for lightweight production containerization.
- **Session Auto-Restore & Auth Guards**: Global context wrapper intercepts `401 Unauthorized` responses to seamlessly refresh JWT tokens on demand.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & CSS Modules
- **Animation**: Framer Motion / Motion for React
- **Icons**: Lucide React
- **Context/State**: React Context API (TimelineProvider)

## Getting Started

### Prerequisites

- **Node.js**: `v18.x` or higher
- **Package Manager**: `npm`

### Environment Setup

Create a `.env.local` file in the client directory:

```env
# The URL of this Next.js app
APP_URL="http://localhost:3000"

# The endpoint pointing to the backend API server
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Set to true to disable Webpack HMR in local development if needed
DISABLE_HMR="false"
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the local development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

To compile a production build:
```bash
npm run build
```

The build is configured to compile in **standalone mode** (see `next.config.ts`), generating `.next/standalone` which gathers only the necessary files for server execution.

## Docker Setup

To build and run the production standalone container:

1. Build the Docker image:
```bash
docker build -t navigoo-client .
```

2. Run the container:
```bash
docker run -p 3000:3000 navigoo-client
```
