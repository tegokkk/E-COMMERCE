'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import clsx from 'clsx';

export function FaqSection({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section id="faq" className="scroll-mt-24 py-10 md:py-12 border-t border-line">
      <div className="flex flex-col gap-2 text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-content tracking-tight">
          Pertanyaan Umum
        </h2>
        <p className="text-sm text-content-muted">
          Hal yang sering ditanyakan seputar pencarian paket dan direktori konter.
        </p>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-surface rounded-card border border-line overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left font-bold text-sm md:text-base text-content hover:bg-surface-soft transition-colors gap-4 select-none min-h-[48px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-ink/40"
              >
                <span>{faq.question}</span>
                <span
                  className={clsx(
                    'w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center text-content-muted shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-180 bg-brand text-brand-on'
                  )}
                >
                  <Icon name="chevron_down" size={16} />
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0 text-xs md:text-sm text-content-muted leading-relaxed border-t border-line/60 bg-surface-muted/20">
                  <p className="mt-2.5">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
