import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';

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

    // VPC
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: 'freelance-templates-cluster-cdk',
      vpc,
    });

    const existingRepo = ecr.Repository.fromRepositoryName(this, 'ExistingRepo', 'node-typescript-ci');

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster: cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(existingRepo, 'latest'),
        containerPort: 3000,
        logDriver: ecs.LogDrivers.awsLogs({ 
          logGroup: logGroup,
          streamPrefix: 'ecs', 
        }),
        environment: {
          PORT: '3000',
        },
      },
      desiredCount: 1,
      publicLoadBalancer: true,
      cpu: 256,
      memoryLimitMiB: 512,
      assignPublicIp: true,
    });

    service.targetGroup.configureHealthCheck({
      path: '/health',
    });

  }
}
