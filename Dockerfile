# @license
# Copyright 2026 Google LLC
# SPDX-License-Identifier: Apache-2.0

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 8080

CMD [ "node", "server.js" ]
