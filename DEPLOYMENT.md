# CyroHost deployment

The repository has two applications:

- Next.js 15 site at the repository root, production server on port **3000**. It is not a static site. `/api/contact` runs in the Next.js server, so the production image runs `node server.js`, not a development server and not nginx.
- Spring Boot 3.5 API in `backend/`, Java **21**, Maven, port **8080**. Health is already provided by Actuator:
  - `GET /actuator/health`
  - `GET /actuator/health/liveness`
  - `GET /actuator/health/readiness`

PostgreSQL 16 is the database. Flyway applies migrations on startup and does not wipe existing data. Hibernate validates the schema. It does not create or drop tables.

The only git branch in this repository is `main`. Jenkins deploys only when `DEPLOY_ENABLED=true` and the built branch equals `PRODUCTION_BRANCH`. That variable defaults to `main`.

Nothing in this document is a live production environment. No VPS address, registry, or credential is configured in the repository.

## 1. Local Docker setup

From the repository root:

```bash
cp .env.example .env
openssl rand -base64 48
```

Put the generated value in `JWT_SECRET` and choose a `POSTGRES_PASSWORD`. Leave `CYROHOST_ADMIN_PASSWORD` empty unless you want the first admin created. Set `NEXT_PUBLIC_API_URL=http://localhost:8080` before the first image build. That value is compiled into the frontend.

```bash
docker compose up -d --build
curl -fsS http://127.0.0.1:8080/actuator/health/readiness
curl -fsS http://127.0.0.1:3000/
```

PostgreSQL is only on the Compose network. It is not published to the host by the root compose file.

`backend/docker-compose.yml` is the older host-development database. It publishes Postgres on `127.0.0.1:5432` so `mvn spring-boot:run` on the host can connect. It requires `POSTGRES_PASSWORD` and is not the production stack.

Stop the stack without deleting data:

```bash
docker compose stop
```

Do not run `docker compose down -v` against a database you need to keep.

## 2. Production Docker setup

Production uses images that Jenkins has already built and pushed:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans --no-build
```

The server copy of `.env` must set `CYROHOST_BACKEND_IMAGE` and `CYROHOST_FRONTEND_IMAGE` to immutable tags. Jenkins `deploy/remote-up.sh` updates those two lines, pulls, starts, and checks health. It does not delete the Postgres volume.

The browser calls `NEXT_PUBLIC_API_URL` directly. In production that must be the public API origin, for example `https://api.example.com`, and it must be present when the frontend image is built. `FRONTEND_ORIGIN` must be the public site origin. Set `COOKIE_SECURE=true` when both are HTTPS. If a reverse proxy terminates TLS, set `SERVER_FORWARD_HEADERS=framework` only for a proxy you trust.

## 3. Required environment variables

Copy `.env.example`. These are required for the API to start:

| Variable | Purpose |
| --- | --- |
| `POSTGRES_PASSWORD` | Database password. Also used as `DB_PASSWORD` inside Compose. |
| `JWT_SECRET` | HMAC secret, at least 32 bytes. |
| `FRONTEND_ORIGIN` | Browser origin allowed by CORS. |
| `PUBLIC_BASE_URL` | Public API origin used for OAuth redirects. |
| `NEXT_PUBLIC_API_URL` | Public API origin compiled into the frontend. |

Also set `POSTGRES_DB`, `POSTGRES_USER`, `COOKIE_SECURE`, and the image names on the server. Mail, OAuth, the admin bootstrap password, and `CONTACT_WEBHOOK_URL` stay empty until those services exist. Empty mail does not stop sign-in or VPS requests.

Do not put these values in Git, the Jenkinsfile, or a frontend `NEXT_PUBLIC_` variable except the public API URL.

## 4. Jenkins installation

Use a Jenkins agent with:

- Java 21 (`JAVA_HOME` pointing at a Java 21 JDK, or `/usr/lib/jvm/java-21-openjdk-amd64`)
- Maven 3.9
- Node.js 24 and npm
- Docker Engine and Docker Compose v2
- Docker available to the tests. Backend tests start PostgreSQL with Testcontainers.

