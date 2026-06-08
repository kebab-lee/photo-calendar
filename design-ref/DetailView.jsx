// ===== Date detail view =====
const { useState, useRef, WEEKDAYS_FULL, PHOTOS, uid, Icon } = window.PD;

(function injectDetailCSS(){
  if (document.getElementById('detail-css')) return;
  const s = document.createElement('style'); s.id = 'detail-css';
  s.textContent = `
  .dt-scroll{ height:100vh; height:100dvh; overflow-y:auto; }
  .dt-wrap{ max-width:920px; margin:0 auto; padding:clamp(16px,3vw,40px) clamp(16px,4vw,40px) 120px; animation:slideUp .5s cubic-bezier(.2,.8,.3,1) both; }
  /* two-column on wide screens */
  @media (min-width:861px){
    .dt-wrap{ max-width:1160px; }
    .dt-grid{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:clamp(28px,3.5vw,52px); align-items:start; }
    .dt-right{ padding-top:6px; }
    .dt-left .field-label:first-child, .dt-right .field-label:first-child{ margin-top:0; }
  }

  .banner{ position:relative; width:100%; aspect-ratio:24/9; min-height:200px; border-radius:22px; overflow:hidden; background:#19140f; box-shadow:var(--shadow-md); }
  @media (max-width:640px){ .banner{ aspect-ratio:16/11; border-radius:18px; } }
  .banner .bimg{ position:absolute; inset:0; width:100%; height:100%; }
  .banner .bshade{ position:absolute; inset:0; background:linear-gradient(105deg, rgba(15,11,8,.78) 0%, rgba(15,11,8,.32) 30%, rgba(15,11,8,0) 52%); }
  .banner.empty{ background:repeating-linear-gradient(135deg, var(--card) 0 14px, var(--card-2) 14px 28px); }
  .banner .empty-hint{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; color:var(--ink-faint); font-size:14px; font-weight:500; }
  .banner .empty-hint svg{ font-size:30px; opacity:.7; }

  .back-btn{ position:absolute; top:16px; left:16px; width:42px; height:42px; border-radius:50%; border:none; background:rgba(28,20,14,.5); backdrop-filter:blur(8px); color:#fdf7ee; display:flex; align-items:center; justify-content:center; font-size:1.15em; box-shadow:var(--shadow-sm); transition:transform .15s, background .2s; }
  .back-btn:hover{ transform:translateX(-2px); background:rgba(28,20,14,.72); }
  .banner.empty .back-btn{ background:var(--card); color:var(--ink); border:1px solid var(--line); }

  .b-date{ position:absolute; left:clamp(20px,3vw,34px); bottom:clamp(18px,3vw,30px); color:#fdf7ee; text-shadow:0 2px 14px rgba(0,0,0,.5); }
  .banner.empty .b-date{ color:var(--ink); text-shadow:none; }
  .b-date .ym{ font-size:clamp(13px,1.4vw,16px); font-weight:600; letter-spacing:.12em; opacity:.92; }
  .b-date .dl{ display:flex; align-items:baseline; gap:11px; margin-top:4px; white-space:nowrap; }
  .b-date .dl .d{ font-family:var(--serif); font-weight:700; font-size:clamp(48px,8vw,82px); line-height:.9; }
  .b-date .dl .w{ font-family:var(--serif); font-size:clamp(17px,2.2vw,24px); font-weight:500; opacity:.95; }

  .act-row{ display:flex; gap:10px; margin-top:clamp(18px,2.4vw,26px); flex-wrap:wrap; }
  .btn{ height:48px; border-radius:14px; display:inline-flex; align-items:center; gap:8px; padding:0 18px; font-size:14.5px; font-weight:600; border:1px solid var(--line); background:var(--card); color:var(--ink-soft); box-shadow:var(--shadow-sm); transition:transform .15s, background .2s, color .2s, border-color .2s; }
  .btn svg{ font-size:1.2em; }
  .btn:hover{ transform:translateY(-1px); }
  .btn.primary{ background:var(--terra); border-color:var(--terra); color:#fdf7ee; }
  .btn.primary:hover{ background:var(--terra-deep); }
  .btn.ghost:hover{ background:var(--card-2); color:var(--ink); }

  .radio-row{ display:flex; gap:26px; margin-top:20px; }
  .radio{ display:flex; align-items:center; gap:9px; cursor:pointer; font-size:14.5px; color:var(--ink-soft); font-weight:500; user-select:none; transition:color .2s; }
  .radio.on{ color:var(--ink); font-weight:600; }
  .radio .dot{ width:21px; height:21px; border-radius:50%; border:2px solid var(--line); display:flex; align-items:center; justify-content:center; transition:border-color .2s; }
  .radio.on .dot{ border-color:var(--terra); }
  .radio.on .dot::after{ content:""; width:10px; height:10px; border-radius:50%; background:var(--terra); }

  .dt-left{ }
  @media (min-width:861px){ .dt-left{ position:sticky; top:clamp(16px,3vw,40px); } }
  .field-label{ font-size:13px; font-weight:700; letter-spacing:.04em; color:var(--ink-soft); margin:clamp(28px,3.4vw,40px) 0 12px; display:flex; align-items:center; gap:7px; }
  .field-label svg{ font-size:1.15em; color:var(--ink-faint); }

  .memo-box{ width:100%; min-height:140px; resize:vertical; border-radius:16px; border:1px solid var(--line); background:var(--card-2); color:var(--ink); padding:16px 18px; font-size:15.5px; line-height:1.7; box-shadow:inset 0 1px 2px rgba(74,52,32,.05); transition:border-color .2s, background .2s; }
  .memo-box::placeholder{ color:var(--ink-faint); }
  .memo-box:focus{ outline:none; border-color:var(--terra); background:var(--card); }

  .todo-add{ display:flex; gap:10px; }
  .todo-add input{ flex:1; height:52px; border-radius:14px; border:1px solid var(--line); background:var(--card-2); color:var(--ink); padding:0 18px; font-size:15px; transition:border-color .2s, background .2s; }
  .todo-add input::placeholder{ color:var(--ink-faint); }
  .todo-add input:focus{ outline:none; border-color:var(--terra); background:var(--card); }
  .todo-add button{ width:52px; height:52px; flex:none; border-radius:14px; border:none; background:var(--terra); color:#fdf7ee; display:flex; align-items:center; justify-content:center; font-size:1.3em; box-shadow:var(--shadow-sm); transition:background .2s, transform .15s; }
  .todo-add button:hover{ background:var(--terra-deep); transform:translateY(-1px); }

  .todo-list{ margin-top:14px; display:flex; flex-direction:column; gap:9px; }
  .todo{ display:flex; align-items:center; gap:12px; padding:13px 14px; border-radius:14px; border:1px solid var(--line); background:var(--card); box-shadow:var(--shadow-sm); transition:box-shadow .18s, opacity .2s, transform .12s; }
  .todo.done{ background:var(--card-2); }
  .todo.dragging{ box-shadow:var(--shadow-md); opacity:.92; }
  .todo .grip{ color:var(--ink-faint); cursor:grab; font-size:1.2em; display:flex; touch-action:none; padding:2px; }
  .todo .grip:active{ cursor:grabbing; }
  .todo .cbox{ width:26px; height:26px; flex:none; border-radius:8px; border:2px solid var(--line); display:flex; align-items:center; justify-content:center; color:#fdf7ee; cursor:pointer; transition:background .18s, border-color .18s; }
  .todo .cbox svg{ font-size:.92em; opacity:0; transform:scale(.5); transition:opacity .15s, transform .15s; }
  .todo.done .cbox{ background:var(--terra); border-color:var(--terra); }
  .todo.done .cbox svg{ opacity:1; transform:none; }
  .todo .ttxt{ flex:1; font-size:15px; color:var(--ink); transition:color .2s; }
  .todo.done .ttxt{ color:var(--ink-faint); text-decoration:line-through; text-decoration-color:var(--ink-faint); }
  .todo .del{ width:34px; height:34px; flex:none; border:none; background:transparent; color:var(--ink-faint); border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:1.1em; transition:color .2s, background .2s; }
  .todo .del:hover{ color:var(--sun); background:var(--terra-soft); }
  .todo-empty{ padding:22px; text-align:center; color:var(--ink-faint); font-size:14px; border:1px dashed var(--line); border-radius:14px; margin-top:14px; }
  `;
  document.head.appendChild(s);
})();

