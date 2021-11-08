const assertCounterMetricValue = async (t, iapetus, metricName, value) => {
  const metric = (await iapetus
    .getMetrics())
    .find((maybeMetric) => {
      return maybeMetric.name === metricName;
    });

  t.is(metric.name, 'foo');
  t.is(metric.values.length, 1);
  t.is(metric.values[0].value, value);
};

const assertGaugeMetricValue = async (t, iapetus, metricName, value) => {
  const metric = (await iapetus
    .getMetrics())
    .find((maybeMetric) => {
      return maybeMetric.name === metricName;
    });

  t.is(metric.name, 'foo');
  t.is(metric.values.length, 1);
  t.is(metric.values[0].value, value);
};

export {
  assertCounterMetricValue,
  assertGaugeMetricValue,
};
