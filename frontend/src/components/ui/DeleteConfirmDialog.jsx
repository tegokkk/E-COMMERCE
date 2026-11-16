'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from './Button';
import { Dialog, DialogContent } from './Dialog';

export function DeleteConfirmDialog({ item, kind, endpoint, details, blockedReason, onClose, onDeleted }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setPending(true);
    setError('');
    try {
      await apiClient(endpoint, { method: 'DELETE' });
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.message || `${kind} gagal dihapus.`);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}>
      <DialogContent title={`Hapus ${kind}?`} description="Tindakan ini permanen dan tidak dapat dibatalkan." maxWidth="max-w-md">
        <div className="flex flex-col gap-4 text-sm">
          <p className="text-content break-words">Anda akan menghapus <strong>{item.name}</strong>. {details}</p>
          {blockedReason && <p className="rounded-card border border-warning-ink/20 bg-warning-soft p-3 text-warning-ink">{blockedReason}</p>}
          {error && <p role="alert" className="rounded-card border border-danger-ink/20 bg-danger-soft p-3 text-danger-ink">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" disabled={pending} onClick={onClose}>Batal</Button>
            <Button variant="danger" size="sm" disabled={Boolean(blockedReason)} loading={pending} onClick={handleDelete}>
              Ya, Hapus {kind}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
