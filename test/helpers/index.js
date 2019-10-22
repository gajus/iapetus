// @flow

import invariant from 'invariant';

// $FlowFixMe
const assertCounterMetricValue = (t, iapetus, matricName, value) => {
  const metric = iapetus
    .getMetrics()
    .find((maybeMetric) => {
      return maybeMetric.name === matricName;
    });

  invariant(metric, 'metric not found');

  t.true(metric.name === 'foo');
  t.true(metric.values.length === 1);
  t.true(metric.values[0].value === value);
};

// $FlowFixMe
const assertGuageMetricValue = (t, iapetus, matricName, value) => {
  const metric = iapetus
    .getMetrics()
    .find((maybeMetric) => {
      return maybeMetric.name === matricName;
    });

  invariant(metric, 'metric not found');

  t.true(metric.name === 'foo');
  t.true(metric.values.length === 1);
  t.true(metric.values[0].value === value);
};

export {
  assertCounterMetricValue,
  assertGuageMetricValue,
};
