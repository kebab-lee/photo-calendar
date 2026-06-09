// 1단계 한정: access token을 localStorage에 보관(PRD 명시). 2단계에서 httpOnly 쿠키 검토.
const KEY = 'pd_token';

export function getToken() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* storage 불가 환경 무시 */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
