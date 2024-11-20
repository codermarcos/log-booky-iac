# 🪽 Log Booky

The **Acompanha Me Backend** provides a structure to save authenticate and save models to create a catalog.

This is a simple serverless application built in [Typescript][ts-doc] and uses [Node.js 20 runtime][node-doc]. It consists of an 
[Amazon Cognito](https://aws.amazon.com/cognito/) to authenticate user that retrive data at [Amazon DynamoDB](https://aws.amazon.com/dynamodb/).

## 🔍 Requirements

This repository uses:

| Dependencies                                 | Description        | Docs             |
| -------------------------------------------- | ------------------ | ---------------- |
| [![node-version]][node-download]             | Javascript Runtime | [📚][node-doc]   |
| [![aws-version]][aws-download]               | AWS CLI            | [📚][aws-doc]    |
| [![sam-version]][sam-download]               | SAM CLI            | [📚][sam-doc]    |

## 🔨 Project setup

1. To **clone repository** you need to have [git][git-download] installed:

```bash
git clone git@github.com:codermarcos/acompanhame-backend.git
```

2. To **install dependencies** you need to have [NodeJS][node-download] installed:

```bash
npm ci
```

### ⬆️ Deployment

1. Declare necessary environments:

To Unix:

```bash
set FRONTEND_HOST="<THE DOMAIN USED IN PRODUCTION>"
set AWS_ACCESS_KEY_ID="<YOUR ACCESS KEY ID AWS>"
set AWS_SECRET_ACCESS_KEY="<YOUR SECRET ACCESS KEY>"
set AWS_REGION="<AWS REGION TO DEPLOY (Recomended: 'sa-east-1' to Production & 'us-east-1' to Development)>"
```

To windows:

```bash
$Env:FRONTEND_HOST="<THE DOMAIN USED IN PRODUCTION>"
$Env:AWS_ACCESS_KEY_ID="<YOUR ACCESS KEY ID AWS>"
$Env:AWS_SECRET_ACCESS_KEY="<YOUR SECRET ACCESS KEY>"
$Env:AWS_DEFAULT_REGION="<AWS REGION TO DEPLOY (Recomended: 'sa-east-1' to Production & 'us-east-2' to Development)>"
```

Basic request example:

```dotenv
FRONTEND_HOST="https://log-booky.codermarcos.zone/"
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
```

2. To **to prepare to deploy** you need to have [AWS CDK Deploy][cdk-doc] installed:

```bash
npm run cdk:bootstrap
```

> This command will be create a basic resources to save your stack [learn more here](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-bootstrap)

3. To **deploy to your AWS account** you need to have [AWS CDK Deploy][cdk-doc] installed:

```bash
npm run cdk:deploy
```

The command `cdk deploy` will first build the TypeScript project using a docker build image esbuild.
Then it will use AWS CloudFormation to deploy the resources to your account.

CDK will create an output of the API Gateway endpoint URL.

## 📂 Software

This project follow this folders organization:

* `./bin` has the instance for the stack
* `./lib` has code to create the infrastructure (ex.: Cognito, Dynamo, maybe an S3 etc...)

### 💪 Dev Team

This project exists thanks to all these people.

[![Marcos](https://avatars3.githubusercontent.com/u/12430365?s=100)](https://github.com/codermarcos)

[node-download]: https://nodejs.org/dist/v16.9.1/
[aws-download]: https://aws.amazon.com/cli/

[git-download]: https://git-scm.com/downloads

[node-version]: https://img.shields.io/badge/node-latest-blue
[aws-version]: https://img.shields.io/badge/aws-2.7.21-blue

[node-doc]: https://nodejs.org/dist/latest-v16.x/docs/api/
[aws-doc]: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html
[ts-doc]: https://www.typescriptlang.org/
[cdk-doc]: https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html



# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
