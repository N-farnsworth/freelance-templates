# Deployment Plan: ECS/Fargate HTTP Service

This document defines the planned AWS deployment path for the Node TypeScript HTTP service.

The goal is to deploy the existing Dockerized service to AWS ECS/Fargate behind an Application Load Balancer, using the existing ECR image publishing pipeline as the container artifact source.

## Current Application State

The application is currently a minimal Node.js + TypeScript HTTP service.

Completed locally:

```text
✅ TypeScript source builds to dist/
✅ Unit tests pass
✅ Docker image builds locally
✅ Container runs as a long-running service
✅ Service listens on port 3000
✅ /health returns 200 OK
✅ / returns 200 OK
✅ Unknown routes return 404
✅ GitHub Actions builds and pushes image to ECR
```

Current container behavior:

```text
containerPort: 3000
health check path: /health
runtime command: node dist/server.js
```

## Deployment Goal

Deploy the containerized HTTP service to AWS using:

```text
Amazon ECR
Amazon ECS
AWS Fargate
Application Load Balancer
Target Group
Security Groups
CloudWatch Logs
```

End state:

```text
User/browser
→ Application Load Balancer
→ ECS/Fargate service
→ Node container on port 3000
→ /health used for health checks
```

## Architecture

```text
Internet
  ↓
Application Load Balancer
  ↓
Target Group
  ↓
ECS Service
  ↓
Fargate Task
  ↓
Container: node-typescript-ci
  ↓
Node HTTP server listening on port 3000
```

## AWS Resources Needed

### 1. ECR Repository

Already exists.

Purpose:

```text
Stores Docker images built by GitHub Actions.
```

Expected image tags:

```text
latest
<git-commit-sha>
```

The first manual ECS deployment can use `latest`.

A later production workflow should prefer immutable commit SHA tags.

### 2. ECS Cluster

Purpose:

```text
Logical group where the ECS service runs.
```

Suggested name:

```text
freelance-templates-cluster
```

### 3. CloudWatch Log Group

Purpose:

```text
Stores logs emitted by the container.
```

Suggested name:

```text
/ecs/node-typescript-ci
```

### 4. ECS Task Definition

Purpose:

```text
Defines how to run the container.
```

Required settings:

```text
Launch type: Fargate
CPU: 0.25 vCPU
Memory: 0.5 GB
Network mode: awsvpc
Container image: ECR image
Container port: 3000
Log driver: awslogs
```

Container settings:

```text
name: node-typescript-ci
portMappings:
  containerPort: 3000
environment:
  PORT=3000
```

### 5. IAM Roles

The task definition needs:

```text
Task execution role
```

The execution role allows ECS/Fargate to:

```text
Pull image from ECR
Write logs to CloudWatch
```

The application itself does not need an application task role yet because it does not call AWS APIs.

### 6. VPC and Subnets

For the first deployment, use the default VPC to reduce complexity.

Required networking:

```text
Public subnets
Auto-assign public IP enabled for Fargate tasks
```

Later production versions can move tasks into private subnets with NAT or VPC endpoints.

### 7. Security Groups

Use two security groups.

#### ALB Security Group

Inbound:

```text
HTTP 80 from 0.0.0.0/0
```

Outbound:

```text
Allow traffic to ECS task security group on port 3000
```

#### ECS Task Security Group

Inbound:

```text
TCP 3000 from ALB security group only
```

Outbound:

```text
Allow all outbound
```

The ECS task should not be directly open to the internet.

Only the ALB should receive public traffic.

### 8. Application Load Balancer

Purpose:

```text
Public entrypoint for HTTP traffic.
```

Listener:

```text
HTTP :80
```

For the first deployment, skip HTTPS.

Later production versions should add:

```text
Route53 DNS
ACM certificate
HTTPS :443 listener
HTTP → HTTPS redirect
```

### 9. Target Group

Purpose:

```text
Routes ALB traffic to healthy ECS tasks.
```

Target type:

```text
ip
```

Protocol:

```text
HTTP
```

Port:

```text
3000
```

Health check:

