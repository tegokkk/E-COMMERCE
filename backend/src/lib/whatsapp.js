/**
 * Normalisasi nomor WhatsApp Indonesia menjadi format internasional tanpa simbol '+' (contoh: 628123456789)
 * @param {string} phone
 * @returns {string}
 */
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

/**
 * Buat URL WhatsApp resmi dengan pesan yang di-encode
 * @param {string} phone
 * @param {string} message
 * @returns {string}
 */
export function createWhatsAppUrl(phone, message) {
  const normalized = normalizeWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message || '');
  return `https://wa.me/${normalized}?text=${encoded}`;
}

/**
 * Template pesan WhatsApp untuk paket spesifik
 */
export function generatePackageInquiryMessage({
  counterName,
  platformName = 'KonterKuota',
  packageName,
  providerName,
  quotaSummary,
  activePeriod,
  priceFormatted,
}) {
  return `Halo ${counterName}, saya menemukan konter Anda melalui ${platformName}. Saya ingin menanyakan paket ${packageName}, provider ${providerName}, rincian kuota ${quotaSummary}, masa aktif ${activePeriod}, dengan harga tercantum ${priceFormatted}. Apakah paketnya masih tersedia?`;
}

/**
 * Template pesan WhatsApp untuk kontak umum konter
 */
export function generateGeneralCounterMessage({
  counterName,
  platformName = 'KonterKuota',
}) {
  return `Halo ${counterName}, saya menemukan konter Anda melalui ${platformName}. Saya ingin menanyakan ketersediaan paket kuota internet di toko Anda.`;
}

/**
 * Template pesan WhatsApp untuk pendaftaran mitra
 */
export function generatePartnerSignupMessage({
  platformName = 'KonterKuota',
}) {
  return `Halo Pengelola ${platformName}, saya pemilik konter dan berminat untuk mendaftarkan usaha saya ke direktori konter kuota. Mohon informasi syarat dan langkah selanjutnya.`;
}

