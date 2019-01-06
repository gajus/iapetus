// @flow

import express from 'express';
import serializeError from 'serialize-error';
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
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

  const server = app.listen(iapetusConfiguration.port, (error) => {
    if (error) {
      log.error({
        error: serializeError(error)
      }, 'an error has occured while starting the HTTP server');
    } else {
      log.info('Iapetus server is running on port %d', iapetusConfiguration.port);
    }
  });

  app.get('/metrics', (req, res) => {
    log.debug('Iapetus served /metrics to %s', req.ip);

    res.set('content-type', register.contentType);
    res.end(register.metrics());
  });

  return {
    createCounterMetric: (configuration) => {
      const counter = new Counter({
        help: configuration.description || 'N/A',
        labelNames: configuration.labelNames || [],
        name: configuration.name,
        registers: [
          register
        ]
      });

      return {
        increment: (payload) => {
          if (payload) {
            counter.inc(payload.labels || {}, payload.value, payload.timestamp);
          } else {
            counter.inc();
          }
        }
      };
    },
    createGaugeMetric: (configuration) => {
      const gauge = new Gauge({
        help: configuration.description || 'N/A',
        labelNames: configuration.labelNames || [],
        name: configuration.name,
        registers: [
          register
        ]
      });

      return {
        decrement: (payload) => {
          if (payload) {
            gauge.dec(payload.labels || {}, payload.value, payload.timestamp);
          } else {
            gauge.dec();
          }
        },
        increment: (payload) => {
          if (payload) {
            gauge.inc(payload.labels || {}, payload.value, payload.timestamp);
          } else {
            gauge.inc();
          }
        },
        set: (payload) => {
          gauge.set(payload.labels || {}, payload.value, payload.timestamp);
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
      return new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  };
};
