'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';

interface EventRegisterModalProps {
  isOpen: boolean;
  event: {
    id: string;
    title: string;
    date: string;
    mode: string;
    venue: string;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EventRegisterModal({
  isOpen,
  event,
  onClose,
  onSuccess,
}: EventRegisterModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.registerForEvent(event.id, {
        fullName,
        email,
        phone,
        college,
        teamName,
      });

      setConfirmed(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ty-modal-overlay" onClick={onClose}>
      <div className="ty-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ty-modal-header">
          <div>
            <span className="ty-eyebrow">Event Registration</span>
            <h3 className="ty-modal-title">{event.title}</h3>
          </div>
          <button className="ty-modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {confirmed ? (
          <div className="ty-success-view">
            <div className="ty-success-icon">✓</div>
            <h3>Pass Confirmed!</h3>
            <p>
              Your ticket for <strong>{event.title}</strong> is reserved. A confirmation email has been sent to{' '}
              <code>{email}</code>.
            </p>
            <div className="ty-event-summary-card">
              <div><strong>Format:</strong> {event.mode.toUpperCase()}</div>
              <div><strong>Venue:</strong> {event.venue}</div>
            </div>
            <button
              type="button"
              className="ty-close-btn"
              onClick={() => {
                setConfirmed(false);
                onClose();
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ty-form">
            {error && <div className="ty-alert ty-alert-error">{error}</div>}

            <div className="ty-field">
              <label className="ty-label">Full Name *</label>
              <input
                type="text"
                required
                className="ty-input"
                placeholder="e.g. Harry Soni"
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
                <label className="ty-label">College / Institute</label>
                <input
                  type="text"
                  className="ty-input"
                  placeholder="e.g. DTU"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>
            </div>

            <div className="ty-field">
              <label className="ty-label">Team Name (Optional)</label>
              <input
                type="text"
                className="ty-input"
                placeholder="e.g. NeuralArchitects"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="ty-submit-btn">
              {loading ? <span className="ty-spinner"></span> : 'Reserve Pass & Confirm RSVP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
