'use client';

import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!isSupabaseConfigured) {
        // Mock authentication in development
        setTimeout(() => {
          setLoading(false);
          setMessage({
            type: 'success',
            text: 'Logged in successfully (Dev Mode)! Connect your Supabase project in .env for production auth.',
          });
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 1500);
        }, 600);
        return;
      }

      if (tab === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          localStorage.setItem('ty_auth_token', data.session.access_token);
        }
        setMessage({ type: 'success', text: 'Welcome back, builder!' });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } else if (tab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });
        if (error) throw error;
        setMessage({
          type: 'success',
          text: 'Account created! Please check your email inbox to verify your account.',
        });
      } else if (tab === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setMessage({
          type: 'success',
          text: 'Password reset link sent to your email!',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ty-modal-overlay" onClick={onClose}>
      <div className="ty-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ty-modal-header">
          <div className="ty-modal-brand">
            <span className="ty-brand-prefix">TECH</span> <span className="ty-brand-accent">YUVA</span>
          </div>
          <button className="ty-modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* Tab switchers */}
        <div className="ty-tab-group">
          <button
            type="button"
            className={`ty-tab-btn ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => {
              setTab('signin');
              setMessage(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`ty-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setTab('signup');
              setMessage(null);
            }}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={`ty-tab-btn ${tab === 'forgot' ? 'active' : ''}`}
            onClick={() => {
              setTab('forgot');
              setMessage(null);
            }}
          >
            Forgot?
          </button>
        </div>

        {/* Feedback alert */}
        {message && (
          <div className={`ty-alert ty-alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ty-form">
          {tab === 'signup' && (
            <>
              <div className="ty-field">
                <label className="ty-label">Full Name</label>
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
                <label className="ty-label">Role</label>
                <div className="ty-radio-group">
                  <label className={`ty-role-card ${role === 'student' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                    />
                    <span>Student / Builder</span>
                  </label>
                  <label className={`ty-role-card ${role === 'mentor' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="mentor"
                      checked={role === 'mentor'}
                      onChange={() => setRole('mentor')}
                    />
                    <span>Mentor / Guide</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="ty-field">
            <label className="ty-label">Email Address</label>
            <input
              type="email"
              required
              className="ty-input"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {tab !== 'forgot' && (
            <div className="ty-field">
              <label className="ty-label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="ty-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="ty-submit-btn">
            {loading ? (
              <span className="ty-spinner"></span>
            ) : tab === 'signin' ? (
              'Sign In to Dashboard'
            ) : tab === 'signup' ? (
              'Create Builder Account'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="ty-modal-footer">
          {tab === 'signin' ? (
            <p>
              Don&apos;t have an account yet?{' '}
              <button type="button" onClick={() => setTab('signup')} className="ty-link-btn">
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button type="button" onClick={() => setTab('signin')} className="ty-link-btn">
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
