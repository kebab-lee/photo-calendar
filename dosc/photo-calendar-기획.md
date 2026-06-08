# 포토 다이어리 캘린더 + 투두 앱 — 기획 문서

> 개인 프로젝트 기획서. 코드 작업 시 이 문서를 기준으로 진행한다.
> (Claude Project 지식에 등록해두고 참조)

---

## 1. 프로젝트 개요

날짜별로 **사진 한 장 + 그날의 기분/메모 + 할 일**을 기록하는 포토 다이어리형 캘린더 웹앱.

- 월별 달력에서 날짜를 클릭하면 그날의 상세 화면으로 이동
- 사진을 등록하면 상세 화면 상단에 배너로 표시되고, 월별 달력에서는 해당 날짜 칸이 그 사진으로 채워짐
- 사진 표시 방식은 **꽉 채우기(cover) / 비율 유지(contain)** 중 선택
- 그날의 기분·메모(코멘트) 기록
- 체크박스가 있는 할 일 목록, 순서 변경 가능
- 모바일/데스크톱 반응형

### 단계별 목표

| 단계 | 범위 |
|------|------|
| 1단계 (현재) | 나만 사용. 백엔드 + 최소 인증으로 기기 간 연동까지. |
| 2단계 | 멀티유저 공개. 인증 강화, 사진 저장소 전환 등. |

---

## 2. 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| 백엔드 | **Spring Boot** | 순수 Spring 아님. Boot 기반 신규 구성. |
| ORM/매퍼 | MyBatis (또는 JPA) | 회사 스택과 동일하게 MyBatis 가능 |
| DB | MySQL | |
| 프론트 | **React + Vite (SPA)** | Spring API와 깔끔하게 분리. Next.js는 별도 백엔드와 겹쳐서 제외. |
| 인증 | JWT (access token) | 1단계는 단일 토큰, 2단계에서 refresh 추가 |
| 사진 저장 | 서버 로컬 디스크 | 1단계. 2단계에서 오브젝트 스토리지로 전환 고려 |
| 이미지 리사이즈 | 서버 처리 (Thumbnailator 등) | 풀 + 썸네일 두 장 생성 |

### 프론트 선택 메모
- Spring 백엔드를 별도로 두므로 **Next.js의 SSR/API 라우트 강점이 충돌** → 제외.
- React + Vite SPA가 분리형 REST API와 가장 깔끔.
- 데이터 모델·API 명세는 프론트 프레임워크와 무관하므로, 추후 Angular로 바꿔도 영향 없음.

---

## 3. 데이터 모델

네이밍 컨벤션: **소문자 연결** (lowercase, 구분자 없음)

### user
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK | |
| email | varchar | 유니크 |
| passwordhash | varchar | 해시 저장 (평문 금지) |
| createdat | datetime | |

### dayentry
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK | |
| userid | FK → user.id | |
| entrydate | date | 그날 날짜 |
| comment | text | 기분/메모 |
| updatedat | datetime | |

- **유니크 제약: (userid, entrydate)** — 사용자별 하루 1개
- **빈 row 방지:** 사용자가 첫 쓰기(코멘트/사진/투두)를 할 때 자동 생성(upsert). 날짜만 열어보고 아무것도 안 적으면 row 생성 안 함.

### dayimage
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK | |
| dayentryid | FK → dayentry.id | |
| imageurl | varchar | 원본(리사이즈된 풀) URL |
| thumburl | varchar | 썸네일 URL |
| fit | varchar | 'cover' / 'contain' |
| sortorder | int | 정렬 순서 |
| createdat | datetime | |

- **dayentry : dayimage = 1 : N** (확장성 대비)
- **단, 1단계에서는 하루 한 장만 운영.** 항상 sortorder=0으로 1개만 생성, 이미 있으면 교체.
- 달력/배너 표시 시 "그날 dayimage 중 sortorder 최솟값" = 사실상 그 한 장 사용.
- 여러 장으로 확장 시: "한 장만" 제약만 풀면 됨. 테이블 변경 불필요.

### todo
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK | |
| dayentryid | FK → dayentry.id | |
| content | varchar | 할 일 내용 |
| isdone | boolean | 완료 여부 |
| sortorder | int | 정렬 순서 |

---

## 4. 사진 저장 정책 (1단계)

- 파일은 **서버 로컬 디스크**에 저장, DB(dayimage)에는 URL만 저장.
- 업로드 시 서버에서 **원본(리사이즈된 풀) + 썸네일** 두 장 생성.
- Spring 정적 리소스 핸들러로 `/uploads/**` 경로를 실제 폴더에 매핑하여 서빙.
- "하루 한 장" 규칙: 기존 이미지가 있으면 기존 파일 삭제 후 교체.
- **2단계 전환:** 오브젝트 스토리지(NCP Object Storage / S3 등)로 이전. dayimage는 URL만 저장하므로 컬럼 구조 변경 없이 저장 위치만 교체 가능.

---

## 5. API 명세

인증으로 사용자가 식별되므로, 경로에는 날짜만 포함. 모든 데이터 API는 "로그인한 사용자의 데이터만" 다룬다.

