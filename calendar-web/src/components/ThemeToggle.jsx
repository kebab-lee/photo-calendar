import { useEffect, useState } from 'react';

import { Moon, Sun } from './icons.jsx';

/** data-theme + pd_theme 토글(design-ref 로직). index.html이 초기 테마를 부팅함. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('pd_theme', theme);
    } catch {
      /* noop */
    }
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      aria-label="테마 전환"
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
