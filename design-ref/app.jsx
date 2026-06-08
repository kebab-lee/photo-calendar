// ===== App: routing, transition, theme, persistence =====
const { useState, useEffect, dk, loadEntries, saveEntries, TODAY } = window.PD;

(function injectAppCSS() {
  if (document.getElementById('app-css')) return;
  const s = document.createElement('style');s.id = 'app-css';
  s.textContent = `
  .stage{ position:relative; min-height:100vh; }
  .detail-layer{ position:fixed; inset:0; z-index:50; background:var(--bg); }
  .detail-layer.enter{ }
  .detail-layer.leave{ animation:pushOut .3s cubic-bezier(.4,0,.6,1) both; }
  @keyframes pushOut{ from{ transform:none; opacity:1; } to{ transform:translateY(12px); opacity:0; } }
  @media (prefers-reduced-motion:reduce){ .detail-layer.enter,.detail-layer.leave{ animation:none; } }
  `;
  document.head.appendChild(s);
})();

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pd_theme') || 'light');
  const [year, setYear] = useState(TODAY.y);
  const [month, setMonth] = useState(TODAY.m);
  const [entries, setEntries] = useState(loadEntries);
  const [detailDay, setDetailDay] = useState(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {document.documentElement.setAttribute('data-theme', theme);localStorage.setItem('pd_theme', theme);}, [theme]);
  useEffect(() => {saveEntries(entries);}, [entries]);

  const prev = () => {setMonth((m) => {if (m === 0) {setYear((y) => y - 1);return 11;}return m - 1;});};
  const next = () => {setMonth((m) => {if (m === 11) {setYear((y) => y + 1);return 0;}return m + 1;});};
  const goToday = () => {setYear(TODAY.y);setMonth(TODAY.m);};

  const openDay = (d) => {setDetailDay(d);setLeaving(false);};
  const closeDay = () => {
    setLeaving(true);
    setTimeout(() => {setDetailDay(null);setLeaving(false);}, 320);
  };

  const onEntryChange = (newEntry) => {
    const key = dk(year, month, detailDay);
    setEntries((prevE) => ({ ...prevE, [key]: newEntry }));
  };

  const detailEntry = detailDay != null ? entries[dk(year, month, detailDay)] : null;
  const detailWeekday = detailDay != null ? new Date(year, month, detailDay).getDay() : 0;

  return (
    <div className="stage" style={{ fontSize: "16px" }}>
      <Calendar
        year={year} month={month} entries={entries} theme={theme}
        onToggleTheme={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
        onPrev={prev} onNext={next} onToday={goToday} onOpenDay={openDay} />
      
      {detailDay != null &&
      <div className={'detail-layer ' + (leaving ? 'leave' : 'enter')}>
          <DetailView
          year={year} month={month} day={detailDay} weekday={detailWeekday}
          entry={detailEntry} onBack={closeDay} onChange={onEntryChange} />
        
        </div>
      }
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);