'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { InvoicePreview, InvoicePreviewData } from '@/components/projects/InvoicePreview';

export interface FloatingPreviewModalProps {
  data: InvoicePreviewData;
  onClose: () => void;
  /** When true, modal is offset to the left of a right-anchored side panel. */
  anchorToLeft?: boolean;
  /** Heading text. Defaults to "Live Preview". */
  heading?: string;
  /** When true, animates out (slides right / fades) then calls onClose. */
  closing?: boolean;
}

export function FloatingPreviewModal({ data, onClose, anchorToLeft = true, heading = 'Live Preview', closing = false }: FloatingPreviewModalProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const r = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(r);
  }, [mounted]);

  useEffect(() => {
    if (closing) setVisible(false);
  }, [closing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!mounted) return null;

  const show = visible && !closing;

  const modalWidth = 560;
  const gap = 24;

  return createPortal(
    <div
      className={`fixed top-0 bottom-0 z-50 ease-in-out ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{
        right: show
          ? (anchorToLeft ? `calc(min(42vw, 640px) + ${gap}px)` : '24px')
          : '-600px',
        width: modalWidth,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        transition: 'right 350ms ease-in-out, opacity 350ms ease-in-out',
      }}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
        style={{ width: modalWidth, height: 'min(82vh, 760px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0 print:hidden">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{heading}</p>
            <p className="text-[11px] text-muted-foreground truncate">{data.number || 'Invoice'} · {data.clientName || '—'}</p>
          </div>
        </div>

        {/* InvoicePreview handles its own internal scrolling & A4 scaling */}
        <div className="flex-1 min-h-0">
          <InvoicePreview data={data} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
