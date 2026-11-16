export function normalizeWhatsAppNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+62')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('08')) {
    cleaned = '628' + cleaned.substring(2);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.substring(1);
  }

  return cleaned;
}

export function createWhatsAppUrl(phone, message) {
  const normalized = normalizeWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message || '');
  return `https://wa.me/${normalized}?text=${encoded}`;
}

export function generatePartnerSignupMessage({ platformName = 'KonterKuota' }) {
  return `Halo ${platformName}, saya mau mendaftarkan konter. Data apa saja yang perlu saya kirim?`;
}

