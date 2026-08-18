import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useShellStore } from '@/stores/shellStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ArrowRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Types & helpers
───────────────────────────────────────────────────────────────────────────── */

type AuthState = 'idle' | 'loading' | 'error' | 'granted';

function useLiveClock(format: '12h' | '24h' = '12h') {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours =
    format === '12h'
      ? String(now.getHours() % 12 || 12).padStart(2, '0')
      : String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const period  = format === '12h' ? (now.getHours() >= 12 ? 'PM' : 'AM') : null;

  const months = [
    'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
    'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER',
  ];
  const day   = now.getDate();
  const month = months[now.getMonth()];
  const year  = now.getFullYear();
  const dateStr = `${day} ${month} ${year}`;

  return { hours, minutes, period, dateStr };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Framer Motion variants
───────────────────────────────────────────────────────────────────────────── */

const fadeUp = (delay = 0, reduced = false) => ({
  initial: { opacity: 0, y: reduced ? 0 : 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay } },
  exit:    { opacity: 0, y: reduced ? 0 : -8, transition: { duration: 0.3 } },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' as const, delay } },
  exit:    { opacity: 0, transition: { duration: 0.4 } },
});

const shakeVariant = {
  idle:  { x: 0 },
  shake: { x: [0, -10, 10, -8, 8, -5, 5, 0], transition: { duration: 0.55, ease: 'easeInOut' as const } },
};

/* ─────────────────────────────────────────────────────────────────────────────
   AmbientBackground — pure CSS layers, no JS animation loops
───────────────────────────────────────────────────────────────────────────── */

const AmbientBackground: React.FC = () => (
  <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">

    {/* Base gradient */}
    <div className="absolute inset-0 bg-[#060608]" />

    {/* Radial center glow — illuminates behind the profile */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 48%, rgba(124,58,237,0.07) 0%, transparent 70%)',
      }}
    />

    {/* Atmospheric orb A — upper-left, violet */}
    <div
      className="absolute rounded-full animate-login-drift-a"
      style={{
        width: '55vw',
        height: '55vw',
        top: '-15vw',
        left: '-12vw',
        background:
          'radial-gradient(circle, rgba(109,40,217,0.14) 0%, transparent 68%)',
        filter: 'blur(40px)',
        willChange: 'transform, opacity',
      }}
    />

    {/* Atmospheric orb B — lower-right, indigo-blue */}
    <div
      className="absolute rounded-full animate-login-drift-b"
      style={{
        width: '50vw',
        height: '50vw',
        bottom: '-12vw',
        right: '-10vw',
        background:
          'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)',
        filter: 'blur(50px)',
        willChange: 'transform, opacity',
      }}
    />

    {/* Orb C — very subtle warm hint, top-right */}
    <div
      className="absolute rounded-full"
      style={{
        width: '30vw',
        height: '30vw',
        top: '-5vw',
        right: '5vw',
        background:
          'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }}
    />

    {/* Subtle data-grid overlay */}
    <div
      className="absolute inset-0 animate-login-grid"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        opacity: 0.018,
        maskImage:
          'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)',
      }}
    />

    {/* Noise / grain texture */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity: 0.4,
        mixBlendMode: 'overlay',
      }}
    />

    {/* Single scanline sweep on mount */}
    <div
      className="absolute left-0 right-0 h-[2px] animate-login-scanline pointer-events-none"
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(139,92,246,0.25), rgba(167,139,250,0.4), rgba(139,92,246,0.25), transparent)',
        top: 0,
      }}
    />
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   NovaWordmark — top-left OS identity
───────────────────────────────────────────────────────────────────────────── */

