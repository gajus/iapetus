// @flow

/* eslint-disable import/exports-last */

export type CounterMetricConfigurationType = {|
  +description: string,
  +labelNames?: $ReadOnlyArray<string>,
  +name: string
|};

export type CounterMetricType = {|
  +increment: () => void
|};

export type GaugeMetricConfigurationType = {|
  +description: string,
  +labelNames?: $ReadOnlyArray<string>,
  +name: string
|};

export type GaugeMetricType = {|
  +decrement: () => void,
  +increment: () => void,
  +set: (value: number) => void
|};

/**
 * @property port The port on which the Iapetus service listens. This port must be different than your main service port, if any. The default port is 9050.
 */
export type IapetusConfigurationType = {|
  +port?: number
|};

type MeasurementType = {|
  +value: mixed,
  +labels: {
    [name: string]: string
  },
  +timestamp?: number
|};

// @todo Add labelNames.
type MetricDescriptorType = {|
  +description: string,
  +name: string,
  +type: 'counter' | 'gauge' | 'histogram' | 'summary',
  +values: $ReadOnlyArray<MeasurementType>
|};

/**
 * @property stop Stops the Iapetus server.
 */
export type IapetusType = {|
  +createCounterMetric: (configuration: CounterMetricConfigurationType) => CounterMetricType,
  +createGaugeMetric: (configuration: GuageMetricConfigurationType) => GaugeMetricType,
  +getMetrics: () => $ReadOnlyArray<MetricDescriptorType>,
  +stop: () => Promise<void>
|};
