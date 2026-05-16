import React, { useContext, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LogOut,
  Zap,
  ClipboardList,
  Dumbbell,
  History,
  Camera,
  Activity,
  CreditCard,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const NAV_LINKS = {
  Administrador: [
    { to: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  ],
  Entrenador: [
    { to: '/entrenador/rutinas', label: 'Mis Rutinas', icon: ClipboardList },
  ],
  Cliente: [
    { to: '/cliente/rutinas',   label: 'Rutinas',   icon: Dumbbell  },
    { to: '/cliente/historial', label: 'Historial', icon: History   },
    { to: '/cliente/progreso',  label: 'Progreso',  icon: Camera    },
    { to: '/cliente/nutricion', label: 'Nutrición', icon: Activity  },
  ],
};

const roleBadgeColor = {
  Administrador: '#dc2626',
  Entrenador:    '#2563eb',
  Cliente:       '#16a34a',
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  if (!user) return null;

  const links = NAV_LINKS[user.rol] || [];
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <>
      {/* ── Barra principal ─────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 w-full"
        style={{
          background: '#0f172a',
          borderBottom: '1px solid rgba(245,158,11,0.18)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        }}
      >
        {/* Trama diagonal */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14">

          {/* Logo */}
          <Link
            to={links[0]?.to ?? '/'}
            className="flex items-center gap-2 flex-shrink-0 mr-8"
            style={{ textDecoration: 'none' }}
            onClick={() => setOpen(false)}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#f59e0b', boxShadow: '0 0 12px rgba(245,158,11,0.45)' }}
            >
              <Zap size={16} className="text-gray-900" strokeWidth={3} />
            </div>
            <span
              className="text-white leading-none hidden sm:block"
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: '1.35rem',
                letterSpacing: '0.07em',
              }}
            >
              FITTRACK
            </span>
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150"
                  style={{
                    fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                    letterSpacing: '0.06em',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: active ? '#f59e0b' : '#9ca3af',
                    background: active ? 'rgba(245,158,11,0.1)' : 'transparent',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.color = '#e5e7eb';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.color = '#9ca3af';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={14} strokeWidth={2.5} />
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: '#f59e0b' }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Derecha desktop */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {/* Avatar + nombre */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#1e293b', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <span
                  style={{
                    color: '#f59e0b',
                    fontFamily: "'Bebas Neue','Impact',sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                  }}
                >
                  {user.nombre?.[0]?.toUpperCase() ?? 'U'}
                </span>
              </div>
              <div className="leading-none">
                <p className="text-white text-xs font-semibold truncate max-w-[100px]">
                  {user.nombre}
                </p>
                <span
                  style={{
                    background: (roleBadgeColor[user.rol] ?? '#6b7280') + '22',
                    color: roleBadgeColor[user.rol] ?? '#6b7280',
                    fontSize: '0.62rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.04em',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  {user.rol}
                </span>
              </div>
            </div>

            {/* Divisor */}
            <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.08)' }} />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150"
              style={{
                fontFamily: "'Bebas Neue','Impact',sans-serif",
                letterSpacing: '0.06em',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#6b7280',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={14} strokeWidth={2.5} />
              Salir
            </button>
          </div>

          {/* Hamburger mobile */}
          <button
            className="md:hidden ml-auto flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            style={{
              color: open ? '#f59e0b' : '#9ca3af',
              background: open ? 'rgba(245,158,11,0.1)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>
        </div>
      </nav>

      {/* ── Drawer mobile ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute top-14 left-0 right-0"
            style={{
              background: '#0f172a',
              borderBottom: '1px solid rgba(245,158,11,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Trama */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)',
              }}
            />

            {/* Info usuario */}
            <div
              className="relative flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#1e293b', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <span
                  style={{
                    color: '#f59e0b',
                    fontFamily: "'Bebas Neue','Impact',sans-serif",
                    fontSize: '1rem',
                    fontWeight: 900,
                  }}
                >
                  {user.nombre?.[0]?.toUpperCase() ?? 'U'}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{user.nombre}</p>
                <span
                  style={{
                    background: (roleBadgeColor[user.rol] ?? '#6b7280') + '22',
                    color: roleBadgeColor[user.rol] ?? '#6b7280',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {user.rol}
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="relative px-3 py-3 space-y-1">
              {links.map(({ to, label, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150"
                    style={{
                      background: active ? 'rgba(245,158,11,0.1)' : 'transparent',
                      border: active ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: active ? '#f59e0b' : '#1e293b' }}
                      >
                        <Icon
                          size={14}
                          strokeWidth={2.5}
                          style={{ color: active ? '#0f172a' : '#6b7280' }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "'Bebas Neue','Impact',sans-serif",
                          letterSpacing: '0.06em',
                          fontSize: '0.9rem',
                          fontWeight: 900,
                          color: active ? '#f59e0b' : '#d1d5db',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <ChevronRight size={14} style={{ color: active ? '#f59e0b' : '#374151' }} />
                  </Link>
                );
              })}
            </div>

            {/* Logout mobile */}
            <div
              className="relative px-3 pb-4 pt-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
                style={{
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.12)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.07)')}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)' }}
                >
                  <LogOut size={14} style={{ color: '#ef4444' }} strokeWidth={2.5} />
                </div>
                <span
                  style={{
                    fontFamily: "'Bebas Neue','Impact',sans-serif",
                    letterSpacing: '0.06em',
                    fontSize: '0.9rem',
                    fontWeight: 900,
                    color: '#ef4444',
                  }}
                >
                  Cerrar Sesión
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;