'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { JOIN_FORM_URL } from '@/config/joinForm';

interface GoogleFormModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Normalizes Google Form URLs to ensure proper iframe embedding.
 * Appends `embedded=true` if not already present.
 */
function getEmbedUrl(rawUrl: string): { embedUrl: string; isConfigured: boolean } {
  if (!rawUrl || rawUrl.trim() === '' || rawUrl.includes('PASTE_MY_GOOGLE_FORM_LINK_HERE')) {
    return { embedUrl: '', isConfigured: false };
  }

  const trimmed = rawUrl.trim();

  // If already contains embedded=true, return as-is
  if (trimmed.includes('embedded=true')) {
    return { embedUrl: trimmed, isConfigured: true };
  }

  // If it's a standard docs.google.com/forms viewform link
  if (trimmed.includes('/viewform')) {
    const separator = trimmed.includes('?') ? '&' : '?';
    return { embedUrl: `${trimmed}${separator}embedded=true`, isConfigured: true };
  }

  // Fallback: append query param
  const sep = trimmed.includes('?') ? '&' : '?';
  return { embedUrl: `${trimmed}${sep}embedded=true`, isConfigured: true };
}

export function openJoinFormModal(triggerEl?: HTMLElement | null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tech-yuva:open-join-modal', {
        detail: { triggerEl },
      })
    );
  }
}

export default function GoogleFormModal({ isOpen: controlledIsOpen, onClose: controlledOnClose }: GoogleFormModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTrigger, setLastTrigger] = useState<HTMLElement | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const { embedUrl, isConfigured } = getEmbedUrl(JOIN_FORM_URL);

  const handleClose = useCallback(() => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setIsLoading(true);

    // Return focus to last active trigger element
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      try {
        lastTrigger.focus();
      } catch (err) {
        // focus guard
      }
    }
  }, [isControlled, controlledOnClose, lastTrigger]);

  // Global event & click listener for any element with data-join-form
  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ triggerEl?: HTMLElement }>;
      if (customEvent.detail?.triggerEl) {
        setLastTrigger(customEvent.detail.triggerEl);
      } else if (document.activeElement instanceof HTMLElement) {
        setLastTrigger(document.activeElement);
      }
      setInternalIsOpen(true);
      setIsLoading(true);
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const trigger = target.closest('[data-join-form]') as HTMLElement | null;
      if (trigger) {
        e.preventDefault();
        setLastTrigger(trigger);
        setInternalIsOpen(true);
        setIsLoading(true);
      }
    };

    window.addEventListener('tech-yuva:open-join-modal', handleCustomOpen);

    return () => {
      window.removeEventListener('tech-yuva:open-join-modal', handleCustomOpen);
    };
  }, []);

  // Log warning if unconfigured
  useEffect(() => {
    if (isOpen && !isConfigured) {
      console.warn(
        '[Tech Yuva] Google Form URL is not configured. Please set JOIN_FORM_URL in config/joinForm.ts'
      );
    }
  }, [isOpen, isConfigured]);

  // Keyboard navigation (Escape to close, Focus trap)
  useEffect(() => {
    if (!isOpen) return;

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => {
      if (closeBtnRef.current) {
        closeBtnRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      // Focus trapping
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="gform-modal-backdrop"
      onClick={handleClose}
      aria-hidden="false"
    >
      <div
        className="gform-modal-panel"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Join Tech Yuva"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="gform-modal-header">
          <div className="gform-header-content">
            <span className="gform-badge">Tech Yuva Cohort 2026</span>
            <h3 className="gform-title">Join Tech Yuva</h3>
            <p className="gform-subtitle">Complete your builder application below</p>
          </div>
          <button
            type="button"
            className="gform-close-btn"
            ref={closeBtnRef}
            onClick={handleClose}
            aria-label="Close dialog"
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body / Iframe Area */}
        <div className="gform-modal-body">
          {isConfigured ? (
            <>
              {isLoading && (
                <div className="gform-loading-state" aria-live="polite">
                  <div className="gform-spinner"></div>
                  <p>Loading application form...</p>
                </div>
              )}
              <iframe
                src={embedUrl}
                title="Tech Yuva Community Registration Form"
                className={`gform-iframe ${isLoading ? 'gform-iframe-hidden' : 'gform-iframe-visible'}`}
                onLoad={() => setIsLoading(false)}
                allowFullScreen
              />
            </>
          ) : (
            <div className="gform-placeholder-state">
              <div className="gform-placeholder-icon">📋</div>
              <h4>Enrollment form coming soon</h4>
              <p>
                We are finalizing the application cohort questions. Please check back shortly or configure your Google Form link in <code>config/joinForm.ts</code>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Fallback */}
        <div className="gform-modal-footer">
          {isConfigured && (
            <p className="gform-fallback-text">
              Form not loading?{' '}
              <a
                href={JOIN_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="gform-fallback-link"
              >
                Open in a new tab &rarr;
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
