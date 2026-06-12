import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getMonthlySummary } from '../api/entries.js';
import { useAuth } from '../auth/context.js';
import { Cal, Check, ChevronLeft, ChevronRight, Logout, Moon, Sun } from '../components/icons.jsx';
import { useTheme } from '../hooks/useTheme.js';
import {
  WEEKDAYS,
  dateStr,
  daysInMonth,
  firstWeekday,
  monthParam,
  progressOf,
  todayParts,
} from '../lib/calendar.js';
import './CalendarPage.css';

function Cell({ m, day, date, weekday, item, isToday, onOpen, delay }) {
  const prog = progressOf(item);
  const hasPhoto = !!(item && item.thumbUrl);
  const hasMemo = !!(item && item.hasComment);
  const cls = ['cell'];
  if (hasPhoto) cls.push('has-photo');
  if (isToday) cls.push('today');
  if (weekday === 0) cls.push('sun');
  if (weekday === 6) cls.push('sat');

  return (
    <div
      className={cls.join(' ')}
      style={{ animationDelay: delay + 'ms' }}
      onClick={() => onOpen(date)}
      data-date={date}
      role="button"
      aria-label={`${m + 1}월 ${day}일`}
    >
      {hasPhoto && (
        <img
          className="ph"
          src={item.thumbUrl}
          alt=""
          style={{
            objectFit: item.fit === 'contain' ? 'contain' : 'cover',
            background: item.fit === 'contain' ? '#1c1714' : 'transparent',
          }}
        />
      )}
      {hasPhoto && <div className="ph-shade" />}
      <span className="num">{day}</span>
      {hasMemo && <span className="memo-dot" title="메모 있음" />}
      {prog && (
        <span className={'prog' + (prog.all ? ' done' : '')}>
          <Check />
          <span className="frac">
            {prog.done}/{prog.total}
          </span>
        </span>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [today] = useState(todayParts);
  const [year, setYear] = useState(today.y);
  const [month, setMonth] = useState(today.m);
  const [byDay, setByDay] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const list = await getMonthlySummary(monthParam(year, month));
        if (cancelled) return;
        const map = {};
        for (const it of list) {
          map[Number(it.date.slice(8, 10))] = it;
        }
        setByDay(map);
      } catch {
        if (!cancelled) setError('달력을 불러오지 못했어요.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const prev = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const next = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };
  const goToday = () => {
    setYear(today.y);
    setMonth(today.m);
  };
  const openDay = useCallback((date) => navigate('/entries/' + date), [navigate]);

  // 스와이프로 달 이동: 가로 제스처일 때만 grid를 따라 움직이고, 임계값을 넘으면 prev/next 호출
  const gridRef = useRef(null);
  const swipeRef = useRef({ x: 0, y: 0, dx: 0, active: false, horiz: null });
  const wheelRef = useRef({ dx: 0, lockUntil: 0 });
  const SWIPE_THRESHOLD = 60;

  const onTouchStart = (e) => {
    const t = e.touches[0];
    swipeRef.current = { x: t.clientX, y: t.clientY, dx: 0, active: true, horiz: null };
    if (gridRef.current) gridRef.current.style.transition = 'none';
  };
  const onTouchMove = (e) => {
    const s = swipeRef.current;
    if (!s.active) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (s.horiz === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      s.horiz = Math.abs(dx) > Math.abs(dy);
    }
    if (!s.horiz) return;
    s.dx = dx;
    if (gridRef.current) gridRef.current.style.transform = `translateX(${dx * 0.4}px)`;
  };
  const onTouchEnd = () => {
    const s = swipeRef.current;
    if (!s.active) return;
    s.active = false;
    const g = gridRef.current;
    if (g) {
      g.style.transition = 'transform 0.2s ease';
      g.style.transform = '';
    }
    if (s.horiz && Math.abs(s.dx) >= SWIPE_THRESHOLD) {
      if (s.dx < 0) next();
      else prev();
    }
  };
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const w = wheelRef.current;
    const now = Date.now();
    if (now < w.lockUntil) {
      w.dx = 0;
      return;
    }
    w.dx += e.deltaX;
    if (Math.abs(w.dx) >= 120) {
      if (w.dx > 0) next();
      else prev();
      w.dx = 0;
      w.lockUntil = now + 500;
    }
  };

  const lead = firstWeekday(year, month);
  const total = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < lead; i++) {
    cells.push(<div key={'b' + i} className="cell blank" />);
  }
  for (let d = 1; d <= total; d++) {
    const wd = (lead + d - 1) % 7;
    const isToday = year === today.y && month === today.m && d === today.d;
    cells.push(
      <Cell
        key={d}
        m={month}
        day={d}
        date={dateStr(year, month, d)}
        weekday={wd}
        item={byDay[d]}
        isToday={isToday}
        onOpen={openDay}
        delay={Math.min((lead + d) * 14, 360)}
      />,
    );
  }

  return (
    <div className="cal-wrap">
      <div className="cal-brand">
        <Cal /> 나의 포토 다이어리
      </div>
      <div className="cal-head">
        <div className="cal-title">
          <div className="yr">{year}</div>
          <div className="mo serif">{month + 1}월</div>
        </div>
        <div className="cal-ctrls">
          <button className="pill txt" onClick={goToday}>
            오늘
          </button>
          <button className="pill sq" onClick={prev} aria-label="이전 달">
            <ChevronLeft />
          </button>
          <button className="pill sq" onClick={next} aria-label="다음 달">
            <ChevronRight />
          </button>
          <button className="pill sq" onClick={toggle} aria-label="테마 전환">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <button className="pill sq" onClick={logout} aria-label="로그아웃">
            <Logout />
          </button>
        </div>
      </div>
      <div className="week-row">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={'wd' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '')}>
            {w}
          </div>
        ))}
      </div>
      {error ? (
        <div className="cal-status">{error}</div>
      ) : (
        <div
          className={'grid' + (loading ? ' loading' : '')}
          ref={gridRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onWheel={onWheel}
        >
          {cells}
        </div>
      )}
    </div>
  );
}
