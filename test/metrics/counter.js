// @flow

import test from 'ava';
import invariant from 'invariant';
import createIapetus from '../../src/factories/createIapetus';

test('increment() increments metric', async (t) => {
  const iapetus = createIapetus();

  let metric;

  metric = iapetus
    .getMetrics()
    .find((maybeMetric) => {
      return maybeMetric.name === 'foo';
    });

  t.true(!metric);

  const fooCounter = iapetus.createCounterMetric({
    description: 'foo',
    name: 'foo'
  });

  metric = iapetus
    .getMetrics()
    .find((maybeMetric) => {
      return maybeMetric.name === 'foo';
    });

  invariant(metric, 'matric not found');

  t.true(metric.name === 'foo');
  t.true(metric.values.length === 1);
  t.true(metric.values[0].value === 0);

  fooCounter.increment();

  metric = iapetus
    .getMetrics()
    .find((maybeMetric) => {
      return maybeMetric.name === 'foo';
    });

  invariant(metric, 'matric not found');

  t.true(metric.name === 'foo');
  t.true(metric.values.length === 1);
  t.true(metric.values[0].value === 1);

  await iapetus.stop();
});
