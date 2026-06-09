import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/context.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Cal, Check, Warn } from '../components/icons.jsx';
import {
  emailError,
  loginPasswordError,
  passwordConfirmError,
  signupPasswordError,
} from '../lib/validation.js';
import './AuthPage.css';

function serverMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

function Field({ label, type, name, autoComplete, value, placeholder, error, valid, onChange, onEnter, autoFocus }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className={'inp' + (error ? ' invalid' : valid ? ' valid' : '')}>
        <input
          type={type}
          name={name}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) onEnter();
          }}
        />
        {(error || valid) && <span className="stat">{error ? <Warn /> : <Check />}</span>}
      </div>
      {error && (
        <div className="err">
          <Warn />
          {error}
        </div>
      )}
    </div>
  );
}

function LoginCard({ onSwitch }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [touched, setTouched] = useState(false);
  const [shake, setShake] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailErr = emailError(email);
  const pwErr = loginPasswordError(pw);
  const valid = !emailErr && !pwErr;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const submit = async () => {
    setTouched(true);
    setServerErr('');
    if (!valid) {
      triggerShake();
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), pw);
      navigate('/', { replace: true });
    } catch (err) {
      setServerErr(serverMessage(err, '로그인에 실패했어요. 잠시 후 다시 시도해 주세요.'));
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" key="login">
      <h2>로그인</h2>
      <p className="sub">다시 만나서 반가워요. 오늘 하루를 기록해 볼까요?</p>
      {serverErr && (
        <div className="err-banner">
          <Warn />
          {serverErr}
        </div>
      )}
      <Field
        label="이메일"
        type="email"
        name="email"
        autoComplete="username"
        value={email}
        placeholder="you@example.com"
        autoFocus
        error={touched ? emailErr : ''}
        valid={touched && !emailErr}
        onChange={setEmail}
        onEnter={submit}
      />
      <Field
        label="비밀번호"
        type="password"
        name="password"
        autoComplete="current-password"
        value={pw}
        placeholder="••••••••"
        error={touched ? pwErr : ''}
        valid={touched && !pwErr}
        onChange={setPw}
        onEnter={submit}
      />
      <button className={'submit' + (shake ? ' shake' : '')} onClick={submit} disabled={submitting}>
        {submitting ? '로그인 중…' : '로그인'}
      </button>
      <div className="alt">
        아직 계정이 없으신가요? <button onClick={onSwitch}>회원가입</button>
      </div>
    </div>
  );
}

function SignupCard({ onSwitch }) {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [touched, setTouched] = useState(false);
  const [shake, setShake] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailErr = emailError(email);
  const pwErr = signupPasswordError(pw);
  const pw2Err = passwordConfirmError(pw2, pw);
  const valid = !emailErr && !pwErr && !pw2Err;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const submit = async () => {
    setTouched(true);
    setServerErr('');
    if (!valid) {
      triggerShake();
      return;
    }
    setSubmitting(true);
    try {
      await signup(email.trim(), pw);
      navigate('/', { replace: true });
    } catch (err) {
      setServerErr(serverMessage(err, '가입에 실패했어요. 잠시 후 다시 시도해 주세요.'));
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" key="signup">
      <h2>회원가입</h2>
      <p className="sub">나만의 포토 다이어리를 시작해 보세요.</p>
      {serverErr && (
        <div className="err-banner">
          <Warn />
          {serverErr}
        </div>
      )}
      <Field
        label="이메일"
        type="email"
        name="email"
        autoComplete="username"
        value={email}
        placeholder="you@example.com"
        autoFocus
        error={touched ? emailErr : ''}
        valid={touched && !emailErr}
        onChange={setEmail}
      />
      <Field
        label="비밀번호"
        type="password"
        name="password"
        autoComplete="new-password"
        value={pw}
        placeholder="8자 이상"
        error={touched ? pwErr : ''}
        valid={touched && !pwErr}
        onChange={setPw}
      />
      <Field
        label="비밀번호 확인"
        type="password"
        name="passwordConfirm"
        autoComplete="new-password"
        value={pw2}
        placeholder="비밀번호를 한 번 더"
        error={touched ? pw2Err : ''}
        valid={touched && !pw2Err}
        onChange={setPw2}
        onEnter={submit}
      />
      <button className={'submit' + (shake ? ' shake' : '')} onClick={submit} disabled={submitting}>
        {submitting ? '가입 중…' : '가입하기'}
      </button>
      <div className="alt">
        <button onClick={onSwitch}>← 로그인으로 돌아가기</button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { status } = useAuth();
  const [mode, setMode] = useState('login');

  // 이미 인증된 상태면 앱으로.
  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-stage">
      <ThemeToggle />
      <div className="brand">
        <span className="mark">
          <Cal /> 나의 포토 다이어리
        </span>
        <h1>{mode === 'login' ? '오늘을 남겨요' : '함께 시작해요'}</h1>
        <p>사진 한 장과 짧은 메모로 하루를 기록하는 다이어리</p>
      </div>
      {mode === 'login' ? (
        <LoginCard onSwitch={() => setMode('signup')} />
      ) : (
        <SignupCard onSwitch={() => setMode('login')} />
      )}
    </div>
  );
}
