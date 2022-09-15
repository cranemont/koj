#!/bin/bash
set -ex

BASEDIR=$(dirname $(realpath $0))
cd $BASEDIR

rm -f backend/.env

if [ -n "$POSTGRES_USER" ] && \
   [ -n  "$POSTGRES_PASSWORD" ] && \
   [ -n  "$POSTGRES_DB" ] && \
   [ -n  "$POSTGRES_HOST" ] && \
   [ -n  "$POSTGRES_PORT" ]
then
    echo "DATABASE_URL=postgresql://"$POSTGRES_USER":"$POSTGRES_PASSWORD"@"$POSTGRES_HOST":"$POSTGRES_PORT"/"$POSTGRES_DB"?schema=public" > backend/.env
else
    echo "DATABASE_URL=postgresql://skku:skku@postgres:5432/skku?schema=public" > backend/.env
    POSTGRES_HOST=postgres
    POSTGRES_PORT=5432
fi

if [ -n "$RABBITMQ_USER" ] && \
   [ -n  "$RABBITMQ_PASS" ] && \
   [ -n  "$RABBITMQ_HOST" ] && \
   [ -n  "$RABBITMQ_PORT" ]
then
    echo "AMQP_URI=amqp://"$RABBITMQ_USER":"$RABBITMQ_PASS"@"$RABBITMQ_HOST":"$RABBITMQ_PORT"/%2f" >> backend/.env
else
    echo "AMQP_URI=amqp://skku:1234@rabbitmq-backend:5672/%2f" >> backend/.env
    RABBITMQ_HOST=rabbitmq-backend
    RABBITMQ_PORT=5672
fi

while ! nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do sleep 3; done
>&2 echo "Postgres is up - applying prisma migration..."

cd $BASEDIR/backend
npx prisma generate
npx prisma migrate deploy

while ! nc -z "$RABBITMQ_HOST" "$RABBITMQ_PORT"; do sleep 3; done
>&2 echo "rabbitmq is up - server running..."

node ./dist/main.js
