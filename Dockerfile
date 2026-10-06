# Next.js production server. The site is not a static export: /api/contact runs on the server.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:24-alpine AS runtime
RUN apk add --no-cache curl \
    && addgroup -S -g 10001 cyro \
    && adduser -S -u 10001 -G cyro cyro
WORKDIR /app
COPY --from=build --chown=cyro:cyro /app/.next/standalone ./
COPY --from=build --chown=cyro:cyro /app/.next/static ./.next/static
COPY --from=build --chown=cyro:cyro /app/public ./public
USER cyro
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=10 \
    CMD curl -fsS http://127.0.0.1:3000/ || exit 1
CMD ["node", "server.js"]
