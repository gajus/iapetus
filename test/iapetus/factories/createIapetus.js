// @flow

import test from 'ava';
import axios from 'axios';
import getPort from 'get-port';
import createIapetus from '../../../src/factories/createIapetus';

test('creates HTTP server with /metrics endpoint', async (t) => {
  const port = await getPort();

  const iapetus = await createIapetus({
    detectKubernetes: false,
    port
  });

  const response = await axios('http://127.0.0.1:' + port + '/metrics');

  t.true(response.data.includes('nodejs_version_info'));

  await iapetus.stop();
});
