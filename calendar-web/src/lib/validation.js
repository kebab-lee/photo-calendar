// 검증: 공통(이메일) / 대상별(로그인·가입 비밀번호) 분리.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 공통
export function emailError(value) {
  if (!value.trim()) return '이메일을 입력해 주세요';
  if (!EMAIL_RE.test(value)) return '올바른 이메일 형식이 아니에요';
  return '';
}

// 로그인 전용: 존재 여부만
export function loginPasswordError(value) {
  return value ? '' : '비밀번호를 입력해 주세요';
}

// 가입 전용: 길이 규칙(백엔드 @Size(min=8)과 일치)
export function signupPasswordError(value) {
  if (!value) return '비밀번호를 입력해 주세요';
  if (value.length < 8) return '8자 이상 입력해 주세요';
  return '';
}

export function passwordConfirmError(value, password) {
  if (!value) return '비밀번호를 한 번 더 입력해 주세요';
  if (value !== password) return '비밀번호가 일치하지 않아요';
  return '';
}
