// @flow

import express from 'express';
import {
  collectDefaultMetrics,
  Registry
} from 'prom-client';
import gcStats from 'prometheus-gc-stats';
import Logger from '../Logger';
import type {
  IapetusConfigurationType,
  IapetusType
} from '../types';

const log = Logger.child({
  namespace: 'factories/createIapetus'
});

const defaultConfiguration = {
  port: 9050
};

export default (userConfiguration?: IapetusConfigurationType): IapetusType => {
  const configuration = {
    ...defaultConfiguration,
    ...userConfiguration
  };

  const register = new Registry();

  collectDefaultMetrics({
    register
  });

  gcStats(register)();

  const app = express();

  app.listen(configuration.port, () => {
    log.info('Iapetus server is running on port %d', configuration.port);
  });

  app.get('/metrics', (req, res) => {
    res.set('content-type', register.contentType);
    res.end(register.metrics());
  });

  console.log(register.metrics());

  return {

  };
};
