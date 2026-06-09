import { useAuth } from '../auth/context.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import './Home.css';

// 임시 보호 랜딩. 인증 흐름 확인용 — 다음 태스크에서 달력 화면으로 교체.
export default function Home() {
  const { user, logout } = useAuth();

  return (
    <main className="home">
      <ThemeToggle />
      <div className="home-card">
        <h1 className="serif">로그인됨</h1>
        <p className="home-email">{user?.email}</p>
        <p className="home-note">여기에 곧 달력이 들어옵니다.</p>
        <button className="home-logout" onClick={logout}>
          로그아웃
        </button>
      </div>
    </main>
  );
}
