import { describe, expect, it } from 'vitest';
import { counterUpdateSchema, packageUpdateSchema, providerUpdateSchema, platformSettingsUpdateSchema } from '@konter/shared';

describe('partial update validation', () => {
  it('preserves omitted counter fields during publication changes', () => {
    expect(counterUpdateSchema.parse({ publicationStatus: 'published' })).toEqual({
      publicationStatus: 'published',
    });
  });

  it('preserves omitted package fields during price changes', () => {
    expect(packageUpdateSchema.parse({ price: 35000 })).toEqual({ price: 35000 });
  });

  it('preserves provider status and platform copy on unrelated edits', () => {
    expect(providerUpdateSchema.parse({ name: 'Operator Baru' })).toEqual({ name: 'Operator Baru' });
    expect(platformSettingsUpdateSchema.parse({ platformName: 'Nama Baru' })).toEqual({ platformName: 'Nama Baru' });
  });
});
