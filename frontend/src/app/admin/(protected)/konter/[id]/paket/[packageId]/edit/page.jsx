'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CounterPackagesScreen } from '@/features/admin/packages/CounterPackagesScreen';

export default function EditCounterPackagePage() {
  const { id, packageId } = useParams();
  return <CounterPackagesScreen counterId={id} packageId={packageId} />;
}
