import type { Construct } from 'constructs';

import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import {
  type UserPool,
  CfnIdentityPool,
  UserPoolClient,
  VerificationEmailStyle,
} from 'aws-cdk-lib/aws-cognito';
import {
  type Environment,
  type StackProps,
  aws_cognito,
  aws_dynamodb,
  aws_iam,
  CfnOutput,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib';
import type { Role } from 'aws-cdk-lib/aws-iam';

export type EnvironmentVariables = Environment & {
  frontendHost: string;
};

export class LogBookyStack extends Stack {
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;
  cognitoIdentityPool: CfnIdentityPool;
  userRoleAuthenticated: Role;

  tableJumps: Table;
  tableSignatures: Table;

  constructor(
    scope: Construct,
    private id: string,
    private props: StackProps & { env: EnvironmentVariables }
  ) {
    super(scope, id, props);
    this.createDatabase();
    this.createCognito();
    this.createRole();
    this.attachRole();

    // this.tableJumps.grant(this.userRoleAuthenticated);

    new CfnOutput(this, 'tableJumps', {
      value: this.tableJumps.tableName,
    });

    new CfnOutput(this, 'tableSignature', {
      value: this.tableSignatures.tableName,
    });

    new CfnOutput(this, 'cognitoUserPoolClientId', {
      value: this.cognitoUserPoolClient.userPoolClientId,
    });

    new CfnOutput(this, 'cognitoUserPoolId', {
      value: this.cognitoUserPool.userPoolId,
    });

    new CfnOutput(this, 'cognitoIdentityPoolRef', {
      value: this.cognitoIdentityPool.ref,
    });
  }

  createDatabase() {
    this.tableJumps = new aws_dynamodb.Table(this, 'jumps', {
      partitionKey: {
        name: 'sourceKey',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'kindKey',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.tableJumps.addGlobalSecondaryIndex({
      indexName: 'SpecificJump',
      partitionKey: {
        name: 'kindKey',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes: [
        'sourceKey',
        'date',
        'locale',
        'aircraft',
        'exitAltitude',
        'jumperName',
        'jumperPhoto',
        'jumperLiscense',
      ],
    });

    this.tableSignatures = new aws_dynamodb.Table(this, 'signatures', {
      partitionKey: {
        name: 'userKey',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'signatureKey',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }

  createCognito() {
    this.cognitoUserPool = new aws_cognito.UserPool(this, 'Cognito', {
      selfSignUpEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
      passwordPolicy: {
        minLength: 6,
        requireDigits: true,
        requireSymbols: false,
        requireLowercase: true,
        requireUppercase: true,
      },
      autoVerify: {
        email: true,
      },
      keepOriginal: {
        email: true,
      },
      userVerification: {
        emailBody:
          'O código de verificação da sua conta no <a href="https://log-booky.codermarcos.zone/confirmar">log booky</a> é {####}',
        emailSubject: 'Código de verificação log booky',
        emailStyle: VerificationEmailStyle.CODE,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const callbackUrls = [this.props.env.frontendHost];

    this.cognitoUserPoolClient = this.cognitoUserPool.addClient(
      'CognitoUserClient',
      {
        authFlows: {
          userPassword: true,
          userSrp: true,
        },
        oAuth: {
          flows: {
            implicitCodeGrant: true,
          },
          callbackUrls,
        },
      }
    );

    this.cognitoIdentityPool = new aws_cognito.CfnIdentityPool(
      this,
      `${this.id}Identity`,
      {
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: this.cognitoUserPoolClient.userPoolClientId,
            providerName: this.cognitoUserPool.userPoolProviderName,
          },
        ],
      }
    );
  }

  createRole() {
    this.userRoleAuthenticated = new aws_iam.Role(
      this,
      'CognitoAuthenticatedRole',
      {
        assumedBy: new aws_iam.FederatedPrincipal(
          'cognito-identity.amazonaws.com',
          {
            StringEquals: {
              'cognito-identity.amazonaws.com:aud':
                this.cognitoIdentityPool.ref,
            },
            'ForAnyValue:StringLike': {
              'cognito-identity.amazonaws.com:amr': 'authenticated',
            },
          },
          'sts:AssumeRoleWithWebIdentity'
        ),
      }
    );

    this.userRoleAuthenticated.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ['cognito-sync:*'],
        resources: ['*'],
      })
    );

    this.userRoleAuthenticated.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ['dynamodb:*'],
        // actions: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:Query'],
        resources: [this.tableJumps.tableArn, this.tableSignatures.tableArn],
        // conditions: {
        //   'ForAllValues:StringEquals': {
        //     'dynamodb:LeadingKeys': [
        //       'USER#${cognito-identity.amazonaws.com:sub}',
        //     ],
        //   },
        // },
      })
    );

    this.tableJumps.grant(this.userRoleAuthenticated);
  }

  attachRole() {
    new aws_cognito.CfnIdentityPoolRoleAttachment(
      this,
      'RoleAttachCognitoIdentity',
      {
        identityPoolId: this.cognitoIdentityPool.ref,
        roles: {
          authenticated: this.userRoleAuthenticated.roleArn,
        },
      }
    );
  }
}
