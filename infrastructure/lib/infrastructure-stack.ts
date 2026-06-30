import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

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

    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: 'service-alerts',
    });

    alertTopic.addSubscription(
      new snsSubscriptions.EmailSubscription('nich.farnsworth@gmail.com')
    );

    const http5xxAlarm = new cloudwatch.Alarm(this, 'Http5xxAlarm', {
      metric: service.loadBalancer.metrics.httpCodeElb(
        elbv2.HttpCodeElb.ELB_5XX_COUNT
      ),
      threshold: 1,
      evaluationPeriods: 2,
      alarmDescription: 'ALB returned 5xx errors',
    });

    http5xxAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alertTopic));

    const unhealthyAlarm = new cloudwatch.Alarm(this, 'UnhealthyHostAlarm', {
      metric: service.targetGroup.metrics.unhealthyHostCount(), 
      threshold: 1,
      evaluationPeriods: 2,
      alarmDescription: 'Unhealthy targets detected'  
    });

    unhealthyAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alertTopic));
  }
}
