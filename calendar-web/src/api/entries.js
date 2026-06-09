import client from './client.js';

/** 월별 요약. month='YYYY-MM'. → [{ date, thumbUrl, fit, hasComment, todoTotal, todoDone }] */
export async function getMonthlySummary(month) {
  const { data } = await client.get('/entries', { params: { month } });
  return data;
}
