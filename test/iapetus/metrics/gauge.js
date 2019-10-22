// @flow

import test from 'ava';
import getPort from 'get-port';
import {
  assertGuageMetricValue,
} from '../../helpers';
import createIapetus from '../../../src/factories/createIapetus';

test('increment() increments metric value', async (t) => {
  const port = await getPort();

  const iapetus = createIapetus({
    detectKubernetes: false,
    port,
  });

  const fooGauge = iapetus.createGaugeMetric({
    description: 'foo',
    name: 'foo',
  });

  assertGuageMetricValue(t, iapetus, 'foo', 0);

  fooGauge.increment();

  assertGuageMetricValue(t, iapetus, 'foo', 1);

  fooGauge.increment({
    value: 1,
  });

  assertGuageMetricValue(t, iapetus, 'foo', 2);

  fooGauge.increment({
    value: 2,
  });

  assertGuageMetricValue(t, iapetus, 'foo', 4);

  await iapetus.stop();
});

test('decrement() decrements metric value', async (t) => {
  const port = await getPort();

  const iapetus = createIapetus({
    detectKubernetes: false,
    port,
  });

  const fooGauge = iapetus.createGaugeMetric({
    description: 'foo',
    name: 'foo',
  });

  assertGuageMetricValue(t, iapetus, 'foo', 0);

  fooGauge.decrement();

  assertGuageMetricValue(t, iapetus, 'foo', -1);

  fooGauge.decrement({
    value: 1,
  });

  assertGuageMetricValue(t, iapetus, 'foo', -2);

  fooGauge.decrement({
    value: 2,
  });

  assertGuageMetricValue(t, iapetus, 'foo', -4);

  await iapetus.stop();
});

test('set() sets a specific metric value', async (t) => {
  const port = await getPort();

  const iapetus = createIapetus({
    detectKubernetes: false,
    port,
  });

  const fooGauge = iapetus.createGaugeMetric({
    description: 'foo',
    name: 'foo',
  });

  assertGuageMetricValue(t, iapetus, 'foo', 0);

  fooGauge.set({
    value: 3,
  });

  assertGuageMetricValue(t, iapetus, 'foo', 3);

  fooGauge.set({
    value: -3,
  });

  assertGuageMetricValue(t, iapetus, 'foo', -3);

  await iapetus.stop();
});
