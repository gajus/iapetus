// @flow

/* eslint-disable import/exports-last */

type LabelsType = {
  [key: string]: string,
  ...
};

export type CounterMetricConfigurationType = {|
  +description?: string,
  +labelNames?: $ReadOnlyArray<string>,
  +name: string,
|};

/**
 * @property timestamp Time in milliseconds.
 */
type CounterMetricPayloadType = {|
  +labels?: LabelsType,
  +timestamp?: number,
  +value: number,
|};

export type CounterMetricType = {|
  +increment: (payload?: CounterMetricPayloadType) => void,
|};

export type GaugeMetricConfigurationType = {|
  +description?: string,
  +labelNames?: $ReadOnlyArray<string>,
  +name: string,
|};

/**
 * @property timestamp Time in milliseconds.
 */
type GaugeMetricPayloadType = {|
  +labels?: LabelsType,
  +timestamp?: number,
  +value: number,
|};

export type GaugeMetricType = {|
  +decrement: (payload?: GaugeMetricPayloadType) => void,
  +increment: (payload?: GaugeMetricPayloadType) => void,
  +set: (payload: GaugeMetricPayloadType) => void,
|};

/**
 * @property detectKubernetes Run Iapetus only if service is detected ro be running in Kubernetes. Default: true.
 * @property port The port on which the Iapetus service listens. This port must be different than your main service port, if any. The default port is 9050.
 */
export type IapetusConfigurationType = {|
  +detectKubernetes?: boolean,
  +port?: number,
|};

type MeasurementType = {|
  +value: *,
  +labels: {
    [name: string]: string,
    ...
  },
  +timestamp?: number,
|};

// @todo Add labelNames.
type MetricDescriptorType = {|
  +description: string,
  +name: string,
  +type: 'counter' | 'gauge' | 'histogram' | 'summary',
  +values: $ReadOnlyArray<MeasurementType>,
|};

/**
 * @property stop Stops the Iapetus server.
 */
export type IapetusType = {|
  +createCounterMetric: (configuration: CounterMetricConfigurationType) => CounterMetricType,
  +createGaugeMetric: (configuration: GaugeMetricConfigurationType) => GaugeMetricType,
  +getMetrics: () => $ReadOnlyArray<MetricDescriptorType>,
  +stop: () => Promise<void>,
|};
