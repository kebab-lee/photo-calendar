import { Navigate, Route, Routes } from 'react-router-dom';

import RequireAuth from './auth/RequireAuth.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import DayDetailPlaceholder from './pages/DayDetailPlaceholder.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <CalendarPage />
          </RequireAuth>
        }
      />
      <Route
        path="/entries/:date"
        element={
          <RequireAuth>
            <DayDetailPlaceholder />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
