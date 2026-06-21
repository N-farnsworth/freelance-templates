# Freelance Templates

Reusable infrastructure and deployment templates for freelance client work. Each template is designed as a production-minded starting point for common client deployment workflows.

![CI](https://github.com/N-farnsworth/freelance-templates/actions/workflows/ci.yml/badge.svg)

## Templates

### node-typescript-ci

A minimal Node.js + TypeScript HTTP service with testing, Docker, Docker Compose, GitHub Actions, AWS OIDC authentication, and Amazon ECR image publishing already configured.

Use this as a starting point for TypeScript backend services, internal tools, worker APIs, or deployment pipeline experiments.

**Stack:** Node.js 24, TypeScript, Vitest, Docker, Docker Compose, GitHub Actions, AWS ECR, GitHub OIDC

## What This Template Demonstrates

This template demonstrates a complete development-to-container workflow:

```text
TypeScript source
→ typecheck
→ unit tests
→ build to dist/
→ Docker image build
→ long-running HTTP service
→ health check endpoint
→ ECR image publishing
```

## Project Structure

```text
node-typescript-ci/
  src/
    server.ts       # HTTP service entrypoint
    math.ts         # Example reusable module
    math.test.ts    # Example unit test

  Dockerfile
  docker-compose.yml
  package.json
  package-lock.json
  tsconfig.json
```

## Local Development

From the template directory:

```bash
cd node-typescript-ci
npm ci
npm run typecheck
npm run test
npm run build
```

Run the app locally:

```bash
npm run dev
```

The server listens on port `3000` by default.

You can override the port with:

```bash
PORT=4000 npm run dev
```

## HTTP Endpoints

### Health Check

```text
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

### Root Route

```text
GET /
```

Returns basic app/service information.

### Unknown Routes

Unknown routes return HTTP status `404` with a JSON error response.

## Test the Service Locally

With the server running:

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/
curl -i http://localhost:3000/nope
```

Expected behavior:

```text
/health → 200 OK
/       → 200 OK
/nope   → 404 Not Found
```

## Docker

Build the Docker image:

```bash
cd node-typescript-ci
docker build -t node-typescript-ci .
```

Run the container:

```bash
docker run --rm -p 3000:3000 node-typescript-ci
```

Then test from another terminal:

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/
curl -i http://localhost:3000/nope
```

If port `3000` is already in use, map a different host port:

```bash
docker run --rm -p 3001:3000 node-typescript-ci
```

Then test:

```bash
curl -i http://localhost:3001/health
```

## Docker Compose

Run with Docker Compose:

```bash
cd node-typescript-ci
docker compose up --build
```

Then test:

```bash
curl -i http://localhost:3000/health
```

Stop the service with:

```text
Ctrl+C
```

## Docker Notes

The app listens on port `3000` inside the container.

```dockerfile
EXPOSE 3000
```

documents the intended container port, but it does not publish the port to the host machine.

The host-to-container mapping happens with:

```bash
docker run -p 3000:3000
```

Meaning:

```text
host port 3000 → container port 3000
```

## Production-Style Start Command

After building TypeScript:

```bash
npm run build
npm start
```

The production entrypoint runs:

```bash
node dist/server.js
```

## CI Pipeline

On every push, GitHub Actions runs the full validation and artifact pipeline:

```text
npm ci
npm run typecheck
npm run test
npm run build
docker build
AWS OIDC authentication
ECR login
Docker image push to ECR
```

The workflow verifies that the project can be installed, typechecked, tested, built, containerized, authenticated to AWS, and published as a Docker image artifact.

## AWS Authentication

This repository uses GitHub OIDC to authenticate GitHub Actions to AWS.

No long-lived AWS access keys are stored in GitHub Secrets.

The workflow assumes an AWS IAM role scoped to this repository and branch, then uses that role to log in to Amazon ECR and push Docker images.

## ECR Image Publishing

Successful workflow runs publish the Docker image to Amazon ECR using two tags:

```text
latest
<git-commit-sha>
```

The `latest` tag is useful for quick manual inspection.

The commit SHA tag is immutable and traceable to the exact Git commit that produced the image.

## What's Included

- TypeScript configured with separate `src/` and `dist/`
- Minimal HTTP service entrypoint
- `/health` endpoint
- Root route
- 404 handling
- Vitest test setup
- npm professional run loop
- Multi-stage Dockerfile
- `.dockerignore`
- Docker Compose for local container runs
- GitHub Actions CI
- Node dependency caching in GitHub Actions
- Docker image build in CI
- GitHub OIDC authentication to AWS
- Amazon ECR login from GitHub Actions
- Docker image publishing to ECR with `latest` and commit SHA tags
- Clean project structure ready to extend

## Current Status

Completed:

```text
✅ Node/TypeScript project setup
✅ TypeScript typechecking
✅ Vitest testing
✅ Long-running HTTP service
✅ Health check endpoint
✅ Docker multi-stage build
✅ Docker Compose local run
✅ Dockerized service container
✅ GitHub Actions CI
✅ AWS OIDC authentication
✅ ECR image publishing
```

Not included yet:

```text
❌ ECS/Fargate deployment
❌ Load balancer
❌ Public DNS
❌ Public TLS certificate
❌ Terraform/CDK-managed runtime infrastructure
❌ Staging/production environment separation
❌ Deployment approval gates
❌ Monitoring and alerting
```

## Next Milestone

The next milestone is deploying this containerized HTTP service to AWS ECS/Fargate behind an Application Load Balancer.

That will require:

```text
ECR image
ECS cluster
Fargate task definition
Fargate service
containerPort 3000
ALB target group
ALB health check path /health
security groups
CloudWatch logs
```

## Future Work

- Deploy the service to ECS/Fargate
- Add an Application Load Balancer
- Configure ALB health checks against `/health`
- Add public DNS with Route53
- Add TLS with ACM
- Add Docker Compose with Postgres
- Add Terraform or CDK modules for runtime infrastructure
- Add staging and production GitHub Environments
- Add production approval gates
- Add CloudWatch logs, dashboards, and alarms