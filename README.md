# Freelance Templates

Reusable infrastructure and deployment templates for freelance client work. Each template is designed as a production-minded starting point for common client deployment workflows.

![CI](https://github.com/N-farnsworth/freelance-templates/actions/workflows/ci.yml/badge.svg)

## Templates

### node-typescript-ci

A minimal Node.js + TypeScript project with testing, Docker, GitHub Actions, AWS OIDC authentication, and ECR image publishing already configured.

Use this as a starting point for TypeScript backend services, worker services, internal tools, or deployment pipeline experiments.

**Stack:** Node.js 24, TypeScript, Vitest, Docker, Docker Compose, GitHub Actions, AWS ECR, GitHub OIDC

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

## Docker

Build the Docker image:

```bash
cd node-typescript-ci
docker build -t node-typescript-ci .
```

Run the container:

```bash
docker run --rm node-typescript-ci
```

Or run with Docker Compose:

```bash
docker compose up --build
```

Expected output:

```text
2 + 3 = 5
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

* TypeScript configured with separate `src/` and `dist/`
* Vitest test setup
* npm professional run loop
* Multi-stage Dockerfile
* `.dockerignore`
* Docker Compose for local container runs
* GitHub Actions CI
* Node dependency caching in GitHub Actions
* Docker image build in CI
* GitHub OIDC authentication to AWS
* Amazon ECR login from GitHub Actions
* Docker image publishing to ECR with `latest` and commit SHA tags
* Clean project structure ready to extend

## Current Status

Completed:

```text
✅ Node/TypeScript project setup
✅ TypeScript typechecking
✅ Vitest testing
✅ Docker multi-stage build
✅ Docker Compose local run
✅ GitHub Actions CI
✅ AWS OIDC authentication
✅ ECR image publishing
```

Not included yet:

```text
❌ Long-running HTTP service
❌ Health check endpoint
❌ ECS/Fargate deployment
❌ Load balancer
❌ Terraform-managed infrastructure
❌ Staging/production environment separation
❌ Deployment approval gates
❌ Monitoring and alerting
```

## Next Milestone

The next milestone is to convert the current CLI-style container into a minimal long-running HTTP service with health checks.

Planned endpoints:

```text
GET /health
GET /
```

This is required before deploying to ECS/Fargate because Fargate services expect a long-running container process, and load balancers need a stable health check endpoint.

## Future Work

* Convert the template into a minimal HTTP service
* Add Docker Compose with Postgres
* Add Terraform modules for ECR, IAM, ECS, and Fargate
* Deploy a running container service to ECS/Fargate
* Add staging and production GitHub Environments
* Add production approval gates
* Add CloudWatch logs, dashboards, and alarms