Create a Pipeline job, or a multibranch Pipeline, from this repository's `Jenkinsfile`. Set the job environment:

| Variable | Example | Notes |
| --- | --- | --- |
| `PRODUCTION_BRANCH` | `main` | Only this branch can deploy. |
| `DEPLOY_ENABLED` | `false` | Set to `true` only after the registry and VPS exist. |
| `DOCKER_REGISTRY` | `ghcr.io` | No trailing slash. |
| `DOCKER_NAMESPACE` | `your-org` | Registry owner or project. |
| `VPS_HOST` |  | Public DNS name or address. You provide this. |
| `VPS_USER` |  | SSH user. You provide this. |
| `VPS_DEPLOY_PATH` | `/opt/cyrohost` | Directory on the VPS. |
| `NEXT_PUBLIC_API_URL` | `https://api.example.com` | Frontend build argument. |
| `PUBLIC_API_URL` | `https://api.example.com` | Optional public health check. |
| `PUBLIC_SITE_URL` | `https://www.example.com` | Optional public health check. |

While `DEPLOY_ENABLED` is not `true`, Jenkins still checks out, builds, tests, and builds local images. Push and deploy are skipped.

## 5. Jenkins plugins

- Pipeline
- Git
- GitHub
- Credentials Binding
- SSH Credentials (provides `sshUserPrivateKey`)
- Plain Credentials (provides the known-hosts secret file)

The Jenkinsfile calls the `docker` CLI. It does not need the Docker Pipeline plugin.

## 6. Jenkins credentials

Create these IDs exactly. Do not paste the secrets into the job script.

| ID | Kind | Used for |
| --- | --- | --- |
| `cyrohost-docker-registry` | Username with password | `docker login` on Jenkins and on the VPS. |
| `cyrohost-vps-ssh` | SSH private key | Deploy over SSH. |
| `cyrohost-vps-known-hosts` | Secret file | `known_hosts` entry for `VPS_HOST`. SSH refuses unknown hosts. |

Create the known-hosts file from a machine that can see the VPS:

```bash
ssh-keyscan -H your.vps.example
```

Store that output as the secret file. Do not commit it.

## 7. Docker registry

Jenkins tags and pushes both:

- `$DOCKER_REGISTRY/$DOCKER_NAMESPACE/cyrohost-backend:$GIT_COMMIT`
- `$DOCKER_REGISTRY/$DOCKER_NAMESPACE/cyrohost-backend:$BUILD_NUMBER`
- `$DOCKER_REGISTRY/$DOCKER_NAMESPACE/cyrohost-frontend:$GIT_COMMIT`
- `$DOCKER_REGISTRY/$DOCKER_NAMESPACE/cyrohost-frontend:$BUILD_NUMBER`

Deployment uses the commit tag. `latest` is not used. Keep the old tags in the registry so a rollback has an image to pull. The pipeline does not delete tagged images. It only prunes unused builder cache older than seven days.

The VPS user must be allowed to pull these images. Jenkins logs in on the VPS during deploy and logs out afterward.

## 8. VPS requirements

- Linux server you control
- Docker Engine and Docker Compose v2
- SSH access for `VPS_USER`
- A directory such as `/opt/cyrohost`
- A `.env` created from `.env.example` with production values
- Enough disk for Postgres and a few retained images
- Open ports for the site and API, or a reverse proxy in front of ports 3000 and 8080

Do not open PostgreSQL to the internet. The production compose file has no Postgres port mapping.

Create the directory and the `.env` before the first deploy. The deploy script fails if `.env` is missing.

## 9. SSH deployment

1. Create an SSH key used only by Jenkins.
2. Install the public key in `VPS_USER`'s `authorized_keys`.
3. Store the private key as credential `cyrohost-vps-ssh`.
4. Store `ssh-keyscan` output as `cyrohost-vps-known-hosts`.

The deploy copies `docker-compose.prod.yml` and `deploy/remote-up.sh`, logs Docker in with the registry credential, and runs the script. The script replaces the two image variables, pulls, and recreates the containers. Existing Postgres data stays in the `cyrohost_pg` volume.

