// @flow

/**
 * @property port The port on which the Iapetus service listens. This port must be different than your main service port, if any. The default port is 9050.
 */
export type IapetusConfigurationType = {|
  +port?: number
|};

/**
 * @property stop Stops the Iapetus server.
 */
export type IapetusType = {|
  +stop: () => Promise<void>
|};
