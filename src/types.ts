export type CounterMetricConfiguration = {
  description?: string,
  labelNames?: readonly string[],
  name: string,
};

/**
 * @property timestamp Time in milliseconds.
 */
type CounterMetricPayload = {
  labels?: Record<string, string>,
  timestamp?: number,
  value: number,
};

export type CounterMetric = {
  increment: (payload?: CounterMetricPayload) => void,
};

export type GaugeMetricConfiguration = {
  description?: string,
  labelNames?: readonly string[],
  name: string,
};

/**
 * @property timestamp Time in milliseconds.
 */
type GaugeMetricPayload = {
  labels?: Record<string, string>,
  timestamp?: number,
  value: number,
};

export type GaugeMetric = {
  decrement: (payload?: GaugeMetricPayload) => void,
  increment: (payload?: GaugeMetricPayload) => void,
  set: (payload: GaugeMetricPayload) => void,
};

/**
 * @property detectKubernetes Run Iapetus only if service is detected ro be running in Kubernetes. Default: true.
 * @property port The port on which the Iapetus service listens. This port must be different than your main service port, if any. The default port is 9050.
 */
export type IapetusConfiguration = {
  detectKubernetes?: boolean,
  port?: number,
};

type Measurement = {
  labels: Record<string, string>,
  timestamp?: number,
  value: unknown,
};

// @todo Add labelNames.
type MetricDescriptor = {
  description: string,
  name: string,
  type: 'counter' | 'gauge' | 'histogram' | 'summary',
  values: readonly Measurement[],
};

/**
 * @property stop Stops the Iapetus server.
 */
export type Iapetus = {
  createCounterMetric: (configuration: CounterMetricConfiguration) => CounterMetric,
  createGaugeMetric: (configuration: GaugeMetricConfiguration) => GaugeMetric,
  getMetrics: () => Promise<readonly MetricDescriptor[]>,
  stop: () => Promise<void>,
};
