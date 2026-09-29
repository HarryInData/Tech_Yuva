'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';

const AVAILABLE_INTERESTS = [
  'AI',
  'Web3',
  'Cyber Security',
  'Web Dev',
  'Startups',
  'Systems Engineering',
  'Open Source',
];

interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinCommunityModal({ isOpen, onClose }: JoinCommunityModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [city, setCity] = useState('');
  const [interests, setInterests] = useState<string[]>(['AI', 'Web Dev']);
  const [githubUrl, setGithubUrl] = useState('');
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) {
      setError('Please select at least one technical interest.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.joinCommunity({
        fullName,
        email,
        phone,
        college,
        city,
        interests,
        githubUrl: githubUrl || undefined,
        statementOfPurpose: statement || undefined,
        cohortYear: 2026,
      });

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ty-modal-overlay" onClick={onClose}>
      <div className="ty-modal-container ty-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="ty-modal-header">
          <div>
            <span className="ty-eyebrow">New Cohort 2026</span>
            <h3 className="ty-modal-title">Join Tech Yuva Guild</h3>
          </div>
          <button className="ty-modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {submitted ? (
          <div className="ty-success-view">
            <div className="ty-success-icon">✓</div>
            <h3>Application Received!</h3>
            <p>
              Welcome to the guild, <strong>{fullName}</strong>. We have sent a confirmation email to{' '}
              <code>{email}</code>.
            </p>
            <p className="ty-success-sub">
              While our admissions council reviews your profile, feel free to join our builder community channels:
            </p>
            <div className="ty-success-actions">
              <a
                href="https://chat.whatsapp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-white"
              >
                Join WhatsApp Group <span>↗</span>
              </a>
              <a
                href="https://discord.gg/techyuva"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                Join Discord HQ <span>↗</span>
              </a>
            </div>
            <button
              type="button"
              className="ty-close-btn"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ty-form">
            <p className="ty-form-lead">
              Zero fees. Real projects. Live deployment alongside fellow student builders.
            </p>

            {error && <div className="ty-alert ty-alert-error">{error}</div>}

            <div className="ty-grid-2">
              <div className="ty-field">
                <label className="ty-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="ty-input"
                  placeholder="e.g. Lakshay Soni"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="ty-field">
                <label className="ty-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="ty-input"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="ty-grid-2">
              <div className="ty-field">
                <label className="ty-label">Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="ty-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="ty-field">
                <label className="ty-label">City *</label>
                <input
                  type="text"
                  required
                  className="ty-input"
                  placeholder="e.g. New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="ty-grid-2">
              <div className="ty-field">
                <label className="ty-label">College / School Name *</label>
                <input
                  type="text"
                  required
                  className="ty-input"
                  placeholder="e.g. DTU, IIT Delhi, NSUT..."
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>

              <div className="ty-field">
                <label className="ty-label">GitHub Profile URL</label>
                <input
                  type="url"
                  className="ty-input"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="ty-field">
              <label className="ty-label">Technical Interests (Select all that apply) *</label>
              <div className="ty-checkbox-chips">
                {AVAILABLE_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={`ty-chip ${interests.includes(interest) ? 'active' : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interests.includes(interest) ? '✓ ' : '+ '}
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="ty-field">
              <label className="ty-label">What do you want to build at Tech Yuva?</label>
              <textarea
                className="ty-textarea"
                rows={2}
                placeholder="Tell us briefly about systems you want to design or problems you care about..."
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="ty-submit-btn">
              {loading ? <span className="ty-spinner"></span> : 'Submit Cohort Application — Zero Fees'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
