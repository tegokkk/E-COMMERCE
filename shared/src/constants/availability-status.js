/**
 * Status Ketersediaan Paket Kuota
 */
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  NEEDS_CONFIRMATION: 'needs_confirmation',
  UNAVAILABLE: 'unavailable',
};

export const AVAILABILITY_STATUS_VALUES = Object.values(AVAILABILITY_STATUS);

export const AVAILABILITY_STATUS_LABELS = {
  [AVAILABILITY_STATUS.AVAILABLE]: 'Tersedia',
  [AVAILABILITY_STATUS.NEEDS_CONFIRMATION]: 'Perlu konfirmasi',
  [AVAILABILITY_STATUS.UNAVAILABLE]: 'Habis / Tidak tersedia',
};

export const AVAILABILITY_STATUS_ACTIONS = {
  [AVAILABILITY_STATUS.AVAILABLE]: 'Tanya Paket',
  [AVAILABILITY_STATUS.NEEDS_CONFIRMATION]: 'Tanya Ketersediaan',
};

