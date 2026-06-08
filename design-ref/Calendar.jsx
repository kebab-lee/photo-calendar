// ===== Monthly calendar view =====
const { WEEKDAYS, dk, daysInMonth, firstWeekday, TODAY, progressOf, Icon } = window.PD;

(function injectCalCSS() {
  if (document.getElementById('cal-css')) return;
  const s = document.createElement('style');s.id = 'cal-css';
  s.textContent = `
  .cal-wrap{ max-width:1180px; margin:0 auto; padding:clamp(20px,4vw,56px) clamp(16px,4vw,48px) 80px; }
  @media (prefers-reduced-motion:no-preference){ .cal-wrap{ animation:floatIn .6s ease both; } }
  .cal-brand{ display:flex; align-items:center; gap:9px; color:var(--terra); font-weight:700; font-size:clamp(15px,1.6vw,18px); letter-spacing:.01em; }
  .cal-brand svg{ font-size:1.45em; }
  .cal-head{ display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-top:clamp(20px,3vw,38px); flex-wrap:wrap; }
  .cal-title .yr{ font-size:clamp(13px,1.3vw,15px); color:var(--ink-faint); font-weight:600; letter-spacing:.16em; }
  .cal-title .mo{ font-family:var(--serif); font-weight:700; font-size:clamp(42px,6vw,74px); line-height:.95; margin-top:4px; letter-spacing:-.01em; white-space:nowrap; }
  .cal-title{ flex:none; }
  .cal-ctrls{ display:flex; align-items:center; gap:8px; }
  .pill{ height:44px; border-radius:13px; border:1px solid var(--line); background:var(--card); color:var(--ink-soft); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); transition:transform .15s, background .2s, color .2s, border-color .2s; }
  .pill:hover{ background:var(--card-2); color:var(--ink); transform:translateY(-1px); }
  .pill:active{ transform:translateY(0); }
  .pill.txt{ padding:0 17px; font-size:14px; font-weight:600; }
  .pill.sq{ width:44px; }
  .pill.theme svg{ font-size:1.15em; }

  .week-row{ display:grid; grid-template-columns:repeat(7,1fr); gap:clamp(4px,0.5vw,7px); margin-top:clamp(20px,2.5vw,34px); }
  .week-row .wd{ text-align:left; padding:11px 4px 11px 12px; font-size:clamp(12px,1.2vw,14px); font-weight:600; color:var(--ink-faint); letter-spacing:.06em; border-radius:11px; background:var(--card-2); }
  .week-row .wd.sun{ color:var(--sun); }
  .week-row .wd.sat{ color:var(--sat); }

  .grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:clamp(4px,0.5vw,7px); margin-top:clamp(8px,1vw,12px); }
  .cell{ position:relative; aspect-ratio:1/1; border-radius:16px; overflow:hidden; border:1px solid var(--line-soft); background:var(--card); box-shadow:var(--shadow-sm); cursor:pointer; transition:transform .18s cubic-bezier(.2,.8,.3,1), box-shadow .2s, border-color .2s; }
  @media (prefers-reduced-motion:no-preference){ .cell{ animation:floatIn .5s ease both; } }
  .cell.blank{ background:transparent; border:none; box-shadow:none; cursor:default; pointer-events:none; }
  .cell:not(.blank):hover{ transform:translateY(-3px); box-shadow:var(--shadow-md); }
  .cell.has-photo{ background:#1c1714; }
  .cell.today{ border:2px solid var(--terra); box-shadow:0 0 0 4px var(--terra-soft), var(--shadow-md); }

  .cell .ph{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .cell .ph-shade{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(20,14,10,.42) 0%, rgba(20,14,10,0) 32%, rgba(20,14,10,0) 55%, rgba(20,14,10,.5) 100%); }

  .cell .num{ position:absolute; top:9px; left:11px; font-family:var(--serif); font-weight:700; font-size:clamp(15px,1.7vw,21px); line-height:1; color:var(--ink); }
  .cell.sun .num{ color:var(--sun); } .cell.sat .num{ color:var(--sat); }
  .cell.has-photo .num{ color:#fdf7ee; text-shadow:0 1px 6px rgba(0,0,0,.5); }

  .cell .prog{ position:absolute; left:10px; bottom:9px; display:flex; align-items:center; gap:3px; font-size:clamp(11px,1.15vw,13px); font-weight:600; color:var(--terra); }
  .cell .prog svg{ font-size:1.05em; }
  .cell .prog.done{ color:var(--terra); }
  .cell.has-photo .prog{ color:#fdf7ee; text-shadow:0 1px 5px rgba(0,0,0,.55); }
  .cell .prog .frac{ font-variant-numeric:tabular-nums; }

  .cell .memo-dot{ position:absolute; top:11px; right:11px; width:7px; height:7px; border-radius:50%; background:var(--terra); box-shadow:0 0 0 3px var(--terra-soft); }
  .cell.has-photo .memo-dot{ background:#fdf7ee; box-shadow:0 1px 4px rgba(0,0,0,.5); }

  @media (max-width:640px){
    .cell{ border-radius:13px; }
    .cell .num{ top:6px; left:8px; }
    .cell .prog{ left:7px; bottom:6px; }
    .cell .prog svg{ display:none; }
    .cell .memo-dot{ top:7px; right:7px; width:6px; height:6px; }
    .week-row .wd{ text-align:center; padding:9px 0; }
    .cal-ctrls .pill.txt{ padding:0 13px; }
  }
  `;
  document.head.appendChild(s);
})();