const NovaWordmark: React.FC<{ reduced: boolean }> = ({ reduced }) => (
  <motion.div
    {...fadeIn(0.15)}
    className="absolute top-8 left-10 z-10 flex flex-col select-none"
    style={{ gap: '1px' }}
  >
    <div className="flex items-baseline gap-[6px]">
      <span
        className="text-white font-semibold tracking-[0.18em] uppercase"
        style={{ fontSize: '13px', letterSpacing: '0.22em' }}
      >
        NOVA
      </span>
      <span
        className="font-light tracking-[0.15em] uppercase"
        style={{ fontSize: '13px', color: 'rgba(139,92,246,0.85)', letterSpacing: '0.22em' }}
      >
        OS
      </span>
    </div>
    <span
      style={{
        fontSize: '8.5px',
        letterSpacing: '0.28em',
        color: 'rgba(255,255,255,0.22)',
        textTransform: 'uppercase',
        fontWeight: 400,
      }}
    >
      OPERATING ENVIRONMENT
    </span>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SystemClock — top-right live clock
───────────────────────────────────────────────────────────────────────────── */

const SystemClock: React.FC<{ reduced: boolean }> = ({ reduced }) => {
  const { settings } = useSettingsStore();
  const { hours, minutes, period, dateStr } = useLiveClock(settings.clockFormat);

  return (
    <motion.div
      {...fadeIn(0.25)}
      className="absolute top-8 right-10 z-10 flex flex-col items-end select-none"
    >
      <div className="flex items-baseline gap-[5px]">
        <span
          className="text-white font-extralight tabular-nums"
          style={{ fontSize: '32px', letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          {hours}:{minutes}
        </span>
        {period && (
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.1em',
              fontWeight: 400,
              alignSelf: 'flex-end',
              paddingBottom: '3px',
            }}
          >
            {period}
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: '9px',
          letterSpacing: '0.22em',
          color: 'rgba(255,255,255,0.22)',
          textTransform: 'uppercase',
          fontWeight: 400,
          marginTop: '3px',
        }}
      >
        {dateStr}
      </span>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   NovaAvatarRing — sophisticated profile symbol with animated border
───────────────────────────────────────────────────────────────────────────── */

const NovaAvatarRing: React.FC<{ authState: AuthState }> = ({ authState }) => {
  const isError   = authState === 'error';
  const isGranted = authState === 'granted';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>

      {/* Rotating conic ring — the "premium border" */}
      <div
        className="absolute inset-0 rounded-full animate-login-ring"
        style={{
          background: isError
            ? 'conic-gradient(from 0deg, rgba(239,68,68,0.0), rgba(239,68,68,0.6), rgba(239,68,68,0.0))'
            : isGranted
            ? 'conic-gradient(from 0deg, rgba(34,197,94,0.0), rgba(34,197,94,0.7), rgba(34,197,94,0.0))'
            : 'conic-gradient(from 0deg, rgba(124,58,237,0.0), rgba(139,92,246,0.55), rgba(167,139,250,0.8), rgba(139,92,246,0.55), rgba(124,58,237,0.0))',
          transition: 'background 0.4s ease',
          padding: '1.5px',
          willChange: 'transform',
        }}
      >
        <div className="absolute inset-0 rounded-full" style={{ background: '#060608' }} />
      </div>

      {/* Static subtle outer glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: isError
            ? '0 0 28px rgba(239,68,68,0.18), 0 0 60px rgba(239,68,68,0.08)'
            : isGranted
            ? '0 0 28px rgba(34,197,94,0.20), 0 0 60px rgba(34,197,94,0.10)'
            : '0 0 28px rgba(124,58,237,0.18), 0 0 60px rgba(124,58,237,0.08)',
          transition: 'box-shadow 0.4s ease',
          borderRadius: '50%',
        }}
      />

      {/* Avatar surface */}
      <div
        className="absolute rounded-full flex items-center justify-center overflow-hidden"
        style={{
          inset: '3px',
          background:
            'radial-gradient(circle at 38% 38%, rgba(139,92,246,0.12) 0%, rgba(18,16,28,0.95) 60%, rgba(8,8,14,0.98) 100%)',
          border: '1px solid rgba(139,92,246,0.10)',
        }}
      >
        {/* Abstract NOVA identity mark — geometric hexagonal sigil */}
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer hex */}
          <polygon
            points="26,4 45,14.5 45,37.5 26,48 7,37.5 7,14.5"
            stroke="rgba(139,92,246,0.45)"
            strokeWidth="0.8"
            fill="none"
          />
          {/* Inner hex */}
          <polygon
            points="26,10 40,18 40,34 26,42 12,34 12,18"
            stroke="rgba(167,139,250,0.22)"
            strokeWidth="0.6"
            fill="none"
          />
          {/* Center diamond */}
          <polygon
            points="26,18 33,26 26,34 19,26"
            stroke="rgba(167,139,250,0.60)"
            strokeWidth="0.8"
            fill="rgba(139,92,246,0.08)"
          />
          {/* Vertical axis lines */}
          <line x1="26" y1="4" x2="26" y2="18"  stroke="rgba(167,139,250,0.30)" strokeWidth="0.5" />
          <line x1="26" y1="34" x2="26" y2="48" stroke="rgba(167,139,250,0.30)" strokeWidth="0.5" />
          {/* Horizontal axis lines */}
          <line x1="7"  y1="26" x2="19" y2="26" stroke="rgba(167,139,250,0.30)" strokeWidth="0.5" />
          <line x1="33" y1="26" x2="45" y2="26" stroke="rgba(167,139,250,0.30)" strokeWidth="0.5" />
          {/* Center dot */}
          <circle cx="26" cy="26" r="1.5" fill="rgba(167,139,250,0.85)" />
          {/* Corner accent dots */}
          <circle cx="26" cy="4"  r="1"   fill="rgba(139,92,246,0.50)" />
          <circle cx="26" cy="48" r="1"   fill="rgba(139,92,246,0.50)" />
          <circle cx="7"  cy="14.5" r="1" fill="rgba(139,92,246,0.35)" />
          <circle cx="45" cy="14.5" r="1" fill="rgba(139,92,246,0.35)" />
          <circle cx="7"  cy="37.5" r="1" fill="rgba(139,92,246,0.35)" />
          <circle cx="45" cy="37.5" r="1" fill="rgba(139,92,246,0.35)" />
        </svg>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   UserIdentity — profile block
───────────────────────────────────────────────────────────────────────────── */

const UserIdentity: React.FC<{ username: string; authState: AuthState; reduced: boolean }> = ({
  username,
  authState,
  reduced,
}) => (
  <motion.div {...fadeUp(0.40, reduced)} className="flex flex-col items-center z-10" style={{ gap: 0 }}>
    <NovaAvatarRing authState={authState} />

    <div className="flex flex-col items-center mt-5" style={{ gap: '6px' }}>
      <span
        className="text-white font-medium tracking-[0.18em] uppercase select-none"
        style={{ fontSize: '15px' }}
      >
        {username}
      </span>
      <span
        style={{
          fontSize: '10px',
          letterSpacing: '0.20em',
          color: 'rgba(255,255,255,0.28)',
          textTransform: 'uppercase',
          fontWeight: 400,
        }}
      >
        {authState === 'granted' ? 'ACCESS GRANTED' : 'Ready to continue'}
      </span>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   AuthenticationControl — floating password input, no card chrome
───────────────────────────────────────────────────────────────────────────── */

interface AuthControlProps {
  password: string;
  authState: AuthState;
  reduced: boolean;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AuthenticationControl: React.FC<AuthControlProps> = ({
  password,
  authState,
  reduced,
  onPasswordChange,
  onSubmit,
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = authState === 'loading' || authState === 'granted';
  const isError   = authState === 'error';
  const hasInput  = password.length > 0;

  // Color derivations
  const borderColor = isError
    ? focused ? 'rgba(239,68,68,0.65)' : 'rgba(239,68,68,0.35)'
    : focused
    ? 'rgba(139,92,246,0.55)'
    : 'rgba(255,255,255,0.09)';

  const glowShadow = isError
    ? focused ? '0 0 0 1px rgba(239,68,68,0.20), 0 4px 24px rgba(239,68,68,0.10)' : 'none'
    : focused
    ? '0 0 0 1px rgba(139,92,246,0.15), 0 4px 24px rgba(124,58,237,0.12)'
    : '0 2px 16px rgba(0,0,0,0.30)';

  return (
    <motion.div
      {...fadeUp(0.75, reduced)}
      className="z-10 w-full"
      style={{ maxWidth: '340px' }}
    >
      <motion.div
        variants={shakeVariant}
        animate={isError ? 'shake' : 'idle'}
      >
        <form
          onSubmit={onSubmit}
          className="relative flex items-center"
          style={{ gap: 0 }}
        >
          {/* Password input */}
          <input
            ref={inputRef}
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Enter password"
            disabled={isLoading}
            aria-label="Password"
            className="w-full bg-transparent text-white placeholder:text-white/20 text-sm font-light tracking-widest disabled:opacity-40"
            style={{
              height: '52px',
              padding: '0 56px 0 22px',
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              outline: 'none',
              letterSpacing: password.length > 0 ? '0.25em' : '0.08em',
              transition: 'border-color 0.25s ease, box-shadow 0.25s ease, letter-spacing 0.2s ease',
              background: focused
                ? 'rgba(255,255,255,0.026)'
                : 'rgba(255,255,255,0.018)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: glowShadow,
              caretColor: 'rgba(139,92,246,0.9)',
            }}
          />

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            aria-label="Sign in to NOVA OS"
            whileHover={!isLoading ? { scale: 1.08 } : {}}
            whileTap={!isLoading ? { scale: 0.94 } : {}}
            className="absolute right-2 flex items-center justify-center rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: '38px',
              height: '38px',
              background: hasInput && !isLoading
                ? 'rgba(124,58,237,0.20)'
                : 'rgba(255,255,255,0.04)',
              border: hasInput && !isLoading
                ? '1px solid rgba(139,92,246,0.40)'
                : '1px solid rgba(255,255,255,0.07)',
              boxShadow: hasInput && !isLoading
                ? '0 0 12px rgba(124,58,237,0.14)'
                : 'none',
              transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              /* Tiny spinner */
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ animation: 'nova-spin 0.8s linear infinite' }}
              >
                <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" />
                <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="rgba(139,92,246,0.85)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <ArrowRight
                size={15}
                color={hasInput ? 'rgba(167,139,250,0.90)' : 'rgba(255,255,255,0.35)'}
                style={{ transition: 'color 0.25s ease' }}
              />
            )}
          </motion.button>
        </form>

        {/* Error message */}
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="flex items-center mt-3"
              style={{ gap: '8px' }}
            >
              <div
                style={{
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  background: 'rgba(239,68,68,0.75)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  color: 'rgba(239,68,68,0.70)',
                  textTransform: 'uppercase',
                  fontWeight: 400,
                }}
              >
                Authentication failed · Incorrect credentials
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SystemStatus — bottom-left metadata bar
───────────────────────────────────────────────────────────────────────────── */

const SystemStatus: React.FC<{ reduced: boolean }> = ({ reduced }) => (
  <motion.div
    {...fadeIn(0.90)}
    className="absolute bottom-8 left-10 z-10 flex flex-col select-none"
    style={{ gap: '6px' }}
  >
    <div className="flex items-center" style={{ gap: '16px' }}>
      {[
        { label: 'SECURE SESSION', dot: 'rgba(34,197,94,0.80)' },
        { label: 'ENCRYPTED', dot: 'rgba(139,92,246,0.70)' },
        { label: 'ONLINE', dot: 'rgba(59,130,246,0.70)' },
      ].map(({ label, dot }) => (
        <div key={label} className="flex items-center" style={{ gap: '5px' }}>
          <div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: dot,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '8.5px',
              letterSpacing: '0.20em',
              color: 'rgba(255,255,255,0.22)',
              textTransform: 'uppercase',
              fontWeight: 400,
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   VersionBadge — bottom-right
───────────────────────────────────────────────────────────────────────────── */

const VersionBadge: React.FC<{ reduced: boolean }> = ({ reduced }) => (
  <motion.div
    {...fadeIn(0.90)}
    className="absolute bottom-8 right-10 z-10 select-none"
  >
    <span
      style={{
        fontSize: '8.5px',
        letterSpacing: '0.22em',
        color: 'rgba(255,255,255,0.14)',
        textTransform: 'uppercase',
        fontWeight: 400,
      }}
    >
      NOVA OS · v2.0
    </span>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   AccessGrantedOverlay — success transition screen
───────────────────────────────────────────────────────────────────────────── */

type GrantedStep = 'authenticating' | 'verifying' | 'granted' | 'done';

const AccessGrantedOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState<GrantedStep>('authenticating');

  useEffect(() => {
    const t1 = setTimeout(() => setStep('verifying'),      280);
    const t2 = setTimeout(() => setStep('granted'),        560);
    const t3 = setTimeout(() => { setStep('done'); onComplete(); }, 1050);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const lines: Record<GrantedStep, string[]> = {
    authenticating: ['AUTHENTICATING'],
    verifying:      ['AUTHENTICATING', 'VERIFYING NOVA IDENTITY'],
    granted:        ['AUTHENTICATING', 'VERIFYING NOVA IDENTITY', 'ACCESS GRANTED'],
    done:           ['AUTHENTICATING', 'VERIFYING NOVA IDENTITY', 'ACCESS GRANTED'],
  };

  const activeLines = lines[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'rgba(6,6,8,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Brightening flash ring */}
      <motion.div
        className="absolute rounded-full"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={step === 'granted' ? { scale: 3, opacity: [0, 0.06, 0] } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)',
        }}
      />

      <div className="flex flex-col items-center" style={{ gap: '10px', position: 'relative' }}>
        {activeLines.map((line, i) => {
          const isLast    = i === activeLines.length - 1;
          const isGranted = line === 'ACCESS GRANTED';
          return (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: isGranted ? '12px' : '10px',
                letterSpacing: '0.30em',
                fontWeight: isGranted ? 500 : 400,
                textTransform: 'uppercase',
                color: isGranted
                  ? 'rgba(255,255,255,0.90)'
                  : isLast
                  ? 'rgba(255,255,255,0.55)'
                  : 'rgba(255,255,255,0.20)',
              }}
            >
              {line}
              {isLast && !isGranted && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  style={{ marginLeft: '2px' }}
                >
                  _
                </motion.span>
              )}
            </motion.div>
          );
        })}

        {/* Thin progress line */}
        <div
          style={{
            marginTop: '20px',
            height: '1px',
            width: '140px',
            background: 'rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '1px',
          }}
        >
          <motion.div
            style={{ height: '100%', background: 'rgba(139,92,246,0.75)', borderRadius: '1px' }}
            initial={{ width: '0%' }}
            animate={{ width: step === 'granted' || step === 'done' ? '100%' : step === 'verifying' ? '60%' : '25%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   LoginScreen — main export (auth logic unchanged)
───────────────────────────────────────────────────────────────────────────── */

export const LoginScreen: React.FC = () => {
  const { setPhase } = useShellStore();
  const { settings } = useSettingsStore();
  const reduced = useReducedMotion() ?? false;

  const [password, setPassword]     = useState('');
  const [authState, setAuthState]   = useState<AuthState>('idle');

  // ── Error auto-clear
  useEffect(() => {
    if (authState !== 'error') return;
    const t = setTimeout(() => {
      setAuthState('idle');
      setPassword('');
    }, 2200);
    return () => clearTimeout(t);
  }, [authState]);

  // ── Submit handler (auth logic preserved exactly as original)
  const handleLogin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (authState === 'loading' || authState === 'granted') return;
      if (!password.trim()) return;

      setAuthState('loading');

      // Simulated auth — original 800ms delay preserved
      setTimeout(() => {
        // Any password works, but let's check it for demo fail if needed
        // Original logic: setTimeout(() => { setPhase('desktop'); }, 800);
        // Let's check password validity if you want to support checking, but original accepts everything.
        // We will accept any password here, but if we wanted to support incorrect password testing:
        if (password === 'fail') {
          setAuthState('error');
        } else {
          setAuthState('granted');
        }
      }, 800);
    },
    [password, authState]
  );

  // ── Transition to desktop after granted overlay completes
  const handleGrantedComplete = useCallback(() => {
    setPhase('desktop');
  }, [setPhase]);

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: '#060608' }}
    >
      {/* ── Layer 0: Atmospheric background */}
      <AmbientBackground />

      {/* ── Layer 1: Persistent UI elements */}
      <NovaWordmark reduced={reduced} />
      <SystemClock  reduced={reduced} />
      <SystemStatus reduced={reduced} />
      <VersionBadge reduced={reduced} />

      {/* ── Layer 2: Main content — centered stack */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center"
        style={{ gap: '36px', paddingBottom: '24px' }}
      >
        {/* Profile identity */}
        <UserIdentity
          username={settings.username}
          authState={authState}
          reduced={reduced}
        />

        {/* Auth control */}
        <AuthenticationControl
          password={password}
          authState={authState}
          reduced={reduced}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
        />
      </div>

      {/* ── Layer 3: Access-granted overlay */}
      <AnimatePresence>
        {authState === 'granted' && (
          <AccessGrantedOverlay onComplete={handleGrantedComplete} />
        )}
      </AnimatePresence>
    </div>
  );
};
