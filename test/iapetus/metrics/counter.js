// @flow

import test from 'ava';
import getPort from 'get-port';
import {
  assertCounterMetricValue,
} from '../../helpers';
import createIapetus from '../../../src/factories/createIapetus';

test('increment() increments metric', async (t) => {
  const port = await getPort();

  const iapetus = createIapetus({
    detectKubernetes: false,
    port,
  });

  const fooCounter = iapetus.createCounterMetric({
    description: 'foo',
    name: 'foo',
  });

  assertCounterMetricValue(t, iapetus, 'foo', 0);

  fooCounter.increment();

  assertCounterMetricValue(t, iapetus, 'foo', 1);

  fooCounter.increment({
    value: 1,
  });

  assertCounterMetricValue(t, iapetus, 'foo', 2);

  fooCounter.increment({
    value: 2,
  });

  assertCounterMetricValue(t, iapetus, 'foo', 4);

  await iapetus.stop();
});
