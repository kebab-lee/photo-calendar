# CLAUDE.md

이 파일은 Claude Code가 이 프로젝트에서 작업할 때 따라야 할 지침이다.
상세 기획은 `photo-calendar-기획.md`(PRD)를 참조한다. 이 파일은 **코드 작성 규칙** 위주다.

---

## 프로젝트

날짜별 사진 한 장 + 기분/메모 + 할 일을 기록하는 포토 다이어리 캘린더 웹앱.

- 1단계(현재): 단일 사용자, 백엔드 + 최소 JWT 인증으로 기기 간 연동
- 2단계: 멀티유저 공개

## 기술 스택

- **백엔드:** Spring Boot + MyBatis + MySQL
- **프론트:** React + Vite (SPA)
- **인증:** JWT (1단계는 access token 단일)
- **사진:** 서버 로컬 디스크 저장, 서버에서 리사이즈(풀+썸네일), DB엔 URL만 저장

## 디렉터리 (예정)

```
/calendar-was    Spring Boot
/calendar-web    React + Vite
/design-ref      디자인 시각 참고용 (빌드 제외)
/docs            기획서(PRD) 등 문서
```

---

## 코딩 컨벤션

### 네이밍

- **DB 테이블/컬럼:** 소문자 연결, 구분자 없음 (예: `dayentryid`, `passwordhash`, `sortorder`)
- 자바/JS 코드 내부는 각 언어 표준(camelCase) 사용. DB ↔ 코드 매핑 지점에서만 변환.

### 일반 원칙

- **플래그 변수는 기존 것을 재사용한다.** 같은 의미의 플래그가 이미 있으면 새로 만들지 말 것.
- **검증 로직은 공통(common) / 대상별(target-specific) 구조로 분리한다.** 모든 대상에 공통인 검증과 특정 대상에만 필요한 검증을 섞지 말 것.
- 새 의존성/라이브러리 추가 전에는 먼저 알린다.
- 기존 패턴과 구조를 우선 따른다. 임의로 새 아키텍처를 도입하지 않는다.

---

## 백엔드 규칙

- 모든 데이터 API는 **로그인한 사용자(userid)의 데이터만** 다룬다. 컨트롤러에서 SecurityContext의 userid를 기준으로 조회/수정.
- 인증: `Authorization: Bearer {token}` 헤더 → `OncePerRequestFilter`에서 검증 → SecurityContext 세팅.
- **dayentry는 upsert로 다룬다.** 코멘트/사진/투두 첫 쓰기 시 자동 생성. 빈 row를 만들지 않는다(날짜만 열람한 경우 생성 X).
- 사진 업로드: 서버에서 풀+썸네일 생성, "하루 한 장" 규칙 — 기존 이미지 있으면 **기존 파일 삭제 후 교체**, sortorder=0.
- 비밀번호는 반드시 해시 저장(평문 금지).
- 정적 파일: `/uploads/**` 경로를 실제 폴더에 매핑하여 서빙.

## 프론트 규칙

- 백엔드 REST API를 호출하는 SPA. 브라우저 로컬 저장(localStorage/sessionStorage)을 데이터 저장소로 쓰지 않는다(토큰 보관 용도만 1단계 한정).
- 달력 화면은 **요약 API(`/api/entries?month=`)**만 호출 — 큰 이미지/투두 목록을 달력에서 불러오지 않는다.
- 날짜 상세 진입 시에만 상세 API 호출.
- 반응형: 데스크톱/모바일 모두 고려.

## 데이터 모델 (요약)

- **user** — id, email, passwordhash, createdat
- **dayentry** — id, userid, entrydate, comment, updatedat / (userid, entrydate) 유니크
- **dayimage** — id, dayentryid(FK), imageurl, thumburl, fit('cover'/'contain'), sortorder, createdat / 1단계는 한 장만
- **todo** — id, dayentryid(FK), content, isdone, sortorder

> 전체 API 명세·필드 상세는 PRD 참조.

---

## 작업 시 주의

- 순서 변경(todo)은 **전체 id 배열을 받아 sortorder 0,1,2…로 재배치**하는 방식.
- 1단계에서 과설계 금지: refresh token, 토큰 블랙리스트, 소셜 로그인 등은 2단계로 미룬다.
- 보안 민감 값(시크릿 키, DB 비밀번호 등)은 코드에 하드코딩하지 말고 환경변수/설정 파일로 분리.

## 작업 방식
- 큰 기능은 먼저 계획(plan)만 보여주고, 내 승인 후 구현 시작.
- 구현 후엔 실제 실행한 명령과 결과(테스트/curl 출력)를 증거로 보여줄 것.
- 기능 단위로 git commit. 한 번에 여러 기능 섞지 말 것.
- 1단계 과설계 금지 (PRD의 1단계 범위만).
