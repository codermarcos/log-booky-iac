#!/usr/bin/env node
import 'source-map-support/register';

import { App, DefaultStackSynthesizer } from 'aws-cdk-lib';

import { LogBookyStack } from '../lib/log-booky-stack';

import cdk from '../cdk.json';

const app = new App();

const stackName = 'LogBooky';

new LogBookyStack(app, stackName, {
  synthesizer: new DefaultStackSynthesizer({
    qualifier: cdk.context['@aws-cdk/core:bootstrapQualifier'],
  }),
  tags: { project: stackName },
  env: {
    frontendHost: process.env.FRONTEND_HOST ?? 'http://localhost:5000',
  },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
