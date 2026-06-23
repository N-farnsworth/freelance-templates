import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECR Repository
    const repo = new ecr.Repository(this, 'AppRepo', {
      repositoryName: 'node-typescript-ci-cdk',
    });

    // CloudWatch log group
    const logGroup = new logs.LogGroup(this, 'AppLogGroup', {
      logGroupName: '/ecs/node-typescript-ci-cdk',
      retention: logs.RetentionDays.ONE_WEEK,
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: 'freelance-templates-cluster-cdk',
    });

  }
}
