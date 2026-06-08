// ===== Shared helpers, icons, and seed data =====
const { useState, useEffect, useRef, useCallback } = React;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAYS_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const PHOTOS = ['photo-1','photo-2','photo-3','photo-4','photo-5','photo-6'];

const dk = (y, m, d) => `${y}-${m}-${d}`;          // dateKey
const uid = () => Math.random().toString(36).slice(2, 9);

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstWeekday(y, m) { return new Date(y, m, 1).getDay(); }

// Today is fixed to the project "current date": 2026-06-08
const TODAY = { y: 2026, m: 5, d: 8 };

function makeTodos(items){ return items.map(([text, done]) => ({ id: uid(), text, done })); }

// Seed entries for June 2026 — tasteful, not filler-heavy
const SEED = {
  [dk(2026,5,3)]: {
    photo: 'assets/photo-2.png', fit: 'cover',
    memo: '아침 시장에 들렀다. 토마토가 유난히 붉었다.',
    todos: makeTodos([['장보기', true], ['빨래 널기', true], ['저녁 산책', false]]),
  },
  [dk(2026,5,6)]: {
    photo: null, fit: 'cover',
    memo: '비. 하루 종일 빗소리.',
    todos: makeTodos([['우산 챙기기', true]]),
  },
  [dk(2026,5,8)]: {
    photo: 'assets/photo-1.png', fit: 'cover',
    memo: '',
    todos: makeTodos([['노을 사진 정리', true], ['일기 쓰기', false], ['책 30p 읽기', false]]),
  },
  [dk(2026,5,12)]: {
    photo: 'assets/photo-5.png', fit: 'contain',
    memo: '카페 창가 자리. 빛이 좋았다.',
    todos: makeTodos([['원고 마감', true], ['이메일 정리', true]]),
  },
  [dk(2026,5,14)]: {
    photo: 'assets/photo-3.png', fit: 'cover',
    memo: '오랜만에 다 비웠다.',
    todos: makeTodos([['청소', true], ['화분 물주기', true], ['편지 부치기', true]]),
  },
  [dk(2026,5,20)]: {
    photo: 'assets/photo-6.png', fit: 'cover',
    memo: '',
    todos: makeTodos([['전시 보러 가기', false], ['도시락 싸기', true]]),
  },
  [dk(2026,5,22)]: {
    photo: null, fit: 'cover',
    memo: '아무것도 하지 않은 날. 그래도 괜찮았다.',
    todos: [],
  },
  [dk(2026,5,25)]: {
    photo: 'assets/photo-4.png', fit: 'cover',
    memo: '바다. 모래가 따뜻했다.',
    todos: makeTodos([['짐 싸기', true], ['숙소 체크인', true], ['일출 보기', false], ['엽서 쓰기', false]]),
  },
};

function loadEntries(){
  try {
    const raw = localStorage.getItem('pd_entries');
    if (raw) return JSON.parse(raw);
  } catch(e){}
  return JSON.parse(JSON.stringify(SEED));
}
function saveEntries(e){
  try { localStorage.setItem('pd_entries', JSON.stringify(e)); } catch(err){}
}

function progressOf(entry){
  if (!entry || !entry.todos || entry.todos.length === 0) return null;
  const done = entry.todos.filter(t => t.done).length;
  return { done, total: entry.todos.length, all: done === entry.todos.length };
}

// ---- Inline icons (stroke = currentColor) ----
const Icon = {
  cal: (p) => (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.4" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      <circle cx="8" cy="13" r="1.1" fill="currentColor"/><circle cx="12" cy="13" r="1.1" fill="currentColor"/><circle cx="16" cy="13" r="1.1" fill="currentColor"/>
    </svg>
  ),
  chevL: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  chevR: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  arrowL: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  plus: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>),
  trash: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M4 7h16M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M6.5 7l.8 12a1.6 1.6 0 001.6 1.5h6.2a1.6 1.6 0 001.6-1.5L17.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  photo: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><rect x="3" y="5" width="18" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.7"/><circle cx="8.5" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.5"/><path d="M4 17l4.5-4 3.5 3 3-2.5L20 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  swap: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M4 8h12l-3-3M20 16H8l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  grip: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><g fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></g></svg>),
  sun: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>),
  moon: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M20 14.5A8 8 0 119.5 4a6.3 6.3 0 0010.5 10.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>),
  note: (p) => (<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M6 3.5h12a1.5 1.5 0 011.5 1.5v14a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 19V5A1.5 1.5 0 016 3.5z" stroke="currentColor" strokeWidth="1.6"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
};

window.PD = { useState, useEffect, useRef, useCallback, WEEKDAYS, WEEKDAYS_FULL, PHOTOS, dk, uid, daysInMonth, firstWeekday, TODAY, loadEntries, saveEntries, progressOf, Icon };
