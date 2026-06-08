// ===== Auth: login / signup =====
const { useState, useRef, useEffect } = React;

(function injectAuthCSS(){
  const s = document.createElement('style'); s.id = 'auth-css';
  s.textContent = `
  .auth-stage{ min-height:100vh; min-height:100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px 48px; gap:clamp(20px,4vh,40px); }
  .theme-toggle{ position:fixed; top:20px; right:20px; width:44px; height:44px; border-radius:13px; border:1px solid var(--line); background:var(--card); color:var(--ink-soft); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); transition:transform .15s, background .2s, color .2s; z-index:20; }
  .theme-toggle:hover{ background:var(--card-2); color:var(--ink); transform:translateY(-1px); }
  .theme-toggle svg{ font-size:1.15em; }

  .brand{ text-align:center; animation:floatIn .6s ease both; }
  .brand .mark{ display:inline-flex; align-items:center; gap:9px; color:var(--terra); font-weight:700; font-size:14px; letter-spacing:.04em; }
  .brand .mark svg{ font-size:1.5em; }
  .brand h1{ font-family:var(--serif); font-weight:700; font-size:clamp(30px,5vw,40px); margin:12px 0 0; letter-spacing:-.01em; line-height:1.1; }
  .brand p{ margin:9px 0 0; color:var(--ink-faint); font-size:14.5px; }

  .card{ width:100%; max-width:420px; background:var(--card); border:1px solid var(--line-soft); border-radius:24px; box-shadow:var(--shadow-lg); padding:clamp(26px,4vw,38px); }
  @media (prefers-reduced-motion:no-preference){ .card{ animation:cardSwap .42s cubic-bezier(.2,.85,.3,1) both; } }
  .card h2{ font-family:var(--serif); font-weight:600; font-size:24px; margin:0 0 4px; }
  .card .sub{ color:var(--ink-faint); font-size:14px; margin:0 0 24px; }

  .field{ margin-bottom:17px; }
  .field > label{ display:block; font-size:13px; font-weight:600; color:var(--ink-soft); margin-bottom:8px; letter-spacing:.01em; }
  .inp{ position:relative; }
  .inp input{ width:100%; height:52px; border-radius:14px; border:1px solid var(--line); background:var(--card-2); color:var(--ink); padding:0 46px 0 16px; font-size:15px; transition:border-color .2s, background .2s, box-shadow .2s; }
  .inp input::placeholder{ color:var(--ink-faint); }
  .inp input:focus{ outline:none; border-color:var(--terra); background:var(--card); box-shadow:0 0 0 3px var(--terra-soft); }
  .inp.invalid input{ border-color:var(--sun); background:var(--card); }
  .inp.invalid input:focus{ box-shadow:0 0 0 3px rgba(181,64,46,.14); }
  .inp.valid input{ border-color:var(--ok); }
  .inp .stat{ position:absolute; right:14px; top:50%; transform:translateY(-50%); display:flex; font-size:1.05em; pointer-events:none; }
  .inp.valid .stat{ color:var(--ok); }
  .inp.invalid .stat{ color:var(--sun); }
  .err{ display:flex; align-items:center; gap:5px; color:var(--sun); font-size:12.5px; margin-top:7px; font-weight:500; animation:floatIn .25s ease both; }
  .err svg{ font-size:1.1em; flex:none; }

  .submit{ width:100%; height:54px; border-radius:14px; border:none; background:var(--terra); color:#fdf7ee; font-size:16px; font-weight:700; box-shadow:var(--shadow-md); transition:background .2s, transform .15s; margin-top:6px; letter-spacing:.02em; }
  .submit:hover{ background:var(--terra-deep); transform:translateY(-1px); }
  .submit:active{ transform:translateY(0); }
  .submit.shake{ animation:shake .4s; }

  .alt{ text-align:center; margin-top:22px; padding-top:20px; border-top:1px solid var(--line-soft); font-size:14px; color:var(--ink-soft); }
  .alt button{ border:none; background:none; color:var(--terra); font-weight:700; font-size:14px; padding:0 2px; text-decoration:underline; text-underline-offset:3px; text-decoration-color:var(--terra-soft); transition:color .2s; }
  .alt button:hover{ color:var(--terra-deep); }

  .ok-banner{ display:flex; align-items:center; gap:9px; background:var(--ok-soft); color:var(--ok); border-radius:12px; padding:12px 15px; font-size:13.5px; font-weight:600; margin-bottom:20px; animation:floatIn .3s ease both; }
  .ok-banner svg{ font-size:1.2em; flex:none; }
  `;
  document.head.appendChild(s);
})();

const I = {
  cal:(p)=>(<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.4" stroke="currentColor" strokeWidth="1.7"/><path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="8" cy="13" r="1.1" fill="currentColor"/><circle cx="12" cy="13" r="1.1" fill="currentColor"/><circle cx="16" cy="13" r="1.1" fill="currentColor"/></svg>),
  check:(p)=>(<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  warn:(p)=>(<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M12 8.5v5M12 16.8v.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/></svg>),
  sun:(p)=>(<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>),
  moon:(p)=>(<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...p}><path d="M20 14.5A8 8 0 119.5 4a6.3 6.3 0 0010.5 10.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>),
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ label, type, value, placeholder, error, valid, onChange, autoFocus }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className={'inp' + (error ? ' invalid' : valid ? ' valid' : '')}>
        <input type={type} value={value} placeholder={placeholder} autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)} />
        {(error || valid) && <span className="stat">{error ? <I.warn /> : <I.check />}</span>}
      </div>
      {error && <div className="err"><I.warn />{error}</div>}
    </div>
  );
}

