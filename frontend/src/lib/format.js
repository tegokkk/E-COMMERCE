/**
 * Format angka integer menjadi format Rupiah Indonesia (contoh: Rp35.000)
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp0';
  return 'Rp' + amount.toLocaleString('id-ID');
}

/**
 * Format string tanggal ISO menjadi teks Indonesia yang mudah dibaca
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

