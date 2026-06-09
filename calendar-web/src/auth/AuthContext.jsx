import { useEffect, useState } from 'react';

import * as authApi from '../api/auth.js';
import { AuthContext } from './context.js';
import { clearToken, getToken, setToken } from './token.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 토큰 유무로 초기 상태 결정(동기). 'loading'이면 me()로 검증.
  const [status, setStatus] = useState(() => (getToken() ? 'loading' : 'unauthenticated'));

  // 부팅 시 토큰이 있으면 me()로 검증해 복원, 무효면 정리(비동기 setState만).
  useEffect(() => {
    if (!getToken()) return undefined;
    let cancelled = false;
    authApi
      .me()
      .then((u) => {
        if (!cancelled) {
          setUser(u);
          setStatus('authenticated');
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearToken();
          setUser(null);
          setStatus('unauthenticated');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email, password) {
    const { accessToken } = await authApi.login(email, password);
    setToken(accessToken);
    const u = await authApi.me();
    setUser(u);
    setStatus('authenticated');
    return u;
  }

  // 가입 성공 직후 자동 로그인.
  async function signup(email, password) {
    await authApi.signup(email, password);
    return login(email, password);
  }

  function logout() {
    clearToken();
    setUser(null);
    setStatus('unauthenticated');
  }

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
