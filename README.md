## CI/CD Pipeline

On every push, GitHub Actions runs the full validation, image publishing, and ECS deployment pipeline:

```text
npm ci
npm run typecheck
npm run test
npm run build
docker build
AWS OIDC authentication
ECR login
Docker image push to ECR
Render ECS task definition with commit SHA image
Deploy task definition to ECS service
Wait for ECS service stability
```

The workflow verifies that the project can be installed, typechecked, tested, built, containerized, authenticated to AWS, published as a Docker image artifact, and deployed to ECS/Fargate.

The deployment uses an immutable commit SHA image tag rather than relying on `latest`.

Deployment flow:

```text
GitHub push
→ GitHub Actions
→ Docker image build
→ ECR image push
→ ECS task definition render
→ ECS task definition revision
→ ECS service update
→ Fargate rolling deployment
→ ALB health check
→ public service update
```

## AWS Deployment

The `node-typescript-ci` service is deployed to AWS ECS/Fargate behind an Application Load Balancer.

Current deployed resources:

```text
ECR repository: node-typescript-ci
ECS cluster: freelance-templates-cluster
ECS service: node-typescript-ci-service
Task definition family: node-typescript-ci
Application Load Balancer: node-typescript-ci-alb
Target group: node-typescript-ci-tg
Container port: 3000
Health check path: /health
CloudWatch log group: /ecs/node-typescript-ci
```

Public endpoint:

```text
http://node-typescript-ci-alb-1607120896.us-east-1.elb.amazonaws.com
```

Expected endpoint behavior:

```text
GET /health → 200 OK
GET /       → 200 OK
GET /nope   → 404 Not Found
```

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
- ECS task definition stored in the repository
- ECS task definition rendering in CI
- Automated ECS/Fargate deployment from GitHub Actions
- Application Load Balancer with `/health` health checks
- CloudWatch logging for container output
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
✅ ECS/Fargate service deployment
✅ Application Load Balancer
✅ Target group health checks
✅ CloudWatch container logs
✅ Automated ECS deployment from GitHub Actions
✅ Immutable commit SHA image deployment
```

Not included yet:

```text
❌ Infrastructure as Code for AWS resources
❌ Public DNS
❌ Public TLS certificate
❌ HTTPS listener
❌ HTTP to HTTPS redirect
❌ Staging/production environment separation
❌ Deployment approval gates
❌ Monitoring dashboards and alarms
❌ Automated rollback workflow
```

## Next Milestone

The next milestone is to convert the manually created AWS infrastructure into repeatable Infrastructure as Code.

Recommended next step:

```text
AWS resources currently exist and work.
Now make them reproducible with CDK or Terraform.
```

Target IaC resources:

```text
ECR repository
ECS cluster
CloudWatch log group
Task execution role
Task definition
ECS service
Application Load Balancer
Target group
Listener
Security groups
```

After IaC, add:

```text
Route53 DNS
ACM certificate
HTTPS :443 listener
HTTP → HTTPS redirect
CloudWatch alarms
Deployment rollback documentation
```