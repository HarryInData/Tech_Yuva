'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { JOIN_FORM_URL } from '@/config/joinForm';

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
    }
  };

  return (
    <a
      href={JOIN_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`admission-badge-pill ${isOpen ? 'badge-open' : 'badge-closed'}`}
      title={isOpen ? 'Apply for current cohort (opens application form in new tab)' : 'Admissions currently closed'}
    >
      <span className={`pulse-dot ${isOpen ? 'dot-active' : 'dot-inactive'}`}></span>
      <span className="badge-text">{loading ? 'Checking Cohort...' : badgeLabel}</span>
      {isOpen && <span className="badge-arrow">→</span>}
    </a>
  );
}

