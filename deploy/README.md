# 배포 가이드 (kebabServer)

베어메탈 배포: **로컬에서 빌드 → 서버로 jar/dist만 전송**, 서버는 실행만.
외부 노출/HTTPS는 **Cloudflare Tunnel**(`calendar.kebab-lee.com` → `localhost:3000`)이 담당 →
certbot·방화벽·포트개방 불필요.

```
브라우저 → calendar.kebab-lee.com (Cloudflare Tunnel)
        → localhost:3000  nginx
              ├─ /              → web-01 (dist, SPA)
              └─ /api,/uploads  → 127.0.0.1:8080 (was, systemd)
                                     └─ MySQL(Docker 컨테이너, photocalendar)
```

> 서버 JDK는 17(트레이딩용)이고 메모리도 빠듯 → 서버 빌드 안 함.
> jar 실행엔 JDK21 필요 → 서버에 JDK21 설치(17과 공존), systemd는 java21 **절대경로**로 호출.

산출물:
- `deploy.sh` — 로컬 빌드 + 전송(rsync)
- `calendar-was.service` — 백엔드 systemd 유닛
- `calendar-was.env.example` — 백엔드 env 템플릿 (→ `was-01/app.env`)
- `nginx-calendar.conf` — nginx server 블록(:3000)

---

## 0. 준비물

- **로컬(빌드)**: JDK 21+ (`JAVA_HOME` 지정), Node 20.19+/22.x, `rsync`/`ssh`
- **서버(실행)**: JDK 21(17 공존), nginx(설치됨), 구동 중 MySQL 컨테이너. Node/Maven 불필요.

서버에 JDK21 설치(Ubuntu 예시, 기본 java는 17 유지):
```bash
sudo apt update && sudo apt install -y openjdk-21-jre-headless
# java21 절대경로 확인 (systemd ExecStart에 사용)
dpkg -L openjdk-21-jre-headless | grep 'bin/java$'
#   예) /usr/lib/jvm/java-21-openjdk-amd64/bin/java
java -version   # 기본은 여전히 17이어야 정상(트레이딩 영향 없음)
```

---

## 1. 서버 1회 셋업

```bash
# 업로드 디렉터리(영속)
mkdir -p ~/projects/kebab-calendar/uploads
```

### MySQL(Docker 컨테이너 `trading_mysql`, 포트 3306) DB·계정 생성
```bash
docker exec -i trading_mysql mysql -uroot -p <<'SQL'
CREATE DATABASE IF NOT EXISTS photocalendar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'photocalendar'@'%' IDENTIFIED BY '여기에_DB_비밀번호';
GRANT ALL PRIVILEGES ON photocalendar.* TO 'photocalendar'@'%';
FLUSH PRIVILEGES;
SQL
```
> 컨테이너 네트워크 특성상 계정 host는 `'%'`. 백엔드는 host published 포트 3306으로 접속.
> 스키마 import는 **2번(전송)으로 `schema.sql`이 올라온 뒤** 진행(아래).

---

## 2. 로컬에서 빌드 + 전송

```bash
# 레포 루트에서. SSH_HOST/REMOTE_BASE는 환경에 맞게.
JAVA_HOME=$(/usr/libexec/java_home -v 23) \
SSH_HOST=kebab@kebabServer \
  ./deploy/deploy.sh
```
→ `was-01/app.jar`, `web-01/`(dist 내용물), `was-01/schema.sql` 전송됨.

스키마 import(전송 후 1회):
```bash
docker exec -i trading_mysql mysql -uphotocalendar -p photocalendar \
  < ~/projects/kebab-calendar/was-01/schema.sql
```

---

## 3. 백엔드(was) — systemd

```bash
cd ~/projects/kebab-calendar/was-01
cp /path/to/repo/deploy/calendar-was.env.example app.env
nano app.env          # DB_PASSWORD / JWT_SECRET / (필요시) DB_URL 포트 채움

# 유닛 설치 (ExecStart의 java21 절대경로가 0번에서 확인한 경로와 같은지 확인!)
sudo cp /path/to/repo/deploy/calendar-was.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now calendar-was

systemctl status calendar-was
journalctl -u calendar-was -f          # 기동 로그 ("Started CalendarApplication")
curl -i http://127.0.0.1:8080/api/health
```

---

## 4. nginx (:3000)

```bash
sudo cp /path/to/repo/deploy/nginx-calendar.conf /etc/nginx/sites-available/calendar
sudo ln -s /etc/nginx/sites-available/calendar /etc/nginx/sites-enabled/calendar
sudo nginx -t && sudo systemctl reload nginx
curl -I http://127.0.0.1:3000          # 정적(index.html) 200
```
기존 `history.kebab-lee.dev` 설정은 건드리지 않는다(별도 파일/포트).

---

## 5. 확인

`https://calendar.kebab-lee.com` 접속 → **회원가입으로 시작** → 달력 → 사진 업로드(≤10MB)까지 동작 확인.

---

## 6. 갱신 배포

```bash
# 로컬
JAVA_HOME=$(/usr/libexec/java_home -v 23) ./deploy/deploy.sh
# 서버 (백엔드 변경 시)
sudo systemctl restart calendar-was
# 프론트(dist)는 재시작 없이 즉시 반영
```
> `deploy.sh`에 `RESTART_REMOTE=1`을 주면 전송 후 자동으로 `sudo systemctl restart` 시도(무비밀번호 sudo 필요).
