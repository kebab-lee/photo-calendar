import client from './client.js';

/** 가입. 201 + { id, email }. */
export async function signup(email, password) {
  const { data } = await client.post('/auth/signup', { email, password });
  return data;
}

/** 로그인. 200 + { accessToken, tokenType }. */
export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
}

/** 현재 사용자. 200 + { id, email }. */
export async function me() {
  const { data } = await client.get('/auth/me');
  return data;
}
