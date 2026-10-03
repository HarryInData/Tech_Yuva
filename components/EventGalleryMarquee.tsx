'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { EventGalleryItem } from '@/data/eventsData';

interface EventGalleryMarqueeProps {
  items: EventGalleryItem[];
  direction?: 'ltr' | 'rtl';
  speedSeconds?: number;
  eventTitle: string;
  eventSlug?: string;
}

export default function EventGalleryMarquee({
  items,
  direction = 'ltr',
  speedSeconds = 48,
  eventTitle,
  eventSlug = 'event',
}: EventGalleryMarqueeProps) {
  // Empty state handling
  if (!items || items.length === 0) {
    return null;
  }

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Touch swipe tracking for Lightbox
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // IntersectionObserver to pause animation when offscreen to save battery & CPU
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '100px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Analytics event dispatcher
  const trackEvent = useCallback((eventName: string, params: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as {
      gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
      dataLayer?: Array<Record<string, unknown>>;
    };
    if (typeof win.gtag === 'function') {
      win.gtag('event', eventName, params);
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({ event: eventName, ...params });
    }
  }, []);

  // Open Lightbox
  const openLightbox = (index: number, eventTarget?: HTMLElement) => {
    lastActiveElementRef.current = eventTarget || (document.activeElement as HTMLElement);
    setLightboxIndex(index);
    trackEvent('gallery_photo_open', {
      event_slug: eventSlug,
      event_title: eventTitle,
      photo_index: index,
      photo_src: items[index]?.src,
      photo_alt: items[index]?.alt,
    });
  };

  // Close Lightbox
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
      setTimeout(() => {
        lastActiveElementRef.current?.focus();
      }, 50);
    }
  }, []);

  // Lightbox Navigation
  const showPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev - 1 + items.length) % items.length;
    });
  }, [items.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % items.length;
    });
  }, [items.length]);

  // Body scroll lock and keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNext();
      } else if (e.key === 'Tab') {
        // Focus trap
        if (!lightboxRef.current) return;
        const focusableElements = lightboxRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      if (lightboxRef.current) {
        const closeBtn = lightboxRef.current.querySelector<HTMLButtonElement>('.lightbox-close-btn');
        closeBtn?.focus();
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  // Touch handlers for mobile swipe in Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        showPrev();
      } else {
        showNext();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Ensure track has enough tiles to never leave a gap on wide 4K screens (1920px - 2560px)
  // Each tile is ~320px wide, so target >= 8 tiles in each track
  const repeatCount = useMemo(() => {
    if (items.length >= 8) return 1;
    if (items.length >= 4) return 2;
    return 3;
  }, [items.length]);

  const expandedItems = useMemo(() => {
    let res: { item: EventGalleryItem; originalIndex: number }[] = [];
    for (let r = 0; r < repeatCount; r++) {
      res = res.concat(items.map((item, idx) => ({ item, originalIndex: idx })));
    }
    return res;
  }, [items, repeatCount]);

  // Two rows ONLY when the original items list has 8+ photos
  const isDualRow = items.length >= 8;
  const row1Items = isDualRow ? expandedItems.slice(0, Math.ceil(expandedItems.length / 2)) : expandedItems;
  const row2Items = isDualRow ? expandedItems.slice(Math.ceil(expandedItems.length / 2)) : [];

  const activePhoto = lightboxIndex !== null ? items[lightboxIndex] : null;

  // Manual scroll controls for desktop users
  const handleManualScroll = (delta: number) => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  const renderMarqueeRow = (
    rowList: { item: EventGalleryItem; originalIndex: number }[],
    rowDirection: 'ltr' | 'rtl',
    rowSpeed: number,
    rowKey: string
  ) => {
    const isPaused = !isInView || !isPlaying;

    return (
      <div
        className={`event-marquee-row event-marquee-row--${rowDirection} ${
          isPaused ? 'event-marquee-paused' : ''
        }`}
        style={{ '--marquee-duration': `${rowSpeed}s` } as React.CSSProperties}
        key={rowKey}
      >
        {/* Track 1: Interactive & Accessible */}
        <div className="event-marquee-track">
          {rowList.map((entry, idx) => {
            const { item, originalIndex } = entry;
            return (
              <button
                type="button"
                key={`t1-${item.src}-${idx}`}
                className="event-photo-tile"
                onClick={(e) => openLightbox(originalIndex, e.currentTarget)}
                aria-label={`View photo ${originalIndex + 1} of ${items.length}: ${item.caption || item.alt}`}
              >
                <div className="event-photo-frame">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="event-photo-img"
                  />
                  <div className="event-photo-overlay">
                    <span className="event-photo-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                      Enlarge
                    </span>
                  </div>
                </div>
                {item.caption && (
                  <div className="event-photo-info">
                    <span className="event-photo-title" title={item.caption}>
                      {item.caption}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Track 2: Duplicate Clone for Seamless Infinite Loop (Aria-hidden) */}
        <div className="event-marquee-track" aria-hidden="true">
          {rowList.map((entry, idx) => {
            const { item } = entry;
            return (
              <div
                key={`t2-${item.src}-${idx}`}
                className="event-photo-tile event-photo-tile--clone"
                tabIndex={-1}
              >
                <div className="event-photo-frame">
                  <img
                    src={item.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="event-photo-img"
                  />
                </div>
                {item.caption && (
                  <div className="event-photo-info">
                    <span className="event-photo-title">
                      {item.caption}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="event-gallery-marquee-container"
      aria-label={`${eventTitle} photo highlights`}
      role="region"
    >
      {/* Desktop Controls Toolbar: Prev, Play/Pause, Next */}
      <div className="marquee-controls-bar">
        <div className="marquee-controls-label">
          <span className="marquee-indicator-dot"></span>
          <span>Photo Showcase ({items.length} moments)</span>
        </div>
        <div className="marquee-controls-actions">
          <button
            type="button"
            className="marquee-control-btn"
            onClick={() => handleManualScroll(-320)}
            aria-label="Scroll gallery left"
            title="Scroll left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            type="button"
            className="marquee-control-btn marquee-control-btn--playpause"
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-label={isPlaying ? 'Pause marquee animation' : 'Resume marquee animation'}
            title={isPlaying ? 'Pause auto-scroll' : 'Play auto-scroll'}
          >
            {isPlaying ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                <rect x="14" y="4" width="4" height="16" rx="1"></rect>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>
          <button
            type="button"
            className="marquee-control-btn"
            onClick={() => handleManualScroll(320)}
            aria-label="Scroll gallery right"
            title="Scroll right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Edge Gradient Mask Container */}
      <div className="event-marquee-viewport" ref={viewportRef}>
        {/* Row 1 */}
        {renderMarqueeRow(row1Items, direction, speedSeconds, `row-1-${eventSlug}`)}

        {/* Optional Row 2 only for 8+ images (Opposite Direction & Parallax Speed) */}
        {isDualRow &&
          renderMarqueeRow(
            row2Items,
            direction === 'ltr' ? 'rtl' : 'ltr',
            Math.round(speedSeconds * 1.25),
            `row-2-${eventSlug}`
          )}
      </div>

      {/* Lightbox Modal Dialog */}
      {lightboxIndex !== null && activePhoto && (
        <div
          ref={lightboxRef}
          className="event-lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${eventTitle} photo ${lightboxIndex + 1} of ${items.length}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeLightbox();
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="event-lightbox-dialog">
            {/* Top Toolbar */}
            <div className="lightbox-toolbar">
              <div className="lightbox-counter">
                <span className="lightbox-index">{lightboxIndex + 1}</span>
                <span className="lightbox-sep">/</span>
                <span className="lightbox-total">{items.length}</span>
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={closeLightbox}
                aria-label="Close photo gallery (Escape)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Main Stage */}
            <div className="lightbox-stage">
              {items.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn lightbox-nav-btn--prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  aria-label="Previous photo (Left arrow)"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              )}

              <div className="lightbox-media-wrapper">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  className="lightbox-image"
                />
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn lightbox-nav-btn--next"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  aria-label="Next photo (Right arrow)"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              )}
            </div>

            {/* Bottom Caption & Alt Detail */}
            <div className="lightbox-caption-wrap">
              {activePhoto.caption && (
                <h4 className="lightbox-caption-title">{activePhoto.caption}</h4>
              )}
              <p className="lightbox-caption-desc">{activePhoto.alt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
