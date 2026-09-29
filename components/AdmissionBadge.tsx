'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

interface AdmissionBadgeProps {
  onOpenJoinModal?: () => void;
}

export default function AdmissionBadge({ onOpenJoinModal }: AdmissionBadgeProps) {
  const [badgeLabel, setBadgeLabel] = useState<string>('Admission Open · New Cohort 2026');
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getCurrentCohort()
      .then((res) => {
        if (!isMounted) return;
        if (res?.badgeLabel) setBadgeLabel(res.badgeLabel);
        if (res?.isAdmissionsOpen !== undefined) setIsOpen(res.isAdmissionsOpen);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (onOpenJoinModal) {
      e.preventDefault();
      onOpenJoinModal();
    } else {
      const el = document.getElementById('join');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <a
      href="#join"
      data-join-form="true"
      onClick={handleClick}
      className={`admission-badge-pill ${isOpen ? 'badge-open' : 'badge-closed'}`}
      title={isOpen ? 'Click to apply for the current cohort' : 'Admissions currently closed'}
    >
      <span className={`pulse-dot ${isOpen ? 'dot-active' : 'dot-inactive'}`}></span>
      <span className="badge-text">{loading ? 'Checking Cohort...' : badgeLabel}</span>
      {isOpen && <span className="badge-arrow">→</span>}
    </a>
  );
}
