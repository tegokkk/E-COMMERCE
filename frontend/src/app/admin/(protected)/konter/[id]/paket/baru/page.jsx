'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CounterPackagesScreen } from '@/features/admin/packages/CounterPackagesScreen';

export default function NewCounterPackagePage() {
  const { id } = useParams();
  return <CounterPackagesScreen counterId={id} isNew />;
}
