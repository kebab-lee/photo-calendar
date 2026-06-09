import { Navigate, Route, Routes } from 'react-router-dom';

import RequireAuth from './auth/RequireAuth.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Home from './pages/Home.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
