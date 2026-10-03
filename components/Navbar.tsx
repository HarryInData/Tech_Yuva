'use client';

import { useState, useEffect } from 'react';
import AdmissionBadge from '@/components/AdmissionBadge';
import AuthModal from '@/components/AuthModal';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const NAV_ITEMS = [
  { href: '#hero', label: 'Home' },
  { href: '#intro', label: 'About' },
  { href: '#pillars', label: 'Ecosystem' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#hackathon', label: 'Events' },
  { href: '#founder', label: 'Founder' },
  { href: '#join', label: 'Community' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 80);

      const scrollPos = window.scrollY + 180;
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => {
        const el = section as HTMLElement;
        const top = el.offsetTop;
        const height = el.offsetHeight;
        const id = el.getAttribute('id');
        if (id && scrollPos >= top && scrollPos < top + height) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Check user session
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          });
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          });
          if (session.access_token) {
            localStorage.setItem('ty_auth_token', session.access_token);
          }
        } else {
          setUser(null);
          localStorage.removeItem('ty_auth_token');
        }
      });

      return () => {
        window.removeEventListener('scroll', onScroll);
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '#') return;
    if (href.startsWith('#')) {
      e.preventDefault();
      setIsOpen(false);
      const target = document.querySelector(href) as HTMLElement | null;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('ty_auth_token');
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="nav-glass-pill">
          <a href="#" className="nav-logo-badge" aria-label="Tech Yuva Home">
            <img src="/assets/logo.jpg" alt="Tech Yuva Logo" className="nav-logo-img" />
          </a>

          {/* Admission Open Badge */}
          <div className="nav-admission-wrap">
            <AdmissionBadge />
          </div>

          <ul className={`nav-links ${isOpen ? 'open' : ''}`} id="navLinks">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={activeSection === item.href.slice(1) ? 'active' : ''}
                  onClick={(e) => handleLinkClick(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {/* Auth Button or User Badge */}
            {user ? (
              <div className="nav-user-badge" title={user.email}>
                <span>👤 {user.name || 'Builder'}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-logout-btn"
                  title="Sign Out"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="nav-auth-btn"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In
              </button>
            )}

            <a
              href="mailto:techyuva.org@gmail.com"
              className="nav-circle-btn"
              aria-label="Contact Tech Yuva"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
            <button
              className="nav-circle-btn nav-toggle"
              id="navToggle"
              aria-label="Toggle navigation menu"
              onClick={() => setIsOpen((prev) => !prev)}
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Navy Dark Theme Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </>
  );
}
