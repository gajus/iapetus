// @flow

import express from 'express';
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Registry
} from 'prom-client';
import gcStats from 'prometheus-gc-stats';
import Logger from '../Logger';
import type {
  CounterMetricConfigurationType,
  IapetusConfigurationType,
  IapetusType
} from '../types';

const log = Logger.child({
  namespace: 'factories/createIapetus'
});

const defaultIapetusConfiguration = {
  port: 9050
};

export default (userIapetusConfiguration?: IapetusConfigurationType): IapetusType => {
  const iapetusConfiguration = {
    ...defaultIapetusConfiguration,
    ...userIapetusConfiguration
  };

  const register = new Registry();

  collectDefaultMetrics({
    register
  });

  gcStats(register)();

  const app = express();

  const server = app.listen(iapetusConfiguration.port, () => {
    log.info('Iapetus server is running on port %d', iapetusConfiguration.port);
  });

  app.get('/metrics', (req, res) => {
    res.set('content-type', register.contentType);
    res.end(register.metrics());
  });

  return {
    createCounterMetric: (configuration) => {
      const counter = new Counter({
        help: configuration.description,
        labelNames: configuration.labelNames,
        name: configuration.name,
        registers: [
          register
        ]
      });

      return {
        increment: () => {
          counter.inc();
        }
      };
    },
    createGaugeMetric: (configuration) => {
      const gauge = new Gauge({
        help: configuration.description,
        labelNames: configuration.labelNames,
        name: configuration.name,
        registers: [
          register
        ]
      });

      return {
        decrement: () => {
          gauge.inc();
        },
        increment: () => {
          gauge.inc();
        },
        set: (value: number) => {
          gauge.set(value);
        }
      };
    },
    getMetrics: () => {
      return register
        .getMetricsAsJSON()
        .map((metric) => {
          return {
            description: metric.help,
            name: metric.name,
            type: metric.type,
            values: metric.values
          };
        });
    },
    stop: async () => {
      server.close();
    }
  };
};
