import test from 'ava';
import getPort from 'get-port';
import {
  createIapetus,
} from '../../../src/factories/createIapetus';
import {
  assertGaugeMetricValue,
} from '../../helpers';

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

  await assertGaugeMetricValue(t, iapetus, 'foo', 0);

  fooGauge.increment();

  await assertGaugeMetricValue(t, iapetus, 'foo', 1);

  fooGauge.increment({
    value: 1,
  });

  await assertGaugeMetricValue(t, iapetus, 'foo', 2);

  fooGauge.increment({
    value: 2,
  });

  await assertGaugeMetricValue(t, iapetus, 'foo', 4);

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

  await assertGaugeMetricValue(t, iapetus, 'foo', 0);

  fooGauge.decrement();

  await assertGaugeMetricValue(t, iapetus, 'foo', -1);

  fooGauge.decrement({
    value: 1,
  });

  await assertGaugeMetricValue(t, iapetus, 'foo', -2);

  fooGauge.decrement({
    value: 2,
  });

  await assertGaugeMetricValue(t, iapetus, 'foo', -4);

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

  await assertGaugeMetricValue(t, iapetus, 'foo', 0);

  fooGauge.set({
    value: 3,
  });

  await assertGaugeMetricValue(t, iapetus, 'foo', 3);

  fooGauge.set({
    value: -3,
  });

  await assertGaugeMetricValue(t, iapetus, 'foo', -3);

  await iapetus.stop();
});
