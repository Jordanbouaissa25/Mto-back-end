FROM node:20.15.0-alpine AS dependencies
USER node
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm ci

FROM dependencies AS development
COPY --chown=node:node ./ ./
COPY --chown=node:node scripts/install.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/install.sh
EXPOSE 3001
ENTRYPOINT ["install.sh"]
CMD ["npm", "start"]

FROM dependencies AS test
COPY --chown=node:node ./ ./
CMD ["node", "server"]