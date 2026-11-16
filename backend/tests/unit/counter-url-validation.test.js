import { describe, expect, it } from 'vitest';
import { counterCreateSchema, isAllowedMapUrl, isAllowedPhotoUrl } from '@konter/shared';

const counter = {
  name: 'Konter Contoh',
  regionId: 'b0000000-0000-0000-0000-000000000001',
  address: 'Jalan Contoh No. 1',
  whatsapp: '081234567890',
  publicationStatus: 'published',
};

describe('counter URL validation', () => {
  it('accepts supported local photos and map links', () => {
    expect(isAllowedPhotoUrl('/images/counters/toko.jpg')).toBe(true);
    expect(isAllowedMapUrl('https://maps.google.com/?q=-6.9,107.6')).toBe(true);
    expect(counterCreateSchema.safeParse({ ...counter, photoUrl: '/images/counters/toko.jpg' }).success).toBe(true);
  });

  it('rejects unsupported image hosts and map destinations', () => {
    expect(isAllowedPhotoUrl('https://example.com/toko.jpg')).toBe(false);
    expect(isAllowedMapUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedMapUrl('https://example.com/fake-map')).toBe(false);
    expect(counterCreateSchema.safeParse({ ...counter, mapUrl: 'javascript:alert(1)' }).success).toBe(false);
  });
});
