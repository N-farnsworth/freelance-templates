# Runbook: Node TypeScript HTTP Service

This runbook documents how to validate, run, troubleshoot, and safely modify the Node TypeScript HTTP service.

## Standard Validation Before Commit

Run these commands before committing:

```bash
npm run typecheck
npm run test
npm run build
docker build -t node-typescript-ci .
```

Then run the container:

```bash
docker run --rm -p 3000:3000 node-typescript-ci
```

In another terminal:

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/
curl -i http://localhost:3000/nope
```

Expected results:

```text
/health → 200 OK
/       → 200 OK
/nope   → 404 Not Found
```

## Starting the App Locally

Development mode:

```bash
npm run dev
```

Production-style local mode:

```bash
npm run build
npm start
```

## Stopping the App

If running locally with `npm run dev` or `npm start`, press:

```text
Ctrl+C
```

If a Docker container is running, list containers:

```bash
docker ps
```

Stop the container:

```bash
docker stop <container_id_or_name>
```

## Port 3000 Already in Use

Symptom:

```text
Bind for 0.0.0.0:3000 failed: port is already allocated
```

Find what is using port `3000`:

```bash
sudo ss -ltnp | grep :3000
```

If Docker is holding the port, list containers:

```bash
docker ps
```

Stop the container using the port:

```bash
docker stop <container_id_or_name>
```

Alternative: use a different host port:

```bash
docker run --rm -p 3001:3000 node-typescript-ci
```

Then test:

```bash
curl -i http://localhost:3001/health
```

## Docker Build Troubleshooting

Build with plain output:

```bash
docker build --progress=plain -t node-typescript-ci .
```

Build without cache:

```bash
docker build --no-cache --progress=plain -t node-typescript-ci .
```

Test Docker networking to npm:

```bash
docker run --rm node:24-alpine npm ping --loglevel=verbose
```

## Why This Service Must Keep Running

A CLI script can start, do work, print output, and exit.

A web service must keep running because infrastructure expects it to remain available for traffic.

For ECS/Fargate service deployments, AWS maintains a desired number of running tasks. If a service container exits, ECS replaces it because the desired running task count is no longer met.

That is why this project runs:

```bash
node dist/server.js
```

instead of a one-shot script.

## Health Check Purpose

The `/health` endpoint exists so infrastructure can ask:

```text
Is this process alive and able to respond?
```

For now, `/health` confirms the HTTP process is alive.

Future versions may include dependency checks, such as database connectivity or downstream service availability.

## Pre-Push Checklist

Before pushing major changes:

```text
[ ] README updated if behavior changed
[ ] RUNBOOK updated if commands/troubleshooting changed
[ ] npm run typecheck passes
[ ] npm run test passes
[ ] npm run build passes
[ ] docker build succeeds
[ ] container runs locally
[ ] /health returns 200
[ ] / returns 200
[ ] unknown route returns 404
[ ] git status reviewed
```

## Commit Message Examples

```bash
git commit -m "Convert TypeScript template to HTTP service"
git commit -m "Document HTTP service runbook"
git commit -m "Add Docker health check documentation"
```