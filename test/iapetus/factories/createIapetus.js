// @flow

import test from 'ava';
import axios from 'axios';
import getPort from 'get-port';
import createIapetus from '../../../src/factories/createIapetus';

test('creates HTTP server on port 9050 with /metrics endpoint', async (t) => {
  const port = await getPort();
  const iapetus = await createIapetus({
    port
  });

  const response = await axios('http://127.0.0.1:9050/metrics');

  t.true(response.data.includes('nodejs_version_info'));

  await iapetus.stop();
});