## 10. GitHub webhook

In the GitHub repository settings, add a webhook:

- Payload URL: `https://<your-jenkins>/github-webhook/`
- Content type: `application/json`
- Secret: a webhook secret configured in Jenkins, not in this repository
- Events: pushes

For a multibranch job, Jenkins discovers branches and only the production branch reaches the push and deploy stages. For a single Pipeline job, point it at `main`.

A push does not deploy until `DEPLOY_ENABLED=true` and the registry, VPS, and credentials exist.

## 11. Production deployment flow

```text
git push
  → GitHub webhook
  → Jenkins checkout of main
  → backend package and tests
  → frontend build and eslint
  → docker build of both images
  → image inspect and compose config check
  → docker push of commit and build-number tags
  → SSH to the VPS
  → docker login, compose pull, compose up
  → readiness and site checks
```

The pipeline fails if compilation, tests, lint, image build, push, deploy, or the health check fails. A failed image pull leaves the previous containers running. If the new containers start but do not become healthy, `deploy/remote-up.sh` writes the previous image tags back and starts those images again.

## 12. Health check

Inside the VPS, the deploy script requests:

- `http://127.0.0.1:$BACKEND_PUBLISH_PORT/actuator/health/readiness`
- `http://127.0.0.1:$FRONTEND_PUBLISH_PORT/`

It retries for about 60 seconds. Readiness stays down until Postgres accepts connections and Flyway finishes. Mail is not part of health, because SMTP is optional.

If `PUBLIC_API_URL` and `PUBLIC_SITE_URL` are set on the Jenkins job, Jenkins also requests those public URLs after the remote check.

## 13. Rollback

Images remain in the registry under their commit SHA and Jenkins build number.

On the VPS:

```bash
cd /opt/cyrohost
# Set both variables to the previous commit SHA.
# CYROHOST_BACKEND_IMAGE=registry/namespace/cyrohost-backend:<previous-sha>
# CYROHOST_FRONTEND_IMAGE=registry/namespace/cyrohost-frontend:<previous-sha>
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans --no-build
curl -fsS http://127.0.0.1:8080/actuator/health/readiness
curl -fsS http://127.0.0.1:3000/
```

Do not delete the database volume as part of a rollback. The automatic health rollback in `deploy/remote-up.sh` only restores the previous image tags. It does not choose a tag by itself beyond the `.env` that was on the server before that deploy.

## 14. Common errors

- **Java is not 21.** Set `JAVA_HOME` on the Jenkins agent. The pipeline rejects other versions.
- **Backend tests cannot start Postgres.** The agent needs a working Docker socket for Testcontainers.
- **Frontend calls the wrong API.** Rebuild the frontend image. `NEXT_PUBLIC_API_URL` is fixed at build time.
- **Cookies are dropped.** `COOKIE_SECURE=true` requires HTTPS. `FRONTEND_ORIGIN` must be the exact browser origin.
- **JWT_SECRET must be set.** The API exits on startup when the secret is shorter than 32 bytes.
- **Admin account was not created.** `CYROHOST_ADMIN_PASSWORD` was empty. Set it and restart once. A later restart does not replace the stored password.
- **Pull fails on the VPS.** The registry login or image name is wrong. The previous containers stay up.
- **Port 5432 published by mistake.** Use the root compose files, not `backend/docker-compose.yml`, on the VPS.

## 15. Security precautions

- Keep `.env`, SSH keys, and registry passwords out of Git. `.gitignore` ignores `.env` and `.env.*`, with an exception for the example files.
- Containers run as non-root users and with `no-new-privileges`. They are not privileged.
- Do not print `JWT_SECRET`, database passwords, or registry passwords in Jenkins. The pipeline does not enable shell tracing.
- Rotate any credential that has appeared in a shell history, a git remote URL, or a log.
- Leave `EXPOSE_DEV_RESET_TOKEN=false`.
- Put TLS in front of the published site and API before customers use them.
- Restrict SSH to the Jenkins key and your own administration key.
