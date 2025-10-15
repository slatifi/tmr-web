#!/bin/sh

pnpx prisma@6.17.0 migrate deploy
node dist/src/main.js