function Cell({ y, m, day, entry, weekday, isToday, onOpen, delay }) {
  const prog = progressOf(entry);
  const hasPhoto = !!(entry && entry.photo);
  const hasMemo = !!(entry && entry.memo && entry.memo.trim());
  const cls = ['cell'];
  if (hasPhoto) cls.push('has-photo');
  if (isToday) cls.push('today');
  if (weekday === 0) cls.push('sun');
  if (weekday === 6) cls.push('sat');
  return (
    <div className={cls.join(' ')} style={{ animationDelay: delay + 'ms' }} onClick={() => onOpen(day)} role="button" aria-label={`${m + 1}월 ${day}일`}>
      {hasPhoto && <img className="ph" src={entry.photo} alt="" style={{ objectFit: entry.fit === 'contain' ? 'contain' : 'cover', background: entry.fit === 'contain' ? '#1c1714' : 'transparent' }} />}
      {hasPhoto && <div className="ph-shade" />}
      <span className="num">{day}</span>
      {hasMemo && <span className="memo-dot" title="메모 있음" style={{ fontSize: "32px" }} />}
      {prog &&
      <span className={'prog' + (prog.all ? ' done' : '')}>
          <Icon.check /><span className="frac">{prog.done}/{prog.total}</span>
        </span>
      }
    </div>);

}

function Calendar({ year, month, entries, theme, onToggleTheme, onPrev, onNext, onToday, onOpenDay }) {
  const lead = firstWeekday(year, month);
  const total = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(<div key={'b' + i} className="cell blank" />);
  for (let d = 1; d <= total; d++) {
    const wd = (lead + d - 1) % 7;
    const entry = entries[dk(year, month, d)];
    const isToday = year === TODAY.y && month === TODAY.m && d === TODAY.d;
    cells.push(
      <Cell key={d} y={year} m={month} day={d} entry={entry} weekday={wd} isToday={isToday}
      onOpen={onOpenDay} delay={Math.min((lead + d) * 14, 360)} />
    );
  }
  return (
    <div className="cal-wrap">
      <div className="cal-brand"><Icon.cal /> 나의 포토 다이어리</div>
      <div className="cal-head">
        <div className="cal-title">
          <div className="yr">{year}</div>
          <div className="mo serif">{month + 1}월</div>
        </div>
        <div className="cal-ctrls">
          <button className="pill txt" onClick={onToday}>오늘</button>
          <button className="pill sq" onClick={onPrev} aria-label="이전 달"><Icon.chevL /></button>
          <button className="pill sq" onClick={onNext} aria-label="다음 달"><Icon.chevR /></button>
          <button className="pill sq theme" onClick={onToggleTheme} aria-label="테마 전환">{theme === 'dark' ? <Icon.sun /> : <Icon.moon />}</button>
        </div>
      </div>
      <div className="week-row">
        {WEEKDAYS.map((w, i) =>
        <div key={w} className={'wd' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '')}>{w}</div>
        )}
      </div>
      <div className="grid">{cells}</div>
    </div>);

}

window.Calendar = Calendar;