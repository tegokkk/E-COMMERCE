import { describe, it, expect } from 'vitest';
import {
  normalizeWhatsAppNumber,
  createWhatsAppUrl,
  generatePackageInquiryMessage,
  generateGeneralCounterMessage,
  generatePartnerSignupMessage,
} from '../../src/lib/whatsapp.js';

describe('WhatsApp Utility Tests', () => {
  it('normalizes 08xx to 628xx', () => {
    expect(normalizeWhatsAppNumber('08123456789')).toBe('628123456789');
    expect(normalizeWhatsAppNumber('0812-3456-7890')).toBe('6281234567890');
    expect(normalizeWhatsAppNumber('+62 812 3456 789')).toBe('628123456789');
    expect(normalizeWhatsAppNumber('628123456789')).toBe('628123456789');
  });

  it('creates valid wa.me url with encoded message', () => {
    const url = createWhatsAppUrl('08123456789', 'Halo KonterKuota, ada paket?');
    expect(url).toBe('https://wa.me/628123456789?text=Halo%20KonterKuota%2C%20ada%20paket%3F');
  });

  it('generates specific package inquiry message containing counter and package info', () => {
    const msg = generatePackageInquiryMessage({
      counterName: 'Berkah Cell',
      platformName: 'KonterKuota',
      packageName: 'InternetMAX 14 GB',
      providerName: 'Telkomsel',
      quotaSummary: '14 GB',
      activePeriod: '30 Hari',
      priceFormatted: 'Rp35.000',
    });

    expect(msg).toContain('Berkah Cell');
    expect(msg).toContain('InternetMAX 14 GB');
    expect(msg).toContain('Telkomsel');
    expect(msg).toContain('14 GB');
    expect(msg).toContain('30 Hari');
    expect(msg).toContain('Rp35.000');
  });

  it('generates general counter message without package details', () => {
    const msg = generateGeneralCounterMessage({
      counterName: 'Berkah Cell',
      platformName: 'KonterKuota',
    });
    expect(msg).toContain('Berkah Cell');
    expect(msg).not.toContain('undefined');
  });

  it('generates partner signup message addressed to manager', () => {
    const msg = generatePartnerSignupMessage({ platformName: 'KonterKuota' });
    expect(msg).toContain('Pengelola KonterKuota');
    expect(msg).toContain('mendaftarkan usaha saya');
  });
});