function TodoRow({ todo, onToggle, onDel, onGripDown, dragging }) {
  return (
    <div className={'todo' + (todo.done ? ' done' : '') + (dragging ? ' dragging' : '')} data-tid={todo.id}>
      <span className="grip" onPointerDown={(e) => onGripDown(e, todo.id)}><Icon.grip /></span>
      <span className="cbox" onClick={() => onToggle(todo.id)}><Icon.check /></span>
      <span className="ttxt">{todo.text}</span>
      <button className="del" onClick={() => onDel(todo.id)} aria-label="삭제"><Icon.trash /></button>
    </div>
  );
}

function DetailView({ year, month, day, weekday, entry, onBack, onChange }) {
  const e = entry || { photo: null, fit: 'cover', memo: '', todos: [] };
  const [draft, setDraft] = useState('');
  const [dragId, setDragId] = useState(null);
  const listRef = useRef(null);

  const update = (patch) => onChange({ ...e, ...patch });

  const addTodo = () => {
    const t = draft.trim(); if (!t) return;
    update({ todos: [...e.todos, { id: uid(), text: t, done: false }] });
    setDraft('');
  };
  const toggle = (id) => update({ todos: e.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) });
  const del = (id) => update({ todos: e.todos.filter(t => t.id !== id) });

  const changePhoto = () => {
    const cur = e.photo ? PHOTOS.findIndex(p => e.photo.includes(p)) : -1;
    const next = PHOTOS[(cur + 1) % PHOTOS.length];
    update({ photo: 'assets/' + next + '.png' });
  };
  const removePhoto = () => update({ photo: null });

  // pointer-based drag reorder
  const onGripDown = (ev, id) => {
    ev.preventDefault();
    setDragId(id);
    const move = (mv) => {
      const rows = [...listRef.current.querySelectorAll('.todo')];
      const y = mv.clientY;
      let targetId = null;
      for (const r of rows) {
        const rect = r.getBoundingClientRect();
        if (y < rect.top + rect.height / 2) { targetId = r.dataset.tid; break; }
      }
      const cur = e.todos.slice();
      const from = cur.findIndex(t => t.id === id);
      let to = targetId ? cur.findIndex(t => t.id === targetId) : cur.length;
      if (from === -1) return;
      if (to > from) to -= 1;
      if (to === from || to < 0) return;
      const [moved] = cur.splice(from, 1);
      cur.splice(to, 0, moved);
      update({ todos: cur });
    };
    const up = () => {
      setDragId(null);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const ym = `${year}. ${String(month + 1).padStart(2, '0')}`;
  const hasPhoto = !!e.photo;

  return (
    <div className="dt-scroll">
      <div className="dt-wrap">
        <div className="dt-grid">
          <div className="dt-left">
            <div className={'banner' + (hasPhoto ? '' : ' empty')}>
              {hasPhoto && <img className="bimg" src={e.photo} alt="" style={{ objectFit: e.fit === 'contain' ? 'contain' : 'cover' }} />}
              {hasPhoto && <div className="bshade" />}
              {!hasPhoto && <div className="empty-hint"><Icon.photo /><span>사진을 추가해 보세요</span></div>}
              <button className="back-btn" onClick={onBack} aria-label="뒤로"><Icon.arrowL /></button>
              <div className="b-date">
                <div className="ym">{ym}</div>
                <div className="dl"><span className="d serif">{day}</span><span className="w serif">{WEEKDAYS_FULL[weekday]}</span></div>
              </div>
            </div>

            <div className="act-row">
              <button className="btn primary" onClick={changePhoto}><Icon.photo />{hasPhoto ? '사진 변경' : '사진 추가'}</button>
              {hasPhoto && <button className="btn ghost" onClick={removePhoto}>사진 삭제</button>}
            </div>

            {hasPhoto && (
              <div className="radio-row">
                {[['cover','꽉 채우기'],['contain','비율 유지']].map(([v, l]) => (
                  <div key={v} className={'radio' + (e.fit === v ? ' on' : '')} onClick={() => update({ fit: v })}>
                    <span className="dot" /><span>{l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dt-right">
            <div className="field-label"><Icon.note />오늘의 기분 · 메모</div>
            <textarea className="memo-box" value={e.memo} placeholder="오늘 하루는 어땠나요?"
              onChange={(ev) => update({ memo: ev.target.value })} />

            <div className="field-label"><Icon.check />할 일</div>
            <div className="todo-add">
              <input value={draft} placeholder="할 일을 입력하고 Enter"
                onChange={(ev) => setDraft(ev.target.value)}
                onKeyDown={(ev) => { if (ev.key === 'Enter') addTodo(); }} />
              <button onClick={addTodo} aria-label="추가"><Icon.plus /></button>
            </div>
            {e.todos.length === 0 ? (
              <div className="todo-empty">아직 할 일이 없어요</div>
            ) : (
              <div className="todo-list" ref={listRef}>
                {e.todos.map(t => (
                  <TodoRow key={t.id} todo={t} onToggle={toggle} onDel={del} onGripDown={onGripDown} dragging={dragId === t.id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DetailView = DetailView;
