import test from 'ava';
import getPort from 'get-port';
import {
  createIapetus,
} from '../../../src/factories/createIapetus';
import {
  assertCounterMetricValue,
} from '../../helpers';

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

  await assertCounterMetricValue(t, iapetus, 'foo', 0);

  fooCounter.increment();

  await assertCounterMetricValue(t, iapetus, 'foo', 1);

  fooCounter.increment({
    value: 1,
  });

  await assertCounterMetricValue(t, iapetus, 'foo', 2);

  fooCounter.increment({
    value: 2,
  });

  await assertCounterMetricValue(t, iapetus, 'foo', 4);

  await iapetus.stop();
});
