# CyroHost auth API

Java 21 and Spring Boot 3.5. Passwords are hashed with BCrypt. Access tokens are short-lived JWTs. Refresh tokens are random, stored only as SHA-256 hashes, and rotated. Both tokens are `HttpOnly` cookies. The browser never stores them in `localStorage`.

## Local PostgreSQL

From `backend/`:

```bash
docker compose up -d
```

Set `POSTGRES_PASSWORD` before `docker compose up`. The database name and user default to `cyrohost`. The volume keeps the password it was created with. Flyway creates the tables on API startup.

## Run the API

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export JWT_SECRET="$(openssl rand -base64 48)"
export DB_URL=jdbc:postgresql://localhost:5432/cyrohost
export DB_USERNAME=cyrohost
export DB_PASSWORD="$POSTGRES_PASSWORD"
export FRONTEND_ORIGIN=http://localhost:3000
export COOKIE_SECURE=false
cd backend
mvn spring-boot:run
```

`JWT_SECRET` must be at least 32 bytes. The process refuses to start without it. Copy `backend/.env.example` for the full list. Do not commit real values.

The API listens on `http://localhost:8080`. CORS allows `FRONTEND_ORIGIN` only.

## Run the site

From the repository root:

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8080` if the API is not on that address. Login is `/login`. Create Account is `/register`.

## Tests

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
cd backend
mvn test
```

Tests start PostgreSQL with Testcontainers. Docker must be running.

## Cookies and CSRF

`cyro_access` lasts 15 minutes. `cyro_refresh` lasts 1 day, or 30 days when Remember me is checked. `cyro_csrf` is `HttpOnly`; `GET /api/auth/csrf` also returns the token in JSON so the page can send `X-CSRF-Token`. State-changing requests require that header. Cookies use `SameSite=Lax`.

Logout revokes the refresh session and clears both cookies. Reusing an old refresh token revokes the replacement session as well.

This rate limit is in memory: 8 failed logins per email and IP address in 15 minutes. A second API instance does not share that count. Put a shared limiter, such as the reverse proxy or Redis, in front of production.

## Password reset and email

`POST /api/auth/forgot-password` always returns the same message. Reset tokens are random, hashed, single-use, and expire after 30 minutes. The raw token is not logged.

Mail is sent only when `MAIL_HOST` and `MAIL_FROM` are set. Until then, no email is delivered.

`EXPOSE_DEV_RESET_TOKEN=true` adds `devResetToken` to that JSON response so a developer can open `/reset-password?token=...` on a private machine. The default is `false`. Leave it false in production.

## Social login

Google, Facebook, and Apple use the authorization-code flow with PKCE, state, and nonce. The browser cannot submit an email and be signed in. Provider tokens are checked on the server. An existing email is not linked automatically.

Until the credentials below are set, the buttons say that setup is pending and `GET /api/auth/oauth/{provider}/start` returns `oauth_not_configured`.

Redirect URIs to register:

- `http://localhost:8080/api/auth/oauth/google/callback`
- `http://localhost:8080/api/auth/oauth/facebook/callback`
- `http://localhost:8080/api/auth/oauth/apple/callback`

Use the production API origin in place of `localhost:8080` when you deploy. `PUBLIC_BASE_URL` must match those URIs exactly.

Google Cloud: OAuth client, authorized redirect URI above, scopes `openid`, `email`, and `profile`. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Meta: Facebook Login product, the redirect URI above, and OpenID `email`. Set `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`.

Apple: Services ID as `APPLE_CLIENT_ID`, team id, key id, and the Sign in with Apple private key in `APPLE_PRIVATE_KEY`. Return URL is the Apple callback above.

## Production

- Serve the site and the API on the same registrable domain, for example `www.cyrohost.com` and `api.cyrohost.com`, so `SameSite=Lax` cookies are sent.
- Terminate HTTPS at the proxy. Set `COOKIE_SECURE=true`.
- Set a unique `JWT_SECRET`, a real database password, and `EXPOSE_DEV_RESET_TOKEN=false`.
- Do not expose actuator endpoints beyond `health` and `info`. Details stay hidden.
- The API uses the socket address for rate limits. The proxy must connect as the client, or rate limiting must move to the proxy. `server.forward-headers-strategy` is `none` so a caller cannot spoof the address with a header.
- Keep OAuth secrets and the Apple key in the process environment, not in the image.
