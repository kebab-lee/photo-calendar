import { Navigate } from 'react-router-dom';

import { useAuth } from './context.js';

/** 보호 라우트 가드: 미인증이면 /login으로. */
export default function RequireAuth({ children }) {
  const { status } = useAuth();

  if (status === 'loading') {
    return <div className="route-loading">불러오는 중…</div>;
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }
  return children;
}
