// 달력 유틸 (design-ref/data.jsx 헬퍼 이식).
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const pad = (n) => String(n).padStart(2, '0');

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function firstWeekday(year, month) {
  return new Date(year, month, 1).getDay();
}

/** 실제 오늘(로컬). {y, m(0-based), d} */
export function todayParts() {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
}

/** API month 파라미터 YYYY-MM */
export function monthParam(year, month) {
  return `${year}-${pad(month + 1)}`;
}

/** 상세 라우팅용 YYYY-MM-DD */
export function dateStr(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/** 요약 항목 → 진행도. 투두 없으면 null. */
export function progressOf(item) {
  if (!item || !item.todoTotal) return null;
  return { done: item.todoDone, total: item.todoTotal, all: item.todoDone === item.todoTotal };
}
