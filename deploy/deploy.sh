#!/usr/bin/env bash
# 로컬(Mac)에서 빌드 → 서버로 jar/dist/schema 전송. (서버에서는 빌드하지 않음)
# 사용: JAVA_HOME=<JDK21+> ./deploy/deploy.sh
set -euo pipefail

# ===== 설정 (환경에 맞게 수정하거나 환경변수로 주입) =====
SSH_HOST="${SSH_HOST:-kebab@kebabServer}"                       # ssh 대상
REMOTE_BASE="${REMOTE_BASE:-/home/kebab/projects/kebab-calendar}" # 서버 배포 루트
RESTART_REMOTE="${RESTART_REMOTE:-0}"                           # 1이면 전송 후 자동 재시작
# 빌드용 JDK 21+ (미지정 시 현재 JAVA_HOME 사용)
# ========================================================

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WAS="$ROOT/calendar-was"
WEB="$ROOT/calendar-web"

echo "▶ 레포 루트 : $ROOT"
echo "▶ 전송 대상 : $SSH_HOST:$REMOTE_BASE"
if [ -n "${JAVA_HOME:-}" ]; then echo "▶ JAVA_HOME : $JAVA_HOME"; export JAVA_HOME; fi

echo "▶ 백엔드 빌드 (./mvnw -DskipTests clean package)…"
( cd "$WAS" && ./mvnw -q -DskipTests clean package )
# 부팅 가능한 jar (spring-boot repackage). '-plain.jar'는 제외.
JAR="$(ls -1 "$WAS"/target/*.jar | grep -v -- '-plain\.jar' | head -1)"
[ -f "$JAR" ] || { echo "✗ 실행 가능한 jar를 찾지 못했습니다."; exit 1; }
echo "  → $JAR"

echo "▶ 프론트 빌드 (npm ci && npm run build)…"
( cd "$WEB" && npm ci && npm run build )

echo "▶ 전송 (rsync)…"
rsync -avz "$JAR" "$SSH_HOST:$REMOTE_BASE/was-01/app.jar"
rsync -avz --delete "$WEB/dist/" "$SSH_HOST:$REMOTE_BASE/web-01/"
rsync -avz "$WAS/src/main/resources/db/schema.sql" "$SSH_HOST:$REMOTE_BASE/was-01/schema.sql"

echo "✓ 전송 완료."
if [ "$RESTART_REMOTE" = "1" ]; then
  echo "▶ 원격 재시작…"
  ssh "$SSH_HOST" 'sudo systemctl restart calendar-was'
  echo "✓ 재시작 완료."
else
  echo "  백엔드 반영: ssh $SSH_HOST 'sudo systemctl restart calendar-was'"
  echo "  (프론트 dist는 재시작 없이 즉시 반영)"
fi
