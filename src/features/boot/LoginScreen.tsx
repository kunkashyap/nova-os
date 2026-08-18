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
  initial: { opacity: 0, y: reduced ? 0 : 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay } },
  exit:    { opacity: 0, y: reduced ? 0 : -6, transition: { duration: 0.25 } },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const, delay } },
  exit:    { opacity: 0, transition: { duration: 0.3 } },
});

const shakeVariant = {
  idle:  { x: 0 },
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.50, ease: 'easeInOut' as const } },
};

/* ─────────────────────────────────────────────────────────────────────────────
   VoidBackground — pure monochrome, no ambient orbs
───────────────────────────────────────────────────────────────────────────── */

const VoidBackground: React.FC = () => (
  <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
    {/* Base — near-black */}
    <div className="absolute inset-0" style={{ background: '#080808' }} />

    {/* Very subtle radial vignette — depth without color */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255,255,255,0.012) 0%, transparent 70%)',
      }}
    />

    {/* Grain texture */}
    <div className="void-grain" />
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   NovaWordmark — top-left OS identity
───────────────────────────────────────────────────────────────────────────── */

const NovaWordmark: React.FC<{ reduced: boolean }> = ({ reduced }) => (
  <motion.div
    {...fadeIn(0.10)}
    className="absolute top-8 left-10 z-10 flex flex-col select-none"
    style={{ gap: '3px' }}
  >
    <div className="flex items-baseline" style={{ gap: '0px' }}>
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.80)',
          textTransform: 'uppercase',
        }}
      >
        NOVA
      </span>
    </div>
    <span
      style={{
        fontSize: '8px',
        letterSpacing: '0.24em',
        color: 'rgba(255,255,255,0.18)',
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
      {...fadeIn(0.20)}
      className="absolute top-8 right-10 z-10 flex flex-col items-end select-none"
    >
      <div className="flex items-baseline" style={{ gap: '4px' }}>
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '30px',
            fontWeight: 200,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          {hours}:{minutes}
        </span>
        {period && (
          <span
            style={{
              fontSize: '9px',
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.10em',
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
          fontSize: '8px',
          letterSpacing: '0.20em',
          color: 'rgba(255,255,255,0.18)',
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
   NovaAvatarMark — monochrome geometric identity mark
───────────────────────────────────────────────────────────────────────────── */

const NovaAvatarMark: React.FC<{ authState: AuthState }> = ({ authState }) => {
  const isError   = authState === 'error';
  const isGranted = authState === 'granted';

  const ringColor = isError
    ? 'rgba(239,68,68,0.45)'
    : isGranted
    ? 'rgba(255,255,255,0.35)'
    : 'rgba(255,255,255,0.12)';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 96, height: 96 }}
    >
      {/* Static ring — no animation */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${ringColor}`,
          transition: 'border-color 0.35s ease',
        }}
      />

      {/* Inner surface */}
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          inset: '4px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Geometric VOID sigil — monochrome */}
        <svg width="42" height="42" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer hex */}
          <polygon
            points="26,4 45,14.5 45,37.5 26,48 7,37.5 7,14.5"
            stroke={isError ? 'rgba(239,68,68,0.40)' : 'rgba(255,255,255,0.22)'}
            strokeWidth="0.75"
            fill="none"
            style={{ transition: 'stroke 0.35s ease' }}
          />
          {/* Inner hex */}
          <polygon
            points="26,10 40,18 40,34 26,42 12,34 12,18"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="0.6"
            fill="none"
          />
          {/* Center diamond */}
          <polygon
            points="26,18 33,26 26,34 19,26"
            stroke={isError ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.30)'}
            strokeWidth="0.75"
            fill="rgba(255,255,255,0.03)"
            style={{ transition: 'stroke 0.35s ease' }}
          />
          {/* Axis lines */}
          <line x1="26" y1="4"  x2="26" y2="18"  stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          <line x1="26" y1="34" x2="26" y2="48"   stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          <line x1="7"  y1="26" x2="19" y2="26"   stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          <line x1="33" y1="26" x2="45" y2="26"   stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          {/* Center dot */}
          <circle
            cx="26" cy="26" r="1.5"
            fill={isError ? 'rgba(239,68,68,0.70)' : 'rgba(255,255,255,0.60)'}
            style={{ transition: 'fill 0.35s ease' }}
          />
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
  <motion.div {...fadeUp(0.30, reduced)} className="flex flex-col items-center z-10" style={{ gap: 0 }}>
    <NovaAvatarMark authState={authState} />

    <div className="flex flex-col items-center mt-5" style={{ gap: '5px' }}>
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          letterSpacing: '0.16em',
          color: 'rgba(255,255,255,0.80)',
          textTransform: 'uppercase',
          userSelect: 'none',
        }}
      >
        {username}
      </span>
      <span
        style={{
          fontSize: '9px',
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.22)',
          textTransform: 'uppercase',
          fontWeight: 400,
        }}
      >
        {authState === 'granted' ? 'ACCESS GRANTED' : 'ENTER PASSWORD'}
      </span>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   AuthenticationControl — floating password input
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

  const borderColor = isError
    ? focused ? 'rgba(239,68,68,0.60)' : 'rgba(239,68,68,0.35)'
    : focused
    ? 'rgba(255,255,255,0.30)'
    : 'rgba(255,255,255,0.09)';

  const boxShadow = isError
    ? focused ? '0 0 0 1px rgba(239,68,68,0.15)' : 'none'
    : focused
    ? '0 0 0 1px rgba(255,255,255,0.08)'
    : 'none';

  return (
    <motion.div
      {...fadeUp(0.55, reduced)}
      className="z-10 w-full"
      style={{ maxWidth: '320px' }}
    >
      <motion.div
        variants={shakeVariant}
        animate={isError ? 'shake' : 'idle'}
      >
        <form
          onSubmit={onSubmit}
          className="relative flex items-center"
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
            placeholder="Password"
            disabled={isLoading}
            aria-label="Password"
            className="w-full disabled:opacity-40"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              height: '48px',
              padding: '0 52px 0 18px',
              border: `1px solid ${borderColor}`,
              borderRadius: '10px',
              outline: 'none',
              letterSpacing: hasInput ? '0.22em' : '0.06em',
              transition: 'border-color 0.20s ease, box-shadow 0.20s ease, letter-spacing 0.18s ease',
              background: focused ? 'rgba(255,255,255,0.030)' : 'rgba(255,255,255,0.020)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow,
              caretColor: 'rgba(255,255,255,0.80)',
              color: 'rgba(255,255,255,0.90)',
            }}
          />

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            aria-label="Sign in"
            whileHover={!isLoading ? { scale: 1.08 } : {}}
            whileTap={!isLoading ? { scale: 0.92 } : {}}
            className="absolute right-2 flex items-center justify-center rounded-[7px] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: '36px',
              height: '36px',
              background: hasInput && !isLoading
                ? 'rgba(255,255,255,0.10)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hasInput && !isLoading ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'background 0.20s ease, border-color 0.20s ease',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ animation: 'void-spin 0.75s linear infinite' }}
              >
                <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="rgba(255,255,255,0.70)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <ArrowRight
                size={14}
                color={hasInput ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.30)'}
                style={{ transition: 'color 0.20s ease' }}
              />
            )}
          </motion.button>
        </form>

        {/* Error message */}
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.20 } }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              className="flex items-center mt-3"
              style={{ gap: '7px' }}
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
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '9.5px',
                  letterSpacing: '0.12em',
                  color: 'rgba(239,68,68,0.70)',
                  textTransform: 'uppercase',
                  fontWeight: 400,
                }}
              >
                Incorrect credentials
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   VersionBadge — bottom-right
───────────────────────────────────────────────────────────────────────────── */

const VersionBadge: React.FC<{ reduced: boolean }> = ({ reduced }) => (
  <motion.div
    {...fadeIn(0.80)}
    className="absolute bottom-8 right-10 z-10 select-none"
  >
    <span
      style={{
        fontSize: '8px',
        letterSpacing: '0.20em',
        color: 'rgba(255,255,255,0.12)',
        textTransform: 'uppercase',
        fontWeight: 400,
      }}
    >
      NOVA OS · VOID
    </span>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   AccessGrantedOverlay — monochrome success transition
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
    verifying:      ['AUTHENTICATING', 'VERIFYING IDENTITY'],
    granted:        ['AUTHENTICATING', 'VERIFYING IDENTITY', 'ACCESS GRANTED'],
    done:           ['AUTHENTICATING', 'VERIFYING IDENTITY', 'ACCESS GRANTED'],
  };

  const activeLines = lines[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeIn' } }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'rgba(5,5,5,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex flex-col items-center" style={{ gap: '10px', position: 'relative' }}>
        {activeLines.map((line, i) => {
          const isLast    = i === activeLines.length - 1;
          const isGranted = line === 'ACCESS GRANTED';
          return (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: isGranted ? '11px' : '9.5px',
                letterSpacing: '0.28em',
                fontWeight: isGranted ? 500 : 400,
                textTransform: 'uppercase',
                color: isGranted
                  ? 'rgba(255,255,255,0.90)'
                  : isLast
                  ? 'rgba(255,255,255,0.50)'
                  : 'rgba(255,255,255,0.18)',
              }}
            >
              {line}
              {isLast && !isGranted && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.65, repeat: Infinity }}
                  style={{ marginLeft: '2px' }}
                >
                  _
                </motion.span>
              )}
            </motion.div>
          );
        })}

        {/* Thin progress bar — monochrome */}
        <div
          style={{
            marginTop: '18px',
            height: '1px',
            width: '120px',
            background: 'rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '1px',
          }}
        >
          <motion.div
            style={{ height: '100%', background: 'rgba(255,255,255,0.55)', borderRadius: '1px' }}
            initial={{ width: '0%' }}
            animate={{ width: step === 'granted' || step === 'done' ? '100%' : step === 'verifying' ? '60%' : '25%' }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
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

      setTimeout(() => {
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
    >
      {/* ── Layer 0: VOID background */}
      <VoidBackground />

      {/* ── Layer 1: Persistent UI elements */}
      <NovaWordmark reduced={reduced} />
      <SystemClock  reduced={reduced} />
      <VersionBadge reduced={reduced} />

      {/* ── Layer 2: Main content — centered stack */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center"
        style={{ gap: '32px', paddingBottom: '24px' }}
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
