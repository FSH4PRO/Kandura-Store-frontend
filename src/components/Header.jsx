import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import Avatar from './Avatar';
import NotificationBell from './NotificationBell';

function navClass({ isActive }) {
  return `text-sm transition-colors ${isActive ? 'text-midnight-900 font-semibold' : 'text-midnight-400 hover:text-midnight-900'}`;
}

const LINKS = [
  { to: '/designs?mode=browse', label: 'Gallery' },
  { to: '/designs', label: 'My Designs' },
  { to: '/orders', label: 'Orders' },
  { to: '/wallet', label: 'Wallet' },
];

export default function Header() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('You have been signed out.');
    } catch {
      // token may already be invalid — proceed with client-side logout regardless
    } finally {
      setMobileOpen(false);
      navigate('/login', { replace: true });
    }
  };

  // Locking scroll while the mobile menu is open keeps the page behind
  // it from scrolling underneath — otherwise a long page keeps scrolling
  // "through" the open menu, which feels broken on touch devices.
  const toggleMobileMenu = () => {
    setMobileOpen((open) => {
      const next = !open;
      document.body.style.overflow = next ? 'hidden' : '';
      return next;
    });
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-midnight-100 bg-ivory/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-midnight-900 text-gold-400 flex items-center justify-center shadow-card">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-serif text-xl leading-none text-midnight-900">Kandura Store</p>
            <p className="text-[11px] uppercase tracking-wide text-midnight-400 mt-0.5">Bespoke Emirati Tailoring</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <NavLink key={l.label} to={l.to} className={navClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <NotificationBell />
          <Link to="/profile" className="flex items-center gap-2 text-sm text-midnight-600 hover:text-midnight-900">
            <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
            <span>{user?.name || 'Profile'}</span>
          </Link>
          <button onClick={handleLogout} className="btn-outline !py-2 !px-3 text-sm">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <NotificationBell />
          <button
            className="p-2.5 rounded-lg border border-midnight-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={toggleMobileMenu}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-midnight-100 px-4 py-4 space-y-1 bg-ivory animate-slide-up">
          <Link
            to="/profile"
            className="flex items-center gap-3 py-3 border-b border-midnight-100 mb-2"
            onClick={closeMobileMenu}
          >
            <Avatar src={user?.avatar_url} name={user?.name} size="md" />
            <span className="text-sm font-medium text-midnight-900">{user?.name || 'Profile'}</span>
          </Link>
          {LINKS.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `block py-3 min-h-[44px] text-base ${navClass({ isActive })}`
              }
              onClick={closeMobileMenu}
            >
              {l.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="btn-outline w-full !py-3 text-sm mt-3">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </header>
  );
}
