# Iapetus 🔱

[![Travis build status](http://img.shields.io/travis/gajus/iapetus/master.svg?style=flat-square)](https://travis-ci.org/gajus/iapetus)
[![Coveralls](https://img.shields.io/coveralls/gajus/iapetus.svg?style=flat-square)](https://coveralls.io/github/gajus/iapetus)
[![NPM version](http://img.shields.io/npm/v/iapetus.svg?style=flat-square)](https://www.npmjs.org/package/iapetus)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

[Prometheus](https://prometheus.io/) metrics server.

{"gitdown": "contents"}

## Behaviour

Creates a HTTP service on port 9050 (default) with a [`/metrics`](#metrics) endpoint exposing [default metrics](#default-metrics) and [user-defined metrics](#user-defined-metrics).

### No-op in non-Kubernetes execution context

The default behaviour is that all Iapetus operations become no-op if Iapetus detects that it is running in a non-Kubernetes environment (e.g. your local machine). This behaviour can be changed using `detectKubernetes` configuration.

### User-defined metrics

There are 4 types of metrics to choose from: counter, gauge, summary and histogram. See the Prometheus documentation on [metric types](https://prometheus.io/docs/concepts/metric_types/) and [best practices](https://prometheus.io/docs/practices/instrumentation/#counter-vs.-gauge,-summary-vs.-histogram) for when to use which.

#### Counter

A counter is a cumulative metric that represents a single monotonically increasing counter whose value can only increase or be reset to zero on restart. For example, you can use a counter to represent the number of requests served, tasks completed, or errors.

Do not use a counter to expose a value that can decrease. For example, do not use a counter for the number of currently running processes; instead use a gauge.

```js
export type CounterMetricConfigurationType = {|
  +description: string,
  +labelNames?: $ReadOnlyArray<string>,
  +name: string
|};

/**
 * @property timestamp Time in milliseconds.
 */
type CounterMetricPayloadType = {|
  +labels?: LabelsType,
  +timestamp?: number,
  +value: number
|};

export type CounterMetricType = {|
  +increment: (payload?: CounterMetricPayloadType) => void
|};

```

#### Gauge

A gauge is a metric that represents a single numerical value that can arbitrarily go up and down.

Gauges are typically used for measured values like temperatures or current memory usage, but also "counts" that can go up and down, like the number of running active HTTP requests.

```js
export type GaugeMetricConfigurationType = {|
  +description: string,
  +labelNames?: $ReadOnlyArray<string>,
  +name: string
|};

/**
 * @property timestamp Time in milliseconds.
 */
type GaugeMetricPayloadType = {|
  +labels?: LabelsType,
  +timestamp?: number,
  +value: number
|};

export type GaugeMetricType = {|
  +decrement: (payload?: GaugeMetricPayloadType) => void,
  +increment: (payload?: GaugeMetricPayloadType) => void,
  +set: (payload: GaugeMetricPayloadType) => void
|};

```

#### Summary

N/A

#### Histogram

N/A

### Default metrics

The following metrics are collected and reported by default:

|Name|Labels|Description|
|---|---|---|
|`process_cpu_user_seconds_total`||Total user CPU time spent in seconds.|
|`process_cpu_system_seconds_total`||Total system CPU time spent in seconds.|
|`process_cpu_seconds_total`||Total user and system CPU time spent in seconds.|
|`process_start_time_seconds`||Start time of the process since unix epoch in seconds.|
|`process_resident_memory_bytes`||Resident memory size in bytes.|
|`nodejs_eventloop_lag_seconds`||Lag of event loop in seconds.|
|`nodejs_active_handles_total`||Number of active handles.|
|`nodejs_active_requests_total`||Number of active requests.|
|`nodejs_heap_size_total_bytes`||Process heap size from node.js in bytes.|
|`nodejs_heap_size_used_bytes`||Process heap size used from node.js in bytes.|
|`nodejs_external_memory_bytes`||Nodejs external memory size in bytes.|
|`nodejs_heap_space_size_total_bytes`|`space`|Process heap space size total from node.js in bytes.|
|`nodejs_heap_space_size_used_bytes`|`space`|Process heap space size used from node.js in bytes.|
|`nodejs_heap_space_size_available_bytes`|`space`|Process heap space size available from node.js in bytes.|
|`nodejs_version_info`|`version`, `major`, `minor`, `patch`|Node.js version info.|
|`nodejs_gc_runs_total`|`gctype`|Count of total garbage collections.|
|`nodejs_gc_pause_seconds_total`|`gctype`|Time spent in GC Pause in seconds.|
|`nodejs_gc_reclaimed_bytes_total`|`gctype`|Total number of bytes reclaimed by GC.|

<!--
  const metrics = register.getMetricsAsArray();

  for (const metric of metrics) {
    console.log('|`' + metric.name + '`|' + (metric.labelNames.length ? '`' + metric.labelNames.join('`, `') + '`' : '') + '|' + metric.help + '|');
  }
-->

### `/metrics`

`/metrics` endpoint produces metrics for Prometheus consumption.

## Usage

Use `createIapetus` to create an instance of Iapetus.

```js
import {
  createIapetus
} from 'iapetus';

const configuration: IapetusConfigurationType = {};

const iapetus: IapetusType = createIapetus(configuration);

```

The following types describe the configuration shape and the resulting Iapetus instance interface.

```js
/**
 * @property detectKubernetes Run Iapetus only if service is detected ro be running in Kubernetes. Default: true.
 * @property port The port on which the Iapetus service listens. This port must be different than your main service port, if any. The default port is 9050.
 */
type IapetusConfigurationType = {|
  +detectKubernetes?: boolean,
  +port?: number
|};

/**
 * @property stop Stops the Iapetus server.
 */
type IapetusType = {|
  +createCounterMetric: (configuration: CounterMetricConfigurationType) => CounterMetricType,
  +createGaugeMetric: (configuration: GuageMetricConfigurationType) => GaugeMetricType,
  +getMetrics: () => $ReadOnlyArray<MetricDescriptorType>,
  +stop: () => Promise<void>
|};

```

### Example

```js
const iapetus = createIapetus();

const iapetusMetrics = {
  activeRequestCount: iapetus.createGaugeMetric({
    description: 'Active request count',
    labelNames: [],
    name: 'activeRequestCount'
  })
};

// Increase `activeRequestCount` value by 1.
iapetusMetrics.activeRequestCount.increment();

```

### Kubernetes configuration

> This section assumes that you have installed Prometheus using Helm [Prometheus chart](https://github.com/helm/charts/tree/master/stable/prometheus).

Add the following annotations to your [Pod](https://kubernetes.io/docs/concepts/workloads/pods/pod-overview/):

```yaml
annotations:
  prometheus.io.scrape: 'true'
  prometheus.io.port: '9050'
  prometheus.io.path: '/metrics'

```

### Logging

`iapetus` is using [Roarr](https://github.com/gajus/roarr) to implement logging.

Set `ROARR_LOG=true` environment variable to enable logging.

## FAQ

### Where does the name _Iapetus_ come from?

In Greek mythology, [Iapetus](https://en.wikipedia.org/wiki/Iapetus) (/aɪˈæpɪtəs/), was a Titan, the son of Uranus and Gaia, and father of Atlas, Prometheus, Epimetheus and Menoetius.

### What is the difference from `prom-client`?

Iapetus is a high-level abstraction of [`prom-client`](https://github.com/siimon/prom-client) with integrated HTTP server and pre-configured [default metrics](#default-metrics).

## Related projects

* [Lightship](https://github.com/gajus/lightship) – Abstracts readiness/ liveness checks and graceful shutdown of Node.js services running in Kubernetes.
* [Preoom](https://github.com/gajus/preoom) – Retrieves & observes Kubernetes Pod resource (CPU, memory) utilisation.