```text
Path: /health
Expected status: 200
```

### 10. ECS Service

Purpose:

```text
Keeps the desired number of Fargate tasks running.
```

Suggested settings:

```text
Desired count: 1
Launch type: Fargate
Task definition: node-typescript-ci
Load balancer: Application Load Balancer
Target group: node-typescript-ci target group
Container name: node-typescript-ci
Container port: 3000
```

If the task crashes or fails health checks, ECS should replace it.

## Manual Deployment Phases

### Phase 1: Confirm Image Exists in ECR

Confirm the latest image exists in ECR.

Expected:

```text
ECR repository contains image tagged latest and commit SHA.
```

### Phase 2: Create ECS Cluster

Create a new ECS cluster for the template service.

Expected:

```text
ECS cluster exists and is empty.
```

### Phase 3: Create CloudWatch Log Group

Create a log group for ECS task logs.

Expected:

```text
/ecs/node-typescript-ci exists.
```

### Phase 4: Create Task Definition

Create a Fargate task definition that uses the ECR image.

Expected:

```text
Task definition is registered successfully.
```

### Phase 5: Create ALB and Target Group

Create a public Application Load Balancer and a target group pointing to port 3000.

Expected:

```text
ALB exists.
Target group exists.
Health check path is /health.
```

### Phase 6: Create ECS Service

Create an ECS service that runs one Fargate task and attaches it to the ALB target group.

Expected:

```text
ECS service desired count is 1.
One task starts.
Task registers in target group.
Target becomes healthy.
```

### Phase 7: Test Public Endpoint

Use the ALB DNS name.

Commands:

```bash
curl -i http://<alb-dns-name>/health
curl -i http://<alb-dns-name>/
curl -i http://<alb-dns-name>/nope
```

Expected:

```text
/health → 200 OK
/       → 200 OK
/nope   → 404 Not Found
```

### Phase 8: Check Logs

Check CloudWatch logs.

Expected:

```text
Server startup log appears.
Requests may appear if request logging is added later.
```

## Success Criteria

Day 5 is complete when:

```text
✅ ECS cluster exists
✅ Task definition registered
✅ ECS service created
✅ Fargate task is running
✅ Target group reports healthy target
✅ ALB DNS name serves /health
✅ ALB DNS name serves /
✅ Unknown route returns 404
✅ Logs are visible in CloudWatch
✅ Deployment steps are documented
```

## Known Risks

### Wrong Container Port

Symptom:

```text
ALB health checks fail.
```

Cause:

```text
Target group or ECS service points to the wrong port.
```

Expected port:

```text
3000
```

### Wrong Health Check Path

Symptom:

```text
Target remains unhealthy.
```

Expected path:

```text
/health
```

### Security Group Blocks ALB to Task

Symptom:

```text
Task runs, but target group stays unhealthy.
```

Fix:

```text
Allow inbound TCP 3000 to ECS task security group from ALB security group.
```

### App Binds to Localhost Only

Symptom:

```text
Container runs but cannot receive external traffic.
```

Fix:

```text
Server must listen on 0.0.0.0 or default Node server binding.
```

### Wrong ECR Image Tag

Symptom:

```text
Old app version deploys.
```

Fix:

```text
Use latest for first manual deployment.
Use commit SHA tags for traceable deployments later.
```

## Cleanup Plan

If this is only a learning/test deployment, delete resources after testing to avoid unnecessary AWS charges.

Delete in this order:

```text
ECS service
ECS task definition revisions if desired
ALB
Target group
Security groups created for this service
CloudWatch log group if no longer needed
ECS cluster
```

Do not delete the ECR repository unless the image history is no longer needed.

## Future Production Improvements

After the first manual deployment works:

```text
Add CDK or Terraform infrastructure
Use private subnets for Fargate tasks
Add HTTPS with ACM
Add Route53 DNS
Use immutable commit SHA image tags
Add GitHub deployment environments
Add manual production approval gates
Add CloudWatch alarms
Add request logging
Add structured JSON logs
Add container health checks
Add autoscaling
```