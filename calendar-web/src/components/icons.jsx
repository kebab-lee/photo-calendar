// design-ref/Auth.jsx 아이콘 이식(라인 아이콘, currentColor).
export function Cal(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8" cy="13" r="1.1" fill="currentColor" />
      <circle cx="12" cy="13" r="1.1" fill="currentColor" />
      <circle cx="16" cy="13" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function Check(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Warn(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M12 8.5v5M12 16.8v.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function Sun(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function Moon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M20 14.5A8 8 0 119.5 4a6.3 6.3 0 0010.5 10.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M14 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 12h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Photo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8.5" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 17l4.5-4 3.5 3 3-2.5L20 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Note(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M6 3.5h12a1.5 1.5 0 011.5 1.5v14a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 19V5A1.5 1.5 0 016 3.5z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Plus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Trash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M6.5 7l.8 12a1.6 1.6 0 001.6 1.5h6.2a1.6 1.6 0 001.6-1.5L17.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Grip(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <g fill="currentColor">
        <circle cx="9" cy="6" r="1.4" />
        <circle cx="15" cy="6" r="1.4" />
        <circle cx="9" cy="12" r="1.4" />
        <circle cx="15" cy="12" r="1.4" />
        <circle cx="9" cy="18" r="1.4" />
        <circle cx="15" cy="18" r="1.4" />
      </g>
    </svg>
  );
}
