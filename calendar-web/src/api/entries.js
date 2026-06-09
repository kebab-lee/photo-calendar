import client from './client.js';

/** 월별 요약. month='YYYY-MM'. → [{ date, thumbUrl, fit, hasComment, todoTotal, todoDone }] */
export async function getMonthlySummary(month) {
  const { data } = await client.get('/entries', { params: { month } });
  return data;
}

/** 날짜 상세. → { date, comment, image|null, todos[] } (없으면 빈 셸) */
export async function getEntryDetail(date) {
  const { data } = await client.get(`/entries/${date}`);
  return data;
}

/** 코멘트 저장(upsert). → 갱신된 상세 */
export async function saveComment(date, comment) {
  const { data } = await client.put(`/entries/${date}`, { comment });
  return data;
}
