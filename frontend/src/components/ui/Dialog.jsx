'use client';

import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { Icon } from './Icon';

export function Dialog({ open, onOpenChange, children }) {
  return <RadixDialog.Root open={open} onOpenChange={onOpenChange}>{children}</RadixDialog.Root>;
}

export const DialogTrigger = RadixDialog.Trigger;

export function DialogContent({
  children,
  title,
  description,
  className = '',
  maxWidth = 'max-w-2xl',
  onClose,
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-[#050A14]/80 backdrop-blur-xs z-50 animate-in fade-in duration-200" />
      <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-0 md:p-4">
        <RadixDialog.Content
          className={clsx(
            'bg-surface w-full flex flex-col max-h-[100dvh] md:max-h-[90vh] md:rounded-panel shadow-dialog border border-line focus:outline-none animate-in zoom-in-95 duration-200',
            maxWidth,
            className
          )}
          aria-describedby={description ? 'dialog-description' : undefined}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-line bg-surface md:rounded-t-panel">
            <div className="min-w-0">
              <RadixDialog.Title className="text-lg font-bold text-content leading-snug">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description id="dialog-description" className="text-xs text-content-muted mt-0.5 leading-relaxed">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <button
                type="button"
                className="p-2 text-content-muted hover:text-content hover:bg-surface-muted rounded-full transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/40"
                aria-label="Tutup dialog"
                onClick={onClose}
              >
                <Icon name="close" size={20} />
              </button>
            </RadixDialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
        </RadixDialog.Content>
      </div>
    </RadixDialog.Portal>
  );
}

