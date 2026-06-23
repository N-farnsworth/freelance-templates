## Automated Deployment Verification

The ECS/Fargate deployment has been verified manually and through GitHub Actions.

The service is deployed through this pipeline:

```text
GitHub push
→ GitHub Actions
→ npm ci
→ typecheck
→ test
→ build
→ Docker build
→ ECR push
→ ECS task definition render
→ ECS task definition deploy
→ ECS service stability check
```

The deployment uses the commit SHA as the ECS image tag.

Example deployed image:

```text
719514706718.dkr.ecr.us-east-1.amazonaws.com/node-typescript-ci:f326a99526aa6f904112aa23395069dec4b14398
```

This proves that ECS is deploying an immutable image artifact rather than relying on the mutable `latest` tag.

## Verified AWS Resources

```text
AWS account: 719514706718
Region: us-east-1

ECR repository: node-typescript-ci
ECS cluster: freelance-templates-cluster
ECS service: node-typescript-ci-service
Task definition family: node-typescript-ci
Current verified task definition revision: node-typescript-ci:2

Application Load Balancer: node-typescript-ci-alb
ALB DNS name: node-typescript-ci-alb-1607120896.us-east-1.elb.amazonaws.com
Target group: node-typescript-ci-tg
Target type: ip
Target port: 3000
Health check path: /health

CloudWatch log group: /ecs/node-typescript-ci
```

## Verified Endpoint Behavior

The public ALB endpoint was tested with:

```bash
curl -i "http://$ALB_DNS_NAME/health"
curl -i "http://$ALB_DNS_NAME/"
curl -i "http://$ALB_DNS_NAME/nope"
```

Verified responses:

```text
GET /health → 200 OK
GET /       → 200 OK
GET /nope   → 404 Not Found
```

Observed response bodies:

```json
{"status":"ok"}
```

```json
{"status":"running"}
```

```json
{"error":"Not Found"}
```

## Automated Deployment Proof

A visible application response change was pushed to GitHub.

The GitHub Actions workflow:

```text
✅ Built the application
✅ Ran typecheck
✅ Ran tests
✅ Built the Docker image
✅ Pushed the image to ECR with the commit SHA tag
✅ Rendered the ECS task definition with the commit SHA image
✅ Deployed the new task definition revision to ECS
✅ Waited for ECS service stability
```

After the workflow succeeded, the public ALB endpoint returned the updated response from the new application version.

This proves:

```text
code change
→ git push
→ CI validation
→ image build
→ image publish
→ ECS deployment
→ ALB health check
→ public endpoint update
```

## Scale Service Up

If the service was previously scaled down to avoid running costs, scale it back to one running task:

```bash
aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --desired-count 1 \
  --region "$AWS_REGION"
```

Verify:

```bash
aws ecs describe-services \
  --cluster "$CLUSTER_NAME" \
  --services "$SERVICE_NAME" \
  --region "$AWS_REGION" \
  --query 'services[0].{Desired:desiredCount,Running:runningCount,Pending:pendingCount}' \
  --output table
```

Expected:

```text
Desired: 1
Running: 1
Pending: 0
```

Then verify target health:

```bash
aws elbv2 describe-target-health \
  --target-group-arn "$TARGET_GROUP_ARN" \
  --region "$AWS_REGION" \
  --query 'TargetHealthDescriptions[*].{Target:Target.Id,Port:Target.Port,State:TargetHealth.State,Reason:TargetHealth.Reason,Description:TargetHealth.Description}' \
  --output table
```

Expected:

```text
State: healthy
Port: 3000
```

## Scale Service Down

To avoid unnecessary Fargate runtime cost during testing, scale the service down to zero:

```bash
aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --desired-count 0 \
  --region "$AWS_REGION"
```

Verify:

```bash
aws ecs describe-services \
  --cluster "$CLUSTER_NAME" \
  --services "$SERVICE_NAME" \
  --region "$AWS_REGION" \
  --query 'services[0].{Desired:desiredCount,Running:runningCount,Pending:pendingCount}' \
  --output table
```

Expected:

```text
Desired: 0
Running: 0
Pending: 0
```

When scaled down to zero, the ALB may return:

```text
503 Service Temporarily Unavailable
```

This is expected because the target group has no healthy running targets.

## Rollback Notes

Rollback is possible because each deployment creates a new ECS task definition revision with a specific image tag.

Rollback strategy:

```text
1. Identify the previously working task definition revision.
2. Update the ECS service to use that previous revision.
3. Wait for ECS service stability.
4. Verify ALB health checks.
5. Curl the public endpoint.
```

Example rollback shape:

```bash
aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --task-definition node-typescript-ci:<previous-good-revision> \
  --region "$AWS_REGION"
```

Then verify:

```bash
aws ecs describe-services \
  --cluster "$CLUSTER_NAME" \
  --services "$SERVICE_NAME" \
  --region "$AWS_REGION" \
  --query 'services[0].{TaskDefinition:taskDefinition,Desired:desiredCount,Running:runningCount,Pending:pendingCount}' \
  --output table
```

## Production Gaps

This deployment works, but it is not fully production-grade yet.

Remaining production work:

```text
Infrastructure as Code
HTTPS
Route53 DNS
ACM certificate
HTTP to HTTPS redirect
CloudWatch alarms
Structured logs
Deployment rollback runbook
Staging and production environments
GitHub environment approval gates
Least-privilege IAM review
```

The next major improvement is Infrastructure as Code.

Manual-created infrastructure proves understanding.

Infrastructure as Code proves repeatability.