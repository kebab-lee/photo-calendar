import { useNavigate, useParams } from 'react-router-dom';

import { ChevronLeft } from '../components/icons.jsx';
import './DayDetailPlaceholder.css';

// 임시. 다음 태스크에서 실제 날짜 상세(코멘트/투두/사진)로 교체.
export default function DayDetailPlaceholder() {
  const { date } = useParams();
  const navigate = useNavigate();

  return (
    <main className="detail-placeholder">
      <button className="dp-back" onClick={() => navigate('/')}>
        <ChevronLeft /> 달력으로
      </button>
      <p className="dp-date serif">{date}</p>
      <p className="dp-note">상세 화면은 다음 단계에서 들어옵니다.</p>
    </main>
  );
}
