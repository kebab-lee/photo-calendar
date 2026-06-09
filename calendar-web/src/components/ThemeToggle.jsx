import { useTheme } from '../hooks/useTheme.js';
import { Moon, Sun } from './icons.jsx';

/** 고정 위치(우상단) 테마 토글 — 인증 화면용. */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="테마 전환">
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