### 인증
| 메서드 | 경로 | body | 설명 |
|--------|------|------|------|
| POST | `/api/auth/signup` | `{ email, password }` | 가입 |
| POST | `/api/auth/login` | `{ email, password }` | 로그인, JWT 발급 |
| GET | `/api/auth/me` | — | 현재 사용자 확인 |

### 달력 (월별 요약 조회)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/entries?month=YYYY-MM` | 그 달의 날짜별 **요약**만 반환 |

요약 응답에는 **큰 이미지·코멘트 본문·투두 목록을 포함하지 않는다** (달력은 가볍게).

```json
[
  {
    "date": "2026-06-03",
    "thumbUrl": "/uploads/thumb/abc.jpg",
    "fit": "cover",
    "hasComment": true,
    "todoTotal": 3,
    "todoDone": 2
  }
]
```

### 날짜 상세
| 메서드 | 경로 | body | 설명 |
|--------|------|------|------|
| GET | `/api/entries/{date}` | — | 그날 전체 데이터. 없으면 빈 형태 또는 404 후 프론트 빈 상태 처리 |
| PUT | `/api/entries/{date}` | `{ comment }` | 코멘트 저장 (dayentry 없으면 upsert) |

```json
{
  "date": "2026-06-03",
  "comment": "오늘 날씨 좋았음",
  "image": {
    "imageUrl": "/uploads/full/abc.jpg",
    "thumbUrl": "/uploads/thumb/abc.jpg",
    "fit": "cover"
  },
  "todos": [
    { "id": 12, "content": "운동", "isDone": true, "sortOrder": 0 },
    { "id": 13, "content": "장보기", "isDone": false, "sortOrder": 1 }
  ]
}
```

### 사진 (하루 한 장)
| 메서드 | 경로 | body | 설명 |
|--------|------|------|------|
| POST | `/api/entries/{date}/image` | multipart: 파일 + `fit` | 업로드 (있으면 교체) |
| PATCH | `/api/entries/{date}/image` | `{ fit }` | cover/contain 변경 |
| DELETE | `/api/entries/{date}/image` | — | 삭제 |

### 투두
| 메서드 | 경로 | body | 설명 |
|--------|------|------|------|
| POST | `/api/entries/{date}/todos` | `{ content }` | 추가 (dayentry 없으면 자동 생성) |
| PATCH | `/api/todos/{id}` | `{ content?, isDone? }` | 내용 수정 / 완료 토글 |
| DELETE | `/api/todos/{id}` | — | 삭제 |
| PUT | `/api/entries/{date}/todos/order` | `{ orderedIds: [13, 12, 14] }` | 순서 변경 |

순서 변경은 **바뀐 전체 id 배열을 통째로 전송 → 서버가 sortorder를 0,1,2…로 재배치**. 개별 계산보다 안전.

---

## 6. 인증 (JWT)

### 기본 흐름
- Spring Security + jjwt (`io.jsonwebtoken:jjwt`)
- 로그인 시 JWT 발급 → 응답 body로 반환
- 프론트는 토큰 보관 후 모든 요청에 `Authorization: Bearer {토큰}` 헤더 첨부
- 서버는 `OncePerRequestFilter`로 요청마다 토큰 검증 → SecurityContext에 사용자 세팅
- 컨트롤러에서 현재 userid를 꺼내 "본인 데이터만" 처리

### 단계별
- **1단계:** access token 단일. 만료 길게(예: 7일), 만료 시 재로그인. refresh/블랙리스트 도입 안 함(과설계 방지).
- **2단계:** refresh token 추가. access 짧게(예: 30분) + refresh로 조용히 갱신. 구조는 유지하고 갱신 로직만 추가.

### 토큰 보관 위치 (프론트)
- **1단계:** localStorage (간단). XSS 노출 리스크 존재.
- **2단계(공개 전):** httpOnly 쿠키 + CSRF 방어로 강화 고려.

---

## 7. 핵심 설계 결정 요약

1. **달력 조회는 요약만** — 썸네일 + 카운트만. 상세는 별도 조회.
2. **쓰기는 dayentry upsert** — 빈 row 방지, 달력 깨끗하게 유지.
3. **순서 변경은 전체 배열 통째로** — sortorder 서버 재배치.
4. **이미지 1:N 테이블 + 1단계는 한 장만** — 확장 시 테이블 변경 불필요.
5. **모든 테이블이 userid/FK로 사용자에 묶임** — 멀티유저 전환 비용 최소화.
6. **이미지 리사이즈는 서버 책임** — 프론트는 원본만 업로드.

---

## 8. 향후 확장 고려사항

- 하루 여러 장 사진 (갤러리) — "한 장만" 제약 해제
- 대표 사진 지정 (필요 시 dayentry.coverimageid 추가, 또는 sortorder 활용)
- 사진별 캡션, 메타데이터
- 사진 저장소 오브젝트 스토리지 전환
- 월/기간 통계, 검색, 태그
- 소셜 로그인(OAuth)
