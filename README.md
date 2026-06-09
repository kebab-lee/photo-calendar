# 포토 다이어리 캘린더

날짜별로 **사진 한 장 + 기분/메모 + 할 일**을 기록하는 포토 다이어리형 캘린더 웹앱.
월별 달력에서 날짜를 누르면 그날 상세(사진·코멘트·투두)로 들어간다. (1단계: 단일 사용자, 최소 JWT 인증으로 기기 간 연동)

## 기술 스택

| 영역 | 스택 |
|------|------|
| 백엔드 | Spring Boot 3.3.5 · Java 21 · MyBatis(3.0.3) · MySQL · Spring Security + JWT(jjwt 0.12.6) · 이미지 리사이즈 Thumbnailator(0.4.20) · Lombok |
| 프론트 | React 19 · Vite 8 · React Router 7 · axios |
| 빌드/실행 | 백엔드 Maven Wrapper(`./mvnw`, 별도 설치 불필요) · 프론트 npm |

---

## 1. 디렉터리 구조 (모노레포)

```
calendar/
├─ calendar-was/   # 백엔드 (Spring Boot + MyBatis)  → ./mvnw 로 실행
│  └─ src/main/resources/
│     ├─ application.yml          # 포트·DB·env·multipart 설정
│     └─ db/schema.sql            # DB 테이블 정의(초기화용)
├─ calendar-web/   # 프론트 (React + Vite)            → npm 으로 실행
│  └─ .env.example                # 프론트 환경변수 예시
├─ design-ref/     # 디자인 시각 참고용 (빌드 제외)
└─ docs/           # 기획서(PRD) 등 문서
```

> 명령은 **각 앱 폴더 안에서** 실행한다: 백엔드는 `calendar-was/`, 프론트는 `calendar-web/`.

---

## 2. 사전 준비물

| 도구 | 버전 | 비고 |
|------|------|------|
| MySQL | 8.0+ | 검증: Homebrew MySQL 9.6 |
| JDK | **21 이상** | `calendar-was/pom.xml`의 `java.version=21` 타겟. 빌드 시 `JAVA_HOME`이 21+ 여야 함(검증: JDK 23). 메이븐은 `./mvnw` 래퍼라 설치 불필요 |
| Node.js | 20.19+ 또는 22.12+ | Vite 8 요구사항. 검증: Node 22.13.1 / npm 10.9.2 (`package.json`에 engines 핀은 없음) |

---

## 3. DB 셋업

`schema.sql`은 **테이블 정의만** 들어있다(데이터베이스·계정 생성은 포함 안 됨). 아래 순서로 진행한다.

**(1) 데이터베이스 + 계정 생성** — 기본 접속정보(`application.yml`)는 DB `photocalendar`, 사용자 `photocalendar`(빈 비밀번호)다.

```sql
-- 관리자 계정으로 접속: mysql -u root
CREATE DATABASE photocalendar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'photocalendar'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON photocalendar.* TO 'photocalendar'@'localhost';
FLUSH PRIVILEGES;
```

> 빈 비밀번호는 **로컬 개발용**이다. 비밀번호를 설정했다면 아래 `DB_PASSWORD`에 반영한다.

**(2) 스키마 import** — 저장소 루트에서:

```bash
mysql -u photocalendar photocalendar < calendar-was/src/main/resources/db/schema.sql
```

생성되는 테이블: `user`, `day_entry`, `day_image`, `todo`.

---

## 4. 환경변수

로컬 기본값이 코드에 내장되어 있어 **DB만 위 기본값대로 만들면 환경변수 설정 없이 그대로 실행**된다.
운영/다른 환경에서는 아래 변수로 덮어쓴다.

### 백엔드 (`calendar-was/src/main/resources/application.yml`)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `DB_URL` | `jdbc:mysql://localhost:3306/photocalendar?serverTimezone=Asia/Seoul&characterEncoding=UTF-8&allowPublicKeyRetrieval=true&useSSL=false` | DB 접속 URL |
| `DB_USER` | `photocalendar` | DB 사용자 |
| `DB_PASSWORD` | (빈 값) | DB 비밀번호 |
| `JWT_SECRET` | `dev-only-change-me-...`(개발용) | JWT 서명 키. **운영 전 반드시 32바이트+ 랜덤값으로 교체** |
| `JWT_EXPIRATION_DAYS` | `7` | 액세스 토큰 만료(일) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | 허용할 프론트 오리진 |
| `UPLOAD_DIR` | `~/photo-calendar-uploads` | 업로드 사진 저장 베이스 폴더 (`full/`·`thumb/` 자동 생성) |

그 외 고정값: 서버 포트 `8080`, 업로드 한도 `max-file-size 10MB` / `max-request-size 12MB`.

예시(필요할 때만):
```bash
export DB_PASSWORD='...'
export JWT_SECRET='운영용-아주-긴-랜덤-문자열-최소-32바이트'
export UPLOAD_DIR='/var/app/uploads'
```

### 프론트 (`calendar-web/.env.example`)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_API_BASE_URL` | `/api` | 백엔드 API 베이스. **미설정 시 `/api`** (Vite dev 프록시가 `:8080`으로 전달). 별도 호스트 연결 시에만 지정 |

로컬 개발은 설정 없이 동작한다. 값을 바꾸려면 예시를 복사해 사용(커밋하지 않음):
```bash
cd calendar-web
cp .env.example .env.local
```

---

## 5. 실행 순서

**① 백엔드 먼저** (`calendar-was/`)

```bash
cd calendar-was
# JAVA_HOME을 JDK 21 이상으로 지정 (예: macOS)
export JAVA_HOME=$(/usr/libexec/java_home -v 23)
./mvnw spring-boot:run
# → http://localhost:8080  (기동 로그에 "Started CalendarApplication")
```

**② 프론트** (`calendar-web/`, 새 터미널)

```bash
cd calendar-web
npm install
npm run dev
# → http://localhost:5173
```

**③ 브라우저에서 `http://localhost:5173` 접속 → 회원가입으로 시작.**

---

## 6. 트러블슈팅

**`release version 21 not supported` / 백엔드 빌드 실패**
PATH 기본 `java`가 JDK 21 미만(예: 17)일 때 발생한다. `JAVA_HOME`을 JDK 21+ 로 지정 후 다시 실행한다(검증: JDK 23).
```bash
java -version                 # 현재 버전 확인
/usr/libexec/java_home -V     # 설치된 JDK 목록(macOS)
export JAVA_HOME=$(/usr/libexec/java_home -v 23)
```

**`Communications link failure` / DB 접속 오류**
MySQL이 꺼져 있다. 시작 후 재시도:
```bash
brew services start mysql     # 또는: mysql.server start
```
접속정보가 기본값과 다르면 `DB_URL` / `DB_USER` / `DB_PASSWORD`를 환경변수로 맞춘다.

**포트 충돌(8080 / 5173)**
이미 사용 중이면 해당 프로세스를 종료하거나 포트를 변경한다(백엔드 `server.port`, 프론트 Vite 설정).
