import express from 'express';
import {
  createHttpTerminator,
} from 'http-terminator';
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Registry,
} from 'prom-client';
import gcStats from 'prometheus-gc-stats';
import {
  serializeError,
} from 'serialize-error';
import Logger from '../Logger';
import type {
  IapetusConfiguration,
  Iapetus,
} from '../types';
import {
  isKubernetes,
} from '../utilities';

const log = Logger.child({
  namespace: 'factories/createIapetus',
});

const defaultIapetusConfiguration = {
  detectKubernetes: true,
  port: 9_050,
};

export const createIapetus = (userIapetusConfiguration?: IapetusConfiguration): Iapetus => {
  const iapetusConfiguration = {
    ...defaultIapetusConfiguration,
    ...userIapetusConfiguration,
  };

  if (iapetusConfiguration.detectKubernetes === true && isKubernetes() === false) {
    log.warn('Iapetus could not detect Kubernetes; operating in a no-op mode');

    return {
      createCounterMetric: () => {
        return {
          increment: () => {
            // Do nothing.
          },
        };
      },
      createGaugeMetric: () => {
        return {
          decrement: () => {
            // Do nothing.
          },
          increment: () => {
            // Do nothing.
          },
          set: () => {
            // Do nothing.
          },
        };
      },
      getMetrics: async () => {
        return [];
      },
      stop: async () => {
        // Do nothing.
      },
    };
  }

  const register = new Registry();

  collectDefaultMetrics({
    register,
  });

  gcStats(register)();

  const app = express();

  const server = app.listen(iapetusConfiguration.port, () => {
    log.info('Iapetus server is running on port %d', iapetusConfiguration.port);
  });

  server.on('error', (error) => {
    log.error({
      error: serializeError(error),
    }, 'an error has occurred while starting the HTTP server');
  });

  const httpTerminator = createHttpTerminator({
    server,
  });

  app.get('/metrics', (request, response, next) => {
    log.debug('Iapetus served /metrics to %s', request.ip);

    response.set('content-type', register.contentType);

    register.metrics()
      .then((metrics) => {
        response.end(metrics);
      })
      .catch((error) => {
        next(error);
      });
  });

  return {
    createCounterMetric: (configuration) => {
      const counter = new Counter({
        help: configuration.description ?? 'N/A',
        labelNames: configuration.labelNames ?? [],
        name: configuration.name,
        registers: [
          register,
        ],
      });

      return {
        increment: (payload) => {
          if (payload) {
            counter.inc(
              payload.labels ?? {},
              payload.value,
            );
          } else {
            counter.inc();
          }
        },
      };
    },
    createGaugeMetric: (configuration) => {
      const gauge = new Gauge({
        help: configuration.description ?? 'N/A',
        labelNames: configuration.labelNames ?? [],
        name: configuration.name,
        registers: [
          register,
        ],
      });

      return {
        decrement: (payload) => {
          if (payload) {
            gauge.dec(
              payload.labels ?? {},
              payload.value,
            );
          } else {
            gauge.dec();
          }
        },
        increment: (payload) => {
          if (payload) {
            gauge.inc(
              payload.labels ?? {},
              payload.value,
            );
          } else {
            gauge.inc();
          }
        },
        set: (payload) => {
          gauge.set(
            payload.labels ?? {},
            payload.value,
          );
        },
      };
    },

    // @ts-expect-error Type mismatch
    getMetrics: async () => {
      const metrics = await register.getMetricsAsJSON();

      return metrics
        .map((metric) => {
          return {
            description: metric.help,
            name: metric.name,
            type: metric.type,

            // @ts-expect-error Type mismatch
            values: metric.values,
          };
        });
    },
    stop: async () => {
      await httpTerminator.terminate();
    },
  };
};
