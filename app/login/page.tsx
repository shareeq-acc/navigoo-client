'use client';

import { Suspense } from 'react';
import LoginPage from '../../components/LoginPage';

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center" />}>
      <LoginPage />
    </Suspense>
  );
}
