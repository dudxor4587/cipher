#!/usr/bin/env bash
# cipher 백엔드 배포 (맥 → Oracle 서버). 소스 동기화 후 서버에서 docker compose 빌드/기동.
# 라우팅·HTTPS는 공용 엣지 프록시(oracle-ampere 레포의 setup.sh)가 라벨로 자동 처리.
# 전제: oracle-ampere/setup.sh 를 한 번 돌려 edge 네트워크 + 엣지 프록시가 떠 있어야 함.
# 프론트는 Vercel 별도 배포.  사용:  ./deploy.sh
set -euo pipefail

KEY=/Users/admin/.ssh/ssh-key-2025-07-10.key
SERVER=ubuntu@134.185.100.62
REMOTE=/home/ubuntu/cipher-deploy
SITE=cipher.134.185.100.62.sslip.io
SSH=(ssh -i "$KEY" -o StrictHostKeyChecking=accept-new)

echo "▶ 1/3  원격 준비 (디렉터리 / edge 네트워크 확인 / .env.prod 시크릿)"
"${SSH[@]}" "$SERVER" "
  mkdir -p $REMOTE
  docker network inspect edge >/dev/null 2>&1 || docker network create edge
  if [ ! -f $REMOTE/.env.prod ]; then
    printf 'DB_PASSWORD=%s\nCIPHER_JWT_SECRET=%s\nCIPHER_AES_KEY=%s\n' \
      \$(openssl rand -hex 16) \$(openssl rand -hex 32) \$(openssl rand -hex 32) > $REMOTE/.env.prod
    chmod 600 $REMOTE/.env.prod
    echo '   .env.prod 새로 생성(시크릿 랜덤) — cat 으로 백업해 둘 것!'
  else echo '   .env.prod 유지'; fi"

echo "▶ 2/3  compose + backend 소스 동기화"
rsync -az -e "${SSH[*]}" deploy/cipher/docker-compose.yml "$SERVER:$REMOTE/"
rsync -az --delete -e "${SSH[*]}" \
  --exclude build --exclude .gradle --exclude logs \
  backend "$SERVER:$REMOTE/"

echo "▶ 3/3  빌드 & 기동"
"${SSH[@]}" "$SERVER" "docker compose -f $REMOTE/docker-compose.yml --env-file $REMOTE/.env.prod up -d --build"

cat <<EOF

✅ cipher 배포 완료
   백엔드:  https://$SITE   (엣지 프록시가 라벨 감지 후 인증서 발급, 첫 발급 수십 초)
   로그:    ./ (oracle-ampere)/ssh.sh 'docker compose -f $REMOTE/docker-compose.yml logs -f backend'

   Vercel 환경변수:
     VITE_API_URL = https://$SITE/api
     VITE_WS_URL  = https://$SITE/ws
EOF
