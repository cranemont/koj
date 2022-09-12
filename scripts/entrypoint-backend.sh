#!/bin/bash
set -ex

BASEDIR=$(dirname $(realpath $0))
cd $BASEDIR

if [ ! -z $POSTGRES_USER ] && \
   [ ! -z  $POSTGRES_PASSWORD ] && \
   [ ! -z  $POSTGRES_DB ] && \
   [ ! -z  $POSTGRES_HOST ] && \
   [ ! -z  $POSTGRES_PORT ]
then
    echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public" > backend/.env
else
    echo "DATABASE_URL=postgresql://skku:skku@postgres:5432/skku?schema=public" > backend/.env
    POSTGRES_HOST=postgres
    POSTGRES_PORT=5432
fi

while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do sleep 3; done
>&2 echo "Postgres is up - applying prisma migration..."

cd $BASEDIR/backend
npx prisma generate
npx prisma migrate deploy

node ./dist/main.js
