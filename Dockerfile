# @license
# Copyright 2026 Google LLC
# SPDX-License-Identifier: Apache-2.0

FROM node:20-alpine

WORKDIR /usr/src/app

# Copy dependency files first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies using reproducible ci strategy
RUN npm ci --only=production

# Copy application source code
COPY . .

EXPOSE 8080

CMD [ "node", "server.js" ]
