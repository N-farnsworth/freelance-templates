# Freelance Templates

Reusable infrastructure and deployment templates for freelance client work. Each template is a standalone, production-ready starting point.

![CI](https://github.com/N-farnsworth/freelance-templates/actions/workflows/ci.yml/badge.svg)

## Templates

### node-typescript-ci

A minimal Node.js + TypeScript project with Docker and CI already configured. Use as a starting point for any TypeScript backend or tool.

**Stack:** Node.js 20, TypeScript, Vitest, Docker, GitHub Actions

**Run locally:**

```bash
cd node-typescript-ci
npm ci
npm run typecheck
npm run test
npm run build
```

**Run with Docker:**

```bash
cd node-typescript-ci
docker build -t node-typescript-ci .
docker run --rm node-typescript-ci
```

Or with Docker Compose:

```bash
docker compose up --build
```

**What's included:**
- TypeScript configured with separate `src/` and `dist/`
- Vitest for testing
- Multi-stage Dockerfile (build stage + minimal production image)
- Docker Compose for single-command runs
- GitHub Actions pipeline (typecheck, test, build, Docker build on every push)
- Clean project structure ready to extend

## Upcoming

- Docker Compose with Postgres
- GitHub Actions + AWS deployment (OIDC)
- Terraform infrastructure modules
- Monitoring and alerting setup
