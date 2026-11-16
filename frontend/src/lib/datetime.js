/** Convert an instant to the browser's local wall time for datetime-local. */
export function toDatetimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Preserve seconds/milliseconds on unchanged values; convert edits back to UTC. */
export function fromDatetimeLocal(value, originalValue) {
  if (!value) return null;
  if (originalValue && value === toDatetimeLocal(originalValue)) return new Date(originalValue).toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Batas penayangan tidak valid.');
  return date.toISOString();
}