function LoginCard({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [touched, setTouched] = useState(false);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);

  const emailErr = !email.trim() ? '이메일을 입력해 주세요' : !EMAIL_RE.test(email) ? '올바른 이메일 형식이 아니에요' : '';
  const pwErr = !pw ? '비밀번호를 입력해 주세요' : '';
  const valid = !emailErr && !pwErr;

  const submit = () => {
    setTouched(true); setDone(false);
    if (!valid) { setShake(true); setTimeout(() => setShake(false), 420); return; }
    setDone(true);
    setTimeout(() => { window.location.href = 'index.html'; }, 1100);
  };

  return (
    <div className="card" key="login">
      <h2>로그인</h2>
      <p className="sub">다시 만나서 반가워요. 오늘 하루를 기록해 볼까요?</p>
      {done && <div className="ok-banner"><I.check />로그인 성공! 캘린더로 이동합니다…</div>}
      <Field label="이메일" type="email" value={email} placeholder="you@example.com" autoFocus
        error={touched ? emailErr : ''} valid={touched && !emailErr} onChange={(v)=>{ setEmail(v); }} />
      <Field label="비밀번호" type="password" value={pw} placeholder="••••••••"
        error={touched ? pwErr : ''} valid={touched && !pwErr} onChange={(v)=>{ setPw(v); }} />
      <button className={'submit' + (shake ? ' shake' : '')} onClick={submit}>로그인</button>
      <div className="alt">아직 계정이 없으신가요? <button onClick={onSwitch}>회원가입</button></div>
    </div>
  );
}

function SignupCard({ onSwitch }) {
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [touched, setTouched] = useState(false);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);

  const nickErr = !nick.trim() ? '닉네임을 입력해 주세요' : nick.trim().length < 2 ? '2자 이상 입력해 주세요' : '';
  const emailErr = !email.trim() ? '이메일을 입력해 주세요' : !EMAIL_RE.test(email) ? '올바른 이메일 형식이 아니에요' : '';
  const pwErr = !pw ? '비밀번호를 입력해 주세요' : pw.length < 8 ? '8자 이상 입력해 주세요' : '';
  const pw2Err = !pw2 ? '비밀번호를 한 번 더 입력해 주세요' : pw2 !== pw ? '비밀번호가 일치하지 않아요' : '';
  const valid = !nickErr && !emailErr && !pwErr && !pw2Err;

  const submit = () => {
    setTouched(true); setDone(false);
    if (!valid) { setShake(true); setTimeout(() => setShake(false), 420); return; }
    setDone(true);
    setTimeout(() => { window.location.href = 'index.html'; }, 1300);
  };

  return (
    <div className="card" key="signup">
      <h2>회원가입</h2>
      <p className="sub">나만의 포토 다이어리를 시작해 보세요.</p>
      {done && <div className="ok-banner"><I.check />가입 완료! 환영해요, {nick.trim()}님.</div>}
      <Field label="닉네임" type="text" value={nick} placeholder="예) 햇살모음" autoFocus
        error={touched ? nickErr : ''} valid={touched && !nickErr} onChange={setNick} />
      <Field label="이메일" type="email" value={email} placeholder="you@example.com"
        error={touched ? emailErr : ''} valid={touched && !emailErr} onChange={setEmail} />
      <Field label="비밀번호" type="password" value={pw} placeholder="8자 이상"
        error={touched ? pwErr : ''} valid={touched && !pwErr} onChange={setPw} />
      <Field label="비밀번호 확인" type="password" value={pw2} placeholder="비밀번호를 한 번 더"
        error={touched ? pw2Err : ''} valid={touched && !pw2Err} onChange={setPw2} />
      <button className={'submit' + (shake ? ' shake' : '')} onClick={submit}>가입하기</button>
      <div className="alt"><button onClick={onSwitch}>← 로그인으로 돌아가기</button></div>
    </div>
  );
}

function Auth() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pd_theme') || 'light');
  const [mode, setMode] = useState('login');
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('pd_theme', theme); }, [theme]);

  return (
    <div className="auth-stage">
      <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} aria-label="테마 전환">
        {theme === 'dark' ? <I.sun /> : <I.moon />}
      </button>
      <div className="brand">
        <span className="mark"><I.cal /> 나의 포토 다이어리</span>
        <h1>{mode === 'login' ? '오늘을 남겨요' : '함께 시작해요'}</h1>
        <p>사진 한 장과 짧은 메모로 하루를 기록하는 다이어리</p>
      </div>
      {mode === 'login'
        ? <LoginCard onSwitch={() => setMode('signup')} />
        : <SignupCard onSwitch={() => setMode('login')} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Auth />);
